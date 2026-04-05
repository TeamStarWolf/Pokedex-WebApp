# PokeNav Scaffold Deliverables

## Route structure

- `/`
- `/search`
- `/compare?left=charizard&right=venusaur`
- `/dex/national`
- `/pokemon/:speciesSlug`
- `/moves/:moveSlug`
- `/abilities/:abilitySlug`
- `/items/:itemSlug`
- `/types/:typeSlug`
- `/regions/:regionSlug`
- `/games/:gameSlug`
- `/locations/:locationSlug`

## Seeded sample pages

- Pokemon detail: `/pokemon/pikachu`
- Move detail: `/moves/thunderbolt`
- Ability detail: `/abilities/static`
- Region detail: `/regions/kanto`
- Filtered index: `/dex/national?type=fire&generation=1`

## Reusable component list

- `AppShell`
- `Breadcrumbs`
- `EntityInfobox`
- `SectionTabs`
- `Pagination`
- `PlaceholderBlock`

## Seed content scope

- 10 Pokemon species
- 12 forms
- 11 moves
- 14 abilities
- 5 items
- 6 regions
- 7 game versions
- 5 locations

## Expansion notes

- Schema is normalized in `src/lib/encyclopedia-schema.ts`
- Seed data lives in `src/data/encyclopediaSeed.ts`
- Route-aware page scaffolds live in `src/pages/encyclopedia`
- Missing sections intentionally render placeholders instead of silently omitting data
