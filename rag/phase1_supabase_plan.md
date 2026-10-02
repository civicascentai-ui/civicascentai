# CivicAscent AI — Vector Backend Fix

## Decision
Use **Supabase PostgreSQL + pgvector** as the Phase 1 vector backend candidate.

## Why
- Free plan is available for small prototypes.
- pgvector is supported directly in Supabase.
- Keeps structured metadata and vector search in one database.
- HNSW indexing is supported.
- Fits the existing no-unapproved-paid-add-on rule.
- Easier to inspect and govern than adding a second database solely for vectors.

## Phase 1 configuration
- Collection/table: `rag_documents`
- Embedding size: 384 dimensions for the initial pilot
- Similarity: cosine
- Index: HNSW
- Corpus: 9 approved documents
- Evaluation set: 30 questions
- Production use: prohibited until dense + hybrid tests pass

## Security model
Public-facing Maya retrieval must filter to `approved_for_public_use=true`.
Internal retrieval requires an explicit internal flag and remains subject to CivicAscent security and governance rules.

## Implementation status
Schema is prepared in:
`rag/supabase_vector_schema.sql`

Actual database creation requires a connected Supabase workspace. Once connected:
1. create a test project or confirm an existing test project
2. enable pgvector
3. apply the schema
4. ingest section-aware chunks
5. generate 384-dimension embeddings
6. run the 30-question dense retrieval test
7. compare against the current sparse baseline
8. add hybrid retrieval only after dense results are recorded
