# Pokemon System

This document explains how Pokemon work inside PokeNav today.

It is meant to help contributors understand:

- what the main Pokemon routes are for
- how species, forms, learnsets, and game data are modeled
- where the runtime data comes from
- what is solid today versus what is still partial

## Product intent

Pokemon are one of the three main browse pillars in PokeNav, alongside:

1. `Games`
2. `Pokemon`
3. `Trainer Battles`

The Pokemon side of the app should support two modes of use:

- direct lookup when a user already knows the species they want
- game-aware browsing when a user wants to explore Pokemon through one version context

That means Pokemon pages should work both as standalone articles and as connected nodes in a larger encyclopedia.

## Main Pokemon routes

### `/dex/national`

The main cross-species browser.

Use it for:

- species discovery
- search and filter workflows
- sorting and scanning
- jumping into article pages

This page should stay browse-first and compact, not become a giant article surface.

### `/pokemon/:speciesSlug`

The main Pokemon article page.

This is the highest-signal Pokemon route in the app right now.

It should answer:

- what the species is
- what types and abilities it has
- what forms exist
- what the broad stat profile looks like
- what move and location coverage exists
- how complete the current imported data is

### `/pokemon/:speciesSlug/moves`

The full learnset page.

This route exists because the main Pokemon article should stay readable.

Use it for:

- full move browsing
- learnset filtering by method
- seeing more detail than the main article preview shows

### `/pokemon/:speciesSlug/forms/:formSlug`

The form article page.

This route isolates one form or variant so forms do not have to be flattened into a single species page.

Use it for:

- alternate forms
- regional variants
- battle forms
- form-specific move/stat/type differences

### `/games/:gameSlug/pokemon`

Game-scoped Pokemon browsing.

This route is important because it lets users stay in one game context instead of constantly jumping back to a global index.

## Data model overview

PokeNav is schema-first, so Pokemon pages are built from normalized entities rather than page-shaped blobs.

Core Pokemon-side entities include:

- `PokemonSpecies`
- `PokemonForm`
- `Evolution`
- `Move`
- `Ability`
- `Type`
- `GameVersion`
- `Location`

At a high level:

- a species can have many forms
- a form owns the battle-relevant details such as types, abilities, and stats
- version-specific text and availability should stay keyed to games rather than being flattened away
- locations, learnsets, and other relationships should remain linkable to other entity pages

## Species versus forms

This distinction is important in the repo.

### Species

A species represents the broader identity:

- National Dex number
- canonical name
- species/category
- evolution family context
- broad lore and flavor-text coverage

Examples:

- Bulbasaur
- Houndoom
- Pikachu

### Form

A form represents one specific variant surface:

- type combination
- ability set
- base stats
- learnset differences
- variant-specific media

Examples:

- Pikachu Belle
- Alolan Raichu
- Mega Charizard X

If something differs in battle data or meaningfully in presentation, it should tend toward a form-level treatment rather than being handwaved into one species summary.

## What the main Pokemon article currently shows

The current species article is designed as a dossier-style page.

Typical sections include:

- title deck with summary metrics
- infobox with artwork and core identity data
- section rail with completeness state
- biology and lore
- game data
- moves preview
- locations preview
- trivia or expansion-safe notes

The page should feel informative without trying to dump every possible move or version row into the first screen.

That is why the full learnset route exists separately.

## Learnsets

Learnset data is one of the easiest places to overwhelm the UI, so PokeNav intentionally splits the experience.

### On the species page

The main article should show:

- a preview
- method grouping
- enough move context to orient the user

### On the full learnset page

The dedicated moves route should show:

- the broader move list
- more complete method coverage
- more detail without burying the main article

### Current caveat

The move system is improving, but it is still not a perfect one-to-one encyclopedia import for every species and version combination.

That is why some move-related sections still carry `partial` status in the UI.

## Game context

Pokemon pages are expected to behave well under a game filter.

That means a user should be able to:

- browse Pokemon in one game
- open a species article
- keep the game context visible
- move laterally into related game-aware routes

Current game-aware behavior already exists in several browse paths, but deeper game-specific related panels are still a growth area.

The long-term goal is for Pokemon pages to feel much more aware of:

- which games the user is currently exploring
- which locations matter in that game
- which trainers use that Pokemon in that game
- which entries and learnsets are relevant in that game

## Runtime data flow

Pokemon runtime data is local-first.

The app does not depend on mass live browser-side hydration from PokeAPI.

### Raw Pokemon export

Generated with:

```bash
npm run generate:data
```

Writes:

- `public/data/index.json`
- `public/data/pokemon/*.json`
- `public/data/manifest.json`

### Encyclopedia Pokemon export

Generated with:

```bash
npm run generate:encyclopedia
```

Writes:

- `public/data/encyclopedia/index.json`
- `public/data/encyclopedia/pokemon/*.json`

The app loads a lighter encyclopedia index first, then fetches per-species detail slices when an article needs them.

That split is important for performance.

## Sources and validation

Pokemon data in PokeNav is not meant to rely on one source pretending to do every job.

Current source roles:

- `PokeAPI`
  Structured IDs, ordering, slugs, forms, and machine-readable imports
- `Pokemon Database`
  Mechanics and presentation cross-checks
- `Bulbapedia`
  Encyclopedia-style validation and broader contextual checks
- `Pokebase`
  Secondary browse/reference checks

For more detail, see [source-policy.md](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\source-policy.md).

## Current strengths

The Pokemon side is already strong in a few important ways:

- game-first architecture
- dedicated species and form routes
- lighter local runtime data loading
- separate full learnset route
- clearer section completeness signaling
- source-reference support in article pages

## Current weak spots

The Pokemon system is still ahead of the imported data in some places.

Notable weak spots:

- some sections are still thinner than the page shell implies
- move/location depth is uneven depending on species
- reverse links from Pokemon to trainers are not deep enough yet
- game-aware related navigation can still be stronger
- some form families are better represented than others

Contributors should be careful not to make those gaps look more complete than they are.

## Documentation and code landmarks

Useful places to start:

- [README.md](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\README.md)
- [routes-and-pages.md](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\routes-and-pages.md)
- [data-pipeline.md](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\data-pipeline.md)
- [encyclopedia-architecture.md](C:\Users\ccwil\Documents\Projects\Pokedex WebApp\docs\encyclopedia-architecture.md)

Useful implementation files:

- `src/pages/encyclopedia/NationalDexPage.tsx`
- `src/pages/encyclopedia/PokemonDetailPage.tsx`
- `src/pages/encyclopedia/PokemonMovesPage.tsx`
- `src/pages/encyclopedia/PokemonFormPage.tsx`
- `src/pages/encyclopedia/GamePokemonIndexPage.tsx`
- `src/lib/encyclopedia-schema.ts`
- `src/lib/encyclopedia.ts`
- `src/hooks/useEncyclopediaData.tsx`

## Good contribution targets

If you want to improve the Pokemon side of the product, the best targets are:

- richer game-aware related panels
- better trainer usage links on Pokemon pages
- deeper form coverage
- better location encounter depth
- stronger move/article cross-linking
- more honest section-level completeness handling

## Guardrails

When changing Pokemon documentation or implementation:

- do not flatten version-specific data just to simplify a page
- do not overload the main article when a dedicated subpage is better
- do not imply complete coverage where the dataset is still partial
- prefer route stability and normalized links over one-off UI shortcuts
