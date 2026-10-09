import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {handleWebhook} from '../api/stripe-webhook.js';

const sandbox={
  STRIPE_SECRET_KEY:'sk_test_qa_placeholder',
  STRIPE_WEBHOOK_SECRET:'whsec_qa_signature',
  STRIPE_MODE:'test',
  CHECKOUT_RECORDING_ENABLED:'true',
  SUPABASE_URL:'https://qa.example.invalid',
  SUPABASE_SERVICE_ROLE_KEY:'service_test_placeholder',
  STRIPE_STARTER_PAYMENT_LINK_ID:'plink_qa_starter',
  STRIPE_FACILITATOR_PAYMENT_LINK_ID:'plink_qa_facilitator'
};
function response(){
 return {code:200,body:null,status(n){this.code=n;return this;},
 setHeader(){return this;},json(x){this.body=x;return this;},end(){return this;}};
}
const verified={
 id:'cs_test_qa',payment_status:'paid',status:'complete',amount_total:4900,
 currency:'usd',payment_link:'plink_qa_starter',livemode:false,
 customer_details:{email:'qa-learner@example.invalid'},
 customer:'cus_test_qa',payment_intent:'pi_qa1234'
};
const stripeSDK=new Stripe('sk_test_qa_placeholder');
function request(type='checkout.session.completed',data={id:'cs_test_qa',payment_status:'paid',amount_total:4900}) {
 const event={id:'evt_qa1234',type,data:{object:data}};
 const payload=JSON.stringify(event);
 const signature=Stripe.webhooks.generateTestHeaderString({
   payload,secret:sandbox.STRIPE_WEBHOOK_SECRET
 });
 return {method:'POST',headers:{'stripe-signature':signature},
   async *[Symbol.asyncIterator](){yield Buffer.from(payload);}};
}
async function exercise(eventType='checkout.session.completed',data,opts={}) {
 const original=Object.fromEntries(Object.keys(sandbox).map(k=>[k,process.env[k]]));
 const requests=[];
 const fakeStripe={
   webhooks:stripeSDK.webhooks,
   checkout:{sessions:{retrieve:async id=>{if(id!=='cs_test_qa')throw Error('wrong session');return opts.session??verified;}}},
   charges:{retrieve:async id=>{
     if(id!=='ch_qa1234')throw Error('wrong charge');
     return opts.charge??{
       id:'ch_qa1234',livemode:false,currency:'usd',amount:4900,
       amount_refunded:4900,payment_intent:'pi_qa1234'
     };
   }}
 };
 const fetchImpl=async(url,init)=>{
   requests.push({path:new URL(url).pathname,init});
   return {ok:opts.ledgerOk!==false};
 };
 try{
   for (const [k,v] of Object.entries({...sandbox,...opts.env})) {
     if(v===null)delete process.env[k];else process.env[k]=v;
   }
   const res=response();
   await handleWebhook(request(eventType,data),res,{stripeClient:fakeStripe,fetchImpl});
   return {res,requests};
 } finally {
   for(const [k,v]of Object.entries(original)){
     if(v===undefined)delete process.env[k];else process.env[k]=v;
   }
 }
}
test('signed paid Starter session reconciles exactly one linked event to v2 ledger',async()=>{
 const {res,requests}=await exercise();
 assert.equal(res.code,200);
 assert.deepEqual(res.body,{received:true,recorded:true,delivery:'pending'});
 assert.equal(requests.length,1);
 assert.equal(requests[0].path,'/rest/v1/rpc/record_verified_checkout_v2');
 assert.deepEqual(JSON.parse(requests[0].init.body),{
   p_event_id:'evt_qa1234',p_session_id:'cs_test_qa',
   p_event_type:'checkout.session.completed',p_customer_id:'cus_test_qa',
   p_email:'qa-learner@example.invalid',p_product_code:'starter',
   p_amount:4900,p_currency:'usd',p_payment_intent_id:'pi_qa1234'
 });
 assert.equal(requests[0].init.headers.Authorization,'Bearer service_test_placeholder');
});
test('altered Stripe-verified price is ignored without any grant',async()=>{
 const {res,requests}=await exercise('checkout.session.completed',undefined,{
  session:{...verified,amount_total:3900}
 });
 assert.equal(res.code,200);assert.equal(res.body.recorded,false);assert.equal(requests.length,0);
});
test('wrong payment link is ignored without ledger call',async()=>{
 const {res,requests}=await exercise('checkout.session.completed',undefined,{
   session:{...verified,payment_link:'plink_other'}
 });
 assert.equal(res.code,200);assert.equal(res.body.recorded,false);assert.equal(requests.length,0);
});
test('even valid paid session fails closed on ledger outage',async()=>{
 const {res}=await exercise('checkout.session.completed',undefined,{ledgerOk:false});
 assert.equal(res.code,503);
});
test('signed sandbox refund re-fetches charge and records reversal, not access',async()=>{
 const {res,requests}=await exercise('charge.refunded',{id:'ch_qa1234'});
 assert.equal(res.code,200);assert.equal(res.body.access,'held_or_revoked');
 assert.equal(requests.length,1);
 assert.equal(requests[0].path,'/rest/v1/rpc/record_verified_payment_reversal');
 assert.deepEqual(JSON.parse(requests[0].init.body),{
   p_event_id:'evt_qa1234',p_event_type:'charge.refunded',
   p_payment_intent_id:'pi_qa1234',p_charge_id:'ch_qa1234',
   p_refunded_cents:4900
 });
});
test('dispute is reconciled as a hold even without refunded amount',async()=>{
 const {res,requests}=await exercise('charge.dispute.created',{charge:'ch_qa1234'},{
   charge:{id:'ch_qa1234',livemode:false,currency:'usd',amount:4900,
     amount_refunded:0,payment_intent:'pi_qa1234'}
 });
 assert.equal(res.code,200);
 assert.equal(JSON.parse(requests[0].init.body).p_refunded_cents,0);
});
test('live mode is rejected before any payment ledger call',async()=>{
 const {res,requests}=await exercise(undefined,undefined,{env:{STRIPE_MODE:'live'}});
 assert.equal(res.code,503);assert.equal(requests.length,0);
});
test('zero-dollar form is ignored, not granted as paid course',async()=>{
 const {res,requests}=await exercise('checkout.session.completed',
   {id:'cs_test_qa',payment_status:'paid',amount_total:0});
 assert.equal(res.code,200);assert.equal(requests.length,0);
});
test('oversized signed event is denied at ingestion',async()=>{
 const original=Object.fromEntries(Object.keys(sandbox).map(k=>[k,process.env[k]]));
 try{
   Object.assign(process.env,sandbox);
   const payload=Buffer.alloc(300000,65);
   const req={method:'POST',headers:{'stripe-signature':'bad'},
     async *[Symbol.asyncIterator](){yield payload;}};
   const res=response();
   await handleWebhook(req,res,{stripeClient:{webhooks:stripeSDK.webhooks}});
   assert.equal(res.code,400);
 }finally{
   for (const [k,v]of Object.entries(original)){
     if(v===undefined)delete process.env[k];else process.env[k]=v;
   }
 }
});
