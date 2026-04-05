import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { Pagination } from "../../components/encyclopedia/Pagination";
import { PlaceholderBlock } from "../../components/encyclopedia/PlaceholderBlock";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getMoveBySlug, getPokemonByMove, paginate } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const LEARNER_PAGE_SIZE = 30;

const tabs = [
  { id: "effect", label: "Effect" },
  { id: "context", label: "Context" },
  { id: "learners", label: "Learners" },
];

export function MoveDetailPage() {
  const { moveSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const move = getMoveBySlug(schema, moveSlug);
  useDocumentTitle(move?.name ?? "Move");

  const [learnerPage, setLearnerPage] = useState(1);
  const [learnerQuery, setLearnerQuery] = useState("");
  const [learnerSort, setLearnerSort] = useState<"name" | "type">("name");

  if (!move) return <main className="encyclopedia-page"><section className="content-card"><h1>Move not found</h1></section></main>;

  const learners = getPokemonByMove(schema, move.id);
  const allLearnerForms = move.pokemonFormIds
    .map((formId) => schema.forms[formId])
    .filter(Boolean);

  const filteredLearners = useMemo(() => {
    let list = allLearnerForms;
    if (learnerQuery.trim()) {
      const q = learnerQuery.toLowerCase();
      list = list.filter((form) => {
        const species = schema.pokemon[form.speciesId];
        return species?.name.toLowerCase().includes(q) || form.formName.toLowerCase().includes(q);
      });
    }
    if (learnerSort === "type") {
      list = [...list].sort((a, b) => {
        const typeA = a.typeIds[0] ?? "";
        const typeB = b.typeIds[0] ?? "";
        return typeA.localeCompare(typeB);
      });
    } else {
      list = [...list].sort((a, b) => {
        const nameA = schema.pokemon[a.speciesId]?.name ?? "";
        const nameB = schema.pokemon[b.speciesId]?.name ?? "";
        return nameA.localeCompare(nameB);
      });
    }
    return list;
  }, [allLearnerForms, learnerQuery, learnerSort, schema]);

  const learnerPagination = paginate(filteredLearners, learnerPage, LEARNER_PAGE_SIZE);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Moves", href: "/moves" }, { label: move.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Move article</p>
          <h1>{move.name}</h1>
          <p className="lead">A linked move entry with learner coverage, type navigation, and room for version-specific text later.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{learners.length}</strong><span>Known learners</span></div>
          <div><strong>{move.power ?? "-"}</strong><span>Power</span></div>
          <div><strong>{move.accuracy ?? "-"}</strong><span>Accuracy</span></div>
          <div><strong>{move.pp ?? "-"}</strong><span>PP</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={move.name}
          subtitle={`${schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")} move`}
          badges={<Link to={encyclopediaRoutes.type(move.typeId.replace("type:", ""))} className="type-chip muted-chip">{schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")}</Link>}
          rows={[
            { label: "Type", value: <Link to={encyclopediaRoutes.type(move.typeId.replace("type:", ""))}>{schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")}</Link> },
            { label: "Class", value: move.damageClass },
            { label: "Power", value: move.power ?? "Unknown" },
            { label: "Accuracy", value: move.accuracy ?? "Always hits" },
            { label: "PP", value: move.pp ?? "Unknown" },
            { label: "Priority", value: move.priority },
            { label: "Target", value: move.target },
            { label: "Effect chance", value: move.effectChance ?? "None" },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={move.status} sourceRefs={move.sourceRefs} expansionNotes={move.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="effect" className="content-card">
            <h2>Effect</h2>
            <p>{move.effectText}</p>
          </section>
          <section id="context" className="content-card">
            <h2>Linked reference context</h2>
            <div className="reference-grid">
              <div>
                <h3>Type page</h3>
                <p className="muted">Use the type page to move from this attack into broader matchup browsing.</p>
                <Link to={encyclopediaRoutes.type(move.typeId.replace("type:", ""))} className="entity-chip">
                  <strong>{schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")}</strong>
                  <span>Type entry</span>
                </Link>
              </div>
              <div>
                <h3>Machine items</h3>
                <div className="chip-grid">
                  {move.machineItemIds.length ? move.machineItemIds.map((itemId) => (
                    <Link key={itemId} to={encyclopediaRoutes.item(itemId.replace("item:", ""))} className="entity-chip">
                      <strong>{schema.items[itemId]?.name ?? itemId.replace("item:", "")}</strong>
                      <span>Item page</span>
                    </Link>
                  )) : <span className="muted">No linked machine item in the current dataset.</span>}
                </div>
              </div>
            </div>
          </section>
          <section id="learners" className="content-card">
            <h2>Known learners</h2>
            <p className="muted">{allLearnerForms.length} forms learn this move.</p>
            <div className="browse-toolbar">
              <div className="inline-filter-row">
                <label>
                  Search
                  <input
                    value={learnerQuery}
                    onChange={(event) => { setLearnerQuery(event.target.value); setLearnerPage(1); }}
                    placeholder="Filter by Pokemon name"
                  />
                </label>
                <label>
                  Sort
                  <select value={learnerSort} onChange={(event) => { setLearnerSort(event.target.value as "name" | "type"); setLearnerPage(1); }}>
                    <option value="name">Name (A-Z)</option>
                    <option value="type">Primary type</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="location-table" role="table" aria-label="Known learners">
              <div className="location-table-head" role="row">
                <span>Pokemon</span>
                <span>Form</span>
                <span>Primary type</span>
                <span>Entry</span>
              </div>
              {learnerPagination.items.map((form) => {
                const species = schema.pokemon[form.speciesId];
                const primaryTypeId = form.typeIds[0];
                return (
                  <div key={form.id} className="location-row" role="row">
                    <span><Link to={encyclopediaRoutes.pokemon(species.slug)}><strong>{species.name}</strong></Link></span>
                    <span>{form.formName}</span>
                    <span>
                      {primaryTypeId ? (
                        <Link to={encyclopediaRoutes.type(primaryTypeId.replace("type:", ""))}>
                          {schema.types[primaryTypeId]?.name ?? primaryTypeId.replace("type:", "")}
                        </Link>
                      ) : "Unknown"}
                    </span>
                    <span>Pokemon page</span>
                  </div>
                );
              })}
            </div>
            {learnerPagination.totalPages > 1 && (
              <Pagination
                page={learnerPagination.page}
                totalPages={learnerPagination.totalPages}
                onChange={setLearnerPage}
                totalItems={filteredLearners.length}
                pageSize={LEARNER_PAGE_SIZE}
              />
            )}
          </section>
          <PlaceholderBlock title="Version text" body="Version-specific move text is modeled in the schema and can be expanded per game later." />
        </div>
      </section>
    </main>
  );
}
