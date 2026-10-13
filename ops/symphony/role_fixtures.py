"""Controlled smoke inputs and independent output checks, not client acceptance."""
import hashlib
import json
import subprocess
from pathlib import Path

FIXTURES = {
 'engineering': ({'symphony_role_fixture.py':'def add(a, b):\n    return a - b\n',
                  'test_symphony_role_fixture.py':'import unittest\nfrom symphony_role_fixture import add\nclass Addition(unittest.TestCase):\n def test_positive(self): self.assertEqual(add(2,3),5)\n def test_negative(self): self.assertEqual(add(-2,3),1)\n'},
                 'This is a controlled role smoke, not an application defect. Fix only symphony_role_fixture.py so addition works; run test_symphony_role_fixture.py. Include the fixture source and test as new-file diffs in the evidence patch. Do not change the tests or other source.'),
 'qa': ({'role-fixture.html':'<!doctype html><html lang="en"><body><img src="lesson.png"><button></button></body></html>\n'},
        'Controlled QA fixture: inspect role-fixture.html and report the missing image text alternative and empty button accessible name. Preserve the file unchanged. Do not claim a live browser or full accessibility audit.'),
 'reach': ({'role-source.md':'SYNTHETIC TEST FIXTURE; not a real prospect. Example Partner offers 12 free beginner sessions. Source identifier: role-source.md.\n'},
           'Use only role-source.md to draft a short partner note. Explicitly mark it synthetic/test-only, cite role-source.md beside the 12-session claim, and do not send anything or present this as a real partner.'),
 'operations': ({'role-records.json':'{"TASK-1":{"status":"complete","evidence":"fixture-test-pass"},"TASK-2":{"status":"blocked","blocker":"missing sample input","owner":"CODI"}}\n'},
                'Controlled Operations smoke: reconcile role-records.json. Report TASK-1 complete with its evidence and TASK-2 blocked with the missing sample input and CODI as owner. Drafting this report can be complete while TASK-2 remains blocked.')
}

def validate(role, artifacts, workspace, codex, env):
    artifacts, workspace = Path(artifacts), Path(workspace)
    if role == 'proof':
        proof = artifacts / 'smoke-result.txt'
        return {'exact_proof': proof.is_file() and proof.read_text() == 'SYMPHONY_CIVICASCENT_PASS\n'}
    try:
        result = json.loads((artifacts / 'result.json').read_text())
        summary = (artifacts / 'summary.md').read_text().lower()
    except (OSError, ValueError):
        return {'structured_evidence': False}
    checks = {'structured_evidence': result.get('role') == role and result.get('status') == 'complete'
              and all(k in result for k in ['evidence_paths', 'tests', 'blockers', 'next_owner'])}
    if role == 'engineering':
        expected_test = FIXTURES[role][0]['test_symphony_role_fixture.py']
        checks['test_unchanged'] = (workspace / 'test_symphony_role_fixture.py').read_text() == expected_test
        test = subprocess.run(['setpriv','--bounding-set=-all','--inh-caps=-all','--ambient-caps=-all',str(codex),
            'sandbox','-c','sandbox_mode="workspace-write"','--','python3','-m','unittest','test_symphony_role_fixture.py'],
            cwd=workspace,env=env,capture_output=True,text=True,timeout=30)
        checks['independent_tests_passed'] = test.returncode == 0 and 'Ran 2 tests' in test.stderr and 'OK' in test.stderr
        patch = (artifacts / 'changes.patch').read_text() if (artifacts / 'changes.patch').is_file() else ''
        checks['patch_contains_new_source'] = 'symphony_role_fixture.py' in patch and '+    return a + b' in patch
        checks['changed_file_list'] = (artifacts / 'changed-files.txt').is_file()
    elif role == 'qa':
        checks['fixture_unchanged'] = (workspace / 'role-fixture.html').read_text() == FIXTURES[role][0]['role-fixture.html']
        checks['defects_identified'] = ('alt' in summary or 'text alternative' in summary) and 'button' in summary and ('empty' in summary or 'accessible name' in summary)
    elif role == 'reach':
        checks['source_unchanged'] = (workspace / 'role-source.md').read_text() == FIXTURES[role][0]['role-source.md']
        checks['source_cited_and_fixture_disclosed'] = 'role-source.md' in summary and '12' in summary and ('synthetic' in summary or 'test-only' in summary)
    elif role == 'operations':
        checks['source_unchanged'] = (workspace / 'role-records.json').read_text() == FIXTURES[role][0]['role-records.json']
        checks['statuses_and_owner_preserved'] = all(s in summary for s in ['task-1','complete','fixture-test-pass','task-2','blocked','missing sample input','codi'])
    return checks
