// Safari Scene 05 QA: actual Chrome controls, language, responsive accessibility.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const url=pathToFileURL(path.join(root,'living-ai-lab.html')).href;
const folder=path.join(root,'qa-artifacts');
fs.mkdirSync(folder,{recursive:true});
const layouts=[[320,700],[375,812],[390,844],[430,932],[1440,900]];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 try {
  for(const [width,height] of layouts){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('.node').first().waitFor({state:'visible'});
   const cinema=await page.evaluate(async()=>{
      const hero=document.querySelector('.safari-cinema'),img=document.querySelector('.safari-scene-photo');
      if(img&&!img.complete)await new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,8000)});
      const rect=hero.getBoundingClientRect(),ir=img.getBoundingClientRect();
      return {heroLeft:rect.left,heroWidth:rect.width,imageWidth:ir.width,imageHeight:ir.height,decodedWidth:img.naturalWidth,decodedHeight:img.naturalHeight,source:img.currentSrc};
   });
   assert.ok(cinema.heroWidth>=width-2,'Safari hero is not full bleed at '+width+': '+JSON.stringify(cinema));
   assert.ok(cinema.imageWidth>=width-2 && cinema.decodedWidth>=600,'Safari background not correctly rendered at '+width+': '+JSON.stringify(cinema));
   assert.match(cinema.source,/scene05-clean-preview.svg/);
   console.log('PASS Scene05 visual media '+width+'px '+JSON.stringify({heroWidth:cinema.heroWidth,imageWidth:cinema.imageWidth,decoded:cinema.decodedWidth}));
   const viewport=await page.evaluate(()=>{
     const nodes=[...document.querySelectorAll('.node')].map(n=>{const r=n.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right}});
     const panel=document.querySelector('.stage').getBoundingClientRect();
     return {scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,buttons:nodes,stageWidth:panel.width,title:document.getElementById('mainTitle').textContent};
   });
   assert.ok(viewport.scroll<=viewport.client+2,'horizontal overflow '+width+': '+JSON.stringify(viewport));
   assert.ok(viewport.stageWidth>180,'missing readable stage '+width);
   assert.equal(viewport.title,'Living AI Lab');
   for(const n of viewport.buttons){
     assert.ok(n.height>=44&&n.width>=44,'mode hit target too small '+width);
     assert.ok(n.left>=-2&&n.right<=width+2,'mode off horizontal viewport '+width);
   }
   assert.ok(await page.locator('text=prepared educational demonstrations').count()>0,'no live AI disclaimer');
   const nodes=page.locator('.node');
   assert.equal(await nodes.count(),4,'must preserve four modes');
   const practice=page.locator('button[data-practice]');
   assert.equal(await practice.count(),2,'Create mode requires two interactive practice choices');
   await practice.first().click();
   assert.match(await page.locator('#practiceOutput').innerText(),/Create a simple invitation/);
   assert.equal(await practice.first().getAttribute('aria-pressed'),'true');
   await practice.nth(1).click();
   assert.match(await page.locator('#practiceOutput').innerText(),/Describe a welcoming image/);
   assert.equal(await practice.nth(1).getAttribute('aria-pressed'),'true');
   const practiceBounds=await page.locator('.safari-prompt-practice').evaluate(el=>{
      const r=el.getBoundingClientRect();const stage=document.querySelector('.stage').getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,stageBottom:stage.bottom,clientWidth:innerWidth};
   });
   assert.ok(practiceBounds.left>=-2 && practiceBounds.right<=width+2,
     'practice overflows viewport '+width+': '+JSON.stringify(practiceBounds));
   assert.ok(practiceBounds.bottom<=practiceBounds.stageBottom+3,
     'practice spills outside stage '+width+': '+JSON.stringify(practiceBounds));

   for(const [index,title] of [[0,'Create Images'],[1,'Use Your Voice'],[2,'Translate Language'],[3,'Plan & Organize']]){
      await nodes.nth(index).click();
      assert.equal(await nodes.nth(index).getAttribute('aria-pressed'),'true','pressed state');
      assert.equal(await page.locator('.scene h2').innerText(),title,'mode render');
   }
   await page.locator('#lang').click();
   assert.equal(await page.locator('#mainTitle').innerText(),'Laboratorio de IA');
   await page.locator('[data-mode="translate"]').click();
   assert.equal(await page.locator('.scene h2').innerText(),'Traducir idiomas');
   await page.locator('[data-mode="create"]').click();
   assert.match(await page.locator('.practice-intro').innerText(),/Elige una idea/);
   await page.locator('[data-practice="workshop"]').click();
   assert.match(await page.locator('#practiceOutput').innerText(),/Crea una invitación sencilla/);
   await page.locator('#lang').click();
   assert.equal(await page.locator('.scene h2').innerText(),'Create Images');
   await page.locator('#stop').click();
   assert.equal(await page.locator('#status').innerText(),'Stopped');
   const links=await page.locator('.safari-lab-links a').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
   assert.deepEqual(links,['course.html','index.html','consultation.html']);
   await page.locator('[data-mode="create"]').click();
   await page.screenshot({path:path.join(folder,'safari-scene05-'+width+'.png'),fullPage:true});
   assert.deepEqual(errors,[],'browser JS error '+width);
   console.log('PASS Scene05 '+width+'x'+height+': four guided modes, EN/ES, voice stop, law disclosure, accessible hit areas, routes, no JS errors/overflow');
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
