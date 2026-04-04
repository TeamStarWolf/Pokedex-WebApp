import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useTrainerReferenceData } from "../../hooks/useTrainerReferenceData";
import { getGameBySlug } from "../../lib/encyclopedia";
import { capitalize } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

export function GameTrainerIndexPage() {
  const { gameSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const { appearances, pokemonList, loading, error } = useTrainerReferenceData();
  const game = getGameBySlug(schema, gameSlug);

  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;
  if (loading) return <main className="encyclopedia-page"><section className="content-card"><h1>Loading trainer battles</h1></section></main>;
  if (error) return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer data unavailable</h1><p className="muted">{error}</p></section></main>;

  const filtered = appearances.filter((appearance) => appearance.sourceGroup === game.slug);
  const pokemonById = useMemo(() => new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const)), [pokemonList]);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name, href: encyclopediaRoutes.game(game.slug) }, { label: "Trainer Battles" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name} Trainer Battles</h1>
          <p className="lead">Trainer appearances scoped to this game.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{filtered.length}</strong><span>Battle entries</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="trainer-table">
          <div className="trainer-table-head">
            <span>Trainer</span>
            <span>Appearance</span>
            <span>Role</span>
            <span>Battle</span>
            <span>Type</span>
            <span>Ace</span>
          </div>
          {filtered.map((appearance) => {
            const ace = appearance.acePokemonId ? pokemonById.get(appearance.acePokemonId) : null;
            return (
              <GameScopedLink key={appearance.slug} to={encyclopediaRoutes.trainerAppearance(appearance.trainerSlug, appearance.slug)} preserveGame={false} className="trainer-table-row">
                <strong>{appearance.trainer}</strong>
                <span>{appearance.name}</span>
                <span>{appearance.category}</span>
                <span>{appearance.battleLabel}</span>
                <span>{appearance.canonical ? "Canonical" : "Inspired"}</span>
                <span>{capitalize(ace?.name ?? "Unknown")}</span>
              </GameScopedLink>
            );
          })}
        </div>
      </section>
    </main>
  );
}
