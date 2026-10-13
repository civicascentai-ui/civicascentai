// Opt-in adapter for sanitized, public-safe CivicAscent agent prompts.
// Nothing here schedules calls, changes the website, or sends requests by default.
export const GEMINI_OPENAI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MAX_PROMPT_CHARS = 2000;

export function validateGeminiConfig(env = process.env) {
  if (env.CIVICASCENT_ENABLE_GEMINI !== 'true') throw new Error('Gemini disabled; explicit opt-in required');
  if (env.CIVICASCENT_GEMINI_FREE_TIER_CONFIRMED !== 'true') {
    throw new Error('Gemini not enabled until account free-tier and billing controls are verified');
  }
  if (!env.GEMINI_API_KEY) throw new Error('Missing Gemini API key in server-side secret storage');
  if (!/^gemini-[\w.-]+$/.test(env.GEMINI_MODEL ?? '')) {
    throw new Error('Explicit supported GEMINI_MODEL must be configured');
  }
  return { model: env.GEMINI_MODEL, apiKey: env.GEMINI_API_KEY };
}

export async function askGeminiPublicSafe({ prompt, publicSafe = false, fetchImpl = fetch, env = process.env } = {}) {
  if (publicSafe !== true) throw new Error('Only reviewed public-safe input is permitted');
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    throw new Error('Prompt must be nonempty and at most 2000 characters');
  }
  const { model, apiKey } = validateGeminiConfig(env);
  const response = await fetchImpl(GEMINI_OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'x-goog-api-client': 'civicascent-scout/0.1'
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 256 }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Gemini provider returned HTTP ${response.status}; no retry`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Gemini returned no usable text');
  return { model, text: text.slice(0, 12000), provider: 'Google Gemini', costVerified: false };
}
