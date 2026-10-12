"""Offline persistence, authorization and event-ordering checks."""
import sqlite3
import unittest
from agents.veterans_fulfillment import initialize, apply_event, has_access

class FulfillmentTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        initialize(self.db)
        self.args = dict(payment_id="p1", learner_id="l1", course_id="veterans",
                         signature_verified=True, order_verified=True)
    def event(self, eid, typ, **overrides):
        return apply_event(self.db, event_id=eid, event_type=typ,
                           **(self.args | overrides))
    def test_grant(self):
        self.event("e1", "payment_succeeded")
        self.assertTrue(has_access(self.db, "l1", "veterans"))
        self.assertFalse(has_access(self.db, "other", "veterans"))
    def test_signature_required(self):
        with self.assertRaises(ValueError):
            self.event("e1", "payment_succeeded", signature_verified=False)
        self.assertFalse(has_access(self.db, "l1", "veterans"))
    def test_order_required(self):
        with self.assertRaises(ValueError):
            self.event("e1", "payment_succeeded", order_verified=False)
    def test_idempotent(self):
        self.event("e1", "payment_succeeded")
        self.assertEqual(self.event("e1", "payment_succeeded"), "duplicate")
    def test_refund(self):
        self.event("e1", "payment_succeeded")
        self.event("e2", "payment_refunded")
        self.assertFalse(has_access(self.db, "l1", "veterans"))
    def test_dispute(self):
        self.event("e1", "payment_succeeded")
        self.event("e2", "payment_disputed")
        self.assertFalse(has_access(self.db, "l1", "veterans"))
    def test_refund_before_payment(self):
        self.event("e1", "payment_refunded")
        self.event("e2", "payment_succeeded")
        self.assertFalse(has_access(self.db, "l1", "veterans"))
    def test_replay_after_refund(self):
        self.event("e1", "payment_succeeded")
        self.event("e2", "payment_refunded")
        self.event("e3", "payment_succeeded")
        self.assertFalse(has_access(self.db, "l1", "veterans"))
    def test_identity_mismatch(self):
        self.event("e1", "payment_succeeded")
        with self.assertRaises(ValueError):
            self.event("e2", "payment_refunded", learner_id="other")
    def test_bad_event(self):
        with self.assertRaises(ValueError):
            self.event("e1", "unknown")
    def test_empty_id(self):
        with self.assertRaises(ValueError):
            self.event("", "payment_succeeded")
    def test_db_persistence(self):
        self.event("e1", "payment_succeeded")
        self.db.commit()
        self.assertEqual(self.db.execute("SELECT status FROM entitlements").fetchone()[0], "active")

if __name__ == "__main__":
    unittest.main()
