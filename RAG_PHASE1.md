# CivicAscent AI — RAG Phase 1 Pilot

## Objective
Build a small, controlled retrieval pilot for Maya Brooks (Front Desk Agent) using approved CivicAscent sources only.

## Phase 1 scope
- No production deployment.
- No paid vector service.
- No autonomous actions.
- Retrieval only.
- English-first pilot; Spanish content may be added after baseline quality is measured.
- Public and approved operational material only.

## Pilot source set
The initial corpus is intentionally small and high-trust:
1. FRONT_DESK_AGENT_OPERATING_PROCEDURE.md
2. AUTOMATION_ENHANCEMENT_BLUEPRINT.md
3. TEAM_OPERATING_ORDER.md
4. team.html
5. capabilities.html
6. programs.html
7. course.html
8. consultation.html
9. ai-lab.html

## Metadata schema
Each indexed chunk must carry:
- source_path
- document_name
- document_type
- version
- language
- status
- agent_owner
- approved_for_public_use
- approved_for_agent_action
- security_classification
- effective_date
- canonical_url (when applicable)

## Retrieval baseline
Test three retrieval modes independently:
1. Dense semantic retrieval
2. Sparse / keyword retrieval
3. Hybrid retrieval

Do not add reranking until baseline measurements exist.

## Evaluation standard
Use the questions in `rag/phase1_eval_questions.json`.

For each question, record:
- expected source
- top-1 source
- top-3 sources
- whether the expected source appears in top 3
- whether the returned passage actually supports the answer
- whether Maya should answer, route, or escalate

Primary baseline metric:
**Top-3 source recall**

Secondary metrics:
- top-1 accuracy
- unsupported-answer rate
- correct escalation rate
- average retrieval latency

## Pass gate
Phase 1 may advance only when:
- every source in the manifest exists
- metadata is complete
- there are no restricted/private sources in the pilot
- at least 25 evaluation questions have been tested
- top-3 recall is measured
- unsupported answers are logged
- Maya's escalation rules remain intact
- Naomi (Security) and Ruth (QA/Accessibility) review the pilot results

## Target architecture
Approved source files
→ clean text
→ chunk
→ metadata
→ embeddings + sparse terms
→ Qdrant test collection
→ retrieve
→ compare dense / sparse / hybrid
→ return evidence to Maya
→ answer / route / escalate

## Collection name
`civicascent_phase1_frontdesk`

## Hard restrictions
This pilot must not:
- ingest passwords, credentials, private keys, banking details, or sensitive personal data
- modify source documents
- publish answers automatically
- schedule appointments automatically
- make business commitments
- bypass existing human handoff rules

## Owners
- Marcus Lee — implementation
- Maya Brooks — pilot consumer
- Ruth Bennett — retrieval QA and accessibility
- Victor Hale — critical evaluation
- Naomi Grant — security and data-boundary review
- Adrian Wells — coordination and final pilot summary
