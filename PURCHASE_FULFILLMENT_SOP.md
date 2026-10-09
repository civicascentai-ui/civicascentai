# CivicAscent AI Purchase Verification & Fulfillment SOP

Status: launch-QC candidate
Scope: Starter and Facilitator one-time digital purchases
Control principle: Stripe is the payment system of record. A browser return page is never payment proof.

## 1. Order verification gate

Before any paid material is delivered, verify in Stripe that the order is associated with the expected CivicAscent offer and that payment is successfully completed.

Record the minimum operational evidence needed:
- Stripe Checkout Session ID, when available
- Stripe PaymentIntent or charge reference, when available
- purchaser email used at checkout
- purchased offer
- expected and observed amount
- payment status
- verification timestamp
- fulfillment status

Do not copy full card data or other unnecessary payment information into CivicAscent records.

## 2. Fulfillment eligibility

Fulfill only when the Stripe payment record supports successful payment for the expected product and amount.

Do not fulfill when the transaction is:
- failed
- canceled
- unpaid
- incomplete
- disputed as a duplicate
- otherwise not positively verified

A static thank-you page, screenshot, forwarded email, or customer statement by itself does not satisfy this gate.

## 3. Duplicate-prevention control

Treat the Stripe Checkout Session ID as the primary fulfillment key when it is available.

Before delivery:
1. Check whether that session has already been fulfilled.
2. If already fulfilled, do not send a second package automatically.
3. If the purchaser reports missing access, verify the original order and resend the same approved package only after checking the existing fulfillment record.

One successful payment should create one fulfillment record.

## 4. Product mapping

Starter:
- Public offer: Beginner Starter Digital Kit — Level 1 AI & Prompt Fundamentals
- Expected production price: $49.00 USD one-time
- Stripe may display: CivicAscent AI Level 1 — AI & Prompt Fundamentals

Facilitator:
- Public offer: Beginner Facilitator Kit
- Expected production price: $129.00 USD one-time

Any price or product mismatch is a HOLD and must be reviewed before delivery.

## 5. Delivery control

Deliver only the approved/frozen package associated with the purchased offer.

Do not alter frozen learner or facilitator packages while fulfilling an order.

For every fulfillment, preserve evidence of:
- the verified Stripe order reference
- the package/version delivered
- the delivery action or message reference
- delivery status
- any support follow-up

Do not mark an order complete merely because a payment succeeded.

## 6. Customer-facing confirmation

The public return page may state that checkout returned and that CivicAscent is verifying the order.

It must not state that payment is complete unless that state is derived from verified Stripe data.

If a checkout reference is missing, the customer should be directed to keep their Stripe receipt and contact Course Access Help.

## 7. Sandbox QC

The 25-purchase launch campaign must run only in a positively established Stripe sandbox/test environment.

Required evidence for each sandbox run:
- correct product
- correct price
- Checkout loads
- expected simulated payment outcome
- Stripe session/transaction record
- correct return behavior
- receipt/order evidence appropriate to sandbox limitations
- delivery/fulfillment simulation
- duplicate/retry behavior where applicable
- PASS/FAIL and defect ID

No live-mode charge may be created for the campaign.

## 8. Release rule

Purchase/fulfillment QC remains HOLD until:
- 25 sandbox end-to-end purchase runs pass under the saved five-agent campaign
- each standing tester-agent completes five runs
- Starter and Facilitator product/price mapping is correct
- return-page behavior is truthful
- fulfillment/delivery is verified
- duplicate/retry controls are verified
- no unresolved High or Medium purchase defect remains

Human or production actions that require explicit approval remain governed by CivicAscent's existing release controls.
