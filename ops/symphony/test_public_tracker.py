import copy
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch
import public_tracker as t

class PublicTracker(unittest.TestCase):
    def snapshot(self):
        return {'schema':1,'repository':t.REPO,'fetched_at':time.time(),'issues':[t.normalize({'number':1,'state':'open','title':'fixture','body':None,'labels':[]})]}
    def test_valid_and_explicit_closure(self):
        s=self.snapshot()
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'snapshot.json';t.publish_snapshot(p,s)
            s['issues'][0]['state']='closed';t.publish_snapshot(p,s,t.read_snapshot(p))
            self.assertEqual(t.read_snapshot(p)['issues'][0]['state'],'closed')
    def test_malformed_snapshots_refused(self):
        changes=[('issues',None),('issues','invalid'),('repository','foreign'),('fetched_at',time.time()-126)]
        for k,v in changes:
            s=self.snapshot();s[k]=v
            with self.subTest(k=k,v=v),self.assertRaises((ValueError,RuntimeError)):t.validate_snapshot(s)
        for k,v in [('id','01'),('id','٠١'),('identifier','GH-2'),('url','https://foreign.example/issues/1'),('state','unknown'),('labels',[3]),('dispatchable',False),('title',None)]:
            s=self.snapshot();s['issues'][0][k]=v
            with self.subTest(k=k,v=v),self.assertRaises((ValueError,RuntimeError)):t.validate_snapshot(s)
        s=self.snapshot();s['issues']*=2
        with self.assertRaises(ValueError):t.validate_snapshot(s)
    def test_disappearance_preserves_last_good_file(self):
        s=self.snapshot()
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'snapshot.json';t.publish_snapshot(p,s);before=p.read_bytes()
            new=copy.deepcopy(s);new['issues']=[]
            with self.assertRaises(RuntimeError):t.publish_snapshot(p,new,s)
            self.assertEqual(p.read_bytes(),before)
    def test_pull_requests_excluded_invalid_identity_refused(self):
        self.assertIsNone(t.normalize({'pull_request':{}}))
        for number in [True,0,-1,'1']:
            with self.assertRaises(ValueError):t.normalize({'number':number,'state':'open'})
    def test_private_repository_refused(self):
        with patch.object(t,'request_json',return_value=({'full_name':t.REPO,'private':True},60)):
            with self.assertRaises(RuntimeError):t.fetch_snapshot()
    def test_incomplete_pagination_refused(self):
        pr={'pull_request':{}}
        with patch.object(t,'request_json',side_effect=[({'full_name':t.REPO,'private':False},60)]+[([pr]*100,60)]*10):
            with self.assertRaises(RuntimeError):t.fetch_snapshot()
    def test_fetch_deadline_refused(self):
        with patch.object(t.time,'monotonic',side_effect=[0,41]):
            with self.assertRaises(RuntimeError):t.fetch_snapshot()
if __name__=='__main__':unittest.main()
