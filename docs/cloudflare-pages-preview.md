# CivicAscent AI — Cloudflare Pages Preview Deployment

Status: READY FOR ONE-TIME CLOUDFLARE ↔ GITHUB AUTHORIZATION

## Repository
- Repository: civicascentai-ui/civicascentai
- Preview branch: feature/mobbin-patterns-2026-09-30
- Project root: prototype-react

## Cloudflare Pages build settings
- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Root directory: prototype-react

## Protection rule
Do not attach civicascentai.com to this preview project and do not replace the current production deployment. The preview must remain on its generated pages.dev hostname until all QA/security gates pass.

## Repo preparation completed
- SPA fallback via public/_redirects
- Security response headers via public/_headers
- Production-candidate Page 2 interaction layer
- Reduced-motion handling
- Mobile responsive layout
- Keyboard/focus treatment
- Voice/text parity support
- Existing Safari Living Canvas preserved

## One-time account step still required
Cloudflare must be authorized to access the GitHub repository. This requires the repository owner to approve the GitHub authorization/2FA in Cloudflare once. This cannot be bypassed from repository code.

After authorization, Cloudflare can create automatic preview deployments from the feature branch without browser automation.
