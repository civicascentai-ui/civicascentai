const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

(() => {
  const endpoint = 'https://alsjvdqlpayuzykhhbil.supabase.co/functions/v1/canonical-query';

  // The browser caller expects a Supabase anon JWT at runtime. Set
  // window.CIVICASCENT_SUPABASE_ANON_KEY before calling ask().
  // Never place a service-role key in browser code.
  async function ask(question, options = {}) {
    const key = window.CIVICASCENT_SUPABASE_ANON_KEY;
    if (!key) {
      return {
        best: null,
        fallback: {
          id: 'CA-FALLBACK-001',
          answer: 'The approved knowledge service is not configured in this preview.'
        }
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
        'Content-Type': 'application/json'
      },
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
