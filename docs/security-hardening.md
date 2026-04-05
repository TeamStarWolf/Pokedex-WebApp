# Security Hardening

This document records the current security posture for `PokeNav` and the guardrails already implemented in the app.

## What is hardened now

- `npm audit` is clean at the current lockfile state.
- The previous `picomatch` advisory path was removed by updating the Vite toolchain.
- External source links are sanitized before rendering.
- Team-set imports are capped and normalized before use.
- The static app now ships with a stricter browser policy via a CSP meta tag.
- The GitHub Pages SPA redirect logic was moved out of inline HTML so CSP can stay tighter.

## External link policy

External URLs must pass through `src/lib/security.ts`.

Current rules:

- allow `https://`
- allow `http://` only for local development hosts:
  - `localhost`
  - `127.0.0.1`
  - `::1`
- reject everything else

That means the app will not render dangerous protocols like:

- `javascript:`
- `data:`
- insecure remote `http://`

When a URL fails sanitization, the UI should fall back to plain text instead of an anchor.

## Import and local storage policy

Team-set imports are normalized and bounded in `src/lib/storage.ts`.

Current protections:

- max import payload size
- max number of imported custom team sets
- max six members per team
- string-length caps for names, notes, roles, and tags
- duplicate imported team IDs are dropped
- malformed or oversized payloads are rejected

Local storage writes are wrapped so quota/privacy-mode failures do not crash the app.

## Browser policy

`index.html` includes a CSP meta tag intended for static hosting.

Current allowances:

- scripts: `self`
- styles: `self`, inline styles, Google Fonts stylesheet
- fonts: `self`, `fonts.gstatic.com`, `data:`
- images: `self`, `data:`, `blob:`
- connections: `self`

This is appropriate for the current static build because runtime data is loaded from local JSON under `public/data`.

## Static hosting note

The CSP meta tag improves the baseline for GitHub Pages and other static hosts, but it is not a complete replacement for real response headers.

If `PokeNav` moves behind a configurable web server or CDN, add real headers there:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy`
- `Cross-Origin-Resource-Policy`

## Remaining work

The app is safer than before, but this is not a full security audit.

Still worth doing:

- review every user-pasted/imported workflow for better UI feedback
- review generated source URLs as part of the data pipeline
- add deployment-specific header examples for each target host
- add stronger integrity checks if team imports ever move beyond plain JSON paste
