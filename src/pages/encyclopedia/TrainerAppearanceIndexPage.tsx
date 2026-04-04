import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useTrainerReferenceData } from "../../hooks/useTrainerReferenceData";
import { capitalize } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

export function TrainerAppearanceIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { appearances, pokemonList, loading, error } = useTrainerReferenceData();

  const query = searchParams.get("q") ?? "";
  const game = searchParams.get("game") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const region = searchParams.get("region") ?? "all";
  const canonical = searchParams.get("canonical") ?? "all";
  const pokemonFilter = searchParams.get("pokemon") ?? "all";
  const view = searchParams.get("view") ?? "table";

  const pokemonById = useMemo(() => new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const)), [pokemonList]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return appearances.filter((appearance) => {
      if (game !== "all" && appearance.sourceGroup !== game) return false;
      if (category !== "all" && appearance.category !== category) return false;
      if (region !== "all" && appearance.region !== region) return false;
      if (canonical === "canonical" && !appearance.canonical) return false;
      if (canonical === "inspired" && appearance.canonical) return false;
      if (pokemonFilter !== "all" && !appearance.members.includes(Number(pokemonFilter))) return false;
      if (!normalizedQuery) return true;

      const teamNames = appearance.members
        .map((memberId) => pokemonById.get(memberId)?.name ?? "")
        .join(" ")
        .toLowerCase();

      return `${appearance.trainer} ${appearance.name} ${appearance.sourceGame} ${appearance.battleLabel} ${appearance.category} ${appearance.region} ${appearance.tags.join(" ")} ${teamNames}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [appearances, canonical, category, game, pokemonById, pokemonFilter, query, region]);

  const visible = filtered.slice(0, 250);
  const gameOptions = uniqueSorted(appearances.map((appearance) => appearance.sourceGroup));
  const categoryOptions = uniqueSorted(appearances.map((appearance) => appearance.category));
  const regionOptions = uniqueSorted(appearances.map((appearance) => appearance.region));
  const pokemonOptions = uniqueSorted(
    Array.from(new Set(appearances.flatMap((appearance) => appearance.members)))
      .map((memberId) => pokemonById.get(memberId)?.name ?? "")
      .filter(Boolean),
  );

  function updateParam(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

  if (loading) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Loading trainer appearances</h1><p className="muted">Preparing browse data.</p></section></main>;
  }

  if (error) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer appearance data unavailable</h1><p className="muted">{error}</p></section></main>;
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trainers", href: encyclopediaRoutes.trainers() }, { label: "Appearances" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Trainer appearance browser</p>
          <h1>Browse Trainer Battles</h1>
          <p className="lead">Filter trainer appearances by game, role, region, canonical status, and Pokemon team member.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{appearances.length}</strong><span>Total appearances</span></div>
          <div><strong>{filtered.length}</strong><span>Filtered matches</span></div>
          <div><strong>{uniqueSorted(appearances.map((appearance) => appearance.sourceGroup)).length}</strong><span>Game groups</span></div>
          <div><strong>{uniqueSorted(appearances.map((appearance) => appearance.category)).length}</strong><span>Roles</span></div>
        </div>
      </section>

      <section className="content-card">
        <div className="inline-filter-row trainer-filter-grid">
          <label>
            Search
            <input value={query} onChange={(event) => updateParam({ q: event.target.value })} placeholder="Trainer, game, battle, or Pokemon" />
          </label>
          <label>
            Game
            <select value={game} onChange={(event) => updateParam({ game: event.target.value })}>
              <option value="all">All games</option>
              {gameOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Role
            <select value={category} onChange={(event) => updateParam({ category: event.target.value })}>
              <option value="all">All roles</option>
              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Region
            <select value={region} onChange={(event) => updateParam({ region: event.target.value })}>
              <option value="all">All regions</option>
              {regionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Record type
            <select value={canonical} onChange={(event) => updateParam({ canonical: event.target.value })}>
              <option value="all">All records</option>
              <option value="canonical">Canonical</option>
              <option value="inspired">Inspired</option>
            </select>
          </label>
          <label>
            Pokemon
            <select value={pokemonFilter} onChange={(event) => updateParam({ pokemon: event.target.value })}>
              <option value="all">Any team member</option>
              {pokemonOptions.map((option) => {
                const pokemon = pokemonList.find((entry) => entry.name === option);
                if (!pokemon) return null;
                return <option key={pokemon.id} value={String(pokemon.id)}>{capitalize(option)}</option>;
              })}
            </select>
          </label>
          <label>
            View
            <select value={view} onChange={(event) => updateParam({ view: event.target.value })}>
              <option value="table">Table</option>
              <option value="cards">Cards</option>
            </select>
          </label>
        </div>

        <div className="chip-grid">
          <span className="entity-chip"><strong>Game</strong><span>{game === "all" ? "Any" : game}</span></span>
          <span className="entity-chip"><strong>Role</strong><span>{category === "all" ? "Any" : category}</span></span>
          <span className="entity-chip"><strong>Region</strong><span>{region === "all" ? "Any" : region}</span></span>
          <span className="entity-chip"><strong>Pokemon</strong><span>{pokemonFilter === "all" ? "Any" : capitalize(pokemonById.get(Number(pokemonFilter))?.name ?? "Any")}</span></span>
        </div>

        {view === "cards" ? (
          <div className="search-results-grid">
            {visible.map((appearance) => (
              <GameScopedLink
                key={appearance.slug}
                to={encyclopediaRoutes.trainerAppearance(appearance.trainerSlug, appearance.slug)}
                className="search-result-card trainer-result-card"
              >
                <span className="eyebrow">{appearance.region}</span>
                <strong>{appearance.trainer}: {appearance.name}</strong>
                <span>{appearance.sourceGame} | {appearance.battleLabel}</span>
                <span>{appearance.canonical ? "Canonical" : "Inspired"} | {appearance.category}</span>
              </GameScopedLink>
            ))}
          </div>
        ) : (
          <div className="trainer-table">
            <div className="trainer-table-head">
              <span>Trainer</span>
              <span>Appearance</span>
              <span>Game</span>
              <span>Role</span>
              <span>Battle</span>
              <span>Ace</span>
            </div>
            {visible.map((appearance) => {
              const ace = appearance.acePokemonId ? pokemonById.get(appearance.acePokemonId) : null;
              return (
                <GameScopedLink
                  key={appearance.slug}
                  to={encyclopediaRoutes.trainerAppearance(appearance.trainerSlug, appearance.slug)}
                  className="trainer-table-row"
                >
                  <strong>{appearance.trainer}</strong>
                  <span>{appearance.name}</span>
                  <span>{appearance.sourceGame}</span>
                  <span>{appearance.category}</span>
                  <span>{appearance.battleLabel}</span>
                  <span>{capitalize(ace?.name ?? "Unknown")}</span>
                </GameScopedLink>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
