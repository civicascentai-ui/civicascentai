// Browser-level Safari homepage QA. Runs against local GitHub checkout, no Vercel auth or API credentials.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');

const url = pathToFileURL(path.resolve(__dirname,'../../index.html')).href;
const folder = path.resolve(__dirname,'../../qa-artifacts');
fs.mkdirSync(folder,{recursive:true});
const viewports = [
  {width:320,height:700},
  {width:375,height:812},
  {width:390,height:844},
  {width:430,height:932},
  {width:1440,height:900},
];
async function run(){
  const browser = await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  try{
    for(const viewport of viewports){
      const context=await browser.newContext({viewport,reducedMotion:'reduce'});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.locator('#start').waitFor({state:'visible'});
      // A loaded scene is necessary for visual QA. The remote-photo fallback
      // must not be mistaken for the intended final Safari experience.
      const photoInfo=await page.locator('#safariStill').evaluate(async img=>{
        try { await img.decode(); }
        catch(e) { return {loaded:false,reason:String(e)}; }
        return {loaded:img.complete&&img.naturalWidth>=800,width:img.naturalWidth,height:img.naturalHeight};
      });
      assert.ok(photoInfo.loaded,'Safari photo failed to decode on '+viewport.width+': '+JSON.stringify(photoInfo));
      const basics=await page.evaluate(()=>{
        const h=document.querySelector('#headline').getBoundingClientRect();
        const c=document.querySelector('#start').getBoundingClientRect();
        const header=document.querySelector('.header').getBoundingClientRect();
        return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
          ctaVisible:c.top>=0&&c.bottom<=innerHeight,
          ctaMinHeight:c.height,
          h1Visible:h.width>0&&h.height>0,
          headerOverlapsHeading:!(header.bottom<h.top||header.top>h.bottom),
          mockup:!!document.getElementById('cosmos'),
          stillReducedMotionDisabled:getComputedStyle(document.getElementById('safariStill')).animationName==='none'};
      });
      assert.ok(basics.scrollWidth<=basics.viewport+2,'horizontal overflow at '+viewport.width+': '+JSON.stringify(basics));
      assert.ok(basics.ctaVisible,'Start Here offscreen at '+viewport.width+': '+JSON.stringify(basics));
      assert.ok(basics.ctaMinHeight>=48,'touch target small at '+viewport.width);
      assert.ok(basics.h1Visible,'missing heading at '+viewport.width);
      assert.ok(!basics.headerOverlapsHeading,'header clips heading at '+viewport.width);
      assert.ok(!basics.mockup,'starfield remains at '+viewport.width);
      assert.ok(basics.stillReducedMotionDisabled,'reduced motion must stop background animation at '+viewport.width);
      assert.ok(await page.locator('#guideShell').isHidden(),'guide unexpectedly open');
      await page.screenshot({path:path.join(folder,'safari-home-'+viewport.width+'.png'),fullPage:true});
      await page.locator('#start').click();
      assert.equal(await page.locator('#guide').getAttribute('aria-modal'),'true');
      assert.ok(await page.locator('#guide').isVisible(),'guide not displayed');
      assert.ok(await page.locator('#nextActions').isHidden(),'choices should initially be hidden');
      await page.locator('#guideNext').click();
      assert.match(await page.locator('#guideTitle').innerText(),/AI easier to understand/);
      await page.locator('#guideNext').click();
      assert.ok(await page.locator('#nextActions').isVisible(),'end-step links missing');
      assert.equal(await page.locator('#nextActions a').count(),4);
      const expected=['course.html','living-ai-lab.html','consultation.html','village.html'];
      const actual=await page.locator('#nextActions a').evaluateAll(es=>es.map(a=>a.getAttribute('href')));
      assert.deepEqual(actual,expected,'wrong real destinations');
      await page.screenshot({path:path.join(folder,'safari-guide-'+viewport.width+'.png'),fullPage:true});
      await page.keyboard.press('Escape');
      assert.ok(await page.locator('#guideShell').isHidden(),'Escape did not close guide');
      assert.deepEqual(errors,[],'JavaScript runtime errors');
      console.log('PASS viewport '+viewport.width+'x'+viewport.height+': CTA in viewport; no overflow or header overlap; guided 2 steps and 4 routes; Escape; reduced motion; JS clean');
      await context.close();
    }
    // A remote, no-watermark still is a preview-only fallback, not accepted final Safari film.
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    const page=await context.newPage();
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#safariStill').evaluate(img=>img.decode().catch(()=>{}));
    const info=await page.locator('#safariStill').evaluate(img=>({complete:img.complete,width:img.naturalWidth,height:img.naturalHeight,src:img.currentSrc}));
    assert.ok(info.complete&&info.width>=800&&info.height>=350,'Still asset failed to load: '+JSON.stringify(info));
    await page.screenshot({path:path.join(folder,'safari-clean-still-desktop.png'),fullPage:true});
    console.log('PASS clean still fetched and decoded: '+JSON.stringify(info));
    await context.close();
  }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1);});
