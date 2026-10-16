# GG v2 activation checklist — 2026-10-16

| Gate | Verified state | Evidence / next requirement |
| --- | --- | --- |
| Dedicated Vercel GG project | VERIFIED | `civicascent-gg-operations`, ID `prj_c7gSGpxeB20g6J1FTAYvPa8AvN0d` |
| No link to live site | VERIFIED | GG project separate; no known live deployment |
| Default model denial | VERIFIED | Four encrypted safety variables, mode self-test, free-tier/model approvals no |
| GG v2 code on GitHub | STAGED | Unmerged draft PR #117, folder `gg-operations`; not a dedicated repo |
| GG v2 automated QA | PENDING GitHub receipt | 14 local unit tests previously passed; reverify with branch CI |
| Separate private GG GitHub repository | BLOCKED | Current GitHub connector has no create-repository action |
| GG-specific Google AI Studio project | BLOCKED | Not created or connected through available tools |
| Free-tier and exact model entitlement | BLOCKED | Google pricing pages are not proof for the connected project |
| Isolated Gemini key | BLOCKED | Do not reuse, print or commit a production key |
| One real Gemini reply | BLOCKED | Not authorized until Free tier, privacy and key are independently verified |
| Independent model output acceptance | BLOCKED | FRIDAY/ZEBRA review after verified response |
| Production site | HOLD | No merge to main, no deployment or external user data |

**Owner's $0 policy:** no billing activation, account upgrade or paid usage; no autonomous requests until every relevant gate is satisfied.

References:
- GG review: https://github.com/civicascentai-ui/civicascentai/pull/117
- GG Vercel: https://vercel.com/civicascentai/civicascent-gg-operations
- Google billing: https://ai.google.dev/gemini-api/docs/billing
- Google model/pricing: https://ai.google.dev/gemini-api/docs/pricing
