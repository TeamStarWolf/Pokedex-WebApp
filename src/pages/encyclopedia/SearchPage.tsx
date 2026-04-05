import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { Pagination } from "../../components/encyclopedia/Pagination";
import { buildSearchIndex, fuzzyScore, listGames, paginate } from "../../lib/encyclopedia";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { capitalize } from "../../lib/format";

const PAGE_SIZE = 24;

function relevanceLabel(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "Exact", className: "relevance-exact" };
  if (score >= 40) return { label: "Strong", className: "relevance-strong" };
  return { label: "Partial", className: "relevance-partial" };
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  useDocumentTitle(query ? `Search: ${query}` : "Search");
  const { schema } = useEncyclopediaData();
  const kindFilter = searchParams.get("kind") ?? "all";
  const gameFilter = searchParams.get("game") ?? "all";
  const sort = searchParams.get("sort") ?? "relevance";
  const page = Number(searchParams.get("page") ?? 1);
  const searchIndex = useMemo(() => buildSearchIndex(schema), [schema]);
  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchIndex
      .map((entry) => ({ ...entry, score: fuzzyScore(query, `${entry.title} ${entry.subtitle}`) }))
      .filter((entry) => entry.score >= 0)
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
  }, [searchIndex, query]);
  const games = useMemo(() => listGames(schema), [schema]);
  const filtered = useMemo(
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
        }),
    [allResults, gameFilter, kindFilter, sort],
  );
  const pagination = paginate(filtered, page, PAGE_SIZE);
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
  const gamesById = useMemo(() => new Map<string, (typeof games)[number]>(games.map((game) => [game.id, game])), [games]);

  function updateParams(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "relevance") || (key === "page" && value === "1")) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

  function setPage(newPage: number) {
    updateParams({ page: String(newPage) });
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
          <p className="eyebrow">Encyclopedia search</p>
          <h1>Search</h1>
          <p className="lead">Find Pokemon, moves, abilities, items, regions, types, games, and locations across the encyclopedia.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Results</span></div>
          <div><strong>{countsByKind.pokemon ?? 0}</strong><span>Pokemon</span></div>
          <div><strong>{countsByKind.move ?? 0}</strong><span>Moves</span></div>
          <div><strong>{Object.keys(countsByKind).length}</strong><span>Categories</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Search
              <input
                value={query}
                onChange={(event) => {
                  updateParams({ q: event.target.value, page: "1" });
                }}
                placeholder="Search Pokemon, moves, abilities, items..."
              />
            </label>
            <label>
              Category
              <select
                value={kindFilter}
                onChange={(event) => updateParams({ kind: event.target.value, page: "1" })}
              >
                {kindOptions.map((option) => <option key={option} value={option}>{option === "all" ? "All categories" : capitalize(option)}</option>)}
              </select>
            </label>
            <label>
              Game
              <select
                value={gameFilter}
                onChange={(event) => updateParams({ game: event.target.value, page: "1" })}
              >
                <option value="all">All games</option>
                {games.map((game) => <option key={game.id} value={game.slug}>{game.shortName}</option>)}
              </select>
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(event) => updateParams({ sort: event.target.value, page: "1" })}>
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="kind">Category</option>
              </select>
            </label>
          </div>

          <div className="quick-filter-strip">
            <span className="quick-filter-label">Filter</span>
            <button type="button" className={`quick-filter-chip ${kindFilter === "all" ? "active" : ""}`} onClick={() => updateParams({ kind: "all", page: "1" })}>
              All
              <span>{allResults.length}</span>
            </button>
            {quickKinds.map(([option, count]) => (
              <button key={option} type="button" className={`quick-filter-chip ${kindFilter === option ? "active" : ""}`} onClick={() => updateParams({ kind: option, page: "1" })}>
                {capitalize(option)}
                <span>{count}</span>
              </button>
            ))}
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>
        {!query.trim() ? (
          <div className="search-empty-state">
            <Search size={36} />
            <h3>Search the encyclopedia</h3>
            <p className="muted">Type a query to search across all Pokemon, moves, abilities, items, regions, types, games, and locations.</p>
            <div className="search-suggestion-chips">
              <Link to="/search?q=charizard" className="entity-chip"><strong>Charizard</strong></Link>
              <Link to="/search?q=thunderbolt" className="entity-chip"><strong>Thunderbolt</strong></Link>
              <Link to="/search?q=kanto" className="entity-chip"><strong>Kanto</strong></Link>
              <Link to="/search?q=levitate" className="entity-chip"><strong>Levitate</strong></Link>
              <Link to="/search?q=fire" className="entity-chip"><strong>Fire</strong></Link>
            </div>
          </div>
        ) : pagination.items.length === 0 ? (
          <div className="search-empty-state">
            <h3>No results for &ldquo;{query}&rdquo;</h3>
            <p className="muted">{allResults.length > 0 ? `Found ${allResults.length} results before filtering. Try widening your category or game filter.` : "Try a different spelling or a shorter query."}</p>
            <button type="button" className="secondary-link" onClick={resetFilters}>Clear all filters</button>
          </div>
        ) : (
          <>
            <div className="browse-table">
              <div className="browse-table-head browse-table-head-search">
                <span>Category</span>
                <span>Entry</span>
                <span>Context</span>
                <span>Game scope</span>
              </div>
            {pagination.items.map((result) => {
              const rel = relevanceLabel(result.score);
              return (
                <GameScopedLink key={`${result.kind}-${result.slug}`} to={result.href} className="browse-table-row browse-table-row-search">
                  <span className="mini-badge">{result.kind}</span>
                  <span className="browse-table-row-title browse-table-row-title-plain">
                    <span>
                      <strong>{result.title}</strong>
                      <span className="browse-table-row-subtle">
                        <span className={`relevance-badge ${rel.className}`}>{rel.label}</span>
                      </span>
                    </span>
                  </span>
                  <span>{result.subtitle}</span>
                  <span>
                    {result.gameIds.length
                      ? result.gameIds.slice(0, 3).map((id) => gamesById.get(id)?.shortName ?? id.replace("game:", "")).join(", ")
                      : "Global"}
                  </span>
                </GameScopedLink>
              );
            })}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={setPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </section>
    </main>
  );
}
