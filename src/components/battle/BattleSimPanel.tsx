// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Swords, Shuffle, Trash2, Plus, Search, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { EncyclopediaSchema } from "../../lib/encyclopedia-schema";
import type { BattlePokemon, SimulationResult } from "../../lib/battleTypes";
import type { PresetTeam } from "../../lib/types";
import { resolveBattlePokemon, simulateMatchup } from "../../lib/battleSim";
import { BattleResultCard } from "./BattleResultCard";
import { MatchupMatrix } from "./MatchupMatrix";
import { TeamComparePanel } from "./TeamComparePanel";
import { PokemonSearchDropdown } from "./PokemonSearchDropdown";
import { PokemonImage } from "../encyclopedia/PokemonImage";
import { capitalize } from "../../lib/format";

type Props = {
  yourTeam: BattlePokemon[];
  yourTeamLabel: string;
  schema: EncyclopediaSchema;
  trainerPresets?: PresetTeam[];
};

const MAX_TEAM = 6;

export function BattleSimPanel({ yourTeam, yourTeamLabel, schema, trainerPresets }: Props) {
  const [opponentIds, setOpponentIds] = useState<number[]>([]);
  const [opponentLabel, setOpponentLabel] = useState("Opponent");
  const [searchOpen, setSearchOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetQuery, setPresetQuery] = useState("");
  const [resultView, setResultView] = useState<"breakdown" | "matrix" | "compare">("breakdown");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const pokemonList = useMemo(() => {
    return Object.values(schema.pokemon)
      .sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  }, [schema.pokemon]);

  const filteredPresets = useMemo(() => {
    if (!trainerPresets) return [];
    const q = presetQuery.toLowerCase();
    return trainerPresets
      .filter((preset) =>
        !q || preset.trainer.toLowerCase().includes(q) || preset.battleLabel.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [trainerPresets, presetQuery]);

  const opponentTeam = useMemo(() => {
    return opponentIds
      .map((id) => resolveBattlePokemon(schema, id))
      .filter((pokemon): pokemon is BattlePokemon => pokemon !== null);
  }, [opponentIds, schema]);

  const addOpponent = useCallback((pokemonId: number) => {
    if (opponentIds.length >= MAX_TEAM) return;
    setOpponentIds((ids) => [...ids, pokemonId]);
    setSearchOpen(false);
    setResult(null);
  }, [opponentIds.length]);

  function removeOpponent(index: number) {
    setOpponentIds((ids) => ids.filter((_, i) => i !== index));
    setResult(null);
  }

  function clearOpponents() {
    setOpponentIds([]);
    setResult(null);
  }

  function loadPreset(preset: PresetTeam) {
    setOpponentIds(preset.members.slice(0, MAX_TEAM));
    setOpponentLabel(preset.trainer + " – " + preset.battleLabel);
    setPresetOpen(false);
    setPresetQuery("");
    setResult(null);
  }

  function addRandomTeam() {
    const pool = pokemonList.filter((species) => species.nationalDexNumber <= 898);
    const picked: number[] = [];
    const available = [...pool];
    while (picked.length < MAX_TEAM && available.length > 0) {
      const index = Math.floor(Math.random() * available.length);
      picked.push(available[index].nationalDexNumber);
      available.splice(index, 1);
    }
    setOpponentIds(picked);
    setResult(null);
  }

  function runSimulation() {
    if (yourTeam.length === 0 || opponentTeam.length === 0) return;
    const simResult = simulateMatchup(yourTeam, opponentTeam, yourTeamLabel, opponentLabel, schema);
    setResult(simResult);
  }

  const canSimulate = yourTeam.length > 0 && opponentTeam.length > 0;

  return (
    <div className="battle-sim-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Head-to-head simulation</p>
          <h2>Battle Simulator</h2>
          <p className="muted">
            Build an opponent team and run a round-robin matchup against your squad.
          </p>
        </div>
      </div>

      <div className="battle-opponent-header">
        <label className="battle-label-input">
          <span className="muted">Opponent name</span>
          <input
            value={opponentLabel}
            onChange={(event) => setOpponentLabel(event.target.value)}
            placeholder="Opponent"
          />
        </label>
        <div className="battle-opponent-actions">
          {trainerPresets && trainerPresets.length > 0 && (
            <button type="button" className="ghost-button" onClick={() => { setPresetOpen(!presetOpen); setSearchOpen(false); }}>
              <Users size={14} />
              Trainer team
            </button>
          )}
          <button type="button" className="ghost-button" onClick={addRandomTeam}>
            <Shuffle size={14} />
            Random team
          </button>
          {opponentIds.length > 0 && (
            <button type="button" className="ghost-button" onClick={clearOpponents}>
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="battle-team-slots">
        {Array.from({ length: MAX_TEAM }).map((_, index) => {
          const pokemonId = opponentIds[index];
          const resolved = opponentTeam.find((p) => p.pokemonId === pokemonId);
          const species = pokemonId
            ? Object.values(schema.pokemon).find((s) => s.nationalDexNumber === pokemonId) ?? null
            : null;

          return (
            <div key={pokemonId ? `opp-${pokemonId}-${index}` : `empty-${index}`} className="battle-slot">
              {species ? (
                <>
                  <PokemonImage src={resolved?.artworkUrl} alt={species.name} className="battle-slot-art" />
                  <div className="battle-slot-info">
                    <strong>#{species.nationalDexNumber}</strong>
                    <span>{capitalize(species.name)}</span>
                  </div>
                  <button
                    type="button"
                    className="battle-slot-remove"
                    onClick={() => removeOpponent(index)}
                    aria-label={`Remove ${species.name}`}
                  >
                    ×
                  </button>
                </>
              ) : (
                <span className="muted">Empty</span>
              )}
            </div>
          );
        })}
      </div>

      {opponentIds.length < MAX_TEAM && (
        <div className="battle-pokemon-search">
          <button
            type="button"
            className="ghost-button battle-add-trigger"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <Search size={14} /> : <Plus size={14} />}
            {searchOpen ? "Close search" : "Add Pokemon"}
          </button>

          {searchOpen && (
            <PokemonSearchDropdown schema={schema} onSelect={addOpponent} />
          )}
        </div>
      )}

      {presetOpen && (
        <div className="battle-search-dropdown">
          <input
            className="battle-search-input"
            value={presetQuery}
            onChange={(event) => setPresetQuery(event.target.value)}
            placeholder="Search trainers..."
            autoFocus
          />
          <div className="battle-search-results" role="listbox">
            {filteredPresets.map((preset, i) => (
              <button
                key={`${preset.trainer}-${preset.battleLabel}-${i}`}
                type="button"
                className="battle-search-option"
                role="option"
                onClick={() => loadPreset(preset)}
              >
                <strong>{preset.trainer}</strong>
                <span className="muted">{preset.battleLabel} · {preset.members.length} Pokemon</span>
              </button>
            ))}
            {filteredPresets.length === 0 && (
              <p className="muted battle-search-empty">No trainer teams found</p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className={`primary-link battle-simulate-button ${canSimulate ? "" : "disabled"}`}
        disabled={!canSimulate}
        onClick={runSimulation}
      >
        <Swords size={16} />
        Simulate battle
      </button>

      {!canSimulate && (
        <p className="muted battle-prereq-hint">
          {yourTeam.length === 0
            ? "Add Pokemon to your team from the Pokedex, then come back here."
            : "Add at least one opponent Pokemon to simulate."}
        </p>
      )}

      {result && (
        <>
          <div className="battle-view-toggle">
            <button
              type="button"
              className={`tab-pill ${resultView === "breakdown" ? "active" : ""}`}
              onClick={() => setResultView("breakdown")}
            >
              Breakdown
            </button>
            <button
              type="button"
              className={`tab-pill ${resultView === "matrix" ? "active" : ""}`}
              onClick={() => setResultView("matrix")}
            >
              Matrix
            </button>
            <button
              type="button"
              className={`tab-pill ${resultView === "compare" ? "active" : ""}`}
              onClick={() => setResultView("compare")}
            >
              Compare
            </button>
          </div>
          {resultView === "breakdown" && (
            <BattleResultCard result={result} schema={schema} />
          )}
          {resultView === "matrix" && (
            <MatchupMatrix result={result} schema={schema} />
          )}
          {resultView === "compare" && (
            <TeamComparePanel
              teamA={yourTeam}
              teamB={opponentTeam}
              teamALabel={yourTeamLabel}
              teamBLabel={opponentLabel}
            />
          )}
        </>
      )}
    </div>
  );
}
