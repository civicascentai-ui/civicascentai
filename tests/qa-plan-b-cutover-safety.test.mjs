import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../course.html', import.meta.url),'utf8');
const anchors=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
  .map(([_,attrs,text])=>({href:attrs.match(/href=["']([^"']+)["']/i)?.[1]||'',
                            label:text.replace(/<[^>]*>/g,'').trim()}));
const inquire=anchors.filter(a=>/Ask About Availability/i.test(a.label));
test('Plan B: two paid course CTAs must remain inquiry-only until cutover passes',()=>{
  assert.equal(inquire.length,2,'Expected two distinct paused inquiry CTAs');
  for(const link of inquire){
    assert.match(link.href,/^mailto:civicascentai@gmail\.com\?subject=/);
    assert.match(link.href,/Availability%20Inquiry/);
  }
  assert.ok((html.match(/enrollment paused/gi)||[]).length>=2);
  assert.ok((html.match(/No payment requested/gi)||[]).length>=2);
});
test('Plan B: no payment gateway/product URL active in paused paid-course CTAs',()=>{
  const sensitive=anchors.filter(a=>/Buy Now|Purchase Now|Enroll Now|Pay Now|Buy Course|Checkout/i.test(a.label));
  assert.equal(sensitive.length,0,'Checkout must remain paused until explicit owner approval');
  const externalSales=anchors.filter(a=>/https?:\/\/(?:[^/]*\.)?(?:payhip\.com|fourthwall\.com|checkout\.stripe\.com)/i.test(a.href));
  assert.equal(externalSales.length,0,'Cutover provider link must not be installed pre-QC');
});
test('Plan B: independent fallback contact and disclosure exist',()=>{
  assert.ok(html.includes('civicascentai@gmail.com'));
  assert.match(html,/Course delivery and access are being verified before enrollment reopens/);
});
