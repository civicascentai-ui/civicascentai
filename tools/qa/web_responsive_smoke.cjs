// Local offline browser QA, no payment APIs, production writes, or external websites.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname,'../..');
const artifacts = path.join(root,'qa-artifacts');
const views = [
  {width:320,height:700},{width:375,height:812},
  {width:390,height:844},{width:430,height:932},
  {width:768,height:1024},{width:1440,height:900}
];
const url = (file) => pathToFileURL(path.join(root,file)).href;
fs.mkdirSync(artifacts,{recursive:true});
async function checkPage(browser,file,viewport) {
  const context = await browser.newContext({viewport,reducedMotion:'reduce'});
  const page = await context.newPage();
  const errs=[];
  page.on('pageerror', err => errs.push(err.message));
  try {
    await page.goto(url(file),{waitUntil:'domcontentloaded',timeout:15000});
    await page.locator('h1').first().waitFor({state:'attached'});
    const m = await page.evaluate(() => ({
      width: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      heading: document.querySelector('h1')?.textContent?.trim(),
    }));
    assert.ok(m.documentWidth <= m.width + 2,
      `${file} ${viewport.width}px overflow: ${JSON.stringify(m)}`);
    assert.ok(m.heading, `${file}: missing heading`);
    if(file==='index.html') {
      const link=page.getByRole('link',{name:'Free AI Starter Guide'});
      assert.equal(await link.count(),1,'English guide CTA missing or duplicated');
      assert.equal(await link.getAttribute('href'),'free-ai-starter.html');
      // Motion-sensitive visitors must not see the six-second flash triggered on load.
      assert.equal(await page.locator('#flash').evaluate(
        el=>getComputedStyle(el).display),'none','Reduced-motion flash overlay visible');
    }
    if(file==='consultation.html') {
      assert.ok(await page.locator('a[href^="mailto:civicascentai@gmail.com"]').count()>=3,
        'Consultation contact links inconsistent');
    }
    if(file==='404.html') {
      assert.ok(await page.getByRole('link',{name:'Return home'}).isVisible());
      assert.ok(await page.getByRole('link',{name:'Free AI starter guide'}).isVisible());
    }
    await page.screenshot({path:path.join(artifacts,
      'web-'+file.replace('.html','')+'-'+viewport.width+'.png'),fullPage:true});
    assert.deepEqual(errs,[],`${file}: JS errors ${JSON.stringify(errs)}`);
    console.log('PASS',file,`${viewport.width}x${viewport.height}`,m.documentWidth,'no overflow, heading, links');
  } finally { await context.close(); }
}
async function main(){
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  try{
    for(const viewport of views)for(const file of ['index.html','consultation.html','404.html']){
      await checkPage(browser,file,viewport);
    }
    const ctx=await browser.newContext({viewport:views[2],reducedMotion:'reduce'});
    const page=await ctx.newPage();
    await page.goto(url('index.html'),{waitUntil:'domcontentloaded'});
    await page.getByRole('link',{name:'Free AI Starter Guide'}).click();
    assert.ok(page.url().endsWith('/free-ai-starter.html'),'CTA did not navigate to real guide');
    console.log('PASS complete journey: homepage -> free guide');
    await ctx.close();
  } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
