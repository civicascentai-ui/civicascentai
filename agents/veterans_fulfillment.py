"""Isolated Veterans fulfillment state engine. No production payment integration.

The caller MUST verify payment-provider signatures and trusted product/amount/customer
metadata before invoking apply_event. Never use this module as a webhook endpoint.
"""
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS processed_events (
 event_id TEXT PRIMARY KEY, payment_id TEXT NOT NULL, event_type TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS entitlements (
 payment_id TEXT PRIMARY KEY, learner_id TEXT NOT NULL,
 course_id TEXT NOT NULL, status TEXT NOT NULL
);
"""

def initialize(db):
    db.executescript(SCHEMA)

def apply_event(db, *, event_id, event_type, payment_id, learner_id,
                course_id, signature_verified=False, order_verified=False):
    """Apply trusted provider events atomically; never reactivate revoked access."""
    if not signature_verified or not order_verified:
        raise ValueError("verified signature and validated order required")
    if not all(isinstance(x, str) and x.strip() for x in
               (event_id, event_type, payment_id, learner_id, course_id)):
        raise ValueError("event identifiers must be nonempty strings")
    if event_type not in ("payment_succeeded", "payment_refunded", "payment_disputed"):
        raise ValueError("unsupported event type")
    with db:
        seen = db.execute("SELECT 1 FROM processed_events WHERE event_id=?", (event_id,)).fetchone()
        if seen:
            return "duplicate"
        current = db.execute(
            "SELECT learner_id, course_id, status FROM entitlements WHERE payment_id=?",
            (payment_id,)
        ).fetchone()
        if current and current[:2] != (learner_id, course_id):
            raise ValueError("payment identity mismatch")
        if event_type == "payment_succeeded":
            if current is None:
                db.execute("INSERT INTO entitlements VALUES (?,?,?,?)",
                           (payment_id, learner_id, course_id, "active"))
        else:
            if current is None:
                db.execute("INSERT INTO entitlements VALUES (?,?,?,?)",
                           (payment_id, learner_id, course_id, "revoked"))
            else:
                db.execute("UPDATE entitlements SET status='revoked' WHERE payment_id=?",
                           (payment_id,))
        db.execute("INSERT INTO processed_events VALUES (?,?,?)",
                   (event_id, payment_id, event_type))
    return "processed"

def has_access(db, learner_id, course_id):
    return db.execute(
        "SELECT 1 FROM entitlements WHERE learner_id=? AND course_id=? AND status='active' LIMIT 1",
        (learner_id, course_id)
    ).fetchone() is not None
