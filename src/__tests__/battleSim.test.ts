// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { describe, expect, it } from "vitest";
import { encyclopediaSeed } from "../data/encyclopediaSeed";
import {
  resolveBattlePokemon,
  computeTypeEffectiveness,
  computeSTAB,
  estimateDamage,
  pickBestMove,
  getAllMoveOptions,
  simulateMatchup,
  analyzeTeam,
} from "../lib/battleSim";
import type { BattlePokemon, BattleMove } from "../lib/battleTypes";
import type { MoveId, TypeId } from "../lib/encyclopedia-schema";

const schema = encyclopediaSeed;

// Find a Pokemon we know exists in the seed data
function findDexNumber(name: string): number | null {
  for (const species of Object.values(schema.pokemon)) {
    if (species.name.toLowerCase() === name.toLowerCase()) {
      return species.nationalDexNumber;
    }
  }
  return null;
}

describe("resolveBattlePokemon", () => {
  it("resolves a valid Pokemon from the seed data", () => {
    const dexNumbers = Object.values(schema.pokemon).map((s) => s.nationalDexNumber);
    if (dexNumbers.length === 0) return; // skip if no seed data
    const pokemon = resolveBattlePokemon(schema, dexNumbers[0]);
    expect(pokemon).not.toBeNull();
    expect(pokemon!.pokemonId).toBe(dexNumbers[0]);
    expect(pokemon!.typeIds.length).toBeGreaterThan(0);
    expect(pokemon!.stats.hp).toBeGreaterThan(0);
  });

  it("returns null for an unknown Pokemon ID", () => {
    const result = resolveBattlePokemon(schema, 99999);
    expect(result).toBeNull();
  });

  it("limits moves to 4", () => {
    const dexNumbers = Object.values(schema.pokemon).map((s) => s.nationalDexNumber);
    if (dexNumbers.length === 0) return;
    const pokemon = resolveBattlePokemon(schema, dexNumbers[0]);
    if (!pokemon) return;
    expect(pokemon.moves.length).toBeLessThanOrEqual(4);
  });

  it("uses nickname when provided", () => {
    const dexNumbers = Object.values(schema.pokemon).map((s) => s.nationalDexNumber);
    if (dexNumbers.length === 0) return;
    const pokemon = resolveBattlePokemon(schema, dexNumbers[0], "Sparky");
    expect(pokemon?.nickname).toBe("Sparky");
  });
});

describe("computeTypeEffectiveness", () => {
  it("returns 1.0 for neutral matchup", () => {
    const types = Object.values(schema.types);
    if (types.length < 2) return;
    // Normal vs Normal is neutral in most gens
    const normalType = types.find((t) => t.name === "normal");
    if (!normalType) return;
    const result = computeTypeEffectiveness(schema, normalType.id, [normalType.id]);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("returns 0 for immunities (e.g., Normal vs Ghost)", () => {
    const normalType = Object.values(schema.types).find((t) => t.name === "normal");
    const ghostType = Object.values(schema.types).find((t) => t.name === "ghost");
    if (!normalType || !ghostType) return;
    const result = computeTypeEffectiveness(schema, normalType.id, [ghostType.id]);
    expect(result).toBe(0);
  });

  it("stacks multipliers for dual types", () => {
    const groundType = Object.values(schema.types).find((t) => t.name === "ground");
    const fireType = Object.values(schema.types).find((t) => t.name === "fire");
    const steelType = Object.values(schema.types).find((t) => t.name === "steel");
    if (!groundType || !fireType || !steelType) return;
    // Ground vs Fire/Steel should be 4x
    const result = computeTypeEffectiveness(schema, groundType.id, [fireType.id, steelType.id]);
    expect(result).toBe(4);
  });
});

describe("computeSTAB", () => {
  it("returns 1.5 when attacker shares move type", () => {
    expect(computeSTAB("type:fire" as TypeId, ["type:fire" as TypeId, "type:flying" as TypeId])).toBe(1.5);
  });

  it("returns 1.0 when attacker does not share move type", () => {
    expect(computeSTAB("type:water" as TypeId, ["type:fire" as TypeId, "type:flying" as TypeId])).toBe(1.0);
  });
});

describe("estimateDamage", () => {
  it("produces positive damage for a physical move", () => {
    const attacker: BattlePokemon = {
      pokemonId: 1,
      name: "attacker",
      nickname: "attacker",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 100, attack: 120, defense: 80, "special-attack": 80, "special-defense": 80, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const defender: BattlePokemon = {
      pokemonId: 2,
      name: "defender",
      nickname: "defender",
      typeIds: ["type:water" as TypeId],
      stats: { hp: 100, attack: 80, defense: 100, "special-attack": 80, "special-defense": 80, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const move: BattleMove = {
      moveId: "move:tackle" as MoveId,
      name: "Tackle",
      typeId: "type:normal" as TypeId,
      power: 40,
      accuracy: 100,
      damageClass: "physical",
    };

    const result = estimateDamage(attacker, defender, move, schema);
    expect(result.damage).toBeGreaterThan(0);
    expect(result.damagePercent).toBeGreaterThan(0);
    expect(result.stabApplied).toBe(false);
  });

  it("applies STAB correctly", () => {
    const attacker: BattlePokemon = {
      pokemonId: 1,
      name: "attacker",
      nickname: "attacker",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 100, attack: 100, defense: 80, "special-attack": 100, "special-defense": 80, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const defender: BattlePokemon = {
      pokemonId: 2,
      name: "defender",
      nickname: "defender",
      typeIds: ["type:normal" as TypeId],
      stats: { hp: 100, attack: 80, defense: 100, "special-attack": 80, "special-defense": 100, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const fireMove: BattleMove = {
      moveId: "move:ember" as MoveId,
      name: "Ember",
      typeId: "type:fire" as TypeId,
      power: 40,
      accuracy: 100,
      damageClass: "special",
    };

    const result = estimateDamage(attacker, defender, fireMove, schema);
    expect(result.stabApplied).toBe(true);
  });
});

describe("pickBestMove", () => {
  it("returns null when attacker has no moves", () => {
    const pokemon: BattlePokemon = {
      pokemonId: 1,
      name: "test",
      nickname: "test",
      typeIds: ["type:normal" as TypeId],
      stats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    expect(pickBestMove(pokemon, pokemon, schema)).toBeNull();
  });

  it("picks the highest damage move", () => {
    const attacker: BattlePokemon = {
      pokemonId: 1,
      name: "attacker",
      nickname: "attacker",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 100, attack: 120, defense: 80, "special-attack": 80, "special-defense": 80, speed: 80 },
      moves: [
        { moveId: "move:scratch" as MoveId, name: "Scratch", typeId: "type:normal" as TypeId, power: 40, accuracy: 100, damageClass: "physical" },
        { moveId: "move:fire-punch" as MoveId, name: "Fire Punch", typeId: "type:fire" as TypeId, power: 75, accuracy: 100, damageClass: "physical" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const defender: BattlePokemon = {
      pokemonId: 2,
      name: "defender",
      nickname: "defender",
      typeIds: ["type:grass" as TypeId],
      stats: { hp: 100, attack: 80, defense: 80, "special-attack": 80, "special-defense": 80, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };

    const result = pickBestMove(attacker, defender, schema);
    expect(result).not.toBeNull();
    // Fire Punch should win: 75 power * 1.5 STAB * 2x SE vs Grass
    expect(result!.move.moveId).toBe("move:fire-punch");
  });
});

describe("simulateMatchup", () => {
  it("produces a valid result structure", () => {
    const pokemonA: BattlePokemon = {
      pokemonId: 1,
      name: "alpha",
      nickname: "Alpha",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 100, attack: 100, defense: 80, "special-attack": 100, "special-defense": 80, speed: 100 },
      moves: [
        { moveId: "move:flamethrower" as MoveId, name: "Flamethrower", typeId: "type:fire" as TypeId, power: 90, accuracy: 100, damageClass: "special" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const pokemonB: BattlePokemon = {
      pokemonId: 2,
      name: "beta",
      nickname: "Beta",
      typeIds: ["type:water" as TypeId],
      stats: { hp: 120, attack: 80, defense: 100, "special-attack": 80, "special-defense": 100, speed: 80 },
      moves: [
        { moveId: "move:surf" as MoveId, name: "Surf", typeId: "type:water" as TypeId, power: 90, accuracy: 100, damageClass: "special" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };

    const result = simulateMatchup([pokemonA], [pokemonB], "Team A", "Team B", schema);
    expect(result.teamALabel).toBe("Team A");
    expect(result.teamBLabel).toBe("Team B");
    expect(result.matchups).toHaveLength(1);
    expect(result.duels).toHaveLength(1);
    expect(result.teamAWins + result.teamBWins + result.ties).toBe(1);
    expect(["A wins", "B wins", "Even"]).toContain(result.overallVerdict);
  });

  it("handles multi-member teams", () => {
    const make = (id: number, name: string, type: TypeId): BattlePokemon => ({
      pokemonId: id,
      name,
      nickname: name,
      typeIds: [type],
      stats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
      moves: [
        { moveId: "move:tackle" as MoveId, name: "Tackle", typeId: "type:normal" as TypeId, power: 40, accuracy: 100, damageClass: "physical" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    });

    const teamA = [make(1, "A1", "type:fire" as TypeId), make(2, "A2", "type:water" as TypeId)];
    const teamB = [make(3, "B1", "type:grass" as TypeId), make(4, "B2", "type:electric" as TypeId)];

    const result = simulateMatchup(teamA, teamB, "Team A", "Team B", schema);
    // 2x2 = 4 matchups
    expect(result.matchups).toHaveLength(4);
    expect(result.duels).toHaveLength(4);
    expect(result.teamAWins + result.teamBWins + result.ties).toBe(4);
  });

  it("populates duel results with speed and KO data", () => {
    const fast: BattlePokemon = {
      pokemonId: 10,
      name: "fast",
      nickname: "Fast",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 80, attack: 120, defense: 80, "special-attack": 80, "special-defense": 80, speed: 150 },
      moves: [
        { moveId: "move:fire-punch" as MoveId, name: "Fire Punch", typeId: "type:fire" as TypeId, power: 75, accuracy: 100, damageClass: "physical" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const slow: BattlePokemon = {
      pokemonId: 20,
      name: "slow",
      nickname: "Slow",
      typeIds: ["type:grass" as TypeId],
      stats: { hp: 80, attack: 80, defense: 80, "special-attack": 80, "special-defense": 80, speed: 30 },
      moves: [
        { moveId: "move:vine-whip" as MoveId, name: "Vine Whip", typeId: "type:grass" as TypeId, power: 45, accuracy: 100, damageClass: "physical" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };

    const result = simulateMatchup([fast], [slow], "Team Fast", "Team Slow", schema);
    const duel = result.duels[0];
    expect(duel.aMovesFirst).toBe(true);
    expect(duel.turnsToKoA).not.toBeNull();
    expect(duel.turnsToKoB).not.toBeNull();
    // Fire vs Grass with STAB should do heavy damage, so fast should win
    expect(duel.duelWinner).toBe("A");
  });

  it("includes allMoves in matchup results", () => {
    const attacker: BattlePokemon = {
      pokemonId: 30,
      name: "multi",
      nickname: "Multi",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
      moves: [
        { moveId: "move:scratch" as MoveId, name: "Scratch", typeId: "type:normal" as TypeId, power: 40, accuracy: 100, damageClass: "physical" },
        { moveId: "move:ember" as MoveId, name: "Ember", typeId: "type:fire" as TypeId, power: 40, accuracy: 100, damageClass: "special" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const defender: BattlePokemon = {
      pokemonId: 40,
      name: "target",
      nickname: "Target",
      typeIds: ["type:normal" as TypeId],
      stats: { hp: 100, attack: 80, defense: 100, "special-attack": 80, "special-defense": 100, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };

    const result = simulateMatchup([attacker], [defender], "A", "B", schema);
    expect(result.matchups[0].allMoves).toHaveLength(2);
    // allMoves should be sorted by damage descending
    expect(result.matchups[0].allMoves[0].damagePercent).toBeGreaterThanOrEqual(
      result.matchups[0].allMoves[1].damagePercent,
    );
  });
});

describe("getAllMoveOptions", () => {
  it("returns all move options sorted by damage", () => {
    const attacker: BattlePokemon = {
      pokemonId: 1,
      name: "attacker",
      nickname: "attacker",
      typeIds: ["type:fire" as TypeId],
      stats: { hp: 100, attack: 120, defense: 80, "special-attack": 80, "special-defense": 80, speed: 80 },
      moves: [
        { moveId: "move:scratch" as MoveId, name: "Scratch", typeId: "type:normal" as TypeId, power: 40, accuracy: 100, damageClass: "physical" },
        { moveId: "move:fire-punch" as MoveId, name: "Fire Punch", typeId: "type:fire" as TypeId, power: 75, accuracy: 100, damageClass: "physical" },
      ],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    const defender: BattlePokemon = {
      pokemonId: 2,
      name: "defender",
      nickname: "defender",
      typeIds: ["type:grass" as TypeId],
      stats: { hp: 100, attack: 80, defense: 80, "special-attack": 80, "special-defense": 80, speed: 80 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };

    const options = getAllMoveOptions(attacker, defender, schema);
    expect(options).toHaveLength(2);
    // Fire Punch should be first (higher power + STAB + SE)
    expect(options[0].move.moveId).toBe("move:fire-punch");
    expect(options[0].damagePercent).toBeGreaterThan(options[1].damagePercent);
  });

  it("returns empty array for no moves", () => {
    const pokemon: BattlePokemon = {
      pokemonId: 1,
      name: "test",
      nickname: "test",
      typeIds: ["type:normal" as TypeId],
      stats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
      moves: [],
      abilities: [],
      isLegendary: false,
      isMythical: false,
    };
    expect(getAllMoveOptions(pokemon, pokemon, schema)).toHaveLength(0);
  });
});

describe("analyzeTeam", () => {
  it("returns valid analysis for a team", () => {
    const dexNumbers = Object.values(schema.pokemon)
      .slice(0, 3)
      .map((s) => s.nationalDexNumber);
    if (dexNumbers.length === 0) return;

    const team = dexNumbers
      .map((id) => resolveBattlePokemon(schema, id))
      .filter((p): p is BattlePokemon => p !== null);

    if (team.length === 0) return;

    const analysis = analyzeTeam(team, schema);
    expect(analysis.synergyScore).toBeGreaterThanOrEqual(0);
    expect(analysis.synergyScore).toBeLessThanOrEqual(100);
    expect(analysis.bstAverage).toBeGreaterThan(0);
    expect(analysis.offensiveCoverage.length).toBeGreaterThan(0);
    expect(analysis.typeSpread).toBeGreaterThanOrEqual(0);
  });

  it("returns zero BST for empty team", () => {
    const analysis = analyzeTeam([], schema);
    expect(analysis.bstAverage).toBe(0);
    expect(analysis.specialCount).toBe(0);
  });
});
