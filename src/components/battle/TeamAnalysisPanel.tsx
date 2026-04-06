import { Shield, Swords, Zap, TrendingUp, TrendingDown } from "lucide-react";
import type { EncyclopediaSchema } from "../../lib/encyclopedia-schema";
import type { TeamAnalysis } from "../../lib/battleTypes";
import { TypeBadge } from "./TypeBadge";
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

export function TeamAnalysisPanel({ analysis, schema }: Props) {
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
    </div>
  );
}
