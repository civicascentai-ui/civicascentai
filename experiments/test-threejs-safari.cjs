// Zero-dependency, read-only regression test for the optional 3D Safari experiment.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const home = fs.readFileSync("index.html", "utf8");
const code = fs.readFileSync("experiments/safari-threejs-atmosphere.js", "utf8");
const loader = `<script type="module">
if (new URLSearchParams(window.location.search).get("codi3d") === "1") {
  import("./experiments/safari-threejs-atmosphere.js");
}
</script>
`;
let baseline;
try {
  baseline = execFileSync("git", ["show", "origin/main:index.html"], { encoding: "utf8" });
} catch (e) {
  throw new Error("Cannot compare against the current main baseline. Refuse to certify.");
}
assert.equal(home.replace(loader, ""), baseline, "Homepage changed beyond the opt-in script: STOP");
assert.equal(home.split(loader).length, 2, "Feature gate must appear exactly once");
new vm.Script(code);
for (const [key, pattern] of Object.entries({
  trueThreeJsImport: /three@0\.165\.0\/build\/three\.module\.js/,
  reducedMotion: /prefers-reduced-motion: reduce/,
  saveData: /navigator\.connection\.saveData/,
  pointerSafety: /pointer-events:none/,
  noPublish: /codi3d = "running"/,
  disposal: /renderer\.dispose\(\)/,
  cleanup: /geometry\.dispose\(\)/,
  fallback: /fallback\("fallback"\)/,
  visibilityPause: /visibilitychange/,
  throttledRendering: /now - last >= 33/,
})) {
  assert(pattern.test(code), `Missing ${key} invariant`);
}
assert(home.includes('class="topnav"'), "Original site navigation missing");
assert(home.includes('class="intro"'), "Original homepage introduction missing");
assert(!home.includes('react-dom'), "Unexpected React replatforming");
console.log("PASS: 14 static compatibility assertions. Browser/WebGL visual QA remains outstanding.");