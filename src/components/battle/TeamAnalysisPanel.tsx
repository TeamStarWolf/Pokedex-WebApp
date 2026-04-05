import { Shield, Swords, Zap } from "lucide-react";
import type { TeamAnalysis } from "../../lib/battleTypes";
import { capitalize } from "../../lib/format";

type Props = {
  analysis: TeamAnalysis;
};

export function TeamAnalysisPanel({ analysis }: Props) {
  return (
    <div className="battle-analysis">
      <div className="stats-cluster">
        <div><strong>{analysis.synergyScore}</strong><span>Synergy score</span></div>
        <div><strong>{analysis.typeSpread}</strong><span>Offensive types</span></div>
        <div><strong>{analysis.bstAverage}</strong><span>Avg. BST</span></div>
        <div><strong>{analysis.specialCount}</strong><span>Legend / Mythic</span></div>
      </div>

      <div className="battle-synergy-bar">
        <div className="battle-synergy-fill" style={{ width: `${analysis.synergyScore}%` }} />
      </div>

      {analysis.doubleWeaknesses.length > 0 ? (
        <div className="battle-alert battle-weakness-critical">
          <strong>4x weakness warning</strong>
          <p className="muted">
            {analysis.doubleWeaknesses.map((entry) => capitalize(entry.typeName)).join(", ")} can deal
            quadruple damage to members of this team.
          </p>
        </div>
      ) : null}

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
              <span className="type-chip muted-chip">{capitalize(entry.typeName)}</span>
              <span className="mono">{entry.bestOffensiveMultiplier.toFixed(1)}x</span>
              <span>{entry.coveringMembers.length > 0 ? entry.coveringMembers.map(capitalize).join(", ") : <span className="muted">None</span>}</span>
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
                <span className="type-chip muted-chip">{capitalize(entry.typeName)}</span>
                <span className="mono">{entry.worstMultiplier}x</span>
                <span>{entry.vulnerableMembers.map(capitalize).join(", ")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No super-effective weaknesses found across the team.</p>
        )}
      </div>

      {analysis.uncoveredTypes.length > 0 ? (
        <div className="battle-section">
          <h3><Zap size={16} /> Gaps in coverage</h3>
          <p className="muted">Types your team cannot hit super-effectively.</p>
          <div className="chip-grid">
            {analysis.uncoveredTypes.map((entry) => (
              <span key={entry.typeId} className="type-chip muted-chip">{capitalize(entry.typeName)}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
