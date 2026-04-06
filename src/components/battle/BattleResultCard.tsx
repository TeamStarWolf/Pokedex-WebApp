import { useMemo, useState } from "react";
import { Trophy, ChevronDown, ChevronUp, Zap, Shield, Star, AlertTriangle, Crown } from "lucide-react";
import type { BattlePokemon, DuelResult, PokemonPerformance, SimulationResult } from "../../lib/battleTypes";
import type { EncyclopediaSchema, PokemonStatKey } from "../../lib/encyclopedia-schema";
import { PokemonImage } from "../encyclopedia/PokemonImage";
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

const STAT_KEYS: PokemonStatKey[] = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const STAT_LABELS: Record<PokemonStatKey, string> = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SpA", "special-defense": "SpD", speed: "SPD",
};
const STAT_MAX = 255;

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / STAT_MAX) * 100);
  const hue = pct < 30 ? 0 : pct < 50 ? 30 : pct < 70 ? 50 : 120;
  return (
    <div className="battle-stat-row">
      <span className="battle-stat-label">{label}</span>
      <div className="battle-stat-track">
        <div className="battle-stat-fill" style={{ width: `${pct}%`, background: `hsl(${hue}, 60%, 50%)` }} />
      </div>
      <span className="battle-stat-value">{value}</span>
    </div>
  );
}

function StatBars({ pokemon }: { pokemon: BattlePokemon }) {
  return (
    <div className="battle-stat-bars">
      {STAT_KEYS.map((key) => (
        <StatBar key={key} label={STAT_LABELS[key]} value={pokemon.stats[key]} />
      ))}
    </div>
  );
}

function PerformanceCard({ perf, label, icon }: { perf: PokemonPerformance; label: string; icon: React.ReactNode }) {
  return (
    <div className="battle-perf-card">
      <div className="battle-perf-header">
        {icon}
        <span className="battle-perf-label">{label}</span>
      </div>
      <div className="battle-perf-body">
        <PokemonImage src={perf.pokemon.artworkUrl} alt={perf.pokemon.name} className="battle-perf-art" />
        <div className="battle-perf-info">
          <strong>{capitalize(perf.pokemon.nickname)}</strong>
          <span className="mono battle-perf-record">
            {perf.wins}W {perf.losses}L {perf.ties}T
          </span>
          {perf.ohkoCount > 0 && (
            <span className="muted">{perf.ohkoCount} OHKO{perf.ohkoCount > 1 ? "s" : ""}</span>
          )}
          {perf.bestMatchup && (
            <span className="muted">Best vs {capitalize(perf.bestMatchup.opponent)}</span>
          )}
        </div>
      </div>
    </div>
  );
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
              {memberA.abilities.length > 0 && (
                <p className="muted battle-ability-line">
                  Ability: {memberA.abilities.filter((a) => !a.isHidden).map((a) => capitalize(a.name)).join(" / ")}
                </p>
              )}
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
              <StatBars pokemon={memberA} />
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
              {memberB.abilities.length > 0 && (
                <p className="muted battle-ability-line">
                  Ability: {memberB.abilities.filter((a) => !a.isHidden).map((a) => capitalize(a.name)).join(" / ")}
                </p>
              )}
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
              <StatBars pokemon={memberB} />
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
  const [showPerf, setShowPerf] = useState(false);

  const sortedTeamA = useMemo(
    () => [...result.teamAPerformance].sort((a, b) => b.wins - a.wins || b.totalDamageDealt - a.totalDamageDealt),
    [result.teamAPerformance],
  );
  const sortedTeamB = useMemo(
    () => [...result.teamBPerformance].sort((a, b) => b.wins - a.wins || b.totalDamageDealt - a.totalDamageDealt),
    [result.teamBPerformance],
  );

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

      {(result.mvp || result.biggestThreat) && (
        <div className="battle-highlights">
          {result.mvp && (
            <PerformanceCard perf={result.mvp} label="MVP" icon={<Crown size={14} />} />
          )}
          {result.biggestThreat && (
            <PerformanceCard perf={result.biggestThreat} label="Biggest Threat" icon={<AlertTriangle size={14} />} />
          )}
        </div>
      )}

      <div className="battle-section">
        <button
          type="button"
          className="battle-perf-toggle ghost-button"
          onClick={() => setShowPerf(!showPerf)}
        >
          <Star size={14} />
          {showPerf ? "Hide" : "Show"} individual performance
          {showPerf ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPerf && (
          <div className="battle-perf-tables">
            <div className="battle-perf-table">
              <h4>{result.teamALabel}</h4>
              <div className="battle-perf-list">
                {sortedTeamA.map((perf) => (
                  <div key={perf.pokemon.pokemonId} className="battle-perf-row">
                    <PokemonImage src={perf.pokemon.artworkUrl} alt={perf.pokemon.name} className="battle-perf-row-art" />
                    <div className="battle-perf-row-info">
                      <strong>{capitalize(perf.pokemon.nickname)}</strong>
                      <span className="battle-duel-types">
                        {perf.pokemon.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} />)}
                      </span>
                    </div>
                    <span className="mono battle-perf-record">
                      {perf.wins}W {perf.losses}L
                    </span>
                    <span className="muted mono">{perf.totalDamageDealt}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="battle-perf-table">
              <h4>{result.teamBLabel}</h4>
              <div className="battle-perf-list">
                {sortedTeamB.map((perf) => (
                  <div key={perf.pokemon.pokemonId} className="battle-perf-row">
                    <PokemonImage src={perf.pokemon.artworkUrl} alt={perf.pokemon.name} className="battle-perf-row-art" />
                    <div className="battle-perf-row-info">
                      <strong>{capitalize(perf.pokemon.nickname)}</strong>
                      <span className="battle-duel-types">
                        {perf.pokemon.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} />)}
                      </span>
                    </div>
                    <span className="mono battle-perf-record">
                      {perf.wins}W {perf.losses}L
                    </span>
                    <span className="muted mono">{perf.totalDamageDealt}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
