import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../api/learner-auth.js';

const config={
 LEARNER_AUTH_ENABLED:'true',STRIPE_MODE:'test',
 SUPABASE_URL:'https://sandbox.example.invalid',SUPABASE_PUBLISHABLE_KEY:'pub_test'
};
const email='buyer@example.invalid';
function response(){return {
 code:200,body:null,headers:{},
 setHeader(k,v){this.headers[k]=v;return this;},
 status(code){this.code=code;return this;},json(body){this.body=body;return this;}
};}
async function exercise(body,opts={}){
 const originals=Object.fromEntries(Object.keys(config).map(k=>[k,process.env[k]]));
 const originalFetch=globalThis.fetch,calls=[];
 try{
  for(const [k,v] of Object.entries({...config,...opts.env})) {
   if(v===null)delete process.env[k];else process.env[k]=v;
  }
  globalThis.fetch=async(url,init)=>{
   calls.push({url:String(url),init});
   if(opts.netError)throw Error('provider timeout');
   return {status:opts.status??200,ok:(opts.status??200)<400,
     async json(){return opts.result??{access_token:'qa_short_lived_token',
      expires_in:600,user:{id:'buyer-1',email,email_confirmed_at:'2026-10-09T00:00:00Z'}};}};
  };
  const req={method:'POST',headers:{origin:'https://qa.example.invalid',host:'qa.example.invalid',
    'x-forwarded-proto':'https'},body,...opts.request};
  const res=response();
  await handler(req,res);
  return{res,calls};
 }finally{
  globalThis.fetch=originalFetch;
  for(const [k,v] of Object.entries(originals)){
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
 }
}
test('QA OTP is disabled in any live-mode environment',async()=>{
 const z=await exercise({action:'request_code',email},{env:{STRIPE_MODE:'live'}});
 assert.equal(z.res.code,503);assert.equal(z.calls.length,0);
});
test('QA OTP requires an explicit feature flag',async()=>{
 const z=await exercise({action:'request_code',email},{env:{LEARNER_AUTH_ENABLED:null}});
 assert.equal(z.res.code,503);assert.equal(z.calls.length,0);
});
test('QA OTP rejects unsafe/missing server publishable key',async()=>{
 const z=await exercise({action:'request_code',email},{env:{SUPABASE_PUBLISHABLE_KEY:null}});
 assert.equal(z.res.code,503);assert.equal(z.calls.length,0);
});
test('QA OTP rejects invalid email and actions without calling provider',async()=>{
 for(const body of [{action:'request_code',email:'a bad@@foo'}, {action:'verify_code',email,code:'no'},
 {action:'delete_user',email}]){
  const z=await exercise(body);assert.equal(z.res.code,400);assert.equal(z.calls.length,0);
 }
});
test('QA OTP refuses cross-site POST origin before sending email',async()=>{
 const z=await exercise({action:'request_code',email},
  {request:{headers:{origin:'https://attacker.example',host:'qa.example.invalid','x-forwarded-proto':'https'}}});
 assert.equal(z.res.code,403);assert.equal(z.calls.length,0);
});
test('QA OTP request uses publishable key, normalizes email and never issues login token',async()=>{
 const z=await exercise({action:'request_code',email:'BUYER@example.invalid'});
 assert.equal(z.res.code,202);
 assert.equal(z.res.headers['Cache-Control'],'no-store');
 assert.equal(z.calls.length,1);
 assert.equal(new URL(z.calls[0].url).pathname,'/auth/v1/otp');
 assert.deepEqual(JSON.parse(z.calls[0].init.body),{email,create_user:true});
 assert.equal(z.calls[0].init.headers.apikey,'pub_test');
 assert.ok(!JSON.stringify(z.res.body).includes('access_token'));
});
test('QA OTP verification accepts provider-confirmed owner and returns only short-lived token',async()=>{
 const z=await exercise({action:'verify_code',email,code:'123456'});
 assert.equal(z.res.code,200);
 assert.equal(new URL(z.calls[0].url).pathname,'/auth/v1/verify');
 assert.deepEqual(JSON.parse(z.calls[0].init.body),{email,token:'123456',type:'email'});
 assert.equal(z.res.body.access_token,'qa_short_lived_token');
 assert.equal(z.res.body.expires_in,600);
 assert.ok(!JSON.stringify(z.res.body).includes('pub_test'));
});
test('QA OTP cannot issue token for unconfirmed email or mismatched buyer',async()=>{
 for(const user of [{id:'buyer-1',email,email_confirmed_at:null},
                   {id:'buyer-2',email:'stranger@example.invalid',email_confirmed_at:'2026-10-09'}]){
  const z=await exercise({action:'verify_code',email,code:'123456'},
   {result:{access_token:'fake',expires_in:600,user}});
  assert.equal(z.res.code,401);assert.equal(z.res.body.access_token,undefined);
 }
});
test('QA OTP returns rate-limit response without token',async()=>{
 const z=await exercise({action:'request_code',email},{status:429});
 assert.equal(z.res.code,429);assert.equal(z.res.body.access_token,undefined);
});
test('QA OTP provider downtime denies sign-in',async()=>{
 const z=await exercise({action:'verify_code',email,code:'123456'},{netError:true});
 assert.equal(z.res.code,503);
});
test('QA learner page never persists access credentials to localStorage, embeds payment links, or auto-reveals kits',()=>{
 const ui=readFileSync(new URL('../learner.html',import.meta.url),'utf8');
 assert.match(ui,/autocomplete="one-time-code"/);
 assert.match(ui,/aria-live="polite"/);
 assert.match(ui,/\/api\/learner-entitlements/);
 assert.doesNotMatch(ui,/localStorage|sessionStorage|buy\.stripe\.com|https:\/\/book\.stripe\.com/);
 assert.doesNotMatch(ui,/COURSE_PRIVATE_BUCKET|SUPABASE_SERVICE_ROLE_KEY/);
});
