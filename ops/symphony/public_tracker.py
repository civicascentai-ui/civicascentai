"""Credential-free GET-only reads of the fixed public CivicAscent repository."""
import json
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO = 'civicascentai-ui/civicascentai'
BASE = 'https://api.github.com/repos/' + REPO
HEADERS = {'User-Agent':'CivicAscent-Symphony-Public-Read', 'Accept':'application/vnd.github+json'}

def request_json(url, timeout=20):
    # URLs originate only from the constants below; no issue content controls a request.
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=timeout) as response:
        remaining = int(response.headers.get('X-RateLimit-Remaining', '60'))
        if remaining < 5:
            raise RuntimeError('Public API budget low; bounded polling stopped.')
        return json.load(response), remaining

def normalize(raw):
    if 'pull_request' in raw:
        return None
    number = raw.get('number')
    if type(number) is not int or number <= 0 or raw.get('state') not in {'open','closed'}:
        raise ValueError('Invalid issue identity/state; snapshot refused.')
    labels = raw.get('labels', [])
    if not isinstance(labels, list) or any(not isinstance(x, dict) or not isinstance(x.get('name'), str) for x in labels):
        raise ValueError('Invalid issue labels; snapshot refused.')
    title, body = raw.get('title'), raw.get('body') or ''
    if not isinstance(title,str) or not isinstance(body,str):
        raise ValueError('Invalid issue text; snapshot refused.')
    return {'id':str(number),'identifier':'GH-' + str(number),'title':title,'description':body,
            'state':raw['state'],'labels':[x['name'] for x in labels],
            'url':'https://github.com/' + REPO + '/issues/' + str(number),'dispatchable':True}

def fetch_snapshot():
    deadline = time.monotonic() + 40
    def get(url):
        left = deadline - time.monotonic()
        if left <= 0:
            raise RuntimeError('Bounded public fetch deadline exceeded.')
        return request_json(url, timeout=min(20,left))
    info, remaining = get(BASE)
    if info.get('full_name') != REPO or info.get('private') is not False:
        raise RuntimeError('Fixed repository is not verified public.')
    issues = []
    for page in range(1, 11):
        query = urllib.parse.urlencode({'state':'all','per_page':100,'page':page,'sort':'created','direction':'asc'})
        data, remaining = get(BASE + '/issues?' + query)
        if not isinstance(data,list):
            raise ValueError('Invalid issue response; last good snapshot retained.')
        for raw in data:
            if not isinstance(raw,dict):
                raise ValueError('Invalid issue response item.')
            issue = normalize(raw)
            if issue:
                issues.append(issue)
        if len(data) < 100:
            return {'schema':1,'repository':REPO,'fetched_at':time.time(),
                    'issues':issues,'rate_remaining':remaining}
    raise RuntimeError('Pagination incomplete; snapshot refused.')

def validate_snapshot(snapshot, now=None):
    if not isinstance(snapshot,dict) or not isinstance(snapshot.get('fetched_at'),(int,float)):
        raise ValueError('Invalid snapshot envelope.')
    age = (time.time() if now is None else now) - snapshot['fetched_at']
    if snapshot.get('schema') != 1 or snapshot.get('repository') != REPO or not 0 <= age <= 125:
        raise RuntimeError('Missing, foreign or stale snapshot; dispatch refused.')
    if not isinstance(snapshot.get('issues'),list):
        raise ValueError('Invalid snapshot issue container.')
    seen=set()
    for i in snapshot['issues']:
        if not isinstance(i,dict):
            raise ValueError('Invalid normalized issue.')
        identity=i.get('id')
        if not isinstance(identity,str) or not identity.isascii() or not identity.isdecimal() or int(identity)<=0 or identity!=str(int(identity)) or identity in seen:
            raise ValueError('Invalid or duplicate issue identity.')
        seen.add(identity)
        if i.get('identifier')!='GH-'+identity or i.get('url')!='https://github.com/'+REPO+'/issues/'+identity or i.get('state') not in {'open','closed'}:
            raise ValueError('Invalid issue scope or state.')
        if not isinstance(i.get('title'),str) or not isinstance(i.get('description'),str) or i.get('dispatchable') is not True:
            raise ValueError('Invalid issue text or eligibility.')
        if not isinstance(i.get('labels'),list) or any(not isinstance(x,str) for x in i['labels']):
            raise ValueError('Invalid issue label data.')
    return snapshot

def publish_snapshot(path, snapshot, previous=None):
    validate_snapshot(snapshot)
    if previous:
        old_ids = {i['id'] for i in previous['issues']}
        new_ids = {i['id'] for i in snapshot['issues']}
        if old_ids - new_ids:
            raise RuntimeError('Prior issue disappeared; stop rather than infer closure.')
    path = Path(path)
    temp = path.with_suffix('.pending')
    temp.write_text(json.dumps(snapshot))
    os.replace(temp, path)

def read_snapshot(path, now=None):
    snapshot = json.loads(Path(path).read_text())
    return validate_snapshot(snapshot,now)
