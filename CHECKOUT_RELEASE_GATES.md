# Checkout release gates (QA only)

The production site is GitHub Pages and cannot execute /api/stripe-webhook.js.
The serverless handler is an un-deployed safety scaffold, not fulfillment.

## Must complete before activation
1. Choose and provision a serverless host and persistent entitlement database.
2. Install dependencies and configure Stripe secret key and webhook signing secret in the host's secrets manager. Never commit credentials.
3. Implement an idempotent transaction keyed by Stripe event ID and Checkout Session ID, with verified product/price mapping, purchaser identification, entitlement issuance, delivery, and retry handling.
4. Require a verified paid Checkout Session for any purchase confirmation. Never infer payment from query parameters or return navigation.
5. Use a separate Stripe sandbox account/context and test webhook endpoint before live setup. Never run purchase tests against live $49/$129 payment links.
6. Test successful, failed, canceled, delayed, repeated, out-of-order, and $0 events; test email delivery and license access.
7. Record 25 independent sandbox end-to-end purchases and independent human acceptance evidence.
8. Only after approval, configure the real Stripe webhook URL and deploy a verified implementation.

Status: BLOCKED. This QA branch does not authorize production deployment or live Stripe changes.
