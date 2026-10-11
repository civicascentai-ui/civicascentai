# CivicAscent AI | SCOUT Technology Reserve Register
Date: 2026-10-11
Scope: Resources shown in user-provided LLM Tools Cheatsheet. Initial inventory only; no claim of current pricing, versions, licenses or integration. Status is proposed, not installed verification.

## Governance
Keep technologies discoverable without installing, paying for or connecting them. Each entry requires owner, category, use case, alternative, activation trigger, license/cost verification, privacy/security review, proof of compatibility, QA test and rollback plan. SCOUT may recommend; FRIDAY reviews security, SAM tests, CODI prioritizes, independent QC accepts. Never violate constitutional guardrails or zero-new-spend constraint.

## Category inventory
- General-purpose LLM providers: Claude (Anthropic), OpenAI, Gemini (Google), Llama (Meta), Mistral AI, Grok (xAI), DeepSeek, Cohere, AI21 Labs. Status: RESERVE. Trigger: current model cannot meet cost, privacy, language or quality targets; evaluate provider terms and total usage costs.
- Multi-agent: AutoGen, CrewAI, SuperAGI, CAMEL-AI, MGX, Manus, AgentVerse, LangGraph, AutoGPT. LangGraph/CrewAI: REQUESTED PILOTS, NOT VERIFIED. Others: RESERVE. Trigger: measurable gap in existing orchestration.
- Application frameworks: LangChain, LlamaIndex, Haystack, OpenLLM, Semantic Kernel, DSPy, Guardrails AI. RESERVE; evaluate LlamaIndex for document indexing and Guardrails AI for structured validation, only if current stack insufficient.
- Prompt engineering and observability: PromptLayer, Promptable, Langfuse, ChainForge, PromptPerfect, PromptTools. Langfuse: PRIORITY EVALUATION, not installed. Others: RESERVE. Trigger: need audited traces/evaluation or prompt regression tracking.
- Vector and retrieval stores: FAISS, ChromaDB, Pinecone, Weaviate, Redis, Qdrant, Milvus. Prefer existing Supabase Postgres with pgvector if compatible and available; other products RESERVE. Note vector search does not substitute structured backup, event log, restore test or isolated failure domain.
- No/low-code: Flowise, Langflow, n8n, Replit, Cursor, Lovable, Chatbase, Relevance AI, v0. Replit: EXISTING QA DEVELOPMENT ENVIRONMENT; n8n and Flowise: EVALUATE LATER; others: RESERVE. Trigger: verified automation need with free-within-budget implementation.

## Prioritized activation sequence
1. Verify existing LangGraph and CrewAI pilots actually installed and executed; record PASS/FAIL.
2. Verify persistent structured memory, restart-and-recall and Shadow House recovery drill.
3. Evaluate Supabase pgvector, or FAISS/Chroma as offline fallback, only after access, costs and privacy confirmed.
4. Evaluate Langfuse if test evidence shows need for better tracing.
5. Evaluate n8n only if scheduled execution cannot be achieved with current resources.
6. Keep other products searchable in SCOUT's warehouse; do not preauthorize installation.

## Research record fields
Name; vendor; official URL; category; status; business problem; activation trigger; benefits; risks; license; costs; source checked date; security notes; existing integrations; candidate owner; QC evidence; decision; next review date.

## Safety and claims
Public-source monitoring only when approved active connector and schedule are demonstrated. Do not claim comprehensive web coverage, subscriptions, installs or current prices from a static diagram. Never automatically upgrade or deploy.
