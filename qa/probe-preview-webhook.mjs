// Run: node qa/probe-preview-webhook.mjs https://YOUR-QA-PREVIEW.vercel.app
// Read-only probe. Does not send Stripe events, payments, credentials, or database writes.
const base = process.argv[2];
if (!base || !/^https:\/\//.test(base)) {
  console.error('Usage: node qa/probe-preview-webhook.mjs https://YOUR-QA-PREVIEW.vercel.app');
  process.exit(2);
}
const url = new URL('/api/stripe-webhook', base);
let failed = false;
for (const method of ['GET', 'POST']) {
  try {
    // POST without a body or signature must never authorize checkout.
    const response = await fetch(url, {method, redirect:'manual', signal:AbortSignal.timeout(10000)});
    const body = (await response.text()).slice(0, 300);
    const isRedirect = response.status >= 300 && response.status < 400;
    const html = /<html|<!doctype/i.test(body);
    const expected = method === 'GET' ? response.status === 405 : [400, 503].includes(response.status);
    const pass = expected && !isRedirect && !html;
    console.log(JSON.stringify({method, status:response.status, pass, note: isRedirect ? 'Preview protection or redirect detected' : html ? 'HTML fallback or auth gate detected' : 'Response received'}));
    if (!pass) failed = true;
  } catch (error) {
    console.error(JSON.stringify({method, pass:false, error:error.name || 'network error'}));
    failed = true;
  }
}
if (failed) process.exitCode = 1;
