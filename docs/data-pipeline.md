# Data Pipeline

This document explains how PokeNav currently gets its data into the app.

## Overview

The project is local-first. The runtime app reads generated JSON files from `public/data` instead of hydrating everything live from browser-side API calls.

Current data inputs include:

- local Pokemon dataset export
- generated encyclopedia slices
- curated trainer presets
- generated Bulbapedia-derived trainer battle archive data for offline local use

## Source Hierarchy

PokeNav uses different sources for different kinds of truth:

- `PokeAPI`
  Primary structured source for IDs, ordering, slugs, forms, and machine-readable imports.
- `Bulbapedia`
  Canon-style reference for trainers, appearances, game-specific rosters, and broader encyclopedia context.
- `Pokemon Database`
  Readable mechanics cross-check for species pages, moves, abilities, items, and browsing sanity checks.
- `Pokebase`
  Secondary browse/reference source used for comparison and UX validation rather than core canonical imports.

The goal is not to flatten those sources together blindly. The goal is to use each one where it is strongest.

## Pokemon Dataset

Pokemon summary and detail data are generated with:

```bash
npm run generate:data
```

That pipeline writes runtime files under:

- `public/data/index.json`
- `public/data/pokemon/`
- `public/data/manifest.json`

These power the lighter Pokemon list and local detail lookups.

## Encyclopedia Dataset

The encyclopedia-specific schema output is generated with:

```bash
npm run generate:encyclopedia
```

This writes:

- `public/data/encyclopedia/index.json`
- `public/data/encyclopedia/pokemon/*.json`

The app loads the encyclopedia index first, then pulls per-species detail slices when needed.

## Trainer Dataset

Trainer data currently has two layers:

1. Curated trainer presets in `src/data/trainerPresets/`
2. Generated trainer archive data in `src/data/generatedTrainerTeams.json`

The runtime trainer files are then exported with:

```bash
npm run generate:trainers
```

This produces:

- `public/data/trainers/manifest.json`
- `public/data/trainers/by-trainer/*.json`

The manifest is used for trainer browse pages.
Per-trainer files are used for trainer article and appearance pages.

## Why The Trainer Archive Was Split

Originally the generated trainer archive shipped as one large lazy JSON module. That worked, but it still created an oversized chunk.

The current approach is better:

- browse pages only need summary appearance records
- article pages need full per-trainer battle data
- splitting the archive keeps the main trainer experience lighter

## Runtime Loading Pattern

Current pattern:

- load a lightweight index or manifest first
- fetch deeper entity slices only when a page needs them

That pattern is already used for:

- encyclopedia Pokemon detail data
- trainer detail data

It should be extended to other heavy entity families over time.

## Known Gaps

The app structure is ahead of the data in some places.

Areas still growing:

- richer move metadata
- richer item metadata
- richer location encounter coverage
- fuller game-aware reverse links
- deeper trainer identity and biography coverage

Because of that, some sections are marked `partial` in the UI.

## Maintainer Notes

When changing the pipeline:

- keep route-facing IDs and slugs stable
- preserve normalized entity relationships
- do not collapse version-specific data unless there is a strong reason
- prefer smaller runtime slices over monolithic JSON when possible
