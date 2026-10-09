import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOCIAL_PROFILES, getVerifiedSocialProfiles, validateSocialProfileUrl} from '../assets/social-links.js';

test('no profile appears until ownership verification AND publishing approval', () => {
  assert.deepEqual(getVerifiedSocialProfiles(), []);
  assert.equal(Object.values(SOCIAL_PROFILES).every(x => x.url === null && !x.ownershipVerified && !x.releaseApproved), true);
  const example = {linkedin: {url:'https://www.linkedin.com/company/example-nonlive/', ownershipVerified: true, releaseApproved: false}};
  assert.deepEqual(getVerifiedSocialProfiles(example), []);
  example.linkedin.releaseApproved = true;
  assert.deepEqual(getVerifiedSocialProfiles(example), [{platform:'linkedin',url:'https://www.linkedin.com/company/example-nonlive/'}]);
});

test('only canonical HTTPS provider hosts and plausible account paths are allowed', () => {
  const valid = {
    linkedin: 'https://www.linkedin.com/company/example-nonlive/',
    facebook: 'https://www.facebook.com/example.nonlive',
    youtube: 'https://www.youtube.com/@example-nonlive'
  };
  for (const [platform,url] of Object.entries(valid)) assert.equal(validateSocialProfileUrl(platform,url),url);
  for (const url of [
    'http://www.linkedin.com/company/example-nonlive',
    'https://linkedin.com.evil.example/company/example-nonlive',
    'https://www.linkedin.com@evil.example/company/example-nonlive',
    'https://www.linkedin.com/search/results/people',
    'https://www.linkedin.com/company/example-nonlive?token=abc',
    'javascript:alert(1)',
    '//www.linkedin.com/company/example-nonlive',
    'https://user:pass@www.linkedin.com/company/example-nonlive'
  ]) assert.equal(validateSocialProfileUrl('linkedin', url),null);
  assert.equal(validateSocialProfileUrl('unknown', valid.linkedin),null);
});

test('website pages load trust-gated social link module without guessed profile URLs', () => {
  for (const path of ['index.html','programs.html']) {
    const html = readFileSync(path,'utf8');
    assert.match(html, /<script type="module" src="assets\/social-links\.js"><\/script>/);
    assert.doesNotMatch(html, /https:\/\/(www\.)?(linkedin\.com\/company|facebook\.com|youtube\.com\/\@)/i);
  }
});

test('external links use accessible names and tab isolation', () => {
  const src = readFileSync('assets/social-links.js','utf8');
  assert.match(src,/noopener noreferrer/);
  assert.match(src,/aria-label/);
  assert.match(src,/releaseApproved === true/);
  assert.match(src,/ownershipVerified === true/);
});
