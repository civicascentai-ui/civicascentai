const { chromium } = require('playwright');
const fs = require('fs');
const pages = ['index.html','village.html','living-ai-lab.html'];
const viewports = [
  {name:'mobile-360', width:360, height:800},
  {name:'mobile-412', width:412, height:915},
  {name:'mobile-430', width:430, height:932}
];

(async()=>{
  const browser = await chromium.launch({headless:true});
  let failures = [];
  fs.mkdirSync('qa/mobile-screenshots',{recursive:true});

  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport:{width:vp.width,height:vp.height},
      deviceScaleFactor:2,
      isMobile:true,
      hasTouch:true,
      reducedMotion:'reduce'
    });
    const page = await ctx.newPage();

    page.on('console', msg => {
      if (msg.type()==='error') failures.push(`${vp.name}: console error: ${msg.text()}`);
    });
    page.on('pageerror', err => failures.push(`${vp.name}: page error: ${err.message}`));

    for (const path of pages) {
      const url = 'http://127.0.0.1:8080/' + path;
      const resp = await page.goto(url,{waitUntil:'networkidle'});
      if (!resp || !resp.ok()) {
        failures.push(`${vp.name} ${path}: HTTP failure`);
        continue;
      }

      await page.waitForTimeout(500);

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const horizontalOverflow = Math.max(root.scrollWidth, body.scrollWidth) - window.innerWidth;

        const interactive = [...document.querySelectorAll('a,button,input,select,textarea,[role="button"]')]
          .filter(el => {
            const s=getComputedStyle(el);
            const r=el.getBoundingClientRect();
            return s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0;
          })
          .map(el => {
            const r=el.getBoundingClientRect();
            return {tag:el.tagName,text:(el.innerText||el.getAttribute('aria-label')||'').trim().slice(0,80),w:r.width,h:r.height};
          });

        const smallTargets = interactive.filter(x => x.w < 44 || x.h < 44);
        const headings = [...document.querySelectorAll('h1')].filter(el => {
          const r=el.getBoundingClientRect(); return r.width>0 && r.height>0;
        }).length;
        return {horizontalOverflow, smallTargets, headings, interactiveCount:interactive.length};
      });

      if (metrics.horizontalOverflow > 2)
        failures.push(`${vp.name} ${path}: horizontal overflow ${metrics.horizontalOverflow}px`);
      if (metrics.headings < 1)
        failures.push(`${vp.name} ${path}: no visible H1`);

      // Only hard-fail touch targets that look like primary controls/CTAs.
      const seriousSmall = metrics.smallTargets.filter(x =>
        /button|explore|enter|lab|replay|privacy|terms|accessibility|home|learn|start|program|contact/i.test(x.text)
      );
      for (const x of seriousSmall.slice(0,10))
        failures.push(`${vp.name} ${path}: touch target too small ${x.tag} "${x.text}" ${Math.round(x.w)}x${Math.round(x.h)}`);

      await page.screenshot({
        path:`qa/mobile-screenshots/${vp.name}-${path.replace('.html','')}.png`,
        fullPage:true
      });
    }
    await ctx.close();
  }

  await browser.close();
  if (failures.length) {
    console.error('MOBILE QA FAILURES');
    failures.forEach(f=>console.error(' - '+f));
    process.exit(1);
  }
  console.log('MOBILE QA PASSED: 3 mobile widths x 3 critical pages, reduced motion enabled.');
})();