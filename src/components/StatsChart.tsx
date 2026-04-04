import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { capitalize, statLabels } from "../lib/format";

type Props = {
  stats: Array<{ name: string; value: number }>;
};

export function StatsChart({ stats }: Props) {
  const data = stats.map((stat) => ({
    stat: statLabels[stat.name] ?? capitalize(stat.name),
    value: stat.value,
  }));

  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 255]} tick={{ fontSize: 10 }} />
          <Radar dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
