# Contributing To PokeNav

Thanks for helping improve PokeNav.

This project is moving toward a public-facing Pokemon encyclopedia, so contributions should favor correctness, extensibility, and clarity over quick one-off patches.

## Development Principles

- Keep the app schema-first
- Prefer reusable components over route-specific hacks
- Preserve game-specific data where possible
- Treat missing data honestly
- Keep browse flows fast and understandable

## Local Setup

```bash
npm install
npm run generate:trainers
npm run generate:encyclopedia
npm run dev:local
```

## Before You Open A PR

Run:

```bash
npm test
npm run build
```

If you change the trainer import or encyclopedia generation pipeline, regenerate the relevant JSON outputs too.

## Where To Make Changes

- `src/components/encyclopedia/`
  Shared article, shell, and browse UI
- `src/pages/encyclopedia/`
  Route-level pages
- `src/lib/`
  Schema, linking, and transformation logic
- `src/hooks/`
  Data loading and route data access
- `src/data/`
  Curated data and seed records
- `scripts/`
  Import and export tooling

## Data Expectations

When adding or changing content:

- keep entity relationships normalized
- do not flatten game-specific differences unless unavoidable
- prefer explicit status labels like `partial` over silent omissions
- avoid adding sections that imply full coverage if the data is still thin

## UI Expectations

The app should feel like an encyclopedia, not a card dump.

That means:

- browse pages should be scannable
- dense data should favor tables or compact structured lists
- article pages should link outward to related entities
- mobile layouts should reduce vertical clutter where possible

## Good Contribution Targets

- better game-aware browse flows
- improved trainer taxonomy and filtering
- stronger location and item data
- clearer section completeness handling
- performance improvements in data loading

## Please Avoid

- hardcoding page-specific logic that belongs in the schema or shared helpers
- adding polished-looking sections with placeholder data and no status note
- making navigation heavier when it can be simplified

## Questions To Ask While Changing The App

- Does this make the encyclopedia easier to browse?
- Does this preserve game context correctly?
- Does this make incomplete data more honest or less honest?
- Will this still make sense if the app moves to a database-backed API later?
