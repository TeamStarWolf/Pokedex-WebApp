// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
export type PokemonSummary = {
  id: number;
  name: string;
  image: string;
  generation: string;
  generationLabel: string;
  types: string[];
  versionCount: number;
  versionGroupCount: number;
  varietyCount: number;
  moveCount: number;
  isLegendary: boolean;
  isMythical: boolean;
  entryGames: string[];
  moveGroups: string[];
  formNames: string[];
  formTags: string[];
};

export type PokemonMove = {
  move: string;
  method: string;
  level: number;
};

export type PokemonForm = {
  id: number;
  speciesId: number;
  name: string;
  image: string;
  isDefault: boolean;
  tag: string | null;
  formFamily: string;
  types: string[];
  abilities: Array<{ name: string; hidden: boolean }>;
  stats: Array<{ name: string; value: number }>;
  baseStatTotal: number;
  height: number;
  weight: number;
  moveCount: number;
  availableVersionGroups: string[];
  versionGroupMoves: Record<string, PokemonMove[]>;
};

export type PokemonDetail = {
  id: number;
  speciesName: string;
  genus: string;
  generation: string;
  generationLabel: string;
  color: string;
  habitat: string;
  shape: string;
  captureRate: number | null;
  happiness: number | null;
  growthRate: string;
  eggGroups: string[];
  hatchCounter: number | null;
  genderRate: number | null;
  isLegendary: boolean;
  isMythical: boolean;
  forms: PokemonForm[];
  defaultFormId: number | null;
  versionEntries: Array<{ version: string; text: string }>;
  entryGameVersions: string[];
  moveGameGroups: string[];
  evolutionRows: Array<{ name: string; stage: number }>;
};

export type PresetTeam = {
  id: string;
  name: string;
  trainer: string;
  category: string;
  region: string;
  battleLabel: string;
  sourceGame: string;
  sourceGroup: string;
  difficulty: "low" | "medium" | "high" | "elite";
  canonical: boolean;
  description: string;
  howToBeat: string[];
  tags: string[];
  allowDuplicates?: boolean;
  members: number[];
  source?: {
    kind: "bulbapedia";
    label: string;
    url: string;
    note?: string;
  };
};

export type TrainerDossier = {
  trainer: string;
  region: string;
  categories: string[];
  sourceGames: string[];
  difficulties: Array<"low" | "medium" | "high" | "elite">;
  canonicalCount: number;
  inspiredCount: number;
  presetCount: number;
  acePokemonId: number | null;
  acePokemonName: string;
  teamMemberCount: number;
  uniqueTypeCount: number;
  totalMoveGroups: number;
  specialPokemonCount: number;
  battleLabels: string[];
  tags: string[];
  source?: PresetTeam["source"];
};

export type TrainerAppearance = {
  slug: string;
  trainerSlug: string;
  trainer: string;
  presetId: string;
  name: string;
  region: string;
  category: string;
  battleLabel: string;
  sourceGame: string;
  sourceGroup: string;
  difficulty: PresetTeam["difficulty"];
  canonical: boolean;
  description: string;
  howToBeat: string[];
  tags: string[];
  members: number[];
  acePokemonId: number | null;
  source?: PresetTeam["source"];
};

export type TrainerAppearanceSummary = Omit<TrainerAppearance, "description" | "howToBeat">;

export type TrainerReferenceManifest = {
  appearances: TrainerAppearanceSummary[];
};

export type TrainerDetailPayload = {
  trainerSlug: string;
  presets: PresetTeam[];
};

export type EncyclopediaEntityKind = "region" | "game" | "topic" | "species-index" | "trainer-index";

export type EncyclopediaLink = {
  slug: string;
  label: string;
  kind: EncyclopediaEntityKind;
};

export type EncyclopediaVersionSlice = {
  label: string;
  sourceGroup: string;
  status: "complete" | "partial" | "planned";
  notes: string[];
};

export type EncyclopediaPage = {
  slug: string;
  title: string;
  kind: EncyclopediaEntityKind;
  summary: string;
  body: string[];
  tags: string[];
  links: EncyclopediaLink[];
  versionSlices: EncyclopediaVersionSlice[];
  relatedPokemonIds: number[];
  relatedTrainerNames: string[];
  completeness: "seed" | "growing" | "broad";
};

export type TeamMemberConfig = {
  pokemonId: number;
  nickname: string;
  role: string;
  notes: string;
};

export type CustomTeamSet = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  notes: string;
  members: TeamMemberConfig[];
  updatedAt: string;
};

export type TeamProfile = {
  name: string;
  notes: string;
};

export type StorageEnvelope<T> = {
  version: number;
  value: T;
};

export type AppStorage = {
  favorites: number[];
  currentTeam: TeamMemberConfig[];
  currentTeamProfile: TeamProfile;
  customTeamSets: CustomTeamSet[];
};
