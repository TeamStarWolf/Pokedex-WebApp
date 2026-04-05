import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { Pagination } from "../../components/encyclopedia/Pagination";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { useTrainerReferenceData } from "../../hooks/useTrainerReferenceData";
import { getGameBySlug, getPokemonByGame, paginate } from "../../lib/encyclopedia";
import { capitalize } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const POKEMON_PAGE_SIZE = 36;

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "trainer-groups", label: "Trainer roles" },
  { id: "region", label: "Region" },
  { id: "entries", label: "Pokemon" },
];

export function GameVersionPage() {
  const { gameSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const { appearances, loading: trainerLoading } = useTrainerReferenceData();
  const game = getGameBySlug(schema, gameSlug);
  useDocumentTitle(game?.name ?? "Game");

  const [pokemonSearch, setPokemonSearch] = useState("");
  const [pokemonPage, setPokemonPage] = useState(1);
  const [pokemonSort, setPokemonSort] = useState<"name" | "dex">("dex");

  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;

  const allPokemon = getPokemonByGame(schema, game.id);
  const pairedGames = game.pairedGameIds.map((gameId) => schema.gameVersions[gameId]).filter(Boolean);
  const gameAppearances = appearances.filter((appearance) => appearance.sourceGroup === game.slug);
  const trainerRoleCounts = gameAppearances.reduce<Record<string, number>>((accumulator, appearance) => {
    accumulator[appearance.category] = (accumulator[appearance.category] ?? 0) + 1;
    return accumulator;
  }, {});
  const trainerRoleEntries = Object.entries(trainerRoleCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const trainerCount = new Set(gameAppearances.map((appearance) => appearance.trainerSlug)).size;

  const filteredPokemon = useMemo(() => {
    const query = pokemonSearch.trim().toLowerCase();
    const filtered = query
      ? allPokemon.filter((entry) => entry.name.toLowerCase().includes(query))
      : allPokemon;
    const sorted = [...filtered];
    if (pokemonSort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
    }
    return sorted;
  }, [allPokemon, pokemonSearch, pokemonSort]);

  const pokemonPagination = paginate(filteredPokemon, pokemonPage, POKEMON_PAGE_SIZE);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name}</h1>
          <p className="lead">Game version entry with regional context, paired releases, and indexed species.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{allPokemon.length}</strong><span>Species</span></div>
          <div><strong>{trainerCount}</strong><span>Trainers</span></div>
          <div><strong>{pairedGames.length}</strong><span>Paired games</span></div>
          <div><strong>Gen {game.generation || "?"}</strong><span>Generation</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox title={game.name} subtitle="Game version" rows={[
          { label: "Generation", value: `Gen ${game.generation}` },
          { label: "Platform", value: game.platform ?? "Unknown" },
          { label: "Region", value: game.regionId ? <Link to={encyclopediaRoutes.region(game.regionId.replace("region:", ""))}>{schema.regions[game.regionId]?.name}</Link> : "Unknown" },
          { label: "Regional Dex", value: game.regionalDexName ?? "Unknown" },
          { label: "Release date", value: game.releaseDate ?? "Unknown" },
        ]} />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={game.status} sourceRefs={game.sourceRefs} expansionNotes={game.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="overview" className="content-card">
            <h2>Overview</h2>
            <div className="reference-grid">
              <div>
                <p>{game.summary}</p>
                <div className="chip-grid">
                  <span className="entity-chip"><strong>Version group</strong><span>{game.versionGroup}</span></span>
                  <span className="entity-chip"><strong>Regional Dex</strong><span>{game.regionalDexName ?? "Unknown"}</span></span>
                  <span className="entity-chip"><strong>Trainer records</strong><span>{gameAppearances.length}</span></span>
                  <GameScopedLink to={encyclopediaRoutes.gamePokemon(game.slug)} preserveGame={false} className="entity-chip">
                    <strong>Browse Pokemon</strong>
                    <span>Filtered to {game.shortName}</span>
                  </GameScopedLink>
                  <GameScopedLink to={encyclopediaRoutes.gameTrainers(game.slug)} preserveGame={false} className="entity-chip">
                    <strong>Browse trainers</strong>
                    <span>Filtered to {game.shortName}</span>
                  </GameScopedLink>
                  <GameScopedLink to={encyclopediaRoutes.gameLocations(game.slug)} preserveGame={false} className="entity-chip">
                    <strong>Browse locations</strong>
                    <span>Linked to {game.shortName}</span>
                  </GameScopedLink>
                </div>
              </div>
              <div>
                <h3>Paired games</h3>
                <div className="chip-grid">
                  {pairedGames.length ? pairedGames.map((entry) => (
                    <Link key={entry.id} to={encyclopediaRoutes.game(entry.slug)} className="entity-chip">
                      <strong>{entry.name}</strong>
                      <span>{entry.shortName}</span>
                    </Link>
                  )) : <span className="muted">No paired game linked.</span>}
                </div>
              </div>
            </div>
          </section>
          <section id="trainer-groups" className="content-card">
            <h2>Trainer roles</h2>
            {trainerLoading ? (
              <p className="muted">Loading trainer role breakdown...</p>
            ) : trainerRoleEntries.length ? (
              <div className="reference-grid">
                <div>
                  <p className="muted">Jump into role-specific trainer battle views for this game.</p>
                  <div className="chip-grid">
                    {trainerRoleEntries.map(([category, count]) => (
                      <GameScopedLink
                        key={category}
                        to={`${encyclopediaRoutes.gameTrainers(game.slug)}?category=${encodeURIComponent(category)}`}
                        preserveGame={false}
                        className="entity-chip"
                      >
                        <strong>{capitalize(category)}</strong>
                        <span>{count} battles</span>
                      </GameScopedLink>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Full archive</h3>
                  <div className="chip-grid">
                    <GameScopedLink to={encyclopediaRoutes.gameTrainers(game.slug)} preserveGame={false} className="entity-chip">
                      <strong>All trainer battles</strong>
                      <span>{gameAppearances.length} in {game.shortName}</span>
                    </GameScopedLink>
                    <GameScopedLink to={`${encyclopediaRoutes.trainerAppearances()}?game=${encodeURIComponent(game.slug)}`} preserveGame={false} className="entity-chip">
                      <strong>Global trainer browser</strong>
                      <span>{game.shortName} filter active</span>
                    </GameScopedLink>
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">Trainer roles have not been linked for this game yet.</p>
            )}
          </section>
          <section id="region" className="content-card">
            <h2>Region</h2>
            {game.regionId ? (
              <div className="chip-grid">
                <Link to={encyclopediaRoutes.region(game.regionId.replace("region:", ""))} className="entity-chip">
                  <strong>{schema.regions[game.regionId]?.name ?? game.regionId.replace("region:", "")}</strong>
                  <span>Region page</span>
                </Link>
              </div>
            ) : <p className="muted">No region has been linked for this game entry yet.</p>}
          </section>
          <section id="entries" className="content-card">
            <h2>Pokemon in {game.shortName}</h2>
            <div className="browse-toolbar">
              <div className="inline-filter-row trainer-filter-grid">
                <label>
                  Search
                  <input
                    value={pokemonSearch}
                    onChange={(event) => { setPokemonSearch(event.target.value); setPokemonPage(1); }}
                    placeholder="Filter by name"
                  />
                </label>
                <label>
                  Sort
                  <select value={pokemonSort} onChange={(event) => { setPokemonSort(event.target.value as "name" | "dex"); setPokemonPage(1); }}>
                    <option value="dex">Dex number</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
            </div>
            {pokemonPagination.items.length ? (
              <>
                <div className="browse-table">
                  <div className="browse-table-head browse-table-head-search">
                    <span>Dex</span>
                    <span>Pokemon</span>
                    <span>Category</span>
                    <span>Generation</span>
                  </div>
                  {pokemonPagination.items.map((entry) => (
                    <GameScopedLink key={entry.id} to={encyclopediaRoutes.pokemon(entry.slug)} className="browse-table-row browse-table-row-search">
                      <span className="browse-table-metric">#{entry.nationalDexNumber.toString().padStart(4, "0")}</span>
                      <span className="browse-table-row-title browse-table-row-title-plain">
                        <span><strong>{entry.name}</strong></span>
                      </span>
                      <span>{entry.categoryLabel}</span>
                      <span>Gen {entry.generation || "?"}</span>
                    </GameScopedLink>
                  ))}
                </div>
                <Pagination
                  page={pokemonPagination.page}
                  totalPages={pokemonPagination.totalPages}
                  onChange={setPokemonPage}
                  totalItems={filteredPokemon.length}
                  pageSize={POKEMON_PAGE_SIZE}
                />
              </>
            ) : (
              <div className="empty-results-panel">
                <strong>No Pokemon matched &ldquo;{pokemonSearch}&rdquo;</strong>
                <p className="muted">Try a different search term.</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
