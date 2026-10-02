# CivicAscent AI — RAG Phase 1 Dense Semantic Retrieval Test

## Test date
2026-10-01

## Stack tested
- Supabase PostgreSQL
- pgvector 0.8.2
- HNSW cosine index
- Supabase Edge Functions
- built-in `gte-small` embedding model (384 dimensions)
- CivicAscent Phase 1 evaluation set: 30 questions

## Corpus status
The dense semantic test ran against **99 embedded chunks from 8 of the 9 approved sources**.

Successfully embedded:
- FRONT_DESK_AGENT_OPERATING_PROCEDURE.md
- AUTOMATION_ENHANCEMENT_BLUEPRINT.md
- TEAM_OPERATING_ORDER.md
- team.html
- capabilities.html
- course.html
- consultation.html
- ai-lab.html

Not embedded in this run:
- programs.html

Reason: the source-builder Edge Function hit the Supabase free-tier worker resource limit during that source's embedding pass. Other sources were retried sequentially and succeeded.

Because `course.html` was also an expected source for the beginner-learning test, all 30 evaluation questions still had at least one valid expected source available.

## Dense semantic retrieval results

- Top-1 accuracy: **93.3%** (28/30)
- Top-3 source recall: **100%** (30/30)
- Top-3 misses: **0**
- Top-1 misses: **2**

### Top-1 miss Q01
Question: **What does CivicAscent AI help beginners learn?**

Top sources:
1. capabilities.html
2. course.html
3. AUTOMATION_ENHANCEMENT_BLUEPRINT.md

Expected:
- programs.html
- course.html

Result: expected source appeared at rank 2.

### Top-1 miss Q03
Question: **Can I ask to speak with a person?**

Top sources:
1. consultation.html
2. course.html
3. FRONT_DESK_AGENT_OPERATING_PROCEDURE.md

Expected:
- FRONT_DESK_AGENT_OPERATING_PROCEDURE.md

Result: expected source appeared at rank 3.

## Comparison

| Retrieval method | Top-1 | Top-3 |
|---|---:|---:|
| Original keyword / TF-IDF baseline | 83.3% | 93.3% |
| Improved sparse BM25 + metadata/aliases | 96.7% | 100% |
| Dense semantic gte-small + pgvector | 93.3% | 100% |

## Interpretation
Dense semantic retrieval successfully fixed meaning-oriented queries such as:
- accessibility ownership
- translation examples
- agent roles
- AI Lab capabilities
- workflow/governance questions

The improved sparse system remains slightly better at Top-1 ranking on this small corpus, while dense semantic retrieval matches it at **100% Top-3 recall**.

This is exactly the condition where a hybrid approach is justified: combine the precise lexical ranking of sparse retrieval with the semantic coverage of dense embeddings.

## Infrastructure findings
- pgvector successfully stored and searched 384-dimensional embeddings.
- HNSW cosine similarity search worked.
- RLS remained enabled.
- Public table access remained restricted to `approved_for_public_use=true`.
- Supabase Security Advisor returned **0 security lints** after the test.
- Temporary ingestion/evaluation Edge Functions were re-locked with JWT verification and disabled test behavior after execution.

## Gate result
**Dense semantic retrieval: PASS WITH ONE INFRASTRUCTURE FOLLOW-UP**

Retrieval quality passed the Top-3 gate at 100%.

Outstanding item:
- embed `programs.html` using a lower-load sequential ingestion pass before declaring the corpus fully complete.

## Recommended next step
Build the Phase 1 **hybrid retrieval** test:
1. dense pgvector similarity
2. sparse BM25/keyword score
3. weighted score fusion
4. rerun the same 30 questions
5. compare against:
   - sparse Top-1: 96.7%
   - dense Top-1: 93.3%
   - both Top-3: 100%

Do not add reranking unless hybrid testing shows a remaining meaningful ranking problem.
