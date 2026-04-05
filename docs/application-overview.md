# PokeNav Application Overview

## What It Is

PokeNav is a local-first Pokemon encyclopedia built to feel more like a browseable reference system than a single-list Pokedex clone. The application is organized around game context, linked entity pages, and readable article surfaces so users can move through Pokemon, trainers, moves, locations, and related records without losing their place.

The app is not trying to look complete by default. A big part of the product direction is being honest about what data is curated, derived, partial, or still in progress.

## Primary Workflows

### 1. Game-first exploration

PokeNav is strongest when a user starts from a game and browses outward. That flow keeps species, trainers, and locations grounded in the version or generation where they matter.

### 2. Pokemon reference and comparison

Species pages, forms, learnsets, moves, and compare views are meant to support slower reference use rather than fast novelty browsing. The goal is to make the encyclopedia readable and trustworthy.

### 3. Trainer archive research

Trainer pages and appearance records give the project a second strong identity beyond Pokemon pages alone. This helps the app stand out from simpler fan encyclopedias that stop at species data.

### 4. Lateral encyclopedia navigation

PokeNav is designed so users can move sideways through the data model: Pokemon to move, move to ability, trainer to location, location to game, and so on. That linked structure matters as much as the individual pages.

## Experience Priorities

- keep the browsing experience readable and calm instead of turning every page into a dashboard
- preserve game-specific differences where they matter
- favor stable local data over heavy live API hydration
- label incomplete or curated content honestly rather than implying universal coverage

## Runtime Model

PokeNav is a React and Vite application that serves generated local JSON datasets. The runtime model is intentionally static-first:

- data generation happens ahead of time through project scripts
- the app reads generated files from `public/data/`
- GitHub Pages deployment works because the app does not depend on a live backend

That model keeps the public demo lightweight and also makes local browsing reliable for development and research use.

## Current Strengths

- strong game-aware browse structure instead of a flat national-dex-first model
- meaningful trainer archive coverage that gives the project a distinct identity
- clear source hierarchy and a better documentation story around data trust
- good fit for static hosting and local reference use

## Current Limits

- some encyclopedia areas are still curated or partial and need continued expansion
- source reconciliation remains an ongoing maintenance task as datasets evolve
- the app is already useful, but it is still maturing toward a broader public-ready release

## Related Docs

| Document | Purpose |
| --- | --- |
| [README](../README.md) | Public landing page and feature overview |
| [Encyclopedia Architecture](encyclopedia-architecture.md) | Route, schema, and data-linking structure |
| [Pokemon System](pokemon-system.md) | Species, forms, moves, and game-context behavior |
| [Trainer System](trainer-system.md) | Trainer identity, appearance, and archive modeling |
| [Source Policy](source-policy.md) | Data trust rules and source hierarchy |
