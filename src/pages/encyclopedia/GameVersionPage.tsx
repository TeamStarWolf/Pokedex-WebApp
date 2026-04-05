import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { useTrainerReferenceData } from "../../hooks/useTrainerReferenceData";
import { getGameBySlug, getPokemonByGame } from "../../lib/encyclopedia";
import { capitalize } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "trainer-groups", label: "Trainer roles" },
  { id: "region", label: "Region" },
  { id: "entries", label: "Entries" },
];

export function GameVersionPage() {
  const { gameSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const { appearances, loading: trainerLoading } = useTrainerReferenceData();
  const game = getGameBySlug(schema, gameSlug);
  useDocumentTitle(game?.name ?? "Game");
  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;
  const pokemon = getPokemonByGame(schema, game.id);
  const pairedGames = game.pairedGameIds.map((gameId) => schema.gameVersions[gameId]).filter(Boolean);
  const gameAppearances = appearances.filter((appearance) => appearance.sourceGroup === game.slug);
  const trainerRoleCounts = gameAppearances.reduce<Record<string, number>>((accumulator, appearance) => {
    accumulator[appearance.category] = (accumulator[appearance.category] ?? 0) + 1;
    return accumulator;
  }, {});
  const trainerRoleEntries = Object.entries(trainerRoleCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const trainerCount = new Set(gameAppearances.map((appearance) => appearance.trainerSlug)).size;

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game article</p>
          <h1>{game.name}</h1>
          <p className="lead">Game-version entry linking regional context, paired releases, and the current indexed species slice.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{pokemon.length}</strong><span>Species entries</span></div>
          <div><strong>{trainerCount}</strong><span>Trainers</span></div>
          <div><strong>{pairedGames.length}</strong><span>Paired games</span></div>
          <div><strong>{game.platform ?? "?"}</strong><span>Platform</span></div>
          <div><strong>Gen {game.generation || "?"}</strong><span>Generation</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox title={game.name} subtitle="Game version page" rows={[
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
                    <strong>Browse trainer battles</strong>
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
                  )) : <span className="muted">No paired game linked in the current dataset.</span>}
                </div>
              </div>
            </div>
          </section>
          <section id="trainer-groups" className="content-card">
            <h2>Trainer roles in this game</h2>
            {trainerLoading ? (
              <p className="muted">Loading trainer role breakdown.</p>
            ) : trainerRoleEntries.length ? (
              <div className="reference-grid">
                <div>
                  <p className="muted">Jump directly into role-specific trainer battle views for this game.</p>
                  <div className="chip-grid">
                    {trainerRoleEntries.map(([category, count]) => (
                      <GameScopedLink
                        key={category}
                        to={`${encyclopediaRoutes.gameTrainers(game.slug)}?category=${encodeURIComponent(category)}`}
                        preserveGame={false}
                        className="entity-chip"
                      >
                        <strong>{capitalize(category)}</strong>
                        <span>{count} battle records</span>
                      </GameScopedLink>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Browse trainer archive</h3>
                  <div className="chip-grid">
                    <GameScopedLink to={encyclopediaRoutes.gameTrainers(game.slug)} preserveGame={false} className="entity-chip">
                      <strong>All trainer battles</strong>
                      <span>{gameAppearances.length} entries in {game.shortName}</span>
                    </GameScopedLink>
                    <GameScopedLink to={`${encyclopediaRoutes.trainerAppearances()}?game=${encodeURIComponent(game.slug)}`} preserveGame={false} className="entity-chip">
                      <strong>Open global trainer browser</strong>
                      <span>Keep the {game.shortName} filter active</span>
                    </GameScopedLink>
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">Trainer roles have not been linked for this game yet in the current archive.</p>
            )}
          </section>
          <section id="region" className="content-card">
            <h2>Regional context</h2>
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
            <h2>Indexed Pokemon with entries in this version</h2>
            <div className="search-results-grid">
              {pokemon.map((entry) => <GameScopedLink key={entry.id} to={encyclopediaRoutes.pokemon(entry.slug)} className="search-result-card"><span className="eyebrow">Pokemon</span><strong>{entry.name}</strong><span>{entry.categoryLabel}</span></GameScopedLink>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
