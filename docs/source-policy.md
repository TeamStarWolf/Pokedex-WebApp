# PokeNav Source Policy

This project should use a source hierarchy instead of treating every Pokemon website as interchangeable.

## Primary Structured Source

- `PokeAPI`

Use PokeAPI for:

- national ordering
- species IDs
- slugs
- forms and varieties
- version-group identifiers
- machine-readable imports

PokeAPI is the core integrity source for generated local datasets.

## Primary Encyclopedia Reference

- `Bulbapedia`

Use Bulbapedia for:

- trainer identity and role validation
- game-specific trainer appearances
- battle rosters
- world and lore context
- cross-linked encyclopedia relationships

Bulbapedia is especially valuable when a page needs canon-style explanation rather than just structured fields.

## Mechanics Cross-Check

- `Pokemon Database`

Use Pokemon Database for:

- readable species page verification
- move and ability presentation checks
- item and stat sanity checks
- mechanic and browsing cross-checks

This is a validation and presentation reference, not the canonical structured import source.

## Secondary Browse Reference

- `Pokebase`

Use Pokebase as a secondary comparison source for:

- browse patterns
- search and filtering ideas
- spot-checking modern Pokemon reference UX

It should not replace PokeAPI for machine imports or Bulbapedia for trainer canon.

## Practical Rule

When validating data in PokeNav:

1. Check `PokeAPI` first for structure and identifiers.
2. Check `Bulbapedia` for canon/game-specific trainer and world context.
3. Use `Pokemon Database` to sanity-check readable mechanics and presentation.
4. Use `Pokebase` as secondary comparison support when helpful.

## Product Rule

If a page claims certainty, the backing data should either:

- come from a strong primary source, or
- be labeled clearly as `partial`, `derived`, or `curated`

That rule matters more than making every page look complete.
