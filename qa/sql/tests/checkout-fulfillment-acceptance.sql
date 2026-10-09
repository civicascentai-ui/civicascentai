-- SYNTHETIC isolated CI integration tests. DO NOT APPLY TO CONNECTED SUPABASE.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL ROLE service_role;
DO $check$
DECLARE
  result_text text;
  delivery_id bigint;
  active_count int;
  state_text text;
  refunded bigint;
BEGIN
  -- A: refund can arrive before any completed Checkout event, denying access.
  result_text := public.record_verified_payment_reversal(
    'evt_refundA','charge.refunded','pi_A','ch_A',4900);
  IF result_text <> 'recorded' THEN RAISE EXCEPTION 'A expected refund recorded'; END IF;
  result_text := public.record_verified_checkout_v2(
    'evt_paidA','cs_A','checkout.session.completed','cus_A',
    'alpha@example.invalid','starter',4900,'usd','pi_A');
  IF result_text <> 'recorded' THEN RAISE EXCEPTION 'A verified payment not recorded'; END IF;
  SELECT access_state,refunded_cents INTO state_text,refunded
  FROM checkout_private.entitlements WHERE session_id='cs_A';
  IF state_text <> 'revoked' OR refunded <> 4900 THEN
    RAISE EXCEPTION 'A pre-refund failed to revoke after purchase % %',state_text,refunded;
  END IF;
  SELECT count(*) INTO active_count FROM public.lookup_download_entitlement(
    'alpha@example.invalid','starter');
  IF active_count <> 0 THEN RAISE EXCEPTION 'A refunded purchase downloadable'; END IF;

  -- B: verified purchase yields one active SKU to its confirmed email only.
  result_text := public.record_verified_checkout_v2(
    'evt_paidB','cs_B','checkout.session.completed','cus_B',
    'bravo@example.invalid','facilitator',12900,'usd','pi_B');
  IF result_text <> 'recorded' THEN RAISE EXCEPTION 'B checkout not recorded'; END IF;
  SELECT count(*) INTO active_count FROM public.lookup_download_entitlement(
    'bravo@example.invalid','facilitator');
  IF active_count <> 1 THEN RAISE EXCEPTION 'B owned course unavailable'; END IF;
  SELECT count(*) INTO active_count FROM public.lookup_download_entitlement(
    'other@example.invalid','facilitator');
  IF active_count <> 0 THEN RAISE EXCEPTION 'B wrong-account access'; END IF;
  SELECT count(*) INTO active_count FROM public.lookup_download_entitlement(
    'bravo@example.invalid','starter');
  IF active_count <> 0 THEN RAISE EXCEPTION 'B wrong-SKU access'; END IF;
  delivery_id:=public.record_download_issued(
    'cs_B','facilitator','bravo@example.invalid');
  IF delivery_id IS NULL OR delivery_id < 1 THEN RAISE EXCEPTION 'B missing delivery reservation'; END IF;
  SELECT count(*) INTO active_count FROM checkout_private.delivery_attempts
  WHERE id=delivery_id AND outcome='pending';
  IF active_count<>1 THEN RAISE EXCEPTION 'B reserved download not pending'; END IF;
  IF NOT public.complete_course_download_attempt('cs_B',delivery_id,'sent') THEN
    RAISE EXCEPTION 'B completed stream not committed'; END IF;
  IF public.complete_course_download_attempt('cs_B',delivery_id,'sent') THEN
    RAISE EXCEPTION 'B duplicate stream completion unexpectedly accepted'; END IF;
  SELECT count(*) INTO active_count FROM checkout_private.entitlements
  WHERE session_id='cs_B' AND delivery_status='sent';
  IF active_count<>1 THEN RAISE EXCEPTION 'B delivered entitlement not reflected'; END IF;

  -- C: even PARTIAL refund suspends new access; replay cannot reactivate.
  result_text:=public.record_verified_payment_reversal(
    'evt_partialB','charge.refunded','pi_B','ch_B',100);
  IF result_text<>'recorded' THEN RAISE EXCEPTION 'C partial refund not recorded'; END IF;
  SELECT access_state,refunded_cents INTO state_text,refunded
  FROM checkout_private.entitlements WHERE session_id='cs_B';
  IF state_text<>'held' OR refunded<>100 THEN RAISE EXCEPTION 'C partial hold incorrect'; END IF;
  IF public.record_download_issued('cs_B','facilitator','bravo@example.invalid') IS NOT NULL
    THEN RAISE EXCEPTION 'C refunded purchase downloads'; END IF;
  result_text:=public.record_verified_checkout_v2(
    'evt_paidB','cs_B','checkout.session.completed','cus_B',
    'bravo@example.invalid','facilitator',12900,'usd','pi_B');
  IF result_text<>'recorded' THEN RAISE EXCEPTION 'C original checkout replay failed'; END IF;
  SELECT access_state INTO state_text FROM checkout_private.entitlements
    WHERE session_id='cs_B';
  IF state_text<>'held' THEN RAISE EXCEPTION 'C replay reactivated held purchase'; END IF;
  result_text:=public.record_verified_payment_reversal(
    'evt_partialB','charge.refunded','pi_B','ch_B',100);
  IF result_text<>'duplicate_event' THEN RAISE EXCEPTION 'C duplicated refund not idempotent'; END IF;

  -- D: out-of-order dispute before purchase blocks fulfillment.
  result_text:=public.record_verified_payment_reversal(
    'evt_disputeC','charge.dispute.created','pi_C','ch_C',0);
  result_text:=public.record_verified_checkout_v2(
    'evt_paidC','cs_C','checkout.session.completed','cus_C',
    'charlie@example.invalid','starter',4900,'usd','pi_C');
  SELECT access_state INTO state_text FROM checkout_private.entitlements
    WHERE session_id='cs_C';
  IF state_text<>'held' THEN RAISE EXCEPTION 'D dispute not held'; END IF;
  SELECT count(*) INTO active_count FROM public.lookup_download_entitlement(
    'charlie@example.invalid','starter');
  IF active_count<>0 THEN RAISE EXCEPTION 'D disputed course accessible'; END IF;

  -- E: missing/wrong ledger binding must not activate somebody else's session.
  result_text:=public.record_verified_checkout_v2(
    'evt_wrong_event','cs_B','checkout.session.completed','cus_B',
    'bravo@example.invalid','facilitator',12900,'usd','pi_B');
  SELECT access_state INTO state_text FROM checkout_private.entitlements
    WHERE session_id='cs_B';
  IF state_text<>'held' THEN RAISE EXCEPTION 'E wrong-event replay bypassed held status'; END IF;
  SELECT count(*) INTO active_count FROM checkout_private.entitlements;
  IF active_count<>3 THEN RAISE EXCEPTION 'E added unverified extra entitlement'; END IF;

  -- F: SQL functions are service-role-only and private tables not publicly readable.
  IF has_function_privilege('anon',
     'public.record_verified_checkout_v2(text,text,text,text,text,text,bigint,text,text)','EXECUTE')
    OR has_function_privilege('authenticated',
     'public.lookup_download_entitlement(text,text)','EXECUTE')
    OR has_function_privilege('anon',
     'public.record_verified_payment_reversal(text,text,text,text,bigint)','EXECUTE')
    OR has_table_privilege('anon','checkout_private.entitlements','SELECT')
    OR has_table_privilege('authenticated','checkout_private.refund_events','SELECT')
    THEN RAISE EXCEPTION 'F public access grants accidentally exposed checkout data'; END IF;
  IF NOT has_function_privilege('service_role',
     'public.record_verified_checkout_v2(text,text,text,text,text,text,bigint,text,text)','EXECUTE')
    OR NOT has_function_privilege('service_role',
     'public.record_download_issued(text,text,text)','EXECUTE')
    THEN RAISE EXCEPTION 'F service-role access incomplete'; END IF;
  RAISE NOTICE 'QA PostgreSQL acceptance scenarios A-F PASSED';
END
$check$;
ROLLBACK;
