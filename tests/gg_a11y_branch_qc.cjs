/* GG/FRIDAY offline browser accessibility QC on branch-local pages.
 * No clicks, submissions, logins, purchase or vendor API calls.
 */
const fs = require('fs');
const { chromium } = require('playwright');
const axeScript = require.resolve('axe-core/axe.min.js');
const widths = [320, 390, 768, 1280];
const routes = ['/register.html', '/es.html', '/free-ai-starter.html'];
const findings = [];

(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    for(const route of routes) {
      for(const width of widths) {
        const page = await browser.newPage({ viewport: {width,height:850}, reducedMotion:'reduce' });
        const item = {route,width,pass:false};
        try {
          const response = await page.goto('http://127.0.0.1:8765'+route,{waitUntil:'domcontentloaded',timeout:12000});
          const status = response && response.status();
          await page.addScriptTag({path:axeScript});
          const violations = await page.evaluate(async () => {
            const result = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
            return result.violations.map(v => ({
              id:v.id,impact:v.impact,description:v.help,
              nodes:v.nodes.map(n=>({selector:n.target,reason:n.failureSummary})).slice(0,15)
            }));
          });
          const semantics=await page.evaluate(() => ({
            h1:document.querySelectorAll('h1').length,
            main:document.querySelectorAll('main').length,
            language:document.documentElement.lang,
            overflow:document.documentElement.scrollWidth>innerWidth+2,
            total_links:document.querySelectorAll('a[href]').length
          }));
          item.status=status;
          item.violations=violations;
          item.semantics=semantics;
          item.pass=status===200&&violations.length===0&&semantics.h1===1&&semantics.main===1&&!!semantics.language&&!semantics.overflow;
        } catch(e){item.error=String(e).slice(0,320)}
        findings.push(item);
        console.log(route,width,item.pass?'PASS':'FAIL',item.error||item.violations?.map(x=>x.id).join(','));
        if(!item.pass && item.violations?.length) {
          for (const violation of item.violations) {
            for (const node of violation.nodes || []) {
              console.log('A11Y NODE', route, width, violation.id,
                          JSON.stringify(node.selector), String(node.reason || '').replace(/\s+/g,' ').slice(0,700));
            }
          }
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.mkdirSync('gg-repair-evidence',{recursive:true});
  fs.writeFileSync('gg-repair-evidence/a11y-branch.json',JSON.stringify({
    verified_on:'isolated branch localhost; no public deployments',
    test_tags:['WCAG 2 A','WCAG 2 AA','WCAG 2.1 A','WCAG 2.1 AA','WCAG 2.2 AA'],
    limitation:'Automated axe and structural checks are not human WCAG certification',
    pass:findings.every(f=>f.pass),
    tests:findings
  },null,2));
  if(!findings.every(f=>f.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});