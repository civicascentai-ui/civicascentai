// CivicAscent AI release hold: no paid checkouts may be created.
// This fail-closed server endpoint is separate from the free Stripe-hosted
// workshop registration links in /register.html and /registro.html.
// Do not remove this guard until 25 verified sandbox E2E tests, fulfillment,
// independent QC, payment-method verification, and owner release approval.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(403).json({
    code: "PAID_ENROLLMENT_ON_HOLD",
    error: "Paid enrollment is not available. No payment session was created.",
    free_registration: ["/register.html", "/registro.html"]
  });
}
