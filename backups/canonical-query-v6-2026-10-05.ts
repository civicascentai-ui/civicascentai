import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const model = new Supabase.ai.Session("gte-small");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

const DEFAULT_MIN_SIMILARITY = 0.80;
const STRONG_SEMANTIC_SIMILARITY = 0.88;

const allowedOrigins = new Set([
  "https://civicascentai.com",
  "https://www.civicascentai.com",
  "https://civicascentai-git-release-go-live-2026-10-12-civicascentai.vercel.app",
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

const safetyFallback = (answer =
  "I do not have a sufficiently verified canonical match for that yet. I can give only verified information and route the question for review."
) => ({
  id: "CA-FALLBACK-001",
  answer,
});

async function canonicalById(id: string) {
  const { data, error } = await db
    .from("canonical_entries")
    .select("id,domain,question,canonical_answer,review_class,security_class")
    .eq("id", id)
    .in("status", ["approved", "published"])
    .eq("security_class", "public")
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    domain: data.domain,
    question: data.question,
    answer: data.canonical_answer,
    review_class: data.review_class,
    security_class: data.security_class,
    requires_live_verification: data.review_class === "verify_live_before_answering",
    similarity: 1,
    lexical_rank: 1,
    combined_rank: 1,
  };
}

function json(payload: unknown, status: number, origin: string | null) {
  return Response.json(payload, {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors(origin) });

  try {
    const { question, match_count = 3, min_similarity = DEFAULT_MIN_SIMILARITY } = await req.json();
    if (typeof question !== "string" || question.trim().length < 2) {
      return json({ error: "question is required" }, 400, origin);
    }

    const cleanQuestion = question.trim();
    const q = cleanQuestion.toLowerCase();

    // High-risk/current business facts are routed to explicit canonical records
    // rather than trusting a merely similar vector result.
    const billingIntent = /\b(free|cost|costs|price|prices|pricing|fee|fees|charge|charges|pay|payment|payments|refund|refunds|discount|discounts|how much)\b/i.test(q);
    if (billingIntent) {
      const id = /\brefunds?\b/i.test(q)
        ? "CA-BILLING-003"
        : /\bdiscounts?\b/i.test(q)
          ? "CA-BILLING-002"
          : "CA-BILLING-001";
      const direct = await canonicalById(id);
      return json({
        best: direct,
        results: direct ? [direct] : [],
        fallback: direct ? null : safetyFallback(),
      }, 200, origin);
    }

    const nonprofitIntent = /\b(501\s*\(?c\)?\s*\(?3\)?|501c3|tax[- ]?exempt|nonprofit|non-profit)\b/i.test(q);
    if (nonprofitIntent) {
      const direct = await canonicalById("CA-COMPANY-004");
      return json({
        best: direct,
        results: direct ? [direct] : [],
        fallback: direct ? null : safetyFallback(),
      }, 200, origin);
    }

    const jobGuaranteeIntent =
      /\b(job|employment|hire|hired|placement|career|income)\b/i.test(q) &&
      /\b(guarantee|guaranteed|promise|promised|definitely|assure)\b/i.test(q);
    if (jobGuaranteeIntent) {
      const direct = await canonicalById("CA-EMPLOY-001");
      return json({
        best: direct,
        results: direct ? [direct] : [],
        fallback: direct ? null : safetyFallback(),
      }, 200, origin);
    }

    const governmentIdIntent = /\b(uei|cage|sam(?:\.gov)?|government identifier)\b/i.test(q);
    if (governmentIdIntent) {
      const direct = await canonicalById("CA-GOV-002");
      return json({
        best: direct,
        results: direct ? [direct] : [],
        fallback: direct ? null : safetyFallback(),
      }, 200, origin);
    }

    // Named/current relationship claims must never be inferred from generic
    // "how to partner" guidance.
    const relationshipWords = /\b(partner|partners|partnership|partnerships|grant|grants|funding|sponsor|sponsors|sponsorship|accreditation|certification)\b/i;
    const relationshipStatusWords = /\b(active|current|currently|confirmed|official|existing|already|approved|awarded|today|now)\b/i;
    const asksExistingRelationship =
      relationshipWords.test(q) &&
      (
        relationshipStatusWords.test(q) ||
        /\b(do|does|are|is|have|has)\b.*\b(partner|partners|partnership|partnerships|sponsor|sponsors|sponsorship)\b.*\bwith\b/i.test(q)
      );

    if (asksExistingRelationship) {
      return json({
        best: null,
        results: [],
        fallback: safetyFallback(
          "I do not have a verified current record confirming that relationship. Current partnership, grant, sponsorship, certification, or accreditation claims require live verification."
        ),
      }, 200, origin);
    }

    // The current canonical library does not yet contain a complete live
    // program catalog. Do not turn a "which programs?" question into a
    // semantically nearby beginner-readiness answer.
    const programCatalogIntent =
      /\b(program|programs|class|classes|course|courses|workshop|workshops|offerings)\b/i.test(q) &&
      /\b(beginner|beginners|available|offer|offers|have|start|starting)\b/i.test(q);

    if (programCatalogIntent) {
      return json({
        best: null,
        results: [],
        fallback: safetyFallback(
          "I do not have a sufficiently verified canonical program-catalog match for that question yet. I can give only verified program information and route the request for review."
        ),
      }, 200, origin);
    }

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
    const requestedMin = Math.max(Number(min_similarity) || DEFAULT_MIN_SIMILARITY, DEFAULT_MIN_SIMILARITY);
    const hasLexicalSignal = candidate ? Number(candidate.lexical_rank || 0) > 0 : false;
    const strongSemanticSignal = candidate ? Number(candidate.similarity || 0) >= STRONG_SEMANTIC_SIMILARITY : false;
    const liveVerificationGuard = candidate?.requires_live_verification === true;

    const best =
      candidate &&
      Number(candidate.similarity || 0) >= requestedMin &&
      (hasLexicalSignal || strongSemanticSignal || liveVerificationGuard)
        ? candidate
        : null;

    return json({
      best,
      results,
      fallback: best ? null : safetyFallback(),
    }, 200, origin);
  } catch (err) {
    return json({ error: String(err) }, 500, origin);
  }
});
