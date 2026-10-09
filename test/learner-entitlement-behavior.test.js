import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/learner-entitlements.js';

const saved={};
const envKeys=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY','COURSE_DOWNLOAD_ENABLED','STRIPE_MODE'];
function response(){return {statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k.toLowerCase()]=v;return this},status(n){this.statusCode=n;return this},json(v){this.body=v;return this}}}
async function withFixture({user,rows,authStatus=200,ledgerStatus=200,env={}},fn){
 const priorFetch=globalThis.fetch;
 for(const key of envKeys)saved[key]=process.env[key];
 Object.assign(process.env,{SUPABASE_URL:'https://qa.example.test',SUPABASE_PUBLISHABLE_KEY:'test-public',SUPABASE_SERVICE_ROLE_KEY:'test-service',STRIPE_MODE:'test',COURSE_DOWNLOAD_ENABLED:'false',...env});
 const calls=[];
 globalThis.fetch=async (url,opts)=>{calls.push({url:String(url),opts});if(String(url).includes('/auth/v1/user'))return {ok:authStatus===200,status:authStatus,json:async()=>user};return {ok:ledgerStatus===200,status:ledgerStatus,json:async()=>rows}};
 try{await fn(calls)}finally{globalThis.fetch=priorFetch;for(const key of envKeys){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}}
}
const verified={id:'learner-1',email:'Learner@Example.org',email_confirmed_at:'2026-10-09T00:00:00Z'};
const req={method:'GET',headers:{authorization:'Bearer qa_token'}};
test('verified user sees only allowlisted products and statuses, never session IDs',async()=>{
 await withFixture({user:verified,rows:[null,{product_code:'starter',delivery_status:'sent',session_id:'secret-session'},{product_code:'unexpected',delivery_status:'sent'},{product_code:'facilitator',delivery_status:'refunded'}]},async calls=>{
 const res=response();await handler(req,res);assert.equal(res.statusCode,200);assert.deepEqual(res.body.entitlements,[{product:'starter',delivery_status:'sent'}]);assert.equal(JSON.stringify(res.body).includes('secret-session'),false);assert.equal(res.body.course_access_enabled,false);assert.equal(res.headers['cache-control'],'no-store, private, max-age=0');assert.equal(calls.length,2);assert.equal(JSON.parse(calls[1].opts.body).p_verified_email,'learner@example.org');
 });
});
test('unverified email cannot query purchase ledger',async()=>{
 await withFixture({user:{...verified,email_confirmed_at:null},rows:[]},async calls=>{const res=response();await handler(req,res);assert.equal(res.statusCode,403);assert.equal(calls.length,1)});
});
test('invalid bearer is rejected before backend calls',async()=>{
 await withFixture({user:verified,rows:[]},async calls=>{const res=response();await handler({method:'GET',headers:{authorization:'Bearer bad token'}},res);assert.equal(res.statusCode,401);assert.equal(calls.length,0)});
});
test('ledger failure fails closed',async()=>{
 await withFixture({user:verified,rows:[],ledgerStatus:500},async()=>{const res=response();await handler(req,res);assert.equal(res.statusCode,503)});
});
test('download enabled indicator requires explicit TEST mode and enabled flag',async()=>{
 await withFixture({user:verified,rows:[],env:{COURSE_DOWNLOAD_ENABLED:'true',STRIPE_MODE:'live'}},async()=>{const res=response();await handler(req,res);assert.equal(res.body.course_access_enabled,false)});
});
