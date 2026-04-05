const MAX_IMPORT_PAYLOAD_CHARS = 200_000;
const MAX_CUSTOM_TEAM_SETS = 100;
const MAX_TEAM_MEMBERS = 6;
const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 240;
const MAX_NOTES_LENGTH = 4_000;
const MAX_ROLE_LENGTH = 80;
const MAX_NICKNAME_LENGTH = 80;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 32;

const LOCAL_HTTP_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function clampText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function clampName(value: unknown) {
  return clampText(value, MAX_NAME_LENGTH);
}

export function clampDescription(value: unknown) {
  return clampText(value, MAX_DESCRIPTION_LENGTH);
}

export function clampNotes(value: unknown) {
  return clampText(value, MAX_NOTES_LENGTH);
}

export function clampRole(value: unknown) {
  return clampText(value, MAX_ROLE_LENGTH);
}

export function clampNickname(value: unknown) {
  return clampText(value, MAX_NICKNAME_LENGTH);
}

export function sanitizeTagList(value: unknown) {
  if (!Array.isArray(value)) return [];

  const tags = value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().slice(0, MAX_TAG_LENGTH))
    .filter(Boolean);

  return Array.from(new Set(tags)).slice(0, MAX_TAGS);
}

export function clampTeamMembers<T>(members: T[]) {
  return members.slice(0, MAX_TEAM_MEMBERS);
}

export function limitCustomTeamSets<T>(teamSets: T[]) {
  return teamSets.slice(0, MAX_CUSTOM_TEAM_SETS);
}

export function isImportPayloadWithinLimit(payload: string) {
  return payload.trim().length > 0 && payload.length <= MAX_IMPORT_PAYLOAD_CHARS;
}

export function sanitizeExternalUrl(rawUrl?: string | null) {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  try {
    const base = typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://pokenav.local";
    const parsed = new URL(rawUrl, base);
    const protocol = parsed.protocol.toLowerCase();

    if (protocol === "https:") return parsed.toString();
    if (protocol === "http:" && LOCAL_HTTP_HOSTS.has(parsed.hostname)) return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

export const securityLimits = {
  MAX_IMPORT_PAYLOAD_CHARS,
  MAX_CUSTOM_TEAM_SETS,
  MAX_TEAM_MEMBERS,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH,
};
