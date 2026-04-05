# Trainer System

This document explains how trainer data works in PokeNav today.

## Why Trainer Data Needed Its Own Model

A single trainer can appear across many games and battle contexts.

Examples:

- rival battles
- gym leader rematches
- postgame fights
- battle facility rosters
- regional reappearances

If all of that is flattened into one trainer page, the result becomes confusing quickly.

So PokeNav separates:

- trainer identity
- trainer battle appearance

## Main Concepts

### Trainer

A trainer page represents the person.

It should answer:

- who this trainer is
- what roles they occupy
- which games they appear in
- which battle records are available

### Trainer appearance

A trainer appearance page represents one battle record.

It should answer:

- which game this battle belongs to
- what the team was in that battle
- whether the record is canonical or inspired
- what the battle label and context are

## Data Sources

Trainer data currently combines:

- curated preset teams in `src/data/trainerPresets/`
- generated trainer battle imports in `src/data/generatedTrainerTeams.json`

These are transformed into runtime data under:

- `public/data/trainers/manifest.json`
- `public/data/trainers/by-trainer/*.json`

## Runtime Loading Strategy

### Manifest

The manifest contains summary appearance records only.

It is used by:

- trainer index
- trainer appearance browser
- game-scoped trainer browse pages

This keeps browse pages lighter.

### Per-trainer files

Per-trainer JSON files contain the full preset records for one trainer.

They are used by:

- trainer article pages
- trainer appearance pages

This lets article pages load full battle notes only when needed.

## Why This Split Matters

Earlier versions loaded the generated trainer archive as one large lazy chunk.

That technically worked, but it was still too heavy.

The current split improves:

- chunk size
- route-specific loading
- future maintainability

## Current Strengths

- trainer battle browser is dense and useful
- game filtering works
- trainer and appearance pages are now separated correctly
- archive data can be expanded without changing route shape

## Current Gaps

- trainer biography data is still lighter than trainer battle data
- trainer roles need stronger taxonomy
- related-trainer navigation can grow further
- some strategy notes are still curated summaries rather than deeper battle analysis

## Where The Logic Lives

- `src/hooks/useTrainerPresets.ts`
- `src/hooks/useTrainerReferenceData.ts`
- `src/lib/trainerEncyclopedia.ts`
- `src/lib/trainers.ts`
- `src/pages/encyclopedia/TrainerIndexPage.tsx`
- `src/pages/encyclopedia/TrainerDetailPage.tsx`
- `src/pages/encyclopedia/TrainerAppearanceIndexPage.tsx`
- `src/pages/encyclopedia/TrainerAppearancePage.tsx`

## Recommended Future Improvements

- stronger trainer class taxonomy
- role-based hubs such as gym leaders, Elite Four, rivals, villains
- richer trainer identity and biography coverage
- appearance-to-appearance related navigation
- reverse links from Pokemon pages to notable trainers
