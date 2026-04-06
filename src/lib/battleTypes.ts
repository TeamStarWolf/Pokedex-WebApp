import type { DamageClass, MoveId, PokemonStatKey, TypeId } from "./encyclopedia-schema";

export type BattleMove = {
  moveId: MoveId;
  name: string;
  typeId: TypeId;
  power: number;
  accuracy: number;
  damageClass: DamageClass;
};

export type BattleAbility = {
  abilityId: string;
  name: string;
  isHidden: boolean;
};

export type BattlePokemon = {
  pokemonId: number;
  name: string;
  nickname: string;
  typeIds: TypeId[];
  stats: Record<PokemonStatKey, number>;
  moves: BattleMove[];
  abilities: BattleAbility[];
  isLegendary: boolean;
  isMythical: boolean;
  artworkUrl?: string;
};

export type PokemonPerformance = {
  pokemon: BattlePokemon;
  wins: number;
  losses: number;
  ties: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  bestMatchup: { opponent: string; damage: number } | null;
  worstMatchup: { opponent: string; damage: number } | null;
  ohkoCount: number;
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
  allMoves: MoveOption[];
};

export type MoveOption = {
  move: BattleMove;
  damage: number;
  damagePercent: number;
  typeEffectiveness: number;
  stabApplied: boolean;
};

export type DuelResult = {
  memberA: BattlePokemon;
  memberB: BattlePokemon;
  aAttacks: MatchupResult;
  bAttacks: MatchupResult;
  turnsToKoA: number | null;
  turnsToKoB: number | null;
  aMovesFirst: boolean;
  duelWinner: "A" | "B" | "tie";
};

export type SimulationResult = {
  teamALabel: string;
  teamBLabel: string;
  matchups: MatchupResult[];
  duels: DuelResult[];
  teamAWins: number;
  teamBWins: number;
  ties: number;
  overallVerdict: "A wins" | "B wins" | "Even";
  teamAScore: number;
  teamBScore: number;
  teamAPerformance: PokemonPerformance[];
  teamBPerformance: PokemonPerformance[];
  mvp: PokemonPerformance | null;
  biggestThreat: PokemonPerformance | null;
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
