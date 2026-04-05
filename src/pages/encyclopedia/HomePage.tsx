import { Link } from "react-router-dom";
import { getDefaultForm, listGames, listPokemon, listRegions, listTypes } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { PokemonImage } from "../../components/encyclopedia/PokemonImage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function HomePage() {
  useDocumentTitle("Home");
  const { schema } = useEncyclopediaData();
  const featuredGames = listGames(schema).slice(0, 6);
  const featuredPokemon = listPokemon(schema).slice(0, 6);
  const featuredRegions = listRegions(schema).slice(0, 4);
  const featuredTypes = listTypes(schema).slice(0, 8);
  const featuredMoves = Object.values(schema.moves).slice(0, 5);
  const primaryPaths = [
    {
      label: "Browse by Game",
      body: "Start from a game and move through Pokemon, trainers, and locations without losing context.",
      href: "/games",
    },
    {
      label: "National Dex",
      body: "Use the full species index when you already know what you are looking for.",
      href: encyclopediaRoutes.nationalDex(),
    },
    {
      label: "Trainer Battles",
      body: "Filter battle appearances by game, role, region, and team member.",
      href: "/trainers/appearances",
    },
  ];
  const summary = {
    pokemonCount: Object.keys(schema.pokemon).length,
    formCount: Object.keys(schema.forms).length,
    moveCount: Object.keys(schema.moves).length,
    regionCount: Object.keys(schema.regions).length,
  };

  return (
    <main className="encyclopedia-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Pokemon Encyclopedia</p>
          <h1>PokeNav</h1>
          <p className="lead">
            A game-first Pokemon reference for browsing, cross-linking, and comparing everything across every generation.
          </p>
          <div className="hero-actions">
            <Link to="/games" className="primary-link">Browse by Game</Link>
            <Link to="/dex/national" className="secondary-link">National Dex</Link>
            <Link to="/search" className="secondary-link">Search</Link>
          </div>
        </div>
        <div>
          <div className="hero-showcase">
            <PokemonImage src={getDefaultForm(schema, featuredPokemon[0])?.artworkUrl} alt={featuredPokemon[0]?.name ?? "Pokemon"} className="hero-showcase-art" />
          </div>
          <div className="stats-cluster">
            <div><strong>{summary.pokemonCount}</strong><span>Pokemon</span></div>
            <div><strong>{summary.formCount}</strong><span>Forms</span></div>
            <div><strong>{summary.moveCount}</strong><span>Moves</span></div>
            <div><strong>{summary.regionCount}</strong><span>Regions</span></div>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-topline">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>Three ways to explore</h2>
          </div>
        </div>
        <div className="reference-grid homepage-primary-grid">
          {primaryPaths.map((path) => (
            <Link key={path.label} to={path.href} className="feature-panel feature-panel-primary">
              <span className="eyebrow">Primary path</span>
              <strong>{path.label}</strong>
              <span>{path.body}</span>
              <span className="feature-panel-cta">Open &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-grid two-up">
        <article className="content-card">
          <h2>Game hubs</h2>
          <div className="chip-grid">
            {featuredGames.map((game) => (
              <Link key={game.id} to={encyclopediaRoutes.game(game.slug)} className="entity-chip">
                <strong>{game.name}</strong>
                <span>{game.shortName}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="content-card">
          <h2>Quick jumps</h2>
          <div className="chip-grid">
            <Link to="/games/heartgold-soulsilver" className="entity-chip">
              <strong>HeartGold / SoulSilver</strong>
              <span>Game hub</span>
            </Link>
            <Link to="/trainers/appearances?game=heartgold-soulsilver" className="entity-chip">
              <strong>HGSS Trainers</strong>
              <span>Battle archive</span>
            </Link>
            <Link to="/dex/national?game=heartgold-soulsilver" className="entity-chip">
              <strong>HGSS Pokemon</strong>
              <span>Game-scoped dex</span>
            </Link>
            <Link to="/search?q=houndoom&game=heartgold-soulsilver" className="entity-chip">
              <strong>Search in HGSS</strong>
              <span>Focused search</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="content-grid two-up">
        <article className="content-card">
          <h2>Popular Pokemon</h2>
          <div className="chip-grid">
            {featuredPokemon.map((species) => (
              <Link key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} className="entity-chip">
                <span>#{species.nationalDexNumber.toString().padStart(4, "0")}</span>
                <strong>{species.name}</strong>
              </Link>
            ))}
          </div>
        </article>

        <article className="content-card">
          <h2>Trainer archive</h2>
          <div className="chip-grid">
            <Link to={encyclopediaRoutes.trainers()} className="entity-chip">
              <strong>Trainer Index</strong>
              <span>Overview pages</span>
            </Link>
            <Link to="/trainers/appearances" className="entity-chip">
              <strong>Battle Browser</strong>
              <span>Best for research</span>
            </Link>
            <Link to={encyclopediaRoutes.trainer("red")} className="entity-chip">
              <strong>Red</strong>
              <span>Trainer page</span>
            </Link>
            <Link to={encyclopediaRoutes.trainer("cynthia")} className="entity-chip">
              <strong>Cynthia</strong>
              <span>Champion</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="content-card">
        <div className="section-topline">
          <div>
            <p className="eyebrow">Explore more</p>
            <h2>Browse by category</h2>
          </div>
        </div>
        <div className="reference-grid">
          {[
            { label: "Regions", body: "Browse by world area and regional context.", href: encyclopediaRoutes.region(featuredRegions[0]?.slug ?? "kanto") },
            { label: "Types", body: "Follow matchup and category links.", href: encyclopediaRoutes.type(featuredTypes[0]?.slug ?? "fire") },
            { label: "Moves", body: "Open move entries and learner pages.", href: encyclopediaRoutes.move(featuredMoves[0]?.slug ?? "thunderbolt") },
            { label: "Abilities", body: "Trace ability holders across species.", href: encyclopediaRoutes.ability("static") },
          ].map((lane) => (
            <Link key={lane.label} to={lane.href} className="feature-panel">
              <strong>{lane.label}</strong>
              <span>{lane.body}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-grid two-up">
        <article className="content-card">
          <h2>Regions</h2>
          <div className="chip-grid">
            {featuredRegions.map((region) => (
              <Link key={region.id} to={encyclopediaRoutes.region(region.slug)} className="entity-chip">
                <strong>{region.name}</strong>
                <span>{region.generationLabel}</span>
              </Link>
            ))}
          </div>
        </article>
        <article className="content-card">
          <h2>Types</h2>
          <div className="type-chip-row">
            {featuredTypes.map((type) => (
              <Link key={type.id} to={encyclopediaRoutes.type(type.slug)} className="type-chip" style={{ ["--type-color" as string]: type.colorToken }}>
                {type.name}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid two-up">
        <article className="content-card">
          <h2>Sample entries</h2>
          <div className="chip-grid">
            {featuredMoves.map((move) => (
              <Link key={move.id} to={encyclopediaRoutes.move(move.slug)} className="entity-chip">
                <strong>{move.name}</strong>
                <span>{schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")} move</span>
              </Link>
            ))}
          </div>
          <div className="chip-grid">
            {Object.values(schema.abilities).slice(0, 4).map((ability) => (
              <Link key={ability.id} to={encyclopediaRoutes.ability(ability.slug)} className="entity-chip">
                <strong>{ability.name}</strong>
                <span>Ability</span>
              </Link>
            ))}
          </div>
        </article>
        <article className="content-card">
          <h2>What PokeNav covers</h2>
          <ul className="text-list">
            <li>Version-specific flavor text, locations, and learnsets</li>
            <li>Cross-linked pages for Pokemon, moves, abilities, items, regions, games, and locations</li>
            <li>Missing-data placeholders instead of fake completeness</li>
            <li>Offline-first dataset generation with shardable detail files</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
