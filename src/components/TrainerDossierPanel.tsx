import { ExternalLink } from "lucide-react";
import { capitalize } from "../lib/format";
import { sanitizeExternalUrl } from "../lib/security";
import type { TrainerDossier } from "../lib/types";
import { TrainerSprite } from "./TrainerSprite";

type Props = {
  dossiers: TrainerDossier[];
};

export function TrainerDossierPanel({ dossiers }: Props) {
  if (dossiers.length === 0) {
    return (
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Offline trainer dossiers</p>
            <h2>Trainer Intel</h2>
            <p className="muted">No trainers match the current archive filters.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Offline trainer dossiers</p>
          <h2>Trainer Intel</h2>
          <p className="muted">Local summaries built from the preset archive and Bulbapedia-linked source records.</p>
        </div>
      </div>

      <div className="trainer-dossier-grid">
        {dossiers.map((dossier) => {
          const safeSourceUrl = dossier.source ? sanitizeExternalUrl(dossier.source.url) : null;

          return (
            <article key={dossier.trainer} className="trainer-dossier-card">
              <div className="trainer-dossier-header">
                <TrainerSprite trainer={dossier.trainer} region={dossier.region} />
                <div className="trainer-dossier-copy">
                  <strong>{dossier.trainer}</strong>
                  <p className="muted">
                    {dossier.region} · {dossier.sourceGames[0]}
                  </p>
                  <div className="preset-meta-row">
                    <span className="mini-badge">{dossier.presetCount} presets</span>
                    <span className="mini-badge">{dossier.canonicalCount} canonical</span>
                    {dossier.inspiredCount > 0 ? <span className="mini-badge">{dossier.inspiredCount} inspired</span> : null}
                    <span className="mini-badge">Ace: {capitalize(dossier.acePokemonName)}</span>
                  </div>
                  {safeSourceUrl ? (
                    <a className="source-link" href={safeSourceUrl} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer">
                      <ExternalLink size={14} />
                      {dossier.source?.label}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="preset-stat-grid">
                <div>
                  <strong>{dossier.uniqueTypeCount}</strong>
                  <span>Types used</span>
                </div>
                <div>
                  <strong>{dossier.teamMemberCount}</strong>
                  <span>Roster slots</span>
                </div>
                <div>
                  <strong>{dossier.totalMoveGroups}</strong>
                  <span>Move groups</span>
                </div>
                <div>
                  <strong>{dossier.specialPokemonCount}</strong>
                  <span>Legend/Mythic</span>
                </div>
              </div>
              <p className="small-copy">
                <strong>Battle roles:</strong> {dossier.categories.join(", ")}
              </p>
              <p className="small-copy">
                <strong>Appearances:</strong> {dossier.battleLabels.join(", ")}
              </p>
              <p className="small-copy">
                <strong>Archive tags:</strong> {dossier.tags.join(", ")}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
