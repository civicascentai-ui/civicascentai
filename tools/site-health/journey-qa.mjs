// Public-site click-path audit using read-only browser navigation.
// Never submits a form, opens Stripe checkout, creates an account, or writes external data.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const base='https://civicascentai.com';
const journeys=[
  {name:'home-start-free',start:'/',link:'.primary[href="free-ai-starter.html"]',end:'/free-ai-starter.html'},
  {name:'home-to-programs',start:'/',link:'.paths a[href="programs.html"]',end:'/programs.html'},
  {name:'home-to-consultation',start:'/',link:'.paths a[href="consultation.html"]',end:'/consultation.html'},
  {name:'home-to-registration',start:'/',link:'.paths a[href="register.html"]',end:'/register.html'},
  {name:'programs-to-course-pricing',start:'/programs.html',link:'a[href="course.html#enroll"]',end:'/course.html#enroll'},
  {name:'course-to-listen',start:'/course.html',link:'a[href="#listen"]',end:'/course.html#listen'}
];
const reports=[];
for(const view of [{name:'mobile',width:390,height:844},{name:'desktop',width:1366,height:768}]){
 const page=await browser.newPage({viewport:{width:view.width,height:view.height},reducedMotion:'reduce'});
 for(const j of journeys){
  const result={view:view.name,journey:j.name,pass:false};try{
   await page.goto(base+j.start,{waitUntil:'domcontentloaded',timeout:20000});
   const el=page.locator(j.link).first();
   await el.click({timeout:8000});
   await page.waitForTimeout(150);
   const u=new URL(page.url());
   result.url=u.origin+u.pathname+u.hash;
   result.pass=u.origin===base && (u.pathname+u.hash)===j.end;
   if(!result.pass)result.error='Unexpected click destination';
  }catch(e){result.error=String(e?.message||e).slice(0,220)}
  reports.push(result);
  console.log((result.pass?'PASS':'FAIL')+' '+view.name+' '+j.name+' '+(result.url||result.error));
 }
 await page.close();
}
await browser.close();
mkdirSync('website-output',{recursive:true});
writeFileSync('website-output/journey-qc.json',JSON.stringify({timestamp:new Date().toISOString(),readOnly:true,noExternalSubmissions:true,results:reports},null,2));
console.log('JOURNEY_QA '+reports.filter(x=>x.pass).length+'/'+reports.length);
if(reports.some(x=>!x.pass))process.exitCode=1;
