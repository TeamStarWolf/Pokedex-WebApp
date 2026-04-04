import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { getGameBySlug, listLocations } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function GameLocationIndexPage() {
  const { gameSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const game = getGameBySlug(schema, gameSlug);
  useDocumentTitle(game ? `${game.name} Locations` : "Locations");
  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;

  const locations = useMemo(
    () => listLocations(schema).filter((location) => location.gameVersionIds.includes(game.id)),
    [game.id, schema],
  );

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name, href: encyclopediaRoutes.game(game.slug) }, { label: "Locations" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name} Locations</h1>
          <p className="lead">Locations linked to this game context.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{locations.length}</strong><span>Locations</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="search-results-grid">
          {locations.map((location) => (
            <GameScopedLink key={location.id} to={encyclopediaRoutes.location(location.slug)} preserveGame={false} className="search-result-card">
              <span className="eyebrow">Location</span>
              <strong>{location.name}</strong>
              <span>{location.regionId ? schema.regions[location.regionId]?.name ?? "Region unknown" : "Region unknown"}</span>
            </GameScopedLink>
          ))}
        </div>
      </section>
    </main>
  );
}
