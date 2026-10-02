-- CivicAscent AI RAG Phase 1 — Supabase pgvector schema
-- Test-only. Do not run against production without QA/security approval.

create extension if not exists vector;

create table if not exists rag_documents (
  id bigint generated always as identity primary key,
  source_path text not null,
  document_name text not null,
  document_type text not null,
  version text not null,
  language text not null default 'en',
  status text not null,
  agent_owner text,
  approved_for_public_use boolean not null default false,
  approved_for_agent_action boolean not null default false,
  security_classification text not null,
  effective_date date,
  canonical_url text,
  section_title text,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  embedding vector(384),
  created_at timestamptz not null default now()
);

create unique index if not exists rag_documents_source_chunk_uidx
on rag_documents (source_path, version, chunk_index);

create index if not exists rag_documents_metadata_idx
on rag_documents (document_type, language, status, security_classification);

create index if not exists rag_documents_embedding_hnsw_idx
on rag_documents using hnsw (embedding vector_cosine_ops);

create or replace function match_rag_documents(
  query_embedding vector(384),
  match_count int default 5,
  filter_language text default 'en',
  allow_internal boolean default false
)
returns table (
  id bigint,
  source_path text,
  document_name text,
  section_title text,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    d.id,
    d.source_path,
    d.document_name,
    d.section_title,
    d.content,
    1 - (d.embedding <=> query_embedding) as similarity
  from rag_documents d
  where d.language = filter_language
    and (
      d.approved_for_public_use = true
      or allow_internal = true
    )
  order by d.embedding <=> query_embedding
  limit match_count;
$$;
