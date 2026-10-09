import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('paid enrollment is fail-closed before real-world verified delivery',()=>{
  const en=readFileSync('course.html','utf8');
  const es=readFileSync('curso-es.html','utf8');
  for(const [lang,page] of [['en',en],['es',es]]){
    assert.doesNotMatch(page,/https:\/\/buy\.stripe\.com\//i,lang+' must not expose unverified paid checkout');
    assert.doesNotMatch(page,/Buy Securely with Stripe|Continuar al formulario seguro de Stripe/i);
    assert.match(page,/mailto:civicascentai@gmail\.com\?subject=/i);
  }
  assert.match(en,/Paid enrollment is temporarily unavailable/);
  assert.match(en,/proposed prices/);
  assert.match(es,/inscripción de pago en pausa/);
  assert.match(es,/precios son propuestos/);
});

test('the registration content is unchanged and no paid course price claims are repurposed',()=>{
  const en=readFileSync('register.html','utf8');
  const es=readFileSync('registro.html','utf8');
  assert.match(en,/Register Free/);
  assert.match(es,/Gratis/);
  assert.doesNotMatch(en,/https:\/\/buy\.stripe\.com\//);
  assert.doesNotMatch(es,/https:\/\/buy\.stripe\.com\//);
});
