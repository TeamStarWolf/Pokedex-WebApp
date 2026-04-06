import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Shield, Swords, BarChart3, Plus, Search, X, Share2, Check } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { readAppStorage, writeAppStorage } from "../../lib/storage";
import { resolveBattlePokemon, analyzeTeam } from "../../lib/battleSim";
import type { BattlePokemon } from "../../lib/battleTypes";
import { TeamAnalysisPanel } from "../../components/battle/TeamAnalysisPanel";
import { BattleSimPanel } from "../../components/battle/BattleSimPanel";
import { PokemonSearchDropdown } from "../../components/battle/PokemonSearchDropdown";
import { PokemonImage } from "../../components/encyclopedia/PokemonImage";
import { TypeBadge } from "../../components/battle/TypeBadge";
import { capitalize } from "../../lib/format";
import { curatedPresetTeams } from "../../data/presetTeams";

type Tab = "analysis" | "battle";

function encodeTeamToParam(team: { pokemonId: number }[]): string {
  return team.map((m) => m.pokemonId).join(",");
}

function decodeTeamFromParam(param: string): number[] {
  return param
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
}

export function BattlePage() {
  useDocumentTitle("Battle Simulator");
  const { schema } = useEncyclopediaData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("battle");
  const [teamKey, setTeamKey] = useState(0);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [shareConfirm, setShareConfirm] = useState(false);

  const storage = readAppStorage();
  const teamName = storage.currentTeamProfile.name || "Your Team";

  // Load team from URL param on mount
  useEffect(() => {
    const teamParam = searchParams.get("team");
    if (!teamParam) return;
    const dexNumbers = decodeTeamFromParam(teamParam);
    if (dexNumbers.length === 0) return;

    const current = readAppStorage();
    // Only overwrite if current team is empty or different
    const currentIds = current.currentTeam.map((m) => m.pokemonId);
    if (JSON.stringify(currentIds) === JSON.stringify(dexNumbers)) return;

    current.currentTeam = dexNumbers.slice(0, 6).map((dexNum) => {
      const species = Object.values(schema.pokemon).find((s) => s.nationalDexNumber === dexNum);
      return {
        pokemonId: dexNum,
        nickname: species?.name ?? "",
        role: "",
        notes: "",
      };
    });
    writeAppStorage(current);
    setTeamKey((k) => k + 1);
  }, []); // Run only on mount

  const yourTeam = useMemo(() => {
    void teamKey; // dependency to force re-resolve when team changes
    return storage.currentTeam
      .map((member) => resolveBattlePokemon(schema, member.pokemonId, member.nickname))
      .filter((pokemon): pokemon is BattlePokemon => pokemon !== null);
  }, [storage.currentTeam, schema, teamKey]);

  // Update URL when team changes
  useEffect(() => {
    if (yourTeam.length > 0) {
      const encoded = encodeTeamToParam(yourTeam);
      if (searchParams.get("team") !== encoded) {
        setSearchParams({ team: encoded }, { replace: true });
      }
    } else if (searchParams.has("team")) {
      searchParams.delete("team");
      setSearchParams(searchParams, { replace: true });
    }
  }, [yourTeam]);

  const shareTeam = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareConfirm(true);
      setTimeout(() => setShareConfirm(false), 2000);
    });
  }, []);

  const addToTeam = useCallback((dexNum: number) => {
    const current = readAppStorage();
    if (current.currentTeam.length >= 6) return;
    const species = Object.values(schema.pokemon).find((s) => s.nationalDexNumber === dexNum);
    current.currentTeam.push({
      pokemonId: dexNum,
      nickname: species?.name ?? "",
      role: "",
      notes: "",
    });
    writeAppStorage(current);
    setTeamKey((k) => k + 1);
    setQuickSearchOpen(false);
  }, [schema.pokemon]);

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
                <PokemonSearchDropdown schema={schema} onSelect={addToTeam} />
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
              <div className="battle-team-header-row">
                <h3>
                  <Shield size={16} /> {teamName}
                  <span className="muted battle-team-count">{yourTeam.length}/6</span>
                </h3>
                <button type="button" className="ghost-button battle-share-btn" onClick={shareTeam}>
                  {shareConfirm ? <Check size={14} /> : <Share2 size={14} />}
                  {shareConfirm ? "Copied!" : "Share team"}
                </button>
              </div>
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
                    <PokemonSearchDropdown schema={schema} onSelect={addToTeam} />
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

            <div style={{ display: activeTab === "battle" ? "block" : "none" }}>
              <BattleSimPanel
                yourTeam={yourTeam}
                yourTeamLabel={teamName}
                schema={schema}
                trainerPresets={curatedPresetTeams}
              />
            </div>

            {activeTab === "analysis" && analysis && (
              <TeamAnalysisPanel analysis={analysis} schema={schema} />
            )}
          </>
        )}
      </section>
    </main>
  );
}
