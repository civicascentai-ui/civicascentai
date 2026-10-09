import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getVerifiedSocialProfiles, validateSocialProfileUrl, mountVerifiedSocialLinks } from '../assets/social-links.js';

/** Independent second-pass social-link acceptance after initial implementation. */
test('retest: no profile link or DOM mutation without verified approved account', () => {
  let called = false;
  const trapRoot = { createElement() { called = true; throw Error('Unexpected social link insertion'); } };
  assert.equal(mountVerifiedSocialLinks(trapRoot), 0);
  assert.equal(called, false);

  const scenarios = [
    { linkedin: { url: 'https://linkedin.com/company/sample', ownershipVerified: false, releaseApproved: true } },
    { linkedin: { url: 'https://linkedin.com/company/sample', ownershipVerified: true, releaseApproved: false } },
    { linkedin: { url: 'https://linkedin.com/company/sample', ownershipVerified: 'true', releaseApproved: true } },
    { linkedin: { url: 'https://linkedin.com/company/sample', ownershipVerified: true, releaseApproved: 'true' } },
    { linkedin: { url: 'https://linkedin.com/company/sample', ownershipVerified: null, releaseApproved: true } },
    { linkedin: { url: null, ownershipVerified: true, releaseApproved: true } },
    { linkedin: { url: 'https://linkedin.com.evil.test/company/sample', ownershipVerified: true, releaseApproved: true } },
    { youtube: { url: 'https://youtube.com/@sample?redirect=evil', ownershipVerified: true, releaseApproved: true } },
  ];
  for (const records of scenarios) assert.deepEqual(getVerifiedSocialProfiles(records), []);
});

test('retest: mixed approvals show only exact authorized platforms and URL matches', () => {
  const records = {
    linkedin: {url: 'https://www.linkedin.com/company/nonlive-example/', ownershipVerified: true, releaseApproved: true},
    facebook: {url: 'https://www.facebook.com/nonlive.example', ownershipVerified: true, releaseApproved: false},
    youtube: {url: 'https://www.youtube.com/@nonlive-example', ownershipVerified: false, releaseApproved: true},
    fake: {url: 'https://fake.example/company/example', ownershipVerified: true, releaseApproved: true}
  };
  assert.deepEqual(getVerifiedSocialProfiles(records), [
    {platform: 'linkedin', url: 'https://www.linkedin.com/company/nonlive-example/'}
  ]);
});

test('retest: reject link-hijack, injection, credential and non-account URLs', () => {
  const attacks = [
    ['linkedin', 'http://www.linkedin.com/company/example'],
    ['linkedin', 'https://linkedin.com.evil.test/company/example'],
    ['linkedin', 'https://www.linkedin.com/company/example?next=https://evil.test'],
    ['linkedin', 'https://www.linkedin.com/company/example#malicious'],
    ['linkedin', 'https://www.linkedin.com/company/'],
    ['linkedin', 'https://www.linkedin.com/learning/'],
    ['linkedin', 'https://username:secret@www.linkedin.com/company/example'],
    ['linkedin', 'https://www.linkedin.com:444/company/example'],
    ['facebook', 'https://facebook.com.evil.test/business/example'],
    ['facebook', 'https://facebook.com/example?story_fbid=10'],
    ['youtube', 'https://youtube.com/redirect?to=https://evil.test'],
    ['youtube', 'https://www.youtube.com/watch?v=abc'],
    ['youtube', 'https://www.youtube.com/@'],
    ['youtube', 'https://www.youtube.com:444/@example'],
    ['instagram', 'https://www.instagram.com/example']
  ];
  for (const [platform,url] of attacks) assert.equal(validateSocialProfileUrl(platform,url), null, `${platform}: ${url}`);
});

test('retest: approved links must be visible as text, keyboard-usable anchors with tab protection', () => {
  const code = readFileSync('assets/social-links.js', 'utf8');
  assert.match(code, /link\.textContent\s*=\s*LABELS\[record\.platform\]/);
  assert.match(code, /link\.href\s*=\s*record\.url/);
  assert.match(code, /link\.rel\s*=\s*'noopener noreferrer'/);
  assert.match(code, /link\.setAttribute\('aria-label'/);
  assert.match(code, /aria-label', 'Official CivicAscent AI social profiles'/);
  for (const p of ['index.html','programs.html']) {
    const html=readFileSync(p,'utf8');
    assert.equal((html.match(/src="assets\/social-links\.js"/g)||[]).length,1);
    assert.doesNotMatch(html, /https:\/\/(?:www\.)?(?:linkedin\.com\/company|facebook\.com\/(?!drive)|youtube\.com\/@)/i);
  }
});
