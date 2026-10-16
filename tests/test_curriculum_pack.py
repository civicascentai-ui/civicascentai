"""Deterministic Blue Crew curriculum source checks, not independent human teaching QA."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "curriculum"

def read(name):
    return (SOURCE / name).read_text(encoding="utf-8")

class CurriculumGate(unittest.TestCase):
    def test_existing_level1_five_audio_files(self):
        course = (ROOT / "course.html").read_text(encoding="utf-8")
        self.assertIn("lessons.forEach",course)
        for n in range(1,6):
            p=ROOT/"assets"/"audio"/f"lesson-{n}.mp3"
            self.assertTrue(p.is_file(),str(p))
            self.assertGreater(p.stat().st_size,50000,str(p))
            self.assertIn(f"lesson-{n}.mp3",course)
        self.assertIn("transcript-text",course)

    def test_level1_qc_not_falsely_marked_executed(self):
        text=read("level1_delivery_qc.md")
        for token in ("NOT EXECUTED","NOT RUN","FRIDAY","transcript","keyboard","MP3"):
            self.assertIn(token.lower(),text.lower())

    def test_level2_has_4_sessions_assessment_and_rubric(self):
        text=read("level2_applied_ai_workbook.md")
        self.assertEqual(len(re.findall(r"^## Session [1-4]:",text,re.M)),4)
        for token in ("answer key","scoring rubric","privacy","worksheets","Goal","Context","Constraints","Output"):
            self.assertIn(token.lower(),text.lower())
        self.assertGreaterEqual(len(re.findall(r"^\d+\. ",text,re.M)),6)

    def test_level3_has_4_sessions_and_evidence_gates(self):
        text=read("level3_agent_workbook.md")
        self.assertEqual(len(re.findall(r"^## Session [1-4]:",text,re.M)),4)
        for token in ("ZEBRA","FRIDAY","SCOUT","SAM","REACH","VET REP","NOT RUN","Human approval","answer key"):
            self.assertIn(token.lower(),text.lower())

    def test_veterans_supplement_protects_learner_data(self):
        text=read("veterans_adaptation_pilot.md")
        for token in ("fictional","DD214","outside","human","accessibility","pilot not delivered"):
            self.assertIn(token.lower(),text.lower())
        self.assertNotIn("guaranteed job placement",text.lower())

    def test_all_are_review_only_no_payment_or_live_enrollment(self):
        names=("level1_delivery_qc.md","level2_applied_ai_workbook.md","level3_agent_workbook.md","veterans_adaptation_pilot.md")
        for name in names:
            text=read(name).lower()
            self.assertTrue(any(t in text for t in ("review draft","qa prepared")),name)
            self.assertNotIn("buy.stripe.com/",text,name)
            self.assertNotIn("book.stripe.com/",text,name)
            self.assertNotIn("<form",text,name)

if __name__=="__main__":
    unittest.main()
