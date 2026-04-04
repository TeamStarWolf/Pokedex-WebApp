export type EntityId =
  | `pokemon:${string}`
  | `form:${string}`
  | `evolution:${string}`
  | `move:${string}`
  | `ability:${string}`
  | `item:${string}`
  | `region:${string}`
  | `game:${string}`
  | `type:${string}`
  | `location:${string}`;

export type DataStatus = "complete" | "partial" | "missing" | "planned" | "unverified";

export type VersionValueState = "known" | "not-applicable" | "unknown" | "unverified";

export type GrowthRate =
  | "slow"
  | "medium"
  | "medium-slow"
  | "fast"
  | "erratic"
  | "fluctuating";

export type EggGroup =
  | "monster"
  | "water-1"
  | "bug"
  | "flying"
  | "field"
  | "fairy"
  | "grass"
  | "human-like"
  | "water-3"
  | "mineral"
  | "amorphous"
  | "water-2"
  | "ditto"
  | "dragon"
  | "undiscovered";

export type LearnMethod =
  | "level-up"
  | "machine"
  | "egg"
  | "tutor"
  | "reminder"
  | "evolution"
  | "form-change"
  | "special";

export type DamageClass = "physical" | "special" | "status";

export type EvolutionTrigger =
  | "level-up"
  | "use-item"
  | "trade"
  | "friendship"
  | "move-known"
  | "time-of-day"
  | "location"
  | "gender"
  | "weather"
  | "battle"
  | "other";

export type FormKind =
  | "default"
  | "regional"
  | "mega"
  | "gigantamax"
  | "battle"
  | "cosmetic"
  | "special"
  | "legendary-mode"
  | "fused"
  | "paradox"
  | "tera"
  | "totem";

export type GenderRatio = -1 | 0 | 1 | 2 | 4 | 6 | 8;

export type PokemonStatKey = "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed";

export type EffortValueYield = Partial<Record<PokemonStatKey, number>>;

export type NumericRange = {
  min: number;
  max: number;
};

export type SourceReference = {
  label: string;
  url?: string;
  sourceType: "bulbapedia" | "pokeapi" | "internal" | "manual" | "official";
  accessedAt?: string;
  notes?: string;
};

export type VersionedValue<T> = {
  gameVersionId: GameVersionId;
  state: VersionValueState;
  value: T | null;
  notes?: string[];
};

export type LinkReference = {
  entityId: EntityId;
  label: string;
  relationship:
    | "has-form"
    | "evolves-from"
    | "evolves-to"
    | "learns"
    | "has-ability"
    | "uses-item"
    | "appears-in"
    | "found-at"
    | "has-type"
    | "located-in"
    | "related-topic";
};

export type BaseEntity<TKind extends string, TId extends EntityId> = {
  id: TId;
  kind: TKind;
  slug: string;
  name: string;
  summary: string;
  status: DataStatus;
  sourceRefs: SourceReference[];
  relatedLinks: LinkReference[];
  expansionNotes?: string[];
};

export type RegionId = `region:${string}`;
export type GameVersionId = `game:${string}`;
export type PokemonId = `pokemon:${string}`;
export type PokemonFormId = `form:${string}`;
export type EvolutionId = `evolution:${string}`;
export type MoveId = `move:${string}`;
export type AbilityId = `ability:${string}`;
export type ItemId = `item:${string}`;
export type TypeId = `type:${string}`;
export type LocationId = `location:${string}`;

export type TypeEffectiveness = {
  attackingTypeId: TypeId;
  multiplier: 0 | 0.25 | 0.5 | 1 | 2 | 4;
};

export type TypeEntity = BaseEntity<"type", TypeId> & {
  colorToken: string;
  damageClassBias?: DamageClass;
  offensiveMatchups: TypeEffectiveness[];
  defensiveMatchups: TypeEffectiveness[];
};

export type RegionEntity = BaseEntity<"region", RegionId> & {
  generationLabel: string;
  introducedInGameId: GameVersionId | null;
  locationIds: LocationId[];
  gameVersionIds: GameVersionId[];
};

export type GameVersionEntity = BaseEntity<"game-version", GameVersionId> & {
  shortName: string;
  regionId: RegionId | null;
  generation: number;
  versionGroup: string;
  releaseDate: string | null;
  platform: string | null;
  pairedGameIds: GameVersionId[];
  regionalDexName?: string;
};

export type ItemEntity = BaseEntity<"item", ItemId> & {
  category: string;
  flingPower: number | null;
  flingEffect: string | null;
  purchasePrice: number | null;
  sellPrice: number | null;
  effectText: string;
  versionEffects: VersionedValue<string>[];
  relatedMoveIds: MoveId[];
  relatedPokemonIds: PokemonId[];
};

export type AbilityEntity = BaseEntity<"ability", AbilityId> & {
  isMainSeries: boolean;
  description: string;
  effectText: string;
  flavorTextByVersion: VersionedValue<string>[];
  pokemonFormIds: PokemonFormId[];
};

export type MoveEntity = BaseEntity<"move", MoveId> & {
  typeId: TypeId;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  target: string;
  effectChance: number | null;
  effectText: string;
  flavorTextByVersion: VersionedValue<string>[];
  machineItemIds: ItemId[];
  pokemonFormIds: PokemonFormId[];
};

export type LocationEncounter = {
  pokemonFormId: PokemonFormId;
  gameVersionId: GameVersionId;
  method: string;
  levelRange: NumericRange | null;
  rarityPercent: number | null;
  notes?: string[];
};

export type LocationEntity = BaseEntity<"location", LocationId> & {
  regionId: RegionId | null;
  gameVersionIds: GameVersionId[];
  parentLocationId: LocationId | null;
  mapLabel?: string;
  encounterTable: LocationEncounter[];
};

export type PokemonDexText = {
  gameVersionId: GameVersionId;
  text: string;
  language: string;
};

export type PokemonSpeciesEntity = BaseEntity<"pokemon-species", PokemonId> & {
  nationalDexNumber: number;
  categoryLabel: string;
  defaultFormId: PokemonFormId | null;
  formIds: PokemonFormId[];
  generation: number;
  introducedInGameId: GameVersionId | null;
  primaryTypeIds: TypeId[];
  eggGroups: EggGroup[];
  hatchCounter: number | null;
  captureRate: number | null;
  baseFriendship: number | null;
  genderRatio: GenderRatio | null;
  growthRate: GrowthRate | null;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  isParadox: boolean;
  browseTags: string[];
  habitat: string | null;
  shape: string | null;
  color: string | null;
  evolutionIds: EvolutionId[];
  pokedexGameIds: GameVersionId[];
  pokedexEntries: PokemonDexText[];
  locationIds: LocationId[];
  competitiveSummary: string[];
  loreSummary: string[];
  trivia: string[];
  relatedItemIds: ItemId[];
};

export type PokemonFormAbility = {
  abilityId: AbilityId;
  slot: 1 | 2 | 3;
  isHidden: boolean;
};

export type PokemonLearnsetEntry = {
  moveId: MoveId;
  gameVersionId: GameVersionId;
  method: LearnMethod;
  level: number | null;
  order: number;
  notes?: string[];
};

export type PokemonFormEntity = BaseEntity<"pokemon-form", PokemonFormId> & {
  speciesId: PokemonId;
  formKey: string;
  formName: string;
  formKind: FormKind;
  isDefault: boolean;
  introducedInGameId: GameVersionId | null;
  availableInGameIds: GameVersionId[];
  typeIds: TypeId[];
  abilitySlots: PokemonFormAbility[];
  stats: Record<PokemonStatKey, number>;
  evYield: EffortValueYield;
  heightDecimetres: number | null;
  weightHectograms: number | null;
  heldItemIds: ItemId[];
  heldItemsByVersion: VersionedValue<ItemId[]>[];
  learnset: PokemonLearnsetEntry[];
  breedingNotes: string[];
  spriteUrl?: string;
  artworkUrl?: string;
};

export type EvolutionRequirement = {
  trigger: EvolutionTrigger;
  minLevel?: number;
  itemId?: ItemId;
  knownMoveId?: MoveId;
  locationId?: LocationId;
  gameVersionId?: GameVersionId;
  heldItemId?: ItemId;
  minFriendship?: number;
  gender?: "male" | "female";
  timeOfDay?: "day" | "night" | "dusk";
  weather?: string;
  notes?: string[];
};

export type EvolutionEntity = BaseEntity<"evolution", EvolutionId> & {
  fromSpeciesId: PokemonId;
  toSpeciesId: PokemonId;
  fromFormId?: PokemonFormId;
  toFormId?: PokemonFormId;
  requirements: EvolutionRequirement[];
};

export type EncyclopediaSchema = {
  pokemon: Record<PokemonId, PokemonSpeciesEntity>;
  forms: Record<PokemonFormId, PokemonFormEntity>;
  evolutions: Record<EvolutionId, EvolutionEntity>;
  moves: Record<MoveId, MoveEntity>;
  abilities: Record<AbilityId, AbilityEntity>;
  items: Record<ItemId, ItemEntity>;
  regions: Record<RegionId, RegionEntity>;
  gameVersions: Record<GameVersionId, GameVersionEntity>;
  types: Record<TypeId, TypeEntity>;
  locations: Record<LocationId, LocationEntity>;
};

export const EMPTY_ENCYCLOPEDIA_SCHEMA: EncyclopediaSchema = {
  pokemon: {},
  forms: {},
  evolutions: {},
  moves: {},
  abilities: {},
  items: {},
  regions: {},
  gameVersions: {},
  types: {},
  locations: {},
};

// Centralized route builders keep entity linking stable if the app later moves
// to server-side rendering or a database-backed API.
export const encyclopediaRoutes = {
  home: () => "/",
  search: () => "/search",
  nationalDex: () => "/dex/national",
  regionalDex: (regionSlug: string) => `/dex/region/${regionSlug}`,
  trainers: () => "/trainers",
  trainer: (trainerSlug: string) => `/trainers/${trainerSlug}`,
  trainerAppearance: (trainerSlug: string, appearanceSlug: string) => `/trainers/${trainerSlug}/appearances/${appearanceSlug}`,
  pokemon: (speciesSlug: string) => `/pokemon/${speciesSlug}`,
  pokemonMoves: (speciesSlug: string) => `/pokemon/${speciesSlug}/moves`,
  pokemonForm: (speciesSlug: string, formSlug: string) => `/pokemon/${speciesSlug}/forms/${formSlug}`,
  move: (moveSlug: string) => `/moves/${moveSlug}`,
  ability: (abilitySlug: string) => `/abilities/${abilitySlug}`,
  item: (itemSlug: string) => `/items/${itemSlug}`,
  type: (typeSlug: string) => `/types/${typeSlug}`,
  region: (regionSlug: string) => `/regions/${regionSlug}`,
  game: (gameSlug: string) => `/games/${gameSlug}`,
  gamePokemon: (gameSlug: string) => `/games/${gameSlug}/pokemon`,
  gameTrainers: (gameSlug: string) => `/games/${gameSlug}/trainers`,
  gameLocations: (gameSlug: string) => `/games/${gameSlug}/locations`,
  location: (locationSlug: string) => `/locations/${locationSlug}`,
};
