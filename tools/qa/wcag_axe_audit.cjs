const fs=require('fs');
const path=require('path');
const {chromium}=require('playwright');
const axe=require.resolve('axe-core/axe.min.js');
const urls=['/','/journey-learn.html','/journey-try.html','/journey-help.html','/journey-continue.html','/free-ai-starter.html','/register.html','/veterans.html','/practice-sandbox.html','/es.html'];
(async()=>{
  fs.mkdirSync('wcag-evidence',{recursive:true});
  const browser=await chromium.launch({headless:true});
  const report=[];
  for(const route of urls){
    for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
      const page=await browser.newPage({viewport,reducedMotion:'reduce'});
      const entry={route,viewport:viewport.width};
      try{
        const response=await page.goto('https://civicascentai.com'+route,{waitUntil:'domcontentloaded',timeout:25000});
        entry.status=response?.status();
        await page.addScriptTag({path:axe});
        const results=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
        entry.violations=results.violations.map(v=>({id:v.id,impact:v.impact,description:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,15)}));
        entry.incomplete=results.incomplete.length;
        entry.pass=entry.status===200&&entry.violations.length===0;
      }catch(e){entry.pass=false;entry.error=String(e).slice(0,300)}
      report.push(entry);await page.close();
    }
  }
  await browser.close();
  const allPass=report.every(r=>r.pass);
  fs.writeFileSync(path.join('wcag-evidence','results.json'),JSON.stringify({target:'WCAG 2.2 AA',allPass,results:report,limitations:['Automated axe checks only; manual testing and independent QC required','No production changes, payments, or form submissions']},null,2));
  for(const r of report)console.log(r.route,r.viewport,r.pass?'AUTOMATED PASS':'AUTOMATED FAIL',r.violations?.map(v=>v.id).join(',')||r.error||'');
  if(!allPass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
