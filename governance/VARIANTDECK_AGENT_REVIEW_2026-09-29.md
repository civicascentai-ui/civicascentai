# CivicAscent AI — Agent Review: VariantDeck
Date: 2026-09-29
Status: APPROVED WITH RESTRICTIONS
Resource: VariantDeck
Role: Development-only UI comparison layer for React

## Evidence reviewed
VariantDeck presents itself as a development-only alpha tool for React 18/19 that allows multiple UI presentations to be compared non-destructively against the same live feature state. It is headless by design, preserves existing feature behavior, supports shareable variant URLs, and includes agent-oriented workflows.

## Agent 1 — Experience Director
PASS WITH RESTRICTIONS.
Useful for comparing visual directions without losing the approved experience. It must not become a source of visual style. Only candidate presentations consistent with the Safari master direction may be created.

## Agent 2 — Lead Production Engineer
PASS FOR DEVELOPMENT / REVIEW ONLY.
Its strongest value is isolated comparison of presentation variants without duplicating application state. Because the project is alpha/development-only, it must not become a production runtime dependency without a separate stability review.

## Agent 3 — Quality & Accessibility Director
PASS WITH VERIFICATION.
Useful because candidates can be compared in the real interaction context rather than screenshots alone. Any picker/workbench UI remains development-only. Each candidate still requires keyboard, focus, mobile, reduced-motion, and accessibility testing.

## Agent 4 — Critical Evaluation / Creative Media Director
PASS.
Useful for controlled A/B-style creative comparison of layout, hierarchy, motion treatment, and hotspot presentation while preserving the same underlying scene and content. It should reduce visual drift, not increase the number of competing concepts.

## Agent 5 — Software Librarian, Steward & Independent Control Auditor
WATCH / CONDITIONAL PASS.
No direct ChatGPT plugin was found. Treat as an external development resource. Current public status is alpha and development-only, so provenance, version, dependency impact, and removal from production builds must be tracked. STOP-WORK if it leaks into production or is used to revive quarantined concepts.

## Agent 6 — Expert Mentor & Senior Strategic Advisor
PASS IF USED NARROWLY.
Variant comparison can improve decision quality if it tests a specific uncertainty. It should never become permission to generate endless alternatives. Maximum value comes from comparing two or three tightly bounded candidates against one explicit success question.

# Think Tank Decision
APPROVED WITH RESTRICTIONS.

VariantDeck may be used only as a development/review tool to compare bounded UI presentations inside the active Safari Vertical Slice 1.0.

## Rules
1. Development/review only.
2. Not a production dependency unless separately re-approved after stability review.
3. Maximum three candidate variants for a single decision unless the owner explicitly requests more.
4. Every variant must preserve the active Safari direction and production objective.
5. No quarantined design, code, or concept may be reintroduced as a comparison candidate.
6. Figma remains the visual source of truth.
7. VariantDeck does not replace owner visual approval, Agent 3 QA, Agent 5 audit, or Agent 6 strategic review.
8. Agent 2 must confirm the package is excluded from or harmless to the final production build before release.
9. Agent 5 tracks version/status because the resource is currently alpha.
10. Use it to answer a defined question, then remove or freeze the losing alternatives.

## Recommended first use
Compare no more than three treatments of the **Start Here** interaction inside the same approved Safari scene:
- quiet environmental label;
- accessible anchored action;
- subtle scene-integrated hotspot.

The scene, media, content, and underlying behavior stay constant. Only presentation changes.
