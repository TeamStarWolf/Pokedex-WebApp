# PokeNav Roadmap

This roadmap is meant to describe the project honestly.

PokeNav already has meaningful structure and a lot of local functionality, but it is still in the phase where architecture is ahead of full data completeness and final UX polish.

## Product Vision

PokeNav should become a strong offline-first Pokemon encyclopedia with:

- game-first browsing
- cross-linked encyclopedia pages
- rich Pokemon articles
- browsable trainer battle archives
- version-aware data
- fast local data loading

The goal is not to imitate a simple Pokedex grid. The goal is to build a navigable reference platform.

## Current Strengths

- Route-based encyclopedia structure
- Schema-first data model
- Pokemon article pages
- Trainer battle browser
- Game hub pages
- Local generated data loading
- Section-level completeness signaling
- Split trainer manifest and per-trainer detail loading

## Current Weaknesses

- Some article sections are still partial
- Mobile layouts are still too tall and crowded
- Some summary metrics can still mislead users
- Item, location, and move depth is uneven
- Navigation chrome is still heavier than it should be
- Trainer identity data is still thinner than trainer battle data

## Release Priorities

### Priority 1: Public release shaping

- simplify shell navigation
- reduce vertical clutter
- make mobile browse pages easier to scan
- make game context smaller and calmer
- make partial sections feel informative instead of apologetic

### Priority 2: Data trust

- remove or replace misleading summary counts
- improve section-level completeness accuracy
- deepen item, location, and move imports
- improve reverse links and cross-entity connections

### Priority 3: Trainer depth

- improve trainer taxonomy
- add role-based game hubs
- strengthen trainer biography and relationship coverage
- deepen appearance-to-appearance related navigation

### Priority 4: Encyclopedia breadth

- better region and location coverage
- fuller game-specific differences
- stronger move and ability learner relationships
- more topic pages and curated mechanic pages

## What “Public Ready” Means

Before public release, the app should meet this bar:

- new users can understand the three main ways to browse the app
- primary pages feel intentional and not overloaded
- mobile layouts are usable
- partial data is clearly labeled
- main browse pages are fast
- trainer and Pokemon flows feel connected instead of fragmented

## Recommended Next Milestones

### Milestone A: Navigation compression

- collapse secondary nav into a lighter pattern
- shrink the game context bar
- reduce article preamble height
- tighten dense browse pages

### Milestone B: Browse-first refinement

- role-based trainer hubs
- stronger per-game browse surfaces
- denser table/list modes
- saved filter views later if needed

### Milestone C: Data expansion

- better location data
- better item data
- better move metadata
- stronger trainer-to-Pokemon reverse links

### Milestone D: Release polish

- screenshots and docs polish
- public-facing README refinement
- final UX pass
- bug triage and regression testing

## Nice-To-Have Later

- database-backed API layer
- user-saved browse workspaces
- stronger compare tools
- topic pages for mechanics and world knowledge
- richer trainer organizations and relationship graphs

## Guiding Rule

If there is a choice between:

- adding another page, or
- making the existing browse experience clearer and more trustworthy

the second option is usually the right one.
