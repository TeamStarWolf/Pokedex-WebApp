// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { LoadingSpinner } from "../../components/encyclopedia/LoadingSpinner";
import { TrainerSprite } from "../../components/TrainerSprite";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useTrainerReferenceData } from "../../hooks/useTrainerReferenceData";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { capitalize } from "../../lib/format";

export function TrainerIndexPage() {
  useDocumentTitle("Trainers");
  const { entries, loading, error } = useTrainerReferenceData();

  if (loading) {
    return <LoadingSpinner title="Loading trainers" body="Preparing trainer reference data." />;
  }

  if (error) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer data unavailable</h1><p className="muted">{error}</p></section></main>;
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trainers" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Trainer index</p>
          <h1>Famous Trainers</h1>
          <p className="lead">Browse notable rivals, bosses, gym leaders, champions, and other trainer references with linked team pages.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{entries.length}</strong><span>Trainers</span></div>
          <div><strong>{entries.reduce((sum, entry) => sum + entry.presetCount, 0)}</strong><span>Battle entries</span></div>
          <div><strong>{entries.filter((entry) => entry.canonicalCount > 0).length}</strong><span>Canonical coverage</span></div>
          <div><strong>{new Set(entries.map((entry) => entry.region)).size}</strong><span>Regions</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="search-results-grid">
          {entries.map((entry) => (
            <Link key={entry.slug} to={encyclopediaRoutes.trainer(entry.slug)} className="search-result-card trainer-result-card">
              <div className="trainer-result-top">
                <TrainerSprite trainer={entry.trainer} region={entry.region} />
                <div>
                  <span className="eyebrow">{entry.region}</span>
                  <strong>{entry.trainer}</strong>
                </div>
              </div>
              <span>{entry.categories.slice(0, 2).join(", ")}</span>
              <dl className="trainer-meta-list compact">
                <div><dt>Battles</dt><dd>{entry.presetCount}</dd></div>
                <div><dt>Ace</dt><dd>{capitalize(entry.acePokemonName)}</dd></div>
                <div><dt>Games</dt><dd>{entry.sourceGames.length}</dd></div>
              </dl>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
