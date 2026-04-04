import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { listGames, searchEntities } from "../../lib/encyclopedia";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { schema } = useEncyclopediaData();
  const kindFilter = searchParams.get("kind") ?? "all";
  const gameFilter = searchParams.get("game") ?? "all";
  const allResults = useMemo(() => searchEntities(schema, query), [query, schema]);
  const games = useMemo(() => listGames(schema), [schema]);
  const results = useMemo(
    () =>
      allResults
        .filter((result) => {
          const kindPass = kindFilter === "all" || result.kind === kindFilter;
          const gamePass = gameFilter === "all"
            || (result.kind === "game"
              ? result.slug === gameFilter
              : result.gameIds.some((id) => id === `game:${gameFilter}`));
          return kindPass && gamePass;
        })
        .slice(0, 30),
    [allResults, gameFilter, kindFilter],
  );
  const countsByKind = useMemo(
    () =>
      allResults.reduce<Record<string, number>>((accumulator, result) => {
        accumulator[result.kind] = (accumulator[result.kind] ?? 0) + 1;
        return accumulator;
      }, {}),
    [allResults],
  );
  const kindOptions = ["all", "pokemon", "move", "ability", "item", "region", "type", "game", "location"];

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Search index</p>
          <h1>Search and filter results</h1>
          <p className="lead">Fuzzy search across linked entities with result-type filtering and direct route jumps.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{results.length}</strong><span>Visible results</span></div>
          <div><strong>{countsByKind.pokemon ?? 0}</strong><span>Pokemon hits</span></div>
          <div><strong>{countsByKind.move ?? 0}</strong><span>Move hits</span></div>
          <div><strong>{countsByKind.region ?? 0}</strong><span>Region hits</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="section-topline">
          <div>
            <h2>Query the encyclopedia</h2>
            <p className="muted">Search species, moves, abilities, items, regions, types, games, and locations.</p>
          </div>
          <div className="inline-filter-row">
            <label>
              Query
              <input
                value={query}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value) next.set("q", event.target.value);
                  else next.delete("q");
                  setSearchParams(next);
                }}
                placeholder="Search Pokemon, moves, abilities, items, regions, types, games, and locations"
              />
            </label>
            <label>
              Kind
              <select
                value={kindFilter}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value === "all") next.delete("kind");
                  else next.set("kind", event.target.value);
                  setSearchParams(next);
                }}
              >
                {kindOptions.map((option) => <option key={option} value={option}>{option === "all" ? "All entities" : option}</option>)}
              </select>
            </label>
            <label>
              Game
              <select
                value={gameFilter}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value === "all") next.delete("game");
                  else next.set("game", event.target.value);
                  setSearchParams(next);
                }}
              >
                <option value="all">All games</option>
                {games.map((game) => <option key={game.id} value={game.slug}>{game.shortName}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="chip-grid">
          <span className="entity-chip"><strong>Game</strong><span>{gameFilter === "all" ? "All games" : games.find((game) => game.slug === gameFilter)?.shortName ?? gameFilter}</span></span>
          {kindOptions.filter((option) => option !== "all").map((option) => (
            <span key={option} className="entity-chip">
              <strong>{option}</strong>
              <span>{countsByKind[option] ?? 0}</span>
            </span>
          ))}
        </div>
        <div className="search-results-grid">
          {results.map((result) => (
            <GameScopedLink key={`${result.kind}-${result.slug}`} to={result.href} className="search-result-card">
              <span className="eyebrow">{result.kind}</span>
              <strong>{result.title}</strong>
              <span>{result.subtitle}</span>
            </GameScopedLink>
          ))}
        </div>
      </section>
    </main>
  );
}
