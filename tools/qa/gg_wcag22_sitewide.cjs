#!/usr/bin/env node
"use strict";
/**
 * GG evidence-grade sitewide WCAG 2.2 AA automated local audit.
 * Read-only localhost Chromium; no form submissions, purchase testing or APIs.
 * Model execution: NONE. Human assistive-tech verification remains necessary.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const axeScript = require.resolve("axe-core/axe.min.js");
const GROUPS = Object.freeze({
  primary: [
    "/index.html","/journey-learn.html","/journey-try.html",
    "/journey-help.html","/journey-continue.html","/programs.html",
    "/course.html","/free-ai-starter.html","/register.html","/es.html",
    "/registro.html","/curso-es.html","/veterans.html","/veteran-career-skills.html",
    "/clear-start.html","/practice-sandbox.html","/assistive-tools-guide.html"
  ],
  support: [
    "/consultation.html","/learner-interest.html","/learner-questions.html",
    "/mentor.html","/level2.html","/living-ai-lab.html","/lab.html",
    "/ai-lab.html","/village.html","/plan.html","/capabilities.html",
    "/voice.html","/translate.html","/analytics.html","/images.html",
    "/registered.html","/registrado.html","/thank-you.html","/404.html"
  ]
});
const group = process.argv[2];
if (!Object.hasOwn(GROUPS, group)) throw Error("Group must be primary or support");
const base = process.env.GG_WCAG_BASE || "http://127.0.0.1:8766";
if (!/^http:\/\/127\.0\.0\.1:[0-9]{2,5}$/.test(base)) throw Error("Local-only audit guard denied remote URL");
const viewports = [390, 1280];
const outDir = path.join("wcag-evidence", "gg-sitewide", group);
const tags = ["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"];
const records = [];
(async()=>{
  fs.mkdirSync(outDir, {recursive:true});
  const browser = await chromium.launch({headless:true});
  try {
    for(const route of GROUPS[group]) {
      for(const width of viewports) {
        const page = await browser.newPage({viewport:{width,height:width<600?844:900}, reducedMotion:"reduce"});
        const entry = {route, viewport:width, local_only:true, model_execution:"NEVER_INVOKED"};
        try {
          const resp = await page.goto(base+route, {waitUntil:"domcontentloaded",timeout:14000});
          await page.waitForTimeout(90);
          entry.http_status = resp?.status() ?? 0;
          entry.final_path = new URL(page.url()).pathname;
          const issues = await page.evaluate(()=>{
            const body = document.documentElement;
            return {
              lang:body.getAttribute("lang"),
              title:document.title.trim(),
              h1_count:document.querySelectorAll("h1").length,
              main_count:document.querySelectorAll("main").length,
              skip_link:!!document.querySelector('a[href="#main"],a[href="#main-content"],a[href="#content"],a[href="#sample"]'),
              horizontal_overflow:body.scrollWidth > innerWidth + 2,
              missing_alt:[...document.querySelectorAll("img")].filter(img=>!img.hasAttribute("alt")).length
            };
          });
          entry.indicators = issues;
          await page.addScriptTag({path:axeScript});
          const a=await page.evaluate(async tags=>
            window.axe.run(document,{runOnly:{type:"tag",values:tags}}), tags);
          entry.violations=a.violations.map(v=>({
            id:v.id, impact:v.impact, help:v.help, wcag_tags:v.tags.filter(t=>t.startsWith("wcag")),
            elements:v.nodes.slice(0,8).map(n=>({selector:n.target,summary:n.failureSummary?.slice(0,320)})),
            count:v.nodes.length
          }));
          entry.incomplete=a.incomplete.map(v=>({id:v.id,count:v.nodes.length}));
          entry.automated_pass = entry.http_status===200 &&
            entry.violations.length===0 &&
            !issues.horizontal_overflow && issues.main_count===1;
          if(!entry.automated_pass){
            await page.screenshot({path:path.join(outDir,group+"-"+route.replace(/[^A-Za-z0-9]/g,"-")+"-"+width+".png"),fullPage:true}).catch(()=>{});
          }
        }catch(error){
          entry.automated_pass=false;
          entry.error=String(error).slice(0,250);
        }finally{
          records.push(entry);
          console.log(group,route,width,entry.automated_pass?"AUTOMATED PASS":"AUTOMATED FAIL",
            entry.error||entry.violations?.map(v=>v.id+":"+v.count).join(",")||"other");
          await page.close();
        }
      }
    }
  }finally{await browser.close();}
  const report={
    audit:"GG independent WCAG 2.2 AA automated sitewide examination",
    source:"isolated GitHub branch localhost only",group,
    total:records.length,passed:records.filter(x=>x.automated_pass).length,
    failed:records.filter(x=>!x.automated_pass).length, results:records,
    outcome:records.every(x=>x.automated_pass)?"AUTOMATED_PASS":"AUTOMATED_DEFECTS",
    conformance:"NOT_DETERMINED",
    human_test_requirements:[
      "Manual keyboard navigation and logical focus order",
      "NVDA with desktop browsers, VoiceOver and TalkBack",
      "Actual signup and form error states without using customer information",
      "200/400 percent zoom, text spacing, media alternatives and cognitive accessibility",
      "Independent learner usability and FRIDAY/ZEBRA acceptance"
    ]
  };
  fs.writeFileSync(path.join(outDir,"results.json"),JSON.stringify(report,null,2));
  console.log("GG SITEWIDE",group,report.passed+"/"+report.total,"automated scans passed; compliance NOT determined");
  if(report.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
