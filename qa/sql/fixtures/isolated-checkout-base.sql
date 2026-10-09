-- CI-ONLY base schema fixture modelled on read-only October 9 Supabase schema audit.
-- SYNTHETIC records; PostgreSQL service container only. NEVER deploy this file.
CREATE ROLE service_role NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA checkout_private;
REVOKE ALL ON SCHEMA checkout_private FROM PUBLIC;
GRANT USAGE ON SCHEMA checkout_private TO service_role;

CREATE TABLE checkout_private.stripe_events (
  event_id text PRIMARY KEY,
  session_id text,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_status text NOT NULL DEFAULT 'pending'
    CHECK(processing_status IN ('pending','processed','ignored','failed'))
);
CREATE TABLE checkout_private.entitlements (
  session_id text PRIMARY KEY,
  stripe_event_id text NOT NULL UNIQUE REFERENCES checkout_private.stripe_events(event_id),
  stripe_customer_id text,
  customer_email text,
  product_code text NOT NULL CHECK(product_code IN ('starter','facilitator')),
  amount_total bigint NOT NULL CHECK(amount_total>0),
  currency text NOT NULL CHECK(currency='usd'),
  issued_at timestamptz NOT NULL DEFAULT now(),
  delivery_status text NOT NULL DEFAULT 'pending'
    CHECK(delivery_status IN ('pending','sent','failed')),
  CONSTRAINT checkout_amount_matches_product CHECK(
    (product_code='starter' AND amount_total=4900) OR
    (product_code='facilitator' AND amount_total=12900)
  )
);
CREATE TABLE checkout_private.delivery_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id text NOT NULL REFERENCES checkout_private.entitlements(session_id),
  attempt_at timestamptz NOT NULL DEFAULT now(),
  outcome text NOT NULL CHECK(outcome IN ('pending','sent','failed')),
  provider_message_id text,
  error_code text
);
ALTER TABLE checkout_private.stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_private.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_private.delivery_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA checkout_private FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA checkout_private TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA checkout_private TO service_role;

-- Representative fixture simulates existing Stripe-validated v1 ledger,
-- intentionally returning 'inserted' rather than hardcoded 'recorded'.
-- Exact shared-project v1 function definition is not included in this fixture.
CREATE FUNCTION checkout_private.record_paid_checkout(
  p_event_id text,p_session_id text,p_event_type text,
  p_customer_id text,p_email text,p_product_code text,
  p_amount bigint,p_currency text
) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
BEGIN
  INSERT INTO checkout_private.stripe_events(event_id,session_id,event_type,processing_status)
  VALUES(p_event_id,p_session_id,p_event_type,'processed')
  ON CONFLICT(event_id) DO NOTHING;
  INSERT INTO checkout_private.entitlements(
    session_id,stripe_event_id,stripe_customer_id,customer_email,product_code,amount_total,currency
  ) VALUES(p_session_id,p_event_id,p_customer_id,p_email,p_product_code,p_amount,p_currency)
  ON CONFLICT(session_id) DO NOTHING;
  RETURN 'inserted';
END;
$$;
REVOKE ALL ON FUNCTION checkout_private.record_paid_checkout(text,text,text,text,text,text,bigint,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION checkout_private.record_paid_checkout(text,text,text,text,text,text,bigint,text)
  TO service_role;
