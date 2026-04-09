// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { SectionTabs } from "../../components/encyclopedia/SectionTabs";
import { getAbilityBySlug, getPokemonByAbility } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";

const tabs = [
  { id: "effect", label: "Effect" },
  { id: "holders", label: "Holders" },
  { id: "links", label: "Links" },
];

export function AbilityDetailPage() {
  const { abilitySlug = "" } = useParams();
  const { schema } = useEncyclopediaData();
  const ability = getAbilityBySlug(schema, abilitySlug);
  useDocumentTitle(ability?.name ?? "Ability");
  if (!ability) return <main className="encyclopedia-page"><section className="content-card"><h1>Ability not found</h1></section></main>;

  const pokemon = getPokemonByAbility(schema, ability.id);
  const allForms = ability.pokemonFormIds.map((formId) => schema.forms[formId]).filter(Boolean);
  const forms = allForms.slice(0, 20);
  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Abilities", href: "/abilities" }, { label: ability.name }]} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Ability article</p>
          <h1>{ability.name}</h1>
          <p className="lead">Effect description and all Pokemon with {ability.name}.</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{pokemon.length}</strong><span>Species</span></div>
          <div><strong>{ability.pokemonFormIds.length}</strong><span>Forms</span></div>
          <div><strong>{ability.isMainSeries ? "Yes" : "No"}</strong><span>Main series</span></div>
          <div><strong>{ability.isMainSeries ? "Main series" : "Side game"}</strong><span>Category</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          title={ability.name}
          subtitle="Ability entry"
          rows={[
            { label: "Main series", value: ability.isMainSeries ? "Yes" : "No" },
            { label: "Summary", value: ability.description },
            { label: "Known forms", value: ability.pokemonFormIds.length },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel tabs={tabs} status={ability.status} sourceRefs={ability.sourceRefs} expansionNotes={ability.expansionNotes} />
          <SectionTabs tabs={tabs} />
          <section id="effect" className="content-card">
            <h2>Effect</h2>
            <p>{ability.effectText}</p>
          </section>
          <section id="holders" className="content-card">
            <h2>Pokemon with this ability</h2>
            {allForms.length > forms.length ? (
              <p className="muted">Showing {forms.length} of {allForms.length} forms with this ability.</p>
            ) : null}
            <div className="location-table" role="table" aria-label="Pokemon with this ability">
              <div className="location-table-head" role="row">
                <span>Pokemon</span>
                <span>Form</span>
                <span>Slot</span>
                <span>Entry</span>
              </div>
              {forms.map((form) => {
                const species = schema.pokemon[form.speciesId];
                const slot = form.abilitySlots.find((entry) => entry.abilityId === ability.id);
                return (
                  <div key={form.id} className="location-row" role="row">
                    <span><Link to={encyclopediaRoutes.pokemon(species.slug)}><strong>{species.name}</strong></Link></span>
                    <span>{form.formName}</span>
                    <span>{slot ? `${slot.isHidden ? "Hidden" : "Slot"} ${slot.slot}` : "Unknown"}</span>
                    <span>Pokemon page</span>
                  </div>
                );
              })}
            </div>
          </section>
          <section id="links" className="content-card">
            <h2>Cross-linked browsing</h2>
            <div className="chip-grid">
              {pokemon.slice(0, 8).map((species) => <Link key={species.id} to={encyclopediaRoutes.pokemon(species.slug)} className="entity-chip"><strong>{species.name}</strong><span>Species page</span></Link>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
