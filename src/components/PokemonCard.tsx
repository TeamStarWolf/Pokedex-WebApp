import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { capitalize, padDex, typeColors } from "../lib/format";
import type { PokemonSummary } from "../lib/types";

type Props = {
  pokemon: PokemonSummary;
  isFavorite: boolean;
  inTeam: boolean;
  onToggleFavorite: (id: number) => void;
  onToggleTeam: (id: number) => void;
  onOpen: (id: number) => void;
};

export function PokemonCard({ pokemon, isFavorite, inTeam, onToggleFavorite, onToggleTeam, onOpen }: Props) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card pokemon-card">
      <div className="card-topline">
        <span className="badge mono">#{padDex(pokemon.id)}</span>
        <div className="card-actions">
          <button type="button" className={`icon-button ${isFavorite ? "active-favorite" : ""}`} onClick={() => onToggleFavorite(pokemon.id)} aria-label={`Toggle ${pokemon.name} favorite`}>
            <Heart size={16} />
          </button>
          <button type="button" className={`icon-button ${inTeam ? "active-team" : ""}`} onClick={() => onToggleTeam(pokemon.id)} aria-label={`Toggle ${pokemon.name} in team`}>
            <Sparkles size={16} />
          </button>
        </div>
      </div>
      <button type="button" className="card-main-button" onClick={() => onOpen(pokemon.id)}>
        <div className="card-art-shell">
          <img src={pokemon.image} alt={pokemon.name} className="pokemon-art" loading="lazy" />
        </div>
        <div className="card-title-row">
          <div>
            <h3>{capitalize(pokemon.name)}</h3>
            <p className="muted">{pokemon.generationLabel}</p>
          </div>
          <span className="mini-badge">{pokemon.varietyCount} forms</span>
        </div>
        <div className="type-row">
          {pokemon.types.map((type) => (
            <span key={type} className={`type-pill ${typeColors[type] ?? ""}`}>
              {capitalize(type)}
            </span>
          ))}
        </div>
        <div className="summary-grid">
          <div><strong>{pokemon.versionCount}</strong><span>Entries</span></div>
          <div><strong>{pokemon.moveGroups.length}</strong><span>Move groups</span></div>
          <div><strong>{pokemon.varietyCount}</strong><span>Forms</span></div>
          <div><strong>{pokemon.moveCount}</strong><span>Moves</span></div>
        </div>
        <div className="card-footer-note">
          <span>{pokemon.isLegendary ? "Legendary" : pokemon.isMythical ? "Mythical" : "Species data"}</span>
          <span>{pokemon.entryGames.length} entry games</span>
        </div>
      </button>
    </motion.article>
  );
}
