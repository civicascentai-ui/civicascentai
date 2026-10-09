import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../learner-access.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../assets/learner-access.js',import.meta.url),'utf8');
test('learner sign-in has a visible label and email autocomplete',()=>{
 assert.match(html,/<label for="email"/);
 assert.match(html,/<input id="email"[^>]*type="email"[^>]*autocomplete="email"/);
});
test('keyboard skip link and focus indicator exist',()=>{
 assert.match(html,/class="skip" href="#main"/);
 assert.match(html,/a:focus-visible/);
});
test('status region is announced and courses section is named',()=>{
 assert.match(html,/id="message" role="status" aria-live="polite"/);
 assert.match(html,/aria-labelledby="purchases-heading"/);
 assert.match(html,/id="purchases-heading" data-copy="courses"/);
});
test('language switching updates document language and section copy',()=>{
 assert.match(js,/document\.documentElement\.lang=lang/);
 assert.match(js,/en:\{courses:'Your courses'/);
 assert.match(js,/es:\{courses:'Tus cursos'/);
});
test('entitlement rendering uses text nodes rather than injecting server HTML',()=>{
 assert.doesNotMatch(js,/innerHTML\s*=/);
 assert.match(js,/heading\.textContent=/);
 assert.match(js,/state\.textContent=/);
});
