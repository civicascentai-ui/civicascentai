const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

(async () => {
  for (const page of ['voice.html', 'translate.html', 'images.html', 'plan.html']) {
    const html = fs.readFileSync(path.join(__dirname, '../..', page), 'utf8');
    assert.match(html, /id="status"[^>]*role="status"[^>]*aria-live="polite"/, `${page}: fallback has an accessible announcement`);
    const elements = new Map(), timers = [], events = {}, calls = {audioEn: 0, audioEs: 0};
    const element = id => {
      if (!elements.has(id)) elements.set(id, {
        textContent: id === 'copy' ? (html.match(/id="copy"[^>]*>([^<]+)/) || [])[1] || '' : '', currentTime: 0, error: null, listeners: {},
        pause() {}, addEventListener(event, fn) {this.listeners[event] = fn;},
        play() {calls[id]++; return Promise.reject(new Error('Unavailable media fixture'));},
      });
      return elements.get(id);
    };
    const context = {
      document: {getElementById: element, documentElement: {}},
      window: {addEventListener: (event, fn) => {events[event] = fn;}},
      setTimeout: fn => timers.push(fn),
    };
    vm.createContext(context);
    for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (script[1].trim()) vm.runInContext(script[1], context);
    }
    if (events.load) events.load();
    while (timers.length) timers.shift()();
    const guideEn = element('copy').textContent;
    assert.ok(guideEn.length > 20, `${page}: readable guide retained`);
    assert.deepEqual(calls, {audioEn: 0, audioEs: 0}, `${page}: no loading playback`);
    element('play').onclick();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element('status').textContent, 'Audio is unavailable. Read the guide text on this page.');
    assert.equal(element('copy').textContent, guideEn, `${page}: audio rejection does not remove guide`);
    const en = element('audioEn'), es = element('audioEs');
    assert.equal(typeof en.listeners.error, 'function');
    assert.equal(typeof es.listeners.error, 'function');
    en.error = {code: 4}; en.listeners.error();
    assert.match(element('status').textContent, /^Audio is unavailable/);
    element('lang').onclick();
    assert.deepEqual(calls, {audioEn: 1, audioEs: 0}, `${page}: language selection stays silent`);
    const guideEs = element('copy').textContent;
    assert.ok(guideEs.length > 20);
    element('status').textContent = 'Spanish unaffected';
    en.listeners.error();
    assert.equal(element('status').textContent, 'Spanish unaffected', `${page}: inactive English media error cannot overwrite Spanish status`);
    element('play').onclick();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element('status').textContent, 'El audio no está disponible. Lee el texto de la guía en esta página.');
    assert.equal(element('copy').textContent, guideEs);
    es.error = {code: 4}; es.listeners.error();
    assert.match(element('status').textContent, /^El audio no está disponible/);
    element('lang').onclick();
    assert.match(element('status').textContent, /^Audio is unavailable/, `${page}: revisiting failed language reports fallback`);
    // Browser pause() can abort a pending play promise after Stop or language
    // changes. A stale settlement must never replace the newer user state.
    en.error = null; es.error = null;
    for (const action of ['stop', 'language']) {
      for (const outcome of ['resolve', 'reject']) {
        let settle;
        en.play = () => {calls.audioEn++; return new Promise((resolve, reject) => {
          settle = outcome === 'resolve' ? resolve : () => reject(Object.assign(new Error('Playback interrupted'), {name: 'AbortError'}));
        });};
        element('play').onclick();
        if (action === 'stop') element('stop').onclick();
        else {element('lang').onclick(); element('lang').onclick();}
        const statusAfterAction = element('status').textContent;
        assert.equal(statusAfterAction, action === 'stop' ? 'Stopped' : 'Voice guide ready');
        settle();
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(element('status').textContent, statusAfterAction, `${page}: delayed ${outcome} after ${action} cannot overwrite the latest state`);
      }
    }
    console.log(`PASS: ${page} announces bilingual fallback and ignores stale playback settlements after Stop/language changes.`);
  }
})().catch(error => {console.error(error.message); process.exitCode = 1;});
