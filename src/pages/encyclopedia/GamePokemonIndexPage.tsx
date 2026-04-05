import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { PokemonImage } from "../../components/encyclopedia/PokemonImage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { getDefaultForm, getGameBySlug, getPokemonByGame } from "../../lib/encyclopedia";
import { capitalize, padDex } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function GamePokemonIndexPage() {
  const { gameSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { schema } = useEncyclopediaData();
  const game = getGameBySlug(schema, gameSlug);
  const query = searchParams.get("q") ?? "";
  const typeFilter = searchParams.get("type") ?? "all";
  const sort = searchParams.get("sort") ?? "dex";
  useDocumentTitle(game ? `${game.name} Pokemon` : "Pokemon");
  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;

  const pokemon = useMemo(() => getPokemonByGame(schema, game.id), [game.id, schema]);
  const rows = useMemo(() => pokemon.map((species) => {
    const form = getDefaultForm(schema, species);
    const typeNames = form?.typeIds.map((typeId) => schema.types[typeId]?.name).filter(Boolean) ?? [];
    return { species, form, typeNames };
  }), [pokemon, schema]);

  const typeCounts = useMemo(() => {
    return rows.reduce<Record<string, number>>((accumulator, row) => {
      row.typeNames.forEach((typeName) => {
        accumulator[typeName] = (accumulator[typeName] ?? 0) + 1;
      });
      return accumulator;
    }, {});
  }, [rows]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...rows].filter(({ species, typeNames }) => {
      if (typeFilter !== "all" && !typeNames.includes(typeFilter)) return false;
      if (!normalizedQuery) return true;

      return `${species.name} ${species.categoryLabel} ${typeNames.join(" ")} ${species.nationalDexNumber}`
        .toLowerCase()
        .includes(normalizedQuery);
    }).sort((left, right) => {
      if (sort === "name") {
        return left.species.name.localeCompare(right.species.name)
          || left.species.nationalDexNumber - right.species.nationalDexNumber;
      }

      if (sort === "forms") {
        return right.species.formIds.length - left.species.formIds.length
          || left.species.name.localeCompare(right.species.name);
      }

      return left.species.nationalDexNumber - right.species.nationalDexNumber
        || left.species.name.localeCompare(right.species.name);
    });
  }, [query, rows, sort, typeFilter]);

  const quickTypes = useMemo(() => (
    Object.entries(typeCounts)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 8)
  ), [typeCounts]);
  const uniqueTypeCount = Object.keys(typeCounts).length;

  function updateParam(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "dex")) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name, href: encyclopediaRoutes.game(game.slug) }, { label: "Pokemon" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name} Pokemon</h1>
          <p className="lead">Pokemon indexed for this game context, with quick filtering by type and sorting for scan-heavy browsing.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Pokemon shown</span></div>
          <div><strong>{uniqueTypeCount}</strong><span>Types in scope</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Search
              <input value={query} onChange={(event) => updateParam({ q: event.target.value })} placeholder="Pokemon name, dex number, or category" />
            </label>
            <label>
              Type
              <select value={typeFilter} onChange={(event) => updateParam({ type: event.target.value })}>
                <option value="all">All types</option>
                {Object.keys(typeCounts).sort((left, right) => left.localeCompare(right)).map((typeName) => (
                  <option key={typeName} value={typeName}>{capitalize(typeName)}</option>
                ))}
              </select>
            </label>
            <label>
              Sort
              <select value={sort} onChange={(event) => updateParam({ sort: event.target.value })}>
                <option value="dex">National Dex</option>
                <option value="name">Name</option>
                <option value="forms">Form count</option>
              </select>
            </label>
          </div>

          <div className="quick-filter-strip">
            <span className="quick-filter-label">Quick types</span>
            <button
              type="button"
              className={`quick-filter-chip ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => updateParam({ type: "all" })}
            >
              All
              <span>{rows.length}</span>
            </button>
            {quickTypes.map(([typeName, count]) => (
              <button
                key={typeName}
                type="button"
                className={`quick-filter-chip ${typeFilter === typeName ? "active" : ""}`}
                onClick={() => updateParam({ type: typeName })}
              >
                {capitalize(typeName)}
                <span>{count}</span>
              </button>
            ))}
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>

        {!filtered.length ? (
          <div className="empty-results-panel">
            <strong>No Pokemon matched this game filter set.</strong>
            <p className="muted">Try clearing the type filter or using a broader search term.</p>
          </div>
        ) : (
          <div className="browse-table">
            <div className="browse-table-head browse-table-head-pokemon">
              <span>Dex</span>
              <span>Pokemon</span>
              <span>Types</span>
              <span>Category</span>
              <span>Forms</span>
            </div>
            {filtered.map(({ species, form, typeNames }) => (
              <GameScopedLink key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} className="browse-table-row browse-table-row-pokemon">
                <span className="browse-table-metric">#{padDex(species.nationalDexNumber)}</span>
                <span className="browse-table-row-title">
                  <PokemonImage src={form?.artworkUrl} alt={species.name} />
                  <span>
                    <strong>{species.name}</strong>
                    <span className="browse-table-row-subtle">{species.summary}</span>
                  </span>
                </span>
                <span className="browse-table-row-types">
                  {typeNames.length ? typeNames.map((typeName) => (
                    <span key={typeName} className="type-chip">{capitalize(typeName)}</span>
                  )) : <span className="muted">Unknown</span>}
                </span>
                <span>{species.categoryLabel}</span>
                <span>{species.formIds.length}</span>
              </GameScopedLink>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
