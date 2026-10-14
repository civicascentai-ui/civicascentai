// Read-only Safari 5-scene recovery evaluation. Never deploys or calls paid APIs.
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
const root='http://127.0.0.1:8123';
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
if(!chrome) throw new Error('Chromium executable unavailable');
const scenes=[
  {no:1,slug:'arrival',path:'/index.html'},
  {no:2,slug:'introduction',path:'/free-ai-starter.html'},
  {no:3,slug:'planner',path:'/mentor.html'},
  {no:4,slug:'course',path:'/course.html'},
  {no:5,slug:'living-lab',path:'/living-ai-lab.html'}
];
const sizes=[{name:'mobile360',width:360,height:780},{name:'desktop1366',width:1366,height:768}];
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[];
mkdirSync('safari-qa/screenshots',{recursive:true});
for(const size of sizes){
 const ctx=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,reducedMotion:'reduce'});
 await ctx.route('**/*',route=>{
  const url=route.request().url();
  if(url.startsWith(root))return route.continue();
  return route.abort('blockedbyclient'); // no external images/media/APIs in archival QA
 });
 const page=await ctx.newPage();
 for(const s of scenes){
  const errors=[];
  const onError=e=>errors.push(String(e?.message||e).slice(0,150));
  page.on('pageerror',onError);
  let report={scene:s.no,name:s.slug,path:s.path,viewport:size.name,pass:false};
  try{
   const response=await page.goto(root+s.path,{waitUntil:'domcontentloaded',timeout:15000});
   await page.waitForTimeout(100);
   const dom=await page.evaluate(()=>{
     const links=[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent?.trim().replace(/\\s+/g,' ').slice(0,55),href:a.getAttribute('href')}));
     const buttons=[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>=20).map(b=>b.textContent?.trim().replace(/\\s+/g,' ').slice(0,55));
     return {
       title:document.title,h1:document.querySelector('h1')?.textContent?.trim().replace(/\\s+/g,' ').slice(0,120)||null,
       fullWidth:document.documentElement.scrollWidth,screenWidth:innerWidth,
       imageErrors:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')).slice(0,12),
       links,buttons,bodyCharacters:document.body?.innerText?.trim().length||0
     };
   });
   const screenshot='safari-qa/screenshots/scene-'+s.no+'-'+size.name+'.png';
   await page.screenshot({path:screenshot,fullPage:false,timeout:12000});
   report={...report,...dom,status:response?.status(),screenshot,errors:errors.slice(0,6)};
   report.retiredScene6Links=dom.links.filter(x=>/village\\.html/i.test(x.href||''));
   report.pass=report.status===200&&!!report.h1&&report.bodyCharacters>100&&report.fullWidth<=report.screenWidth+2&&errors.length===0;
  }catch(e){report.error=String(e?.message||e).slice(0,250)}
  checks.push(report);
  console.log((report.pass?'PASS':'FAIL')+' scene '+s.no+' '+size.name+' status='+String(report.status)+' overflow='+((report.fullWidth||0)-(report.screenWidth||0))+' errors='+errors.length+' retiredLinks='+(report.retiredScene6Links?.length||0));
  page.off('pageerror',onError);
 }
 await ctx.close();
}
await browser.close();
const byScene=Object.fromEntries(scenes.map(s=>[String(s.no),checks.find(x=>x.scene===s.no&&x.viewport==='desktop1366')]));
const linked=Object.fromEntries(scenes.map(s=>[s.path,{scene:s.no,links:byScene[String(s.no)]?.links||[]}]));
const pageSet=new Set(scenes.map(s=>s.path));
const reach=new Set(['/index.html']),queue=['/index.html'];
while(queue.length){
 const p=queue.shift();
 for(const link of linked[p]?.links||[]){
  const raw=link.href||'';
  if(/^(?:https?:|mailto:|tel:|#|data:)/i.test(raw)||!raw)continue;
  let target;
  try{target=new URL(raw,root+p).pathname}catch{continue}
  if(pageSet.has(target)&&!reach.has(target)){reach.add(target);queue.push(target)}
 }
}
const mainLinks=byScene['1']?.links||[];
const directScene2=mainLinks.some(a=>new URL(a.href||'',root+'/index.html').pathname==='/free-ai-starter.html');
const report={
 schema:'civicascent.safari.recovery-isolated.v1',time:new Date().toISOString(),
 recoverySource:'backup/safari-five-scene-baseline-20261013',
 scope:'ARCHIVAL REVIEW ONLY; NOT APPROVED FINAL PERPLEXITY BUILD',
 networkPolicy:'all non-local requests blocked',
 releaseAuthorized:false,liveUntouched:true,
 expectedScenes:scenes.map(s=>({no:s.no,path:s.path})),
 findings:{
  allRoutesAccessible:checks.every(x=>x.status===200),
  archivedViewsPassingBasicChecks:checks.filter(x=>x.pass).length+'/'+checks.length,
  activeSceneLinksToRetiredScene6:checks.flatMap(x=>x.retiredScene6Links||[]).length,
  scene2DirectFromHome:directScene2,
  sceneReachabilityFromHomepage:scenes.map(s=>({scene:s.no,route:s.path,linked:reach.has(s.path)})),
  rightsProven:false,realPerplexityFinalVerified:false
 },
 checks
};
writeFileSync('safari-qa/recovery-report.json',JSON.stringify(report,null,2)+'\\n');
console.log('FIVE_SCENE_ROUTE_QA '+checks.filter(x=>x.pass).length+'/'+checks.length);
console.log('HOME_TO_SCENE2_DIRECT '+directScene2);
console.log('LINKED_FROM_HOME '+JSON.stringify(report.findings.sceneReachabilityFromHomepage));
if(checks.some(x=>!x.pass))process.exitCode=1;
