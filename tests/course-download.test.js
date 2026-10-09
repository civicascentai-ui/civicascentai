import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../api/course-download.js';

function response() {
 return {code:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;return this;},status(c){this.code=c;return this;},json(v){this.body=v;return this;}};
}
const keys={COURSE_DOWNLOAD_ENABLED:'true',STRIPE_MODE:'test',SUPABASE_URL:'https://qa.example.invalid',
 SUPABASE_PUBLISHABLE_KEY:'qa_public',SUPABASE_SERVICE_ROLE_KEY:'qa_private',
 COURSE_PRIVATE_BUCKET:'course-kits',COURSE_STARTER_OBJECT:'starter/course.zip',COURSE_FACILITATOR_OBJECT:'facilitator/course.zip'};
async function run({values={},returns=[]}={}) {
 const save=Object.fromEntries(Object.keys(keys).map(k=>[k,process.env[k]]));
 const original=globalThis.fetch;const calls=[];
 try {
  for(const [k,v]of Object.entries({...keys,...values})){if(v===null)delete process.env[k];else process.env[k]=v;}
  globalThis.fetch=async(url,opts)=>{
   calls.push({url:String(url),opts});let out=returns[calls.length-1];
   if(out instanceof Error) throw out;
   return {ok:out?.ok!==false,async json(){return out?.data;}};
  };
  const res=response();
  await handler({method:'GET',query:{product:'starter'},headers:{authorization:'Bearer test-user'}},res);
  return {res,calls};
 }finally{
  globalThis.fetch=original;
  for(const [k,v]of Object.entries(save)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
 }
}
const identity={id:'qa-user',email:'buyer@example.org',email_confirmed_at:'2026-10-09'};
const success=[
 {data:identity},
 {data:[{session_id:'cs_test_example'}]},
 {data:{public:false}},
 {data:{signedURL:'/object/sign/course-kits/starter/course.zip?token=qa-test-token'}},
 {data:true}
];
test('feature flag off refuses access',async()=>{const x=await run({values:{COURSE_DOWNLOAD_ENABLED:'false'}});assert.equal(x.res.code,503);assert.equal(x.calls.length,0);});
test('live mode refuses access',async()=>{const x=await run({values:{STRIPE_MODE:'live'}});assert.equal(x.res.code,503);assert.equal(x.calls.length,0);});
test('unverified learner cannot look up purchase',async()=>{const x=await run({returns:[{data:{...identity,email_confirmed_at:null}}]});assert.equal(x.res.code,403);assert.equal(x.calls.length,1);});
test('unowned course denies download',async()=>{const x=await run({returns:[{data:identity},{data:[]}]});assert.equal(x.res.code,403);assert.equal(x.calls.length,2);});
test('public storage bucket is never signed',async()=>{const x=await run({returns:[...success.slice(0,2),{data:{public:true}}]});assert.equal(x.res.code,503);assert.equal(x.calls.length,3);});
test('untrusted download path fails closed',async()=>{const z=[...success];z[3]={data:{signedURL:'/object/sign/course-kits/wrong.zip?token=x'}};const x=await run({returns:z});assert.equal(x.res.code,503);});
test('revoked access during signing denies result',async()=>{const z=[...success];z[4]={data:false};const x=await run({returns:z});assert.equal(x.res.code,403);assert.ok(!JSON.stringify(x.res.body).includes('token='));});
test('authorized kit gives 30-second private signed URL and logs issued receipt',async()=>{const x=await run({returns:success});assert.equal(x.res.code,200);assert.equal(x.res.body.expires_in_seconds,30);assert.equal(x.calls.length,5);assert.equal(x.res.headers['Cache-Control'],'no-store');assert.match(x.res.body.download_url,/\/storage\/v1\/object\/sign\/course-kits\/starter\/course\.zip/);});
test('migration holds purchases and disables access after reversals',()=>{
 const s=readFileSync(new URL('../qa/sql/secure-delivery-refund.staging-only.sql',import.meta.url),'utf8');
 assert.match(s,/record_verified_payment_reversal/);assert.match(s,/refund_holds/);
 assert.match(s,/SECURITY INVOKER/);assert.match(s,/FOR UPDATE/);assert.doesNotMatch(s,/SECURITY DEFINER/);
});
