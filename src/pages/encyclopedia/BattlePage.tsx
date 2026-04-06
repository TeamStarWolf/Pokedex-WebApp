import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Swords, BarChart3 } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { readAppStorage } from "../../lib/storage";
import { resolveBattlePokemon, analyzeTeam } from "../../lib/battleSim";
import type { BattlePokemon } from "../../lib/battleTypes";
import { TeamAnalysisPanel } from "../../components/battle/TeamAnalysisPanel";
import { BattleSimPanel } from "../../components/battle/BattleSimPanel";
import { PokemonImage } from "../../components/encyclopedia/PokemonImage";
import { TypeBadge } from "../../components/battle/TypeBadge";
import { capitalize } from "../../lib/format";
import { curatedPresetTeams } from "../../data/presetTeams";

type Tab = "analysis" | "battle";

export function BattlePage() {
  useDocumentTitle("Battle Simulator");
  const { schema } = useEncyclopediaData();
  const [activeTab, setActiveTab] = useState<Tab>("battle");

  const storage = readAppStorage();
  const teamName = storage.currentTeamProfile.name || "Your Team";

  const yourTeam = useMemo(() => {
    return storage.currentTeam
      .map((member) => resolveBattlePokemon(schema, member.pokemonId, member.nickname))
      .filter((pokemon): pokemon is BattlePokemon => pokemon !== null);
  }, [storage.currentTeam, schema]);

  const analysis = useMemo(() => {
    if (yourTeam.length === 0) return null;
    return analyzeTeam(yourTeam, schema);
  }, [yourTeam, schema]);

  return (
    <main className="encyclopedia-page">
      <section className="content-card">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Battle Simulator</span>
        </nav>

        <div className="section-header">
          <div>
            <p className="eyebrow">Team matchup lab</p>
            <h1>Battle Simulator</h1>
            <p className="muted">
              Analyze your team's coverage, spot weaknesses, and simulate
              head-to-head matchups against any opponent squad.
            </p>
          </div>
        </div>

        {yourTeam.length === 0 ? (
          <div className="battle-empty-state">
            <Swords size={40} />
            <h2>No team loaded</h2>
            <p className="muted">
              Build a team of up to 6 Pokemon from the Pokedex or load a preset
              from the Trainer Archive, then return here to analyze and battle.
            </p>
            <div className="battle-empty-links">
              <Link to="/dex/national" className="primary-link">Browse Pokedex</Link>
              <Link to="/trainers/appearances" className="secondary-link">Trainer Archive</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="battle-your-team">
              <h3>
                <Shield size={16} /> {teamName}
                <span className="muted battle-team-count">{yourTeam.length}/6</span>
              </h3>
              <div className="battle-team-roster">
                {yourTeam.map((pokemon) => (
                  <div key={pokemon.pokemonId} className="battle-roster-member">
                    <PokemonImage src={pokemon.artworkUrl} alt={pokemon.name} className="battle-roster-art" />
                    <div className="battle-roster-info">
                      <strong>{capitalize(pokemon.nickname)}</strong>
                      <div className="battle-roster-types">
                        {pokemon.typeIds.map((id) => (
                          <TypeBadge key={id} typeId={id} schema={schema} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-tabs battle-tabs">
              <button
                type="button"
                className={`tab-pill ${activeTab === "battle" ? "active" : ""}`}
                onClick={() => setActiveTab("battle")}
              >
                <Swords size={14} />
                Battle
              </button>
              <button
                type="button"
                className={`tab-pill ${activeTab === "analysis" ? "active" : ""}`}
                onClick={() => setActiveTab("analysis")}
              >
                <BarChart3 size={14} />
                Team Analysis
              </button>
            </div>

            {activeTab === "battle" && (
              <BattleSimPanel
                yourTeam={yourTeam}
                yourTeamLabel={teamName}
                schema={schema}
                trainerPresets={curatedPresetTeams}
              />
            )}

            {activeTab === "analysis" && analysis && (
              <TeamAnalysisPanel analysis={analysis} />
            )}
          </>
        )}
      </section>
    </main>
  );
}
