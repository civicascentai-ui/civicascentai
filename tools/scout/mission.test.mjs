import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQa5Cases, buildReceipt, REQUIRED_CASE_IDS } from './mission.mjs';

const sample = [
  '| Case | Required proof | Present verified proof | Status |',
  '| --- | --- | --- | --- |',
  '| QA5-01 successful checkout | TEST provider proof | Missing | BLOCKED |',
  '| QA5-02 declined payment | Decline evidence | None | NOT RUN |',
  '| QA5-03 receipt | Matching order | None | NOT RUN |',
  '| QA5-04 course access | Correct learner access | None | NOT RUN |',
  '| QA5-05 duplicate/refund | Revocation proof | None | NOT RUN |'
].join('\n');

test('parses exactly five tracked QA5 evidence gaps', () => {
  const cases = parseQa5Cases(sample);
  assert.deepEqual(cases.map(x => x.id), REQUIRED_CASE_IDS);
  assert.equal(cases.filter(x => x.trackerStatus === 'BLOCKED').length, 1);
  assert.ok(cases.every(x => x.externallyVerified === false));
});

test('fails closed when a case is missing or duplicated', () => {
  assert.throws(() => parseQa5Cases(sample.replace(/\| QA5-05[^\n]+/, '')));
  assert.throws(() => parseQa5Cases(sample + '\n| QA5-01 duplicate | X | Y | BLOCKED |'));
});

test('does not promote tracker PASS into independent payment verification', () => {
  const changed = sample.replace('QA5-01 successful checkout | TEST provider proof | Missing | BLOCKED',
    'QA5-01 successful checkout | TEST provider proof | Missing | PASS');
  assert.deepEqual(parseQa5Cases(changed)[0],
    { id: 'QA5-01', trackerStatus: 'PASS', externallyVerified: false });
});

test('receipt includes run metadata and explicit no-payment disclaimer', () => {
  const issues = {
    56: { state: 'open', body: 'SCOUT blocked' },
    57: { state: 'open', body: sample },
    34: { state: 'open', body: 'Reviewers pending' },
    36: { state: 'open', body: 'Course draft' }
  };
  const receipt = buildReceipt(issues, { runId: '4321', startedAt: '2026-10-12T00:00:00Z', finishedAt: '2026-10-12T00:00:01Z' });
  assert.equal(receipt.runId, '4321');
  assert.equal(receipt.readOnly, true);
  assert.equal(receipt.cases.length, 5);
  assert.match(receipt.evidenceNote, /No provider charges, purchase receipts/);
  assert.ok(!JSON.stringify(receipt).includes('Reviewers pending'));
});
