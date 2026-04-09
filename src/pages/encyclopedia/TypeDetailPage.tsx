// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getPokemonByType, getTypeBySlug } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "matchups", label: "Matchups" },
  { id: "species", label: "Species" },
];

export function TypeDetailPage() {
  const { typeSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const type = getTypeBySlug(schema, typeSlug);
  useDocumentTitle(type?.name ? `${type.name} Type` : "Type");
  if (!type) return <main className="encyclopedia-page"><section className="content-card"><h1>Type not found</h1></section></main>;
  const species = getPokemonByType(schema, type.id);
  // offensiveMatchups: types THIS type deals super-effective damage to.
  // attackingTypeId in this context is the defending type (shared TypeEffectiveness shape).
  const superEffectiveAgainst = type.offensiveMatchups.filter((entry) => entry.multiplier > 1);
  const resistedBy = type.offensiveMatchups.filter((entry) => entry.multiplier > 0 && entry.multiplier < 1);
  const immuneTargets = type.offensiveMatchups.filter((entry) => entry.multiplier === 0);
  // defensiveMatchups: types that deal super-effective damage TO this type.
  const vulnerableTo = type.defensiveMatchups.filter((entry) => entry.multiplier > 1);
  const resistances = type.defensiveMatchups.filter((entry) => entry.multiplier > 0 && entry.multiplier < 1);
  const immunities = type.defensiveMatchups.filter((entry) => entry.multiplier === 0);

  function typeName(typeId: string) {
    return schema.types[typeId as keyof typeof schema.types]?.name ?? typeId.replace("type:", "");
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Types", href: "/types" }, { label: type.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Type article</p>
          <h1>{type.name} Type</h1>
          <p className="lead">Matchup chart, resistances, and all {type.name}-type Pokemon.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{species.length}</strong><span>Species</span></div>
          <div><strong>{superEffectiveAgainst.length}</strong><span>Strong against</span></div>
          <div><strong>{vulnerableTo.length}</strong><span>Weak to</span></div>
          <div><strong>{immunities.length}</strong><span>{immunities.length === 1 ? "Immunity" : "Immunities"}</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={`${type.name} type`}
          subtitle="Type page"
          rows={[
            { label: "Strong against", value: superEffectiveAgainst.map((entry) => typeName(entry.attackingTypeId)).join(", ") || "None" },
            { label: "Weak to", value: vulnerableTo.map((entry) => typeName(entry.attackingTypeId)).join(", ") || "None" },
            { label: "Resists", value: resistances.map((entry) => typeName(entry.attackingTypeId)).join(", ") || "None" },
            { label: "Immune to", value: immunities.map((entry) => typeName(entry.attackingTypeId)).join(", ") || "None" },
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
                      <strong>{typeName(entry.attackingTypeId)}</strong>
                      <span>{entry.multiplier}x</span>
                    </Link>
                  )) : <span className="muted">No super-effective targets.</span>}
                </div>
                {resistedBy.length > 0 && <>
                  <h4>Resisted by</h4>
                  <div className="chip-grid">
                    {resistedBy.map((entry) => (
                      <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                        <strong>{typeName(entry.attackingTypeId)}</strong>
                        <span>{entry.multiplier}x</span>
                      </Link>
                    ))}
                  </div>
                </>}
                {immuneTargets.length > 0 && <>
                  <h4>No effect on</h4>
                  <div className="chip-grid">
                    {immuneTargets.map((entry) => (
                      <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                        <strong>{typeName(entry.attackingTypeId)}</strong>
                        <span>0x</span>
                      </Link>
                    ))}
                  </div>
                </>}
              </div>
              <div>
                <h3>Defensive risk</h3>
                <div className="chip-grid">
                  {vulnerableTo.length ? vulnerableTo.map((entry) => (
                    <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                      <strong>{typeName(entry.attackingTypeId)}</strong>
                      <span>{entry.multiplier}x</span>
                    </Link>
                  )) : <span className="muted">No weaknesses.</span>}
                </div>
                {resistances.length > 0 && <>
                  <h4>Resists</h4>
                  <div className="chip-grid">
                    {resistances.map((entry) => (
                      <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                        <strong>{typeName(entry.attackingTypeId)}</strong>
                        <span>{entry.multiplier}x</span>
                      </Link>
                    ))}
                  </div>
                </>}
                {immunities.length > 0 && <>
                  <h4>Immune to</h4>
                  <div className="chip-grid">
                    {immunities.map((entry) => (
                      <Link key={entry.attackingTypeId} to={encyclopediaRoutes.type(entry.attackingTypeId.replace("type:", ""))} className="entity-chip">
                        <strong>{typeName(entry.attackingTypeId)}</strong>
                        <span>0x</span>
                      </Link>
                    ))}
                  </div>
                </>}
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
