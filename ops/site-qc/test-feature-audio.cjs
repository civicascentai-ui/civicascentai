const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const page of ['voice.html', 'images.html', 'translate.html', 'plan.html']) {
  const html = fs.readFileSync(path.join(__dirname, '../..', page), 'utf8');
  const elements = new Map();
  const timers = [];
  const events = {};
  const plays = { audioEn: 0, audioEs: 0 };
  const pauses = { audioEn: 0, audioEs: 0 };
  const getElement = id => {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', currentTime: 0,
      pause() { pauses[id]++; }, addEventListener() {},
      play() { plays[id]++; return Promise.resolve(); },
    });
    return elements.get(id);
  };
  const context = {
    document: { getElementById: getElement },
    window: { addEventListener: (event, handler) => { events[event] = handler; } },
    setTimeout: handler => { timers.push(handler); },
  };
  vm.createContext(context);
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (script[1].trim()) vm.runInContext(script[1], context);
  }
  const flushTimers = () => { while (timers.length) timers.shift()(); };
  if (events.load) events.load();
  flushTimers();
  assert.deepEqual(plays, { audioEn: 0, audioEs: 0 }, `${page}: loading must be silent`);
  getElement('lang').onclick();
  flushTimers();
  assert.deepEqual(plays, { audioEn: 0, audioEs: 0 }, `${page}: language change must be silent`);
  getElement('play').onclick();
  assert.deepEqual(plays, { audioEn: 0, audioEs: 1 }, `${page}: Play uses selected Spanish audio once`);
  getElement('audioEn').currentTime = 17;
  getElement('audioEs').currentTime = 9;
  const priorPauses = { ...pauses };
  getElement('stop').onclick();
  assert.equal(getElement('audioEn').currentTime, 0);
  assert.equal(getElement('audioEs').currentTime, 0);
  assert.equal(pauses.audioEn, priorPauses.audioEn + 1);
  assert.equal(pauses.audioEs, priorPauses.audioEs + 1);
  console.log(`PASS: ${page} stays silent until Play; language selection and Stop work.`);
}
