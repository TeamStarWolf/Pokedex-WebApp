# Public Release Plan

This document describes what PokeNav still needs before it should be treated as a public-facing product.

## Release Goal

The app should feel like a real encyclopedia product, not a technically impressive prototype.

That means:

- easier navigation
- trustworthy summaries
- honest completeness cues
- usable mobile browse flows
- coherent primary entry points

## Public Entry Points

These should be the main top-level flows:

1. Browse by Game
2. Browse Pokemon
3. Browse Trainer Battles
4. Search

Everything else should support those flows rather than competing with them equally.

## Current Release Risks

### Navigation risk

The shell still uses too much vertical space before content begins.

Current problems:

- top nav plus utility nav plus game context can stack heavily
- article pages have a long preamble before the useful content starts
- secondary surfaces still compete with core paths

### Trust risk

Some summary values are technically sourced but read as misleading to normal users.

Examples:

- inflated move-entry counts caused by versioned records
- pages that feel deeper than the imported data actually is

### Mobile risk

Mobile layouts still show too much chrome and too much vertical friction.

Especially affected:

- trainer appearance browser
- article pages with infobox + support rail + tabs + status notes

### Content depth risk

Some page types still feel lighter than their structure suggests.

Most in need of deeper content:

- items
- locations
- some move and ability relationships
- trainer identity pages beyond battle records

## Recommended Release Checklist

### Navigation

- simplify the shell
- reduce or collapse utility nav
- compact the game context bar
- reduce header and title-deck height where possible

### Browse experience

- keep trainer appearances table-first
- improve mobile browse layout for dense data pages
- promote game hubs as core navigation centers

### Honesty and clarity

- review summary metrics for user trust
- keep section status cues, but reduce visual repetition
- hide or demote weak sections instead of overselling them

### Data confidence

- improve item and location depth
- expand game-aware reverse links
- improve trainer relationship and taxonomy data

### Documentation

- keep README current
- keep roadmap current
- add screenshots later if repo presentation matters

## Suggested Release Sequence

### Pass 1: UX compression

- nav cleanup
- game context compression
- article density improvements
- mobile layout adjustments

### Pass 2: Data trust

- clean misleading counts
- tighten section completeness messaging
- deepen the weakest entity families

### Pass 3: Final polish

- content QA
- bug fixes
- GitHub presentation pass

## Definition Of “Ready Enough”

PokeNav is ready for a public alpha when:

- the top-level flows are obvious
- dense pages are usable on mobile and desktop
- no major summary values feel obviously wrong
- partial data is disclosed clearly
- primary browse pages feel responsive
