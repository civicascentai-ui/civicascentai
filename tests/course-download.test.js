import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Readable, Writable} from 'node:stream';
import handler from '../api/course-download.js';

class Response extends Writable {
  constructor() {super();this.code=200;this.headers={};this.body=null;this.chunks=[];}
  _write(chunk,_encoding,cb){this.chunks.push(Buffer.from(chunk));cb();}
  setHeader(k,v){this.headers[k]=v;return this;}
  status(code){this.code=code;return this;}
  json(value){this.body=value;this.end();return this;}
}
const config={
  COURSE_DOWNLOAD_ENABLED:'true',STRIPE_MODE:'test',
  SUPABASE_URL:'https://qa.example.invalid',SUPABASE_PUBLISHABLE_KEY:'qa_public',
  SUPABASE_SERVICE_ROLE_KEY:'qa_secret',COURSE_PRIVATE_BUCKET:'course-kits',
  COURSE_STARTER_OBJECT:'starter/course.zip',COURSE_FACILITATOR_OBJECT:'facilitator/course.zip'
};
const buyer={id:'qa_user',email:'BUYER@example.org',email_confirmed_at:'2026-10-09T00:00:00Z'};
function ok(data) {return {ok:true,async json(){return data;}};}
function blob(bytes='course-zip') {
  const buf=Buffer.from(bytes);
  return {ok:true,headers:{get(n){return n==='content-length'?String(buf.length):null;}},body:Readable.toWeb(Readable.from([buf]))};
}
function mockNetwork(overrides={}) {
  const calls=[];
  const api=async (url, opts) => {
    const path=new URL(url).pathname; calls.push({path,opts});
    if(path==='/auth/v1/user')return ok(overrides.user??buyer);
    if(path==='/rest/v1/rpc/lookup_download_entitlement')return ok(overrides.sessions??[{session_id:'cs_qa'}]);
    if(path==='/storage/v1/bucket/course-kits')return ok(overrides.bucket??{public:false});
    if(path==='/storage/v1/object/authenticated/course-kits/starter/course.zip')return overrides.file??blob();
    if(path==='/rest/v1/rpc/record_download_issued')return ok(
      Object.hasOwn(overrides,'attempt')?overrides.attempt:42);
    if(path==='/rest/v1/rpc/complete_course_download_attempt')return ok(
      Object.hasOwn(overrides,'complete')?overrides.complete:true);
    throw Error('Unexpected endpoint '+path);
  };
  return {api,calls};
}
async function execute(overrides={},configOverrides={},reqOverrides={}) {
  const previous=Object.fromEntries(Object.keys(config).map(k=>[k,process.env[k]]));
  const original=globalThis.fetch, net=mockNetwork(overrides);
  try{
    for(const [k,v] of Object.entries({...config,...configOverrides})) {
      if(v===null)delete process.env[k];else process.env[k]=v;
    }
    globalThis.fetch=net.api;
    const req={method:'GET',query:{product:'starter'},headers:{authorization:'Bearer qa_token'},...reqOverrides};
    const res=new Response();
    await handler(req,res);
    return {res,calls:net.calls};
  } finally {
    globalThis.fetch=original;
    for(const [k,v] of Object.entries(previous)) {
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
}
test('disabled staging flag never touches backend',async()=>{
 const v=await execute({}, {COURSE_DOWNLOAD_ENABLED:'false'});
 assert.equal(v.res.code,503);assert.equal(v.calls.length,0);
});
test('live mode is rejected',async()=>{
 const v=await execute({}, {STRIPE_MODE:'live'});
 assert.equal(v.res.code,503);assert.equal(v.calls.length,0);
});
test('missing authenticated token is rejected',async()=>{
 const v=await execute({}, {}, {headers:{}});
 assert.equal(v.res.code,401);assert.equal(v.calls.length,0);
});
test('unconfirmed buyer cannot query private purchases',async()=>{
 const v=await execute({user:{...buyer,email_confirmed_at:null}});
 assert.equal(v.res.code,403);assert.equal(v.calls.length,1);
});
test('wrong-buyer or missing SKU denies download',async()=>{
 const v=await execute({sessions:[]});
 assert.equal(v.res.code,403);assert.equal(v.calls.length,2);
});
test('public bucket cannot serve course',async()=>{
 const v=await execute({bucket:{public:true}});
 assert.equal(v.res.code,503);assert.equal(v.calls.length,3);
});
test('file not found or missing length is rejected before authorization',async()=>{
 const v=await execute({file:{ok:false,headers:{get(){return null;}},body:null}});
 assert.equal(v.res.code,503);assert.equal(v.calls.length,4);
});
test('refund race at final receipt gate blocks all file bytes',async()=>{
 const v=await execute({attempt:null});
 assert.equal(v.res.code,403);assert.equal(v.res.chunks.length,0);
 assert.equal(v.calls.length,5);
});
test('valid buyer streams only selected private file and logs completion',async()=>{
 const v=await execute();
 assert.equal(v.res.code,200);
 assert.equal(Buffer.concat(v.res.chunks).toString(),'course-zip');
 assert.equal(v.res.headers['Content-Type'],'application/octet-stream');
 assert.match(v.res.headers['Content-Disposition'],/starter-kit.zip/);
 assert.match(v.res.headers['Cache-Control'],/no-store/);
 assert.equal(v.calls.length,6);
 assert.deepEqual(JSON.parse(v.calls[1].opts.body),
   {p_verified_email:'buyer@example.org',p_product_code:'starter'});
 assert.deepEqual(JSON.parse(v.calls[5].opts.body),
   {p_session_id:'cs_qa',p_attempt_id:42,p_outcome:'sent'});
 assert.equal(v.calls.some(c=>c.path.includes('/object/sign/')),false);
 assert.equal(v.res.body,null);
});
test('interrupted file stream is recorded as failed, never sent',async()=>{
 const broken=new Readable({read() {
   this.push(Buffer.from('some'));
   this.destroy(new Error('connection reset during file transfer'));
 }});
 const file={ok:true,headers:{get(n){return n==='content-length'?'10':null;}},body:Readable.toWeb(broken)};
 const v=await execute({file});
 assert.equal(v.calls.length,6);
 const receipt=JSON.parse(v.calls[5].opts.body);
 assert.equal(receipt.p_outcome,'failed');
 assert.ok(!v.res.headers['Location']);
});
test('oversized archive is refused without attempt reservation',async()=>{
 const file={ok:true,headers:{get(n){return n==='content-length'?String(30*1024*1024):null;}},
   body:Readable.toWeb(Readable.from([Buffer.from('tiny')]))};
 const v=await execute({file});
 assert.equal(v.res.code,503);
 assert.equal(v.calls.length,4);
});
test('SQL tracks pending receipt and marks sent only after completion',()=>{
 const sql=readFileSync(new URL('../qa/sql/secure-delivery-refund.staging-only.sql',import.meta.url),'utf8');
 assert.match(sql,/record_download_issued/);
 assert.match(sql,/complete_course_download_attempt/);
 assert.match(sql,/FOR UPDATE/);
 assert.match(sql,/INSERT INTO checkout_private\.delivery_attempts\(session_id,outcome\)/);
 assert.match(sql,/VALUES\(v_session,'pending'\)/);
 assert.match(sql,/access_state='active'/);
 assert.doesNotMatch(sql,/SECURITY DEFINER/);
});
