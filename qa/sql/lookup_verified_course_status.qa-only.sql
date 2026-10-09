-- QA DESIGN ONLY. DO NOT APPLY to production or the shared RAG database.
-- Requires reviewed, isolated Supabase preview/staging database approval.
-- The endpoint using this RPC returns PURCHASE STATUS ONLY; no access grant.
BEGIN;

CREATE OR REPLACE FUNCTION public.lookup_verified_course_status(p_verified_email text)
RETURNS TABLE(product_code text, delivery_status text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT e.product_code, e.delivery_status
  FROM checkout_private.entitlements AS e
  WHERE p_verified_email IS NOT NULL
    AND length(trim(p_verified_email)) BETWEEN 3 AND 254
    AND lower(trim(e.customer_email)) = lower(trim(p_verified_email))
    AND e.product_code IN ('starter', 'facilitator');
$$;

REVOKE ALL ON FUNCTION public.lookup_verified_course_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_verified_course_status(text) TO service_role;

COMMIT;
