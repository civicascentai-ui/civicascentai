import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const interest = read('learner-interest.html');
const questions = read('learner-questions.html');
const home = read('index.html');
const course = read('course.html');
const js = read('assets/learner-interest.js');
const css = read('assets/learner-interest.css');

test('both learner pages are separate, reachable and clearly labelled', () => {
  assert.match(home,/href="learner-interest\.html"/);
  assert.match(course,/href="learner-interest\.html"/);
  assert.match(interest,/href="learner-questions\.html"/);
  assert.match(questions,/href="learner-interest\.html"/);
  assert.match(interest,/About CivicAscent AI/);
  assert.match(questions,/Questions & answers/);
  assert.match(interest,/No checkout\./);
});

test('forms collect only minimal voluntary contact details; no server-side storage is claimed', () => {
  for (const source of [interest, questions]) {
    assert.match(source,/<form[^>]+data-civic-form/);
    assert.match(source,/<input[^>]+name="reply_email"[^>]+type="email"[^>]+required/);
    assert.match(source,/<select[^>]+name="topic"[^>]+required/);
    assert.match(source,/email app/i);
    assert.match(source,/press Send|choose to send|you choose to send/i);
    assert.match(source,/not (?:paid )?enrollment|does not (?:accept|reserve)|No checkout/i);
    assert.match(source,/sensitive/i);
    assert.match(source,/<meta name="robots" content="noindex,nofollow">/);
    assert.match(source,/href="assets\/learner-interest.css"/);
    assert.match(source,/src="assets\/learner-interest.js"/);
    assert.match(source,/class="skip" href="#main"/);
  }
  assert.match(questions,/<textarea[^>]+name="message"[^>]+required/);
  assert.ok((questions.match(/<details(?:\s|>)/g)||[]).length>=5, 'FAQs should provide direct answers');
});

test('QA email flow never invokes paid checkout or silently transmits a lead', () => {
  for (const source of [interest, questions, js]) {
    assert.doesNotMatch(source,/(?:https?:\/\/)(?:payhip\.com|checkout\.stripe\.com|book\.stripe\.com|api\.stripe\.com)/i);
    assert.doesNotMatch(source,/\b(?:localStorage|sessionStorage|XMLHttpRequest|sendBeacon)\b/);
  }
  assert.doesNotMatch(js,/\bfetch\s*\(/);
  assert.match(js,/window\.location\.assign\(draft\.url\)/);
  assert.match(js,/mailto:/);
  assert.match(js,/Nothing has been submitted/i);
  assert.match(js,/encodeURIComponent/);
  assert.match(interest,/not joining a marketing list/i);
  assert.match(questions,/does not subscribe you to marketing messages/i);
});

test('learner experience uses responsive layout and accessible focus states', () => {
  for (const source of [interest,questions]) {
    assert.match(source,/<html lang="en">/);
    assert.match(source,/name="viewport"/);
    assert.match(source,/aria-live="polite"/);
    assert.match(source,/aria-label="Page navigation"/);
    assert.match(source,/aria-current="page"/);
  }
  assert.match(css,/@media\(max-width:780px\)/);
  assert.match(css,/:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
