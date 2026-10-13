// Five-scene connected journey regression: real browsers, no checkout/account side effects.
const {chromium}=require('playwright');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),folder=path.join(root,'qa-artifacts');
fs.mkdirSync(folder,{recursive:true});
const scenes=[
 [1,'index.html'],[2,'free-ai-starter.html'],[3,'mentor.html'],
 [4,'course.html'],[5,'living-ai-lab.html']
];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 try{
  for(const [scene,file] of scenes){
   for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:width<500?844:900},reducedMotion:'reduce'});
    await page.goto(pathToFileURL(path.join(root,file)).href,{waitUntil:'domcontentloaded'});
    const result=await page.evaluate(()=>{
     const h=[...document.querySelectorAll('h1')].find(x=>x.getClientRects().length);
     return {h1:h?.textContent?.trim()||null,scroll:document.documentElement.scrollWidth,width:innerWidth,
      links:[...document.querySelectorAll('a[href]')].filter(x=>!x.getAttribute('href').startsWith('mailto:')).length};
    });
    assert.ok(result.h1,'Scene '+scene+' missing H1 at '+width);
    assert.ok(result.links>=1,'Scene '+scene+' missing navigation');
    assert.ok(result.scroll<=result.width+2,
       'Scene '+scene+' horizontal overflow at '+width+': '+JSON.stringify(result));
    await page.screenshot({path:path.join(folder,'safari-journey-scene'+scene+'-'+width+'.png'),fullPage:true});
    console.log('PASS five-scene routing: '+scene+' '+file+' '+width+'px, h1 and navigation visible, no horizontal overflow');
    await page.close();
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
