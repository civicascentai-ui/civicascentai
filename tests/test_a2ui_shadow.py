"""No-dependency protocol-fixture smoke test for the isolated A2UI experiment."""
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'experiments' / 'a2ui-shadow'
VERSION = 'v0.9.1'
CATALOG = 'https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json'
COMPONENTS = {'Text', 'Button', 'Card', 'Row', 'Column'}
ACTIONS = {'inspect_scout', 'inspect_zebra', 'inspect_friday', 'inspect_sam'}

class A2UIShadowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.messages = [json.loads(line) for line in (ROOT / 'sample.jsonl').read_text().splitlines() if line.strip()]
        cls.items = {c['id']: c for m in cls.messages for c in m.get('updateComponents', {}).get('components', [])}

    def test_message_envelope_and_sequence(self):
        self.assertEqual([next(x for x in ('createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface') if x in m) for m in self.messages],
                         ['createSurface', 'updateComponents', 'updateDataModel'])
        for m in self.messages:
            self.assertEqual(m['version'], VERSION)
            self.assertEqual(len(set(m) & {'createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface'}), 1)
            self.assertEqual(next(v for k, v in m.items() if k not in {'version'})['surfaceId'], 'shadow-demo')
        self.assertEqual(self.messages[0]['createSurface']['catalogId'], CATALOG)
        self.assertFalse(self.messages[0]['createSurface']['sendDataModel'])

    def test_references_are_complete_and_acyclic(self):
        self.assertIn('root', self.items)
        self.assertEqual(len(self.items), 34)
        self.assertEqual(len(self.items), len(set(self.items)))
        for c in self.items.values():
            self.assertIn(c['component'], COMPONENTS)
            for child in c.get('children', []) + ([c['child']] if 'child' in c else []):
                self.assertIn(child, self.items)
        def visit(node, history):
            self.assertNotIn(node, history)
            c = self.items[node]
            for child in c.get('children', []) + ([c['child']] if 'child' in c else []):
                visit(child, history | {node})
        visit('root', set())

    def test_demo_labels_are_explicit(self):
        text = ' '.join(str(c.get('text','')) for c in self.items.values())
        for name in ('SCOUT','ZEBRA','FRIDAY','SAM','SANDBOX DEMO ONLY'):
            self.assertIn(name, text)
        self.assertIn('No payment, email, API', text)

    def test_actions_are_local_and_allowlisted(self):
        actions = {c.get('action', {}).get('event', {}).get('name') for c in self.items.values() if c['component'] == 'Button'}
        self.assertEqual(actions, ACTIONS)
        self.assertNotIn('url', (ROOT / 'sample.jsonl').read_text().lower().replace(CATALOG.lower(), ''))

    def test_data_binding_and_no_live_status(self):
        update = self.messages[2]['updateDataModel']
        self.assertEqual(update['path'], '/')
        for person in ('scout', 'zebra', 'friday', 'sam'):
            self.assertIn(person, update['value'])
            self.assertTrue(update['value'][person].startswith('Sample:'))

    def test_browser_content_security_guards(self):
        html = (ROOT / 'index.html').read_text()
        js = (ROOT / 'app.js').read_text()
        self.assertIn("default-src 'none'", html)
        self.assertIn('textContent', js)
        self.assertNotIn('innerHTML', js)
        self.assertNotIn('eval(', js)
        self.assertNotIn('fetch(', js.replace("fetch('./sample.jsonl'", 'fixtureGet('))

if __name__ == '__main__':
    unittest.main()
