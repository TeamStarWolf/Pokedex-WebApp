import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { useEncyclopediaData, usePokemonDetailData } from "../../hooks/useEncyclopediaData";
import { formatHeight, formatWeight, getFormBySlug, getSpeciesBySlug, groupLearnsetByMethod } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "stats", label: "Stats" },
  { id: "learnset", label: "Learnset" },
];

export function PokemonFormPage() {
  const { speciesSlug = "", formSlug = "" } = useParams();
  const { schema: indexSchema } = useEncyclopediaData();
  const { schema } = usePokemonDetailData(speciesSlug);
  const species = getSpeciesBySlug(schema, speciesSlug) ?? getSpeciesBySlug(indexSchema, speciesSlug);
  const form = getFormBySlug(schema, speciesSlug, formSlug);

  if (!species || !form) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Form not found</h1></section></main>;
  }

  const learnsetGroups = groupLearnsetByMethod(schema, form);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "National Dex", href: encyclopediaRoutes.nationalDex() }, { label: species.name, href: encyclopediaRoutes.pokemon(species.slug) }, { label: form.formName }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Form article</p>
          <h1>{species.name} {form.formName === "Standard" ? "" : form.formName}</h1>
          <p className="lead">Dedicated form page with its own typing, stats, and learnset slice.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{form.formKind}</strong><span>Form kind</span></div>
          <div><strong>{form.typeIds.length}</strong><span>Types</span></div>
          <div><strong>{form.learnset.length}</strong><span>Moves</span></div>
          <div><strong>{form.availableInGameIds.length}</strong><span>Games</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={`${species.name} ${form.formName === "Standard" ? "" : form.formName}`.trim()}
          subtitle={`${form.formKind} form`}
          media={<img src={form.artworkUrl} alt={form.name} className="hero-art" />}
          badges={form.typeIds.map((typeId) => <Link key={typeId} to={encyclopediaRoutes.type(typeId.replace("type:", ""))} className="type-chip muted-chip">{schema.types[typeId]?.name ?? typeId.replace("type:", "")}</Link>)}
          rows={[
            { label: "Species", value: <Link to={encyclopediaRoutes.pokemon(species.slug)}>{species.name}</Link> },
            { label: "Form name", value: form.formName },
            { label: "Height", value: formatHeight(form.heightDecimetres) },
            { label: "Weight", value: formatWeight(form.weightHectograms) },
            { label: "Games", value: form.availableInGameIds.map((gameId) => schema.gameVersions[gameId]?.shortName).filter(Boolean).join(", ") || "Unknown" },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={form.status} sourceRefs={form.sourceRefs} expansionNotes={form.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="overview" className="content-card">
            <h2>Overview</h2>
            <div className="reference-grid">
              <div>
                <p>{form.summary}</p>
              </div>
              <div>
                <div className="chip-grid">
                  <span className="entity-chip"><strong>Form key</strong><span>{form.formKey}</span></span>
                  <span className="entity-chip"><strong>Default</strong><span>{form.isDefault ? "Yes" : "No"}</span></span>
                  <span className="entity-chip"><strong>Games</strong><span>{form.availableInGameIds.length}</span></span>
                </div>
              </div>
            </div>
          </section>
          <section id="stats" className="content-card">
            <h2>Stats</h2>
            <dl className="stat-grid">
              {Object.entries(form.stats).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
            </dl>
          </section>
          <section id="learnset" className="content-card">
            <h2>Learnset</h2>
            {learnsetGroups.length ? (
              <div className="chip-grid">
                {learnsetGroups.flatMap((group) => group.entries.slice(0, 8)).map((entry) => (
                  <Link key={`${entry.move.id}-${entry.order}`} to={encyclopediaRoutes.move(entry.move.slug)} className="entity-chip">
                    <strong>{entry.move.name}</strong>
                    <span>{entry.game.shortName}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="muted">No learnset data loaded for this form.</p>}
          </section>
        </div>
      </section>
    </main>
  );
}
