import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { getGameBySlug, listLocations } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function GameLocationIndexPage() {
  const { gameSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { schema } = useEncyclopediaData();
  const game = getGameBySlug(schema, gameSlug);
  const query = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "name";
  useDocumentTitle(game ? `${game.name} Locations` : "Locations");
  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;

  const locations = useMemo(
    () => listLocations(schema).filter((location) => location.gameVersionIds.includes(game.id)),
    [game.id, schema],
  );
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...locations].filter((location) => {
      if (!normalizedQuery) return true;

      const regionName = location.regionId ? schema.regions[location.regionId]?.name ?? "" : "";
      return `${location.name} ${regionName} ${location.mapLabel ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery);
    }).sort((left, right) => {
      if (sort === "encounters") {
        return right.encounterTable.length - left.encounterTable.length
          || left.name.localeCompare(right.name);
      }

      return left.name.localeCompare(right.name);
    });
  }, [locations, query, schema.regions, sort]);

  function updateParam(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || (key === "sort" && value === "name")) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name, href: encyclopediaRoutes.game(game.slug) }, { label: "Locations" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name} Locations</h1>
          <p className="lead">Locations linked to this game context, with sorting for quick encounter-heavy research.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Locations shown</span></div>
          <div><strong>{filtered.reduce((sum, location) => sum + location.encounterTable.length, 0)}</strong><span>Encounter rows</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Search
              <input value={query} onChange={(event) => updateParam({ q: event.target.value })} placeholder="Location or map label" />
            </label>
            <label>
              Sort
              <select value={sort} onChange={(event) => updateParam({ sort: event.target.value })}>
                <option value="name">Name</option>
                <option value="encounters">Encounter count</option>
              </select>
            </label>
          </div>

          <div className="quick-filter-strip">
            <span className="quick-filter-label">Browse</span>
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>

        {!filtered.length ? (
          <div className="empty-results-panel">
            <strong>No locations matched this game filter set.</strong>
            <p className="muted">Try searching with a broader term or switch back to name sorting.</p>
          </div>
        ) : (
          <div className="location-table">
            <div className="location-table-head">
              <span>Location</span>
              <span>Region</span>
              <span>Map label</span>
              <span>Encounter rows</span>
            </div>
            {filtered.map((location) => (
              <GameScopedLink key={location.id} to={encyclopediaRoutes.location(location.slug)} preserveGame={false} className="location-row">
                <strong>{location.name}</strong>
                <span>{location.regionId ? schema.regions[location.regionId]?.name ?? "Region unknown" : "Region unknown"}</span>
                <span>{location.mapLabel ?? "None listed"}</span>
                <span>{location.encounterTable.length}</span>
              </GameScopedLink>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
