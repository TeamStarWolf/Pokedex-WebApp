import type { DamageClass, MoveId, PokemonStatKey, TypeId } from "./encyclopedia-schema";

export type BattleMove = {
  moveId: MoveId;
  name: string;
  typeId: TypeId;
  power: number;
  accuracy: number;
  damageClass: DamageClass;
};

export type BattlePokemon = {
  pokemonId: number;
  name: string;
  nickname: string;
  typeIds: TypeId[];
  stats: Record<PokemonStatKey, number>;
  moves: BattleMove[];
  isLegendary: boolean;
  isMythical: boolean;
};

export type MatchupResult = {
  attackerId: number;
  defenderId: number;
  attackerName: string;
  defenderName: string;
  bestMove: BattleMove | null;
  estimatedDamage: number;
  typeEffectiveness: number;
  stabApplied: boolean;
  favorability: "strong" | "neutral" | "weak" | "immune";
};

export type SimulationResult = {
  teamALabel: string;
  teamBLabel: string;
  matchups: MatchupResult[];
  teamAWins: number;
  teamBWins: number;
  ties: number;
  overallVerdict: "A wins" | "B wins" | "Even";
  teamAScore: number;
  teamBScore: number;
};

export type TypeCoverageEntry = {
  typeId: TypeId;
  typeName: string;
  bestOffensiveMultiplier: number;
  coveringMembers: string[];
};

export type WeaknessEntry = {
  typeId: TypeId;
  typeName: string;
  worstMultiplier: number;
  vulnerableMembers: string[];
};

export type TeamAnalysis = {
  offensiveCoverage: TypeCoverageEntry[];
  defensiveWeaknesses: WeaknessEntry[];
  defensiveResistances: WeaknessEntry[];
  uncoveredTypes: TypeCoverageEntry[];
  doubleWeaknesses: WeaknessEntry[];
  synergyScore: number;
  typeSpread: number;
  bstTotal: number;
  bstAverage: number;
  specialCount: number;
};
