import { Trophy } from "lucide-react";
import type { SimulationResult } from "../../lib/battleTypes";
import { capitalize } from "../../lib/format";

type Props = {
  result: SimulationResult;
};

function verdictLabel(verdict: SimulationResult["overallVerdict"], teamALabel: string, teamBLabel: string) {
  if (verdict === "A wins") return `${teamALabel} has the advantage`;
  if (verdict === "B wins") return `${teamBLabel} has the advantage`;
  return "It's an even matchup";
}

function verdictClass(verdict: SimulationResult["overallVerdict"]) {
  if (verdict === "A wins") return "battle-verdict-win";
  if (verdict === "B wins") return "battle-verdict-lose";
  return "battle-verdict-tie";
}

function favorabilityClass(fav: string) {
  if (fav === "strong") return "battle-effectiveness-strong";
  if (fav === "weak") return "battle-effectiveness-weak";
  if (fav === "immune") return "battle-effectiveness-immune";
  return "battle-effectiveness-neutral";
}

export function BattleResultCard({ result }: Props) {
  return (
    <div className="battle-result">
      <div className={`battle-verdict-banner ${verdictClass(result.overallVerdict)}`}>
        <div>
          <Trophy size={20} />
          <strong>{verdictLabel(result.overallVerdict, result.teamALabel, result.teamBLabel)}</strong>
        </div>
      </div>

      <div className="stats-cluster">
        <div><strong>{result.teamAWins}</strong><span>{result.teamALabel} wins</span></div>
        <div><strong>{result.teamBWins}</strong><span>{result.teamBLabel} wins</span></div>
        <div><strong>{result.ties}</strong><span>Ties</span></div>
        <div><strong>{result.teamAScore} - {result.teamBScore}</strong><span>Total damage %</span></div>
      </div>

      <div className="battle-section">
        <h3>Matchup breakdown</h3>
        <p className="muted">Each row shows your best attack against the opponent's Pokemon.</p>
        <div className="battle-coverage-table" role="table" aria-label="Matchup breakdown">
          <div className="battle-coverage-head" role="row">
            <span>Your Pokemon</span>
            <span>vs</span>
            <span>Best move</span>
            <span>Damage</span>
          </div>
          {result.matchups.map((matchup) => (
            <div
              key={`${matchup.attackerId}-${matchup.defenderId}`}
              className={`battle-coverage-row ${favorabilityClass(matchup.favorability)}`}
              role="row"
            >
              <span><strong>{capitalize(matchup.attackerName)}</strong></span>
              <span>{capitalize(matchup.defenderName)}</span>
              <span>
                {matchup.bestMove ? (
                  <>
                    {matchup.bestMove.name}
                    {matchup.stabApplied ? <span className="mini-badge">STAB</span> : null}
                  </>
                ) : <span className="muted">No moves</span>}
              </span>
              <span className="mono">
                {matchup.estimatedDamage}%
                {matchup.typeEffectiveness !== 1 ? (
                  <span className={`mini-badge ${matchup.typeEffectiveness > 1 ? "battle-badge-se" : "battle-badge-nve"}`}>
                    {matchup.typeEffectiveness}x
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
