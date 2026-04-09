// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData, usePokemonDetailData } from "../../hooks/useEncyclopediaData";
import {
  formatMethodLabel,
  getDefaultForm,
  getGameBySlug,
  getSpeciesBySlug,
  groupLearnsetDeduped,
} from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "full-learnset", label: "Full learnset" },
];

export function PokemonMovesPage() {
  const { speciesSlug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { schema: indexSchema } = useEncyclopediaData();
  const { schema, loading, error } = usePokemonDetailData(speciesSlug);
  const species = getSpeciesBySlug(schema, speciesSlug) ?? getSpeciesBySlug(indexSchema, speciesSlug);
  useDocumentTitle(species?.name ? `${species.name} Moves` : "Pokemon Moves");

  if (!species) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Pokemon not found</h1></section></main>;
  }

  const form = getDefaultForm(schema, species);
  if (!form) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Default form not found</h1></section></main>;
  }

  const activeGameSlug = searchParams.get("game") ?? "";
  const activeGame = activeGameSlug ? getGameBySlug(schema, activeGameSlug) ?? getGameBySlug(indexSchema, activeGameSlug) : null;
  const groups = groupLearnsetDeduped(schema, form, activeGame?.id);
  const uniqueMoveCount = groups.reduce((sum, group) => sum + group.entries.length, 0);
  const totalGroups = groups.length;

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "National Dex", href: encyclopediaRoutes.nationalDex() },
          { label: species.name, href: encyclopediaRoutes.pokemon(species.slug) },
          { label: "Moves" },
        ]}
      />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Learnset page</p>
          <h1>{species.name} learnset</h1>
          <p className="lead">Full move list for the currently loaded default form, organized by acquisition method.</p>
          {activeGame ? <p className="muted">Scoped to {activeGame.name}. Only move records for this game are shown below.</p> : null}
        </div>
        <div className="title-deck-metrics">
          <div><strong>{uniqueMoveCount}</strong><span>Moves</span></div>
          <div><strong>{totalGroups}</strong><span>Method groups</span></div>
        </div>
      </section>

      <section className="content-card">
        <SectionTabs tabs={tabs} />
        <section id="overview" className="reference-grid compact">
          <div className="overview-panel">
            <h2>Form context</h2>
            <p className="muted">{form.formName} · {form.typeIds.map((typeId) => schema.types[typeId]?.name ?? typeId.replace("type:", "")).join(" / ")}</p>
            <GameScopedLink to={encyclopediaRoutes.pokemon(species.slug)} className="entity-chip">
              <strong>Return to Pokemon page</strong>
              <span>{species.name}</span>
            </GameScopedLink>
          </div>
          <div className="overview-panel">
            <h2>Load status</h2>
            <p className="muted">{loading ? "Loading full move data." : error ? error : activeGame ? `Showing ${activeGame.shortName} move records.` : "Full learnset data loaded."}</p>
          </div>
        </section>

        <section id="full-learnset">
          {groups.length ? groups.map((group) => (
            <div key={group.method} className="learnset-group">
              <div className="learnset-group-header">
                <div>
                  <h3>{formatMethodLabel(group.method)}</h3>
                  <p className="muted">{group.entries.length} moves in this method group.</p>
                </div>
                <span className="learnset-count">{group.entries.length}</span>
              </div>
              <div className="learnset-table" role="table" aria-label={`${formatMethodLabel(group.method)} full learnset`}>
                <div className="learnset-table-head" role="row">
                  <span>Move</span>
                  <span>Type</span>
                  <span>Level</span>
                  <span>Games</span>
                </div>
                {group.entries.map((entry) => (
                  <div key={entry.move.id} className="learnset-row" role="row">
                    <GameScopedLink to={encyclopediaRoutes.move(entry.move.slug)} className="learnset-move-link">
                      <strong>{entry.move.name}</strong>
                    </GameScopedLink>
                    <GameScopedLink to={encyclopediaRoutes.type(entry.move.typeId.replace("type:", ""))} className="type-chip muted-chip">
                      {schema.types[entry.move.typeId]?.name ?? entry.move.typeId.replace("type:", "")}
                    </GameScopedLink>
                    <span>{entry.levelRange ? `Lv. ${entry.levelRange.min}–${entry.levelRange.max}` : entry.level ? `Lv. ${entry.level}` : "—"}</span>
                    <span className="learnset-games-list">{entry.games.map((g) => g.shortName).join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="overview-panel">
              <h3>No move records in scope</h3>
              <p className="muted">
                {activeGame
                  ? `No imported move records were found for ${species.name} in ${activeGame.name}.`
                  : "No move records were found for this form."}
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
