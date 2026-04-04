import { Link, useParams } from "react-router-dom";
import { ArticleSupportPanel } from "../../components/encyclopedia/ArticleSupportPanel";
import { Breadcrumbs } from "../../components/encyclopedia/Breadcrumbs";
import { EntityInfobox } from "../../components/encyclopedia/EntityInfobox";
import { SectionStatusNote } from "../../components/encyclopedia/SectionStatusNote";
import { TrainerSprite } from "../../components/TrainerSprite";
import { useTrainerAppearanceData } from "../../hooks/useTrainerReferenceData";
import { capitalize } from "../../lib/format";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function TrainerAppearancePage() {
  const { trainerSlug = "", appearanceSlug = "" } = useParams();
  const { appearance, pokemonList, loading, error } = useTrainerAppearanceData(trainerSlug, appearanceSlug);

  if (loading) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Loading trainer appearance</h1><p className="muted">Preparing battle article.</p></section></main>;
  }

  if (error) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer data unavailable</h1><p className="muted">{error}</p></section></main>;
  }

  if (!appearance) {
    return <main className="encyclopedia-page"><section className="content-card"><h1>Trainer appearance not found</h1></section></main>;
  }

  const pokemonById = new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const));

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Trainers", href: encyclopediaRoutes.trainers() },
          { label: appearance.trainer, href: encyclopediaRoutes.trainer(appearance.trainerSlug) },
          { label: appearance.name },
        ]}
      />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">Trainer appearance</p>
          <h1>{appearance.trainer}: {appearance.name}</h1>
          <p className="lead">{appearance.description}</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{appearance.sourceGame}</strong><span>Source game</span></div>
          <div><strong>{appearance.battleLabel}</strong><span>Battle label</span></div>
          <div><strong>{appearance.canonical ? "Canonical" : "Inspired"}</strong><span>Record type</span></div>
          <div><strong>{capitalize(pokemonById.get(appearance.acePokemonId ?? 0)?.name ?? "Unknown")}</strong><span>Ace Pokemon</span></div>
        </div>
      </section>
      <section className="content-layout">
        <EntityInfobox
          className="trainer-infobox"
          title={appearance.trainer}
          subtitle={appearance.name}
          media={<TrainerSprite trainer={appearance.trainer} region={appearance.region} />}
          rows={[
            { label: "Region", value: appearance.region },
            { label: "Category", value: appearance.category },
            { label: "Game", value: appearance.sourceGame },
            { label: "Battle", value: appearance.battleLabel },
            { label: "Difficulty", value: appearance.difficulty },
            { label: "Tags", value: appearance.tags.join(", ") || "None" },
          ]}
        />
        <div className="stack">
          <ArticleSupportPanel
            tabs={[
              { id: "team", label: "Team" },
              { id: "strategy", label: "How to beat" },
            ]}
            status={appearance.canonical ? "partial" : "planned"}
            sourceRefs={appearance.source ? [{ label: appearance.source.label, sourceType: appearance.source.kind, url: appearance.source.url, notes: appearance.source.note }] : []}
            expansionNotes={["Appearance pages isolate one battle loadout so game-specific teams can stay distinct."]}
          />
          <section id="team" className="content-card">
            <h2>Team</h2>
            <SectionStatusNote
              status="partial"
              title="Battle loadout is isolated"
              body="This page now keeps one team tied to one game-specific appearance, but move sets, items, and battle scripting still need deeper imports."
            />
            <div className="trainer-team-card">
              <dl className="trainer-meta-list compact">
                <div><dt>Trainer</dt><dd><Link to={encyclopediaRoutes.trainer(appearance.trainerSlug)}>{appearance.trainer}</Link></dd></div>
                <div><dt>Appearance</dt><dd>{appearance.name}</dd></div>
                <div><dt>Ace Pokemon</dt><dd>{capitalize(pokemonById.get(appearance.acePokemonId ?? 0)?.name ?? "Unknown")}</dd></div>
              </dl>
              <div className="chip-grid">
                {appearance.members.map((memberId) => {
                  const pokemon = pokemonById.get(memberId);
                  if (!pokemon) return null;
                  return (
                    <Link key={`${appearance.slug}-${memberId}`} to={encyclopediaRoutes.pokemon(pokemon.name)} className="entity-chip">
                      <strong>{capitalize(pokemon.name)}</strong>
                      <span>{pokemon.types.join(" / ")}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
          <section id="strategy" className="content-card">
            <h2>How to beat</h2>
            <SectionStatusNote
              status={appearance.howToBeat.length ? "partial" : "planned"}
              title="Strategy notes are advisory"
              body="These notes are battle guidance for the archived team, not a fully sourced walkthrough for every AI script and moveset variation."
            />
            <div className="trainer-team-card">
              <ul className="text-list">
                {appearance.howToBeat.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
