import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Swords, BarChart3, Plus, Search, X } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { readAppStorage, writeAppStorage } from "../../lib/storage";
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
  const [teamKey, setTeamKey] = useState(0);
  const [quickSearch, setQuickSearch] = useState("");
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);

  const storage = readAppStorage();
  const teamName = storage.currentTeamProfile.name || "Your Team";

  const yourTeam = useMemo(() => {
    void teamKey; // dependency to force re-resolve when team changes
    return storage.currentTeam
      .map((member) => resolveBattlePokemon(schema, member.pokemonId, member.nickname))
      .filter((pokemon): pokemon is BattlePokemon => pokemon !== null);
  }, [storage.currentTeam, schema, teamKey]);

  const pokemonList = useMemo(() => {
    return Object.values(schema.pokemon).sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  }, [schema.pokemon]);

  const quickResults = useMemo(() => {
    if (!quickSearch.trim()) return pokemonList.slice(0, 50);
    const q = quickSearch.toLowerCase();
    return pokemonList
      .filter((s) => s.name.toLowerCase().includes(q) || String(s.nationalDexNumber).includes(q))
      .slice(0, 50);
  }, [pokemonList, quickSearch]);

  const addToTeam = useCallback((dexNum: number) => {
    const current = readAppStorage();
    if (current.currentTeam.length >= 6) return;
    const species = pokemonList.find((s) => s.nationalDexNumber === dexNum);
    current.currentTeam.push({
      pokemonId: dexNum,
      nickname: species?.name ?? "",
      role: "",
      notes: "",
    });
    writeAppStorage(current);
    setTeamKey((k) => k + 1);
    setQuickSearch("");
    setQuickSearchOpen(false);
  }, [pokemonList]);

  const removeFromTeam = useCallback((index: number) => {
    const current = readAppStorage();
    current.currentTeam.splice(index, 1);
    writeAppStorage(current);
    setTeamKey((k) => k + 1);
  }, []);

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
              Add Pokemon below, browse the Pokedex, or load a preset from the Trainer Archive.
            </p>
            <div className="battle-quick-add battle-quick-add-centered">
              <button
                type="button"
                className="primary-link"
                onClick={() => setQuickSearchOpen(!quickSearchOpen)}
              >
                <Plus size={14} />
                Add Pokemon
              </button>
              {quickSearchOpen && (
                <div className="battle-search-dropdown">
                  <input
                    className="battle-search-input"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    placeholder="Type a name or dex number..."
                    autoFocus
                  />
                  <div className="battle-search-results" role="listbox">
                    {quickResults.map((species) => (
                      <button
                        key={species.nationalDexNumber}
                        type="button"
                        className="battle-search-option"
                        role="option"
                        onClick={() => addToTeam(species.nationalDexNumber)}
                      >
                        <span className="mono">#{String(species.nationalDexNumber).padStart(4, "0")}</span>
                        <span>{capitalize(species.name)}</span>
                      </button>
                    ))}
                    {quickResults.length === 0 && (
                      <p className="muted battle-search-empty">No Pokemon found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="battle-empty-links">
              <Link to="/dex/national" className="secondary-link">Browse Pokedex</Link>
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
                {yourTeam.map((pokemon, index) => (
                  <div key={`${pokemon.pokemonId}-${index}`} className="battle-roster-member">
                    <PokemonImage src={pokemon.artworkUrl} alt={pokemon.name} className="battle-roster-art" />
                    <div className="battle-roster-info">
                      <strong>{capitalize(pokemon.nickname)}</strong>
                      <div className="battle-roster-types">
                        {pokemon.typeIds.map((id) => (
                          <TypeBadge key={id} typeId={id} schema={schema} />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="battle-roster-remove"
                      onClick={() => removeFromTeam(index)}
                      aria-label={`Remove ${pokemon.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {yourTeam.length < 6 && (
                <div className="battle-quick-add">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setQuickSearchOpen(!quickSearchOpen)}
                  >
                    {quickSearchOpen ? <Search size={14} /> : <Plus size={14} />}
                    {quickSearchOpen ? "Close" : "Add Pokemon"}
                  </button>
                  {quickSearchOpen && (
                    <div className="battle-search-dropdown">
                      <input
                        className="battle-search-input"
                        value={quickSearch}
                        onChange={(e) => setQuickSearch(e.target.value)}
                        placeholder="Type a name or dex number..."
                        autoFocus
                      />
                      <div className="battle-search-results" role="listbox">
                        {quickResults.map((species) => (
                          <button
                            key={species.nationalDexNumber}
                            type="button"
                            className="battle-search-option"
                            role="option"
                            onClick={() => addToTeam(species.nationalDexNumber)}
                          >
                            <span className="mono">#{String(species.nationalDexNumber).padStart(4, "0")}</span>
                            <span>{capitalize(species.name)}</span>
                          </button>
                        ))}
                        {quickResults.length === 0 && (
                          <p className="muted battle-search-empty">No Pokemon found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              <TeamAnalysisPanel analysis={analysis} schema={schema} />
            )}
          </>
        )}
      </section>
    </main>
  );
}
