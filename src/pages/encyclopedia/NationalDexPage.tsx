import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDefaultForm, listGames, listPokemon, listTypes, paginate } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { Pagination } from "../../components/encyclopedia/Pagination";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const PAGE_SIZE = 6;

export function NationalDexPage() {
  const { schema } = useEncyclopediaData();
  const pokemon = listPokemon(schema);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page") ?? 1));
  const typeFilter = searchParams.get("type") ?? "all";
  const generationFilter = searchParams.get("generation") ?? "all";
  const gameFilter = searchParams.get("game") ?? "all";
  const nameQuery = searchParams.get("q") ?? "";
  const sortKey = searchParams.get("sort") ?? "dex";
  const availableGenerations = Array.from(new Set(pokemon.map((species) => species.generation).filter(Boolean))).sort((a, b) => a - b);
  const availableTypes = listTypes(schema);
  const availableGames = listGames(schema);

  const filtered = useMemo(() => {
    const base = pokemon.filter((species) => {
      const form = getDefaultForm(schema, species);
      const typePass = typeFilter === "all" || form?.typeIds.includes(`type:${typeFilter}`);
      const generationPass = generationFilter === "all" || species.generation === Number(generationFilter);
      const gamePass = gameFilter === "all"
        || species.pokedexGameIds.includes(`game:${gameFilter}`)
        || species.pokedexEntries.some((entry) => entry.gameVersionId === `game:${gameFilter}`);
      const namePass = !nameQuery.trim() || species.name.toLowerCase().includes(nameQuery.trim().toLowerCase());
      return typePass && generationPass && gamePass && namePass;
    });

    const sorted = [...base];
    sorted.sort((left, right) => {
      const leftForm = getDefaultForm(schema, left);
      const rightForm = getDefaultForm(schema, right);
      if (sortKey === "name") return left.name.localeCompare(right.name);
      if (sortKey === "bst") {
        const leftTotal = Object.values(leftForm?.stats ?? {}).reduce((sum, value) => sum + value, 0);
        const rightTotal = Object.values(rightForm?.stats ?? {}).reduce((sum, value) => sum + value, 0);
        return rightTotal - leftTotal || left.nationalDexNumber - right.nationalDexNumber;
      }
      return left.nationalDexNumber - right.nationalDexNumber;
    });

    return sorted;
  }, [gameFilter, generationFilter, nameQuery, pokemon, schema, sortKey, typeFilter]);

  const pagination = paginate(filtered, pageState, PAGE_SIZE);

  function setPage(page: number) {
    setPageState(page);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "National Dex" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Master index</p>
          <h1>National Dex</h1>
          <p className="lead">Browse the encyclopedia by species with query-linked filters, sorting, and direct links into full dossiers.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Matched species</span></div>
          <div><strong>{availableTypes.length}</strong><span>Known types</span></div>
          <div><strong>{availableGenerations.length}</strong><span>Generations</span></div>
          <div><strong>{Object.keys(schema.forms).length}</strong><span>Forms</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="section-topline">
          <div>
            <p className="eyebrow">Browse</p>
            <h2>Filter the index</h2>
            <p className="muted">Stable query params, expandable browse controls, and sorting designed for larger offline datasets.</p>
          </div>
          <div className="inline-filter-row">
            <label>
              Name
              <input value={nameQuery} onChange={(event) => setSearchParams({ page: "1", q: event.target.value, type: typeFilter, generation: generationFilter, game: gameFilter, sort: sortKey })} placeholder="Search species name" />
            </label>
            <label>
              Type
              <select value={typeFilter} onChange={(event) => setSearchParams({ page: "1", q: nameQuery, type: event.target.value, generation: generationFilter, game: gameFilter, sort: sortKey })}>
                <option value="all">All</option>
                {availableTypes.map((type) => <option key={type.id} value={type.slug}>{type.name}</option>)}
              </select>
            </label>
            <label>
              Generation
              <select value={generationFilter} onChange={(event) => setSearchParams({ page: "1", q: nameQuery, type: typeFilter, generation: event.target.value, game: gameFilter, sort: sortKey })}>
                <option value="all">All</option>
                {availableGenerations.map((generation) => <option key={generation} value={generation}>Gen {generation}</option>)}
              </select>
            </label>
            <label>
              Game
              <select value={gameFilter} onChange={(event) => setSearchParams({ page: "1", q: nameQuery, type: typeFilter, generation: generationFilter, game: event.target.value, sort: sortKey })}>
                <option value="all">All</option>
                {availableGames.map((game) => <option key={game.id} value={game.slug}>{game.shortName}</option>)}
              </select>
            </label>
            <label>
              Sort
              <select value={sortKey} onChange={(event) => setSearchParams({ page: "1", q: nameQuery, type: typeFilter, generation: generationFilter, game: gameFilter, sort: event.target.value })}>
                <option value="dex">Dex number</option>
                <option value="name">Name</option>
                <option value="bst">Base stat total</option>
              </select>
            </label>
          </div>
        </div>
        <div className="chip-grid">
          <span className="entity-chip"><strong>Query</strong><span>{nameQuery || "None"}</span></span>
          <span className="entity-chip"><strong>Type</strong><span>{typeFilter === "all" ? "All" : typeFilter}</span></span>
          <span className="entity-chip"><strong>Generation</strong><span>{generationFilter === "all" ? "All" : `Gen ${generationFilter}`}</span></span>
          <span className="entity-chip"><strong>Game</strong><span>{gameFilter === "all" ? "All" : availableGames.find((game) => game.slug === gameFilter)?.shortName ?? gameFilter}</span></span>
          <span className="entity-chip"><strong>Sort</strong><span>{sortKey}</span></span>
        </div>
        <div className="dex-grid">
          {pagination.items.map((species) => {
            const form = getDefaultForm(schema, species);
            const statTotal = Object.values(form?.stats ?? {}).reduce((sum, value) => sum + value, 0);
            return (
              <GameScopedLink key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} className="dex-card">
                <img src={form?.artworkUrl} alt={species.name} />
                <span className="eyebrow">#{species.nationalDexNumber.toString().padStart(4, "0")}</span>
                <h2>{species.name}</h2>
                <p>{species.categoryLabel}</p>
                <div className="type-chip-row">
                  {form?.typeIds.map((typeId) => <span key={typeId} className="type-chip muted-chip">{typeId.replace("type:", "")}</span>)}
                </div>
                <div className="dex-card-meta">
                  <span>Gen {species.generation || "?"}</span>
                  <span>{statTotal ? `BST ${statTotal}` : "BST unknown"}</span>
                </div>
              </GameScopedLink>
            );
          })}
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
      </section>
    </main>
  );
}
