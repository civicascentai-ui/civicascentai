# CivicAscent AI — RAG Phase 1 Sparse Retrieval Test v3

## Test date
2026-10-01

## Method
Section-aware BM25 sparse retrieval with document metadata and retrieval aliases.

This is still **not** a Qdrant dense/hybrid test. It is the improved sparse baseline used before provisioning the vector layer.

## Corpus
- 9 approved source files
- 115 section-aware chunks
- 30 evaluation questions

## Results
- Top-1 accuracy: **96.7%**
- Top-3 recall: **100%**
- Top-3 misses: **0 of 30**
- Top-1 misses: **1 of 30**

## Remaining top-1 miss
### Q17
Question: **Can CivicAscent start with a pilot workshop?**

Ranked sources:
1. `consultation.html`
2. `capabilities.html`
3. `programs.html`

Expected source:
- `capabilities.html`

Assessment:
This is acceptable for top-3 retrieval because both the consultation and capabilities pages are closely related to the request. The authoritative pilot-workshop detail remains available in the retrieved set.

## Improvement from baseline
Original baseline:
- Top-1: 83.3%
- Top-3: 93.3%

Current:
- Top-1: 96.7%
- Top-3: 100%

Change:
- Top-1 improved by **13.4 percentage points**
- Top-3 improved by **6.7 percentage points**

## Defects corrected
The previous misses were:
- Q09 accessibility ownership
- Q15 translation examples

Both now retrieve an expected source within the top 3 after:
- section-aware chunking
- document metadata enrichment
- targeted retrieval aliases

## Gate result
**Sparse retrieval baseline v3: PASS**

No known top-3 retrieval defects remain in the 30-question Phase 1 evaluation set.

## Next gate
Run the same evaluation set against:
1. dense semantic retrieval
2. sparse retrieval in the selected vector engine
3. hybrid retrieval

Do not add reranking unless dense/hybrid testing demonstrates a need.
