// SCOUT: bounded public research, $0 vendor APIs, no outreach, no secrets.
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export const SOURCES=[
 {id:'grants',kind:'rss',url:'https://www.grants.gov/rss/GG_OppModByCategory.xml',hosts:['www.grants.gov','grants.gov']},
 {id:'federal-register',kind:'json',url:'https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=workforce%20training&per_page=20&order=newest',hosts:['www.federalregister.gov','federalregister.gov']},
 {id:'veterans-news',kind:'rss',url:'https://news.google.com/rss/search?q=veterans%20AI%20workforce%20training&hl=en-US&gl=US&ceid=US%3Aen',hosts:['news.google.com']},
 {id:'older-adults-news',kind:'rss',url:'https://news.google.com/rss/search?q=AI%20digital%20literacy%20older%20adults&hl=en-US&gl=US&ceid=US%3Aen',hosts:['news.google.com']}
];
export function clean(s){
 return String(s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&')
 .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
 .replace(/<[^>]*>/g,' ').replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim().slice(0,240);
}
function field(block,tag){
 const m=block.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+tag+'>','i'));
 return clean(m?.[1]||'');
}
export function safeUrl(value,hosts){
 try{const u=new URL(clean(value));return u.protocol==='https:'&&!u.username&&!u.password&&hosts.includes(u.hostname)?u.href:null;}
 catch{return null;}
}
export function parseRss(text,s){
 if(typeof text!=='string'||text.length>2000000||!/<rss\b/i.test(text))throw Error('Invalid RSS source');
 const out=[];
 for(const m of text.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)){
  const title=field(m[1],'title'),url=safeUrl(field(m[1],'link'),s.hosts);
  if(title&&url)out.push({source:s.id,title,url,published:field(m[1],'pubDate')||null});
  if(out.length>=40)break;
 }
 return out;
}
export function parseJson(text,s){
 const d=JSON.parse(text);
 if(!Array.isArray(d.results))throw Error('Invalid JSON source');
 return d.results.slice(0,25).map(x=>({source:s.id,title:clean(x.title),url:safeUrl(x.html_url,s.hosts),published:clean(x.publication_date)||null})).filter(x=>x.title&&x.url);
}
export function rank(items){
 const terms=[[/\b(veterans?|military|service members?|military spouses?)\b/i,4],
  [/\b(workforce|employment|skills?|career|job training)\b/i,3],
  [/\b(artificial intelligence|AI literacy|digital literacy|digital skills|AI training)\b/i,4],
  [/\b(grants?|funding|donat(?:ion|ions|e)|sponsor(?:ship)?)\b/i,3],
  [/\b(older adults?|seniors?|aging)\b/i,3],
  [/\b(nonprofits?|community colleges?|public librar(?:y|ies))\b/i,2]];
 const seen=new Set(),out=[];
 for(const x of items){
  if(!x.url||!x.title||seen.has(x.url))continue;seen.add(x.url);
  const score=terms.reduce((n,[re,points])=>n+(re.test(x.title)?points:0),0);
  if(score>=3)out.push({...x,score,reviewStatus:'UNVERIFIED LEAD'});
 }
 return out.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,18);
}
async function download(s){
 const response=await fetch(s.url,{redirect:'error',headers:{'User-Agent':'CivicAscent-SCOUT-PublicFeed/1.0'},
  signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('HTTP '+response.status);
 if(Number(response.headers.get('content-length')||0)>2000000)throw Error('Too large');
 const text=await response.text();if(text.length>2000000)throw Error('Too large');
 return s.kind==='rss'?parseRss(text,s):parseJson(text,s);
}
export async function discover(sources=SOURCES,loader=download){
 const runs=await Promise.all(sources.map(async s=>{
  try{const items=await loader(s);return {source:s.id,status:'OK',items};}
  catch(e){return {source:s.id,status:'ERROR',error:String(e.message||e).slice(0,100),items:[]};}
 }));
 if(!runs.some(x=>x.status==='OK'))throw Error('All public sources failed. Cannot claim a successful mission.');
 return {sources:runs.map(x=>({source:x.source,status:x.status,count:x.items.length,...(x.error?{error:x.error}:{})})),
  leads:rank(runs.flatMap(x=>x.items))};
}
export function report(run){
 const lines=['# SCOUT Public Research | '+run.finishedAt,'',
  'INTERNAL REVIEW ONLY: leads are not verified eligibility, grants, endorsements, or commitments.','',
  'Run: '+run.runUrl,'','## Sources'];
 for(const s of run.sources)lines.push('- '+s.source+': '+s.status+' / '+s.count+(s.error?' ('+clean(s.error)+')':''));
 lines.push('','## Leads for Reach to verify');
 if(!run.leads.length)lines.push('No matching headlines in this run; do not infer that no opportunities exist.');
 for(const item of run.leads)lines.push('- '+clean(item.title)+' | '+item.source+' | '+item.url+' | score '+item.score+' | UNVERIFIED');
 lines.push('','Reach must verify official details before contacting anyone. No outreach, payments, or course activations occurred.','');
 return lines.join('\n');
}
export async function main(){
 if(process.env.GITHUB_ACTIONS!=='true'||process.env.GITHUB_REPOSITORY!=='civicascentai-ui/civicascentai')throw Error('Unauthorized runner');
 const startedAt=new Date().toISOString(),found=await discover();
 const runId=String(process.env.GITHUB_RUN_ID||'unknown'),finishedAt=new Date().toISOString();
 const run={schema:'civicascent.scout.public-research.v2',runId,
  runUrl:'https://github.com/civicascentai-ui/civicascentai/actions/runs/'+runId,
  startedAt,finishedAt,readOnly:true,noOutreach:true,noPaidProviderCalls:true,
  acceptedPartnerCount:0,verifiedGrantEligibility:false,...found};
 mkdirSync(resolve('scout-output'),{recursive:true});
 writeFileSync(resolve('scout-output/scout-research.json'),JSON.stringify(run,null,2)+'\n');
 writeFileSync(resolve('scout-output/scout-research.md'),report(run));
 console.log('SCOUT public research complete: '+run.sources.filter(x=>x.status==='OK').length+'/'+run.sources.length+' sources; '+run.leads.length+' UNVERIFIED leads.');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 main().catch(e=>{console.error('SCOUT held: '+e.message);process.exitCode=1;});
}
