import Stripe from 'stripe';
const PRICE_CENTS = Object.freeze({starter:4900,facilitator:12900});
async function rpc(name,args){
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url?.startsWith('https://')||!key)throw new Error('Database not configured');
  const r=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/${name}`,{
    method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(args)
  });
  if(!r.ok)throw new Error(`Database RPC ${name} failed: HTTP ${r.status}`);
}
export const config={api:{bodyParser:false}};
async function readRaw(stream){const chunks=[];let size=0;for await(const chunk of stream){size+=chunk.length;if(size>1024*1024)throw new Error('Oversized webhook');chunks.push(chunk);}return Buffer.concat(chunks);}
export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).end();}
  const key=process.env.STRIPE_TEST_SECRET_KEY||process.env.STRIPE_SECRET_KEY;
  const secret=process.env.STRIPE_TEST_WEBHOOK_SECRET||process.env.STRIPE_WEBHOOK_SECRET;
  if(!key?.startsWith('sk_test_')||!secret?.startsWith('whsec_'))return res.status(503).json({error:'Sandbox not configured'});
  const stripe=new Stripe(key);
  let event;
  try{event=stripe.webhooks.constructEvent(await readRaw(req),req.headers['stripe-signature'],secret);}
  catch{return res.status(400).json({error:'Invalid webhook signature'});}
  try{
    if(event.livemode||event.data.object.livemode)return res.status(400).json({error:'Live events forbidden'});
    if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){
      const s=event.data.object;
      if(s.payment_status!=='paid')return res.status(200).json({received:true,skipped:'unpaid'});
      const code=s.metadata?.product_code;
      if(!Object.hasOwn(PRICE_CENTS,code)||s.amount_total!==PRICE_CENTS[code]||s.currency!=='usd'||typeof s.customer!=='string'||typeof s.payment_intent!=='string'||!s.customer_details?.email)throw new Error('Unverified checkout attributes');
      await rpc('record_verified_checkout_v2',{
        p_event_id:event.id,p_session_id:s.id,p_event_type:event.type,p_customer_id:s.customer,
        p_email:s.customer_details.email,p_product_code:code,p_amount:s.amount_total,p_currency:s.currency,p_payment_intent_id:s.payment_intent
      });
    }else if(event.type==='charge.refunded'||event.type==='charge.dispute.created'){
      const charge=event.type==='charge.refunded'?event.data.object:null;
      const dispute=event.type==='charge.dispute.created'?event.data.object:null;
      const c=charge||await stripe.charges.retrieve(dispute.charge);
      if(!c.payment_intent||!c.id)throw new Error('Unmatched charge');
      await rpc('record_verified_payment_reversal',{
        p_event_id:event.id,p_event_type:event.type,p_payment_intent_id:c.payment_intent,p_charge_id:c.id,
        p_refunded_cents:c.amount_refunded||0
      });
    }
    return res.status(200).json({received:true});
  }catch(e){console.error('Sandbox webhook processing failed',e?.message||'unknown');return res.status(500).json({error:'Retry required'});}
}