# PokeNav Docs Index

This folder is the project handbook for PokeNav.

If you are new to the repo, start in this order:

1. [README](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\README.md)
2. [Roadmap](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\ROADMAP.md)
3. [Encyclopedia Architecture](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\encyclopedia-architecture.md)
4. [Data Pipeline](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\data-pipeline.md)
5. [Routes And Pages](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\routes-and-pages.md)
6. [Pokemon System](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\pokemon-system.md)
7. [Trainer System](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\trainer-system.md)
8. [Public Release Plan](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\public-release-plan.md)
9. [UI And UX Audit](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\ui-ux-audit.md)
10. [Security Hardening](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\security-hardening.md)

## Documentation Map

### Product and planning

- [Roadmap](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\ROADMAP.md)
  What the project is aiming for, what is in progress, and what comes next.
- [Public Release Plan](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\public-release-plan.md)
  What needs to change before the app is ready to be shown publicly.
- [UI And UX Audit](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\ui-ux-audit.md)
  Current navigation, layout, and usability findings.

### Architecture and implementation

- [Encyclopedia Architecture](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\encyclopedia-architecture.md)
  The normalized data and route architecture.
- [Encyclopedia Scaffold](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\encyclopedia-scaffold.md)
  Summary of the route scaffold and sample content shape.
- [Pokemon System](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\pokemon-system.md)
  How Pokemon species pages, forms, learnsets, game context, and runtime data fit together.
- [Routes And Pages](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\routes-and-pages.md)
  Human-readable map of route families and what each page is for.
- [Trainer System](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\trainer-system.md)
  How trainer identity, trainer appearances, presets, and generated archive data fit together.

### Data and maintenance

- [Data Pipeline](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\data-pipeline.md)
  How runtime JSON is generated and loaded.
- [Security Hardening](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\security-hardening.md)
  Current browser policy, external link rules, and import safety limits.
- [Contributing](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\CONTRIBUTING.md)
  Expectations for contributors and maintainers.

## Quick Orientation

PokeNav is built around three main public-facing browse paths:

- Browse by Game
- Browse Pokemon
- Browse Trainer Battles

Everything else in the encyclopedia should support or deepen those flows.

## Visual References

Repo screenshots used by the main GitHub landing page live in `docs/screenshots/`.

- `docs/screenshots/home.png`
- `docs/screenshots/pokemon-article.png`
- `docs/screenshots/trainer-battles.png`
- `docs/screenshots/trainer-article.png`

## Documentation Standards

When adding new docs:

- describe the current reality, not just the intended future
- call out partial systems honestly
- keep route names and entity names consistent with the code
- prefer maintainable explanations over one-off implementation notes
