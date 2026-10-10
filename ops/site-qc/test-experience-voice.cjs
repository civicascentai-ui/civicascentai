const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../assets/experience.js'), 'utf8');

function load(supported) {
  const handlers = {};
  let cancellations = 0;
  const context = {
    URLSearchParams,
    location: { search: '' },
    setTimeout() {},
    document: {
      body: { dataset: { scene: 'voice' }, classList: { contains: () => false } },
      documentElement: {},
      querySelectorAll: () => [],
      getElementById: id => ['playGuide', 'stopGuide'].includes(id)
        ? { addEventListener: (event, handler) => { handlers[id] = handler; } }
        : null,
    },
  };
  context.window = context;
  if (supported) context.speechSynthesis = { cancel: () => { cancellations++; } };
  vm.runInNewContext(source, context);
  return { handlers, cancellations: () => cancellations };
}

const unavailable = load(false);
assert.doesNotThrow(() => unavailable.handlers.playGuide());
assert.doesNotThrow(() => unavailable.handlers.stopGuide());
const available = load(true);
assert.doesNotThrow(() => available.handlers.stopGuide());
assert.equal(available.cancellations(), 1);
console.log('PASS: Play/Stop tolerate absent speech API; supported Stop cancels once.');
