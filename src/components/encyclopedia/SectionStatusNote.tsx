// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { DataStatus } from "../../lib/encyclopedia-schema";

type SectionStatusNoteProps = {
  status: DataStatus;
  title: string;
  body: string;
};

export function SectionStatusNote({ status, title, body }: SectionStatusNoteProps) {
  return (
    <div className={`section-status-note status-${status}`}>
      <span className="status-badge">{status}</span>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}
