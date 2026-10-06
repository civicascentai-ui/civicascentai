const DEFAULT_ENDPOINT =
  import.meta.env.VITE_CIVICASCENT_CANONICAL_URL ||
  "https://alsjvdqlpayuzykhhbil.supabase.co/functions/v1/canonical-query";

const DEFAULT_MIN_SIMILARITY = 0.80;

function getClientKey() {
  return (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    window.CIVICASCENT_SUPABASE_PUBLISHABLE_KEY ||
    window.CIVICASCENT_SUPABASE_ANON_KEY ||
    ""
  );
}

async function ask(question, options = {}) {
  const key = getClientKey();

  if (!key) {
    return {
      best: null,
      fallback: {
        id: "CA-FALLBACK-001",
        answer:
          "The approved CivicAscent knowledge service is not configured in this preview.",
      },
      status: "unavailable",
    };
  }

  const response = await fetch(DEFAULT_ENDPOINT, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      match_count: options.matchCount || 3,
      min_similarity: options.minSimilarity || DEFAULT_MIN_SIMILARITY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Canonical lookup failed: ${response.status}`);
  }

  return response.json();
}

export const CivicAscentCanonical = Object.freeze({
  ask,
  endpoint: DEFAULT_ENDPOINT,
  minSimilarity: DEFAULT_MIN_SIMILARITY,
});

if (typeof window !== "undefined") {
  window.CivicAscentCanonical = CivicAscentCanonical;
}
