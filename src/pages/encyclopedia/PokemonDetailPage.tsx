import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { GameScopedLink } from "../../components/encyclopedia/GameScopedLink";
import { PlaceholderBlock } from "../../components/encyclopedia/PlaceholderBlock";
import { SectionStatusNote } from "../../components/encyclopedia/SectionStatusNote";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { useEncyclopediaData, usePokemonDetailData } from "../../hooks/useEncyclopediaData";
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
  getLocationsForSpecies,
  getSpeciesBySlug,
  getStatTotal,
  getTypeEffectivenessSummary,
  groupLearnsetByMethod,
} from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function PokemonDetailPage() {
  const { speciesSlug = "" } = useParams();
  const { schema: indexSchema } = useEncyclopediaData();
  const { schema, loading, error, source } = usePokemonDetailData(speciesSlug);
  const species = getSpeciesBySlug(schema, speciesSlug) ?? getSpeciesBySlug(indexSchema, speciesSlug);
  if (!species) return <main className="encyclopedia-page"><section className="content-card"><h1>Pokemon not found</h1></section></main>;

  const form = getDefaultForm(schema, species);
  if (!form) return null;

  const abilities = getAbilitiesForForm(schema, form);
  const forms = getFormsForSpecies(schema, species);
  const learnsetGroups = groupLearnsetByMethod(schema, form);
  const locations = getLocationsForSpecies(schema, species);
  const family = getEvolutionFamily(schema, species);
  const effectiveness = getTypeEffectivenessSummary(schema, form);
  const hiddenAbility = abilities.find((ability) => form.abilitySlots.find((slot) => slot.abilityId === ability.id && slot.isHidden));
  const statTotal = getStatTotal(form.stats);
  const biologyStatus = species.loreSummary.length ? "partial" as const : "missing" as const;
  const gameDataStatus = source === "generated" ? "partial" as const : "planned" as const;
  const movesStatus = learnsetGroups.length ? "partial" as const : "missing" as const;
  const locationsStatus = locations.length ? "partial" as const : "planned" as const;
  const triviaStatus = species.trivia.length || species.competitiveSummary.length ? "partial" as const : "planned" as const;
  const sectionTabs = [
    { id: "biology", label: "Biology and lore", status: biologyStatus },
    { id: "game-data", label: "Game data", status: gameDataStatus },
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
  const abilityLinks = abilities.map((ability, index) => (
    <span key={ability.id}>
      {index ? ", " : ""}
      <Link to={encyclopediaRoutes.ability(ability.slug)}>{ability.name}</Link>
    </span>
  ));

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "National Dex", href: "/dex/national" }, { label: species.name }]} />
      <section className="pokemon-title-deck content-card">
        <div>
          <p className="eyebrow">Pokemon dossier</p>
          <h1>{species.name}</h1>
          <p className="lead">
            National Dex #{species.nationalDexNumber.toString().padStart(4, "0")} | {species.categoryLabel} | Gen {species.generation || "Unknown"}
          </p>
          <p className="muted">
            {species.summary}
          </p>
        </div>
        <div className="title-deck-metrics">
          <div>
            <strong>{forms.length}</strong>
            <span>Forms</span>
          </div>
          <div>
            <strong>{species.pokedexGameIds.length || species.pokedexEntries.length}</strong>
            <span>Dex versions</span>
          </div>
          <div>
            <strong>{form.learnset.length}</strong>
            <span>Known moves</span>
          </div>
          <div>
            <strong>{statTotal}</strong>
            <span>Base stat total</span>
          </div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={species.name}
          subtitle={`${species.categoryLabel} | National Dex #${species.nationalDexNumber.toString().padStart(4, "0")}`}
          media={<img src={form.artworkUrl} alt={species.name} className="hero-art" />}
          badges={form.typeIds.map((typeId) => (
            <Link key={typeId} to={encyclopediaRoutes.type(typeId.replace("type:", ""))} className="type-chip muted-chip">
              {typeId.replace("type:", "")}
            </Link>
          ))}
          rows={[
            { label: "Generation", value: `Gen ${species.generation || "Unknown"}` },
            { label: "Types", value: form.typeIds.map((typeId, index) => <span key={typeId}>{index ? " / " : ""}<Link to={encyclopediaRoutes.type(typeId.replace("type:", ""))}>{schema.types[typeId]?.name ?? typeId.replace("type:", "")}</Link></span>) },
            { label: "Abilities", value: abilityLinks },
            { label: "Hidden ability", value: hiddenAbility ? <Link to={encyclopediaRoutes.ability(hiddenAbility.slug)}>{hiddenAbility.name}</Link> : "Unknown" },
            { label: "Height", value: formatHeight(form.heightDecimetres) },
            { label: "Weight", value: formatWeight(form.weightHectograms) },
            { label: "Egg groups", value: species.eggGroups.map(formatEggGroup).join(", ") || "Unknown" },
            { label: "Gender ratio", value: formatGenderRatio(species.genderRatio) },
            { label: "Catch rate", value: species.captureRate ?? "Unknown" },
            { label: "Base friendship", value: species.baseFriendship ?? "Unknown" },
            { label: "Growth rate", value: species.growthRate ?? "Unknown" },
            { label: "Hatch counter", value: species.hatchCounter ?? "Unknown" },
            { label: "Browse tags", value: species.browseTags.length ? species.browseTags.join(", ") : "None tagged yet" },
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
                  <span>Seeded locations</span>
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
              <h2>Browse outward</h2>
              <div className="chip-grid">
                {knownRegionIds.map((regionId) => (
                  <GameScopedLink key={regionId} to={encyclopediaRoutes.region(regionId.replace("region:", ""))} className="entity-chip">
                    <strong>{schema.regions[regionId]?.name ?? regionId.replace("region:", "")}</strong>
                    <span>Region page</span>
                  </GameScopedLink>
                ))}
                {species.pokedexGameIds.slice(0, 4).map((gameId) => (
                  <GameScopedLink key={gameId} to={encyclopediaRoutes.game(gameId.replace("game:", ""))} preserveGame={false} className="entity-chip">
                    <strong>{schema.gameVersions[gameId]?.shortName ?? gameId.replace("game:", "")}</strong>
                    <span>Game page</span>
                  </GameScopedLink>
                ))}
                {species.relatedItemIds.slice(0, 3).map((itemId) => (
                  <GameScopedLink key={itemId} to={encyclopediaRoutes.item(itemId.replace("item:", ""))} className="entity-chip">
                    <strong>{schema.items[itemId]?.name ?? itemId.replace("item:", "")}</strong>
                    <span>Item page</span>
                  </GameScopedLink>
                ))}
              </div>
            </div>
          </section>

          <section id="biology" className="content-card">
            <h2>Biology and lore</h2>
            <SectionStatusNote
              status={biologyStatus}
              title="Biology coverage is still expanding"
              body="This section is driven by imported species summaries and structural metadata today. It will get stronger as richer lore and media sources are normalized."
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
            <h2>Game data</h2>
            <SectionStatusNote
              status={gameDataStatus}
              title="Game data is sourced, but not fully exhaustive"
              body="Stats, forms, and flavor text are wired correctly, but this article still reflects a partial import rather than a final game-perfect reference."
            />
            {source === "index" ? (
              <PlaceholderBlock title="Loading full entry" body={loading ? "Fetching the full species dossier, learnsets, and flavor text." : error ?? "Detailed species data is unavailable right now."} />
            ) : null}
            <div className="info-columns">
              <div>
                <h3>Base stats</h3>
                <dl className="stat-grid">
                  {Object.entries(form.stats).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
                </dl>
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
              {species.pokedexEntries.length ? species.pokedexEntries.map((entry) => (
                <p key={`${entry.gameVersionId}-${entry.text}`}>
                  <strong>
                    <Link to={encyclopediaRoutes.game(entry.gameVersionId.replace("game:", ""))}>
                      {schema.gameVersions[entry.gameVersionId]?.shortName ?? entry.gameVersionId.replace("game:", "")}
                    </Link>
                    :
                  </strong>{" "}
                  {entry.text}
                </p>
              )) : <p className="muted">Version-specific flavor text loads from the species detail dataset.</p>}
            </div>
          </section>

          <section id="moves" className="content-card">
            <h2>Moves</h2>
            <SectionStatusNote
              status={movesStatus}
              title="Moves are intentionally split"
              body="This page shows a manageable preview. Use the full learnset route when you want the complete version-specific move list without overcrowding the main article."
            />
            <p className="muted">Compact learnset preview for the current form. Open a group to inspect the entries.</p>
            <div className="chip-grid">
              <GameScopedLink to={encyclopediaRoutes.pokemonMoves(species.slug)} className="entity-chip">
                <strong>Open full learnset</strong>
                <span>See every move entry for {species.name}</span>
              </GameScopedLink>
            </div>
            {learnsetGroups.length ? learnsetGroups.map((group) => (
              <details key={group.method} className="learnset-group" open={group.method === "level-up"}>
                <summary className="learnset-group-header">
                  <div>
                    <h3>{formatMethodLabel(group.method)}</h3>
                    <p className="muted">Showing {Math.min(group.entries.length, 12)} of {group.entries.length} entries.</p>
                  </div>
                  <span className="learnset-count">{group.entries.length}</span>
                </summary>
                <div className="compact-learnset-table" role="table" aria-label={`${formatMethodLabel(group.method)} learnset`}>
                  <div className="compact-learnset-head" role="row">
                    <span>Move</span>
                    <span>Acquisition</span>
                    <span>Game</span>
                  </div>
                  {group.entries.slice(0, 12).map((entry) => (
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
            )) : <PlaceholderBlock title="Learnset pending" body="This route is wired for per-species move data and will populate once the detail slice is available." />}
          </section>

          <section id="locations" className="content-card">
            <h2>Locations by game</h2>
            <SectionStatusNote
              status={locationsStatus}
              title="Location coverage is partial"
              body="The schema supports full encounter data, but some species still only have location links or seeded encounter slices while the import pipeline grows."
            />
            <div className="reference-grid compact">
              <div>
                <h3>Game coverage</h3>
                <div className="chip-grid">
                  {(species.pokedexGameIds.length ? species.pokedexGameIds : species.pokedexEntries.map((entry) => entry.gameVersionId)).map((gameId) => (
                    <GameScopedLink key={gameId} to={encyclopediaRoutes.game(gameId.replace("game:", ""))} preserveGame={false} className="entity-chip">
                      <strong>{schema.gameVersions[gameId]?.name ?? gameId.replace("game:", "")}</strong>
                    </GameScopedLink>
                  ))}
                </div>
              </div>
              <div>
                <h3>Regional context</h3>
                {knownRegionIds.length ? (
                  <div className="chip-grid">
                    {knownRegionIds.map((regionId) => (
                      <GameScopedLink key={regionId} to={encyclopediaRoutes.region(regionId.replace("region:", ""))} className="entity-chip">
                        <strong>{schema.regions[regionId]?.name ?? regionId.replace("region:", "")}</strong>
                      </GameScopedLink>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Region links will strengthen as encounter and location imports expand.</p>
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
                        <Link to={encyclopediaRoutes.region(location.regionId.replace("region:", ""))}>
                          {schema.regions[location.regionId]?.name ?? location.regionId.replace("region:", "")}
                        </Link>
                      ) : "Unknown"}
                    </span>
                    <span>{location.gameVersionIds.map((id) => schema.gameVersions[id]?.shortName).filter(Boolean).join(", ") || "Unknown"}</span>
                    <span>{location.encounterTable.length ? `${location.encounterTable.length} encounter records` : "Location link only"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <PlaceholderBlock title="Locations pending" body="No direct wild encounter slice is available yet for this species. The route and schema are ready for per-game encounter imports." />
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
              title="Reference notes are curated summaries"
              body="This closing section is useful for orientation, but it is still a compact synthesis rather than a fully sourced long-form article."
            />
            <div className="reference-grid">
              <div>
                <h3>Evolution family</h3>
                <div className="chip-grid">
                  {family.map((entry) => <GameScopedLink key={entry.id} to={encyclopediaRoutes.pokemon(entry.slug)} className="entity-chip"><strong>{entry.name}</strong></GameScopedLink>)}
                </div>
                <h3>Competitive summary</h3>
                <ul className="text-list">
                  {species.competitiveSummary.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </div>
              <div>
                <h3>Type effectiveness</h3>
                <div className="chip-grid">
                  {effectiveness.slice(0, 8).map((entry) => <span key={entry.type.id} className="entity-chip"><strong>{entry.type.name}</strong><span>{entry.multiplier}x</span></span>)}
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
