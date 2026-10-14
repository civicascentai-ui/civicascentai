/* Isolated A2UI v0.9.1 protocol subset demo, NOT the official production renderer. */
(() => {
  'use strict';
  const VERSION = 'v0.9.1';
  const CATALOG = 'https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json';
  const SURFACE = 'shadow-demo';
  const ALLOWED_COMPONENTS = new Set(['Text', 'Button', 'Card', 'Row', 'Column']);
  const ALLOWED_EVENTS = new Set(['inspect_scout', 'inspect_zebra', 'inspect_friday', 'inspect_sam']);
  const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const components = new Map();
  let created = false;
  let model = {};
  const output = document.getElementById('surface');
  const log = document.getElementById('event-log');

  function readPointer(pointer) {
    if (typeof pointer !== 'string' || !pointer.startsWith('/')) return '';
    const keys = pointer.slice(1).split('/').map(x => x.replace(/~1/g, '/').replace(/~0/g, '~'));
    if (keys.some(x => FORBIDDEN_KEYS.has(x))) return '';
    let obj = model;
    for (const key of keys) { if (obj == null || !Object.hasOwn(obj, key)) return ''; obj = obj[key]; }
    return obj == null ? '' : String(obj);
  }

  function renderNode(id, ancestry = new Set(), inline = false) {
    if (ancestry.has(id) || ancestry.size > 48) throw Error('Invalid cyclic component tree');
    const part = components.get(id);
    if (!part) throw Error(`Unknown component: ${id}`);
    if (!ALLOWED_COMPONENTS.has(part.component)) throw Error('Unsupported component: ' + part.component);
    const seen = new Set(ancestry); seen.add(id);
    let element;
    switch (part.component) {
      case 'Text': {
        const variant = part.variant;
        element = document.createElement(inline ? 'span' : variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : 'p');
        // textContent prevents any agent-provided text from being interpreted as HTML.
        element.textContent = (part.text && typeof part.text === 'object' && 'path' in part.text)
          ? readPointer(part.text.path) : String(part.text ?? '');
        break;
      }
      case 'Button': {
        element = document.createElement('button'); element.type = 'button';
        element.append(renderNode(part.child, seen, true));
        const event = part.action?.event?.name;
        if (!ALLOWED_EVENTS.has(event)) { element.disabled = true; element.title = 'Unsupported action'; }
        else element.addEventListener('click', () => { log.textContent = `Local demo event received: ${event}. No external action executed.`; });
        break;
      }
      case 'Card': {
        element = document.createElement('article'); element.className = 'card';
        element.append(renderNode(part.child, seen)); break;
      }
      case 'Row': case 'Column': {
        element = document.createElement('div'); element.className = part.component.toLowerCase();
        if (!Array.isArray(part.children)) throw Error('Invalid child list');
        for (const child of part.children) element.append(renderNode(child, seen));
        break;
      }
      default: throw Error('Unsupported component');
    }
    return element;
  }

  function accept(message) {
    if (message.version !== VERSION) throw Error('Unsupported A2UI version');
    const keys = ['createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface'].filter(key => Object.hasOwn(message, key));
    if (keys.length !== 1) throw Error('Invalid A2UI envelope');
    const [type] = keys; const payload = message[type];
    if (!payload || payload.surfaceId !== SURFACE) throw Error('Unexpected surface');
    if (type === 'createSurface') {
      if (created || payload.catalogId !== CATALOG) throw Error('Unexpected or duplicate catalog');
      created = true;
    } else if (!created) throw Error('Surface missing');
    else if (type === 'updateComponents') {
      if (!Array.isArray(payload.components)) throw Error('Invalid components');
      for (const component of payload.components) {
        if (!component.id || !ALLOWED_COMPONENTS.has(component.component)) throw Error('Unsupported component');
        components.set(component.id, component);
      }
    } else if (type === 'updateDataModel') {
      // This read-only pilot accepts a full model replacement only.
      if (payload.path !== '/' || typeof payload.value !== 'object' || !payload.value || Array.isArray(payload.value)) throw Error('Invalid model update');
      model = payload.value;
    } else if (type === 'deleteSurface') { components.clear(); model = {}; created = false; }
  }

  async function start() {
    try {
      const response = await fetch('./sample.jsonl', {cache: 'no-store'});
      if (!response.ok) throw Error('Fixture unavailable');
      const lines = (await response.text()).split(/\r?\n/).filter(s => s.trim());
      if (lines.length < 3 || lines.length > 32) throw Error('Unexpected A2UI message count');
      for (const line of lines) accept(JSON.parse(line));
      if (!components.has('root')) throw Error('Missing root component');
      output.replaceChildren(renderNode('root'));
      output.dataset.testResult = 'PASS';
    } catch (err) {
      output.replaceChildren();
      const alert = document.createElement('p'); alert.setAttribute('role', 'alert');
      alert.textContent = `A2UI demo failed safely: ${String(err?.message ?? err)}`;
      output.append(alert); output.dataset.testResult = 'FAIL';
    }
  }
  start();
})();
