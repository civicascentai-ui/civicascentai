const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
for (const name of ['voice', 'images', 'translate', 'plan']) {
  const elements = new Map(); let plays = 0; const timers = []; const events = {};
  const document = {documentElement: {lang: 'en'}, getElementById(id) {
    if (!elements.has(id)) elements.set(id, {textContent: '', currentTime: 0,
      pause() {}, addEventListener() {}, play() {plays++; return Promise.resolve();}});
    return elements.get(id);
  }};
  const context = {document, window: {addEventListener(type, fn) {events[type]=fn;}}, setTimeout(fn) {timers.push(fn);}};
  vm.createContext(context);
  for (const script of fs.readFileSync(path.join(__dirname, '../..', name + '.html'), 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (script[1].trim()) vm.runInContext(script[1], context);
  }
  const flush = () => {while(timers.length) timers.shift()();};
  if(events.load) events.load(); flush();
  assert.equal(plays, 0);
  document.getElementById('lang').onclick(); flush();
  assert.equal(document.documentElement.lang, 'es');
  assert.equal(plays, 0);
  document.getElementById('lang').onclick(); flush();
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(plays, 0);
  console.log('PASS ' + name + ': EN→ES→EN document language; no audio triggered');
}
