// SCOUT Research Division v1. Public official Federal Register API only; read-only, no paid API.
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const topics=[
  {name:'AI education',term:'artificial intelligence education'},
  {name:'Workforce training',term:'workforce development training'},
  {name:'Veterans programs',term:'veterans employment training'},
  {name:'Older adult access',term:'older adults digital literacy'}
];
export function rank(doc,topic){
 const title=String(doc.title||'').toLowerCase();
 const text=title+' '+String(doc.abstract||'').toLowerCase();
 const keywords=topic.term.split(' ').filter(w=>w.length>3);
 return keywords.reduce((n,w)=>n+(text.includes(w)?1:0),0);
}
export function normalize(doc,topic){
 const url=String(doc.html_url||'');
 if(!url.startsWith('https://www.federalregister.gov/documents/'))return null;
 return {topic:topic.name,title:String(doc.title||'Untitled').slice(0,300),url,
  publicationDate:doc.publication_date||null,agency:(doc.agencies||[]).map(a=>a.name).filter(Boolean).slice(0,3),
  relevance:rank(doc,topic),source:'Federal Register'};
}
export async function research(fetcher=fetch){
 const results=[],errors=[];
 for(const topic of topics){
  const query=new URL('https://www.federalregister.gov/api/v1/documents.json');
  query.searchParams.set('conditions[term]',topic.term);
  query.searchParams.set('order','newest');
  query.searchParams.set('per_page','8');
  try{
   const response=await fetcher(query,{headers:{'User-Agent':'CivicAscent-SCOUT-Research/1.0','Accept':'application/json'},signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('HTTP '+response.status);
   const data=await response.json();
   if(!Array.isArray(data.results))throw new Error('Unexpected response');
   for(const item of data.results){const n=normalize(item,topic);if(n)results.push(n);}
  }catch(e){errors.push({topic:topic.name,error:String(e.message).slice(0,100)});}
 }
 const dedup=[...new Map(results.map(x=>[x.url,x])).values()]
   .sort((a,b)=>b.relevance-a.relevance||String(b.publicationDate).localeCompare(String(a.publicationDate))).slice(0,25);
 return {schema:'civicascent.scout.research.v1',generatedAt:new Date().toISOString(),
  mission:'Public-source opportunity discovery; research leads only, not verified eligibility',
  sourceScope:'Federal Register public documents',topics:topics.map(x=>x.name),
  results:dedup,errors,sourceCount:topics.length-errors.length,
  decisions:'CODI/REACH review sources and eligibility; FRIDAY independently checks before publication or outreach',
  safeguards:{noPurchases:true,noOutreach:true,noPaidApis:true,noProductionWrites:true}};
}
if(process.argv[1]?.endsWith('/research.mjs')){
 if(process.env.GITHUB_ACTIONS!=='true'||process.env.GITHUB_REPOSITORY!=='civicascentai-ui/civicascentai')
  throw new Error('SCOUT GitHub Actions repository guard failed');
 const report=await research();
 mkdirSync(resolve('scout-output'),{recursive:true});
 writeFileSync(resolve('scout-output/research-report.json'),JSON.stringify(report,null,2)+'\n');
 const lines=['# SCOUT Daily Research Brief','', 'Generated: '+report.generatedAt,'',
  'Scope: Public Federal Register documents. Leads require independent review.','',
  ...report.results.map(x=>'- **'+x.topic+'**: ['+x.title.replaceAll(']','')+']('+x.url+') ('+x.publicationDate+', relevance '+x.relevance+')'),
  '', 'Source failures: '+report.errors.length, ...report.errors.map(x=>'- '+x.topic+': '+x.error),
  '', 'CODI/REACH: review eligibility and relevance. FRIDAY: verify before any publication or outreach.'];
 writeFileSync(resolve('scout-output/research-brief.md'),lines.join('\n')+'\n');
 console.log('SCOUT research finished; source groups='+report.sourceCount+'; leads='+report.results.length+'; failures='+report.errors.length);
 if(report.sourceCount===0)process.exitCode=1;
}
