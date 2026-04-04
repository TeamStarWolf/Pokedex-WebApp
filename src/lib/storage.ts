import type { AppStorage, CustomTeamSet, PresetTeam, StorageEnvelope, TeamMemberConfig } from "./types";

export const STORAGE_VERSION = 3;
const STORAGE_KEY = "pokedex-web-app-v2-storage";
const LEGACY_FAVORITES = "pokedex-favorites-v2";
const LEGACY_TEAM = "pokedex-team-v2";
const LEGACY_FAVORITES_V1 = "pokedex-favorites";
const LEGACY_TEAM_V1 = "pokedex-team";

export const emptyStorage = (): AppStorage => ({
  favorites: [],
  currentTeam: [],
  currentTeamProfile: { name: "Current Team", notes: "" },
  customTeamSets: [],
});

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function normalizeTeamMember(value: unknown): TeamMemberConfig | null {
  if (typeof value === "number") {
    return { pokemonId: value, nickname: "", role: "", notes: "" };
  }
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const pokemonId = typeof candidate.pokemonId === "number"
    ? candidate.pokemonId
    : typeof candidate.id === "number"
      ? candidate.id
      : null;
  if (pokemonId === null) return null;
  return {
    pokemonId,
    nickname: typeof candidate.nickname === "string" ? candidate.nickname : "",
    role: typeof candidate.role === "string" ? candidate.role : "",
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
  };
}

function normalizeTeamSet(value: unknown): CustomTeamSet | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return null;
  const members = Array.isArray(candidate.members)
    ? candidate.members.map(normalizeTeamMember).filter((member): member is TeamMemberConfig => Boolean(member))
    : [];
  return {
    id: candidate.id,
    name: candidate.name,
    description: typeof candidate.description === "string" ? candidate.description : "",
    tags: Array.isArray(candidate.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === "string") : [],
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
    members,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date(0).toISOString(),
  };
}

export function migrateStorage(raw: unknown): AppStorage {
  if (!raw || typeof raw !== "object") return emptyStorage();
  const envelope = raw as Partial<StorageEnvelope<unknown>>;
  const value = envelope.version ? envelope.value : raw;
  if (!value || typeof value !== "object") return emptyStorage();
  const candidate = value as Record<string, unknown>;
  return {
    favorites: isNumberArray(candidate.favorites) ? candidate.favorites : [],
    currentTeam: Array.isArray(candidate.currentTeam)
      ? candidate.currentTeam.map(normalizeTeamMember).filter((member): member is TeamMemberConfig => Boolean(member))
      : isNumberArray(candidate.team)
        ? candidate.team.map((pokemonId) => ({ pokemonId, nickname: "", role: "", notes: "" }))
        : [],
    currentTeamProfile: candidate.currentTeamProfile && typeof candidate.currentTeamProfile === "object"
      ? {
          name: typeof (candidate.currentTeamProfile as Record<string, unknown>).name === "string" ? (candidate.currentTeamProfile as Record<string, unknown>).name as string : "Current Team",
          notes: typeof (candidate.currentTeamProfile as Record<string, unknown>).notes === "string" ? (candidate.currentTeamProfile as Record<string, unknown>).notes as string : "",
        }
      : { name: "Current Team", notes: "" },
    customTeamSets: Array.isArray(candidate.customTeamSets)
      ? candidate.customTeamSets.map(normalizeTeamSet).filter((set): set is CustomTeamSet => Boolean(set))
      : [],
  };
}

export function readAppStorage(storage: Storage = window.localStorage): AppStorage {
  const current = storage.getItem(STORAGE_KEY);
  if (current) {
    try {
      return migrateStorage(JSON.parse(current));
    } catch {
      return emptyStorage();
    }
  }

  const favorites = [LEGACY_FAVORITES, LEGACY_FAVORITES_V1]
    .map((key) => storage.getItem(key))
    .find(Boolean);
  const team = [LEGACY_TEAM, LEGACY_TEAM_V1]
    .map((key) => storage.getItem(key))
    .find(Boolean);

  try {
    return {
      favorites: favorites ? JSON.parse(favorites) : [],
      currentTeam: team ? JSON.parse(team).map((pokemonId: number) => ({ pokemonId, nickname: "", role: "", notes: "" })) : [],
      currentTeamProfile: { name: "Current Team", notes: "" },
      customTeamSets: [],
    };
  } catch {
    return emptyStorage();
  }
}

export function writeAppStorage(value: AppStorage, storage: Storage = window.localStorage) {
  const envelope: StorageEnvelope<AppStorage> = {
    version: STORAGE_VERSION,
    value,
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export function exportTeamSets(teamSets: CustomTeamSet[], presets: PresetTeam[]) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: STORAGE_VERSION,
      customTeamSets: teamSets,
      presets,
    },
    null,
    2,
  );
}

export function importTeamSets(payload: string): CustomTeamSet[] {
  try {
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    const source = Array.isArray(parsed.customTeamSets) ? parsed.customTeamSets : [];
    return source.map(normalizeTeamSet).filter((set): set is CustomTeamSet => Boolean(set));
  } catch {
    return [];
  }
}
