import {
  encyclopediaRoutes,
  type AbilityEntity,
  type EncyclopediaSchema,
  type GameVersionEntity,
  type ItemEntity,
  type LocationEntity,
  type MoveEntity,
  type PokemonFormEntity,
  type PokemonId,
  type PokemonSpeciesEntity,
  type PokemonStatKey,
  type RegionEntity,
  type TypeEntity,
} from "./encyclopedia-schema";

type EntityWithName = { name: string; slug: string };

// Slug-index cache: avoids O(n) linear scans on every getXBySlug call.
// Keyed by the collection reference so the cache invalidates when the schema changes.
const slugIndexCache = new WeakMap<object, Map<string, unknown>>();

function getOrBuildSlugIndex<T extends { slug: string }>(collection: Record<string, T>): Map<string, T> {
  let index = slugIndexCache.get(collection) as Map<string, T> | undefined;
  if (!index) {
    index = new Map(Object.values(collection).map((entity) => [entity.slug, entity]));
    slugIndexCache.set(collection, index as Map<string, unknown>);
  }
  return index;
}

// Evolution adjacency cache: avoids O(k*n) loop in getEvolutionFamily.
const evolutionAdjacencyCache = new WeakMap<object, Map<PokemonId, Set<PokemonId>>>();

function getEvolutionAdjacency(evolutions: Record<string, { fromSpeciesId: PokemonId; toSpeciesId: PokemonId }>) {
  let adjacency = evolutionAdjacencyCache.get(evolutions);
  if (!adjacency) {
    adjacency = new Map();
    for (const evolution of Object.values(evolutions)) {
      if (!adjacency.has(evolution.fromSpeciesId)) adjacency.set(evolution.fromSpeciesId, new Set());
      if (!adjacency.has(evolution.toSpeciesId)) adjacency.set(evolution.toSpeciesId, new Set());
      adjacency.get(evolution.fromSpeciesId)!.add(evolution.toSpeciesId);
      adjacency.get(evolution.toSpeciesId)!.add(evolution.fromSpeciesId);
    }
    evolutionAdjacencyCache.set(evolutions, adjacency);
  }
  return adjacency;
}

export type SearchResult = {
  kind: "pokemon" | "move" | "ability" | "item" | "region" | "type" | "game" | "location";
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
  gameIds: string[];
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSearchText(value: string) {
  return slugify(value).replace(/-/g, "");
}

export function fuzzyScore(query: string, candidate: string) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedCandidate = normalizeSearchText(candidate);

  if (!normalizedQuery) return 0;
  if (normalizedCandidate === normalizedQuery) return 100;
  if (normalizedCandidate.startsWith(normalizedQuery)) return 80;
  if (normalizedCandidate.includes(normalizedQuery)) return 60;

  let queryIndex = 0;
  let streak = 0;
  let score = 0;

  for (const character of normalizedCandidate) {
    if (character === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      streak += 1;
      score += 4 + streak;
      if (queryIndex === normalizedQuery.length) return score;
    } else {
      streak = 0;
    }
  }

  return queryIndex === normalizedQuery.length ? score : -1;
}

export function listPokemon(schema: EncyclopediaSchema) {
  return Object.values(schema.pokemon).sort((left, right) => left.nationalDexNumber - right.nationalDexNumber);
}

export function listMoves(schema: EncyclopediaSchema) {
  return Object.values(schema.moves).sort((left, right) => left.name.localeCompare(right.name));
}

export function listAbilities(schema: EncyclopediaSchema) {
  return Object.values(schema.abilities).sort((left, right) => left.name.localeCompare(right.name));
}

export function listItems(schema: EncyclopediaSchema) {
  return Object.values(schema.items).sort((left, right) => left.name.localeCompare(right.name));
}

export function listRegions(schema: EncyclopediaSchema) {
  return Object.values(schema.regions).sort((left, right) => left.name.localeCompare(right.name));
}

export function listTypes(schema: EncyclopediaSchema) {
  return Object.values(schema.types).sort((left, right) => left.name.localeCompare(right.name));
}

export function listGames(schema: EncyclopediaSchema) {
  return Object.values(schema.gameVersions).sort((left, right) => left.name.localeCompare(right.name));
}

export function listLocations(schema: EncyclopediaSchema) {
  return Object.values(schema.locations).sort((left, right) => left.name.localeCompare(right.name));
}

export function getSpeciesBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.pokemon).get(slug) ?? null;
}

export function getMoveBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.moves).get(slug) ?? null;
}

export function getAbilityBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.abilities).get(slug) ?? null;
}

export function getItemBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.items).get(slug) ?? null;
}

export function getRegionBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.regions).get(slug) ?? null;
}

export function getTypeBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.types).get(slug) ?? null;
}

export function getGameBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.gameVersions).get(slug) ?? null;
}

export function getLocationBySlug(schema: EncyclopediaSchema, slug: string) {
  return getOrBuildSlugIndex(schema.locations).get(slug) ?? null;
}

export function getDefaultForm(schema: EncyclopediaSchema, species: PokemonSpeciesEntity) {
  const forms = species.formIds.map((id) => schema.forms[id]).filter(Boolean);
  return forms.find((form) => form.isDefault) ?? forms[0] ?? null;
}

export function getFormBySlug(schema: EncyclopediaSchema, speciesSlug: string, formSlug: string) {
  const species = getSpeciesBySlug(schema, speciesSlug);
  if (!species) return null;
  return getFormsForSpecies(schema, species).find((form) => form.slug === formSlug) ?? null;
}

export function getFormsForSpecies(schema: EncyclopediaSchema, species: PokemonSpeciesEntity) {
  return species.formIds.map((id) => schema.forms[id]).filter(Boolean);
}

export function getAbilitiesForForm(schema: EncyclopediaSchema, form: PokemonFormEntity) {
  return form.abilitySlots.map((slot) => schema.abilities[slot.abilityId]).filter(Boolean);
}

export function getMovesForForm(schema: EncyclopediaSchema, form: PokemonFormEntity) {
  return form.learnset.map((entry) => ({
    ...entry,
    move: schema.moves[entry.moveId],
    game: schema.gameVersions[entry.gameVersionId],
  })).filter((entry) => entry.move && entry.game);
}

export function getLocationsForSpecies(schema: EncyclopediaSchema, species: PokemonSpeciesEntity) {
  return species.locationIds.map((id) => schema.locations[id]).filter(Boolean);
}

export function getEvolutionFamily(schema: EncyclopediaSchema, species: PokemonSpeciesEntity) {
  const adjacency = getEvolutionAdjacency(schema.evolutions);
  const visited = new Set<PokemonId>([species.id]);
  const queue: PokemonId[] = [species.id];

  while (queue.length) {
    const current = queue.pop()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return listPokemon(schema).filter((entry) => visited.has(entry.id));
}

export function getPokemonByType(schema: EncyclopediaSchema, typeId: TypeEntity["id"]) {
  return listPokemon(schema).filter((species) => {
    const form = getDefaultForm(schema, species);
    return form ? form.typeIds.includes(typeId) : false;
  });
}

export function getPokemonByAbility(schema: EncyclopediaSchema, abilityId: AbilityEntity["id"]) {
  return listPokemon(schema).filter((species) =>
    getFormsForSpecies(schema, species).some((form) => form.abilitySlots.some((slot) => slot.abilityId === abilityId)),
  );
}

export function getPokemonByMove(schema: EncyclopediaSchema, moveId: MoveEntity["id"]) {
  const move = schema.moves[moveId];
  if (move?.pokemonFormIds.length) {
    const speciesIds = new Set(
      move.pokemonFormIds
        .map((formId) => schema.forms[formId]?.speciesId)
        .filter((speciesId): speciesId is PokemonId => Boolean(speciesId)),
    );
    return listPokemon(schema).filter((species) => speciesIds.has(species.id));
  }

  return listPokemon(schema).filter((species) =>
    getFormsForSpecies(schema, species).some((form) => form.learnset.some((entry) => entry.moveId === moveId)),
  );
}

export function getPokemonByItem(schema: EncyclopediaSchema, itemId: ItemEntity["id"]) {
  return listPokemon(schema).filter((species) =>
    getFormsForSpecies(schema, species).some((form) => form.heldItemIds.includes(itemId)) || species.relatedItemIds.includes(itemId),
  );
}

export function getPokemonByRegion(schema: EncyclopediaSchema, regionId: RegionEntity["id"]) {
  const locationIds = new Set(Object.values(schema.locations).filter((location) => location.regionId === regionId).map((location) => location.id));
  return listPokemon(schema).filter((species) => species.locationIds.some((locationId) => locationIds.has(locationId)));
}

export function getPokemonByEggGroup(schema: EncyclopediaSchema, eggGroup: string) {
  return listPokemon(schema).filter((species) => species.eggGroups.includes(eggGroup as never));
}

export function getPokemonByGame(schema: EncyclopediaSchema, gameId: GameVersionEntity["id"]) {
  return listPokemon(schema).filter((species) =>
    species.pokedexGameIds.includes(gameId) || species.pokedexEntries.some((entry) => entry.gameVersionId === gameId),
  );
}

export function getComparableStats(schema: EncyclopediaSchema, species: PokemonSpeciesEntity) {
  const form = getDefaultForm(schema, species);
  return form?.stats ?? null;
}

export function getStatTotal(stats: Record<PokemonStatKey, number>) {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

export function getTypeEffectivenessSummary(schema: EncyclopediaSchema, form: PokemonFormEntity) {
  const defendingTypes = form.typeIds.map((id) => schema.types[id]).filter(Boolean);
  const multipliers = new Map<string, number>();

  for (const type of Object.values(schema.types)) {
    let multiplier = 1;
    for (const defendingType of defendingTypes) {
      const matchup = defendingType.defensiveMatchups.find((entry) => entry.attackingTypeId === type.id);
      multiplier *= matchup?.multiplier ?? 1;
    }
    multipliers.set(type.id, multiplier);
  }

  return Array.from(multipliers.entries())
    .map(([typeId, multiplier]) => ({ type: schema.types[typeId as TypeEntity["id"]], multiplier }))
    .filter((entry) => entry.type)
    .sort((left, right) => right.multiplier - left.multiplier);
}

export function groupLearnsetByMethod(schema: EncyclopediaSchema, form: PokemonFormEntity) {
  const grouped = new Map<string, ReturnType<typeof getMovesForForm>>();
  for (const entry of getMovesForForm(schema, form)) {
    const current = grouped.get(entry.method) ?? [];
    current.push(entry);
    grouped.set(entry.method, current);
  }

  return Array.from(grouped.entries()).map(([method, entries]) => ({
    method,
    entries: entries.sort((left, right) => (left.level ?? 999) - (right.level ?? 999) || left.move.name.localeCompare(right.move.name)),
  }));
}

export function getUniqueMoveCount(form: Pick<PokemonFormEntity, "learnset">) {
  return new Set(form.learnset.map((entry) => entry.moveId)).size;
}

export function buildSearchIndex(schema: EncyclopediaSchema): SearchResult[] {
  const records: SearchResult[] = [];

  function pushRecord(kind: SearchResult["kind"], entity: EntityWithName, subtitle: string, href: string, gameIds: string[] = []) {
    records.push({ kind, slug: entity.slug, title: entity.name, subtitle, href, score: 0, gameIds });
  }

  for (const species of listPokemon(schema)) {
    pushRecord(
      "pokemon",
      species,
      `Pokemon #${species.nationalDexNumber.toString().padStart(4, "0")}`,
      encyclopediaRoutes.pokemon(species.slug),
      uniqueStrings([
        ...species.pokedexGameIds,
        ...species.pokedexEntries.map((entry) => entry.gameVersionId),
      ]),
    );
  }
  for (const move of listMoves(schema)) {
    pushRecord(
      "move",
      move,
      "Move",
      encyclopediaRoutes.move(move.slug),
      uniqueStrings(move.flavorTextByVersion.map((entry) => entry.gameVersionId)),
    );
  }
  for (const ability of listAbilities(schema)) {
    pushRecord(
      "ability",
      ability,
      "Ability",
      encyclopediaRoutes.ability(ability.slug),
      uniqueStrings(ability.flavorTextByVersion.map((entry) => entry.gameVersionId)),
    );
  }
  for (const item of Object.values(schema.items)) {
    pushRecord(
      "item",
      item,
      "Item",
      encyclopediaRoutes.item(item.slug),
      uniqueStrings(item.versionEffects.map((entry) => entry.gameVersionId)),
    );
  }
  for (const region of listRegions(schema)) {
    pushRecord("region", region, "Region", encyclopediaRoutes.region(region.slug), region.gameVersionIds);
  }
  for (const type of listTypes(schema)) pushRecord("type", type, "Type", encyclopediaRoutes.type(type.slug));
  for (const game of Object.values(schema.gameVersions)) pushRecord("game", game, "Game version", encyclopediaRoutes.game(game.slug), [game.id]);
  for (const location of Object.values(schema.locations)) {
    pushRecord("location", location, "Location", encyclopediaRoutes.location(location.slug), location.gameVersionIds);
  }

  return records;
}

export function searchEntities(schema: EncyclopediaSchema, query: string) {
  if (!query.trim()) return [];
  return buildSearchIndex(schema)
    .map((entry) => ({ ...entry, score: fuzzyScore(query, `${entry.title} ${entry.subtitle}`) }))
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function createBreadcrumbs(entries: Array<{ label: string; href?: string }>) {
  return entries;
}

export function formatHeight(decimetres: number | null) {
  if (decimetres == null) return "Unknown";
  return `${(decimetres / 10).toFixed(1)} m`;
}

export function formatWeight(hectograms: number | null) {
  if (hectograms == null) return "Unknown";
  return `${(hectograms / 10).toFixed(1)} kg`;
}

export function formatGenderRatio(value: number | null) {
  if (value == null) return "Unknown";
  if (value === -1) return "Gender unknown";
  const female = (value / 8) * 100;
  const male = 100 - female;
  return `${male.toFixed(1)}% male / ${female.toFixed(1)}% female`;
}

export function formatEggGroup(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function formatMethodLabel(method: string) {
  return method.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (safePage - 1) * pageSize;
  return {
    page: Math.min(safePage, totalPages),
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}
