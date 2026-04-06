// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { SourceReference, DataStatus } from "../../lib/encyclopedia-schema";
import { sanitizeExternalUrl } from "../../lib/security";

type ArticleSupportPanelProps = {
  tabs: Array<{ id: string; label: string; status?: DataStatus }>;
  status: DataStatus;
  sourceRefs: SourceReference[];
  expansionNotes?: string[];
};

export function ArticleSupportPanel({ tabs, status, sourceRefs, expansionNotes }: ArticleSupportPanelProps) {
  return (
    <aside className="article-support-panel">
      <section className="support-card">
        <p className="eyebrow">On this page</p>
        <div className="support-link-list">
          {tabs.map((tab) => (
            <a key={tab.id} href={`#${tab.id}`} className="support-link">
              <span className="support-link-text">{tab.label}</span>
              {tab.status ? <span className="status-badge">{tab.status}</span> : null}
            </a>
          ))}
        </div>
      </section>
      <section className="support-card">
        <p className="eyebrow">Data status</p>
        <div className="chip-grid">
          <span className="entity-chip">
            <strong>Status</strong>
            <span>{status}</span>
          </span>
          <span className="entity-chip">
            <strong>Sources</strong>
            <span>{sourceRefs.length}</span>
          </span>
        </div>
        <div className="support-source-list">
          {sourceRefs.map((source, index) => {
            const safeUrl = sanitizeExternalUrl(source.url);
            return safeUrl ? (
              <a key={`${source.label}-${index}`} className="support-source support-source-link" href={safeUrl} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer">
                <strong>{source.label}</strong>
                <span>{source.sourceType}</span>
              </a>
            ) : (
              <div key={`${source.label}-${index}`} className="support-source">
                <strong>{source.label}</strong>
                <span>{source.sourceType}</span>
              </div>
            );
          })}
        </div>
        {expansionNotes?.length ? (
          <ul className="text-list">
            {expansionNotes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        ) : null}
      </section>
    </aside>
  );
}
