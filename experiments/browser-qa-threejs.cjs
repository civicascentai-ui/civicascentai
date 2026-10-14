// Automated Chromium screenshots and runtime QA. No site publishing, no paid APIs.
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const root = path.resolve(process.cwd());
const server = http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  } catch (_) {
    res.writeHead(400).end("Bad path");
    return;
  }
  const file = path.resolve(root, "." + (p === "/" ? "/index.html" : p));
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) return void res.writeHead(404).end("Not found");
    const ext = path.extname(file);
    const mime = { ".html": "text/html", ".js": "text/javascript", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".css": "text/css", ".png": "image/png", ".mp4": "video/mp4" }[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": mime });
    res.end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(8765, "127.0.0.1", resolve));
  fs.mkdirSync("screenshots", { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl"]
  });
  const url = "http://127.0.0.1:8765/";
  try {
    const desktop = await browser.newPage({ viewport: { width: 1365, height: 800 }, deviceScaleFactor: 1 });
    await desktop.goto(url, { waitUntil: "domcontentloaded" });
    assert.equal(await desktop.locator(".world canvas.codi3d-atmosphere").count(), 0, "No default 3D load");
    assert(await desktop.locator("h1").isVisible(), "Main heading visible");
    assert(await desktop.locator(".topnav").isVisible(), "Original navigation visible");
    await desktop.screenshot({ path: "screenshots/original-desktop.png" });

    const probe = await browser.newPage({ viewport: { width: 1365, height: 800 }, deviceScaleFactor: 1 });
    await probe.goto(url + "?codi3d=1", { waitUntil: "domcontentloaded" });
    await probe.waitForFunction(() => ["running", "fallback"].includes(document.querySelector(".world")?.dataset.codi3d), { timeout: 18000 });
    const state = await probe.locator(".world").getAttribute("data-codi3d");
    console.log("Desktop WebGL status:", state);
    assert.equal(state, "running", "Actual Three.js WebGL runtime must work for visual signoff");
    assert.equal(await probe.locator("canvas.codi3d-atmosphere").count(), 1);
    assert(await probe.locator("h1").isVisible());
    await probe.screenshot({ path: "screenshots/threejs-desktop.png" });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await mobile.goto(url + "?codi3d=1", { waitUntil: "domcontentloaded" });
    await mobile.waitForFunction(() => ["running", "fallback"].includes(document.querySelector(".world")?.dataset.codi3d), { timeout: 18000 });
    assert.equal(await mobile.locator(".world").getAttribute("data-codi3d"), "running");
    assert(await mobile.locator("h1").isVisible());
    assert(await mobile.locator("a.primary").isVisible(), "Primary entrance CTA must remain visible");
    await mobile.screenshot({ path: "screenshots/threejs-mobile.png", fullPage: true });

    const reduce = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await reduce.goto(url + "?codi3d=1", { waitUntil: "domcontentloaded" });
    await reduce.waitForFunction(() => Boolean(document.querySelector(".world")?.dataset.codi3d), { timeout: 5000 });
    assert.equal(await reduce.locator(".world").getAttribute("data-codi3d"), "reduced-motion");
    assert.equal(await reduce.locator("canvas.codi3d-atmosphere").count(), 0);
    await reduce.screenshot({ path: "screenshots/reduced-motion.png", fullPage: true });

    const offline = await browser.newPage({ viewport: { width: 900, height: 700 } });
    await offline.route("https://cdn.jsdelivr.net/**", route => route.abort());
    await offline.goto(url + "?codi3d=1", { waitUntil: "domcontentloaded" });
    await offline.waitForFunction(() => document.querySelector(".world")?.dataset.codi3d === "fallback", { timeout: 10000 });
    assert.equal(await offline.locator("canvas.codi3d-atmosphere").count(), 0);
    assert(await offline.locator("h1").isVisible());
    console.log("PASS: desktop, mobile, reduced motion, CDN fallback, unchanged homepage.");
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error("BROWSER QA FAILED:", err.message);
  process.exitCode = 1;
}).finally(() => server.close());