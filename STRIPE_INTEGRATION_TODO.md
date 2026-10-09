# Stripe Integration TODO

This file tracks the experimental Vercel Checkout endpoint. The current public custom domain is served by GitHub Pages, so this endpoint is not part of the live purchase path unless hosting/DNS is deliberately migrated.

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Field | Current Value | What to Set |
|-------|---------------|-------------|
| mode | payment | Keep `payment` for the current one-time $1 sandbox product. Change to `subscription` only when using a recurring Stripe Price. |
| success_url | https://example.com/success?session_id={CHECKOUT_SESSION_ID} | Your actual post-payment success page URL. Keep the `{CHECKOUT_SESSION_ID}` template. |
| cancel_url | https://example.com/cancel | Your actual cancel/return page URL. |
| line_items[].price | price_... | Your actual Stripe Price ID from the Stripe Dashboard or API. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Parameter | Value |
|-----------|-------|
| ui_mode | hosted_page |
| billing_address_collection | auto |
| phone_number_collection.enabled | false |
| automatic_tax.enabled | false |
| allow_promotion_codes | false |
| submit_type | auto |
| integration_identifier | hosted_web_0001 |
| origin_context | web |

`payment_method_collection` is intentionally omitted because the current placeholder mode is `payment`. Per the Checkout configuration, include `payment_method_collection: "always"` only when mode is `subscription`.

## Setup and Next Steps

1. In Vercel, add the server-only environment variable `STRIPE_SECRET_KEY` using the Stripe sandbox/test secret key. Do not prefix it with `VITE_` and do not commit the secret to GitHub.
2. Do not connect this endpoint to the public GitHub Pages purchase buttons. Replace the URL/Price placeholders only in a sandbox or deliberate runtime migration.
3. Run `npm install` in `prototype-react` so the lockfile/deployment resolves the Stripe dependency.
4. The new server endpoint is `POST /api/create-checkout-session`. It creates a hosted Stripe Checkout Session and returns its `url`; the client should redirect the customer to that URL.
5. Test only in Stripe test/sandbox mode first. Use Stripe's documented test cards, including the standard successful Visa test number `4242 4242 4242 4242`, any future expiry date, and any CVC.
6. After checkout is verified, connect the purchase button/form to this endpoint and verify success and cancellation redirects.
7. Before accepting real purchases, add/verify fulfillment and order tracking. Webhook handling should be added only when the application's fulfillment requirements are defined.

## Project Structure of New Files

- `api/create-checkout-session.js` — Vercel serverless endpoint that creates the hosted Checkout Session.
- `STRIPE_INTEGRATION_TODO.md` — remaining configuration and launch checklist.

## How It Works

The browser sends a POST request to `/api/create-checkout-session`. The Vercel serverless function uses the server-only Stripe secret key to create a Checkout Session. Stripe returns a hosted Checkout URL, which the browser can use to send the customer to Stripe's payment page. Stripe then returns the customer to the configured success or cancel URL.

## Resources

- Stripe Support: https://support.stripe.com
- Stripe MCP documentation: https://docs.stripe.com/mcp


## Current Public-Path Control

- Public custom domain source: GitHub Pages from this repository.
- Current public purchases use Stripe-hosted Payment Links, not `/api/create-checkout-session`.
- Spanish Payment Links must force `?locale=es`.
- The static return page must never be treated as payment proof; Stripe verification is required before fulfillment.
- No live-charge testing is permitted for the 25-purchase QC campaign.
