// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getPokemonByRegion, getRegionBySlug } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "games", label: "Games" },
  { id: "locations", label: "Locations" },
  { id: "species", label: "Species" },
];

export function RegionPage() {
  const { regionSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const region = getRegionBySlug(schema, regionSlug);
  useDocumentTitle(region?.name ?? "Region");
  if (!region) return <main className="encyclopedia-page"><section className="content-card"><h1>Region not found</h1></section></main>;

  const residents = getPokemonByRegion(schema, region.id);
  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Regions", href: "/regions" }, { label: region.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Region article</p>
          <h1>{region.name}</h1>
          <p className="lead">Regional overview with linked games, locations, and the current species slice tied to this area.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{region.locationIds.length}</strong><span>Locations</span></div>
          <div><strong>{region.gameVersionIds.length}</strong><span>Games</span></div>
          <div><strong>{residents.length}</strong><span>Seeded species</span></div>
          <div><strong>{region.generationLabel}</strong><span>Generation</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={region.name}
          subtitle="Region page"
          rows={[
            { label: "Generation", value: region.generationLabel },
            { label: "Debut game", value: region.introducedInGameId ? <Link to={encyclopediaRoutes.game(region.introducedInGameId.replace("game:", ""))}>{schema.gameVersions[region.introducedInGameId]?.name}</Link> : "Unknown" },
            { label: "Games", value: region.gameVersionIds.map((id) => schema.gameVersions[id]?.shortName).filter(Boolean).join(", ") || "Unknown" },
            { label: "Locations", value: region.locationIds.length },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={region.status} sourceRefs={region.sourceRefs} expansionNotes={region.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="overview" className="content-card">
            <h2>Overview</h2>
            <div className="reference-grid">
              <div>
                <p>{region.summary}</p>
              </div>
              <div>
                <div className="chip-grid">
                  <span className="entity-chip"><strong>Generation label</strong><span>{region.generationLabel}</span></span>
                  <span className="entity-chip"><strong>Locations</strong><span>{region.locationIds.length}</span></span>
                  <span className="entity-chip"><strong>Games</strong><span>{region.gameVersionIds.length}</span></span>
                </div>
              </div>
            </div>
          </section>
          <section id="games" className="content-card">
            <h2>Game coverage</h2>
            <div className="chip-grid">
              {region.gameVersionIds.map((id) => schema.gameVersions[id] ? (
                <Link key={id} to={encyclopediaRoutes.game(schema.gameVersions[id].slug)} className="entity-chip">
                  <strong>{schema.gameVersions[id].name}</strong>
                  <span>{schema.gameVersions[id].platform ?? "Platform unknown"}</span>
                </Link>
              ) : null)}
            </div>
          </section>
          <section id="locations" className="content-card">
            <h2>Locations</h2>
            <div className="chip-grid">
              {region.locationIds.map((id) => schema.locations[id] ? <Link key={id} to={encyclopediaRoutes.location(schema.locations[id].slug)} className="entity-chip"><strong>{schema.locations[id].name}</strong></Link> : null)}
            </div>
          </section>
          <section id="species" className="content-card">
            <h2>Pokemon in seeded regional slice</h2>
            <div className="search-results-grid">
              {residents.map((species) => <Link key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} className="search-result-card"><span className="eyebrow">Pokemon</span><strong>{species.name}</strong><span>{species.categoryLabel}</span></Link>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
