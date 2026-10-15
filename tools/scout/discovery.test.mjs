import test from 'node:test';
import assert from 'node:assert/strict';
import {SOURCES,clean,safeUrl,parseRss,parseJson,parseGrantsApi,rank,discover,report} from './discovery.mjs';
const source=SOURCES[0];
test('Source allowlist rejects arbitrary and insecure URLs',()=>{
 assert.equal(safeUrl('http://www.grants.gov/bad',source.hosts),null);
 assert.equal(safeUrl('https://evil.example/a',source.hosts),null);
 assert.equal(safeUrl('https://www.grants.gov@evil.example',source.hosts),null);
 assert.ok(safeUrl('https://www.grants.gov/opportunities',source.hosts));
});
test('RSS parser reads source and rejects off-domain links',()=>{
 const feed='<rss><channel><item><title><![CDATA[Veterans AI job training grant]]></title><link>https://www.grants.gov/opportunities/1</link><pubDate>Today</pubDate></item>'+
 '<item><title>Malicious fake news</title><link>https://evil.example/path</link></item></channel></rss>';
 const items=parseRss(feed,source);
 assert.equal(items.length,1);
 assert.equal(items[0].title,'Veterans AI job training grant');
 assert.throws(()=>parseRss('not-xml',source));
});
test('Official Grants.gov search2 fixture produces only posted or forecasted official links',()=>{
 const data={errorcode:0,data:{oppHits:[
  {id:364024,title:'Workforce training grant',openDate:'10/10/2026',closeDate:'10/15/2026',oppStatus:'posted'},
  {id:364025,title:'Closed grant',oppStatus:'closed'},
  {id:'../evil',title:'Bad ID',oppStatus:'posted'},
  {id:364026,title:'Future training opportunity',oppStatus:'forecasted'}
 ]}};
 const items=parseGrantsApi(JSON.stringify(data),source);
 assert.equal(items.length,2);
 assert.equal(items[0].url,'https://www.grants.gov/search-results-detail/364024');
 assert.equal(items[1].url,'https://www.grants.gov/search-results-detail/364026');
 assert.equal(items[0].closingDate,'10/15/2026');
 assert.equal(items[1].closingDate,null);
 const md=report({sources:[],leads:rank(items),finishedAt:'2026-10-14T00:00:00Z',runUrl:'https://github.com/example/run'});
 assert.match(md,/closing 10\/15\/2026/);
 assert.throws(()=>parseGrantsApi('{"errorcode":1,"data":{"oppHits":[]}}',source));
 assert.throws(()=>parseGrantsApi('<html>not JSON</html>',source));
});
test('Federal Register JSON parser validates result shape and URLs',()=>{
 const s=SOURCES[1];
 const items=parseJson(JSON.stringify({results:[{title:'Workforce training notice',html_url:'https://www.federalregister.gov/documents/2026/notice',publication_date:'2026-10-12'}]}),s);
 assert.equal(items.length,1);
 assert.throws(()=>parseJson('{}',s));
});
test('Scoring preserves only distinct potential leads, no fake endorsements',()=>{
 const items=[
 {source:'grants',title:'Veterans AI workforce training grant',url:'https://www.grants.gov/opportunities/1'},
 {source:'grants',title:'Veterans AI workforce training grant',url:'https://www.grants.gov/opportunities/1'},
 {source:'news',title:'Unrelated local weather',url:'https://news.google.com/rss/articles/1'}
 ];
 const found=rank(items);
 assert.equal(found.length,1);
 assert.equal(found[0].reviewStatus,'UNVERIFIED LEAD');
});
test('Partial source outage produces explicit degraded receipt, no invented passes',async()=>{
 const data=await discover(SOURCES,async s=>{
  if(s.id!=='federal-register')throw Error('Offline fixture');
  return [{source:s.id,title:'Veteran workforce training notice',url:'https://www.federalregister.gov/documents/2026/notice'}];
 });
 assert.equal(data.sources.filter(x=>x.status==='ERROR').length,3);
 assert.equal(data.leads.length,1);
 const md=report({...data,finishedAt:'2026-10-12T00:00:00Z',runUrl:'https://github.com/example/run'});
 assert.match(md,/INTERNAL REVIEW ONLY/);
 assert.match(md,/UNVERIFIED/);
 assert.doesNotMatch(md,/verified eligibility achieved/i);
});
test('All-source failure fails closed',async()=>{
 await assert.rejects(discover(SOURCES,async()=>{throw Error('Unavailable')}),/All public sources failed/);
});
test('Unsupported response content is not treated as a lead',()=>{
 assert.equal(clean('<script>bad</script> &amp; more'), 'bad & more');
 assert.equal(rank([{title:'',url:'https://news.google.com/example'}]).length,0);
});
