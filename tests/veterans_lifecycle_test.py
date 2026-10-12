#!/usr/bin/env python3
"""Friday/Sam Veterans checkout lifecycle regression gate. Offline synthetic cases only."""
import unittest

def transition(state, event, verified=False):
    if event == "payment_succeeded":
        return "active" if verified and state == "held" else state
    if event in ("payment_refunded", "payment_disputed"):
        return "revoked" if verified and state == "active" else state
    return state

class VeteransLifecycleTests(unittest.TestCase):
    def test_unsigned_payment_does_not_grant_access(self):
        self.assertEqual(transition("held", "payment_succeeded"), "held")
    def test_signed_payment_grants_access(self):
        self.assertEqual(transition("held", "payment_succeeded", True), "active")
    def test_duplicate_event_is_idempotent(self):
        self.assertEqual(transition("active", "payment_succeeded", True), "active")
    def test_refund_revokes(self):
        self.assertEqual(transition("active", "payment_refunded", True), "revoked")
    def test_unsigned_refund_no_change(self):
        self.assertEqual(transition("active", "payment_refunded"), "active")
    def test_replay_cannot_restore_refunded_access(self):
        self.assertEqual(transition("revoked", "payment_succeeded", True), "revoked")
    def test_dispute_revokes(self):
        self.assertEqual(transition("active", "payment_disputed", True), "revoked")
    def test_unknown_event_no_change(self):
        self.assertEqual(transition("held", "unknown", True), "held")

if __name__ == "__main__":
    unittest.main(verbosity=2)
