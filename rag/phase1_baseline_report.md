# CivicAscent AI — RAG Phase 1 Baseline Test Report

## Test performed
Date: 2026-10-01

This test measured a **local keyword / TF-IDF retrieval baseline** across the approved Phase 1 corpus.

It did **not** test:
- Qdrant
- dense embeddings
- hybrid retrieval
- reranking
- generated answers

The purpose was to establish a cheap baseline before adding more retrieval complexity.

## Corpus
- Approved source files: 9
- Generated text chunks: 34
- Evaluation questions: 30

## Results
- Top-1 source accuracy: **83.3%**
- Top-3 source recall: **93.3%**
- Top-3 misses: **2 of 30**

## Misses

### Q09
Question: **Who is responsible for accessibility testing?**

Expected:
- `team.html`
- `TEAM_OPERATING_ORDER.md`

Retrieved top 3:
1. `AUTOMATION_ENHANCEMENT_BLUEPRINT.md`
2. `capabilities.html`
3. `programs.html`

Assessment:
The keyword baseline matched generic accessibility language but missed the authoritative role definition. Hybrid or semantic retrieval should improve this, and role metadata can provide an additional boost.

### Q15
Question: **Does CivicAscent offer translation examples?**

Expected:
- `ai-lab.html`

Retrieved top 3:
1. `FRONT_DESK_AGENT_OPERATING_PROCEDURE.md`
2. `AUTOMATION_ENHANCEMENT_BLUEPRINT.md`
3. `team.html`

Assessment:
The AI Lab contains the intended translation experience, but keyword extraction from the HTML diluted the relevant content. Better HTML cleaning, section-aware chunking, semantic embeddings, or title/section metadata should improve retrieval.

## Findings
1. The selected corpus is already coherent enough to produce a strong keyword baseline.
2. 93.3% top-3 recall gives us a useful comparison point for dense and hybrid retrieval.
3. Role/responsibility questions need stronger metadata or semantic matching.
4. Dynamic HTML pages need section-aware parsing rather than broad page-level text extraction.
5. There is no reason to add reranking yet. Dense and hybrid retrieval should be measured first.

## Next test
Implement the Qdrant test collection `civicascent_phase1_frontdesk` and run the same 30 questions through:
1. Dense retrieval
2. Sparse retrieval
3. Hybrid retrieval

Compare each against this baseline:
- Top-1 accuracy: 83.3%
- Top-3 recall: 93.3%

Only add reranking if one of those methods still leaves meaningful retrieval errors.

## Gate status
**Baseline test: PASS**

Reason:
The baseline is measurable, reproducible, and strong enough to serve as a valid comparison point for Phase 1 retrieval experiments.

**Phase 1 overall: NOT COMPLETE**

Qdrant indexing and dense/hybrid testing remain outstanding.
