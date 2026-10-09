import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import handler from '../api/stripe-webhook.js';

function response() {return {statusCode:200,body:null,status(n){this.statusCode=n;return this;},json(b){this.body=b;return this;},setHeader(){return this;},end(){return this;}};}
function req(payload,secret) {return {method:'POST',headers:{'stripe-signature':Stripe.webhooks.generateTestHeaderString({payload,secret})},async *[Symbol.asyncIterator](){yield Buffer.from(payload);}};}
async function env(values,fn) {const old=Object.fromEntries(Object.keys(values).map(k=>[k,process.env[k]]));try {Object.assign(process.env,values);await fn();}finally {for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}}
const base={STRIPE_SECRET_KEY:'sk_test_qa_placeholder_no_network',STRIPE_WEBHOOK_SECRET:'whsec_qa_failurepath',SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'qa_placeholder',STRIPE_MODE:'test',STRIPE_STARTER_PAYMENT_LINK_ID:'plink_qa_starter',STRIPE_FACILITATOR_PAYMENT_LINK_ID:'plink_qa_facilitator',CHECKOUT_RECORDING_ENABLED:'false'};
function signedCheckout({paid=true,amount=4900}={}) {const payload=JSON.stringify({id:'evt_qa_failure',type:'checkout.session.completed',data:{object:{id:'cs_qa_failure',payment_status:paid?'paid':'unpaid',amount_total:amount}}});return req(payload,base.STRIPE_WEBHOOK_SECRET);}
test('runtime: paid event fails closed when entitlement database is unconfigured',async()=>{await env({...base,SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:''},async()=>{const res=response();await handler(signedCheckout(),res);assert.equal(res.statusCode,503);assert.deepEqual(res.body,{error:'Entitlement database not configured'});});});
test('runtime: zero-amount checkout is acknowledged without recording',async()=>{await env(base,async()=>{const res=response();await handler(signedCheckout({amount:0}),res);assert.equal(res.statusCode,200);assert.deepEqual(res.body,{received:true});});});
test('runtime: unpaid checkout is acknowledged without recording even when recording enabled',async()=>{await env({...base,CHECKOUT_RECORDING_ENABLED:'true'},async()=>{const res=response();await handler(signedCheckout({paid:false}),res);assert.equal(res.statusCode,200);assert.deepEqual(res.body,{received:true});});});
