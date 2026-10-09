-- PROPOSED STAGING-ONLY MIGRATION. NOT APPLIED.
-- Requires isolated DB (do NOT apply to CivicAscent RAG/shared project),
-- independent DBA/LPC review, signed sandbox webhook and zero live keys.
-- ALL EXECUTION occurs in an explicit single transaction.
BEGIN;

ALTER TABLE checkout_private.entitlements
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS access_state text NOT NULL DEFAULT 'held',
  ADD COLUMN IF NOT EXISTS refunded_cents bigint NOT NULL DEFAULT 0;

-- Existing entitlements remain held until independently reconciled.
ALTER TABLE checkout_private.entitlements
  ADD CONSTRAINT entitlements_access_state_check
  CHECK (access_state IN ('held','active','revoked'));
ALTER TABLE checkout_private.entitlements
  ADD CONSTRAINT entitlements_refunded_cents_check
  CHECK (refunded_cents >= 0 AND refunded_cents <= amount_total);
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_payment_intent_unique
  ON checkout_private.entitlements(payment_intent_id);

CREATE TABLE IF NOT EXISTS checkout_private.refund_events (
  event_id text PRIMARY KEY,
  payment_intent_id text NOT NULL,
  stripe_charge_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('charge.refunded','charge.dispute.created')),
  refunded_cents bigint NOT NULL CHECK (refunded_cents >= 0),
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS checkout_private.refund_holds (
  payment_intent_id text PRIMARY KEY,
  max_refunded_cents bigint NOT NULL DEFAULT 0 CHECK (max_refunded_cents >= 0),
  dispute_open boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE checkout_private.refund_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_private.refund_holds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON checkout_private.refund_events, checkout_private.refund_holds FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON checkout_private.refund_events,checkout_private.refund_holds TO service_role;

-- The v1 record_verified_checkout RPC continues to create a HELD entitlement.
-- New verified Stripe sessions use v2 to activate only unrefunded purchases.
CREATE OR REPLACE FUNCTION public.record_verified_checkout_v2(
  p_event_id text,p_session_id text,p_event_type text,
  p_customer_id text,p_email text,p_product_code text,
  p_amount bigint,p_currency text,p_payment_intent_id text
) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE v_result text; v_hold checkout_private.refund_holds%ROWTYPE;
BEGIN
  IF p_payment_intent_id !~ '^pi_[a-zA-Z0-9]+$'
  THEN RAISE EXCEPTION 'invalid payment intent'; END IF;
  v_result:=checkout_private.record_paid_checkout(
    p_event_id,p_session_id,p_event_type,p_customer_id,p_email,
    p_product_code,p_amount,p_currency
  );
  IF v_result <> 'recorded' THEN RETURN v_result; END IF;
  SELECT * INTO v_hold FROM checkout_private.refund_holds
    WHERE payment_intent_id=p_payment_intent_id;
  UPDATE checkout_private.entitlements
  SET payment_intent_id=p_payment_intent_id,
      refunded_cents=LEAST(p_amount,COALESCE(v_hold.max_refunded_cents,0)),
      access_state=CASE WHEN v_hold.payment_intent_id IS NULL THEN 'active'
                        WHEN v_hold.dispute_open OR v_hold.max_refunded_cents>0 THEN 'held'
                        ELSE 'active' END
  WHERE session_id=p_session_id;
  RETURN 'recorded';
END;
$$;
REVOKE ALL ON FUNCTION public.record_verified_checkout_v2(text,text,text,text,text,text,bigint,text,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_checkout_v2(text,text,text,text,text,text,bigint,text,text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.record_verified_payment_reversal(
  p_event_id text,p_event_type text,p_payment_intent_id text,
  p_charge_id text,p_refunded_cents bigint
) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE v_amount bigint; v_dispute boolean;
BEGIN
  IF p_event_id !~ '^evt_[a-zA-Z0-9]+$' OR
     p_payment_intent_id !~ '^pi_[a-zA-Z0-9]+$' OR
     p_charge_id !~ '^ch_[a-zA-Z0-9]+$' OR
     p_event_type NOT IN ('charge.refunded','charge.dispute.created') OR
     p_refunded_cents < 0
  THEN RAISE EXCEPTION 'invalid payment reversal'; END IF;
  INSERT INTO checkout_private.refund_events(
    event_id,event_type,payment_intent_id,stripe_charge_id,refunded_cents
  ) VALUES (p_event_id,p_event_type,p_payment_intent_id,p_charge_id,p_refunded_cents)
  ON CONFLICT (event_id) DO NOTHING;
  IF NOT FOUND THEN RETURN 'duplicate_event'; END IF;
  INSERT INTO checkout_private.refund_holds(payment_intent_id,max_refunded_cents,dispute_open)
  VALUES (p_payment_intent_id,p_refunded_cents,p_event_type='charge.dispute.created')
  ON CONFLICT(payment_intent_id) DO UPDATE SET
    max_refunded_cents=GREATEST(checkout_private.refund_holds.max_refunded_cents,EXCLUDED.max_refunded_cents),
    dispute_open=checkout_private.refund_holds.dispute_open OR EXCLUDED.dispute_open,
    updated_at=now();
  SELECT max_refunded_cents,dispute_open INTO v_amount,v_dispute
  FROM checkout_private.refund_holds WHERE payment_intent_id=p_payment_intent_id;
  UPDATE checkout_private.entitlements
  SET refunded_cents=LEAST(amount_total,v_amount),
      access_state=CASE WHEN v_amount>=amount_total THEN 'revoked' ELSE 'held' END
  WHERE payment_intent_id=p_payment_intent_id;
  RETURN 'recorded';
END;
$$;
REVOKE ALL ON FUNCTION public.record_verified_payment_reversal(text,text,text,text,bigint)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_payment_reversal(text,text,text,text,bigint)
  TO service_role;

-- Separate status lookup (older QA-only migration) also remains un-applied.
CREATE OR REPLACE FUNCTION public.lookup_download_entitlement(
  p_verified_email text,p_product_code text
) RETURNS TABLE(session_id text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$
  SELECT e.session_id
  FROM checkout_private.entitlements e
  WHERE p_verified_email IS NOT NULL
    AND length(trim(p_verified_email)) BETWEEN 3 AND 254
    AND lower(trim(e.customer_email))=lower(trim(p_verified_email))
    AND p_product_code IN ('starter','facilitator')
    AND e.product_code=p_product_code
    AND e.access_state='active'
    AND e.refunded_cents=0
  ORDER BY e.issued_at DESC
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.lookup_download_entitlement(text,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_download_entitlement(text,text) TO service_role;

-- Generate signed URL FIRST, then atomically mark sent and log issued download.
-- Locks serialize against refund revocation updates on the same entitlement row.
CREATE OR REPLACE FUNCTION public.record_download_issued(
  p_session_id text,p_product_code text,p_verified_email text
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE v_session text;
BEGIN
  SELECT e.session_id INTO v_session
  FROM checkout_private.entitlements e
  WHERE e.session_id=p_session_id
    AND e.product_code=p_product_code
    AND lower(trim(e.customer_email))=lower(trim(p_verified_email))
    AND e.access_state='active' AND e.refunded_cents=0
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE checkout_private.entitlements
    SET delivery_status='sent' WHERE session_id=v_session;
  INSERT INTO checkout_private.delivery_attempts(
    session_id,outcome,provider_message_id
  ) VALUES(v_session,'sent','private-storage-signed-url-issued');
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.record_download_issued(text,text,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_download_issued(text,text,text) TO service_role;

COMMIT;
