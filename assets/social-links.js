/**
 * CivicAscent AI verified social profiles.
 * PRODUCTION HOLD. A profile does not render until BOTH ownership-verification
 * and authorized publishing approval have been recorded. Do not guess handles.
 *
 * Approved records must be updated only on isolated QA after proof is collected.
 */
export const SOCIAL_PROFILES = Object.freeze({
  linkedin: Object.freeze({url: null, ownershipVerified: false, releaseApproved: false}),
  facebook: Object.freeze({url: null, ownershipVerified: false, releaseApproved: false}),
  youtube: Object.freeze({url: null, ownershipVerified: false, releaseApproved: false})
});

const ALLOWED = Object.freeze({
  linkedin: {hosts: ['linkedin.com', 'www.linkedin.com'], route: /^\/company\/[a-zA-Z0-9][a-zA-Z0-9_-]*\/?$/},
  facebook: {hosts: ['facebook.com', 'www.facebook.com'], route: /^\/[a-zA-Z0-9][a-zA-Z0-9._-]*\/?$/},
  youtube: {hosts: ['youtube.com', 'www.youtube.com'], route: /^\/(?:@[a-zA-Z0-9._-]+|channel\/[a-zA-Z0-9_-]+)\/?$/}
});
const LABELS = Object.freeze({linkedin: 'LinkedIn', facebook: 'Facebook', youtube: 'YouTube'});

/** Reject lookalike hosts, HTTP, credentials, query tokens, redirects, empty handles. */
export function validateSocialProfileUrl(platform, input) {
  if (typeof input !== 'string' || !input) return null;
  const rule = ALLOWED[platform];
  if (!rule) return null;
  let parsed;
  try { parsed = new URL(input); } catch { return null; }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password ||
      parsed.search || parsed.hash || parsed.port ||
      !rule.hosts.includes(parsed.hostname.toLowerCase()) ||
      !rule.route.test(parsed.pathname)) return null;
  return parsed.href;
}

/** Only explicitly verified AND explicitly approved account URLs are public. */
export function getVerifiedSocialProfiles(records = SOCIAL_PROFILES) {
  return Object.entries(records)
    .map(([platform, data]) => ({
      platform,
      url: data?.ownershipVerified === true && data?.releaseApproved === true
        ? validateSocialProfileUrl(platform, data?.url) : null
    }))
    .filter((item) => Boolean(item.url));
}

export function mountVerifiedSocialLinks(root = (typeof document === 'undefined' ? null : document), records = SOCIAL_PROFILES) {
  if (!root || typeof root.createElement !== 'function') return 0;
  const profiles = getVerifiedSocialProfiles(records);
  if (!profiles.length || root.getElementById('cai-verified-social')) return profiles.length;
  const nav = root.createElement('nav');
  nav.id = 'cai-verified-social';
  nav.setAttribute('aria-label', 'Official CivicAscent AI social profiles');
  const isSpanish = root.documentElement?.lang?.toLowerCase().startsWith('es') === true;
  if (isSpanish) nav.setAttribute('aria-label', 'Perfiles oficiales de CivicAscent AI en redes sociales');
  nav.style.cssText = 'display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;padding:1rem;';
  for (const record of profiles) {
    const link = root.createElement('a');
    link.href = record.url;
    link.textContent = LABELS[record.platform];
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Visit CivicAscent AI on ' + LABELS[record.platform] + ' (opens in a new tab)');
    if (isSpanish) link.setAttribute('aria-label', 'Visitar CivicAscent AI en ' + LABELS[record.platform] + ' (se abre una pestaña nueva)');
    nav.appendChild(link);
  }
  (root.querySelector('footer') || root.body)?.appendChild(nav);
  return profiles.length;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountVerifiedSocialLinks());
  else mountVerifiedSocialLinks();
}
