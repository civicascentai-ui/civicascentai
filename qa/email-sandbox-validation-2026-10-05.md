# CivicAscent AI — Email Sandbox Validation

Date: 2026-10-05
Scope: pre-launch sandbox / controlled end-to-end checks
Production customer mail was not bulk-sent or modified.

## Architecture observed

- Public consultation pages use `mailto:info@civicascentai.com` with prefilled English or Spanish consultation text.
- Workshop registration is separate and uses a Stripe-hosted $0 registration path.
- `info@civicascentai.com` currently delivers into the CivicAscent work Gmail mailbox.
- Resend is configured for `civicascentai.com`, but the domain status is currently **failed**.
- Resend receiving is disabled.

## Controlled round-trip test

1. Sent one clearly labeled sandbox test from a controlled Gmail account to `info@civicascentai.com`.
2. Confirmed it arrived in the CivicAscent work Gmail inbox.
3. Sent a controlled reply from the CivicAscent work Gmail mailbox.
4. Confirmed the reply arrived back at the originating controlled Gmail account.

Result: **PASS — inbound alias delivery and Gmail reply path work.**

Branding observation: the controlled reply was sent as `civicascentai@gmail.com`, not `info@civicascentai.com`.

## Resend domain verification

Resend reports:
- domain: `civicascentai.com`
- status: **failed**
- sending: enabled
- receiving: disabled

Required records reported by Resend:
- DKIM TXT: `resend._domainkey`
- SPF/Mail-From MX: `send` -> `feedback-smtp.us-east-1.amazonses.com`, priority 10
- SPF TXT: `send` -> `v=spf1 include:amazonses.com ~all`
- CNAME: `rsend` -> `send.forge.rmta.net`

Independent DNS queries from the isolated sandbox returned no published value for any of the four records.

Result: **FAIL — Resend transactional sending is not launch-ready.**

## Website email-link checks

### English
Expected target: `info@civicascentai.com`
Expected subject: CivicAscent AI Consultation Request
Expected body fields:
- Organization or group
- Audience and group size
- Training goal
- Preferred timeframe
- Language or accessibility needs

### Spanish
Expected target: `info@civicascentai.com`
Expected subject: Solicitud de consulta CivicAscent AI
Expected body fields:
- Organización o grupo
- Público y tamaño del grupo
- Objetivo de capacitación
- Plazo preferido
- Necesidades de idioma o accesibilidad

Spanish mobile black-box test reached the Spanish consultation page and exposed the correct Spanish prefilled mail request.

## Stress cases for the customer panel

1. Send a normal English consultation request.
2. Send a normal Spanish consultation request.
3. Empty-subject email.
4. Very long but non-sensitive inquiry.
5. Unicode/accented characters in Spanish names and body.
6. Reply/reply-all handling.
7. Duplicate inquiry sent twice.
8. Customer typo in return address or malformed content.
9. Attachment-free path and unexpected attachment path.
10. Attempted prompt-injection text in an inbound message must never trigger privileged actions automatically.
11. No passwords, payment-card data, medical records, SSNs, or other unnecessary sensitive data should be solicited.
12. Failure/bounce must not be represented to a user as successful delivery.

## Launch decision

### PASS
- public `info@` receives mail into the work inbox
- controlled Gmail round-trip delivery works
- Spanish consultation mailto path is correctly localized

### OPEN
- configure/verify Resend DNS
- verify branded outbound From/Reply-To behavior for `info@`
- run controlled Resend transactional send after DNS verifies
- confirm bounce/failure handling
- confirm no duplicate sends under retries

If launch depends only on customer-initiated mailto inquiries, the current Gmail alias path is operational.
If launch depends on automated transactional email from the CivicAscent domain, Resend remains a launch blocker until domain verification and delivery tests pass.
