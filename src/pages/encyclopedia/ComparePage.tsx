import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getComparableStats, getDefaultForm, getSpeciesBySlug, getStatTotal, listPokemon } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "selectors", label: "Selectors" },
  { id: "stats", label: "Stats" },
];

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

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Comparison workbench</p>
          <h1>Compare two Pokemon</h1>
          <p className="lead">Deep-linkable side-by-side comparison with selectors and a stat-focused readout.</p>
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
            <p className="muted">Query-driven compare route for deep-linkable side-by-side stat checks.</p>
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
        <div id="stats" className="compare-grid">
          {[left, right].map((species) => species ? (
            <div key={species.id} className="content-card nested">
              <h2><Link to={encyclopediaRoutes.pokemon(species.slug)}>{species.name}</Link></h2>
              <div className="chip-grid">
                <span className="entity-chip"><strong>Dex</strong><span>#{species.nationalDexNumber.toString().padStart(4, "0")}</span></span>
                <span className="entity-chip"><strong>Category</strong><span>{species.categoryLabel}</span></span>
                <span className="entity-chip"><strong>Types</strong><span>{getDefaultForm(schema, species)?.typeIds.map((typeId) => schema.types[typeId]?.name ?? typeId.replace("type:", "")).join(" / ") ?? "Unknown"}</span></span>
              </div>
              <dl className="stat-grid">
                {Object.entries(getComparableStats(schema, species) ?? {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
              </dl>
            </div>
          ) : null)}
        </div>
        {leftForm && rightForm ? (
          <section className="content-card">
            <h2>Stat edge summary</h2>
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
                const edge = leftValue === rightValue ? "Tie" : leftValue > rightValue ? left?.name : right?.name;
                return (
                  <div key={key} className="location-row" role="row">
                    <span>{key}</span>
                    <span>{leftValue}</span>
                    <span>{rightValue}</span>
                    <span>{edge}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
