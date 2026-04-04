import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getPokemonByType, getTypeBySlug } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "matchups", label: "Matchups" },
  { id: "species", label: "Species" },
];

export function TypeDetailPage() {
  const { typeSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const type = getTypeBySlug(schema, typeSlug);
  if (!type) return <main className="encyclopedia-page"><section className="content-card"><h1>Type not found</h1></section></main>;
  const species = getPokemonByType(schema, type.id);
  // offensiveMatchups: types THIS type deals super-effective damage to.
  // attackingTypeId in this context is the defending type (shared TypeEffectiveness shape).
  const superEffectiveAgainst = type.offensiveMatchups.filter((entry) => entry.multiplier > 1);
  // defensiveMatchups: types that deal super-effective damage TO this type.
  const vulnerableTo = type.defensiveMatchups.filter((entry) => entry.multiplier > 1);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Types", href: "/types" }, { label: type.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Type article</p>
          <h1>{type.name} Type</h1>
          <p className="lead">Type page with matchup context and linked species currently represented in the encyclopedia dataset.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{species.length}</strong><span>Species</span></div>
          <div><strong>{superEffectiveAgainst.length}</strong><span>Strong against</span></div>
          <div><strong>{vulnerableTo.length}</strong><span>Weak to</span></div>
          <div><strong>{type.status}</strong><span>Import state</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={`${type.name} type`}
          subtitle="Type page"
          rows={[
            { label: "Strong against", value: superEffectiveAgainst.map((entry) => entry.attackingTypeId.replace("type:", "")).join(", ") || "Seed pending" },
            { label: "Weak to", value: vulnerableTo.map((entry) => entry.attackingTypeId.replace("type:", "")).join(", ") || "Seed pending" },
          ]}
          badges={<span className="type-chip" style={{ ["--type-color" as string]: type.colorToken }}>{type.name}</span>}
        />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={type.status} sourceRefs={type.sourceRefs} expansionNotes={type.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="matchups" className="content-card">
            <h2>Matchup overview</h2>
            <div className="reference-grid">
              <div>
                <h3>Offensive pressure</h3>
                <div className="chip-grid">
                  {superEffectiveAgainst.length ? superEffectiveAgainst.map((entry) => (
                    <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                      <strong>{schema.types[entry.attackingTypeId]?.name ?? entry.attackingTypeId.replace("type:", "")}</strong>
                      <span>{entry.multiplier}x</span>
                    </Link>
                  )) : <span className="muted">No matchup data seeded yet.</span>}
                </div>
              </div>
              <div>
                <h3>Defensive risk</h3>
                <div className="chip-grid">
                  {vulnerableTo.length ? vulnerableTo.map((entry) => (
                    <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                      <strong>{schema.types[entry.attackingTypeId]?.name ?? entry.attackingTypeId.replace("type:", "")}</strong>
                      <span>{entry.multiplier}x</span>
                    </Link>
                  )) : <span className="muted">No matchup data seeded yet.</span>}
                </div>
              </div>
            </div>
          </section>
          <section id="species" className="content-card">
            <h2>Pokemon of this type</h2>
            <div className="search-results-grid">
              {species.map((entry) => <Link key={entry.id} to={encyclopediaRoutes.pokemon(entry.slug)} className="search-result-card"><span className="eyebrow">Pokemon</span><strong>{entry.name}</strong><span>{entry.categoryLabel}</span></Link>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
