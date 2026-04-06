// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
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

type GameGroup = {
  generation: number;
  games: { id: string; slug: string; shortName: string }[];
};

export function GameContextBar() {
  const { schema } = useEncyclopediaData();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const games = useMemo(() => listGames(schema), [schema]);
  const activeGame = searchParams.get("game") ?? "all";

  const gameGroups = useMemo(() => {
    const groups = new Map<number, GameGroup>();
    for (const game of games) {
      const gen = (schema.gameVersions[game.id] as { generation?: number } | undefined)?.generation ?? 0;
      let group = groups.get(gen);
      if (!group) {
        group = { generation: gen, games: [] };
        groups.set(gen, group);
      }
      group.games.push(game);
    }
    return Array.from(groups.values()).sort((a, b) => a.generation - b.generation);
  }, [games, schema]);

  if (location.pathname === "/") return null;

  return (
    <section className="game-context-bar">
      <div className="game-context-copy">
        <span className="eyebrow">Game context</span>
        <strong>{activeGame === "all" ? "All games" : games.find((game) => game.slug === activeGame)?.shortName ?? activeGame}</strong>
      </div>
      <div className="game-context-links">
        <Link to={withGameQuery(location.pathname, searchParams, "all")} className={`subnav-link ${activeGame === "all" ? "active-context" : ""}`}>All</Link>
        {gameGroups.map((group) => (
          <div key={group.generation} className="game-gen-group">
            <span className="game-gen-label">Gen {group.generation || "?"}</span>
            {group.games.map((game) => (
              <Link
                key={game.id}
                to={withGameQuery(location.pathname, searchParams, game.slug)}
                className={`subnav-link ${activeGame === game.slug ? "active-context" : ""}`}
              >
                {game.shortName}
              </Link>
            ))}
          </div>
        ))}
        <Link to="/games" className="subnav-link">All games</Link>
      </div>
    </section>
  );
}
