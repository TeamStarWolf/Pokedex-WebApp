import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { buildSearchIndex, fuzzyScore, listGames } from "../../lib/encyclopedia";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { capitalize } from "../../lib/format";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  useDocumentTitle(query ? `Search: ${query}` : "Search");
  const { schema } = useEncyclopediaData();
  const kindFilter = searchParams.get("kind") ?? "all";
  const gameFilter = searchParams.get("game") ?? "all";
  const sort = searchParams.get("sort") ?? "relevance";
  const searchIndex = useMemo(() => buildSearchIndex(schema), [schema]);
  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchIndex
      .map((entry) => ({ ...entry, score: fuzzyScore(query, `${entry.title} ${entry.subtitle}`) }))
      .filter((entry) => entry.score >= 0)
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
  }, [searchIndex, query]);
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
        .sort((left, right) => {
          if (sort === "name") return left.title.localeCompare(right.title) || right.score - left.score;
          if (sort === "kind") return left.kind.localeCompare(right.kind) || right.score - left.score;
          return right.score - left.score || left.title.localeCompare(right.title);
        })
        .slice(0, 40),
    [allResults, gameFilter, kindFilter, sort],
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
  const quickKinds = kindOptions
    .filter((option) => option !== "all")
    .map((option) => [option, countsByKind[option] ?? 0] as const)
    .filter(([, count]) => count > 0)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8);
  const totalBeforeSlice = allResults.filter((result) => {
    const kindPass = kindFilter === "all" || result.kind === kindFilter;
    const gamePass = gameFilter === "all"
      || (result.kind === "game" ? result.slug === gameFilter : result.gameIds.some((id) => id === `game:${gameFilter}`));
    return kindPass && gamePass;
  }).length;
  const gamesById = useMemo(() => new Map<string, (typeof games)[number]>(games.map((game) => [game.id, game])), [games]);

  function updateParams(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "relevance")) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

  function resetFilters() {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query);
    setSearchParams(next);
  }

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
        </div>
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Query
              <input
                value={query}
                onChange={(event) => {
                  updateParams({ q: event.target.value });
                }}
                placeholder="Search Pokemon, moves, abilities, items, regions, types, games, and locations"
              />
            </label>
            <label>
              Kind
              <select
                value={kindFilter}
                onChange={(event) => updateParams({ kind: event.target.value })}
              >
                {kindOptions.map((option) => <option key={option} value={option}>{option === "all" ? "All entities" : capitalize(option)}</option>)}
              </select>
            </label>
            <label>
              Game
              <select
                value={gameFilter}
                onChange={(event) => updateParams({ game: event.target.value })}
              >
                <option value="all">All games</option>
                {games.map((game) => <option key={game.id} value={game.slug}>{game.shortName}</option>)}
              </select>
            </label>
            <label>
              Sort
              <select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}>
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="kind">Kind</option>
              </select>
            </label>
          </div>

          <div className="quick-filter-strip">
            <span className="quick-filter-label">Quick kinds</span>
            <button type="button" className={`quick-filter-chip ${kindFilter === "all" ? "active" : ""}`} onClick={() => updateParams({ kind: "all" })}>
              All
              <span>{allResults.length}</span>
            </button>
            {quickKinds.map(([option, count]) => (
              <button key={option} type="button" className={`quick-filter-chip ${kindFilter === option ? "active" : ""}`} onClick={() => updateParams({ kind: option })}>
                {capitalize(option)}
                <span>{count}</span>
              </button>
            ))}
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>
        <div className="chip-grid">
          <span className="entity-chip"><strong>Game</strong><span>{gameFilter === "all" ? "All games" : games.find((game) => game.slug === gameFilter)?.shortName ?? gameFilter}</span></span>
          <span className="entity-chip"><strong>Kind</strong><span>{kindFilter === "all" ? "All entities" : capitalize(kindFilter)}</span></span>
          <span className="entity-chip"><strong>Sort</strong><span>{sort}</span></span>
          {kindOptions.filter((option) => option !== "all").map((option) => (
            <span key={option} className="entity-chip">
              <strong>{capitalize(option)}</strong>
              <span>{countsByKind[option] ?? 0}</span>
            </span>
          ))}
        </div>
        {!query.trim() ? (
          <div className="search-empty-state">
            <Search size={32} />
            <h3>Search the encyclopedia</h3>
            <p className="muted">Type a name to search across Pokemon, moves, abilities, items, regions, types, games, and locations.</p>
            <div className="search-suggestion-chips">
              <Link to="/search?q=charizard" className="entity-chip"><strong>Charizard</strong></Link>
              <Link to="/search?q=thunderbolt" className="entity-chip"><strong>Thunderbolt</strong></Link>
              <Link to="/search?q=kanto" className="entity-chip"><strong>Kanto</strong></Link>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty-state">
            <h3>No results for "{query}"</h3>
            <p className="muted">{allResults.length > 0 ? `Found ${allResults.length} results before filtering. Try widening your kind or game filter.` : "Try a different spelling or a shorter query."}</p>
          </div>
        ) : (
          <>
            {totalBeforeSlice > results.length ? (
              <p className="results-note">Showing the top {results.length} results. Narrow the search or filters to inspect the remaining {totalBeforeSlice - results.length} matches.</p>
            ) : null}
            <div className="browse-table">
              <div className="browse-table-head browse-table-head-search">
                <span>Kind</span>
                <span>Entry</span>
                <span>Context</span>
                <span>Game scope</span>
              </div>
            {results.map((result) => (
              <GameScopedLink key={`${result.kind}-${result.slug}`} to={result.href} className="browse-table-row browse-table-row-search">
                <span className="mini-badge">{result.kind}</span>
                <span className="browse-table-row-title browse-table-row-title-plain">
                  <span>
                    <strong>{result.title}</strong>
                    <span className="browse-table-row-subtle">Score {result.score}</span>
                  </span>
                </span>
                <span>{result.subtitle}</span>
                <span>
                  {result.gameIds.length
                    ? result.gameIds.slice(0, 3).map((id) => gamesById.get(id)?.shortName ?? id.replace("game:", "")).join(", ")
                    : "Global"}
                </span>
              </GameScopedLink>
            ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
