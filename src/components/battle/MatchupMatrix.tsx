import { Trophy } from "lucide-react";
import type { SimulationResult } from "../../lib/battleTypes";
import { capitalize } from "../../lib/format";

type Props = {
  result: SimulationResult;
};

function cellColor(damagePercent: number, effectiveness: number): string {
  if (effectiveness === 0) return "var(--color-surface-sunken)";
  if (damagePercent >= 100) return "color-mix(in srgb, #22c55e 35%, transparent)";
  if (damagePercent >= 50) return "color-mix(in srgb, #22c55e 20%, transparent)";
  if (damagePercent >= 25) return "color-mix(in srgb, #eab308 15%, transparent)";
  return "color-mix(in srgb, #ef4444 12%, transparent)";
}

export function MatchupMatrix({ result }: Props) {
  const teamA = [...new Map(result.duels.map((d) => [d.memberA.pokemonId, d.memberA])).values()];
  const teamB = [...new Map(result.duels.map((d) => [d.memberB.pokemonId, d.memberB])).values()];

  const duelMap = new Map<string, (typeof result.duels)[0]>();
  for (const duel of result.duels) {
    duelMap.set(`${duel.memberA.pokemonId}-${duel.memberB.pokemonId}`, duel);
  }

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
                  {capitalize(b.nickname)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamA.map((a) => (
              <tr key={a.pokemonId}>
                <th className="battle-matrix-row-header">{capitalize(a.nickname)}</th>
                {teamB.map((b) => {
                  const duel = duelMap.get(`${a.pokemonId}-${b.pokemonId}`);
                  if (!duel) return <td key={b.pokemonId} className="battle-matrix-cell">–</td>;

                  const dmgA = duel.aAttacks.estimatedDamage;
                  const dmgB = duel.bAttacks.estimatedDamage;
                  const koA = duel.turnsToKoA;
                  const koB = duel.turnsToKoB;

                  return (
                    <td
                      key={b.pokemonId}
                      className={`battle-matrix-cell ${duel.duelWinner === "A" ? "matrix-win" : duel.duelWinner === "B" ? "matrix-lose" : "matrix-tie"}`}
                      style={{ background: cellColor(dmgA, duel.aAttacks.typeEffectiveness) }}
                      title={`${capitalize(a.nickname)} deals ${dmgA}% → ${capitalize(b.nickname)} deals ${dmgB}%`}
                    >
                      <span className="matrix-dmg">{dmgA}%</span>
                      {koA !== null && <span className="matrix-ko">{koA === 1 ? "OHKO" : `${koA}HKO`}</span>}
                      {duel.duelWinner === "A" && <span className="matrix-result-icon">W</span>}
                      {duel.duelWinner === "B" && <span className="matrix-result-icon matrix-result-loss">L</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted battle-matrix-legend">
        Each cell shows your Pokemon's best damage % against the opponent. Green = strong, yellow = moderate, red = weak.
        W/L based on turns-to-KO + speed tiebreak.
      </p>
    </div>
  );
}
