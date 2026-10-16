#!/usr/bin/env node
/**
 * Issue #22: check fail-closed checkout from a restored Git release, offline.
 * No network calls, Stripe credentials or actual purchases.
 */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] || '.');
const tmp = await mkdtemp(join(tmpdir(), 'civicascent-offline-checkout-'));
try {
  const copy = join(tmp, 'recovered-checkout.mjs');
  await copyFile(join(root, 'api', 'create-checkout-session.js'), copy);
  const { default: handler } = await import(pathToFileURL(copy).href);
  assert.equal(typeof handler, 'function');

  const exercise = async (method) => {
    let status = 0;
    let body;
    const headers = {};
    const response = {
      setHeader(key, value) { headers[key.toLowerCase()] = value; },
      status(value) { status = value; return this; },
      json(value) { body = value; return this; },
    };
    await handler({ method, headers: {}, body: {} }, response);
    return { status, headers, body };
  };

  const post = await exercise('POST');
  assert.equal(post.status, 403, 'paid enrollment POST must fail closed');
  assert.equal(post.body?.code, 'PAID_ENROLLMENT_ON_HOLD');
  assert.equal(post.headers['cache-control'], 'no-store');
  assert.equal(post.body.free_registration?.length, 2);
  const get = await exercise('GET');
  assert.equal(get.status, 405);
  assert.equal(get.headers.allow, 'POST');

  // External hosted registration is a dependency, not restored by Git backups.
  const registration = {};
  for (const page of ['register.html', 'registro.html']) {
    const html = await readFile(join(root, page), 'utf8');
    const links = [...html.matchAll(/href="(https:\/\/book\.stripe\.com\/[^"]+)"/g)]
      .map(match => match[1]);
    assert.equal(links.length, 1, page + ': exactly one hosted link');
    assert.ok(/\$0/.test(html), page + ': no visible $0 registration wording');
    registration[page] = {
      provider: 'book.stripe.com',
      sourceLinkPresent: true,
      providerAvailability: 'NOT_CHECKED',
      providerCostAndDataHandling: 'NOT_INDEPENDENTLY_VERIFIED',
    };
  }
  const result = {
    scope: 'OFFLINE_RECOVERED_SOURCE_ONLY',
    restoredPaidCheckoutPOST: '403_PAID_ENROLLMENT_ON_HOLD',
    restoredPaidCheckoutGET: '405_METHOD_NOT_ALLOWED',
    actualPaymentSubmitted: false,
    stripeNetworkRequest: false,
    hostedRegistration: registration,
  };
  process.stdout.write(JSON.stringify(result) + '\n');
} finally {
  await rm(tmp, { recursive: true, force: true });
}
