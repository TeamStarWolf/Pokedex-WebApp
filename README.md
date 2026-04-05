<div align="center">
  <img src="docs/screenshots/home.png" width="100%" alt="PokeNav home page and browse entry points">

  # PokeNav

  [![React 19](https://img.shields.io/badge/react-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827)](https://react.dev)
  [![Vite 8](https://img.shields.io/badge/vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
  [![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![GitHub Pages](https://img.shields.io/badge/live-github%20pages-0A66C2?style=for-the-badge&logo=github)](https://teamstarwolf.github.io/PokeNav/)
  [![Security](https://img.shields.io/badge/security-codeql%20%2B%20osv%20%2B%20dependency%20review-2ECC71?style=for-the-badge)](.github/workflows)

  **[Live Site](https://teamstarwolf.github.io/PokeNav/)** | **[Docs](docs/README.md)** | **[Application Overview](docs/application-overview.md)** | **[Roadmap](ROADMAP.md)** | **[Security](SECURITY.md)** | **[Contributing](CONTRIBUTING.md)**
</div>

---

PokeNav is a game-first Pokemon encyclopedia built as a local-first React app. It is designed to feel closer to a research tool than a simple Pokedex list: browse by game, inspect Pokemon articles, compare species, study trainer battles, and move laterally through related entities without depending on heavy live client-side API hydration.

## What PokeNav Focuses On

PokeNav currently has three strongest browse paths:

1. browse by game
2. browse Pokemon directly
3. browse trainer battles and appearances

Everything else in the app is meant to support those flows with linked pages for moves, abilities, items, types, regions, and locations.

## Core Workflows

| Workflow | What it supports |
| --- | --- |
| Game-first browsing | Start with a specific title and move through Pokemon, trainers, locations, and related records in game context |
| Pokemon reference | Read species pages, forms, moves, abilities, and comparison views without losing navigation context |
| Trainer research | Inspect trainer identities, battle appearances, and game-specific encounter history across titles |
| Linked encyclopedia pivots | Move laterally between entities instead of bouncing back to a flat search-first model |
| Local-first reference use | Run against generated local datasets so the app stays fast and usable without depending on live API hydration |

## Feature Highlights

| Area | What is available now |
| --- | --- |
| Game-first browsing | game hub pages, game-scoped Pokemon, trainer, and location indexes |
| Pokemon encyclopedia | national dex, species pages, move pages, form pages, and compare flows |
| Trainer archive | trainer index, trainer detail pages, appearance browser, and game-specific battle records |
| Linked reference data | moves, abilities, items, locations, regions, and cross-entity search |
| Offline-first delivery | static JSON datasets served locally or from GitHub Pages |
| Honest completeness | partial or curated data is labeled instead of implied as complete |

## Screenshots

<table>
<tr>
<td width="50%"><strong>Home + Browse Entry Points</strong><br><img src="docs/screenshots/home.png" width="100%" alt="PokeNav home page"></td>
<td width="50%"><strong>Pokemon Article Page</strong><br><img src="docs/screenshots/pokemon-article.png" width="100%" alt="Pokemon article page for Houndoom"></td>
</tr>
<tr>
<td><strong>Trainer Detail Surface</strong><br><img src="docs/screenshots/trainer-article.png" width="100%" alt="Trainer detail page for Red"></td>
<td><strong>Trainer Appearance Browser</strong><br><img src="docs/screenshots/trainer-battles.png" width="100%" alt="Trainer appearance browser filtered to HeartGold and SoulSilver"></td>
</tr>
</table>

## Source And Data Model

PokeNav uses a source hierarchy instead of treating every Pokemon website as interchangeable.

- `PokeAPI` is the primary structured source for identifiers, forms, slugs, and machine-readable imports.
- `Bulbapedia` is the primary encyclopedia reference for trainer canon, game-specific appearances, and world context.
- `Pokemon Database` is used as a readable mechanics cross-check.
- `Pokebase` is a secondary browse/reference comparison source.

If a page claims certainty, the backing data should either come from a strong source or be clearly labeled as `partial`, `derived`, or `curated`.

## Quick Start

```bash
npm install
```

For a stable local bind:

```bash
npm run dev:local
```

## Data Generation

PokeNav expects locally generated JSON datasets. Depending on what you are refreshing, use:

```bash
npm run generate:data
npm run generate:trainers
npm run generate:encyclopedia
```

These scripts rely on the local SQLite build and project assets described in the docs.

## Test And Build

```bash
npm test
npm run build
```

## Project Shape

```text
src/
  components/encyclopedia/   Shared browse and article UI
  pages/encyclopedia/        Route-level encyclopedia pages
  lib/                       Schemas, linking, transforms, and security helpers
  hooks/                     Route data and loading hooks
  data/                      Curated seed records
scripts/                     Import and export tooling
public/data/                 Generated runtime datasets
docs/                        Product, architecture, and maintenance handbook
```

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/README.md](docs/README.md) | documentation index and onboarding path |
| [docs/application-overview.md](docs/application-overview.md) | product-level overview of browse flows, data model priorities, strengths, and current limits |
| [ROADMAP.md](ROADMAP.md) | current direction, gaps, and release priorities |
| [docs/encyclopedia-architecture.md](docs/encyclopedia-architecture.md) | schema and route architecture |
| [docs/pokemon-system.md](docs/pokemon-system.md) | Pokemon species pages, forms, learnsets, game context, and data flow |
| [docs/routes-and-pages.md](docs/routes-and-pages.md) | route map and browse purpose for each page family |
| [docs/data-pipeline.md](docs/data-pipeline.md) | how local JSON data is generated and loaded |
| [docs/source-policy.md](docs/source-policy.md) | source hierarchy and data trust rules |
| [docs/security-hardening.md](docs/security-hardening.md) | current browser-side hardening and import safeguards |

## Security

PokeNav is a static web app, so the most important security concerns are browser policy, dependency health, external link sanitization, and local import safety.

- External links are sanitized before rendering.
- Team-set imports are bounded and normalized.
- The static build ships with a CSP meta tag.
- GitHub Actions run CodeQL, OSV-Scanner, Bandit for Python helper scripts, and dependency review.

See [SECURITY.md](SECURITY.md) and [docs/security-hardening.md](docs/security-hardening.md) for the current posture and reporting guidance.

## Contributing

Contributions should make the encyclopedia easier to browse, more truthful about data completeness, and easier to extend.

- favor reusable schema-first work over one-off page logic
- preserve game-specific differences where possible
- keep browse surfaces fast and scannable
- avoid polished-looking sections that imply completeness when the data is still partial

See [CONTRIBUTING.md](CONTRIBUTING.md) for development expectations.

## Project Status

PokeNav is already usable as a local reference app, but it is still in active refinement before a fuller public-ready release. The strongest current surfaces are the game hubs, Pokemon encyclopedia pages, and trainer appearance browser.

## License

[MIT License](LICENSE) for the code in this repository.

Pokemon names, characters, artwork, and franchise materials remain property of their respective rights holders. PokeNav is an unofficial fan/reference project.
