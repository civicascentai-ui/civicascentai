// Browser journey QA for existing OWNER-APPROVED Safari routes (no payment or design substitution).
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..'),artifacts=path.join(root,'qa-artifacts');
fs.mkdirSync(artifacts,{recursive:true});
const pages=['index.html','free-ai-starter.html','mentor.html','course.html','living-ai-lab.html','consultation.html','try-chatgpt.html','404.html'];
const views=[{width:320,height:700},{width:390,height:844},{width:768,height:1024},{width:1440,height:900}];
const uri=p=>pathToFileURL(path.join(root,p)).href;
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
try {
 for(const view of views){
   const ctx=await browser.newContext({viewport:view,reducedMotion:'reduce'});
   const page=await ctx.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   for(const name of pages){
     await page.goto(uri(name),{waitUntil:'domcontentloaded'});
     const metrics=await page.evaluate(()=>{
       const el=[...document.querySelectorAll('h1')].find(x=>x.getClientRects().length);
       const tooWide=[...document.querySelectorAll('main *,header *,footer *')].map(e=>({tag:e.tagName,cls:e.className?.toString().slice(0,35),r:e.getBoundingClientRect()})).filter(x=>x.r.right>innerWidth+2||x.r.left<-2).slice(0,7).map(x=>({tag:x.tag,cls:x.cls,left:Math.round(x.r.left),right:Math.round(x.r.right)}));
       return {scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,tooWide,
         title:el?.textContent?.trim()||'',links:document.querySelectorAll('a[href]').length,header:[...document.querySelectorAll('.site-header,.site-header .brand,.site-header nav,.hero,.hero-grid,.listen-card,.listen-shell,main')].map(e=>({el:e.tagName+'.'+e.className,offset:e.offsetWidth,scroll:e.scrollWidth,left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right),overflow:getComputedStyle(e).overflowX})).slice(0,12)};
     });
     assert.ok(metrics.title,'H1 missing on '+name);
     assert.ok(metrics.scroll<=metrics.client+2,'horizontal overflow '+name+' '+view.width+': '+JSON.stringify(metrics));
     assert.ok(metrics.links>=1,'no navigable links '+name);
     if(name==='index.html'){
       await page.locator('#start').click();
       assert.ok(await page.locator('#guideShell').isVisible(),'Start Here guide missing');
       await page.locator('#guideNext').click();
       await page.locator('#guideNext').click();
       assert.equal(await page.locator('#nextActions a').count(),4);
       await page.keyboard.press('Escape');
       assert.ok(await page.locator('#guideShell').isHidden());
     }
     if(name==='free-ai-starter.html'){
       assert.ok(await page.getByRole('link',{name:'Return to Safari'}).count()>=1);
     }
     if(name==='mentor.html'){
       assert.ok(await page.locator('#mentorBtn').count()===1);
       assert.ok(await page.locator('.choice').count()>=4);
       await page.locator('.choice[data-goal="learn"]').click();
       await page.locator('#situation').fill('I am a beginner learning practical AI.');
       await page.locator('#mentorBtn').click();
       assert.ok(await page.locator('#mentorOutput').isVisible(),'Planner did not generate plan');
     }
     if(name==='living-ai-lab.html'){
       assert.equal(await page.locator('.node').count(),4,'Lab modes missing');
       await page.locator('[data-mode="translate"]').click();
       assert.equal(await page.locator('.scene h2').innerText(),'Translate Language');
     }
     if(name==='try-chatgpt.html'){
       const choices=await page.locator('.choices .choice').evaluateAll(a=>a.map(x=>({href:x.href,target:x.target,rel:x.rel,label:x.textContent.trim()})));
       assert.equal(choices.length,4,'Four guided ChatGPT choices required');
       assert.equal(new Set(choices.map(c=>c.href)).size,4,'Guided prompts should not repeat');
       for(const c of choices){
         const u=new URL(c.href);
         assert.equal(u.origin,'https://chatgpt.com');
         assert.ok(u.searchParams.get('q')?.length>=20,'Missing suggested prompt');
         assert.equal(c.target,'_blank');
         assert.ok(c.rel.includes('noopener')&&c.rel.includes('noreferrer'));
       }
       assert.ok(await page.locator('.notice').isVisible(),'Third-party privacy notice missing');
       await page.locator('#language').click();
       assert.equal(await page.locator('html').getAttribute('lang'),'es');
       assert.match(await page.locator('h1').innerText(),/conversación/);
       await page.locator('#language').click();
       assert.equal(await page.locator('html').getAttribute('lang'),'en');
       assert.match(await page.locator('h1').innerText(),/real AI conversation/);
       console.log('PASS',name,view.width,'all four prompts, bilingual and disclosure');
     }
     await page.screenshot({path:path.join(artifacts,'owner-safari-'+name.replace('.html','')+'-'+view.width+'.png'),fullPage:true});
     console.log('PASS',name,view.width,'no overflow, heading and journey UI');
   }
   await page.goto(uri('village.html'),{waitUntil:'load'});
   await page.waitForURL(/index\.html$/, { timeout: 5000 });
   console.log('PASS legacy village redirect to Safari home; no sixth active scene');
   assert.deepEqual(errors,[],'page script error '+view.width);
   await ctx.close();
 }
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
