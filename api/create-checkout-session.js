// QA fail-closed replacement for the old example Stripe Checkout API.
// This route intentionally creates no sessions or charges. Activation requires
// verified learner identity, real environment-specific price IDs, fulfillment,
// refund/revoke controls, and separate release approval.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(503).json({
    error: 'Course checkout is disabled until verified learner fulfillment is approved'
  });
}
