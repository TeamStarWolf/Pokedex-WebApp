/**
 * Comprehensive Pokedex Data Audit Script
 * Validates every Pokemon name, number, type, generation, and game association
 * across both the legacy index and encyclopedia data systems.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const DATA = join(ROOT, "public/data");
const ENCY = join(DATA, "encyclopedia");

// ── Canonical reference data ──────────────────────────────────────────
// Source: https://pokemondb.net/pokedex/all / Bulbapedia / PokeAPI
// Generation boundaries (inclusive)
const GEN_RANGES = [
  { gen: 1, label: "generation-i",   start: 1,   end: 151,  region: "Kanto" },
  { gen: 2, label: "generation-ii",  start: 152, end: 251,  region: "Johto" },
  { gen: 3, label: "generation-iii", start: 252, end: 386,  region: "Hoenn" },
  { gen: 4, label: "generation-iv",  start: 387, end: 493,  region: "Sinnoh" },
  { gen: 5, label: "generation-v",   start: 494, end: 649,  region: "Unova" },
  { gen: 6, label: "generation-vi",  start: 650, end: 721,  region: "Kalos" },
  { gen: 7, label: "generation-vii", start: 722, end: 809,  region: "Alola" },
  { gen: 8, label: "generation-viii",start: 810, end: 905,  region: "Galar/Hisui" },
  { gen: 9, label: "generation-ix",  start: 906, end: 1025, region: "Paldea" },
];

// Canonical first/last Pokemon per generation for spot-check
const GEN_BOOKENDS = {
  1:   { first: "bulbasaur",  last: "mew" },
  2:   { first: "chikorita",  last: "celebi" },
  3:   { first: "treecko",    last: "deoxys" },
  4:   { first: "turtwig",    last: "arceus" },
  5:   { first: "victini",    last: "genesect" },
  6:   { first: "chespin",    last: "volcanion" },
  7:   { first: "rowlet",     last: "melmetal" },
  8:   { first: "grookey",    last: "enamorus" },
  9:   { first: "sprigatito", last: "pecharunt" },
};

// All 18 valid Pokemon types
const VALID_TYPES = new Set([
  "normal","fire","water","electric","grass","ice",
  "fighting","poison","ground","flying","psychic","bug",
  "rock","ghost","dragon","dark","steel","fairy"
]);

// All valid game version slugs from PokeAPI
const VALID_GAME_VERSIONS = new Set([
  "red","blue","yellow","gold","silver","crystal",
  "ruby","sapphire","emerald","firered","leafgreen",
  "diamond","pearl","platinum","heartgold","soulsilver",
  "black","white","black-2","white-2",
  "x","y","omega-ruby","alpha-sapphire",
  "sun","moon","ultra-sun","ultra-moon",
  "lets-go-pikachu","lets-go-eevee",
  "sword","shield",
  "brilliant-diamond","shining-pearl",
  "legends-arceus",
  "scarlet","violet",
  "colosseum","xd",
  "the-indigo-disk","the-teal-mask",
  "the-hidden-treasure-of-area-zero",
]);

// All valid version group slugs
const VALID_VERSION_GROUPS = new Set([
  "red-blue","yellow","gold-silver","crystal",
  "ruby-sapphire","emerald","firered-leafgreen",
  "diamond-pearl","platinum","heartgold-soulsilver",
  "black-white","black-2-white-2",
  "x-y","omega-ruby-alpha-sapphire",
  "sun-moon","ultra-sun-ultra-moon",
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "brilliant-diamond-and-shining-pearl",
  "legends-arceus",
  "scarlet-violet",
  "colosseum","xd",
  "the-indigo-disk","the-teal-mask",
]);

// Canonical spot-check: specific Pokemon names/numbers that are commonly wrong
const SPOT_CHECKS = [
  { id: 1,    name: "bulbasaur",   types: ["grass","poison"] },
  { id: 4,    name: "charmander",  types: ["fire"] },
  { id: 6,    name: "charizard",   types: ["fire","flying"] },
  { id: 7,    name: "squirtle",    types: ["water"] },
  { id: 25,   name: "pikachu",     types: ["electric"] },
  { id: 39,   name: "jigglypuff",  types: ["normal","fairy"] },
  { id: 94,   name: "gengar",      types: ["ghost","poison"] },
  { id: 130,  name: "gyarados",    types: ["water","flying"] },
  { id: 131,  name: "lapras",      types: ["water","ice"] },
  { id: 133,  name: "eevee",       types: ["normal"] },
  { id: 143,  name: "snorlax",     types: ["normal"] },
  { id: 149,  name: "dragonite",   types: ["dragon","flying"] },
  { id: 150,  name: "mewtwo",      types: ["psychic"] },
  { id: 151,  name: "mew",         types: ["psychic"] },
  { id: 152,  name: "chikorita",   types: ["grass"] },
  { id: 196,  name: "espeon",      types: ["psychic"] },
  { id: 248,  name: "tyranitar",   types: ["rock","dark"] },
  { id: 249,  name: "lugia",       types: ["psychic","flying"] },
  { id: 250,  name: "ho-oh",       types: ["fire","flying"] },
  { id: 251,  name: "celebi",      types: ["psychic","grass"] },
  { id: 252,  name: "treecko",     types: ["grass"] },
  { id: 330,  name: "flygon",      types: ["ground","dragon"] },
  { id: 384,  name: "rayquaza",    types: ["dragon","flying"] },
  { id: 386,  name: "deoxys",      types: ["psychic"] },
  { id: 387,  name: "turtwig",     types: ["grass"] },
  { id: 448,  name: "lucario",     types: ["fighting","steel"] },
  { id: 493,  name: "arceus",      types: ["normal"] },
  { id: 494,  name: "victini",     types: ["psychic","fire"] },
  { id: 635,  name: "hydreigon",   types: ["dark","dragon"] },
  { id: 649,  name: "genesect",    types: ["bug","steel"] },
  { id: 650,  name: "chespin",     types: ["grass"] },
  { id: 700,  name: "sylveon",     types: ["fairy"] },
  { id: 718,  name: "zygarde",     types: ["dragon","ground"] },
  { id: 721,  name: "volcanion",   types: ["fire","water"] },
  { id: 722,  name: "rowlet",      types: ["grass","flying"] },
  { id: 778,  name: "mimikyu",     types: ["ghost","fairy"] },
  { id: 809,  name: "melmetal",    types: ["steel"] },
  { id: 810,  name: "grookey",     types: ["grass"] },
  { id: 849,  name: "toxtricity",  types: ["electric","poison"] },
  { id: 898,  name: "calyrex",     types: ["psychic","grass"] },
  { id: 905,  name: "enamorus",    types: ["fairy","flying"] },
  { id: 906,  name: "sprigatito",  types: ["grass"] },
  { id: 1000, name: "gholdengo",   types: ["steel","ghost"] },
  { id: 1007, name: "koraidon",    types: ["fighting","dragon"] },
  { id: 1008, name: "miraidon",    types: ["electric","dragon"] },
  { id: 1025, name: "pecharunt",   types: ["poison","ghost"] },
];

// Legendary & Mythical Pokemon IDs (canonical)
const LEGENDARY_IDS = new Set([
  144,145,146,150, // Gen 1
  243,244,245,249,250, // Gen 2
  377,378,379,380,381,382,383,384, // Gen 3
  480,481,482,483,484,485,486,487,488, // Gen 4
  638,639,640,641,642,643,644,645,646, // Gen 5
  716,717,718, // Gen 6
  772,773,785,786,787,788,789,790,791,792,800, // Gen 7
  888,889,890,891,892,894,895,896,897,898,905, // Gen 8
  1001,1002,1003,1004,1007,1008,1014,1015,1016,1017,1024, // Gen 9
]);

const MYTHICAL_IDS = new Set([
  151, // Mew
  251, // Celebi
  385,386, // Jirachi, Deoxys
  489,490,491,492,493, // Phione, Manaphy, Darkrai, Shaymin, Arceus
  494,647,648,649, // Victini, Keldeo, Meloetta, Genesect
  719,720,721, // Diancie, Hoopa, Volcanion
  801,802,807,808,809, // Magearna, Marshadow, Zeraora, Meltan, Melmetal
  893, // Zarude
  1025, // Pecharunt
]);

// ── Helpers ──────────────────────────────────────────────────────────

const errors = [];
const warnings = [];

function error(category, msg) {
  errors.push(`[ERROR] [${category}] ${msg}`);
}

function warn(category, msg) {
  warnings.push(`[WARN] [${category}] ${msg}`);
}

function loadJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (e) {
    error("FILE", `Failed to load ${path}: ${e.message}`);
    return null;
  }
}

function expectedGen(id) {
  for (const g of GEN_RANGES) {
    if (id >= g.start && id <= g.end) return g;
  }
  return null;
}

// ── Load all data ────────────────────────────────────────────────────

console.log("Loading data files...\n");

const indexData = loadJSON(join(DATA, "index.json"));
const encycIndex = loadJSON(join(ENCY, "index.json"));
const trainerManifest = loadJSON(join(DATA, "trainers/manifest.json"));

if (!indexData || !encycIndex) {
  console.error("FATAL: Cannot load primary data files. Aborting.");
  process.exit(1);
}

// Build lookup maps
const indexById = new Map();
const indexByName = new Map();
for (const p of indexData) {
  if (indexById.has(p.id)) error("INDEX-DUP", `Duplicate ID ${p.id} in index.json: ${p.name} vs ${indexById.get(p.id).name}`);
  if (indexByName.has(p.name)) error("INDEX-DUP", `Duplicate name "${p.name}" in index.json: ID ${p.id} vs ${indexByName.get(p.name).id}`);
  indexById.set(p.id, p);
  indexByName.set(p.name, p);
}

const encycPokemon = encycIndex.pokemon || {};
const encycForms = encycIndex.forms || {};
const encycGames = encycIndex.gameVersions || {};
const encycTypes = encycIndex.types || {};
const encycMoves = encycIndex.moves || {};
const encycAbilities = encycIndex.abilities || {};

// Build encyclopedia lookup by national dex number
const encycByDex = new Map();
const encycBySlug = new Map();
for (const [key, species] of Object.entries(encycPokemon)) {
  if (species.nationalDexNumber) {
    if (encycByDex.has(species.nationalDexNumber)) {
      error("ENCY-DUP", `Duplicate national dex #${species.nationalDexNumber}: ${species.slug} vs ${encycByDex.get(species.nationalDexNumber).slug}`);
    }
    encycByDex.set(species.nationalDexNumber, species);
  }
  encycBySlug.set(species.slug, species);
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 1: Completeness — all 1025 Pokemon present in both systems
// ══════════════════════════════════════════════════════════════════════
console.log("═══ AUDIT 1: Completeness ═══");

for (let id = 1; id <= 1025; id++) {
  if (!indexById.has(id)) {
    error("COMPLETENESS", `Pokemon #${id} MISSING from index.json`);
  }
  if (!encycByDex.has(id)) {
    error("COMPLETENESS", `Pokemon #${id} MISSING from encyclopedia`);
  }
}

// Check for extra Pokemon beyond 1025
for (const p of indexData) {
  if (p.id < 1 || p.id > 1025) {
    error("COMPLETENESS", `Unexpected Pokemon ID ${p.id} (${p.name}) in index.json — only 1-1025 expected`);
  }
}

console.log(`  index.json: ${indexData.length} Pokemon`);
console.log(`  encyclopedia: ${Object.keys(encycPokemon).length} species`);
console.log(`  encyclopedia forms: ${Object.keys(encycForms).length}`);

// Check individual detail files exist
let missingDetailFiles = 0;
for (let id = 1; id <= 1025; id++) {
  const legacyFile = join(DATA, `pokemon/${id}.json`);
  if (!existsSync(legacyFile)) {
    error("FILES", `Missing legacy detail file: pokemon/${id}.json`);
    missingDetailFiles++;
  }
}

let missingEncyFiles = 0;
for (const [key, species] of Object.entries(encycPokemon)) {
  const slug = species.slug;
  const file = join(ENCY, `pokemon/${slug}.json`);
  if (!existsSync(file)) {
    warn("FILES", `Missing encyclopedia detail file: pokemon/${slug}.json`);
    missingEncyFiles++;
  }
}

console.log(`  Missing legacy detail files: ${missingDetailFiles}`);
console.log(`  Missing encyclopedia detail files: ${missingEncyFiles}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 2: Name ↔ Number matching
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 2: Name ↔ Number matching ═══");

let nameNumberMismatches = 0;
for (const [key, species] of Object.entries(encycPokemon)) {
  const dex = species.nationalDexNumber;
  const slug = species.slug;

  // Cross-check with index.json
  const indexEntry = indexById.get(dex);
  if (indexEntry) {
    if (indexEntry.name !== slug) {
      error("NAME-NUMBER", `Dex #${dex}: index.json says "${indexEntry.name}" but encyclopedia says "${slug}"`);
      nameNumberMismatches++;
    }
  }
}

// Spot-check canonical name↔number pairs
for (const check of SPOT_CHECKS) {
  const indexEntry = indexById.get(check.id);
  if (indexEntry && indexEntry.name !== check.name) {
    error("SPOT-CHECK", `#${check.id} should be "${check.name}" but index.json says "${indexEntry.name}"`);
  }
  const encycEntry = encycByDex.get(check.id);
  if (encycEntry && encycEntry.slug !== check.name) {
    error("SPOT-CHECK", `#${check.id} should be "${check.name}" but encyclopedia says "${encycEntry.slug}"`);
  }
}

console.log(`  Name↔Number mismatches: ${nameNumberMismatches}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 3: Generation assignments
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 3: Generation assignments ═══");

let genErrors = 0;
for (const p of indexData) {
  const expected = expectedGen(p.id);
  if (!expected) {
    error("GENERATION", `#${p.id} (${p.name}) has no valid generation mapping`);
    genErrors++;
    continue;
  }
  if (p.generation !== expected.label) {
    error("GENERATION", `#${p.id} (${p.name}): index says "${p.generation}" but should be "${expected.label}"`);
    genErrors++;
  }
}

for (const [key, species] of Object.entries(encycPokemon)) {
  const expected = expectedGen(species.nationalDexNumber);
  if (!expected) continue;
  if (species.generation !== expected.gen) {
    error("GENERATION", `#${species.nationalDexNumber} (${species.slug}): encyclopedia says gen ${species.generation} but should be ${expected.gen}`);
    genErrors++;
  }
}

// Generation bookend checks
for (const [gen, bookend] of Object.entries(GEN_BOOKENDS)) {
  const genNum = parseInt(gen);
  const range = GEN_RANGES.find(g => g.gen === genNum);

  const firstEntry = indexById.get(range.start);
  if (firstEntry && firstEntry.name !== bookend.first) {
    error("GEN-BOOKEND", `Gen ${gen} first (#${range.start}) should be "${bookend.first}" but got "${firstEntry.name}"`);
  }
  const lastEntry = indexById.get(range.end);
  if (lastEntry && lastEntry.name !== bookend.last) {
    error("GEN-BOOKEND", `Gen ${gen} last (#${range.end}) should be "${bookend.last}" but got "${lastEntry.name}"`);
  }
}

console.log(`  Generation assignment errors: ${genErrors}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 4: Type validation
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 4: Type validation ═══");

let typeErrors = 0;

// Check all types in index.json are valid
for (const p of indexData) {
  if (!p.types || p.types.length === 0) {
    error("TYPES", `#${p.id} (${p.name}) has no types in index.json`);
    typeErrors++;
    continue;
  }
  if (p.types.length > 2) {
    error("TYPES", `#${p.id} (${p.name}) has ${p.types.length} types (max 2): ${p.types.join(", ")}`);
    typeErrors++;
  }
  for (const t of p.types) {
    if (!VALID_TYPES.has(t)) {
      error("TYPES", `#${p.id} (${p.name}) has invalid type "${t}"`);
      typeErrors++;
    }
  }
}

// Spot-check specific type assignments
for (const check of SPOT_CHECKS) {
  const indexEntry = indexById.get(check.id);
  if (indexEntry) {
    const indexTypes = [...indexEntry.types].sort();
    const expectedTypes = [...check.types].sort();
    if (JSON.stringify(indexTypes) !== JSON.stringify(expectedTypes)) {
      error("TYPE-SPOT", `#${check.id} (${check.name}): index types [${indexEntry.types}] should be [${check.types}]`);
      typeErrors++;
    }
  }
}

// Cross-check types between index and encyclopedia
for (const [key, species] of Object.entries(encycPokemon)) {
  const dex = species.nationalDexNumber;
  const indexEntry = indexById.get(dex);
  if (!indexEntry) continue;

  // Get default form types from encyclopedia
  const defaultFormId = species.defaultFormId;
  if (defaultFormId && encycForms[defaultFormId]) {
    const form = encycForms[defaultFormId];
    const formTypes = (form.typeIds || []).map(t => t.replace("type:", "")).sort();
    const indexTypes = [...indexEntry.types].sort();
    if (JSON.stringify(formTypes) !== JSON.stringify(indexTypes)) {
      warn("TYPE-CROSS", `#${dex} (${species.slug}): index types [${indexTypes}] vs encyclopedia form types [${formTypes}]`);
    }
  }
}

console.log(`  Type errors: ${typeErrors}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 5: Game version validation
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 5: Game version validation ═══");

let gameErrors = 0;

// Check encyclopedia game entities
const encycGameSlugs = new Set();
for (const [key, game] of Object.entries(encycGames)) {
  encycGameSlugs.add(game.slug);
  if (!game.name) warn("GAMES", `Game "${game.slug}" has no name`);
  if (!game.generation) warn("GAMES", `Game "${game.slug}" has no generation`);
  if (!game.versionGroup) warn("GAMES", `Game "${game.slug}" has no versionGroup`);
}
console.log(`  Encyclopedia games: ${encycGameSlugs.size}`);

// Check all entryGames in index.json are valid
const unknownGames = new Set();
for (const p of indexData) {
  if (p.entryGames) {
    for (const game of p.entryGames) {
      if (!VALID_GAME_VERSIONS.has(game) && !encycGameSlugs.has(game)) {
        unknownGames.add(game);
      }
    }
  }
}
if (unknownGames.size > 0) {
  warn("GAMES", `Unknown game versions in entryGames: ${[...unknownGames].join(", ")}`);
}

// Check version groups in index.json
const unknownGroups = new Set();
for (const p of indexData) {
  if (p.moveGroups) {
    for (const group of p.moveGroups) {
      if (!VALID_VERSION_GROUPS.has(group)) {
        unknownGroups.add(group);
      }
    }
  }
}
if (unknownGroups.size > 0) {
  warn("GAMES", `Unknown version groups in moveGroups: ${[...unknownGroups].join(", ")}`);
}

// Check that Gen 1 Pokemon appear in Gen 1 games
const gen1Games = ["red", "blue", "yellow"];
let gen1MissingCount = 0;
for (let id = 1; id <= 151; id++) {
  const p = indexById.get(id);
  if (!p) continue;
  const hasGen1Game = p.entryGames && p.entryGames.some(g => gen1Games.includes(g));
  if (!hasGen1Game) {
    warn("GAME-ASSIGN", `#${id} (${p.name}) is Gen 1 but has no Gen 1 game entries`);
    gen1MissingCount++;
  }
}

// Check that Gen 9 Pokemon don't appear in Gen 1 games
for (let id = 906; id <= 1025; id++) {
  const p = indexById.get(id);
  if (!p) continue;
  if (p.entryGames) {
    for (const g of p.entryGames) {
      if (gen1Games.includes(g)) {
        error("GAME-ASSIGN", `#${id} (${p.name}) is Gen 9 but appears in Gen 1 game "${g}"`);
        gameErrors++;
      }
    }
  }
}

console.log(`  Game assignment errors: ${gameErrors}`);
console.log(`  Gen 1 Pokemon missing Gen 1 game entries: ${gen1MissingCount}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 6: Legendary/Mythical flags
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 6: Legendary/Mythical flags ═══");

let legendaryErrors = 0;
for (const p of indexData) {
  const shouldBeLegendary = LEGENDARY_IDS.has(p.id);
  const shouldBeMythical = MYTHICAL_IDS.has(p.id);

  if (p.isLegendary && !shouldBeLegendary && !shouldBeMythical) {
    warn("LEGENDARY", `#${p.id} (${p.name}) marked legendary but not in canonical list`);
  }
  if (!p.isLegendary && shouldBeLegendary) {
    warn("LEGENDARY", `#${p.id} (${p.name}) NOT marked legendary but should be`);
  }
  if (p.isMythical && !shouldBeMythical) {
    warn("MYTHICAL", `#${p.id} (${p.name}) marked mythical but not in canonical list`);
  }
  if (!p.isMythical && shouldBeMythical) {
    warn("MYTHICAL", `#${p.id} (${p.name}) NOT marked mythical but should be`);
  }
}

// Cross-check with encyclopedia
for (const [key, species] of Object.entries(encycPokemon)) {
  const dex = species.nationalDexNumber;
  const indexEntry = indexById.get(dex);
  if (!indexEntry) continue;

  if (!!species.isLegendary !== !!indexEntry.isLegendary) {
    warn("LEGEND-CROSS", `#${dex} (${species.slug}): index legendary=${indexEntry.isLegendary} vs ency legendary=${species.isLegendary}`);
  }
  if (!!species.isMythical !== !!indexEntry.isMythical) {
    warn("MYTH-CROSS", `#${dex} (${species.slug}): index mythical=${indexEntry.isMythical} vs ency mythical=${species.isMythical}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 7: Legacy detail files — deep validation
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 7: Legacy detail files ═══");

let detailErrors = 0;
let statsErrors = 0;
let moveErrors = 0;
let formErrors = 0;
let evoErrors = 0;

for (let id = 1; id <= 1025; id++) {
  const file = join(DATA, `pokemon/${id}.json`);
  if (!existsSync(file)) continue;

  const detail = loadJSON(file);
  if (!detail) continue;

  // ID match
  if (detail.id !== id) {
    error("DETAIL", `File pokemon/${id}.json has id=${detail.id} (should be ${id})`);
    detailErrors++;
  }

  // Name cross-check with index
  const indexEntry = indexById.get(id);
  if (indexEntry && detail.speciesName && detail.speciesName.toLowerCase().replace(/ /g, "-") !== indexEntry.name) {
    // Some names with special chars may differ — just warn
    warn("DETAIL-NAME", `#${id}: index name "${indexEntry.name}" vs detail speciesName "${detail.speciesName}"`);
  }

  // Generation cross-check
  const expected = expectedGen(id);
  if (expected && detail.generation !== expected.label) {
    error("DETAIL-GEN", `#${id} (${detail.speciesName}): detail says "${detail.generation}" should be "${expected.label}"`);
    detailErrors++;
  }

  // Forms validation
  if (!detail.forms || detail.forms.length === 0) {
    error("DETAIL-FORMS", `#${id} has no forms array`);
    formErrors++;
  } else {
    for (const form of detail.forms) {
      // Check form has stats
      if (!form.stats || form.stats.length !== 6) {
        error("STATS", `#${id} form "${form.name}" has ${form.stats?.length ?? 0} stats (expected 6)`);
        statsErrors++;
      } else {
        // Validate stat values are reasonable (1-255 for base stats)
        for (const stat of form.stats) {
          if (stat.value < 1 || stat.value > 255) {
            error("STATS", `#${id} form "${form.name}" stat ${stat.name}=${stat.value} out of range (1-255)`);
            statsErrors++;
          }
        }
        // BST sanity check (lowest is Shedinja ~236, highest is Eternamax Eternatus ~1125)
        const bst = form.stats.reduce((sum, s) => sum + s.value, 0);
        if (bst < 150 || bst > 1200) {
          warn("STATS", `#${id} form "${form.name}" BST=${bst} seems unusual`);
        }
      }

      // Check form types
      if (!form.types || form.types.length === 0) {
        error("FORM-TYPES", `#${id} form "${form.name}" has no types`);
        formErrors++;
      }

      // Check form speciesId matches
      if (form.speciesId !== id) {
        error("FORM-SPECIES", `#${id} form "${form.name}" has speciesId=${form.speciesId}`);
        formErrors++;
      }
    }
  }

  // Evolution chain validation
  if (detail.evolutionRows) {
    for (const evo of detail.evolutionRows) {
      if (!evo.name) {
        error("EVOLUTION", `#${id} has evolution row with no name`);
        evoErrors++;
      }
    }
  }

  // Dex entries validation
  if (detail.versionEntries) {
    for (const entry of detail.versionEntries) {
      if (!entry.text || entry.text.trim() === "") {
        warn("DEX-ENTRY", `#${id} has empty dex entry for version "${entry.version}"`);
      }
    }
  }
}

console.log(`  Detail file structure errors: ${detailErrors}`);
console.log(`  Stats errors: ${statsErrors}`);
console.log(`  Form errors: ${formErrors}`);
console.log(`  Evolution errors: ${evoErrors}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 8: Encyclopedia detail files — deep validation
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 8: Encyclopedia detail files ═══");

let encycDetailErrors = 0;
let encycStatsIssues = 0;
let learnsetIssues = 0;

// Sample every encyclopedia detail file
const encycPokemonDir = join(ENCY, "pokemon");
const encycFiles = readdirSync(encycPokemonDir).filter(f => f.endsWith(".json"));

for (const file of encycFiles) {
  const slug = file.replace(".json", "");
  const data = loadJSON(join(encycPokemonDir, file));
  if (!data) continue;

  // Detail files contain the entire evolution family — look up the SPECIFIC species matching the file slug
  const speciesKey = `pokemon:${slug}`;
  const species = data.pokemon ? data.pokemon[speciesKey] : null;
  if (!species) {
    // Fall back: maybe slug doesn't match key exactly
    const allSpecies = data.pokemon ? Object.values(data.pokemon) : [];
    const match = allSpecies.find(s => s.slug === slug);
    if (!match) {
      warn("ENCY-DETAIL", `${file} has no pokemon entry for slug "${slug}" (keys: ${Object.keys(data.pokemon || {}).join(", ")})`);
      continue;
    }
  }

  const target = species || Object.values(data.pokemon).find(s => s.slug === slug);

  // Cross-check with encyclopedia index
  const indexSpecies = encycBySlug.get(slug);
  if (indexSpecies && target) {
    if (target.nationalDexNumber !== indexSpecies.nationalDexNumber) {
      error("ENCY-CROSS", `${slug}: detail dex#=${target.nationalDexNumber} vs index dex#=${indexSpecies.nationalDexNumber}`);
      encycDetailErrors++;
    }
  }

  // Verify ALL species in the detail file have correct dex numbers
  if (data.pokemon) {
    for (const [key, sp] of Object.entries(data.pokemon)) {
      const spSlug = sp.slug;
      const indexSp = encycBySlug.get(spSlug);
      if (indexSp && sp.nationalDexNumber !== indexSp.nationalDexNumber) {
        error("ENCY-FAMILY", `In ${file}: ${spSlug} dex#=${sp.nationalDexNumber} vs index dex#=${indexSp.nationalDexNumber}`);
        encycDetailErrors++;
      }
    }
  }

  // Check forms in detail file have stats
  const forms = data.forms || {};
  for (const [formKey, form] of Object.entries(forms)) {
    if (form.stats) {
      const statKeys = Object.keys(form.stats);
      if (statKeys.length < 6) {
        warn("ENCY-STATS", `${slug} form "${formKey}" only has ${statKeys.length} stats`);
        encycStatsIssues++;
      }
    }

    // Check learnset
    if (form.learnset && form.learnset.length > 0) {
      // Verify learnset entries have required fields
      for (const entry of form.learnset.slice(0, 5)) {
        if (!entry.moveId) {
          warn("LEARNSET", `${slug} form "${formKey}" has learnset entry without moveId`);
          learnsetIssues++;
          break;
        }
      }
    }
  }
}

console.log(`  Encyclopedia detail errors: ${encycDetailErrors}`);
console.log(`  Encyclopedia stats issues: ${encycStatsIssues}`);
console.log(`  Learnset issues: ${learnsetIssues}`);
console.log(`  Total encyclopedia detail files checked: ${encycFiles.length}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 9: Cross-system consistency
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 9: Cross-system consistency ═══");

let crossErrors = 0;

for (let id = 1; id <= 1025; id++) {
  const indexEntry = indexById.get(id);
  const encycEntry = encycByDex.get(id);
  if (!indexEntry || !encycEntry) continue;

  // Name consistency
  if (indexEntry.name !== encycEntry.slug) {
    error("CROSS", `#${id}: index name "${indexEntry.name}" ≠ ency slug "${encycEntry.slug}"`);
    crossErrors++;
  }

  // Generation consistency
  const indexGenNum = parseInt(indexEntry.generation.replace("generation-", "").replace("i", "1").replace("ii", "2").replace("iii", "3").replace("iv", "4").replace("v", "5").replace("vi", "6").replace("vii", "7").replace("viii", "8").replace("ix", "9"));
  // More robust roman numeral parsing
  const romanMap = { "i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5, "vi": 6, "vii": 7, "viii": 8, "ix": 9 };
  const indexGenRoman = indexEntry.generation.replace("generation-", "");
  const indexGen = romanMap[indexGenRoman];

  if (indexGen && encycEntry.generation !== indexGen) {
    error("CROSS-GEN", `#${id} (${indexEntry.name}): index gen=${indexGen} ency gen=${encycEntry.generation}`);
    crossErrors++;
  }
}

console.log(`  Cross-system consistency errors: ${crossErrors}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 10: Artwork files
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 10: Artwork files ═══");

const artworkDir = join(ROOT, "public/official-artwork");
let missingArtwork = 0;

if (existsSync(artworkDir)) {
  const artFiles = new Set(readdirSync(artworkDir));
  for (let id = 1; id <= 1025; id++) {
    if (!artFiles.has(`${id}.png`)) {
      warn("ARTWORK", `Missing artwork: official-artwork/${id}.png`);
      missingArtwork++;
    }
  }
  console.log(`  Total artwork files: ${artFiles.size}`);
} else {
  warn("ARTWORK", "official-artwork directory not found");
}
console.log(`  Missing primary artwork: ${missingArtwork}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 11: Trainer data validation
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 11: Trainer data ═══");

let trainerErrors = 0;
if (trainerManifest && trainerManifest.appearances) {
  const appearances = trainerManifest.appearances;
  console.log(`  Total trainer appearances: ${appearances.length}`);

  for (const app of appearances) {
    // Check team members reference valid Pokemon IDs
    if (app.members) {
      for (const memberId of app.members) {
        if (memberId < 1 || memberId > 1025) {
          error("TRAINER", `Trainer "${app.trainer}" (${app.slug}) has invalid Pokemon ID ${memberId}`);
          trainerErrors++;
        }
      }
    }
    // Check ace Pokemon
    if (app.acePokemonId && (app.acePokemonId < 1 || app.acePokemonId > 1025)) {
      error("TRAINER", `Trainer "${app.trainer}" (${app.slug}) has invalid ace Pokemon ID ${app.acePokemonId}`);
      trainerErrors++;
    }
  }

  console.log(`  Trainer data errors: ${trainerErrors}`);
} else {
  warn("TRAINER", "No trainer manifest found");
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 12: Encyclopedia entity reference integrity
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 12: Entity reference integrity ═══");

let refErrors = 0;

// Check species → form references
for (const [key, species] of Object.entries(encycPokemon)) {
  if (species.formIds) {
    for (const formId of species.formIds) {
      if (!encycForms[formId]) {
        warn("REF", `Species ${species.slug} references missing form "${formId}"`);
        refErrors++;
      }
    }
  }
  if (species.defaultFormId && !encycForms[species.defaultFormId]) {
    error("REF", `Species ${species.slug} has defaultFormId "${species.defaultFormId}" not found in forms`);
    refErrors++;
  }

  // Check game references
  if (species.pokedexGameIds) {
    for (const gameId of species.pokedexGameIds) {
      if (!encycGames[gameId]) {
        warn("REF-GAME", `Species ${species.slug} references missing game "${gameId}"`);
      }
    }
  }
}

// Check form → species back-references
for (const [key, form] of Object.entries(encycForms)) {
  if (form.speciesId && !encycPokemon[form.speciesId]) {
    warn("REF-BACK", `Form ${form.slug} references missing species "${form.speciesId}"`);
    refErrors++;
  }

  // Check form type references
  if (form.typeIds) {
    for (const typeId of form.typeIds) {
      if (!encycTypes[typeId]) {
        warn("REF-TYPE", `Form ${form.slug} references missing type "${typeId}"`);
        refErrors++;
      }
    }
  }
}

console.log(`  Reference integrity issues: ${refErrors}`);

// ══════════════════════════════════════════════════════════════════════
// AUDIT 13: Ordering sanity
// ══════════════════════════════════════════════════════════════════════
console.log("\n═══ AUDIT 13: Ordering ═══");

let orderErrors = 0;
for (let i = 1; i < indexData.length; i++) {
  if (indexData[i].id !== indexData[i - 1].id + 1) {
    error("ORDER", `index.json: #${indexData[i-1].id} followed by #${indexData[i].id} (expected ${indexData[i-1].id + 1})`);
    orderErrors++;
  }
}
console.log(`  Ordering errors: ${orderErrors}`);

// ══════════════════════════════════════════════════════════════════════
// FINAL REPORT
// ══════════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(60));
console.log("FINAL REPORT");
console.log("═".repeat(60));
console.log(`\n  ERRORS: ${errors.length}`);
console.log(`  WARNINGS: ${warnings.length}\n`);

if (errors.length > 0) {
  console.log("── ERRORS ──────────────────────────────────────────────────");
  for (const e of errors) console.log("  " + e);
}

if (warnings.length > 0) {
  console.log("\n── WARNINGS ────────────────────────────────────────────────");
  for (const w of warnings) console.log("  " + w);
}

if (errors.length === 0 && warnings.length === 0) {
  console.log("  ✅ ALL CHECKS PASSED — No errors or warnings found!");
}

console.log("\n" + "═".repeat(60));
