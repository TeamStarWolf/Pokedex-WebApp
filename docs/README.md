# PokeNav Docs Index

This folder is the project handbook for PokeNav.

If you are new to the repo, start in this order:

1. [README](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\README.md)
2. [Roadmap](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\ROADMAP.md)
3. [Encyclopedia Architecture](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\encyclopedia-architecture.md)
4. [Data Pipeline](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\data-pipeline.md)
5. [Routes And Pages](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\routes-and-pages.md)
6. [Trainer System](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\trainer-system.md)
7. [Public Release Plan](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\public-release-plan.md)
8. [UI And UX Audit](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\ui-ux-audit.md)

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
- [Routes And Pages](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\routes-and-pages.md)
  Human-readable map of route families and what each page is for.
- [Trainer System](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\trainer-system.md)
  How trainer identity, trainer appearances, presets, and generated archive data fit together.

### Data and maintenance

- [Data Pipeline](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\data-pipeline.md)
  How runtime JSON is generated and loaded.
- [Contributing](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\CONTRIBUTING.md)
  Expectations for contributors and maintainers.

## Quick Orientation

PokeNav is built around three main public-facing browse paths:

- Browse by Game
- Browse Pokemon
- Browse Trainer Battles

Everything else in the encyclopedia should support or deepen those flows.

## Documentation Standards

When adding new docs:

- describe the current reality, not just the intended future
- call out partial systems honestly
- keep route names and entity names consistent with the code
- prefer maintainable explanations over one-off implementation notes
