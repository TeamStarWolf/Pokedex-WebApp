import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useTrainerReferenceData } from "../../hooks/useTrainerReferenceData";
import { getGameBySlug } from "../../lib/encyclopedia";
import { capitalize } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

function summarizeTeam(memberIds: number[], pokemonById: Map<number, { name: string }>) {
  const names = memberIds
    .map((memberId) => pokemonById.get(memberId)?.name)
    .filter(Boolean)
    .map((name) => capitalize(name));

  if (!names.length) return "Team data not available";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
}

export function GameTrainerIndexPage() {
  const { gameSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { schema } = useEncyclopediaData();
  const { appearances, pokemonList, loading, error } = useTrainerReferenceData();
  const game = getGameBySlug(schema, gameSlug);
  const pokemonById = useMemo(() => new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const)), [pokemonList]);
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const canonical = searchParams.get("canonical") ?? "all";
  const sort = searchParams.get("sort") ?? "trainer";
  useDocumentTitle(game ? `${game.name} Trainers` : "Trainers");

  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;
  if (loading) return <main className="encyclopedia-page"><section className="content-card"><h1>Loading trainer battles</h1></section></main>;
  if (error) return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer data unavailable</h1><p className="muted">{error}</p></section></main>;

  const base = appearances.filter((appearance) => appearance.sourceGroup === game.slug);
  const categoryCounts = base.reduce<Record<string, number>>((accumulator, appearance) => {
    accumulator[appearance.category] = (accumulator[appearance.category] ?? 0) + 1;
    return accumulator;
  }, {});
  const quickCategories = Object.entries(categoryCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8);

  const filtered = [...base].filter((appearance) => {
    if (category !== "all" && appearance.category !== category) return false;
    if (canonical === "canonical" && !appearance.canonical) return false;
    if (canonical === "inspired" && appearance.canonical) return false;
    if (!query.trim()) return true;

    const teamNames = appearance.members
      .map((memberId) => pokemonById.get(memberId)?.name ?? "")
      .join(" ")
      .toLowerCase();

    return `${appearance.trainer} ${appearance.name} ${appearance.category} ${appearance.battleLabel} ${appearance.sourceGame} ${teamNames}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  }).sort((left, right) => {
    if (sort === "role") {
      return left.category.localeCompare(right.category)
        || left.trainer.localeCompare(right.trainer)
        || left.name.localeCompare(right.name);
    }

    if (sort === "battle") {
      return left.battleLabel.localeCompare(right.battleLabel)
        || left.trainer.localeCompare(right.trainer)
        || left.name.localeCompare(right.name);
    }

    return left.trainer.localeCompare(right.trainer)
      || left.battleLabel.localeCompare(right.battleLabel)
      || left.name.localeCompare(right.name);
  });

  const visible = filtered.slice(0, 200);
  const truncatedCount = Math.max(filtered.length - visible.length, 0);
  const uniqueTrainers = new Set(filtered.map((appearance) => appearance.trainerSlug)).size;

  function updateParam(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "trainer")) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name, href: encyclopediaRoutes.game(game.slug) }, { label: "Trainer Battles" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name} Trainer Battles</h1>
          <p className="lead">Trainer appearances scoped to this game, with quick filters for role, record type, and search.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Battle entries</span></div>
          <div><strong>{uniqueTrainers}</strong><span>Trainers shown</span></div>
          <div><strong>{Object.keys(categoryCounts).length}</strong><span>Roles</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Search
              <input value={query} onChange={(event) => updateParam({ q: event.target.value })} placeholder="Trainer, battle, or team member" />
            </label>
            <label>
              Role
              <select value={category} onChange={(event) => updateParam({ category: event.target.value })}>
                <option value="all">All roles</option>
                {Object.keys(categoryCounts).sort((left, right) => left.localeCompare(right)).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
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
              Sort
              <select value={sort} onChange={(event) => updateParam({ sort: event.target.value })}>
                <option value="trainer">Trainer</option>
                <option value="role">Role</option>
                <option value="battle">Battle label</option>
              </select>
            </label>
          </div>

          <div className="quick-filter-strip">
            <span className="quick-filter-label">Quick roles</span>
            <button
              type="button"
              className={`quick-filter-chip ${category === "all" ? "active" : ""}`}
              onClick={() => updateParam({ category: "all" })}
            >
              All
              <span>{base.length}</span>
            </button>
            {quickCategories.map(([option, count]) => (
              <button
                key={option}
                type="button"
                className={`quick-filter-chip ${category === option ? "active" : ""}`}
                onClick={() => updateParam({ category: option })}
              >
                {capitalize(option)}
                <span>{count}</span>
              </button>
            ))}
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>

        {truncatedCount > 0 ? (
          <p className="results-note">Showing the first {visible.length} battle records for {game.shortName}. Refine the filters to inspect the remaining {truncatedCount}.</p>
        ) : null}

        {!visible.length ? (
          <div className="empty-results-panel">
            <strong>No trainer battles matched this game filter set.</strong>
            <p className="muted">Try clearing the role or record type filter, or search with a trainer name instead of a team member.</p>
          </div>
        ) : (
          <div className="trainer-table">
            <div className="trainer-table-head trainer-table-head-expanded">
              <span>Trainer</span>
              <span>Appearance</span>
              <span>Role</span>
              <span>Battle</span>
              <span>Type</span>
              <span>Team</span>
              <span>Ace</span>
            </div>
            {visible.map((appearance) => {
              const ace = appearance.acePokemonId ? pokemonById.get(appearance.acePokemonId) : null;
              return (
                <GameScopedLink key={appearance.slug} to={encyclopediaRoutes.trainerAppearance(appearance.trainerSlug, appearance.slug)} preserveGame={false} className="trainer-table-row trainer-table-row-expanded">
                  <strong>{appearance.trainer}</strong>
                  <span>{appearance.name}</span>
                  <span>{appearance.category}</span>
                  <span>{appearance.battleLabel}</span>
                  <span>{appearance.canonical ? "Canonical" : "Inspired"}</span>
                  <span>{summarizeTeam(appearance.members, pokemonById)}</span>
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
