// Staging-only HTTP boundary check: no email codes, checkout card, or paid assets.
import assert from 'node:assert/strict';

const endpoint='https://lpdvvgdejbsgurtqmrub.supabase.co/functions/v1/qa-verified-course-delivery-check';
const trusted='https://civicascentai-launch-qa-git-qa-friday-secu-85862f-civicascentai.vercel.app';
const untrusted='https://untrusted-qa.example.invalid';
const opts=async origin=>await fetch(endpoint,{
  method:'OPTIONS',redirect:'manual',signal:AbortSignal.timeout(12000),
  headers:{Origin:origin,'Access-Control-Request-Method':'POST',
    'Access-Control-Request-Headers':'apikey,authorization,content-type'}
});

const allowed=await opts(trusted);
assert.equal(allowed.status,204,'Authorized QA preflight must pass');
assert.equal(allowed.headers.get('access-control-allow-origin'),trusted,'CORS must be origin scoped');
const exposed=(allowed.headers.get('access-control-expose-headers')||'').toLowerCase();
assert.ok(exposed.split(',').map(x=>x.trim()).includes('x-civicascent-artifact'),
  'Client must be permitted to read artifact verification header');
assert.ok(exposed.split(',').map(x=>x.trim()).includes('content-disposition'));
assert.doesNotMatch(exposed,/authorization|token|apikey|cookie/);
console.log('PASS: approved QA origin can read nonsecret artifact header');

const blocked=await opts(untrusted);
assert.equal(blocked.status,403,'Unknown origin must fail closed');
assert.equal(blocked.headers.get('access-control-allow-origin'),null);
console.log('PASS: unknown origin refused without granting browser CORS');


/* Cloud classroom: the previously broken CORS boundary must pass for an authorized
 * QA preview while blocking unknown origins. No JWT, paid content or charge used. */
const classroomEndpoint='https://lpdvvgdejbsgurtqmrub.supabase.co/functions/v1/qa-level1-classroom';
const classroomPreflight=async origin=>fetch(classroomEndpoint,{
  method:'OPTIONS',redirect:'manual',signal:AbortSignal.timeout(12000),
  headers:{Origin:origin,'Access-Control-Request-Method':'POST',
    'Access-Control-Request-Headers':'apikey,authorization,content-type'}
});
const classroomAllowed=await classroomPreflight(trusted);
assert.equal(classroomAllowed.status,204,'Cloud classroom trusted-origin preflight must return 204');
assert.equal(classroomAllowed.headers.get('access-control-allow-origin'),trusted,'Cloud classroom must scope CORS to preview origin');
const classroomExpose=(classroomAllowed.headers.get('access-control-expose-headers')||'').toLowerCase();
assert.ok(classroomExpose.split(',').map(s=>s.trim()).includes('x-civicascent-artifact'),
  'Cloud classroom download must expose only its verification artifact marker');
assert.doesNotMatch(classroomExpose,/authorization|token|apikey|cookie/);
const classroomBlocked=await classroomPreflight(untrusted);
assert.equal(classroomBlocked.status,403,'Cloud classroom must reject untrusted origins');
assert.equal(classroomBlocked.headers.get('access-control-allow-origin'),null);
console.log('PASS: Cloud classroom protected origin, artifact header and untrusted origin checks');

console.log('CORS preflight QA boundary PASSED. Does not assert a paid delivery.');
