const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

// These root HTML files are the repository's static build output. Model direct
// visits with arbitrary query strings; query parameters must never imply success.
const confirmations = [
  ['registered.html', ['does not confirm', 'registration provider']],
  ['registrado.html', ['no confirma', 'proveedor de registro']],
  ['thank-you.html', ['does not confirm a payment', 'payment provider']],
];
for (const [file, expected] of confirmations) {
  const html = read(file).toLowerCase();
  assert.ok(html.length > 0, `${file} exists in static build output`);
  for (const query of ['', '?success=true', '?session_id=cs_test_arbitrary', '?product=starter&paid=1']) {
    const directVisit = new URL(`https://example.invalid/${file}${query}`);
    assert.equal(directVisit.pathname, `/${file}`);
    assert.match(html, /does not confirm|no confirma/, `${file} explains that opening it is not confirmation`);
    assert.doesNotMatch(html, /registration complete|registro completo|payment complete|purchase complete|request is recorded|solicitud.{0,80}registrada|details are recorded through stripe|datos fueron enviados/i,
      `${file} makes no unconditional success or recorded-request claim for ${query || 'no query'}`);
  }
  for (const phrase of expected) assert.ok(html.includes(phrase), `${file} includes next-step guidance: ${phrase}`);
}
assert.match(read('registered.html'), /href="course\.html"/);
assert.match(read('registrado.html'), /href="es\.html"/);

function makeElement(value = '') {
  const listeners = {};
  const classes = new Set();
  return {
    value, style: {}, textContent: '', innerHTML: '', href: '', dataset: {}, attributes: {},
    listeners,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle: (name, force) => force ? classes.add(name) : classes.delete(name),
      contains: (name) => classes.has(name),
    },
    setAttribute(name, val) { this.attributes[name] = val; },
    addEventListener(name, fn) { listeners[name] = fn; },
    scrollIntoView() {},
    focus() {},
  };
}

const mentor = read('mentor.html');
const choiceMarkup = [...mentor.matchAll(/<button\b[^>]*data-goal="([^"]+)"[^>]*>/g)];
assert.equal(choiceMarkup.length, 4);
for (const match of choiceMarkup) assert.match(match[0], new RegExp(`aria-pressed="${match[1] === 'learn' ? 'true' : 'false'}"`));
const ids = [...mentor.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
const elements = Object.fromEntries(ids.map((id) => [id, makeElement()]));
elements.stage.value = 'starting';
elements.situation.value = '';
elements.mentorOutput.style.display = 'none';
const goalButtons = ['learn', 'career', 'business', 'community'].map((goal) => {
  const button = makeElement();
  button.dataset.goal = goal;
  return button;
});
goalButtons[0].classList.add('active');
goalButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));
const document = {
  getElementById: (id) => elements[id],
  querySelectorAll: (selector) => selector === '.choice[data-goal]' ? goalButtons : [],
};
const context = { document, window: { scrollTo() {} }, URLSearchParams, encodeURIComponent, Math, String, parseInt };
const script = [...mentor.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n');
vm.runInNewContext(script, context);

assert.equal(goalButtons[0].attributes['aria-pressed'], 'true');
assert.equal(goalButtons.slice(1).every((button) => button.attributes['aria-pressed'] === 'false'), true);
goalButtons[2].listeners.click();
assert.equal(goalButtons[2].attributes['aria-pressed'], 'true');
assert.equal(goalButtons[0].attributes['aria-pressed'], 'false');
elements.stage.value = 'growing';
elements.situation.value = 'A situation to clear';
elements.mentorBtn.listeners.click();
assert.equal(elements.mentorOutput.style.display, 'block');
assert.ok(elements.priority.textContent.length > 0, 'selected goal builds a plan');
elements.mentorOutput.style.display = 'block';
elements.priority.textContent = 'Prior plan';
elements.focus.textContent = 'Prior focus';
elements.actions.innerHTML = 'Prior actions';
elements.checkpoint.textContent = 'Prior checkpoint';
elements.emailMentor.href = 'mailto:info@civicascentai.com?subject=prior';
elements.resetBtn.listeners.click();
assert.equal(elements.situation.value, '');
assert.equal(elements.stage.value, 'starting');
assert.equal(goalButtons[0].attributes['aria-pressed'], 'true');
assert.equal(goalButtons.slice(1).every((button) => button.attributes['aria-pressed'] === 'false'), true);
assert.equal(goalButtons[0].classList.contains('active'), true);
assert.equal(goalButtons[2].classList.contains('active'), false);
assert.equal(elements.mentorOutput.style.display, 'none');
assert.equal(elements.priority.textContent, '');
assert.equal(elements.focus.textContent, '');
assert.equal(elements.actions.innerHTML, '');
assert.equal(elements.checkpoint.textContent, '');
assert.equal(elements.emailMentor.href, 'mailto:info@civicascentai.com');
elements.mentorBtn.listeners.click();
assert.match(elements.priority.textContent, /Start with one useful task/, 'reset restores internal goal as well as its visible selection');

console.log('PASS confirmation direct-visit copy and static build output');
console.log('PASS mentor aria-pressed selection and complete reset');
