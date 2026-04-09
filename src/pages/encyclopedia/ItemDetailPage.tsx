// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { PlaceholderBlock } from "../../components/encyclopedia/PlaceholderBlock";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getItemBySlug, getPokemonByItem } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "effect", label: "Effect" },
  { id: "logistics", label: "Logistics" },
  { id: "links", label: "Links" },
];

export function ItemDetailPage() {
  const { itemSlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const item = getItemBySlug(schema, itemSlug);
  useDocumentTitle(item?.name ?? "Item");
  if (!item) return <main className="encyclopedia-page"><section className="content-card"><h1>Item not found</h1></section></main>;
  const pokemon = getPokemonByItem(schema, item.id);
  const relatedMoves = item.relatedMoveIds.map((moveId) => schema.moves[moveId]).filter(Boolean);

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Items", href: "/items" }, { label: item.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Item article</p>
          <h1>{item.name}</h1>
          <p className="lead">Effect details, related Pokemon, and linked moves for {item.name}.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{pokemon.length}</strong><span>Related species</span></div>
          <div><strong>{relatedMoves.length}</strong><span>Linked moves</span></div>
          <div><strong>{item.versionEffects.length}</strong><span>Version notes</span></div>
          <div><strong>{item.category}</strong><span>Category</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox title={item.name} subtitle="Item page" rows={[
          { label: "Category", value: item.category },
          { label: "Purchase price", value: item.purchasePrice ?? "Unavailable" },
          { label: "Sell price", value: item.sellPrice ?? "Unavailable" },
          { label: "Fling power", value: item.flingPower ?? "None" },
          { label: "Fling effect", value: item.flingEffect ?? "None" },
        ]} />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={item.status} sourceRefs={item.sourceRefs} expansionNotes={item.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="effect" className="content-card">
            <h2>Effect</h2>
            <p>{item.effectText}</p>
            {item.versionEffects.length ? (
              <div className="location-table" role="table" aria-label="Version effects">
                <div className="location-table-head" role="row">
                  <span>Game</span>
                  <span>State</span>
                  <span>Value</span>
                  <span>Notes</span>
                </div>
                {item.versionEffects.map((entry) => (
                  <div key={`${entry.gameVersionId}-${entry.state}`} className="location-row" role="row">
                    <span>{schema.gameVersions[entry.gameVersionId]?.shortName ?? entry.gameVersionId.replace("game:", "")}</span>
                    <span>{entry.state}</span>
                    <span>{entry.value ?? "Unknown"}</span>
                    <span>{entry.notes?.join(", ") ?? "-"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <PlaceholderBlock title="No version-specific effects available" body="Per-game item effects will be added in a future data import." />
            )}
          </section>
          <section id="logistics" className="content-card">
            <h2>Logistics and battle data</h2>
            <div className="reference-grid">
              <div>
                <h3>Economy</h3>
                <div className="chip-grid">
                  <span className="entity-chip"><strong>Purchase</strong><span>{item.purchasePrice ?? "Unavailable"}</span></span>
                  <span className="entity-chip"><strong>Sell</strong><span>{item.sellPrice ?? "Unavailable"}</span></span>
                </div>
              </div>
              <div>
                <h3>Battle use</h3>
                <div className="chip-grid">
                  <span className="entity-chip"><strong>Fling power</strong><span>{item.flingPower ?? "None"}</span></span>
                  <span className="entity-chip"><strong>Fling effect</strong><span>{item.flingEffect ?? "None"}</span></span>
                </div>
              </div>
            </div>
          </section>
          <section id="links" className="content-card">
            <h2>Related Pokemon</h2>
            <div className="chip-grid">
              {pokemon.map((entry) => <Link key={entry.id} to={encyclopediaRoutes.pokemon(entry.slug)} className="entity-chip"><strong>{entry.name}</strong><span>Pokemon page</span></Link>)}
            </div>
            <h3>Related moves</h3>
            <div className="chip-grid">
              {relatedMoves.length ? relatedMoves.map((move) => (
                <Link key={move.id} to={encyclopediaRoutes.move(move.slug)} className="entity-chip">
                  <strong>{move.name}</strong>
                  <span>{schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")}</span>
                </Link>
              )) : <span className="muted">No related moves linked in the current dataset.</span>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
