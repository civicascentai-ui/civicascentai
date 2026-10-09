import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const MAIN_PAGES = [
  'index.html', 'programs.html', 'capabilities.html',
  'course.html', 'curso-es.html', 'es.html', 'living-ai-lab.html',
  'mentor.html', 'village.html', 'level2.html', 'consultation.html'
];
test('social integration: each approved primary informational page includes only one deferred module', () => {
  for (const p of MAIN_PAGES) {
    const src = readFileSync(p,'utf8');
    assert.equal((src.match(/<script type="module" src="assets\/social-links\.js"><\/script>/g)||[]).length,1,p);
    assert.match(src,/<\/body>/i,p);
  }
});
test('social integration: never hardcodes guesses for corporate social URLs', () => {
  for(const p of MAIN_PAGES) {
    const src = readFileSync(p,'utf8');
    assert.doesNotMatch(src,/https:\/\/(?:www\.)?(?:linkedin\.com\/company|facebook\.com\/|youtube\.com\/@)/i,p);
  }
});
test('social integration: incomplete signup workflows remain untouched',()=>{
  for(const p of ['register.html','registro.html','registered.html','registrado.html']){
    const src=readFileSync(p,'utf8');
    assert.doesNotMatch(src,/src="assets\/social-links\.js"/);
  }
});
