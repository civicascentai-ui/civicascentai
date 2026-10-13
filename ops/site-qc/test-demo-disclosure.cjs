const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../..', 'model-08-operational-station.html'), 'utf8');
const route = html.match(/<a class="route" href="living-ai-lab\.html">([\s\S]*?)<\/a>/);
assert.ok(route, 'The existing experience destination remains reachable');
assert.match(route[1], /<strong class="en">Explore AI Demonstrations<\/strong>/, 'English entry identifies demonstrations');
assert.match(route[1], /<strong class="es" hidden>Explora Demostraciones de IA<\/strong>/, 'Spanish entry identifies demonstrations');
const leads = [...html.matchAll(/<p class="lead (en|es)"(?: hidden)?>([\s\S]*?)<\/p>/g)];
assert.equal(leads.length, 2, 'Both languages receive a visible-on-selection disclosure');
assert.match(leads.find(m => m[1] === 'en')[2], /guided demonstrations.*fixed examples.*prerecorded narration/i, 'English explains the actual demo behavior');
assert.match(leads.find(m => m[1] === 'es')[2], /demostraciones guiadas.*ejemplos fijos.*narración pregrabada/i, 'Spanish explains the actual demo behavior');
assert.doesNotMatch(html, /LIVE EXPERIENCE|EXPERIENCIA EN VIVO|Experience AI Live|Experimenta IA en Vivo|working AI experience|experiencia de IA funcional|>LIVE</i, 'No station label promises a live provider experience');
assert.match(html, /<span class="live-dot"><span class="en">DEMOS<\/span><span class="es" hidden>DEMOSTRACIONES<\/span><\/span>/, 'Board status describes demos in both languages');
for (const destination of ['living-ai-lab.html', 'ai-lab.html', 'plan.html']) {
  assert.match(html, new RegExp(`href="${destination.replaceAll('.', '\\.')}"`), 'Existing route preserved');
}
console.log('PASS: station labels and bilingual disclosures accurately describe guided demos; existing destinations preserved.');
for (const file of ['voice.html', 'images.html', 'translate.html', 'plan.html']) {
  const page = fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
  assert.match(page, /AI DEMONSTRATION/);
  assert.doesNotMatch(page, /LIVE AI EXAMPLE/);
}
