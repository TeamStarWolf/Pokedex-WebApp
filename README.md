# PokeNav

Refactored from a single exported React file into a Vite + React + TypeScript project with a local static dataset flow.

## What changed

- Split app code into `src/components`, `src/hooks`, `src/lib`, and `src/data`
- Replaced mass client-side PokeAPI hydration with local JSON reads from `public/data`
- Added schema-versioned local storage for favorites, current team, and custom team sets
- Added curated preset teams with metadata and import/export support
- Kept Pokedex entry availability separate from move learnset game groups
- Added helper tests for formatting, storage migration, and filter logic

## Run locally

```bash
npm install
npm run dev
```

## Generate the local dataset

This project expects an existing SQLite build from the desktop `pokedex.sqlite` file and local artwork under `./assets`.

```bash
npm run generate:data
```

That command writes:

- `public/data/index.json`
- `public/data/pokemon/<species-id>.json`
- `public/data/manifest.json`

## Test and build

```bash
npm test
npm run build
```

## Notes

- The initial list now loads from the local dataset instead of browser-side PokeAPI hydration.
- Detail data is code-split and loaded on demand when the dialog opens.
- The preset team list is intentionally curated metadata, not a canonical import from remaster files.
- Validation and source hierarchy are documented in `docs/source-policy.md`.
