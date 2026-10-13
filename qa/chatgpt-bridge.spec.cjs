const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const url = pathToFileURL(path.resolve("living-ai-lab.html")).href;
  fs.mkdirSync("qa-artifacts", { recursive: true });
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await context.route(/^https:\/\/chatgpt\.com\//, route => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Test external handoff</title>" }));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", err => errors.push(err.message));
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const card = page.locator(".try-chatgpt");
    await card.scrollIntoViewIfNeeded();
    assert.equal(await card.isVisible(), true, "ChatGPT card missing at " + width);
    assert.equal(await page.locator(".chatgpt-try-link").count(), 4, "Four links required");
    assert.equal(await page.locator(".try-chatgpt-disclosure").isVisible(), true, "External-service disclosure absent");
    const links = await page.locator(".chatgpt-try-link").evaluateAll(els => els.map(el => ({ href: el.href, target: el.target, rel: el.rel, text: el.textContent.trim() })));
    const qs = new Set();
    for (const link of links) {
      const u = new URL(link.href);
      assert.equal(u.origin, "https://chatgpt.com");
      assert.equal(link.target, "_blank");
      assert(link.rel.includes("noopener") && link.rel.includes("noreferrer"));
      assert(u.searchParams.get("q").length > 25);
      qs.add(u.searchParams.get("q"));
    }
    assert.equal(qs.size, 4, "Prompts must be distinct");
    assert((await page.evaluate(() => document.documentElement.scrollWidth)) <= width + 2, "Horizontal overflow at " + width);
    await page.locator("#lang").click();
    assert.match(await card.locator("h2").textContent(), /Da el siguiente paso/);
    assert.match(await page.locator(".chatgpt-try-link").first().textContent(), /CREAR/);
    await page.locator("#lang").click();
    assert.match(await card.locator("h2").textContent(), /Take the next step/);
    const popupPromise = page.waitForEvent("popup");
    await page.locator(".chatgpt-try-link").first().click();
    const popup = await popupPromise;
    assert(new URL(popup.url()).searchParams.get("q").length > 25, "Click did not pass the prompt");
    await popup.close();
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: "qa-artifacts/bridge-" + width + ".png", fullPage: true });
    assert.deepEqual(errors, [], "Browser Javascript errors at " + width);
    console.log("PASS width=" + width + " responsive navigation prompt bilingual disclosure and click-through");
    await context.close();
  }
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
