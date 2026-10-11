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

console.log('CORS preflight QA boundary PASSED. Does not assert a paid delivery.');
