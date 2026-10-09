import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {readFileSync} from 'node:fs';
import webhook from '../api/stripe-webhook.js';

const keys=['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_MODE',
 'CHECKOUT_RECORDING_ENABLED','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];
const env={STRIPE_SECRET_KEY:'sk_test_placeholder',STRIPE_WEBHOOK_SECRET:'whsec_qa_test_only',
 STRIPE_MODE:'test',CHECKOUT_RECORDING_ENABLED:'true',
 SUPABASE_URL:'https://qa.example.invalid',SUPABASE_SERVICE_ROLE_KEY:'qa_private'};
function response(){return {code:200,body:null,status(n){this.code=n;return this;},
 json(v){this.body=v;return this;},setHeader(){return this;},end(){return this;}};}
function request(sign=true){
 const payload=JSON.stringify({id:'evt_qa_reversal1',type:'charge.refunded',
 data:{object:{id:'ch_qa1'}}});
 const signature=sign?Stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET}):'invalid';
 return {method:'POST',headers:{'stripe-signature':signature},
 async *[Symbol.asyncIterator](){yield Buffer.from(payload);}};
}
async function withEnv(changes,callback){
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  for(const [k,v] of Object.entries({...env,...changes})){
   if(v===null)delete process.env[k];else process.env[k]=v;
  }
  await callback();
 }finally{
  for(const [k,v] of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
 }
}
test('unsigned refund event is rejected',async()=>withEnv({},async()=>{
 const res=response();await webhook(request(false),res);assert.equal(res.code,400);
}));
test('signed refund cannot process in live mode on QA branch',async()=>withEnv({STRIPE_MODE:'live'},async()=>{
 const res=response();await webhook(request(),res);assert.equal(res.code,503);
}));
test('signed refund cannot process while checkout recording is off',async()=>withEnv({CHECKOUT_RECORDING_ENABLED:'false'},async()=>{
 const res=response();await webhook(request(),res);assert.equal(res.code,503);
}));
test('signed refund cannot process without private service role',async()=>withEnv({SUPABASE_SERVICE_ROLE_KEY:null},async()=>{
 const res=response();await webhook(request(),res);assert.equal(res.code,503);
}));
test('source re-verifies charge with Stripe and journals reversal RPC',()=>{
 const source=readFileSync(new URL('../api/stripe-webhook.js',import.meta.url),'utf8');
 assert.match(source,/stripe\.charges\.retrieve\(chargeId\)/);
 assert.match(source,/record_verified_payment_reversal/);
 assert.match(source,/record_verified_checkout_v2/);
 assert.match(source,/charge\.amount_refunded > charge\.amount/);
});
