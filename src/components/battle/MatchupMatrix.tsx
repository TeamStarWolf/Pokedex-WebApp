import { useMemo } from "react";
import { Trophy } from "lucide-react";
import type { DuelResult, SimulationResult } from "../../lib/battleTypes";
import type { EncyclopediaSchema } from "../../lib/encyclopedia-schema";
import { PokemonImage } from "../encyclopedia/PokemonImage";
import { TypeBadge } from "./TypeBadge";
import { capitalize } from "../../lib/format";

type Props = {
  result: SimulationResult;
  schema: EncyclopediaSchema;
};

function cellColor(dmgA: number, dmgB: number, winner: DuelResult["duelWinner"]): string {
  if (winner === "A") {
    if (dmgA >= 100) return "color-mix(in srgb, #22c55e 30%, transparent)";
    return "color-mix(in srgb, #22c55e 15%, transparent)";
  }
  if (winner === "B") {
    if (dmgB >= 100) return "color-mix(in srgb, #ef4444 20%, transparent)";
    return "color-mix(in srgb, #ef4444 10%, transparent)";
  }
  return "color-mix(in srgb, #eab308 10%, transparent)";
}

function koTag(turns: number | null): string {
  if (turns === null) return "";
  if (turns === 1) return "OHKO";
  return `${turns}HKO`;
}

export function MatchupMatrix({ result, schema }: Props) {
  const teamA = useMemo(
    () => [...new Map(result.duels.map((d) => [d.memberA.pokemonId, d.memberA])).values()],
    [result.duels],
  );
  const teamB = useMemo(
    () => [...new Map(result.duels.map((d) => [d.memberB.pokemonId, d.memberB])).values()],
    [result.duels],
  );

  const duelMap = useMemo(() => {
    const map = new Map<string, DuelResult>();
    for (const duel of result.duels) {
      map.set(`${duel.memberA.pokemonId}-${duel.memberB.pokemonId}`, duel);
    }
    return map;
  }, [result.duels]);

  // Row summaries: wins/losses for each team A member
  const rowSummaries = useMemo(() => {
    return teamA.map((a) => {
      let wins = 0;
      let losses = 0;
      let totalDmg = 0;
      for (const b of teamB) {
        const duel = duelMap.get(`${a.pokemonId}-${b.pokemonId}`);
        if (!duel) continue;
        if (duel.duelWinner === "A") wins++;
        else if (duel.duelWinner === "B") losses++;
        totalDmg += duel.aAttacks.estimatedDamage;
      }
      return { wins, losses, totalDmg };
    });
  }, [teamA, teamB, duelMap]);

  // Column summaries: wins/losses for each team B member (from B's perspective)
  const colSummaries = useMemo(() => {
    return teamB.map((b) => {
      let wins = 0;
      let losses = 0;
      let totalDmg = 0;
      for (const a of teamA) {
        const duel = duelMap.get(`${a.pokemonId}-${b.pokemonId}`);
        if (!duel) continue;
        if (duel.duelWinner === "B") wins++;
        else if (duel.duelWinner === "A") losses++;
        totalDmg += duel.bAttacks.estimatedDamage;
      }
      return { wins, losses, totalDmg };
    });
  }, [teamA, teamB, duelMap]);

  return (
    <div className="battle-matrix">
      <div className="battle-matrix-verdict">
        <Trophy size={16} />
        <strong>
          {result.overallVerdict === "A wins"
            ? `${result.teamALabel} has the advantage`
            : result.overallVerdict === "B wins"
              ? `${result.teamBLabel} has the advantage`
              : "It's an even matchup"}
        </strong>
        <span className="muted">
          {result.teamAWins}W – {result.teamBWins}L – {result.ties}T
        </span>
      </div>

      <div className="battle-matrix-scroll">
        <table className="battle-matrix-table">
          <thead>
            <tr>
              <th className="battle-matrix-corner">
                <span className="battle-matrix-axis-a">{result.teamALabel}</span>
                <span className="battle-matrix-axis-b">vs {result.teamBLabel}</span>
              </th>
              {teamB.map((b) => (
                <th key={b.pokemonId} className="battle-matrix-col-header">
                  <div className="matrix-header-cell">
                    <PokemonImage src={b.artworkUrl} alt={b.name} className="matrix-header-art" />
                    <span>{capitalize(b.nickname)}</span>
                    <span className="matrix-header-types">
                      {b.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} size="xs" />)}
                    </span>
                  </div>
                </th>
              ))}
              <th className="battle-matrix-summary-header">Record</th>
            </tr>
          </thead>
          <tbody>
            {teamA.map((a, rowIdx) => (
              <tr key={a.pokemonId}>
                <th className="battle-matrix-row-header">
                  <div className="matrix-header-cell matrix-header-cell-row">
                    <PokemonImage src={a.artworkUrl} alt={a.name} className="matrix-header-art" />
                    <div>
                      <span>{capitalize(a.nickname)}</span>
                      <span className="matrix-header-types">
                        {a.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} size="xs" />)}
                      </span>
                    </div>
                  </div>
                </th>
                {teamB.map((b) => {
                  const duel = duelMap.get(`${a.pokemonId}-${b.pokemonId}`);
                  if (!duel) return <td key={b.pokemonId} className="battle-matrix-cell">–</td>;

                  const dmgA = duel.aAttacks.estimatedDamage;
                  const dmgB = duel.bAttacks.estimatedDamage;
                  const koA = koTag(duel.turnsToKoA);
                  const koB = koTag(duel.turnsToKoB);

                  return (
                    <td
                      key={b.pokemonId}
                      className={`battle-matrix-cell ${duel.duelWinner === "A" ? "matrix-win" : duel.duelWinner === "B" ? "matrix-lose" : "matrix-tie"}`}
                      style={{ background: cellColor(dmgA, dmgB, duel.duelWinner) }}
                      title={`${capitalize(a.nickname)} → ${dmgA}% (${koA || "—"}) vs ${capitalize(b.nickname)} → ${dmgB}% (${koB || "—"})`}
                    >
                      <div className="matrix-cell-bidirectional">
                        <span className="matrix-cell-attack">
                          <span className="matrix-cell-arrow">{">"}</span>
                          <span className="mono">{dmgA}%</span>
                          {koA && <span className="matrix-ko">{koA}</span>}
                        </span>
                        <span className="matrix-cell-defend">
                          <span className="matrix-cell-arrow">{"<"}</span>
                          <span className="mono">{dmgB}%</span>
                          {koB && <span className="matrix-ko">{koB}</span>}
                        </span>
                      </div>
                      <span className={`matrix-result-badge ${duel.duelWinner === "A" ? "matrix-badge-win" : duel.duelWinner === "B" ? "matrix-badge-loss" : "matrix-badge-tie"}`}>
                        {duel.duelWinner === "A" ? "WIN" : duel.duelWinner === "B" ? "LOSS" : "TIE"}
                      </span>
                    </td>
                  );
                })}
                <td className="battle-matrix-summary-cell">
                  <span className="matrix-summary-record">
                    <span className="matrix-summary-win">{rowSummaries[rowIdx].wins}W</span>
                    <span className="matrix-summary-loss">{rowSummaries[rowIdx].losses}L</span>
                  </span>
                  <span className="muted mono matrix-summary-dmg">{rowSummaries[rowIdx].totalDmg}%</span>
                </td>
              </tr>
            ))}
            <tr className="battle-matrix-footer-row">
              <th className="battle-matrix-footer-label">Opponent record</th>
              {colSummaries.map((summary, colIdx) => (
                <td key={teamB[colIdx].pokemonId} className="battle-matrix-footer-cell">
                  <span className="matrix-summary-record">
                    <span className="matrix-summary-win">{summary.wins}W</span>
                    <span className="matrix-summary-loss">{summary.losses}L</span>
                  </span>
                  <span className="muted mono matrix-summary-dmg">{summary.totalDmg}%</span>
                </td>
              ))}
              <td className="battle-matrix-footer-cell battle-matrix-total-cell">
                <strong className="mono">{result.teamAWins}–{result.teamBWins}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="battle-matrix-legend-bar">
        <div className="matrix-legend-item">
          <span className="matrix-legend-swatch matrix-legend-win" />
          <span>Your win</span>
        </div>
        <div className="matrix-legend-item">
          <span className="matrix-legend-swatch matrix-legend-loss" />
          <span>Opponent win</span>
        </div>
        <div className="matrix-legend-item">
          <span className="matrix-legend-swatch matrix-legend-tie" />
          <span>Tie</span>
        </div>
        <span className="muted matrix-legend-hint">
          {">"} = your attack | {"<"} = opponent attack | KO = turns to knock out
        </span>
      </div>
    </div>
  );
}
