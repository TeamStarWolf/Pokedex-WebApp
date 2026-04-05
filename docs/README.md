# PokeNav Docs Index

This folder is the project handbook for PokeNav.

If you are new to the repo, start in this order:

1. [README](../README.md)
2. [Roadmap](../ROADMAP.md)
3. [Encyclopedia Architecture](encyclopedia-architecture.md)
4. [Data Pipeline](data-pipeline.md)
5. [Routes And Pages](routes-and-pages.md)
6. [Trainer System](trainer-system.md)
7. [Public Release Plan](public-release-plan.md)
8. [UI And UX Audit](ui-ux-audit.md)
9. [Security Hardening](security-hardening.md)

## Documentation Map

### Product and planning

- [Roadmap](../ROADMAP.md)
  What the project is aiming for, what is in progress, and what comes next.
- [Public Release Plan](public-release-plan.md)
  What needs to change before the app is ready to be shown publicly.
- [UI And UX Audit](ui-ux-audit.md)
  Current navigation, layout, and usability findings.

### Architecture and implementation

- [Encyclopedia Architecture](encyclopedia-architecture.md)
  The normalized data and route architecture.
- [Encyclopedia Scaffold](encyclopedia-scaffold.md)
  Summary of the route scaffold and sample content shape.
- [Routes And Pages](routes-and-pages.md)
  Human-readable map of route families and what each page is for.
- [Trainer System](trainer-system.md)
  How trainer identity, trainer appearances, presets, and generated archive data fit together.

### Data and maintenance

- [Data Pipeline](data-pipeline.md)
  How runtime JSON is generated and loaded.
- [Security Hardening](security-hardening.md)
  Current browser policy, external link rules, and import safety limits.
- [Contributing](../CONTRIBUTING.md)
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
