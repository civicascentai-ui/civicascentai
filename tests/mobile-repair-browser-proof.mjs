import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
const root='http://127.0.0.1:8123';
const executable=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(existsSync);
if(!executable) throw new Error('Chrome missing on runner');
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage']});
mkdirSync('mobile-qa-output/screenshots',{recursive:true});
const views=[{name:'mobile390',width:390,height:844},{name:'mobile360',width:360,height:780},{name:'desktop',width:1366,height:768}];
const result=[];
for(const view of views){
 const page=await browser.newPage({viewport:{width:view.width,height:view.height},deviceScaleFactor:1,reducedMotion:'reduce'});
 for(const name of ['course','programs','register']){
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(root+'/'+name+'.html',{waitUntil:'networkidle',timeout:20000});
  const nav=await page.locator('.site-header nav').evaluate(el=>({
    scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
    childCount:el.querySelectorAll('a').length,
    visibleAnchors:[...el.querySelectorAll('a')].filter(a=>{const r=a.getBoundingClientRect();return r.width>=20&&r.left>=-1&&r.right<=window.innerWidth+1&&r.height>=30}).length
  }));
  let buttons=null;
  if(name==='course'){
    buttons=await page.locator('.hero-actions .button').evaluateAll(nodes=>nodes.map(el=>{
       const r=el.getBoundingClientRect();
       return {text:el.textContent.trim(),left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height};
    }));
  }
  const viewportWidth=await page.evaluate(()=>window.innerWidth);
  const screenshot='mobile-qa-output/screenshots/'+name+'-'+view.name+'.png';
  await page.screenshot({path:screenshot,fullPage:false});
  const navOK=nav.visibleAnchors===nav.childCount && nav.scrollWidth<=nav.clientWidth+2;
  const buttonsOK=!buttons || (buttons.length===2 && buttons.every(b=>b.left>=0 && b.right<=viewportWidth && b.height>=44) &&
    (buttons[0].bottom<=buttons[1].top || buttons[1].bottom<=buttons[0].top || buttons[0].right<=buttons[1].left || buttons[1].right<=buttons[0].left));
  const pass=response?.status()===200&&navOK&&buttonsOK&&errors.length===0;
  result.push({view:view.name,page:name,http:response?.status(),nav,buttons,navOK,buttonsOK,errors,pass,screenshot});
  console.log((pass?'PASS':'FAIL')+' '+view.name+' '+name+' nav='+nav.visibleAnchors+'/'+nav.childCount+' visible; CTA='+buttonsOK);
 }
 await page.close();
}
await browser.close();
writeFileSync('mobile-qa-output/report.json',JSON.stringify({time:new Date().toISOString(),mainUnchanged:true,results:result},null,2));
console.log('MOBILE_REPAIR_QA '+result.filter(r=>r.pass).length+'/'+result.length);
if(result.some(r=>!r.pass))process.exitCode=1;
