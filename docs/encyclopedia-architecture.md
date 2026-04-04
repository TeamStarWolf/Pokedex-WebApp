# Dexcore Encyclopedia Architecture

## Product direction

Dexcore should behave like an expandable Pokemon reference system rather than a card gallery. The information architecture should treat Pokemon, moves, abilities, items, regions, games, locations, trainers, and broader topics as first-class entities that can be browsed directly, linked together, and expanded without changing the overall app shape.

The app should be schema-first:

- UI pages render normalized entities and relationships instead of ad hoc response blobs
- version-specific records live beside canonical records instead of being flattened away
- cross-links are generated from entity references so any page can lead to related pages
- missing data is expected and explicit, not represented as empty strings or omitted fields
- routes are stable enough to map to a future database-backed API or static content pipeline

## Core entity graph

### Primary entities

- `PokemonSpecies`
- `PokemonForm`
- `Evolution`
- `Move`
- `Ability`
- `Item`
- `Type`
- `Region`
- `Location`
- `GameVersion`

### Secondary entities for later phases

- `VersionGroup`
- `PokedexEntry`
- `Encounter`
- `Trainer`
- `TrainerTeam`
- `Learnset`
- `EggGroup`
- `MoveMethod`
- `Generation`
- `TopicPage`

### Relationship model

- A `PokemonSpecies` has many `PokemonForm` records
- A `PokemonSpecies` belongs to one debut `Generation`
- A `PokemonSpecies` can have many `PokedexEntry` records scoped by `GameVersion`
- A `PokemonSpecies` can participate in many `Evolution` edges as source or target
- A `PokemonForm` has many `Type` references, many `Ability` references, many `Learnset` records, and optional form-specific media
- A `Move` can reference one `Type`, one optional damage class, many `GameVersion` overrides, and many related `PokemonForm` learnsets
- An `Ability` can be linked to many `PokemonForm` records and many version-specific effect texts
- An `Item` can affect evolution, held effects, move tutoring, or encounter/battle systems depending on version
- A `Region` has many `Location` records and many `GameVersion` records
- A `Location` can appear in multiple `GameVersion` records with different encounter tables and labels
- A `GameVersion` belongs to one `Region`, one `Generation`, and optionally one `VersionGroup`

## Page types

### Browsing pages

- Homepage
- National Dex index
- Regional Dex index
- Move index
- Ability index
- Item index
- Type index
- Region index
- Location index
- Search results
- Compare page

### Entity detail pages

- Pokemon species page
- Pokemon form subview or anchored section
- Move detail page
- Ability detail page
- Item detail page
- Type detail page
- Region detail page
- Game version detail page
- Location detail page

### Encyclopedia/topic pages

- Mechanics pages such as evolution methods, status conditions, breeding, weather, terastalization
- Version-difference pages such as "Hisui forms", "Mega Evolution", "Regional variants"
- Curated world pages such as "Kanto overview" or "Sinnoh routes"

## Route system

Routes should be human-readable, deep-linkable, and stable under future migration to SSR, static generation, or database-backed APIs.

### Top-level routes

- `/`
- `/search`
- `/compare`
- `/dex/national`
- `/dex/region/:regionSlug`
- `/pokemon/:speciesSlug`
- `/pokemon/:speciesSlug/forms/:formSlug`
- `/moves`
- `/moves/:moveSlug`
- `/abilities`
- `/abilities/:abilitySlug`
- `/items`
- `/items/:itemSlug`
- `/types`
- `/types/:typeSlug`
- `/regions`
- `/regions/:regionSlug`
- `/games/:gameSlug`
- `/locations`
- `/locations/:locationSlug`
- `/topics/:topicSlug`

### Query-driven states

- search query: `?q=`
- advanced filters: `?type=fire&generation=1&region=kanto`
- compare state: `?left=charizard&right=typhlosion`
- version scope: `?game=platinum`
- tab state only where necessary and bookmarkable

## Page blueprints

### Homepage

- global search entry
- browse-by-type shortcuts
- browse-by-region shortcuts
- featured topics
- recently added or incomplete data slices
- compare prompt

### Pokemon species page

- species overview
- canonical form selector
- stats panel
- abilities panel
- learnset summary
- evolution chain
- version-specific Pokedex entries
- locations by version
- related items, moves, abilities, and types
- breadcrumbs and cross-links to region, generation, and game pages

### Move / Ability / Item pages

- core metadata
- per-version effect text and numeric overrides
- linked Pokemon that learn or use them
- related mechanics and category/type links

### Region / Location / Game pages

- overview summary
- world navigation
- linked locations
- available Pokemon slices
- game/version differences
- topic links for mechanics unique to that setting

## Reusable UI components

### Navigation and structure

- `AppShell`
- `PrimaryNav`
- `SecondaryNav`
- `Breadcrumbs`
- `PageHeader`
- `EntityHeader`
- `TabbedSection`
- `PaginationControls`

### Browsing and discovery

- `SearchBar`
- `AdvancedFilterPanel`
- `FacetGroup`
- `SortControl`
- `BrowseGrid`
- `EntityCard`
- `LinkCluster`
- `RelatedEntityRail`

### Pokemon-specific

- `PokemonHero`
- `FormSwitcher`
- `TypeBadgeRow`
- `StatTable`
- `VersionDataTable`
- `EvolutionChain`
- `LearnsetTable`
- `EncounterTable`
- `CompareDrawer`

### Shared encyclopedia modules

- `InfoTable`
- `VersionBadge`
- `DataCompletenessNotice`
- `EmptyState`
- `MissingDataCallout`
- `SourceReferenceList`

## Search and discovery principles

- fuzzy search across names, aliases, forms, moves, abilities, items, regions, locations, and topic titles
- indexed filters should operate on normalized entity fields, not UI-specific derived strings
- all entity pages should expose outgoing links to related entities
- all index pages should support multiple browse modes: alphabetic, regional, generational, thematic

## Version-specific data strategy

- Treat `GameVersion` as a first-class entity
- Keep canonical entity identity separate from version-specific slices
- Store text, stats, availability, effects, and locations in `versioned` collections keyed by `GameVersion`
- Allow records to declare `unknown`, `not-applicable`, or `unverified` states so incomplete imports do not corrupt the model

## Missing-data and future-expansion strategy

- every entity should have room for `sourceRefs`, `status`, and `expansionNotes`
- many-to-many joins should be represented explicitly so they can move into relational tables later
- page generation should tolerate partial entities, such as a `Move` without full flavor text or a `Location` without encounter data
- routes should remain valid even when some sections are empty
- seed content should prove relationships, not just isolated cards

## Suggested implementation layering

### Phase 1 and 2

- architecture document
- normalized TypeScript schema
- entity id and slug conventions

### Phase 3

- route scaffold
- shared page shell
- seed content loaders

### Phase 4

- fuzzy search index
- advanced filters
- breadcrumbs
- compare flow

### Phase 5

- seed data proving cross-links
- static content generation or database adapter
- import pipeline for larger datasets
