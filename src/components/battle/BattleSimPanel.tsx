import { Swords, Shuffle, Trash2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { EncyclopediaSchema } from "../../lib/encyclopedia-schema";
import type { BattlePokemon, SimulationResult } from "../../lib/battleTypes";
import { resolveBattlePokemon, simulateMatchup } from "../../lib/battleSim";
import { BattleResultCard } from "./BattleResultCard";
import { capitalize } from "../../lib/format";

type Props = {
  yourTeam: BattlePokemon[];
  yourTeamLabel: string;
  schema: EncyclopediaSchema;
};

const MAX_TEAM = 6;

export function BattleSimPanel({ yourTeam, yourTeamLabel, schema }: Props) {
  const [opponentIds, setOpponentIds] = useState<number[]>([]);
  const [opponentLabel, setOpponentLabel] = useState("Opponent");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const pokemonList = useMemo(() => {
    return Object.values(schema.pokemon)
      .sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  }, [schema.pokemon]);

  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) return pokemonList.slice(0, 50);
    const query = searchQuery.toLowerCase();
    return pokemonList
      .filter((species) =>
        species.name.toLowerCase().includes(query) ||
        String(species.nationalDexNumber).includes(query),
      )
      .slice(0, 50);
  }, [pokemonList, searchQuery]);

  const opponentTeam = useMemo(() => {
    return opponentIds
      .map((id) => resolveBattlePokemon(schema, id))
      .filter((pokemon): pokemon is BattlePokemon => pokemon !== null);
  }, [opponentIds, schema]);

  function addOpponent(pokemonId: number) {
    if (opponentIds.length >= MAX_TEAM) return;
    setOpponentIds((ids) => [...ids, pokemonId]);
    setSearchQuery("");
    setSearchOpen(false);
    setResult(null);
  }

  function removeOpponent(index: number) {
    setOpponentIds((ids) => ids.filter((_, i) => i !== index));
    setResult(null);
  }

  function clearOpponents() {
    setOpponentIds([]);
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
          const species = pokemonId
            ? Object.values(schema.pokemon).find((s) => s.nationalDexNumber === pokemonId) ?? null
            : null;

          return (
            <div key={pokemonId ? `opp-${pokemonId}-${index}` : `empty-${index}`} className="battle-slot">
              {species ? (
                <>
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
            <div className="battle-search-dropdown">
              <input
                className="battle-search-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Type a name or dex number..."
                autoFocus
              />
              <div className="battle-search-results" role="listbox">
                {filteredPokemon.map((species) => (
                  <button
                    key={species.nationalDexNumber}
                    type="button"
                    className="battle-search-option"
                    role="option"
                    onClick={() => addOpponent(species.nationalDexNumber)}
                  >
                    <span className="mono">#{String(species.nationalDexNumber).padStart(4, "0")}</span>
                    <span>{capitalize(species.name)}</span>
                  </button>
                ))}
                {filteredPokemon.length === 0 && (
                  <p className="muted battle-search-empty">No Pokemon found</p>
                )}
              </div>
            </div>
          )}
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

      {result && <BattleResultCard result={result} />}
    </div>
  );
}
