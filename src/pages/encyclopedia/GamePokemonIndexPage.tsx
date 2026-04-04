import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { getDefaultForm, getGameBySlug, getPokemonByGame } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function GamePokemonIndexPage() {
  const { gameSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const game = getGameBySlug(schema, gameSlug);
  if (!game) return <main className="encyclopedia-page"><section className="content-card"><h1>Game not found</h1></section></main>;

  const pokemon = useMemo(() => getPokemonByGame(schema, game.id), [game.id, schema]);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Games", href: "/games" }, { label: game.name, href: encyclopediaRoutes.game(game.slug) }, { label: "Pokemon" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Game hub</p>
          <h1>{game.name} Pokemon</h1>
          <p className="lead">Pokemon indexed for this specific game context.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{pokemon.length}</strong><span>Pokemon</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="dex-grid">
          {pokemon.map((species) => {
            const form = getDefaultForm(schema, species);
            return (
              <GameScopedLink key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} preserveGame={false} className="dex-card">
                <img src={form?.artworkUrl} alt={species.name} />
                <span className="eyebrow">#{species.nationalDexNumber.toString().padStart(4, "0")}</span>
                <h2>{species.name}</h2>
                <p>{species.categoryLabel}</p>
              </GameScopedLink>
            );
          })}
        </div>
      </section>
    </main>
  );
}
