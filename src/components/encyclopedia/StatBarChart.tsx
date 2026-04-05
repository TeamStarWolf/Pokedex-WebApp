const STAT_COLORS: Record<string, string> = {
  hp: "#ef4444",
  attack: "#f97316",
  defense: "#eab308",
  "special-attack": "#3b82f6",
  "special-defense": "#8b5cf6",
  speed: "#22c55e",
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const MAX_STAT = 255;

type StatBarChartProps = {
  stats: Record<string, number>;
};

export function StatBarChart({ stats }: StatBarChartProps) {
  const total = Object.values(stats).reduce((sum, value) => sum + value, 0);

  return (
    <div className="stat-bar-list">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="stat-bar-row">
          <span className="stat-bar-label">{STAT_LABELS[key] ?? key}</span>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{
                width: `${Math.min((value / MAX_STAT) * 100, 100)}%`,
                ["--stat-color" as string]: STAT_COLORS[key] ?? "#94a3b8",
              }}
            />
          </div>
          <span className="stat-bar-value">{value}</span>
        </div>
      ))}
      <div className="stat-bar-total">
        <span className="stat-bar-total-label">Total</span>
        <span className="stat-bar-total-value">{total}</span>
      </div>
    </div>
  );
}
