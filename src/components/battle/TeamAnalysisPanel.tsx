// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useMemo, useState } from "react";
import { Shield, Swords, TrendingUp, TrendingDown, Lightbulb, Grid3x3, Plus } from "lucide-react";
import type { EncyclopediaSchema, TypeId } from "../../lib/encyclopedia-schema";
import type { TeamAnalysis } from "../../lib/battleTypes";
import { TypeBadge } from "./TypeBadge";
import { PokemonImage } from "../encyclopedia/PokemonImage";
import { capitalize } from "../../lib/format";

type Props = {
  analysis: TeamAnalysis;
  schema: EncyclopediaSchema;
};

function synergyGrade(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "Excellent", className: "synergy-excellent" };
  if (score >= 60) return { label: "Good", className: "synergy-good" };
  if (score >= 40) return { label: "Fair", className: "synergy-fair" };
  return { label: "Poor", className: "synergy-poor" };
}

type HeatmapMode = "offense" | "defense";

function multiplierColor(mult: number, mode: HeatmapMode): string {
  if (mode === "offense") {
    if (mult >= 4) return "var(--heatmap-se4)";
    if (mult >= 2) return "var(--heatmap-se)";
    if (mult >= 1) return "var(--heatmap-neutral)";
    if (mult > 0) return "var(--heatmap-nve)";
    return "var(--heatmap-immune)";
  }
  // Defense: low mult is good (resist), high is bad (weak)
  if (mult >= 4) return "var(--heatmap-def-4x)";
  if (mult >= 2) return "var(--heatmap-def-2x)";
  if (mult >= 1) return "var(--heatmap-neutral)";
  if (mult > 0) return "var(--heatmap-def-resist)";
  return "var(--heatmap-def-immune)";
}

function multiplierLabel(mult: number): string {
  if (mult === 0) return "0";
  if (mult === 0.25) return "¼";
  if (mult === 0.5) return "½";
  if (mult === 1) return "1";
  return `${mult}`;
}

function TypeHeatmap({ analysis, schema }: Props) {
  const [mode, setMode] = useState<HeatmapMode>("offense");
  const allTypeIds = useMemo(
    () => Object.values(schema.types).map((t) => t.id).filter((id): id is TypeId => !!id),
    [schema.types],
  );

  const grid = mode === "offense" ? analysis.offensiveGrid : analysis.defensiveGrid;

  return (
    <div className="battle-section">
      <div className="heatmap-header">
        <h3><Grid3x3 size={16} /> Type {mode === "offense" ? "coverage" : "defense"} heatmap</h3>
        <div className="heatmap-toggle">
          <button
            type="button"
            className={`ghost-button heatmap-toggle-btn ${mode === "offense" ? "active" : ""}`}
            onClick={() => setMode("offense")}
          >
            <Swords size={12} /> Offense
          </button>
          <button
            type="button"
            className={`ghost-button heatmap-toggle-btn ${mode === "defense" ? "active" : ""}`}
            onClick={() => setMode("defense")}
          >
            <Shield size={12} /> Defense
          </button>
        </div>
      </div>
      <p className="muted">
        {mode === "offense"
          ? "Best offensive multiplier each member can achieve vs each type."
          : "Damage multiplier each member takes from each attacking type."}
      </p>
      <div className="heatmap-scroll">
        <table className="heatmap-table" role="grid">
          <thead>
            <tr>
              <th className="heatmap-corner">
                {mode === "offense" ? "Member → Type" : "Type → Member"}
              </th>
              {mode === "offense"
                ? allTypeIds.map((typeId) => (
                    <th key={typeId} className="heatmap-col-header">
                      <TypeBadge typeId={typeId} schema={schema} size="xs" />
                    </th>
                  ))
                : analysis.memberNames.map((name) => (
                    <th key={name} className="heatmap-col-header">
                      <span className="heatmap-member-label">{capitalize(name)}</span>
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {mode === "offense"
              ? analysis.memberNames.map((name) => (
                  <tr key={name}>
                    <th className="heatmap-row-header">{capitalize(name)}</th>
                    {allTypeIds.map((typeId) => {
                      const cell = grid.find(
                        (c) => c.memberName === name && "targetTypeId" in c && c.targetTypeId === typeId,
                      );
                      const mult = cell && "bestMultiplier" in cell ? cell.bestMultiplier : 1;
                      return (
                        <td
                          key={typeId}
                          className="heatmap-cell"
                          style={{ background: multiplierColor(mult, "offense") }}
                          title={cell && "bestMoveName" in cell && cell.bestMoveName ? `${cell.bestMoveName} → ${mult}x` : `${mult}x`}
                        >
                          {multiplierLabel(mult)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              : allTypeIds.map((typeId) => (
                  <tr key={typeId}>
                    <th className="heatmap-row-header">
                      <TypeBadge typeId={typeId} schema={schema} size="xs" />
                    </th>
                    {analysis.memberNames.map((name) => {
                      const cell = grid.find(
                        (c) => c.memberName === name && "attackingTypeId" in c && c.attackingTypeId === typeId,
                      );
                      const mult = cell && "multiplier" in cell ? cell.multiplier : 1;
                      return (
                        <td
                          key={name}
                          className="heatmap-cell"
                          style={{ background: multiplierColor(mult, "defense") }}
                          title={`${capitalize(name)} takes ${mult}x from ${typeId.replace("type:", "")}`}
                        >
                          {multiplierLabel(mult)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className="heatmap-legend">
        {mode === "offense" ? (
          <>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-se4)" }} />4x</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-se)" }} />2x</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-neutral)" }} />1x</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-nve)" }} />½x</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-immune)" }} />0x</span>
          </>
        ) : (
          <>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-def-4x)" }} />4x weak</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-def-2x)" }} />2x weak</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-neutral)" }} />1x</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-def-resist)" }} />Resist</span>
            <span className="heatmap-legend-item"><span className="heatmap-swatch" style={{ background: "var(--heatmap-def-immune)" }} />Immune</span>
          </>
        )}
      </div>
    </div>
  );
}

function SuggestionsPanel({ analysis, schema, onAddPokemon }: Props & { onAddPokemon?: (dexNum: number) => void }) {
  if (analysis.suggestions.length === 0) return null;

  return (
    <div className="battle-section">
      <h3><Lightbulb size={16} /> Suggested additions</h3>
      <p className="muted">
        Pokemon that could patch your team's weaknesses and coverage gaps.
      </p>
      <div className="suggestion-grid">
        {analysis.suggestions.map((s) => (
          <div key={s.pokemonId} className="suggestion-card">
            <PokemonImage src={s.artworkUrl} alt={s.name} className="suggestion-art" />
            <div className="suggestion-info">
              <strong>{capitalize(s.name)}</strong>
              <div className="suggestion-types">
                {s.typeIds.map((id) => <TypeBadge key={id} typeId={id} schema={schema} size="xs" />)}
              </div>
              <span className="suggestion-reason">{s.reason}</span>
            </div>
            {onAddPokemon && (
              <button
                type="button"
                className="ghost-button suggestion-add-btn"
                onClick={() => onAddPokemon(s.pokemonId)}
                aria-label={`Add ${s.name} to team`}
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamAnalysisPanel({ analysis, schema, onAddPokemon }: Props & { onAddPokemon?: (dexNum: number) => void }) {
  const grade = synergyGrade(analysis.synergyScore);

  return (
    <div className="battle-analysis">
      <div className="battle-synergy-header">
        <div className="battle-synergy-score-group">
          <span className={`battle-synergy-grade ${grade.className}`}>{grade.label}</span>
          <span className="battle-synergy-number">{analysis.synergyScore}<span className="muted">/100</span></span>
        </div>
        <div className="battle-synergy-bar">
          <div
            className={`battle-synergy-fill ${grade.className}`}
            style={{ width: `${analysis.synergyScore}%` }}
          />
        </div>
      </div>

      <div className="stats-cluster">
        <div><strong>{analysis.typeSpread}</strong><span>Offensive types</span></div>
        <div><strong>{analysis.bstAverage}</strong><span>Avg. BST</span></div>
        <div><strong>{analysis.bstTotal}</strong><span>Total BST</span></div>
        <div><strong>{analysis.specialCount}</strong><span>Legend / Mythic</span></div>
      </div>

      {analysis.doubleWeaknesses.length > 0 && (
        <div className="battle-alert battle-weakness-critical">
          <strong>4x weakness warning</strong>
          <p className="muted">
            These types can deal quadruple damage to members of this team:
          </p>
          <div className="battle-alert-types">
            {analysis.doubleWeaknesses.map((entry) => (
              <TypeBadge key={entry.typeId} typeId={entry.typeId} schema={schema} />
            ))}
          </div>
        </div>
      )}

      <TypeHeatmap analysis={analysis} schema={schema} />

      <div className="battle-section">
        <h3><Swords size={16} /> Offensive coverage</h3>
        <p className="muted">How well your team can hit each type super-effectively.</p>
        <div className="battle-coverage-table" role="table" aria-label="Offensive type coverage">
          <div className="battle-coverage-head" role="row">
            <span>Target type</span>
            <span>Best mult.</span>
            <span>Covered by</span>
          </div>
          {analysis.offensiveCoverage
            .sort((a, b) => b.bestOffensiveMultiplier - a.bestOffensiveMultiplier)
            .map((entry) => (
              <div
                key={entry.typeId}
                className={`battle-coverage-row ${entry.bestOffensiveMultiplier >= 2 ? "battle-effectiveness-strong" : entry.bestOffensiveMultiplier >= 1 ? "battle-effectiveness-neutral" : "battle-effectiveness-weak"}`}
                role="row"
              >
                <TypeBadge typeId={entry.typeId} schema={schema} />
                <span className="mono">{entry.bestOffensiveMultiplier.toFixed(1)}x</span>
                <span className="battle-coverage-members">
                  {entry.coveringMembers.length > 0
                    ? entry.coveringMembers.map(capitalize).join(", ")
                    : <span className="muted">None</span>}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="battle-section">
        <h3><Shield size={16} /> Defensive weaknesses</h3>
        <p className="muted">Types that deal super-effective damage to at least one team member.</p>
        {analysis.defensiveWeaknesses.length > 0 ? (
          <div className="battle-coverage-table" role="table" aria-label="Defensive weaknesses">
            <div className="battle-coverage-head" role="row">
              <span>Attacking type</span>
              <span>Worst mult.</span>
              <span>Vulnerable members</span>
            </div>
            {analysis.defensiveWeaknesses
              .sort((a, b) => b.worstMultiplier - a.worstMultiplier)
              .map((entry) => (
                <div
                  key={entry.typeId}
                  className={`battle-coverage-row ${entry.worstMultiplier >= 4 ? "battle-weakness-critical" : "battle-effectiveness-weak"}`}
                  role="row"
                >
                  <TypeBadge typeId={entry.typeId} schema={schema} />
                  <span className="mono">{entry.worstMultiplier}x</span>
                  <span className="battle-coverage-members">{entry.vulnerableMembers.map(capitalize).join(", ")}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="muted">No super-effective weaknesses found across the team.</p>
        )}
      </div>

      {analysis.defensiveResistances.length > 0 && (
        <div className="battle-section">
          <h3><TrendingDown size={16} /> Defensive resistances</h3>
          <p className="muted">Types your team resists — incoming damage is reduced.</p>
          <div className="battle-chip-grid">
            {analysis.defensiveResistances.map((entry) => (
              <TypeBadge key={entry.typeId} typeId={entry.typeId} schema={schema} />
            ))}
          </div>
        </div>
      )}

      {analysis.uncoveredTypes.length > 0 && (
        <div className="battle-section">
          <h3><TrendingUp size={16} /> Coverage gaps</h3>
          <p className="muted">Types your team cannot hit super-effectively. Consider adding a Pokemon that covers these.</p>
          <div className="battle-chip-grid">
            {analysis.uncoveredTypes.map((entry) => (
              <TypeBadge key={entry.typeId} typeId={entry.typeId} schema={schema} />
            ))}
          </div>
        </div>
      )}

      <SuggestionsPanel analysis={analysis} schema={schema} onAddPokemon={onAddPokemon} />
    </div>
  );
}
