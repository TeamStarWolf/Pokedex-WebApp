import { useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { listGames } from "../../lib/encyclopedia";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

function withGameQuery(pathname: string, searchParams: URLSearchParams, gameSlug: string) {
  const next = new URLSearchParams(searchParams);
  if (gameSlug === "all") next.delete("game");
  else next.set("game", gameSlug);
  const query = next.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

export function GameContextBar() {
  const { schema } = useEncyclopediaData();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const games = useMemo(() => listGames(schema).slice(0, 10), [schema]);
  const activeGame = searchParams.get("game") ?? "all";
  if (location.pathname === "/") return null;

  return (
    <section className="game-context-bar">
      <div className="game-context-copy">
        <span className="eyebrow">Game context</span>
        <strong>{activeGame === "all" ? "All games" : games.find((game) => game.slug === activeGame)?.shortName ?? activeGame}</strong>
      </div>
      <div className="game-context-links">
        <Link to={withGameQuery(location.pathname, searchParams, "all")} className={`subnav-link ${activeGame === "all" ? "active-context" : ""}`}>All</Link>
        {games.map((game) => (
          <Link
            key={game.id}
            to={withGameQuery(location.pathname, searchParams, game.slug)}
            className={`subnav-link ${activeGame === game.slug ? "active-context" : ""}`}
          >
            {game.shortName}
          </Link>
        ))}
        <Link to="/games" className="subnav-link">Browse games</Link>
      </div>
    </section>
  );
}
