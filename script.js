const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

(() => {
  const endpoint = 'https://alsjvdqlpayuzykhhbil.supabase.co/functions/v1/canonical-query';

  function getClientKey() {
    return (
      window.CIVICASCENT_SUPABASE_PUBLISHABLE_KEY ||
      window.CIVICASCENT_SUPABASE_ANON_KEY ||
      ''
    );
  }

  async function ask(question, options = {}) {
    const key = getClientKey();

    if (!key) {
      return {
        best: null,
        fallback: {
          id: 'CA-FALLBACK-001',
          answer: 'The approved knowledge service is not configured in this preview.'
        },
        status: 'unavailable'
      };
    }

    const headers = {
      apikey: key,
      'Content-Type': 'application/json'
    };

    // Legacy anon keys are JWTs and may be used as Bearer tokens. Modern
    // sb_publishable_ keys authenticate through the apikey header only.
    if (key.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${key}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question,
        match_count: options.matchCount || 3,
        min_similarity: options.minSimilarity || 0.80
      })
    });

    if (!response.ok) {
      throw new Error(`Canonical lookup failed: ${response.status}`);
    }

    return response.json();
  }

  window.CivicAscentCanonical = Object.freeze({
    ask,
    endpoint
  });
})();
