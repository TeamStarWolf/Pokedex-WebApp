import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp, Zap, Shield } from "lucide-react";
import type { DuelResult, SimulationResult } from "../../lib/battleTypes";
import type { EncyclopediaSchema } from "../../lib/encyclopedia-schema";
import { TypeBadge } from "./TypeBadge";
import { capitalize } from "../../lib/format";

type Props = {
  result: SimulationResult;
  schema: EncyclopediaSchema;
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

function duelWinnerClass(winner: DuelResult["duelWinner"]) {
  if (winner === "A") return "battle-effectiveness-strong";
  if (winner === "B") return "battle-effectiveness-weak";
  return "battle-effectiveness-neutral";
}

function koLabel(turns: number | null): string {
  if (turns === null) return "—";
  if (turns === 1) return "OHKO";
  return `${turns}HKO`;
}

function DuelRow({ duel, schema }: { duel: DuelResult; schema: EncyclopediaSchema }) {
  const [expanded, setExpanded] = useState(false);

  const { memberA, memberB, aAttacks, bAttacks, turnsToKoA, turnsToKoB, aMovesFirst, duelWinner } = duel;

  return (
    <div className={`battle-duel ${duelWinnerClass(duelWinner)}`}>
      <button
        type="button"
        className="battle-duel-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="battle-duel-matchup">
          <span className="battle-duel-name">
            <strong>{capitalize(memberA.nickname)}</strong>
            <span className="battle-duel-types">
              {memberA.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} />)}
            </span>
          </span>
          <span className="battle-duel-vs">vs</span>
          <span className="battle-duel-name">
            <strong>{capitalize(memberB.nickname)}</strong>
            <span className="battle-duel-types">
              {memberB.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} />)}
            </span>
          </span>
        </div>
        <div className="battle-duel-summary">
          <span className={`battle-duel-result ${duelWinner === "A" ? "duel-win" : duelWinner === "B" ? "duel-lose" : "duel-tie"}`}>
            {duelWinner === "A" ? "WIN" : duelWinner === "B" ? "LOSS" : "TIE"}
          </span>
          <span className="mono">{aAttacks.estimatedDamage}% / {bAttacks.estimatedDamage}%</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="battle-duel-detail">
          <div className="battle-duel-stats">
            <div className="battle-duel-side">
              <h4><Zap size={14} /> {capitalize(memberA.nickname)} attacks</h4>
              <p className="muted">
                Best: {aAttacks.bestMove?.name ?? "None"} → {aAttacks.estimatedDamage}%
                {aAttacks.stabApplied && <span className="mini-badge">STAB</span>}
                {aAttacks.typeEffectiveness !== 1 && (
                  <span className={`mini-badge ${aAttacks.typeEffectiveness > 1 ? "battle-badge-se" : "battle-badge-nve"}`}>
                    {aAttacks.typeEffectiveness}x
                  </span>
                )}
              </p>
              <p className="muted">KO in: {koLabel(turnsToKoA)}</p>
              {aAttacks.allMoves.length > 1 && (
                <div className="battle-move-options">
                  {aAttacks.allMoves.map((opt) => (
                    <div key={opt.move.moveId} className="battle-move-option">
                      <TypeBadge typeId={opt.move.typeId} schema={schema} />
                      <span>{opt.move.name}</span>
                      <span className="mono">{opt.damagePercent}%</span>
                      {opt.stabApplied && <span className="mini-badge">STAB</span>}
                      {opt.typeEffectiveness !== 1 && (
                        <span className={`mini-badge ${opt.typeEffectiveness > 1 ? "battle-badge-se" : "battle-badge-nve"}`}>
                          {opt.typeEffectiveness}x
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="battle-duel-side">
              <h4><Shield size={14} /> {capitalize(memberB.nickname)} attacks</h4>
              <p className="muted">
                Best: {bAttacks.bestMove?.name ?? "None"} → {bAttacks.estimatedDamage}%
                {bAttacks.stabApplied && <span className="mini-badge">STAB</span>}
                {bAttacks.typeEffectiveness !== 1 && (
                  <span className={`mini-badge ${bAttacks.typeEffectiveness > 1 ? "battle-badge-se" : "battle-badge-nve"}`}>
                    {bAttacks.typeEffectiveness}x
                  </span>
                )}
              </p>
              <p className="muted">KO in: {koLabel(turnsToKoB)}</p>
              {bAttacks.allMoves.length > 1 && (
                <div className="battle-move-options">
                  {bAttacks.allMoves.map((opt) => (
                    <div key={opt.move.moveId} className="battle-move-option">
                      <TypeBadge typeId={opt.move.typeId} schema={schema} />
                      <span>{opt.move.name}</span>
                      <span className="mono">{opt.damagePercent}%</span>
                      {opt.stabApplied && <span className="mini-badge">STAB</span>}
                      {opt.typeEffectiveness !== 1 && (
                        <span className={`mini-badge ${opt.typeEffectiveness > 1 ? "battle-badge-se" : "battle-badge-nve"}`}>
                          {opt.typeEffectiveness}x
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="battle-duel-meta">
            <span className="muted">
              Speed: {capitalize(memberA.nickname)} {memberA.stats.speed} vs {capitalize(memberB.nickname)} {memberB.stats.speed}
              {" — "}
              {aMovesFirst ? capitalize(memberA.nickname) : capitalize(memberB.nickname)} moves first
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function BattleResultCard({ result, schema }: Props) {
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
        <div><strong>{result.teamAScore} – {result.teamBScore}</strong><span>Total damage %</span></div>
      </div>

      <div className="battle-section">
        <h3>Duel breakdown</h3>
        <p className="muted">Each duel compares your Pokemon vs an opponent. Click to expand move details, speed, and KO analysis.</p>
        <div className="battle-duel-list">
          {result.duels.map((duel) => (
            <DuelRow
              key={`${duel.memberA.pokemonId}-${duel.memberB.pokemonId}`}
              duel={duel}
              schema={schema}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
