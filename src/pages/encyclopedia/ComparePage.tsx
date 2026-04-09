// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { StatBarChart } from "../../components/encyclopedia/StatBarChart";
import {
  formatEggGroup,
  formatGenderRatio,
  formatHeight,
  formatWeight,
  getAbilitiesForForm,
  getComparableStats,
  getDefaultForm,
  getHeadToHeadMatchup,
  getSharedMoveIds,
  getSpeciesBySlug,
  getStatTotal,
  getTypeEffectivenessSummary,
  listPokemon,
} from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "selectors", label: "Selectors" },
  { id: "stats", label: "Stats" },
  { id: "types", label: "Type matchup" },
  { id: "profile", label: "Profile" },
  { id: "moves", label: "Moves" },
];

function MultiplierLabel({ value }: { value: number }) {
  if (value === 0) return <span className="compare-multiplier immune">0x</span>;
  if (value < 1) return <span className="compare-multiplier resist">{value}x</span>;
  if (value > 1) return <span className="compare-multiplier weak">{value}x</span>;
  return <span className="compare-multiplier neutral">1x</span>;
}

export function ComparePage() {
  useDocumentTitle("Compare");
  const [searchParams, setSearchParams] = useSearchParams();
  const { schema } = useEncyclopediaData();
  const leftSlug = searchParams.get("left") ?? "charizard";
  const rightSlug = searchParams.get("right") ?? "venusaur";
  const left = getSpeciesBySlug(schema, leftSlug);
  const right = getSpeciesBySlug(schema, rightSlug);
  const all = listPokemon(schema);
  const leftForm = left ? getDefaultForm(schema, left) : null;
  const rightForm = right ? getDefaultForm(schema, right) : null;
  const leftTotal = leftForm ? getStatTotal(leftForm.stats) : null;
  const rightTotal = rightForm ? getStatTotal(rightForm.stats) : null;
  const statKeys = Object.keys(leftForm?.stats ?? rightForm?.stats ?? {}) as Array<keyof NonNullable<typeof leftForm>["stats"]>;

  // Type effectiveness
  const leftEffectiveness = leftForm ? getTypeEffectivenessSummary(schema, leftForm) : [];
  const rightEffectiveness = rightForm ? getTypeEffectivenessSummary(schema, rightForm) : [];
  const leftWeaknesses = leftEffectiveness.filter((e) => e.multiplier > 1);
  const leftResistances = leftEffectiveness.filter((e) => e.multiplier > 0 && e.multiplier < 1);
  const leftImmunities = leftEffectiveness.filter((e) => e.multiplier === 0);
  const rightWeaknesses = rightEffectiveness.filter((e) => e.multiplier > 1);
  const rightResistances = rightEffectiveness.filter((e) => e.multiplier > 0 && e.multiplier < 1);
  const rightImmunities = rightEffectiveness.filter((e) => e.multiplier === 0);

  // Head-to-head
  const leftVsRight = leftForm && rightForm ? getHeadToHeadMatchup(schema, leftForm, rightForm) : [];
  const rightVsLeft = leftForm && rightForm ? getHeadToHeadMatchup(schema, rightForm, leftForm) : [];

  // Abilities
  const leftAbilities = leftForm ? getAbilitiesForForm(schema, leftForm) : [];
  const rightAbilities = rightForm ? getAbilitiesForForm(schema, rightForm) : [];

  // Shared moves
  const sharedMoveIds = leftForm && rightForm ? getSharedMoveIds(leftForm, rightForm) : [];
  const sharedMoves = sharedMoveIds
    .map((id) => schema.moves[id])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  const leftUniqueMoveCount = leftForm ? new Set(leftForm.learnset.map((e) => e.moveId)).size : 0;
  const rightUniqueMoveCount = rightForm ? new Set(rightForm.learnset.map((e) => e.moveId)).size : 0;

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Comparison workbench</p>
          <h1>Compare Pokemon</h1>
          <p className="lead">Side-by-side stats, type matchups, abilities, and shared moves.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{left?.name ?? "?"}</strong><span>Left</span></div>
          <div><strong>{right?.name ?? "?"}</strong><span>Right</span></div>
          <div><strong>{leftTotal ?? "-"}</strong><span>Left BST</span></div>
          <div><strong>{rightTotal ?? "-"}</strong><span>Right BST</span></div>
        </div>
      </section>
      <section className="content-card">
        <SectionTabs tabs={tabs} />

        <div id="selectors" className="section-topline">
          <div>
            <h2>Choose entries</h2>
            <p className="muted">Select two Pokemon to compare across stats, types, abilities, and movepool.</p>
          </div>
          <div className="inline-filter-row">
            <label>
              Left
              <select value={leftSlug} onChange={(event) => setSearchParams({ left: event.target.value, right: rightSlug })}>
                {all.map((species) => <option key={species.id} value={species.slug}>{species.name}</option>)}
              </select>
            </label>
            <label>
              Right
              <select value={rightSlug} onChange={(event) => setSearchParams({ left: leftSlug, right: event.target.value })}>
                {all.map((species) => <option key={species.id} value={species.slug}>{species.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* ---- Stats ---- */}
        <section id="stats">
          <h2>Base stats</h2>
          <div className="compare-grid">
            {[{ species: left, form: leftForm }, { species: right, form: rightForm }].map(({ species, form }) => species && form ? (
              <div key={species.id} className="content-card nested">
                <h3><Link to={encyclopediaRoutes.pokemon(species.slug)}>{species.name}</Link></h3>
                <div className="chip-grid">
                  <span className="entity-chip"><strong>Dex</strong><span>#{species.nationalDexNumber.toString().padStart(4, "0")}</span></span>
                  <span className="entity-chip"><strong>BST</strong><span>{getStatTotal(form.stats)}</span></span>
                  <span className="entity-chip"><strong>Types</strong><span>{form.typeIds.map((typeId) => schema.types[typeId]?.name ?? typeId.replace("type:", "")).join(" / ")}</span></span>
                </div>
                <StatBarChart stats={getComparableStats(schema, species) ?? {}} />
              </div>
            ) : null)}
          </div>
          {leftForm && rightForm ? (
            <div className="compare-stat-edge">
              <h3>Stat edge</h3>
              <div className="location-table" role="table" aria-label="Stat edge summary">
                <div className="location-table-head" role="row">
                  <span>Stat</span>
                  <span>{left?.name ?? "Left"}</span>
                  <span>{right?.name ?? "Right"}</span>
                  <span>Edge</span>
                </div>
                {statKeys.map((key) => {
                  const leftValue = leftForm.stats[key];
                  const rightValue = rightForm.stats[key];
                  const diff = leftValue - rightValue;
                  const edge = diff === 0 ? "Tie" : diff > 0 ? left?.name : right?.name;
                  return (
                    <div key={key} className="location-row" role="row">
                      <span>{key}</span>
                      <span className={diff > 0 ? "compare-winner" : ""}>{leftValue}</span>
                      <span className={diff < 0 ? "compare-winner" : ""}>{rightValue}</span>
                      <span className="muted">{edge}{diff !== 0 ? ` (+${Math.abs(diff)})` : ""}</span>
                    </div>
                  );
                })}
                <div className="location-row" role="row">
                  <span><strong>Total</strong></span>
                  <span className={(leftTotal ?? 0) > (rightTotal ?? 0) ? "compare-winner" : ""}><strong>{leftTotal}</strong></span>
                  <span className={(rightTotal ?? 0) > (leftTotal ?? 0) ? "compare-winner" : ""}><strong>{rightTotal}</strong></span>
                  <span className="muted">{leftTotal === rightTotal ? "Tie" : `${(leftTotal ?? 0) > (rightTotal ?? 0) ? left?.name : right?.name} (+${Math.abs((leftTotal ?? 0) - (rightTotal ?? 0))})`}</span>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* ---- Type matchup ---- */}
        <section id="types">
          <h2>Type matchup</h2>

          {leftForm && rightForm && (leftVsRight.length > 0 || rightVsLeft.length > 0) ? (
            <div className="compare-h2h">
              <h3>Head-to-head</h3>
              <p className="muted">How each Pokemon's STAB types hit the other defensively.</p>
              <div className="compare-grid">
                <div className="content-card nested">
                  <h4>{left?.name} attacking {right?.name}</h4>
                  <div className="chip-grid">
                    {leftVsRight.map((entry) => (
                      <span key={entry.type.id} className="entity-chip">
                        <strong>{entry.type.name}</strong>
                        <MultiplierLabel value={entry.multiplier} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="content-card nested">
                  <h4>{right?.name} attacking {left?.name}</h4>
                  <div className="chip-grid">
                    {rightVsLeft.map((entry) => (
                      <span key={entry.type.id} className="entity-chip">
                        <strong>{entry.type.name}</strong>
                        <MultiplierLabel value={entry.multiplier} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <h3>Defensive profile</h3>
          <div className="compare-grid">
            {[
              { species: left, weaknesses: leftWeaknesses, resistances: leftResistances, immunities: leftImmunities },
              { species: right, weaknesses: rightWeaknesses, resistances: rightResistances, immunities: rightImmunities },
            ].map(({ species, weaknesses, resistances, immunities }) => species ? (
              <div key={species.id} className="content-card nested">
                <h4>{species.name}</h4>
                {weaknesses.length > 0 && (
                  <>
                    <p className="compare-section-label">Weak to</p>
                    <div className="chip-grid">
                      {weaknesses.map((e) => (
                        <span key={e.type.id} className="entity-chip">
                          <strong>{e.type.name}</strong>
                          <MultiplierLabel value={e.multiplier} />
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {resistances.length > 0 && (
                  <>
                    <p className="compare-section-label">Resists</p>
                    <div className="chip-grid">
                      {resistances.map((e) => (
                        <span key={e.type.id} className="entity-chip">
                          <strong>{e.type.name}</strong>
                          <MultiplierLabel value={e.multiplier} />
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {immunities.length > 0 && (
                  <>
                    <p className="compare-section-label">Immune to</p>
                    <div className="chip-grid">
                      {immunities.map((e) => (
                        <span key={e.type.id} className="entity-chip">
                          <strong>{e.type.name}</strong>
                          <MultiplierLabel value={e.multiplier} />
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {weaknesses.length === 0 && resistances.length === 0 && immunities.length === 0 && (
                  <p className="muted">No type matchup data available.</p>
                )}
              </div>
            ) : null)}
          </div>
        </section>

        {/* ---- Profile ---- */}
        <section id="profile">
          <h2>Profile</h2>
          <div className="compare-grid">
            {[
              { species: left, form: leftForm, abilities: leftAbilities },
              { species: right, form: rightForm, abilities: rightAbilities },
            ].map(({ species, form, abilities }) => species && form ? (
              <div key={species.id} className="content-card nested">
                <h3>{species.name}</h3>
                <dl className="compare-profile-list">
                  <div><dt>Types</dt><dd>{form.typeIds.map((id) => schema.types[id]?.name ?? id.replace("type:", "")).join(" / ")}</dd></div>
                  <div><dt>Abilities</dt><dd>{abilities.map((a) => a.name).join(", ") || "Unknown"}</dd></div>
                  <div><dt>Hidden ability</dt><dd>{abilities.find((a) => form.abilitySlots.find((s) => s.abilityId === a.id && s.isHidden))?.name ?? "None"}</dd></div>
                  <div><dt>Height</dt><dd>{formatHeight(form.heightDecimetres)}</dd></div>
                  <div><dt>Weight</dt><dd>{formatWeight(form.weightHectograms)}</dd></div>
                  <div><dt>Egg groups</dt><dd>{species.eggGroups.map(formatEggGroup).join(", ") || "Unknown"}</dd></div>
                  <div><dt>Gender ratio</dt><dd>{formatGenderRatio(species.genderRatio)}</dd></div>
                  <div><dt>Catch rate</dt><dd>{species.captureRate ?? "Unknown"}</dd></div>
                  <div><dt>Base friendship</dt><dd>{species.baseFriendship ?? "Unknown"}</dd></div>
                  <div><dt>Growth rate</dt><dd>{species.growthRate ?? "Unknown"}</dd></div>
                  <div><dt>Generation</dt><dd>Gen {species.generation || "?"}</dd></div>
                </dl>
              </div>
            ) : null)}
          </div>
        </section>

        {/* ---- Moves ---- */}
        <section id="moves">
          <h2>Movepool</h2>
          <div className="compare-grid">
            <div className="content-card nested">
              <h3>{left?.name ?? "Left"}</h3>
              <div className="chip-grid">
                <span className="entity-chip"><strong>Total moves</strong><span>{leftUniqueMoveCount}</span></span>
                <span className="entity-chip"><strong>Shared</strong><span>{sharedMoveIds.length}</span></span>
                <span className="entity-chip"><strong>Exclusive</strong><span>{leftUniqueMoveCount - sharedMoveIds.length}</span></span>
              </div>
            </div>
            <div className="content-card nested">
              <h3>{right?.name ?? "Right"}</h3>
              <div className="chip-grid">
                <span className="entity-chip"><strong>Total moves</strong><span>{rightUniqueMoveCount}</span></span>
                <span className="entity-chip"><strong>Shared</strong><span>{sharedMoveIds.length}</span></span>
                <span className="entity-chip"><strong>Exclusive</strong><span>{rightUniqueMoveCount - sharedMoveIds.length}</span></span>
              </div>
            </div>
          </div>
          {sharedMoves.length > 0 ? (
            <>
              <h3>Shared moves ({sharedMoves.length})</h3>
              <div className="chip-grid">
                {sharedMoves.slice(0, 40).map((move) => (
                  <Link key={move.id} to={encyclopediaRoutes.move(move.slug)} className="entity-chip">
                    <strong>{move.name}</strong>
                    <span>{schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")}</span>
                  </Link>
                ))}
                {sharedMoves.length > 40 && <span className="muted">…and {sharedMoves.length - 40} more</span>}
              </div>
            </>
          ) : (
            <p className="muted">{leftForm && rightForm ? "These Pokemon share no moves." : "Select two Pokemon to see shared moves."}</p>
          )}
        </section>
      </section>
    </main>
  );
}
