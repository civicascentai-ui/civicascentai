import test from 'node:test';
import assert from 'node:assert/strict';
import { mountVerifiedSocialLinks, getVerifiedSocialProfiles } from '../assets/social-links.js';

function makeDocument(lang = 'en', withFooter = true) {
  const el = (tag) => ({
    tag,
    id: '',
    textContent: '',
    href: '',
    target: '',
    rel: '',
    style: {},
    attrs: {},
    children: [],
    setAttribute(k, v) { this.attrs[k] = v; },
    appendChild(child) { this.children.push(child); }
  });
  const body = el('body');
  const footer = withFooter ? el('footer') : null;
  if (footer) body.appendChild(footer);
  const find = (node, id) => node.id === id ? node :
    node.children.map(c => find(c,id)).find(Boolean) || null;
  return {
    body, footer, documentElement: { lang },
    createElement: el,
    querySelector(s) { return s === 'footer' ? footer : null; },
    getElementById(id) { return find(body,id); }
  };
}
function approvedRecords() {
  return {
    linkedin: {url:'https://www.linkedin.com/company/qa-nonlive/',ownershipVerified:true,releaseApproved:true},
    facebook: {url:'https://www.facebook.com/qa.nonlive',ownershipVerified:false,releaseApproved:true},
    youtube: {url:'https://www.youtube.com/@qa-nonlive',ownershipVerified:true,releaseApproved:true}
  };
}

test('DOM: renders only authorized and verified links into a footer, once', () => {
  const root = makeDocument();
  assert.equal(mountVerifiedSocialLinks(root, approvedRecords()),2);
  const nav = root.footer.children[0];
  assert.equal(nav.tag,'nav');
  assert.equal(nav.id,'cai-verified-social');
  assert.equal(nav.children.length,2);
  assert.equal(nav.attrs['aria-label'],'Official CivicAscent AI social profiles');
  assert.deepEqual(nav.children.map(x=>x.textContent),['LinkedIn','YouTube']);
  for(const link of nav.children){
    assert.equal(link.tag,'a');
    assert.equal(link.target,'_blank');
    assert.equal(link.rel,'noopener noreferrer');
    assert.match(link.href,/^https:\/\//);
    assert.match(link.attrs['aria-label'],/Visit CivicAscent AI on/);
  }
  assert.equal(mountVerifiedSocialLinks(root,approvedRecords()),2);
  assert.equal(root.footer.children.length,1);
});

test('DOM: Spanish footer and link accessibility labels reflect page language', () => {
  const root = makeDocument('es');
  assert.equal(mountVerifiedSocialLinks(root,approvedRecords()),2);
  const nav = root.footer.children[0];
  assert.equal(nav.attrs['aria-label'],'Perfiles oficiales de CivicAscent AI en redes sociales');
  for(const link of nav.children) assert.match(link.attrs['aria-label'],/Visitar CivicAscent AI en.*pestaña nueva/);
});

test('DOM: a public page without footer gets a safe body append', () => {
  const root = makeDocument('en',false);
  assert.equal(mountVerifiedSocialLinks(root,approvedRecords()),2);
  assert.equal(root.body.children.length,1);
  assert.equal(root.body.children[0].id,'cai-verified-social');
});

test('DOM: missing ownership, approval and spoofed domains produce no link container', () => {
  const root = makeDocument();
  const records = {
    linkedin:{url:'https://linkedin.com/company/qa-nonlive/',ownershipVerified:true,releaseApproved:false},
    facebook:{url:'https://facebook.com.evil.example/qa',ownershipVerified:true,releaseApproved:true}
  };
  assert.deepEqual(getVerifiedSocialProfiles(records),[]);
  assert.equal(mountVerifiedSocialLinks(root,records),0);
  assert.equal(root.footer.children.length,0);
});
