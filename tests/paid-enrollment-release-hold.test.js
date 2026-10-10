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

test('free registration uses inquiry-only links with visible privacy information',()=>{
  const en=readFileSync('register.html','utf8');
  const es=readFileSync('registro.html','utf8');
  assert.match(en,/Ask About Free Registration/);
  assert.match(es,/Consultar inscripción gratuita/);
  assert.doesNotMatch(en,/https:\/\/(?:buy|book)\.stripe\.com\//);
  assert.doesNotMatch(es,/https:\/\/(?:buy|book)\.stripe\.com\//);
  assert.match(en,/mailto:civicascentai@gmail\.com\?subject=/);
  assert.match(es,/mailto:civicascentai@gmail\.com\?subject=/);
  assert.match(en,/href="privacy\.html"/);
  assert.match(es,/href="privacy\.html"/);
  assert.doesNotMatch(en,/secure Stripe-hosted form/i);
  assert.doesNotMatch(es,/alojada por Stripe/i);
  assert.match(en,/class="skip-to-main" href="#main-content"/);
  assert.match(es,/class="skip-to-main" href="#main-content"/);
  const privacy=readFileSync('privacy.html','utf8');
  assert.match(privacy,/Privacy and Contact/);
  assert.match(privacy,/civicascentai@gmail\.com/);
  assert.match(privacy,/Paid enrollment is temporarily unavailable/);
});

test('homepage offers keyboard access and privacy contact',()=>{
  const home=readFileSync('index.html','utf8');
  assert.match(home,/class="skip-main" href="#main-content"/);
  assert.match(home,/id="main-content" tabindex="-1"/);
  assert.match(home,/href="privacy\.html"/);
  assert.match(home,/mailto:civicascentai@gmail\.com/);
  assert.doesNotMatch(home,/https:\/\/(?:buy|book)\.stripe\.com\//);
});
