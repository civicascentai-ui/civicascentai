import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const names = [
  'civicascent-ui-review',
  'civicascent-clear-writing',
  'civicascent-engineering',
  'civicascent-council-review',
  'civicascent-browser-qa',
];

for (const name of names) {
  const path = join(root, '.claude', 'skills', name, 'SKILL.md');
  const text = readFileSync(path, 'utf8');
  assert.match(text, /^---\nname: [a-z0-9-]+\ndescription: [^\n]+\n---\n/m, `${name} must have Claude skill frontmatter`);
  assert.match(text, new RegExp(`^name: ${name}$`, 'm'), `${name} name must match directory`);
  assert.ok(text.length > 350, `${name} must contain actionable instructions`);
  assert.ok(!/OPENAI_API_KEY=|STRIPE_SECRET_KEY=|SUPABASE_SERVICE_ROLE_KEY=/.test(text), `${name} must not embed credentials`);
  console.log(`PASS ${name}`);
}

console.log(`PASS ${names.length} project-local skills validated`);
