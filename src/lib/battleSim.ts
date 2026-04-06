import type { EncyclopediaSchema, PokemonStatKey, TypeId } from "./encyclopedia-schema";
import type {
  BattleMove,
  BattlePokemon,
  DuelResult,
  MatchupResult,
  MoveOption,
  PokemonPerformance,
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

/**
 * Select the best N moves maximizing type coverage.
 *
 * Strategy: For each type represented in the move pool, keep only the
 * highest-power move. Then pick from the best moves across types, preferring
 * STAB moves first, then the highest effective power. This ensures a Pokemon
 * with Fire, Ground, Flying, and Dragon moves picks one of each rather than
 * four Fire moves of decreasing power.
 */
function selectBestMoves(allMoves: BattleMove[], attackerTypeIds: TypeId[], limit: number): BattleMove[] {
  if (allMoves.length <= limit) return allMoves;

  // Group by type, keep only the strongest per type
  const bestByType = new Map<TypeId, BattleMove>();
  for (const move of allMoves) {
    const existing = bestByType.get(move.typeId);
    if (!existing || move.power > existing.power) {
      bestByType.set(move.typeId, move);
    }
  }

  // Sort type representatives: STAB types first, then by power descending
  const candidates = [...bestByType.values()].sort((a, b) => {
    const aStab = attackerTypeIds.includes(a.typeId) ? 1 : 0;
    const bStab = attackerTypeIds.includes(b.typeId) ? 1 : 0;
    if (bStab !== aStab) return bStab - aStab;
    return b.power - a.power;
  });

  const selected = candidates.slice(0, limit);

  // If we still have room, fill with remaining highest-power moves not yet picked
  if (selected.length < limit) {
    const pickedIds = new Set(selected.map((m) => m.moveId));
    const remaining = allMoves
      .filter((m) => !pickedIds.has(m.moveId))
      .sort((a, b) => b.power - a.power);
    for (const move of remaining) {
      if (selected.length >= limit) break;
      selected.push(move);
    }
  }

  return selected;
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

  // Select moves that maximize type coverage while preferring high power.
  // Greedy: pick the best move of each unique type first, then fill with strongest remaining.
  const topMoves = selectBestMoves(moves, form.typeIds, MAX_MOVES);

  const abilities = form.abilitySlots.map((slot) => {
    const ability = schema.abilities[slot.abilityId];
    return {
      abilityId: slot.abilityId,
      name: ability?.name ?? slot.abilityId.replace("ability:", "").replace(/-/g, " "),
      isHidden: slot.isHidden,
    };
  });

  return {
    pokemonId,
    name: species.name,
    nickname: nickname || species.name,
    typeIds: form.typeIds,
    stats: form.stats,
    moves: topMoves,
    abilities,
    isLegendary: species.isLegendary,
    isMythical: species.isMythical,
    artworkUrl: form.artworkUrl,
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

export function getAllMoveOptions(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  schema: EncyclopediaSchema,
): MoveOption[] {
  return attacker.moves.map((move) => {
    const result = estimateDamage(attacker, defender, move, schema);
    return { move, ...result };
  }).sort((a, b) => b.damagePercent - a.damagePercent);
}

export function pickBestMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  schema: EncyclopediaSchema,
): { move: BattleMove; damage: number; damagePercent: number; typeEffectiveness: number; stabApplied: boolean } | null {
  const options = getAllMoveOptions(attacker, defender, schema);
  return options.length > 0 ? options[0] : null;
}

function turnsToKo(damagePercent: number): number | null {
  if (damagePercent <= 0) return null;
  return Math.ceil(100 / damagePercent);
}

function classifyFavorability(damagePercent: number, typeEffectiveness: number): MatchupResult["favorability"] {
  if (typeEffectiveness === 0) return "immune";
  if (damagePercent >= 50) return "strong";
  if (damagePercent >= 25) return "neutral";
  return "weak";
}

function buildMatchupResult(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  schema: EncyclopediaSchema,
): MatchupResult {
  const allMoves = getAllMoveOptions(attacker, defender, schema);
  const best = allMoves[0] ?? null;

  return {
    attackerId: attacker.pokemonId,
    defenderId: defender.pokemonId,
    attackerName: attacker.nickname,
    defenderName: defender.nickname,
    bestMove: best?.move ?? null,
    estimatedDamage: best?.damagePercent ?? 0,
    typeEffectiveness: best?.typeEffectiveness ?? 1,
    stabApplied: best?.stabApplied ?? false,
    favorability: classifyFavorability(best?.damagePercent ?? 0, best?.typeEffectiveness ?? 1),
    allMoves,
  };
}

export function simulateMatchup(
  teamA: BattlePokemon[],
  teamB: BattlePokemon[],
  teamALabel: string,
  teamBLabel: string,
  schema: EncyclopediaSchema,
): SimulationResult {
  const matchups: MatchupResult[] = [];
  const duels: DuelResult[] = [];
  let teamAScore = 0;
  let teamBScore = 0;
  let teamAWins = 0;
  let teamBWins = 0;
  let ties = 0;

  for (const memberA of teamA) {
    for (const memberB of teamB) {
      const aAttacks = buildMatchupResult(memberA, memberB, schema);
      const bAttacks = buildMatchupResult(memberB, memberA, schema);

      matchups.push(aAttacks);

      const aDamagePercent = aAttacks.estimatedDamage;
      const bDamagePercent = bAttacks.estimatedDamage;
      const aKo = turnsToKo(aDamagePercent);
      const bKo = turnsToKo(bDamagePercent);
      const aFaster = memberA.stats.speed >= memberB.stats.speed;

      let duelWinner: DuelResult["duelWinner"] = "tie";
      if (aKo !== null && bKo !== null) {
        if (aKo < bKo) duelWinner = "A";
        else if (bKo < aKo) duelWinner = "B";
        else duelWinner = aFaster ? "A" : "B";
      } else if (aKo !== null) {
        duelWinner = "A";
      } else if (bKo !== null) {
        duelWinner = "B";
      }

      duels.push({
        memberA,
        memberB,
        aAttacks,
        bAttacks,
        turnsToKoA: aKo,
        turnsToKoB: bKo,
        aMovesFirst: aFaster,
        duelWinner,
      });

      teamAScore += aDamagePercent;
      teamBScore += bDamagePercent;

      if (duelWinner === "A") teamAWins++;
      else if (duelWinner === "B") teamBWins++;
      else ties++;
    }
  }

  const overallVerdict: SimulationResult["overallVerdict"] =
    teamAWins > teamBWins ? "A wins" : teamBWins > teamAWins ? "B wins" : "Even";

  const teamAPerformance = buildPerformance(teamA, duels, "A");
  const teamBPerformance = buildPerformance(teamB, duels, "B");

  const mvp = [...teamAPerformance].sort((a, b) => b.wins - a.wins || b.totalDamageDealt - a.totalDamageDealt)[0] ?? null;
  const biggestThreat = [...teamBPerformance].sort((a, b) => b.wins - a.wins || b.totalDamageDealt - a.totalDamageDealt)[0] ?? null;

  return {
    teamALabel,
    teamBLabel,
    matchups,
    duels,
    teamAWins,
    teamBWins,
    ties,
    overallVerdict,
    teamAScore: Math.round(teamAScore),
    teamBScore: Math.round(teamBScore),
    teamAPerformance,
    teamBPerformance,
    mvp,
    biggestThreat,
  };
}

function buildPerformance(
  team: BattlePokemon[],
  duels: DuelResult[],
  side: "A" | "B",
): PokemonPerformance[] {
  return team.map((pokemon) => {
    const relevantDuels = duels.filter(
      (d) => (side === "A" ? d.memberA : d.memberB).pokemonId === pokemon.pokemonId,
    );

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let totalDamageDealt = 0;
    let totalDamageTaken = 0;
    let ohkoCount = 0;
    let bestMatchup: PokemonPerformance["bestMatchup"] = null;
    let worstMatchup: PokemonPerformance["worstMatchup"] = null;

    for (const duel of relevantDuels) {
      const myAttack = side === "A" ? duel.aAttacks : duel.bAttacks;
      const theirAttack = side === "A" ? duel.bAttacks : duel.aAttacks;
      const opponent = side === "A" ? duel.memberB : duel.memberA;
      const iWin = (side === "A" && duel.duelWinner === "A") || (side === "B" && duel.duelWinner === "B");
      const iLose = (side === "A" && duel.duelWinner === "B") || (side === "B" && duel.duelWinner === "A");

      if (iWin) wins++;
      else if (iLose) losses++;
      else ties++;

      totalDamageDealt += myAttack.estimatedDamage;
      totalDamageTaken += theirAttack.estimatedDamage;

      const myKo = side === "A" ? duel.turnsToKoA : duel.turnsToKoB;
      if (myKo === 1) ohkoCount++;

      if (!bestMatchup || myAttack.estimatedDamage > bestMatchup.damage) {
        bestMatchup = { opponent: opponent.nickname, damage: myAttack.estimatedDamage };
      }
      if (!worstMatchup || myAttack.estimatedDamage < worstMatchup.damage) {
        worstMatchup = { opponent: opponent.nickname, damage: myAttack.estimatedDamage };
      }
    }

    return {
      pokemon,
      wins,
      losses,
      ties,
      totalDamageDealt: Math.round(totalDamageDealt),
      totalDamageTaken: Math.round(totalDamageTaken),
      bestMatchup,
      worstMatchup,
      ohkoCount,
    };
  });
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
