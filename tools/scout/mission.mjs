// SCOUT phase-1 read-only QA5 evidence audit. No third-party AI, payment or write API calls.
// Intended to run on standard GitHub Actions runners for the PUBLIC CivicAscent repository.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';


const civicLaw = JSON.parse(readFileSync(new URL('../../agents/core_law.json', import.meta.url), 'utf8'));
if (civicLaw.id !== 'CIVICASCENT-SAFARI-CORE-LAW' || civicLaw.scene_routes?.length !== 6) throw Error('Missing valid CivicAscent core LAW');
export const CORE_LAW_VERSION = civicLaw.version;
export const REQUIRED_CASE_IDS = Object.freeze(['QA5-01', 'QA5-02', 'QA5-03', 'QA5-04', 'QA5-05']);
export const ISSUE_IDS = Object.freeze([56, 57, 34, 36]);
const REPO = 'civicascentai-ui/civicascentai';

export function parseQa5Cases(markdown) {
  if (typeof markdown !== 'string') throw new Error('QA5 evidence source is not text');
  const cases = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\|\s*QA5-\d{2}\b/.test(line)) continue;
    const cols = line.split('|').slice(1, -1).map(s => s.trim());
    if (cols.length !== 4) throw new Error('Unexpected QA5 case-table structure');
    const id = cols[0].match(/^QA5-\d{2}\b/)?.[0];
    if (!id || !REQUIRED_CASE_IDS.includes(id) || cases.has(id)) {
      throw new Error('Unexpected or duplicate QA5 case');
    }
    const status = cols[3].toUpperCase();
    if (!['BLOCKED', 'NOT RUN', 'FAIL', 'PASS'].includes(status)) {
      throw new Error('Unrecognized status for ' + id + ': ' + status);
    }
    // A tracked PASS cannot by itself demonstrate provider-verified payment or learner access.
    cases.set(id, { id, trackerStatus: status, externallyVerified: false });
  }
  if (cases.size !== REQUIRED_CASE_IDS.length) {
    throw new Error('Expected exactly five QA5 cases, got ' + cases.size);
  }
  return REQUIRED_CASE_IDS.map(id => cases.get(id));
}

export function buildReceipt(issues, runtime = {}) {
  if (!issues || !issues[57] || !issues[56]) throw new Error('Missing verified issue sources');
  const cases = parseQa5Cases(issues[57].body);
  const now = runtime.finishedAt || new Date().toISOString();
  const runId = String(runtime.runId || 'local');
  return {
    schema: 'civicascent.scout.qa5-readonly.v1',
    mission: 'QA5 evidence-gap audit',
    execution: 'ACTUAL READ-ONLY AUDIT (not payment or course-access test)',
    migrationTarget: 'GitHub Actions standard runner',
    costPolicy: 'Public repository standard runner; no metered AI/provider/payment calls',
    noReplitCalls: true,
    automatedExternalOutreach: false,
    readOnly: true,
    runId,
    runUrl: runtime.runUrl || null,
    startedAt: runtime.startedAt || now,
    finishedAt: now,
    commitSha: runtime.commitSha || null,
    source: { repository: REPO, issueNumbers: ISSUE_IDS },
    issueStates: Object.fromEntries(ISSUE_IDS.map(id => [id, issues[id]?.state || 'unavailable'])),
    cases,
    evidenceNote: 'Statuses copied from existing public QA5 issue tracking. No provider charges, purchase receipts, course delivery or independent QC are verified by this audit.',
    nextAction: 'FRIDAY confirms actual TEST-mode provider order and learner entitlement separately. Do not activate sales.'
  };
}

async function fetchIssue(id, token) {
  if (!ISSUE_IDS.includes(id)) throw new Error('Unapproved issue ID');
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'CivicAscent-SCOUT-ReadOnly' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch('https://api.github.com/repos/' + REPO + '/issues/' + id, {
    method: 'GET', headers, signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error('GitHub issue ' + id + ' GET failed HTTP ' + response.status);
  const issue = await response.json();
  if (issue.number !== id || typeof issue.body !== 'string') throw new Error('Invalid issue content');
  return { state: issue.state, body: issue.body };
}

export async function runAudit() {
  if (!process.env.GITHUB_ACTIONS || process.env.GITHUB_REPOSITORY !== REPO) {
    throw new Error('Execution guard: must run in CivicAscent GitHub Actions');
  }
  if (!process.env.GITHUB_TOKEN) throw new Error('Read-only GITHUB_TOKEN is required');
  const startedAt = new Date().toISOString();
  const issues = Object.fromEntries(await Promise.all(ISSUE_IDS.map(async id => [id, await fetchIssue(id, process.env.GITHUB_TOKEN)])));
  const receipt = buildReceipt(issues, {
    startedAt, finishedAt: new Date().toISOString(), runId: process.env.GITHUB_RUN_ID,
    runUrl: 'https://github.com/' + REPO + '/actions/runs/' + process.env.GITHUB_RUN_ID,
    commitSha: process.env.GITHUB_SHA
  });
  const outputDir = resolve(process.cwd(), 'scout-output');
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(resolve(outputDir, 'scout-qa5-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { mode: 0o600 });
  // Expose only public issue-status metadata and artifact path, no issue body or secrets.
  console.log('SCOUT read-only mission complete; audit cases=' + receipt.cases.length +
    '; tracked blockers=' + receipt.cases.filter(x => x.trackerStatus !== 'PASS').length);
  console.log('Receipt: scout-output/scout-qa5-receipt.json');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  runAudit().catch(err => {
    console.error('SCOUT mission blocked safely: ' + err.message);
    process.exitCode = 1;
  });
}
