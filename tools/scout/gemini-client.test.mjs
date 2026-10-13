import test from 'node:test';
import assert from 'node:assert/strict';
import { askGeminiPublicSafe, validateGeminiConfig, GEMINI_OPENAI_URL } from './gemini-client.mjs';
const env = { CIVICASCENT_ENABLE_GEMINI: 'true', CIVICASCENT_GEMINI_FREE_TIER_CONFIRMED: 'true', GEMINI_API_KEY: 'TEST_FAKE_KEY', GEMINI_MODEL: 'gemini-2.5-flash-lite' };

test('fails closed without explicit enablement, billing/free-tier verification and secret', () => {
  assert.throws(() => validateGeminiConfig({ ...env, CIVICASCENT_ENABLE_GEMINI: '' }), /disabled/);
  assert.throws(() => validateGeminiConfig({ ...env, CIVICASCENT_GEMINI_FREE_TIER_CONFIRMED: '' }), /billing controls/);
  assert.throws(() => validateGeminiConfig({ ...env, GEMINI_API_KEY: '' }), /Missing Gemini/);
});

test('does not send unreviewed or oversized prompt', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; throw new Error('should not send'); };
  await assert.rejects(askGeminiPublicSafe({ prompt: 'Hi', env, fetchImpl }), /public-safe/);
  await assert.rejects(askGeminiPublicSafe({ prompt: 'x'.repeat(2001), publicSafe: true, env, fetchImpl }), /2000/);
  assert.equal(calls, 0);
});

test('one bounded request under opt-in and no secret in result', async () => {
  let calls = 0;
  const fake = async (url, request) => {
    calls++;
    assert.equal(url, GEMINI_OPENAI_URL);
    assert.equal(request.headers.Authorization, 'Bearer TEST_FAKE_KEY');
    assert.equal(JSON.parse(request.body).max_tokens, 256);
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'Safe response' } }] }) };
  };
  const result = await askGeminiPublicSafe({ prompt: 'Explain an AI term.', publicSafe: true, env, fetchImpl: fake });
  assert.equal(calls, 1);
  assert.equal(result.text, 'Safe response');
  assert.ok(!JSON.stringify(result).includes('TEST_FAKE_KEY'));
  assert.equal(result.costVerified, false);
});

test('rejects provider errors without repeated calls', async () => {
  let calls = 0;
  await assert.rejects(askGeminiPublicSafe({ prompt: 'Hello', publicSafe: true, env, fetchImpl: async () => { calls++; return { ok:false, status: 429 }; } }), /HTTP 429/);
  assert.equal(calls, 1);
});
