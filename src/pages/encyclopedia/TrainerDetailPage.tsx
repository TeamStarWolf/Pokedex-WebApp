// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { LoadingSpinner } from "../../components/encyclopedia/LoadingSpinner";
import { SectionStatusNote } from "../../components/encyclopedia/SectionStatusNote";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { TrainerSprite } from "../../components/TrainerSprite";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useTrainerArticleData } from "../../hooks/useTrainerReferenceData";
import { capitalize } from "../../lib/format";
import { sanitizeExternalUrl } from "../../lib/security";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { slugify } from "../../lib/encyclopedia";

function summarizeList(values: string[], max = 6) {
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} + ${values.length - max} more`;
}

export function TrainerDetailPage() {
  const { trainerSlug = "" } = useParams();
  const { entry, appearances, pokemonList, loading, error } = useTrainerArticleData(trainerSlug);
  useDocumentTitle(entry?.trainer ?? "Trainer");

  if (loading) {
    return <LoadingSpinner title="Loading trainer" body="Preparing trainer article." />;
  }

  if (error) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer data unavailable</h1><p className="muted">{error}</p></section></main>;
  }

  if (!entry) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer not found</h1></section></main>;
  }

  const pokemonById = new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const));
  const safeSourceUrl = entry.source ? sanitizeExternalUrl(entry.source.url) : null;
  const tabs = [
    { id: "overview", label: "Overview", status: "partial" as const },
    { id: "teams", label: "Teams", status: appearances.length ? "partial" as const : "missing" as const },
    { id: "strategy", label: "How to beat", status: appearances.some((appearance) => appearance.howToBeat.length) ? "partial" as const : "planned" as const },
  ];

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trainers", href: encyclopediaRoutes.trainers() }, { label: entry.trainer }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Trainer article</p>
          <h1>{entry.trainer}</h1>
          <p className="lead">Trainer dossier with battle history, notable teams, ace Pokemon, and matchup notes.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{entry.presetCount}</strong><span>Battle entries</span></div>
          <div><strong>{entry.canonicalCount}</strong><span>Canonical</span></div>
          <div><strong>{capitalize(entry.acePokemonName)}</strong><span>Ace Pokemon</span></div>
          <div><strong>{entry.region}</strong><span>Region</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          className="trainer-infobox"
          title={entry.trainer}
          subtitle="Trainer page"
          media={<TrainerSprite trainer={entry.trainer} region={entry.region} />}
          rows={[
            { label: "Region", value: entry.region },
            { label: "Categories", value: entry.categories.join(", ") },
            { label: "Source games", value: entry.sourceGames.join(", ") },
            {
              label: "Ace Pokemon",
              value: (() => {
                const acePokemon = entry.acePokemonId ? pokemonById.get(entry.acePokemonId) : undefined;
                return acePokemon
                  ? <Link to={encyclopediaRoutes.pokemon(slugify(acePokemon.name))}>{capitalize(entry.acePokemonName)}</Link>
                  : capitalize(entry.acePokemonName);
              })(),
            },
            { label: "Battle count", value: entry.presetCount },
            { label: "Tags", value: entry.tags.join(", ") || "None" },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel
            tabs={tabs}
            status={entry.canonicalCount > 0 ? "partial" : "planned"}
            sourceRefs={entry.source ? [{ label: entry.source.label, sourceType: entry.source.kind, url: entry.source.url, notes: entry.source.note }] : []}
            expansionNotes={["Trainer rosters are built from the preset archive and can expand battle-by-battle over time."]}
          />
          <SectionTabs tabs={tabs} />
          <section id="overview" className="content-card">
            <h2>Overview</h2>
            <SectionStatusNote
              status="partial"
              title="Trainer identity is established"
              body="This article summarizes the trainer well, but biography, chronology, and organization links still need deeper structured imports."
            />
            <div className="reference-grid trainer-overview-grid">
              <article className="overview-panel">
                <h3>Identity</h3>
                <dl className="trainer-meta-list">
                  <div><dt>Region</dt><dd>{entry.region}</dd></div>
                  <div><dt>Categories</dt><dd>{summarizeList(entry.categories, 4)}</dd></div>
                  <div><dt>Ace Pokemon</dt><dd>{capitalize(entry.acePokemonName)}</dd></div>
                </dl>
              </article>
              <article className="overview-panel">
                <h3>Coverage</h3>
                <dl className="trainer-meta-list">
                  <div><dt>Source games</dt><dd>{summarizeList(entry.sourceGames, 4)}</dd></div>
                  <div><dt>Battle labels</dt><dd>{summarizeList(entry.battleLabels, 5)}</dd></div>
                  <div><dt>Tags</dt><dd>{entry.tags.length ? summarizeList(entry.tags, 6) : "None"}</dd></div>
                </dl>
              </article>
              <article className="overview-panel">
                <h3>Archive data</h3>
                <dl className="trainer-meta-list">
                  <div><dt>Total battles</dt><dd>{entry.presetCount}</dd></div>
                  <div><dt>Canonical</dt><dd>{entry.canonicalCount}</dd></div>
                  <div><dt>Inspired</dt><dd>{entry.inspiredCount}</dd></div>
                </dl>
              </article>
              <article className="overview-panel">
                <h3>Battle profile</h3>
                <dl className="trainer-meta-list">
                  <div><dt>Difficulties</dt><dd>{entry.difficulties.join(", ")}</dd></div>
                  <div><dt>Unique types</dt><dd>{entry.uniqueTypeCount}</dd></div>
                  <div><dt>Legendary or mythical slots</dt><dd>{entry.specialPokemonCount}</dd></div>
                </dl>
              </article>
            </div>
            <div className="chip-grid">
              {(() => {
                const acePokemon = entry.acePokemonId ? pokemonById.get(entry.acePokemonId) : undefined;
                return acePokemon ? (
                  <Link to={encyclopediaRoutes.pokemon(slugify(acePokemon.name))} className="entity-chip">
                    <strong>{capitalize(entry.acePokemonName)}</strong>
                    <span>Ace Pokemon page</span>
                  </Link>
                ) : null;
              })()}
              {safeSourceUrl ? (
                <a href={safeSourceUrl} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer" className="entity-chip">
                  <strong>{entry.source?.label}</strong>
                  <span>External reference</span>
                </a>
              ) : null}
            </div>
          </section>
          <section id="teams" className="content-card">
            <h2>Appearances</h2>
            <SectionStatusNote
              status={appearances.length ? "partial" : "missing"}
              title={appearances.length ? "Battle archive is available" : "Battle archive is missing"}
              body={appearances.length
                ? "Game-specific appearances are split out cleanly now, but the roster is still only as complete as the imported trainer archive."
                : "No battle appearances were resolved for this trainer yet."}
            />
            <div className="trainer-team-list">
              {appearances.map((appearance) => (
                <article key={appearance.slug} className="trainer-team-card">
                  <div className="trainer-team-card-top">
                    <div>
                      <strong>{appearance.name}</strong>
                      <p className="muted">{appearance.sourceGame}</p>
                    </div>
                    <span className="mini-badge">{appearance.difficulty}</span>
                  </div>
                  <p className="small-copy">{appearance.description}</p>
                  <dl className="trainer-meta-list compact">
                    <div><dt>Battle</dt><dd>{appearance.battleLabel}</dd></div>
                    <div><dt>Type</dt><dd>{appearance.canonical ? "Canonical" : "Inspired"}</dd></div>
                    <div><dt>Region</dt><dd>{appearance.region}</dd></div>
                  </dl>
                  <Link
                    to={encyclopediaRoutes.trainerAppearance(entry.slug, appearance.slug)}
                    className="entity-chip trainer-appearance-link"
                  >
                    <strong>Open appearance page</strong>
                    <span>{appearance.sourceGame}</span>
                  </Link>
                  <div className="chip-grid">
                    {appearance.members.map((memberId) => {
                      const pokemon = pokemonById.get(memberId);
                      if (!pokemon) return null;
                      return (
                        <Link key={`${appearance.slug}-${memberId}`} to={encyclopediaRoutes.pokemon(slugify(pokemon.name))} className="entity-chip">
                          <strong>{capitalize(pokemon.name)}</strong>
                          <span>{pokemon.types.join(" / ")}</span>
                        </Link>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section id="strategy" className="content-card">
            <h2>How to beat</h2>
            <SectionStatusNote
              status={appearances.some((appearance) => appearance.howToBeat.length) ? "partial" : "planned"}
              title="Strategy notes are seeded"
              body="These matchup notes are useful starting points, but they are still curated summaries rather than full competitive breakdowns for every appearance."
            />
            <div className="trainer-team-list">
              {appearances.map((appearance) => (
                <article key={`${appearance.slug}-strategy`} className="trainer-team-card">
                  <strong>{appearance.name}</strong>
                  <p className="muted">{appearance.sourceGame} · {appearance.battleLabel}</p>
                  <ul className="text-list">
                    {appearance.howToBeat.map((tip) => <li key={`${appearance.slug}-${tip}`}>{tip}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
