import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../api/create-checkout-session.js';

function response() {return {
  code:200, headers:{}, body:null,
  setHeader(k,v){this.headers[k]=v;return this;},
  status(x){this.code=x;return this;},
  json(x){this.body=x;return this;}
};}

test('disabled QA create-checkout route rejects GET',async()=>{
  const res=response();await handler({method:'GET'},res);
  assert.equal(res.code,405);assert.equal(res.headers.Allow,'POST');
});
test('disabled QA create-checkout route never issues a paid session',async()=>{
  const res=response();await handler({method:'POST',body:{price:'fake'}},res);
  assert.equal(res.code,503);
  assert.equal(res.headers['Cache-Control'],'no-store');
  assert.match(res.body.error,/disabled/);
  const source=readFileSync(new URL('../api/create-checkout-session.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/checkout\.sessions\.create\s*\(/);
  assert.doesNotMatch(source,/example\.com/);
});
