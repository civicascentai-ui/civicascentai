#!/usr/bin/env python3
"""Structural preflight of public, non-identifying Veterans outside-test materials.

This MUST NOT be treated as evidence of human participation or WCAG conformance.
"""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
PACKET = ROOT / "docs/veterans/2026-10-15-outside-human-test-packet.md"
TRACKER = ROOT / "docs/veterans/2026-10-15-reviewer-referral-tracker.md"


class VeteransOutsideHumanTestPacketQC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.packet = PACKET.read_text(encoding="utf-8")
        cls.tracker = TRACKER.read_text(encoding="utf-8")

    def test_no_claims_of_completed_human_testing(self):
        for phrase in ("0 of 5 tested", "0/5 observed", "NOT conducted",
                       "0 confirmed", "TEST = BLOCKED"):
            self.assertIn(phrase, self.packet + self.tracker)

    def test_real_human_roles_and_independent_qc(self):
        for phrase in ("Facilitator", "military-connected reviewer",
                       "accessibility reviewer", "FRIDAY/QC",
                       "independent", "90-minute"):
            self.assertIn(phrase.lower(), self.packet.lower())

    def test_voluntary_consent_and_safe_data(self):
        for phrase in ("consent", "fictional", "offline",
                       "military records", "medical", "government ID",
                       "do not record audio/video", "public GitHub"):
            self.assertIn(phrase.lower(), self.packet.lower())

    def test_five_outside_test_identifiers_and_scoring(self):
        self.assertIn("P01–P05", self.packet)
        self.assertIn("4/5", self.packet)
        self.assertIn("assessment_correct_0_to_5", self.packet)
        self.assertIn("NOT_TESTED", self.packet)

    def test_two_distinct_reviewer_roles(self):
        self.assertIn("Reviewer A (veteran relevance)", self.packet)
        self.assertIn("Reviewer B (accessibility)", self.packet)
        self.assertIn("screen-reader", self.packet.lower())

    def test_recruitment_is_not_misrepresented(self):
        for term in ("NOT SENT", "NO TESTERS CONFIRMED", "NO", "NOT RECRUITED"):
            if term == "NOT RECRUITED":
                continue
            self.assertIn(term, self.tracker)
        self.assertNotIn("5/5 CONFIRMED", self.tracker)
        self.assertIn("0/5 observed", self.tracker)

    def test_no_unauthorized_approval_or_spend(self):
        both = self.packet + self.tracker
        for term in ("$0", "HOLD", "SkillBridge", "GI Bill", "VA",
                     "no purchase", "separate", "privacy"):
            self.assertIn(term.lower(), both.lower())

    def test_source_is_real_link_not_mocked(self):
        self.assertRegex(self.packet, r"https://docs\\.google\\.com/document/d/[A-Za-z0-9_-]+/edit")

if __name__ == "__main__":
    unittest.main()
