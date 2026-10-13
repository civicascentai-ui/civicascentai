# Optional Google Gemini adapter (SCOUT only)

Status: DRAFT REVIEW ONLY. This is **not** connected to the ChatGPT model picker, the CivicAscent website, or Perplexity. It makes zero network calls until separately imported and explicitly invoked by an approved non-website agent task.

Google's OpenAI-compatible endpoint is used for minimal, public-safe text prompts:
https://ai.google.dev/gemini-api/docs/openai

## Tests (no provider credentials or network calls)
Run: `node --test tools/scout/gemini-client.test.mjs`

## Activation gates (must all be met before any real provider call)
1. Independently confirm the Gemini API project/account is eligible for a $0 tier and will not incur charges. No credit-card enrollment, automatic upgrade, paid-tier switch, or unreviewed secret use.
2. Place a restricted Gemini API credential only in authorized server-side secret storage as `GEMINI_API_KEY`. Never put keys in source files, GitHub issues, commits, docs or chat.
3. Set `GEMINI_MODEL` to an available Gemini chat-completions model. Validate model support before any live test.
4. Set `CIVICASCENT_GEMINI_FREE_TIER_CONFIRMED=true` only after independent free-tier/billing check, and `CIVICASCENT_ENABLE_GEMINI=true` only for an explicitly approved limited test.
5. Use `askGeminiPublicSafe({prompt, publicSafe:true})` only for reviewed, non-confidential prompts. It caps prompt to 2000 characters, response output to 256 tokens, never retries, and does not log the credential.
6. Independently verify request, output, provider quota and cost/usage evidence. Do not claim agent activation, partnership, task completion or independent QC based on passing mocked tests.

No automatic usage, website edits, deployment, live checkout, outreach or external publishing is authorized.

## Perplexity track
Perplexity's Google Gmail/Calendar connectors, when eligible for the subscriber's plan, must be authorized by the account owner **inside Perplexity**; ChatGPT's existing Google connection cannot grant Perplexity authorization. Google Drive connector has separate Enterprise eligibility. Do not purchase a Perplexity plan on a $0 budget, and do not share Gmail/Drive content with a different provider without informed account owner consent.
