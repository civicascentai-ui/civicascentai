import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const model = new Supabase.ai.Session("gte-small");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
const DEFAULT_MIN_SIMILARITY = 0.80;

const allowedOrigins = new Set([
  "https://civicascentai.com",
  "https://www.civicascentai.com",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

function cors(origin: string | null) {
  const allow = origin && allowedOrigins.has(origin) ? origin : "https://civicascentai.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors(origin) });

  try {
    const { question, match_count = 3, min_similarity = DEFAULT_MIN_SIMILARITY } = await req.json();
    if (typeof question !== "string" || question.trim().length < 2) {
      return Response.json({ error: "question is required" }, { status: 400, headers: cors(origin) });
    }

    const cleanQuestion = question.trim();
    const embedding = await model.run(cleanQuestion, { mean_pool: true, normalize: true });
    const { data, error } = await db.rpc("search_canonical_hybrid_service", {
      query_text: cleanQuestion,
      query_embedding: embedding,
      match_count: Math.min(Math.max(Number(match_count), 1), 5),
    });
    if (error) throw new Error(error.message);

    const results = (data ?? []).map((row: any) => ({
      id: row.id,
      domain: row.domain,
      question: row.question,
      answer: row.canonical_answer,
      review_class: row.review_class,
      requires_live_verification: row.requires_live_verification,
      similarity: row.similarity,
      lexical_rank: row.lexical_rank,
      combined_rank: row.combined_rank,
    }));

    const candidate = results[0] ?? null;
    const best = candidate && candidate.similarity >= Number(min_similarity) ? candidate : null;

    return Response.json({
      best,
      results,
      fallback: best ? null : {
        id: "CA-FALLBACK-001",
        answer: "I do not have a sufficiently verified canonical match for that yet. I can give only verified information and route the question for review."
      }
    }, { headers: { ...cors(origin), "Content-Type": "application/json" }});
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: cors(origin) });
  }
});