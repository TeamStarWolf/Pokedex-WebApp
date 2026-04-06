// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useParams, useSearchParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { PlaceholderBlock } from "../../components/encyclopedia/PlaceholderBlock";
import { SectionStatusNote } from "../../components/encyclopedia/SectionStatusNote";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { StatBarChart } from "../../components/encyclopedia/StatBarChart";
import { PokemonImage } from "../../components/encyclopedia/PokemonImage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData, usePokemonDetailData } from "../../hooks/useEncyclopediaData";
import { useTrainerPresets } from "../../hooks/useTrainerPresets";
import {
  formatEggGroup,
  formatGenderRatio,
  formatHeight,
  formatMethodLabel,
  formatWeight,
  getAbilitiesForForm,
  getDefaultForm,
  getEvolutionFamily,
  getFormsForSpecies,
  getGameBySlug,
  getLocationsForSpecies,
  getPokedexEntriesForSpecies,
  getSpeciesBySlug,
  getStatTotal,
  getTypeEffectivenessSummary,
  groupLearnsetByMethod,
} from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { getTrainerAppearancesForPokemon } from "../../lib/trainerEncyclopedia";

const LEARNSET_PREVIEW_LIMIT = 20;

export function PokemonDetailPage() {
  const { speciesSlug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { schema: indexSchema } = useEncyclopediaData();
  const { schema, loading, error, source } = usePokemonDetailData(speciesSlug);
  const { appearances: trainerAppearances, loading: trainerLoading } = useTrainerPresets();
  const species = getSpeciesBySlug(schema, speciesSlug) ?? getSpeciesBySlug(indexSchema, speciesSlug);
  useDocumentTitle(species?.name ?? "Pokemon");

  if (!species) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Pokemon not found</h1></section></main>;
  }

  const activeGameSlug = searchParams.get("game") ?? "";
  const activeGame = activeGameSlug ? getGameBySlug(schema, activeGameSlug) ?? getGameBySlug(indexSchema, activeGameSlug) : null;
  const form = getDefaultForm(schema, species);
  if (!form) return null;

  const abilities = getAbilitiesForForm(schema, form);
  const forms = getFormsForSpecies(schema, species);
  const pokedexEntries = getPokedexEntriesForSpecies(species, activeGame?.id);
  const learnsetGroups = groupLearnsetByMethod(schema, form, activeGame?.id);
  const locations = getLocationsForSpecies(schema, species, activeGame?.id);
  const family = getEvolutionFamily(schema, species);
  const effectiveness = getTypeEffectivenessSummary(schema, form);
  const hiddenAbility = abilities.find((ability) => form.abilitySlots.find((slot) => slot.abilityId === ability.id && slot.isHidden));
  const statTotal = getStatTotal(form.stats);
  const uniqueMoveCount = new Set(learnsetGroups.flatMap((group) => group.entries.map((entry) => entry.move.id))).size;
  const trainerMatches = getTrainerAppearancesForPokemon(trainerAppearances, species.nationalDexNumber, activeGame?.slug).slice(0, 6);
  const biologyStatus = species.loreSummary.length ? "partial" as const : "missing" as const;
  const gameDataStatus = source === "generated" ? "partial" as const : "planned" as const;
  const movesStatus = learnsetGroups.length ? "partial" as const : "missing" as const;
  const locationsStatus = locations.length ? "partial" as const : "planned" as const;
  const triviaStatus = species.trivia.length || species.competitiveSummary.length ? "partial" as const : "planned" as const;
  const sectionTabs = [
    { id: "biology", label: "Biology", status: biologyStatus },
    { id: "game-data", label: "Stats & Data", status: gameDataStatus },
    { id: "moves", label: "Moves", status: movesStatus },
    { id: "locations", label: "Locations", status: locationsStatus },
    { id: "trivia", label: "Trivia", status: triviaStatus },
  ];
  const knownRegionIds = Array.from(
    new Set(
      locations
        .map((location) => location.regionId)
        .filter((regionId): regionId is NonNullable<typeof locations[number]["regionId"]> => Boolean(regionId)),
    ),
  );
  const displayGameIds = activeGame
    ? [activeGame.id]
    : Array.from(
        new Set((species.pokedexGameIds.length ? species.pokedexGameIds : pokedexEntries.map((entry) => entry.gameVersionId)).filter(Boolean)),
      );
  const abilityLinks = abilities.map((ability, index) => (
    <span key={ability.id}>
      {index ? ", " : ""}
      <GameScopedLink to={encyclopediaRoutes.ability(ability.slug)}>{ability.name}</GameScopedLink>
    </span>
  ));

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "National Dex", href: encyclopediaRoutes.nationalDex() }, { label: species.name }]} />
      <section className="pokemon-title-deck content-card">
        <div>
          <p className="eyebrow">Pokemon dossier</p>
          <h1>{species.name}</h1>
          <p className="lead">
            #{species.nationalDexNumber.toString().padStart(4, "0")} · {species.categoryLabel} · Gen {species.generation || "Unknown"}
          </p>
          <p className="muted">{species.summary}</p>
          {activeGame ? (
            <p className="muted">
              Scoped to {activeGame.name}. Flavor text, moves, locations, and trainer links below now prefer this game context.
            </p>
          ) : null}
        </div>
        <div className="title-deck-metrics">
          <div>
            <strong>{forms.length}</strong>
            <span>Forms</span>
          </div>
          <div>
            <strong>{activeGame ? pokedexEntries.length : species.pokedexGameIds.length || pokedexEntries.length}</strong>
            <span>{activeGame ? "Entries in scope" : "Dex versions"}</span>
          </div>
          <div>
            <strong>{uniqueMoveCount}</strong>
            <span>{activeGame ? "Moves in scope" : "Unique moves"}</span>
          </div>
          <div>
            <strong>{statTotal}</strong>
            <span>BST</span>
          </div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={species.name}
          subtitle={`${species.categoryLabel} · #${species.nationalDexNumber.toString().padStart(4, "0")}`}
          media={<PokemonImage src={form.artworkUrl} alt={species.name} className="hero-art" />}
          badges={form.typeIds.map((typeId) => (
            <GameScopedLink key={typeId} to={encyclopediaRoutes.type(typeId.replace("type:", ""))} className="type-chip muted-chip">
              {typeId.replace("type:", "")}
            </GameScopedLink>
          ))}
          rows={[
            { label: "Generation", value: `Gen ${species.generation || "Unknown"}` },
            {
              label: "Types",
              value: form.typeIds.map((typeId, index) => (
                <span key={typeId}>
                  {index ? " / " : ""}
                  <GameScopedLink to={encyclopediaRoutes.type(typeId.replace("type:", ""))}>
                    {schema.types[typeId]?.name ?? typeId.replace("type:", "")}
                  </GameScopedLink>
                </span>
              )),
            },
            { label: "Abilities", value: abilityLinks },
            { label: "Hidden ability", value: hiddenAbility ? <GameScopedLink to={encyclopediaRoutes.ability(hiddenAbility.slug)}>{hiddenAbility.name}</GameScopedLink> : "Unknown" },
            { label: "Height", value: formatHeight(form.heightDecimetres) },
            { label: "Weight", value: formatWeight(form.weightHectograms) },
            { label: "Egg groups", value: species.eggGroups.map(formatEggGroup).join(", ") || "Unknown" },
            { label: "Gender ratio", value: formatGenderRatio(species.genderRatio) },
            { label: "Catch rate", value: species.captureRate ?? "Unknown" },
            { label: "Base friendship", value: species.baseFriendship ?? "Unknown" },
            { label: "Growth rate", value: species.growthRate ?? "Unknown" },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel
            tabs={sectionTabs}
            status={species.status}
            sourceRefs={species.sourceRefs}
            expansionNotes={species.expansionNotes}
          />
          <SectionTabs tabs={sectionTabs} />

          <section className="content-card encyclopedia-overview-grid">
            <div className="overview-panel">
              <p className="eyebrow">Quick reference</p>
              <h2>At a glance</h2>
              <div className="overview-metric-grid">
                <div>
                  <strong>{statTotal}</strong>
                  <span>Base stat total</span>
                </div>
                <div>
                  <strong>{locations.length}</strong>
                  <span>{activeGame ? "Locations in scope" : "Locations"}</span>
                </div>
                <div>
                  <strong>{species.relatedItemIds.length + form.heldItemIds.length}</strong>
                  <span>Linked items</span>
                </div>
                <div>
                  <strong>{family.length}</strong>
                  <span>Evolution family</span>
                </div>
              </div>
            </div>
            <div className="overview-panel">
              <p className="eyebrow">Cross-links</p>
              <h2>{activeGame ? `Browse in ${activeGame.shortName}` : "Browse outward"}</h2>
              <div className="chip-grid">
                {activeGame ? (
                  <>
                    <GameScopedLink to={encyclopediaRoutes.game(activeGame.slug)} preserveGame={false} className="entity-chip">
                      <strong>{activeGame.name}</strong>
                      <span>Game page</span>
                    </GameScopedLink>
                    <GameScopedLink to={encyclopediaRoutes.gamePokemon(activeGame.slug)} preserveGame={false} className="entity-chip">
                      <strong>{activeGame.shortName} Dex</strong>
                      <span>Game-scoped Pokemon</span>
                    </GameScopedLink>
                    <GameScopedLink
                      to={`${encyclopediaRoutes.trainerAppearances()}?game=${activeGame.slug}&pokemon=${species.nationalDexNumber}`}
                      preserveGame={false}
                      className="entity-chip"
                    >
                      <strong>{activeGame.shortName} trainer battles</strong>
                      <span>Battle archive</span>
                    </GameScopedLink>
                  </>
                ) : null}
                {knownRegionIds.map((regionId) => (
                  <GameScopedLink key={regionId} to={encyclopediaRoutes.region(regionId.replace("region:", ""))} className="entity-chip">
                    <strong>{schema.regions[regionId]?.name ?? regionId.replace("region:", "")}</strong>
                    <span>Region</span>
                  </GameScopedLink>
                ))}
                {displayGameIds.slice(0, 4).map((gameId) => (
                  <GameScopedLink key={gameId} to={encyclopediaRoutes.game(gameId.replace("game:", ""))} preserveGame={false} className="entity-chip">
                    <strong>{schema.gameVersions[gameId]?.shortName ?? gameId.replace("game:", "")}</strong>
                    <span>Game</span>
                  </GameScopedLink>
                ))}
                {species.relatedItemIds.slice(0, 3).map((itemId) => (
                  <GameScopedLink key={itemId} to={encyclopediaRoutes.item(itemId.replace("item:", ""))} className="entity-chip">
                    <strong>{schema.items[itemId]?.name ?? itemId.replace("item:", "")}</strong>
                    <span>Item</span>
                  </GameScopedLink>
                ))}
              </div>
            </div>
            <div className="overview-panel">
              <p className="eyebrow">Trainer usage</p>
              <h2>{activeGame ? `Used in ${activeGame.shortName}` : "Used by trainers"}</h2>
              {trainerLoading ? (
                <p className="muted">Loading trainer battle references...</p>
              ) : trainerMatches.length ? (
                <div className="chip-grid">
                  {trainerMatches.map((appearance) => (
                    <GameScopedLink
                      key={appearance.slug}
                      to={encyclopediaRoutes.trainerAppearance(appearance.trainerSlug, appearance.slug)}
                      preserveGame={false}
                      className="entity-chip"
                    >
                      <strong>{appearance.trainer}</strong>
                      <span>{appearance.battleLabel} · {appearance.sourceGame}</span>
                    </GameScopedLink>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  {activeGame
                    ? `No trainer battle references are currently linked for ${species.name} in ${activeGame.name}.`
                    : `No trainer battle references are currently linked for ${species.name}.`}
                </p>
              )}
              <div className="chip-grid">
                <GameScopedLink
                  to={`${encyclopediaRoutes.trainerAppearances()}?pokemon=${species.nationalDexNumber}${activeGame ? `&game=${activeGame.slug}` : ""}`}
                  preserveGame={false}
                  className="entity-chip"
                >
                  <strong>Open trainer battle browser</strong>
                  <span>{activeGame ? `${activeGame.shortName} filtered` : "Search all trainer appearances"}</span>
                </GameScopedLink>
              </div>
            </div>
          </section>

          <section id="biology" className="content-card">
            <h2>Biology and lore</h2>
            <SectionStatusNote
              status={biologyStatus}
              title="Biology coverage is expanding"
              body="Driven by imported species summaries and structural metadata. Richer lore and media sources will be added over time."
            />
            <div className="reference-grid">
              <div>
                <h3>Profile</h3>
                <p>{species.summary}</p>
                <ul className="text-list">
                  {species.loreSummary.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </div>
              <div>
                <h3>Breeding data</h3>
                <ul className="text-list">
                  <li>Egg groups: {species.eggGroups.map(formatEggGroup).join(", ") || "Unknown"}</li>
                  <li>Growth rate: {species.growthRate ?? "Unknown"}</li>
                  <li>Base friendship: {species.baseFriendship ?? "Unknown"}</li>
                  <li>Hatch counter: {species.hatchCounter ?? "Unknown"}</li>
                </ul>
                <h3>Form notes</h3>
                <div className="chip-grid">
                  {forms.map((entry) => (
                    <GameScopedLink key={entry.id} to={encyclopediaRoutes.pokemonForm(species.slug, entry.slug)} className="entity-chip">
                      <strong>{entry.formName}</strong>
                      <span>{entry.formKind}</span>
                    </GameScopedLink>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="game-data" className="content-card">
            <h2>Stats and game data</h2>
            <SectionStatusNote
              status={gameDataStatus}
              title="Game data sourced from PokeAPI"
              body={activeGame
                ? `Stats, forms, and flavor text are wired. This section is currently scoped to ${activeGame.name}.`
                : "Stats, forms, and flavor text are wired. Some data still reflects a partial import."}
            />
            {source === "index" ? (
              <PlaceholderBlock title="Loading full entry" body={loading ? "Fetching species dossier, learnsets, and flavor text..." : error ?? "Detailed species data is unavailable right now."} />
            ) : null}
            <div className="info-columns">
              <div>
                <h3>Base stats</h3>
                <StatBarChart stats={form.stats} />
              </div>
              <div>
                <h3>EV yield</h3>
                <dl className="stat-grid">
                  {Object.entries(form.evYield).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
                </dl>
              </div>
            </div>
            <h3>Forms and variants</h3>
            <div className="chip-grid">
              {forms.map((entry) => (
                <GameScopedLink key={entry.id} to={encyclopediaRoutes.pokemonForm(species.slug, entry.slug)} className="entity-chip">
                  <strong>{entry.formName}</strong>
                  <span>{entry.typeIds.map((typeId) => schema.types[typeId]?.name ?? typeId.replace("type:", "")).join(" / ")}</span>
                </GameScopedLink>
              ))}
            </div>
            <h3>Pokedex flavor entries</h3>
            <div className="text-list">
              {pokedexEntries.length ? pokedexEntries.map((entry) => (
                <p key={`${entry.gameVersionId}-${entry.text}`}>
                  <strong>
                    <GameScopedLink to={encyclopediaRoutes.game(entry.gameVersionId.replace("game:", ""))} preserveGame={false}>
                      {schema.gameVersions[entry.gameVersionId]?.shortName ?? entry.gameVersionId.replace("game:", "")}
                    </GameScopedLink>
                    :
                  </strong>{" "}
                  {entry.text}
                </p>
              )) : <p className="muted">{activeGame ? `No imported flavor text is available for ${species.name} in ${activeGame.name}.` : "Version-specific flavor text loads from the species detail dataset."}</p>}
            </div>
          </section>

          <section id="moves" className="content-card">
            <h2>Moves</h2>
            <SectionStatusNote
              status={movesStatus}
              title="Learnset preview"
              body={activeGame
                ? `Shows a ${activeGame.name}-scoped preview of moves per method. Open the full learnset for the complete in-scope move list.`
                : "Shows a preview of moves per method. Open the full learnset for the complete version-specific move list."}
            />
            <div className="chip-grid">
              <GameScopedLink to={encyclopediaRoutes.pokemonMoves(species.slug)} className="entity-chip">
                <strong>Open full learnset</strong>
                <span>{uniqueMoveCount} {activeGame ? `${activeGame.shortName} moves` : `unique moves for ${species.name}`}</span>
              </GameScopedLink>
            </div>
            {learnsetGroups.length ? learnsetGroups.map((group) => (
              <details key={group.method} className="learnset-group" open={group.method === "level-up"}>
                <summary className="learnset-group-header">
                  <div>
                    <h3>{formatMethodLabel(group.method)}</h3>
                    <p className="muted">{group.entries.length} entries{group.entries.length > LEARNSET_PREVIEW_LIMIT ? ` · showing first ${LEARNSET_PREVIEW_LIMIT}` : ""}</p>
                  </div>
                  <span className="learnset-count">{group.entries.length}</span>
                </summary>
                <div className="compact-learnset-table" role="table" aria-label={`${formatMethodLabel(group.method)} learnset`}>
                  <div className="compact-learnset-head" role="row">
                    <span>Move</span>
                    <span>Acquisition</span>
                    <span>Game</span>
                  </div>
                  {group.entries.slice(0, LEARNSET_PREVIEW_LIMIT).map((entry) => (
                    <div key={`${entry.move.id}-${entry.order}`} className="compact-learnset-row" role="row">
                      <GameScopedLink to={encyclopediaRoutes.move(entry.move.slug)} className="learnset-move-link">
                        <strong>{entry.move.name}</strong>
                      </GameScopedLink>
                      <span>{entry.level ? `Lv. ${entry.level} ${formatMethodLabel(entry.method)}` : formatMethodLabel(entry.method)}</span>
                      <GameScopedLink to={encyclopediaRoutes.game(entry.game.slug)} preserveGame={false} className="learnset-game-link">
                        {entry.game.shortName}
                      </GameScopedLink>
                    </div>
                  ))}
                </div>
              </details>
            )) : <PlaceholderBlock title="Learnset pending" body={activeGame ? `No imported move records were found for ${species.name} in ${activeGame.name}.` : "This route is wired for per-species move data and will populate once the detail slice is available."} />}
          </section>

          <section id="locations" className="content-card">
            <h2>Locations</h2>
            <SectionStatusNote
              status={locationsStatus}
              title="Location coverage is partial"
              body={activeGame
                ? `The schema supports full encounter data. This section is currently scoped to ${activeGame.name}.`
                : "The schema supports full encounter data. Some species only have location links while the import pipeline grows."}
            />
            <div className="reference-grid compact">
              <div>
                <h3>Game coverage</h3>
                <div className="chip-grid">
                  {displayGameIds.map((gameId) => (
                    <GameScopedLink key={gameId} to={encyclopediaRoutes.game(gameId.replace("game:", ""))} preserveGame={false} className="entity-chip">
                      <strong>{schema.gameVersions[gameId]?.name ?? gameId.replace("game:", "")}</strong>
                    </GameScopedLink>
                  ))}
                </div>
              </div>
              <div>
                <h3>Regions</h3>
                {knownRegionIds.length ? (
                  <div className="chip-grid">
                    {knownRegionIds.map((regionId) => (
                      <GameScopedLink key={regionId} to={encyclopediaRoutes.region(regionId.replace("region:", ""))} className="entity-chip">
                        <strong>{schema.regions[regionId]?.name ?? regionId.replace("region:", "")}</strong>
                      </GameScopedLink>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Region links will strengthen as encounter imports expand.</p>
                )}
              </div>
            </div>
            {locations.length ? (
              <div className="location-table" role="table" aria-label="Known locations by game">
                <div className="location-table-head" role="row">
                  <span>Location</span>
                  <span>Region</span>
                  <span>Games</span>
                  <span>Notes</span>
                </div>
                {locations.map((location) => (
                  <div key={location.id} className="location-row" role="row">
                    <GameScopedLink to={encyclopediaRoutes.location(location.slug)} className="location-name-link">
                      <strong>{location.name}</strong>
                    </GameScopedLink>
                    <span>
                      {location.regionId ? (
                        <GameScopedLink to={encyclopediaRoutes.region(location.regionId.replace("region:", ""))}>
                          {schema.regions[location.regionId]?.name ?? location.regionId.replace("region:", "")}
                        </GameScopedLink>
                      ) : "Unknown"}
                    </span>
                    <span>{location.gameVersionIds.map((id) => schema.gameVersions[id]?.shortName).filter(Boolean).join(", ") || "Unknown"}</span>
                    <span>{location.encounterTable.length ? `${location.encounterTable.length} encounters` : "Link only"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <PlaceholderBlock title="Locations pending" body={activeGame ? `No imported location records are currently linked for ${species.name} in ${activeGame.name}.` : "No wild encounter data is available yet for this species."} />
            )}
            <h3>Held items</h3>
            <div className="chip-grid">
              {form.heldItemIds.length ? form.heldItemIds.map((itemId) => (
                <GameScopedLink key={itemId} to={encyclopediaRoutes.item(itemId.replace("item:", ""))} className="entity-chip">
                  <strong>{schema.items[itemId]?.name ?? itemId.replace("item:", "")}</strong>
                </GameScopedLink>
              )) : <span className="muted">No held items available.</span>}
            </div>
          </section>

          <section id="trivia" className="content-card">
            <h2>Evolution, effectiveness, and trivia</h2>
            <SectionStatusNote
              status={triviaStatus}
              title="Curated summaries"
              body="Compact synthesis for orientation. Full sourced articles will come in future updates."
            />
            <div className="reference-grid">
              <div>
                <h3>Evolution family</h3>
                <div className="chip-grid">
                  {family.map((entry) => (
                    <GameScopedLink key={entry.id} to={encyclopediaRoutes.pokemon(entry.slug)} className="entity-chip">
                      <strong>{entry.name}</strong>
                    </GameScopedLink>
                  ))}
                </div>
                <h3>Competitive summary</h3>
                <ul className="text-list">
                  {species.competitiveSummary.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </div>
              <div>
                <h3>Type effectiveness</h3>
                <div className="chip-grid">
                  {effectiveness.slice(0, 8).map((entry) => (
                    <span key={entry.type.id} className="entity-chip">
                      <strong>{entry.type.name}</strong>
                      <span>{entry.multiplier}x</span>
                    </span>
                  ))}
                </div>
                <h3>Trivia</h3>
                <ul className="text-list">
                  {species.trivia.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
