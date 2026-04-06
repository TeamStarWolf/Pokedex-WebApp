// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import type { BattlePokemon } from "../../lib/battleTypes";
import type { PokemonStatKey } from "../../lib/encyclopedia-schema";

type Props = {
  teamA: BattlePokemon[];
  teamB: BattlePokemon[];
  teamALabel: string;
  teamBLabel: string;
};

const STAT_KEYS: PokemonStatKey[] = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const STAT_LABELS: Record<PokemonStatKey, string> = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SpA", "special-defense": "SpD", speed: "SPD",
};

function avgStat(team: BattlePokemon[], key: PokemonStatKey): number {
  if (team.length === 0) return 0;
  return Math.round(team.reduce((sum, p) => sum + p.stats[key], 0) / team.length);
}

function totalBST(team: BattlePokemon[]): number {
  return team.reduce((sum, p) => {
    return sum + STAT_KEYS.reduce((s, k) => s + p.stats[k], 0);
  }, 0);
}

function avgBST(team: BattlePokemon[]): number {
  if (team.length === 0) return 0;
  return Math.round(totalBST(team) / team.length);
}

export function TeamComparePanel({ teamA, teamB, teamALabel, teamBLabel }: Props) {
  const statsA = useMemo(() => STAT_KEYS.map((k) => avgStat(teamA, k)), [teamA]);
  const statsB = useMemo(() => STAT_KEYS.map((k) => avgStat(teamB, k)), [teamB]);
  const maxStat = useMemo(() => Math.max(...statsA, ...statsB, 1), [statsA, statsB]);

  const bstA = useMemo(() => avgBST(teamA), [teamA]);
  const bstB = useMemo(() => avgBST(teamB), [teamB]);

  // Count type distribution for each team
  const typesA = useMemo(() => {
    const set = new Set<string>();
    teamA.forEach((p) => p.typeIds.forEach((t) => set.add(t)));
    return set.size;
  }, [teamA]);
  const typesB = useMemo(() => {
    const set = new Set<string>();
    teamB.forEach((p) => p.typeIds.forEach((t) => set.add(t)));
    return set.size;
  }, [teamB]);

  const moveTypesA = useMemo(() => {
    const set = new Set<string>();
    teamA.forEach((p) => p.moves.forEach((m) => set.add(m.typeId)));
    return set.size;
  }, [teamA]);
  const moveTypesB = useMemo(() => {
    const set = new Set<string>();
    teamB.forEach((p) => p.moves.forEach((m) => set.add(m.typeId)));
    return set.size;
  }, [teamB]);

  return (
    <div className="team-compare">
      <h3><BarChart3 size={16} /> Team comparison</h3>
      <p className="muted">Average base stats side-by-side.</p>

      <div className="team-compare-labels">
        <span className="team-compare-label team-compare-label-a">{teamALabel}</span>
        <span className="team-compare-label team-compare-label-b">{teamBLabel}</span>
      </div>

      <div className="team-compare-bars">
        {STAT_KEYS.map((key, i) => {
          const pctA = (statsA[i] / maxStat) * 100;
          const pctB = (statsB[i] / maxStat) * 100;
          const aWins = statsA[i] > statsB[i];
          const bWins = statsB[i] > statsA[i];

          return (
            <div key={key} className="team-compare-row">
              <span className={`team-compare-value mono ${aWins ? "team-compare-leading" : ""}`}>
                {statsA[i]}
              </span>
              <div className="team-compare-bar-group">
                <div className="team-compare-bar team-compare-bar-a">
                  <div
                    className="team-compare-fill team-compare-fill-a"
                    style={{ width: `${pctA}%` }}
                  />
                </div>
                <span className="team-compare-stat-label">{STAT_LABELS[key]}</span>
                <div className="team-compare-bar team-compare-bar-b">
                  <div
                    className="team-compare-fill team-compare-fill-b"
                    style={{ width: `${pctB}%` }}
                  />
                </div>
              </div>
              <span className={`team-compare-value mono ${bWins ? "team-compare-leading" : ""}`}>
                {statsB[i]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="team-compare-summary">
        <div className="team-compare-summary-row">
          <span className="mono">{bstA}</span>
          <span className="muted">Avg. BST</span>
          <span className="mono">{bstB}</span>
        </div>
        <div className="team-compare-summary-row">
          <span className="mono">{typesA}</span>
          <span className="muted">Type variety</span>
          <span className="mono">{typesB}</span>
        </div>
        <div className="team-compare-summary-row">
          <span className="mono">{moveTypesA}</span>
          <span className="muted">Move types</span>
          <span className="mono">{moveTypesB}</span>
        </div>
      </div>
    </div>
  );
}
