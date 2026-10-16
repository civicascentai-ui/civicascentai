/* CivicAscent WCAG 2.2 AA axe-core. Public site by default; optional local PR verification.
   No form submissions, external model APIs, purchases, or mutation of the live site. */
const fs=require('fs');
const path=require('path');
const {chromium}=require('playwright');
const axe=require.resolve('axe-core/axe.min.js');
const routes=['/','/journey-learn.html','/journey-try.html','/journey-help.html','/journey-continue.html','/free-ai-starter.html','/register.html','/veterans.html','/practice-sandbox.html','/es.html'];
const base=(process.env.WCAG_AUDIT_BASE_URL||'https://civicascentai.com').replace(/\/+$/,'');
const widths=(process.env.WCAG_AUDIT_WIDTHS||'390,1280').split(',').map(Number);
const output=process.env.WCAG_AUDIT_OUTPUT||'wcag-evidence';
if(!/^https?:\/\/[a-z0-9.:-]+$/i.test(base))throw Error('Invalid base URL');
if(widths.some(w=>!Number.isInteger(w)||w<320||w>1920))throw Error('Invalid audit width');
const requestedLocal=Boolean(process.env.WCAG_AUDIT_LOCAL);
if(requestedLocal && !/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw Error('Isolated PR check must use 127.0.0.1');
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const report=[];
  try{
    for(const route of routes){
      for(const width of widths){
        const page=await browser.newPage({viewport:{width,height:width<=390?844:900},reducedMotion:'reduce'});
        const entry={route,viewport:width,source:requestedLocal?'LOCAL_REVIEW_BRANCH':'PUBLIC_LIVE'};
        try{
          const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:30000});
          entry.status=response?.status();
          entry.finalUrl=page.url();
          await page.addScriptTag({path:axe});
          const results=await page.evaluate(async tags=>window.axe.run(document,{runOnly:{type:'tag',values:tags}}),tags);
          entry.violations=results.violations.map(v=>({id:v.id,impact:v.impact,description:v.help,nodes:v.nodes.slice(0,20).map(n=>({target:n.target,summary:n.failureSummary,html:n.html.slice(0,320)}))}));
          entry.incomplete=results.incomplete.map(v=>({id:v.id,count:v.nodes.length}));
          entry.warning=await page.evaluate(()=>({
            headings:Array.from(document.querySelectorAll('h1')).map(e=>e.textContent.trim().slice(0,100)),
            landmarks:document.querySelectorAll('main').length,
            missingAlt:document.querySelectorAll('img:not([alt])').length,
            horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2
          }));
          entry.pass=entry.status===200 && entry.violations.length===0 && !entry.warning.horizontalOverflow;
        }catch(e){entry.pass=false;entry.error=String(e).slice(0,500);}
        report.push(entry);
        await page.close();
      }
    }
  } finally {await browser.close();}
  const allPass=report.every(r=>r.pass);
  const summary={target:'WCAG 2.2 AA',base:requestedLocal?'http://127.0.0.1 (isolated)':base,allPass,
    scans:report.length,passed:report.filter(r=>r.pass).length,failed:report.filter(r=>!r.pass).length,
    results:report,limitations:['Automated axe checks do not certify WCAG conformance','Incomplete axe results and manual WCAG tests must be independently reviewed','No form submits, model calls, payments or production edits']};
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(summary,null,2));
  for(const item of report){
    console.log(item.route,item.viewport,item.pass?'AUTOMATED PASS':'AUTOMATED FAIL',
      item.violations?.map(v=>v.id+'='+v.nodes.length).join(',')||item.error||'',
      item.warning?.horizontalOverflow?'HORIZONTAL_OVERFLOW':'');
  }
  console.log('RESULT:',summary.passed+'/'+summary.scans,'scans passed; manual WCAG still required');
  if(!allPass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
