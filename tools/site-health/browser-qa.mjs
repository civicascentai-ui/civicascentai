// CivicAscent AI: isolated, read-only browser QA against PUBLIC existing pages.
// No login, form submission, checkout, web changes, or screenshot publication.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
const base='https://civicascentai.com';
const routes=[
  {path:'/',name:'home'},
  {path:'/programs.html',name:'programs'},
  {path:'/course.html',name:'course'},
  {path:'/consultation.html',name:'consultation'},
  {path:'/free-ai-starter.html',name:'starter'},
  {path:'/register.html',name:'register'}
];
const devices=[
  {name:'mobile',width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},
  {name:'desktop',width:1366,height:768,isMobile:false,hasTouch:false,deviceScaleFactor:1}
];
const chromeCandidates=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'];
const executablePath=chromeCandidates.find(existsSync);
const browser=await chromium.launch({headless:true, executablePath, args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[];
mkdirSync('website-output/screenshots',{recursive:true});
for (const device of devices){
 const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1,isMobile:device.isMobile,hasTouch:device.hasTouch,reducedMotion:'reduce'});
 const page=await context.newPage();
 for(const route of routes){
   const jsErrors=[];
   page.on('pageerror',err=>jsErrors.push(String(err.message).slice(0,160)));
   let result={name:route.name,device:device.name,url:base+route.path,pass:false};
   try{
     const response=await page.goto(result.url,{waitUntil:'domcontentloaded',timeout:20000});
     await page.waitForTimeout(300);
     const evidence=await page.evaluate(()=>({
       title:document.title, h1:document.querySelector('h1')?.innerText?.trim().slice(0,120)||null,
       bodyTextLength:document.body?.innerText?.trim().length||0,
       documentWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,
       imageCount:document.images.length,brokenImages:[...document.images].filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.getAttribute('src')).slice(0,8),
       localLinks:[...document.querySelectorAll('a[href]')].filter(x=>{try{return new URL(x.href).origin===location.origin}catch{return false}}).length
     }));
     const screenshot='website-output/screenshots/'+route.name+'-'+device.name+'.png';
     await page.screenshot({path:screenshot,fullPage:false,timeout:15000});
     result={...result,status:response?.status()??null,finalUrl:page.url(),...evidence,jsErrors:jsErrors.slice(0,5),screenshot,pass:response?.status()===200&&evidence.bodyTextLength>40&&!!evidence.title&&evidence.documentWidth<=evidence.viewportWidth+2&&evidence.brokenImages.length===0&&jsErrors.length===0};
   } catch(e){result.error=String(e?.message||e).slice(0,300)}
   results.push(result);console.log((result.pass?'PASS':'FAIL')+' '+device.name+' '+route.path+' HTTP '+(result.status??'-')+' '+(result.error||'')+' overflow='+((result.documentWidth||0)-(result.viewportWidth||0)));
 }
 await context.close();
}
await browser.close();
const report={schema:'civicascent.website.browser-qc.v1',timestamp:new Date().toISOString(),runId:process.env.GITHUB_RUN_ID||null,commit:process.env.GITHUB_SHA||null,results};
writeFileSync('website-output/browser-qc.json',JSON.stringify(report,null,2)+'\n');
console.log('BROWSER_QA: '+results.filter(x=>x.pass).length+'/'+results.length+' pass');
if(results.some(r=>!r.pass))process.exitCode=1;
