import test from 'node:test';
import assert from 'node:assert/strict';
import {rank,normalize,research} from './research.mjs';
test('rejects unapproved source URLs',()=>assert.equal(normalize({html_url:'https://example.com',title:'fake'},{name:'AI',term:'artificial intelligence'}),null));
test('ranks relevant title',()=>assert.ok(rank({title:'Artificial intelligence education'}, {term:'artificial intelligence education'})>=2));
test('reports source failures without inventing results',async()=>{
 const r=await research(async()=>({ok:false,status:503}));
 assert.equal(r.sourceCount,0);
 assert.equal(r.results.length,0);
 assert.equal(r.errors.length,4);
 assert.equal(r.safeguards.noOutreach,true);
});
test('produces cited source links',async()=>{
 const r=await research(async()=>({ok:true,json:async()=>({results:[{title:'Workforce development training',html_url:'https://www.federalregister.gov/documents/2026/10/01/sample',publication_date:'2026-10-01',agencies:[]}]})}));
 assert.equal(r.sourceCount,4);
 assert.equal(r.results.length,1);
 assert.match(r.results[0].url,/federalregister/);
});
