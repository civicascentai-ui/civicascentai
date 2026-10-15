// Controlled read-only public smoke/load; high concurrency only on local fixture.
// No POST/PUT/DELETE to any public endpoint. No purchases, emails, or user data.
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import handler from '../api/create-checkout-session.js';

const ROOT = 'https://civicascentai.com';
const OUT = 'artifacts/production-safe-load';
mkdirSync(OUT, { recursive: true });
const report = { target: ROOT, mode: 'GET-only bounded production + isolated local stress', checks: [], production: {}, local: {} };
const mark = (name, ok, detail) => {
  report.checks.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  if (!ok) throw new Error(name + ': ' + JSON.stringify(detail));
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function timedFetch(url, timeoutMs=13000) {
  const t=performance.now();
  const resp=await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), headers: {'accept': 'text/html,application/json;q=0.9'} });
  const body=await resp.text();
  return { status:resp.status, content:body, ms:Math.round(performance.now()-t), finalUrl:resp.url, cacheControl:resp.headers.get('cache-control') };
}
function percentile(a, p) {
  const s=[...a].sort((a,b)=>a-b);
  return s[Math.min(s.length-1,Math.floor((s.length-1)*p))]??null;
}

let server;
try {
  // Strict in-process checkout simulation, no external provider request.
  for (let i=0; i<20000; i++) {
    const req={ method:i%8===0?'GET':'POST', body: { price:'price_fake', amount:0 }, query:{debug:'1'} };
    const res={ code:0, body:null, headers:{},
      setHeader(k,v){this.headers[k]=v;return this;},
      status(s){this.code=s;return this;},
      json(o){this.body=o;return this;} };
    handler(req,res);
    assert.equal(res.code, req.method==='POST'?403:405);
    if(req.method==='POST') {
      assert.equal(res.body.code,'PAID_ENROLLMENT_ON_HOLD');
      assert.equal(res.body.url,undefined);
    }
    assert.equal(res.headers['Cache-Control'],'no-store');
  }
  mark('20,000 simulated paid-checkout attempts',true,'no payment sessions or charge-capable calls');

  // Local static-server stress. Never targets another host and uses GET only.
  const pages=['index.html','clear-start.html','practice-sandbox.html','veterans.html','journey-learn.html','course.html'];
  const documents = new Map(pages.map(name=>['/'+name,readFileSync(name)]));
  server=http.createServer((req,res)=>{
    if(req.method!=='GET' || !documents.has(new URL(req.url,'http://localhost').pathname)) {
      res.writeHead(404);res.end('not found');return;
    }
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    res.end(documents.get(new URL(req.url,'http://localhost').pathname));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const localMs=[];let localFail=0;let localIndex=0;
  async function localWorker(){
    while(true){
      const i=localIndex++;
      if(i>=2400)break;
      try{
        const p=pages[i%pages.length];
        const x=await timedFetch('http://127.0.0.1:'+port+'/'+p,9000);
        if(x.status!==200 || x.content.length<200) localFail++;
        localMs.push(x.ms);
      }catch{localFail++;}
    }
  }
  await Promise.all(Array.from({length:24},localWorker));
  report.local={requests:2400,workers:24,failed:localFail,p95_ms:percentile(localMs,.95),p99_ms:percentile(localMs,.99)};
  mark('isolated high-concurrency static stress',localFail===0,report.local);
  await new Promise(resolve=>server.close(resolve));server=null;

  // Production smoke. One non-mutating request per route, no checkout POST.
  const routes=[
    ['/', 'CivicAscent'],
    ['/clear-start.html','Learn AI, one step at a time.'],
    ['/practice-sandbox.html','Student Practice'],
    ['/veterans.html','Veteran'],
    ['/journey-learn.html','Learn'],
    ['/register.html','$0'],
    ['/registro.html','$0']
  ];
  for(const [route,needle] of routes) {
    const x=await timedFetch(ROOT+route);
    mark('public route '+route,x.status===200 && x.content.includes(needle),{status:x.status,requiredText:needle,present:x.content.includes(needle),ms:x.ms,finalUrl:x.finalUrl});
  }
  const block=await timedFetch(ROOT+'/api/create-checkout-session');
  report.checkoutRoute={GET_status:block.status, interpretation:block.status===404?'API route absent from deployed app':block.status===405?'GET disallowed by handler':'Unexpected response'};
  mark('public checkout GET cannot initiate a purchase', [404,405].includes(block.status),report.checkoutRoute);
  // Bounded load: 180 GETs max, 3 workers, 150ms between each worker request.
  // Stops quickly if 5 errors; intended to catch obvious failure, not saturate site.
  let next=0, failures=0;const productionMs=[];
  async function publicWorker(){
    while(failures<5){
      const i=next++;
      if(i>=180)break;
      const route=routes[i%routes.length][0];
      try {
        const x=await timedFetch(ROOT+route,12000);
        if(x.status!==200)failures++;
        productionMs.push(x.ms);
      } catch {failures++;}
      await pause(150);
    }
  }
  await Promise.all(Array.from({length:3},publicWorker));
  report.production={requested:180,completed:productionMs.length,failed:failures,p50_ms:percentile(productionMs,.5),p95_ms:percentile(productionMs,.95),max_ms:Math.max(0,...productionMs),workers:3};
  mark('bounded read-only production load',failures===0 && productionMs.length===180,report.production);
  console.log('PASS production read-only smoke and bounded load; isolated checkout/static stress');
} catch(e) {
  report.error=String(e.message||e);
  console.error('FAIL',report.error);
  process.exitCode=1;
} finally {
  if(server)await new Promise(resolve=>server.close(resolve));
  writeFileSync(OUT+'/results.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({checks:report.checks.map(x=>({name:x.name,status:x.status})),production:report.production,local:report.local,error:report.error},null,2));
}
