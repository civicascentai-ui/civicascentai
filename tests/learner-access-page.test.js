import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../learner-access.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../assets/learner-access.js',import.meta.url),'utf8');
const spanish=readFileSync(new URL('../curso-es.html',import.meta.url),'utf8');

test('learner portal is noindex and uses a restrictive CSP',()=>{assert.match(html,/noindex,nofollow,noarchive/);assert.match(html,/default-src 'self'/);assert.match(html,/connect-src 'self'/);assert.match(html,/frame-ancestors 'none'/);assert.doesNotMatch(html,/SUPABASE_|SERVICE_ROLE|sk_(test|live)_/);});
test('redirect credentials remain tab-scoped and URL fragment is cleared',()=>{assert.match(script,/sessionStorage\.setItem\('civicascent-access-token'/);assert.match(script,/history\.replaceState/);assert.doesNotMatch(script,/localStorage\.setItem\('civicascent-access-token'/);assert.doesNotMatch(script,/refresh_token/);});
test('download is shown only for sent entitlement plus explicit access enablement',()=>{assert.match(script,/item\.delivery_status==='sent'&&result\.course_access_enabled===true/);assert.match(script,/\/api\/course-download\?product=/);});
test('portal includes English and Spanish interface copy',()=>{assert.match(script,/Learner access/);assert.match(script,/Acceso del estudiante/);assert.match(script,/Cambiar a español/);});
test('Spanish course page no longer claims a verified Spanish checkout',()=>{assert.match(spanish,/experiencia de compra en español todavía no está verificada/);assert.match(spanish,/formulario alojado por Stripe puede aparecer parcial o totalmente en inglés/);assert.doesNotMatch(spanish,/mantiene la experiencia de aprendizaje y compra en español/);});
