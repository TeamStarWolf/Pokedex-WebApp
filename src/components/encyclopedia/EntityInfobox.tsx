// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { ReactNode } from "react";

type InfoboxRow = {
  label: string;
  value: ReactNode;
};

type EntityInfoboxProps = {
  title: string;
  subtitle?: string;
  media?: ReactNode;
  rows: InfoboxRow[];
  badges?: ReactNode;
  className?: string;
};

export function EntityInfobox({ title, subtitle, media, rows, badges, className = "" }: EntityInfoboxProps) {
  return (
    <aside className={`entity-infobox ${className}`.trim()}>
      <div className="entity-infobox-media">{media}</div>
      <div className="entity-infobox-header">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {badges ? <div className="entity-badge-row">{badges}</div> : null}
      </div>
      <dl className="infobox-grid">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
