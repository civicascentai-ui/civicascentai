#!/usr/bin/env python3
"""CivicAscent Safari scene release eligibility check. Fail closed while not approved."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
s=json.loads((ROOT/"docs/operations/SAFARI_RELEASE_GATE_2026-10-12.json").read_text(encoding="utf-8"))
required=("production_approved","owner_visual_approved","independent_qc_approved","media_license_verified","watermark_free_all_scenes")
blocks=[name for name in required if s.get(name) is not True]
if len(s.get("scene_media",[]))!=5: blocks.append("scene_count")
for scene in s.get("scene_media",[]):
    asset=scene.get("asset")
    if not asset or not (ROOT/asset).is_file():blocks.append("scene_%s_missing_media"%scene.get("scene"))
    if scene.get("status")!="RELEASE_ACCEPTED":blocks.append("scene_%s_not_accepted"%scene.get("scene"))
if s.get("status")!="APPROVED":blocks.append("release_status")
result={"gate":"five-scene-safari-release","status":"HOLD" if blocks else "PASS","blocking_conditions":blocks}
print(json.dumps(result,indent=2))
if blocks: raise SystemExit("RELEASE HELD: no automatic production merge; this is an expected intentional hold.")
