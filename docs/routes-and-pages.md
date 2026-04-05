# Routes And Pages

This document maps the current major route families in PokeNav and explains what each one is for.

## Core Product Routes

### `/`

Homepage.

Purpose:

- orient new users
- point toward the main browse flows
- act as the front door for the encyclopedia

### `/dex/national`

National Dex browser.

Purpose:

- browse Pokemon directly
- apply search and filter logic
- move from species discovery into article pages

### `/search`

Cross-entity search.

Purpose:

- search across multiple encyclopedia entity types
- act as a fallback when users do not know the correct browse path

### `/compare`

Comparison utility page.

Purpose:

- compare two Pokemon records
- support reference and planning use cases

## Game Routes

### `/games`

Game index.

Purpose:

- browse game/version pages directly

### `/games/:gameSlug`

Game hub.

Purpose:

- act as a navigation center for one game
- connect Pokemon, trainer battles, and locations in one version context

### `/games/:gameSlug/pokemon`

Pokemon scoped to one game.

Purpose:

- browse Pokemon through a game-specific lens

### `/games/:gameSlug/trainers`

Trainer battles scoped to one game.

Purpose:

- browse battle appearances in one version context

### `/games/:gameSlug/locations`

Locations scoped to one game.

Purpose:

- browse location pages and encounter-related context in one version context

## Pokemon Routes

### `/pokemon/:speciesSlug`

Main Pokemon article page.

Purpose:

- species overview
- game data
- move preview
- location context
- evolution and trivia

### `/pokemon/:speciesSlug/moves`

Full learnset page.

Purpose:

- show more move detail without overwhelming the main article page

### `/pokemon/:speciesSlug/forms/:formSlug`

Pokemon form page.

Purpose:

- isolate one form or variant as a linked article surface

## Trainer Routes

### `/trainers`

Trainer index.

Purpose:

- browse trainer identities
- move from person-level pages into battle-specific pages

### `/trainers/appearances`

Trainer battle browser.

Purpose:

- filter trainer battles by game, role, region, and Pokemon
- serve as the main trainer research surface

### `/trainers/:trainerSlug`

Trainer article page.

Purpose:

- summarize one trainer identity
- expose linked appearance pages
- provide trainer-level context

### `/trainers/:trainerSlug/appearances/:appearanceSlug`

Trainer appearance page.

Purpose:

- isolate one battle record
- keep game-specific teams distinct

## Supporting Entity Routes

### `/moves`
### `/moves/:moveSlug`

Move browse and move detail pages.

### `/abilities`
### `/abilities/:abilitySlug`

Ability browse and detail pages.

### `/items`
### `/items/:itemSlug`

Item browse and detail pages.

### `/types`
### `/types/:typeSlug`

Type browse and detail pages.

### `/regions`
### `/regions/:regionSlug`

Region browse and detail pages.

### `/locations`
### `/locations/:locationSlug`

Location browse and detail pages.

## Route Design Principles

- routes should be readable
- routes should deep-link cleanly
- routes should stay stable if the backend changes later
- game context should be preservable through query state when appropriate

## Current Best Browse Paths

For most users, the strongest paths are:

1. home -> games
2. home -> Pokemon
3. home -> trainer appearances
4. game hub -> game-scoped Pokemon or trainer pages
