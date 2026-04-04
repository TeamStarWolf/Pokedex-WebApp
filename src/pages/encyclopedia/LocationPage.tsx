import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { PlaceholderBlock } from "../../components/encyclopedia/PlaceholderBlock";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getLocationBySlug } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "encounters", label: "Encounters" },
  { id: "games", label: "Games" },
];

export function LocationPage() {
  const { locationSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const location = getLocationBySlug(schema, locationSlug);
  if (!location) return <main className="encyclopedia-page"><section className="content-card"><h1>Location not found</h1></section></main>;

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: location.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Location article</p>
          <h1>{location.name}</h1>
          <p className="lead">Location entry with regional context, encounter coverage, and linked game presence.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{location.encounterTable.length}</strong><span>Encounters</span></div>
          <div><strong>{location.gameVersionIds.length}</strong><span>Games</span></div>
          <div><strong>{location.mapLabel ?? "?"}</strong><span>Map label</span></div>
          <div><strong>{location.regionId ? (schema.regions[location.regionId]?.name ?? "?") : "?"}</strong><span>Region</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox title={location.name} subtitle="Location page" rows={[
          { label: "Region", value: location.regionId ? <Link to={encyclopediaRoutes.region(location.regionId.replace("region:", ""))}>{schema.regions[location.regionId]?.name}</Link> : "Unknown" },
          { label: "Map label", value: location.mapLabel ?? "Unknown" },
          { label: "Games", value: location.gameVersionIds.map((id) => schema.gameVersions[id]?.shortName).filter(Boolean).join(", ") || "Unknown" },
        ]} />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={location.status} sourceRefs={location.sourceRefs} expansionNotes={location.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="overview" className="content-card">
            <h2>Overview</h2>
            <div className="reference-grid">
              <div>
                <p>{location.summary}</p>
              </div>
              <div>
                <div className="chip-grid">
                  {location.regionId ? (
                    <Link to={encyclopediaRoutes.region(location.regionId.replace("region:", ""))} className="entity-chip">
                      <strong>{schema.regions[location.regionId]?.name ?? location.regionId.replace("region:", "")}</strong>
                      <span>Region page</span>
                    </Link>
                  ) : <span className="muted">No region linked yet.</span>}
                  {location.parentLocationId && schema.locations[location.parentLocationId] ? (
                    <Link to={encyclopediaRoutes.location(schema.locations[location.parentLocationId].slug)} className="entity-chip">
                      <strong>{schema.locations[location.parentLocationId].name}</strong>
                      <span>Parent location</span>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
          <section id="encounters" className="content-card">
            <h2>Encounter slice</h2>
            {location.encounterTable.length ? (
              <div className="location-table" role="table" aria-label="Encounter table">
                <div className="location-table-head" role="row">
                  <span>Pokemon</span>
                  <span>Game</span>
                  <span>Method</span>
                  <span>Level</span>
                </div>
                {location.encounterTable.map((encounter) => {
                  const form = schema.forms[encounter.pokemonFormId];
                  const species = form ? schema.pokemon[form.speciesId] : null;
                  return (
                    <div key={`${encounter.pokemonFormId}-${encounter.gameVersionId}-${encounter.method}`} className="location-row" role="row">
                      <span>
                        {species ? <Link to={encyclopediaRoutes.pokemon(species.slug)}><strong>{form?.name ?? encounter.pokemonFormId}</strong></Link> : <strong>{encounter.pokemonFormId}</strong>}
                      </span>
                      <span>{schema.gameVersions[encounter.gameVersionId]?.shortName ?? encounter.gameVersionId.replace("game:", "")}</span>
                      <span>{encounter.method}</span>
                      <span>{encounter.levelRange ? `${encounter.levelRange.min}-${encounter.levelRange.max}` : "Unknown"}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <PlaceholderBlock title="Encounter table pending" body="No encounter table is seeded for this location yet. The page is ready for per-game encounter imports." />
            )}
          </section>
          <section id="games" className="content-card">
            <h2>Games</h2>
            <div className="chip-grid">
              {location.gameVersionIds.length ? location.gameVersionIds.map((gameId) => (
                <Link key={gameId} to={encyclopediaRoutes.game(gameId.replace("game:", ""))} className="entity-chip">
                  <strong>{schema.gameVersions[gameId]?.name ?? gameId.replace("game:", "")}</strong>
                  <span>{schema.gameVersions[gameId]?.shortName ?? ""}</span>
                </Link>
              )) : <span className="muted">No games linked yet.</span>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
