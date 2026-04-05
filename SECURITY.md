# Security Policy

## Supported Versions

PokeNav is currently maintained as a latest-version project.

| Deployment or Version | Supported |
| --- | --- |
| Latest `main` branch | Yes |
| Latest GitHub Pages deployment | Yes |
| Older historical commits | Best effort only |
| Custom forks or modified datasets | Configuration dependent |

## Reporting A Vulnerability

Please report security issues privately and avoid opening a public issue first.

Preferred approach:

1. Use GitHub private vulnerability reporting for this repository if it is enabled.
2. If that is not available, contact the maintainer privately through GitHub before disclosure.
3. Include reproduction steps, affected route or feature, impact, and any mitigation you have identified.

## Scope

PokeNav is a static encyclopedia app. The most relevant security areas are:

- dependency vulnerabilities in the frontend toolchain
- unsafe rendering of external or generated links
- malformed local imports or oversized payloads
- security headers and browser policy for static hosting
- integrity of generated local datasets

## Current Controls

- GitHub Actions for CodeQL, OSV-Scanner, Bandit (for Python helper scripts), and dependency review
- CSP meta tag for the static build
- external URL sanitization before rendering links
- bounded and normalized team-set imports
- documented source hierarchy and data trust rules

## Deployment Guidance

- Prefer HTTPS-only hosting.
- Add real response headers when deploying behind a CDN or custom web server.
- Do not place secrets in the client bundle.
- Treat generated datasets as build artifacts that should be reviewed before publishing.

For implementation details, see [docs/security-hardening.md](docs/security-hardening.md).
