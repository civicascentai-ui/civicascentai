import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

test('deployment contract: Stripe webhook source exists at Vercel API function path',()=>{
  assert.ok(existsSync('api/stripe-webhook.js'),'Missing Vercel API webhook function');
  const source=readFileSync('api/stripe-webhook.js','utf8');
  assert.match(source,/export default async function handler/);
});
test('deployment contract: SPA rewrites must not intercept /api requests',()=>{
  if(!existsSync('vercel.json')) return;
  const config=JSON.parse(readFileSync('vercel.json','utf8'));
  for(const rewrite of config.rewrites||[]) {
    const source=rewrite.source||'';
    if(source==='/(.*)'||source==='/:path*') {
      assert.fail('Catch-all SPA rewrite can intercept /api/stripe-webhook; exclude /api');
    }
  }
});
