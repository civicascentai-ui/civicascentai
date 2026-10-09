# CivicAscent AI | Social Media Launch Execution Kit
**Date:** October 9, 2026
**Status:** Internal-ready / ownership and public account creation BLOCKED. **QA branch only.** Do not publish, connect paid apps, or advertise enrollment without approval.
**Executive tracking:** [Social issue #37](https://github.com/civicascentai-ui/civicascentai/issues/37).

## Verified baseline
- CivicAscent Metricool brand **7200789** has no social networks connected. [Manage connections](https://app.metricool.com/brands/connections?blogId=7200789).
- Current QA branch `index.html` and `programs.html` have no outbound verified social profile links.
- Work Gmail searches for CivicAscent-specific LinkedIn, Facebook and YouTube account-registration confirmations found no matches. This does NOT establish handle availability or absence in other accounts.
- Public web discovery did not provide a reliable independently verified corporate-owned LinkedIn/Facebook/YouTube account. **@CivicAscentAI is a proposed handle only**, never an established profile URL.
- No account creation or authorization was possible through connected Metricool; its social connectors require an existing authenticated provider account. No direct supported LinkedIn/Facebook/YouTube account-creation action was available.

## Proposed name and business voice
- Display name: **CivicAscent AI** pending exact filed entity-name QC.
- Requested handle for owner to try: **@CivicAscentAI**. If unavailable, bring verified alternatives back for approval before use.
- Website: https://civicascentai.com (known website, not proof of government endorsement).
- Contact: civicascentai@gmail.com (business inbox; **business phone must not default to the founder's private cell**).
- Core line: **AI for real people. Real skills. Real life.**
- Audience: people learning AI basics, workforce learners, community partners, older adults, military-connected learners.
- Positioning must remain **development and community education** until actual delivery and accessibility are independently verified.
- Individual completion of Google's AI Professional Certificate program may be described only as **program completed, certificate issuance pending**, and never as a Google-company partnership or formal trainer accreditation.

## Platform profile copy (owner can paste after registration)
### LinkedIn organization page
**Tagline:** Practical AI literacy and workforce skills for real people.
**Overview:**
CivicAscent AI develops beginner-friendly, practical learning experiences that help people use artificial intelligence responsibly. Our work centers on workforce readiness, digital confidence, privacy, and verifying AI-generated information. We are preparing accessible, instructor-guided learning resources for community organizations, older adults, and military-connected learners. We welcome conversations with education, workforce and community partners about responsible, useful AI training. Programs and partnership pilots are currently in development; enrollment, sponsorship awards and agency approvals should not be assumed.
**Specialties (proposed):** AI Literacy; Workforce Readiness; Digital Skills; Responsible AI; Community Education; Accessibility Awareness.

### Facebook business Page
**Short bio:** Practical, beginner-friendly AI learning for work, everyday life, and stronger communities. Programs in development.
**About:** CivicAscent AI is developing accessible AI-literacy workshops and workforce-skills resources for beginners, community partners, older adults, and military-connected learners. We teach privacy, fact-checking and practical everyday use. This page shares learning tips and verified project updates. No current SkillBridge, VA, GI Bill, or funded-scholarship status is implied.

### YouTube channel
**Description:** Welcome to CivicAscent AI. Here we explain AI in plain language and show how to write better prompts, check facts, protect privacy and use digital tools for practical learning and work. Our educational programs are being developed and tested. Videos will include captions/transcripts and should not be treated as professional legal, medical or financial advice or as a guarantee of employment.

## First 10 proposed post prompts (NOT scheduled or published)
| Day | Channel | Draft theme | Content gate |
| --- | --- | --- | --- |
| 1 | LinkedIn | Who we are: practical AI skills | Legal entity and claim review |
| 2 | Facebook | AI 101: one clear question | Plain-language QA |
| 3 | YouTube | Short demo: verify an AI claim | Captions/transcript |
| 4 | LinkedIn | Community pilot invitation | No signed partner implied |
| 5 | Facebook | Privacy: never upload sensitive documents | Support/moderation policy |
| 6 | YouTube | Beginner prompt in 3 steps | Fictional data only |
| 7 | LinkedIn | Workforce example: truthful resume revision | No job-placement guarantee |
| 8 | Facebook | Military-connected learner design update | No VA/SkillBridge endorsement |
| 9 | YouTube | Compare two drafts and spot made-up facts | Attribution/content QC |
| 10 | LinkedIn | Looking for accessible human-testing partners | Clear voluntary opt-in; no false recruitment promise |

## Proposed first launch post (copy, not published)
**CivicAscent AI is building practical AI education for real life.**

We're developing beginner-friendly lessons that focus on everyday tasks, workforce skills, privacy, and knowing when to double-check AI output.

Our materials are being reviewed and tested before public enrollment. We welcome conversations with community, workforce, accessibility, and education organizations about responsible AI learning.

Learn more: https://civicascentai.com
Contact: civicascentai@gmail.com

*Draft. No enrollment or funded scholarship offer is open; no government endorsement is claimed.*

## Minimum profile ownership and connection workflow
1. A real authorized account owner checks for an existing organization-controlled account to avoid duplicates, then signs into the official platform themselves.
2. Confirm whether the platform will allow business-page creation under a compliant personal/account identity, respecting platform terms and age/identity verification. Do not share passwords, SMS codes, recovery keys or ID documents with an AI assistant.
3. Create or claim the organization profile (where permitted), set business email, enable MFA, assign one executive owner and one approved backup admin. Never use a consultant's personal account as the sole owner.
4. Capture exact canonical public profile URL; document who controls it, platform verification/ownership proof, accessible description, and public claim review. Check link in signed-out browser.
5. Connect the resulting account inside Metricool using the platform's authorized OAuth login. Do not infer connection from an attempted click.
6. On QA branch, change the relevant entry in `assets/social-links.js` to the canonical HTTPS link and set `ownershipVerified: true` and `releaseApproved: true` **only with recorded evidence and explicit authorization**.
7. Run `node --test tests/social-link-safety.test.js`, inspect mobile/desktop and keyboard/focus, verify noreferrer and accessible link text, then independent QC and executive signoff before deploying.
8. Add Instagram/TikTok in Phase 2 only when a human can moderate and a real captioned content workflow exists.

## Public and operational safety rules
- Never imply Google, VA, DoD, SkillBridge, Workforce Solutions, ASSETS Toledo or any potential sponsor has endorsed the company without signed authorization.
- Do not publish course sales, scholarship availability, certificates, service hours, or training results until verified.
- Never request clients post health information, military records, addresses, SSNs, financial records or passwords in comments or DMs.
- Route sensitive requests privately to the designated human. The human support workflow is not yet verified; do not advertise 24/7 service.
- No bought followers, paid campaigns, ads spend, autoposting, or subscription upgrades without explicit monetary approval.
- If social account credentials are compromised, remove their URLs from the approved registry and halt automated publishing.

## Readiness and decisions
**Completed:** Brand copy, profiles/bios, ten content themes, publishing safety rules, secure social link registry for isolated QA branch and automated trust tests.
**Blocked:** Real account registration and approved owner sign-in; verified canonical URLs; MFA setup; Metricool OAuth authorizations; independent human QC; social publishing approval.
**No production deployment or outgoing social posts authorized.**
