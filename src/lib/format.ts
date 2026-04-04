const generationLabels: Record<string, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

const versionGroupLabels: Record<string, string> = {
  "red-blue": "Red / Blue",
  "red-green-japan": "Red / Green (JP)",
  "blue-japan": "Blue (JP)",
  yellow: "Yellow",
  "gold-silver": "Gold / Silver",
  crystal: "Crystal",
  "ruby-sapphire": "Ruby / Sapphire",
  emerald: "Emerald",
  "firered-leafgreen": "FireRed / LeafGreen",
  "diamond-pearl": "Diamond / Pearl",
  platinum: "Platinum",
  "heartgold-soulsilver": "HeartGold / SoulSilver",
  "black-white": "Black / White",
  colosseum: "Colosseum",
  xd: "XD: Gale of Darkness",
  "black-2-white-2": "Black 2 / White 2",
  "x-y": "X / Y",
  "omega-ruby-alpha-sapphire": "Omega Ruby / Alpha Sapphire",
  "sun-moon": "Sun / Moon",
  "ultra-sun-ultra-moon": "Ultra Sun / Ultra Moon",
  "lets-go-pikachu-lets-go-eevee": "Let's Go Pikachu / Eevee",
  "sword-shield": "Sword / Shield",
  "the-isle-of-armor": "Isle of Armor",
  "the-crown-tundra": "Crown Tundra",
  "brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
  "brilliant-diamond-and-shining-pearl": "Brilliant Diamond / Shining Pearl",
  "legends-arceus": "Legends: Arceus",
  "scarlet-violet": "Scarlet / Violet",
  "the-teal-mask": "The Teal Mask",
  "the-indigo-disk": "The Indigo Disk",
};

const versionLabels: Record<string, string> = {
  red: "Pokemon Red",
  blue: "Pokemon Blue",
  yellow: "Pokemon Yellow",
  gold: "Pokemon Gold",
  silver: "Pokemon Silver",
  crystal: "Pokemon Crystal",
  ruby: "Pokemon Ruby",
  sapphire: "Pokemon Sapphire",
  emerald: "Pokemon Emerald",
  firered: "Pokemon FireRed",
  leafgreen: "Pokemon LeafGreen",
  diamond: "Pokemon Diamond",
  pearl: "Pokemon Pearl",
  platinum: "Pokemon Platinum",
  heartgold: "Pokemon HeartGold",
  soulsilver: "Pokemon SoulSilver",
  black: "Pokemon Black",
  white: "Pokemon White",
  "black-2": "Pokemon Black 2",
  "white-2": "Pokemon White 2",
  x: "Pokemon X",
  y: "Pokemon Y",
  "omega-ruby": "Pokemon Omega Ruby",
  "alpha-sapphire": "Pokemon Alpha Sapphire",
  sun: "Pokemon Sun",
  moon: "Pokemon Moon",
  "ultra-sun": "Pokemon Ultra Sun",
  "ultra-moon": "Pokemon Ultra Moon",
  "lets-go-pikachu": "Pokemon Let's Go Pikachu",
  "lets-go-eevee": "Pokemon Let's Go Eevee",
  sword: "Pokemon Sword",
  shield: "Pokemon Shield",
  "brilliant-diamond": "Pokemon Brilliant Diamond",
  "shining-pearl": "Pokemon Shining Pearl",
  "legends-arceus": "Pokemon Legends: Arceus",
  scarlet: "Pokemon Scarlet",
  violet: "Pokemon Violet",
};

export const typeColors: Record<string, string> = {
  normal: "type-normal",
  fire: "type-fire",
  water: "type-water",
  electric: "type-electric",
  grass: "type-grass",
  ice: "type-ice",
  fighting: "type-fighting",
  poison: "type-poison",
  ground: "type-ground",
  flying: "type-flying",
  psychic: "type-psychic",
  bug: "type-bug",
  rock: "type-rock",
  ghost: "type-ghost",
  dragon: "type-dragon",
  dark: "type-dark",
  steel: "type-steel",
  fairy: "type-fairy",
};

export const statLabels: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "SPD",
};

export function capitalize(value = "") {
  if (!value) return "";
  return value
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function padDex(value: number) {
  return String(value).padStart(4, "0");
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function formatGenerationLabel(value = "") {
  return generationLabels[value] ?? capitalize(value);
}

export function formatVersionLabel(value = "") {
  return versionLabels[value] ?? capitalize(value);
}

export function formatVersionGroupLabel(value = "") {
  return versionGroupLabels[value] ?? capitalize(value);
}

export function getFormTag(name = "") {
  const normalized = name.toLowerCase();
  if (normalized.includes("alola")) return "Alolan";
  if (normalized.includes("galar")) return "Galarian";
  if (normalized.includes("hisui")) return "Hisuian";
  if (normalized.includes("paldea")) return "Paldean";
  if (normalized.includes("mega")) return "Mega";
  if (normalized.includes("gmax")) return "Gigantamax";
  if (normalized.includes("totem")) return "Totem";
  if (normalized.includes("primal")) return "Primal";
  if (normalized.includes("origin")) return "Origin";
  if (normalized.includes("therian")) return "Therian";
  return null;
}

export function getFormFamily(name = "") {
  const normalized = name.toLowerCase();
  if (normalized.includes("mega")) return "Mega";
  if (normalized.includes("gmax")) return "Gigantamax";
  if (normalized.includes("alola")) return "Regional";
  if (normalized.includes("galar")) return "Regional";
  if (normalized.includes("hisui")) return "Regional";
  if (normalized.includes("paldea")) return "Regional";
  if (normalized.includes("totem")) return "Battle";
  if (normalized.includes("origin")) return "Battle";
  if (normalized.includes("therian")) return "Battle";
  if (normalized.includes("primal")) return "Battle";
  return "Standard";
}

export function formatFormLabel(formName: string, speciesName?: string) {
  const normalizedForm = formName.trim().toLowerCase();
  const normalizedSpecies = (speciesName ?? "").trim().toLowerCase();
  let working = normalizedForm;

  if (normalizedSpecies && working === normalizedSpecies) {
    return capitalize(speciesName ?? formName);
  }

  if (normalizedSpecies && working.startsWith(`${normalizedSpecies}-`)) {
    working = working.slice(normalizedSpecies.length + 1);
  }

  const replacements: Array<[RegExp, string]> = [
    [/\bgmax\b/g, "Gigantamax"],
    [/\bphd\b/g, "PhD"],
    [/\bhoenn\b/g, "Hoenn"],
    [/\bsinnoh\b/g, "Sinnoh"],
    [/\bunova\b/g, "Unova"],
    [/\bkalos\b/g, "Kalos"],
    [/\balola\b/g, "Alola"],
    [/\bworld\b/g, "World"],
    [/\bcap\b/g, "Cap"],
    [/\bstandard\b/g, "Standard"],
    [/\bzen\b/g, "Zen"],
    [/\bincarnate\b/g, "Incarnate"],
    [/\btherian\b/g, "Therian"],
    [/\bbaile\b/g, "Baile"],
    [/\bpau\b/g, "Pa'u"],
    [/\bpom pom\b/g, "Pom-Pom"],
    [/\bmidday\b/g, "Midday"],
    [/\bmidnight\b/g, "Midnight"],
    [/\bdusk\b/g, "Dusk"],
    [/\bnoice\b/g, "Noice"],
    [/\bhero\b/g, "Hero"],
    [/\bzero\b/g, "Zero"],
  ];

  let pretty = working.replace(/-/g, " ");
  for (const [pattern, replacement] of replacements) {
    pretty = pretty.replace(pattern, replacement);
  }
  pretty = capitalize(pretty);

  return speciesName ? `${capitalize(speciesName)} ${pretty}` : pretty;
}
