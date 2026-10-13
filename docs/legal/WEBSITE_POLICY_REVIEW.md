# CivicAscent AI | Privacy and Terms Review Packet
**Status:** DRAFT FOR OWNER/LEGAL REVIEW. **Not a published policy.**
**Prepared:** 2026-10-12

## Before a public privacy notice can be issued
Confirm with the people who administer the actual website:
1. Legal entity name, postal contact address, policy contact address and effective date.
2. All forms and data collection paths (site email links, learner-interest email drafts, free-workshop hosted Stripe registration, consultations, paid checkout, analytics, and any CRM or mailing list).
3. Categories of personal data collected, source, purpose, sharing processors, retention schedule, deletion/access procedure, security practices and cross-border processing where applicable.
4. Whether any cookies, pixels, tracking, analytics, anti-spam, third-party embeds, advertising or AI agents process visitor data; define opt-in/opt-out controls by applicable law.
5. Children's information and whether minors can use workshops, plus guardian approval policies as applicable.
6. Correct legal notices and procedures for rights requests. Do not promise rights or timeframes not actually supported.
7. Cross-check public statements against production code, Stripe, email, CRM, storage, Vercel and any other connected systems.

## Suggested public privacy notice structure after verification
- Who operates the site and how to contact us
- Information you provide / information collected automatically
- How we use and share that information
- Cookies and optional analytics or other tracking
- Third-party learning tools and hosted registration / checkout
- Data retention, deletion and privacy requests
- Security, minors, policy changes and effective date

## Before public terms can be issued
Confirm approved offerings, purchase access, delivery timelines, refund/cancellation policy, academic/educational disclaimers, intellectual-property licenses, customer support, governing law, accessibility contact, and whether any third-party tools have additional terms. Do not claim VA/DoD/SkillBridge endorsement or nonprofit tax status unless verified for that precise claim.

**Go-live gate:** Draft validated `privacy.html` and `terms.html` from the confirmed data inventory, have authorized human/legal review, link both in every relevant footer and customer registration/payment journey, and independently test those links before promotion.

## Existing checkout caution
`api/create-checkout-session.js` at the 2026-10-12 production source revision contains `example.com` redirects and placeholder `price_...`. Do not enable paid routing through this handler before configuring real test-mode settings, verifying signed payment events and entitlements, and passing independent end-to-end delivery tests. Nothing in this packet authorizes charging customers or production deployment.
