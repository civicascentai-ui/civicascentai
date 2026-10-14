// Read-only live reachability checks. No secrets, payment calls, or site modifications.
import { mkdirSync, writeFileSync } from 'node:fs';
const checks = [
 { url: 'https://civicascentai.com/', kind: 'html', mustInclude: 'CivicAscent AI' },
 { url: 'https://www.civicascentai.com/', kind: 'html', mustInclude: 'CivicAscent AI' },
 { url: 'https://civicascentai.com/programs.html', kind: 'html', mustInclude: 'CivicAscent' },
 { url: 'https://civicascentai.com/course.html', kind: 'html', mustInclude: 'CivicAscent' },
 { url: 'https://civicascentai.com/consultation.html', kind: 'html', mustInclude: 'CivicAscent' },
 { url: 'https://civicascentai.com/assets/safari/scene-01-lodge-panorama.jpg', kind: 'image' }
];
const results=[];
for(const check of checks) {
 const started=Date.now();
 try {
   const response=await fetch(check.url, { method:'GET', redirect:'follow', signal:AbortSignal.timeout(12000), headers:{'User-Agent':'CivicAscent-ReadOnly-Website-QA/1.0'} });
   const contentType=response.headers.get('content-type') || '';
   const body=check.kind === 'html' ? await response.text() : new Uint8Array(await response.arrayBuffer());
   const match=check.kind==='html' ? body.includes(check.mustInclude) && contentType.includes('text/html') : contentType.startsWith('image/') && body.byteLength > 1000;
   const pass=response.status===200 && match;
   results.push({url:check.url,finalUrl:response.url,status:response.status,contentType,pass,elapsedMs:Date.now()-started,error:pass ? null : 'Unexpected status or content'});
 } catch(error) {
   results.push({url:check.url,pass:false,elapsedMs:Date.now()-started,error:String(error?.cause?.code || error?.code || error?.message || error).slice(0,180)});
 }
}
mkdirSync('website-output',{recursive:true});
writeFileSync('website-output/live-health.json',JSON.stringify({schema:'civicascent.live-website.readonly.v1',timestamp:new Date().toISOString(),repository:process.env.GITHUB_REPOSITORY,runId:process.env.GITHUB_RUN_ID||null,checks:results},null,2));
for(const r of results) console.log(`${r.pass?'PASS':'FAIL'} ${r.status??'-'} ${r.url} -> ${r.finalUrl||r.error}`);
console.log(`Verified ${results.filter(x=>x.pass).length}/${results.length} checks. This is not a browser UX or purchase test.`);
if(results.some(x=>!x.pass))process.exitCode=1;
