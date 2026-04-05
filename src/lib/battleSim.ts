import type { EncyclopediaSchema, PokemonStatKey, TypeId } from "./encyclopedia-schema";
import type {
  BattleMove,
  BattlePokemon,
  MatchupResult,
  SimulationResult,
  TeamAnalysis,
  TypeCoverageEntry,
  WeaknessEntry,
} from "./battleTypes";
import { getDefaultForm, getStatTotal } from "./encyclopedia";

const BATTLE_LEVEL = 50;
const RANDOM_FACTOR = 0.925;
const MAX_MOVES = 4;

function buildDexLookup(schema: EncyclopediaSchema) {
  const map = new Map<number, (typeof schema.pokemon)[keyof typeof schema.pokemon]>();
  for (const species of Object.values(schema.pokemon)) {
    map.set(species.nationalDexNumber, species);
  }
  return map;
}

let cachedLookup: ReturnType<typeof buildDexLookup> | null = null;
let cachedSchemaRef: object | null = null;

function getDexLookup(schema: EncyclopediaSchema) {
  if (cachedSchemaRef !== (schema.pokemon as object)) {
    cachedLookup = buildDexLookup(schema);
    cachedSchemaRef = schema.pokemon as object;
  }
  return cachedLookup!;
}

export function resolveBattlePokemon(
  schema: EncyclopediaSchema,
  pokemonId: number,
  nickname?: string,
): BattlePokemon | null {
  const lookup = getDexLookup(schema);
  const species = lookup.get(pokemonId);
  if (!species) return null;

  const form = getDefaultForm(schema, species);
  if (!form) return null;

  const seenMoveIds = new Set<string>();
  const moves: BattleMove[] = [];

  for (const entry of form.learnset) {
    if (seenMoveIds.has(entry.moveId)) continue;
    seenMoveIds.add(entry.moveId);

    const move = schema.moves[entry.moveId];
    if (!move || move.damageClass === "status" || !move.power || move.power <= 0) continue;

    moves.push({
      moveId: move.id,
      name: move.name,
      typeId: move.typeId,
      power: move.power,
      accuracy: move.accuracy ?? 100,
      damageClass: move.damageClass,
    });
  }

  moves.sort((a, b) => b.power - a.power);
  const topMoves = moves.slice(0, MAX_MOVES);

  return {
    pokemonId,
    name: species.name,
    nickname: nickname || species.name,
    typeIds: form.typeIds,
    stats: form.stats,
    moves: topMoves,
    isLegendary: species.isLegendary,
    isMythical: species.isMythical,
  };
}

export function computeTypeEffectiveness(
  schema: EncyclopediaSchema,
  attackingTypeId: TypeId,
  defenderTypeIds: TypeId[],
): number {
  let multiplier = 1;
  for (const defTypeId of defenderTypeIds) {
    const defType = schema.types[defTypeId];
    if (!defType) continue;
    const matchup = defType.defensiveMatchups.find((entry) => entry.attackingTypeId === attackingTypeId);
    multiplier *= matchup?.multiplier ?? 1;
  }
  return multiplier;
}

export function computeSTAB(attackTypeId: TypeId, attackerTypeIds: TypeId[]): number {
  return attackerTypeIds.includes(attackTypeId) ? 1.5 : 1.0;
}

export function estimateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
  schema: EncyclopediaSchema,
): { damage: number; damagePercent: number; typeEffectiveness: number; stabApplied: boolean } {
  const offStat: PokemonStatKey = move.damageClass === "physical" ? "attack" : "special-attack";
  const defStat: PokemonStatKey = move.damageClass === "physical" ? "defense" : "special-defense";

  const base = ((2 * BATTLE_LEVEL / 5 + 2) * move.power * attacker.stats[offStat] / defender.stats[defStat]) / 50 + 2;
  const effectiveness = computeTypeEffectiveness(schema, move.typeId, defender.typeIds);
  const stab = computeSTAB(move.typeId, attacker.typeIds);
  const finalDamage = Math.floor(base * effectiveness * stab * RANDOM_FACTOR);

  return {
    damage: Math.max(0, finalDamage),
    damagePercent: defender.stats.hp > 0 ? Math.round((finalDamage / defender.stats.hp) * 100) : 0,
    typeEffectiveness: effectiveness,
    stabApplied: stab > 1,
  };
}

export function pickBestMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  schema: EncyclopediaSchema,
): { move: BattleMove; damage: number; damagePercent: number; typeEffectiveness: number; stabApplied: boolean } | null {
  if (attacker.moves.length === 0) return null;

  let best: ReturnType<typeof pickBestMove> = null;

  for (const move of attacker.moves) {
    const result = estimateDamage(attacker, defender, move, schema);
    if (!best || result.damagePercent > best.damagePercent) {
      best = { move, ...result };
    }
  }

  return best;
}

function classifyFavorability(damagePercent: number, typeEffectiveness: number): MatchupResult["favorability"] {
  if (typeEffectiveness === 0) return "immune";
  if (damagePercent >= 50) return "strong";
  if (damagePercent >= 25) return "neutral";
  return "weak";
}

export function simulateMatchup(
  teamA: BattlePokemon[],
  teamB: BattlePokemon[],
  teamALabel: string,
  teamBLabel: string,
  schema: EncyclopediaSchema,
): SimulationResult {
  const matchups: MatchupResult[] = [];
  let teamAScore = 0;
  let teamBScore = 0;
  let teamAWins = 0;
  let teamBWins = 0;
  let ties = 0;

  for (const memberA of teamA) {
    for (const memberB of teamB) {
      const aAttacks = pickBestMove(memberA, memberB, schema);
      const bAttacks = pickBestMove(memberB, memberA, schema);

      const aDamagePercent = aAttacks?.damagePercent ?? 0;
      const bDamagePercent = bAttacks?.damagePercent ?? 0;

      matchups.push({
        attackerId: memberA.pokemonId,
        defenderId: memberB.pokemonId,
        attackerName: memberA.nickname,
        defenderName: memberB.nickname,
        bestMove: aAttacks?.move ?? null,
        estimatedDamage: aDamagePercent,
        typeEffectiveness: aAttacks?.typeEffectiveness ?? 1,
        stabApplied: aAttacks?.stabApplied ?? false,
        favorability: classifyFavorability(aDamagePercent, aAttacks?.typeEffectiveness ?? 1),
      });

      teamAScore += aDamagePercent;
      teamBScore += bDamagePercent;

      if (aDamagePercent > bDamagePercent) teamAWins++;
      else if (bDamagePercent > aDamagePercent) teamBWins++;
      else ties++;
    }
  }

  const overallVerdict: SimulationResult["overallVerdict"] =
    teamAWins > teamBWins ? "A wins" : teamBWins > teamAWins ? "B wins" : "Even";

  return {
    teamALabel,
    teamBLabel,
    matchups,
    teamAWins,
    teamBWins,
    ties,
    overallVerdict,
    teamAScore: Math.round(teamAScore),
    teamBScore: Math.round(teamBScore),
  };
}

export function analyzeTeam(team: BattlePokemon[], schema: EncyclopediaSchema): TeamAnalysis {
  const allTypes = Object.values(schema.types);

  const offensiveCoverage: TypeCoverageEntry[] = allTypes.map((targetType) => {
    let bestMultiplier = 0;
    const coveringMembers: string[] = [];

    for (const member of team) {
      for (const move of member.moves) {
        const eff = computeTypeEffectiveness(schema, move.typeId, [targetType.id]);
        const stab = computeSTAB(move.typeId, member.typeIds);
        const effective = eff * stab;
        if (effective > bestMultiplier) {
          bestMultiplier = effective;
        }
        if (eff >= 2 && !coveringMembers.includes(member.nickname)) {
          coveringMembers.push(member.nickname);
        }
      }
    }

    return {
      typeId: targetType.id,
      typeName: targetType.name,
      bestOffensiveMultiplier: bestMultiplier,
      coveringMembers,
    };
  });

  const defensiveEntries: WeaknessEntry[] = allTypes.map((attackType) => {
    let worstMultiplier = 0;
    const vulnerableMembers: string[] = [];

    for (const member of team) {
      const eff = computeTypeEffectiveness(schema, attackType.id, member.typeIds);
      if (eff > worstMultiplier) worstMultiplier = eff;
      if (eff >= 2) vulnerableMembers.push(member.nickname);
    }

    return {
      typeId: attackType.id,
      typeName: attackType.name,
      worstMultiplier,
      vulnerableMembers,
    };
  });

  const defensiveWeaknesses = defensiveEntries.filter((entry) => entry.worstMultiplier > 1);
  const defensiveResistances = defensiveEntries.filter((entry) => entry.worstMultiplier < 1 && entry.worstMultiplier > 0);
  const uncoveredTypes = offensiveCoverage.filter((entry) => entry.bestOffensiveMultiplier <= 1);
  const doubleWeaknesses = defensiveEntries.filter((entry) => entry.worstMultiplier >= 4);

  const offensiveTypeSet = new Set<string>();
  for (const member of team) {
    for (const move of member.moves) {
      offensiveTypeSet.add(move.typeId);
    }
  }
  const typeSpread = offensiveTypeSet.size;

  const bstTotal = team.reduce((sum, member) => sum + getStatTotal(member.stats), 0);
  const bstAverage = team.length > 0 ? Math.round(bstTotal / team.length) : 0;
  const specialCount = team.filter((member) => member.isLegendary || member.isMythical).length;

  const coveredCount = offensiveCoverage.filter((entry) => entry.bestOffensiveMultiplier >= 2).length;
  const weaknessCount = defensiveWeaknesses.length;
  const doubleWeakCount = doubleWeaknesses.length;

  const synergyScore = Math.max(0, Math.min(100,
    50
    + coveredCount * 3
    - weaknessCount * 4
    - doubleWeakCount * 8
    + typeSpread * 2
    - uncoveredTypes.length * 2
  ));

  return {
    offensiveCoverage,
    defensiveWeaknesses,
    defensiveResistances,
    uncoveredTypes,
    doubleWeaknesses,
    synergyScore,
    typeSpread,
    bstTotal,
    bstAverage,
    specialCount,
  };
}
