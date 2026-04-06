// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getDefaultForm, listGames, listPokemon, listTypes, paginate } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { Pagination } from "../../components/encyclopedia/Pagination";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { PokemonImage } from "../../components/encyclopedia/PokemonImage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { capitalize, padDex } from "../../lib/format";

const PAGE_SIZE = 36;

export function NationalDexPage() {
  useDocumentTitle("National Dex");
  const { schema } = useEncyclopediaData();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const typeFilter = searchParams.get("type") ?? "all";
  const generationFilter = searchParams.get("generation") ?? "all";
  const gameFilter = searchParams.get("game") ?? "all";
  const nameQuery = searchParams.get("q") ?? "";
  const sortKey = searchParams.get("sort") ?? "dex";
  const pokemon = useMemo(() => listPokemon(schema), [schema]);
  const availableGenerations = useMemo(() => Array.from(new Set(pokemon.map((species) => species.generation).filter(Boolean))).sort((a, b) => a - b), [pokemon]);
  const availableTypes = useMemo(() => listTypes(schema), [schema]);
  const availableGames = useMemo(() => listGames(schema), [schema]);

  const contextFiltered = useMemo(() => {
    return pokemon.filter((species) => {
      const generationPass = generationFilter === "all" || species.generation === Number(generationFilter);
      const gamePass = gameFilter === "all"
        || species.pokedexGameIds.includes(`game:${gameFilter}`)
        || species.pokedexEntries.some((entry) => entry.gameVersionId === `game:${gameFilter}`);
      const namePass = !nameQuery.trim() || species.name.toLowerCase().includes(nameQuery.trim().toLowerCase());
      return generationPass && gamePass && namePass;
    });
  }, [gameFilter, generationFilter, nameQuery, pokemon]);

  const quickTypeCounts = useMemo(() => {
    return contextFiltered.reduce<Record<string, number>>((accumulator, species) => {
      const form = getDefaultForm(schema, species);
      form?.typeIds.forEach((typeId) => {
        const slug = typeId.replace("type:", "");
        accumulator[slug] = (accumulator[slug] ?? 0) + 1;
      });
      return accumulator;
    }, {});
  }, [contextFiltered, schema]);

  const filtered = useMemo(() => {
    const base = contextFiltered.filter((species) => {
      const form = getDefaultForm(schema, species);
      return typeFilter === "all" || form?.typeIds.includes(`type:${typeFilter}`);
    });

    const sorted = [...base];
    sorted.sort((left, right) => {
      const leftForm = getDefaultForm(schema, left);
      const rightForm = getDefaultForm(schema, right);
      if (sortKey === "name") return left.name.localeCompare(right.name);
      if (sortKey === "forms") return right.formIds.length - left.formIds.length || left.nationalDexNumber - right.nationalDexNumber;
      if (sortKey === "bst") {
        const leftTotal = Object.values(leftForm?.stats ?? {}).reduce((sum, value) => sum + value, 0);
        const rightTotal = Object.values(rightForm?.stats ?? {}).reduce((sum, value) => sum + value, 0);
        return rightTotal - leftTotal || left.nationalDexNumber - right.nationalDexNumber;
      }
      return left.nationalDexNumber - right.nationalDexNumber;
    });

    return sorted;
  }, [contextFiltered, schema, sortKey, typeFilter]);

  const quickTypes = useMemo(() => (
    Object.entries(quickTypeCounts)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 8)
  ), [quickTypeCounts]);

  const pagination = paginate(filtered, page, PAGE_SIZE);

  function updateParams(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "dex") || (key === "page" && value === "1")) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  }

  function setPage(newPage: number) {
    updateParams({ page: String(newPage) });
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "National Dex" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Master index</p>
          <h1>National Dex</h1>
          <p className="lead">Browse every species with filters, sorting, and direct links to full dossiers.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Matched species</span></div>
          <div><strong>{availableTypes.length}</strong><span>Types</span></div>
          <div><strong>{availableGenerations.length}</strong><span>Generations</span></div>
          <div><strong>{Object.keys(schema.forms).length}</strong><span>Forms</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Name
              <input value={nameQuery} onChange={(event) => updateParams({ page: "1", q: event.target.value })} placeholder="Search by name" />
            </label>
            <label>
              Type
              <select value={typeFilter} onChange={(event) => updateParams({ page: "1", type: event.target.value })}>
                <option value="all">All types</option>
                {availableTypes.map((type) => <option key={type.id} value={type.slug}>{type.name}</option>)}
              </select>
            </label>
            <label>
              Generation
              <select value={generationFilter} onChange={(event) => updateParams({ page: "1", generation: event.target.value })}>
                <option value="all">All gens</option>
                {availableGenerations.map((generation) => <option key={generation} value={generation}>Gen {generation}</option>)}
              </select>
            </label>
            <label>
              Game
              <select value={gameFilter} onChange={(event) => updateParams({ page: "1", game: event.target.value })}>
                <option value="all">All games</option>
                {availableGames.map((game) => <option key={game.id} value={game.slug}>{game.shortName}</option>)}
              </select>
            </label>
            <label>
              Sort
              <select value={sortKey} onChange={(event) => updateParams({ page: "1", sort: event.target.value })}>
                <option value="dex">Dex number</option>
                <option value="name">Name</option>
                <option value="bst">Base stat total</option>
                <option value="forms">Form count</option>
              </select>
            </label>
          </div>

          <div className="quick-filter-strip">
            <span className="quick-filter-label">Types</span>
            <button type="button" className={`quick-filter-chip ${typeFilter === "all" ? "active" : ""}`} onClick={() => updateParams({ page: "1", type: "all" })}>
              All
              <span>{contextFiltered.length}</span>
            </button>
            {quickTypes.map(([type, count]) => (
              <button key={type} type="button" className={`quick-filter-chip ${typeFilter === type ? "active" : ""}`} onClick={() => updateParams({ page: "1", type })}>
                {capitalize(type)}
                <span>{count}</span>
              </button>
            ))}
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>
        {!pagination.items.length ? (
          <div className="empty-results-panel">
            <strong>No species matched these filters.</strong>
            <p className="muted">Try clearing the type or game filter, or search with a broader name query.</p>
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
          {pagination.items.map((species) => {
            const form = getDefaultForm(schema, species);
            const typeNames = form?.typeIds.map((typeId) => schema.types[typeId]?.name).filter(Boolean) ?? [];
            return (
              <GameScopedLink key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} className="browse-table-row browse-table-row-pokemon">
                <span className="browse-table-metric">#{padDex(species.nationalDexNumber)}</span>
                <span className="browse-table-row-title">
                  <PokemonImage src={form?.artworkUrl} alt={species.name} />
                  <span>
                    <strong>{species.name}</strong>
                    <span className="browse-table-row-subtle">Gen {species.generation || "?"} · {species.summary}</span>
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
            );
          })}
        </div>
        )}
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </section>
    </main>
  );
}
