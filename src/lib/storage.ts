import type { AppStorage, CustomTeamSet, PresetTeam, StorageEnvelope, TeamMemberConfig } from "./types";
import {
  clampDescription,
  clampName,
  clampNickname,
  clampNotes,
  clampRole,
  clampTeamMembers,
  isImportPayloadWithinLimit,
  limitCustomTeamSets,
  sanitizeTagList,
} from "./security";

export const STORAGE_VERSION = 3;
const STORAGE_KEY = "pokenav-storage";
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
  if (pokemonId === null || !Number.isFinite(pokemonId) || pokemonId <= 0) return null;
  return {
    pokemonId,
    nickname: clampNickname(candidate.nickname),
    role: clampRole(candidate.role),
    notes: clampNotes(candidate.notes),
  };
}

function normalizeTeamSet(value: unknown): CustomTeamSet | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const id = clampName(candidate.id);
  const name = clampName(candidate.name);
  if (!id || !name) return null;
  const members = Array.isArray(candidate.members)
    ? clampTeamMembers(candidate.members.map(normalizeTeamMember).filter((member): member is TeamMemberConfig => Boolean(member)))
    : [];
  return {
    id,
    name,
    description: clampDescription(candidate.description),
    tags: sanitizeTagList(candidate.tags),
    notes: clampNotes(candidate.notes),
    members,
    updatedAt: typeof candidate.updatedAt === "string" && !Number.isNaN(Date.parse(candidate.updatedAt))
      ? candidate.updatedAt
      : new Date(0).toISOString(),
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
      ? clampTeamMembers(candidate.currentTeam.map(normalizeTeamMember).filter((member): member is TeamMemberConfig => Boolean(member)))
      : isNumberArray(candidate.team)
        ? clampTeamMembers(candidate.team.map((pokemonId) => ({ pokemonId, nickname: "", role: "", notes: "" })))
        : [],
    currentTeamProfile: candidate.currentTeamProfile && typeof candidate.currentTeamProfile === "object"
      ? {
          name: clampName((candidate.currentTeamProfile as Record<string, unknown>).name) || "Current Team",
          notes: clampNotes((candidate.currentTeamProfile as Record<string, unknown>).notes),
        }
      : { name: "Current Team", notes: "" },
    customTeamSets: Array.isArray(candidate.customTeamSets)
      ? limitCustomTeamSets(candidate.customTeamSets.map(normalizeTeamSet).filter((set): set is CustomTeamSet => Boolean(set)))
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
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Ignore storage quota and privacy-mode failures so the app remains usable.
  }
}

export function exportTeamSets(teamSets: CustomTeamSet[], presets: PresetTeam[]) {
  return JSON.stringify(
    {
      app: "PokeNav",
      exportType: "custom-team-sets",
      exportedAt: new Date().toISOString(),
      version: STORAGE_VERSION,
      customTeamSets: limitCustomTeamSets(teamSets.map(normalizeTeamSet).filter((set): set is CustomTeamSet => Boolean(set))),
      presetCount: presets.length,
    },
    null,
    2,
  );
}

export function importTeamSets(payload: string): CustomTeamSet[] {
  if (!isImportPayloadWithinLimit(payload)) return [];

  try {
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    const source = Array.isArray(parsed.customTeamSets)
      ? parsed.customTeamSets
      : Array.isArray(parsed)
        ? parsed
        : [];

    const seen = new Set<string>();
    return limitCustomTeamSets(
      source
        .map(normalizeTeamSet)
        .filter((set): set is CustomTeamSet => Boolean(set))
        .filter((set) => {
          if (seen.has(set.id)) return false;
          seen.add(set.id);
          return true;
        }),
    );
  } catch {
    return [];
  }
}
