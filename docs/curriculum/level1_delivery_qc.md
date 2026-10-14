# CivicAscent AI — Level 1 course delivery and content QC checklist
Version: 2026-10-14 · Status: QA PREPARED, NOT EXECUTED IN PRODUCTION
Owner lane: SAM; independent acceptance: FRIDAY. Release gate: owner + external learner feedback when appropriate.

## Baseline confirmed in GitHub main
`course.html` has five learner-selectable audio lessons with a transcript displayed alongside the audio player and a playback-speed setting. Five MP3 files exist at `assets/audio/lesson-1.mp3` through `lesson-5.mp3`. `free-ai-starter.html` is a free worksheet with Ask → Verify → Protect and printable layout.

### Lesson-by-lesson alignment
| Lesson | Topic on published page | Single measurable learner outcome | Practical task |
| --- | --- | --- | --- |
| 1 | Meet the assistant | State one use and one limitation | Explain a familiar task in a single question, then check a key claim |
| 2 | Prompting Without Fear | Use Goal + Context + Constraints + Output | Write a fictional two-sentence workshop invitation |
| 3 | Conversation Is the Superpower | Correct an unsatisfactory answer | Ask for simpler wording, an example, and a corrected version |
| 4 | Voice and Accessibility | Identify an accessible interaction option | Explain how voice input could assist without sharing personal records |
| 5 | Put AI to Work | Apply a verification checkpoint | Create a fictional to-do list and flag which entries need checking |

## FRIDAY real-user validation matrix (NOT RUN until witnessed)
1. Mobile at ~320 and ~390 px: all five lesson buttons accessible, no horizontal scrolling, transcript legible.
2. Keyboard only: every lesson button and speed selector receives visible focus; switching lesson updates title, audio source, and transcript.
3. Audio: each of five MP3 files loads and plays audibly, pause/resume works, pace persists or is reselected clearly.
4. Text alternative: each full transcript follows the audio lesson and remains available if audio fails or is muted.
5. Different learner needs: test large type/zoom to 200%, reduced motion, plain-English directions and completion comprehension with an actual learner.

## Failure modes and remediation
- MP3 missing, inaccessible, silent or mismatched: mark FAIL, repair asset only on isolated branch, retest.
- Transcript missing or inconsistent with recording: mark FAIL, correct alongside audio, retest.
- Focus or zoom difficulty: record device/browser, reproduction, impact, screen capture, repair and retest.

## Current restrictions
This checklist does not verify course enrollment, payment, entitlement, private-kit download, refund revocation, learner identity or veteran program release. Existing public registration routes must not be used as proof of complete fulfillment. Paid launch remains held until tracked evidence in #21 and #26 satisfies gates.

## Signoff
SAM source inventory: PREPARED.
FRIDAY independent visual, audio, learner and accessibility QC: NOT RUN.
Owner publishing and payment authorization: NOT REQUESTED by this document.
