import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EncyclopediaSchema } from "../../lib/encyclopedia-schema";
import { capitalize } from "../../lib/format";

type Props = {
  schema: EncyclopediaSchema;
  onSelect: (dexNumber: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function PokemonSearchDropdown({ schema, onSelect, placeholder = "Type a name or dex number...", autoFocus = true }: Props) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pokemonList = useMemo(() => {
    return Object.values(schema.pokemon).sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  }, [schema.pokemon]);

  const results = useMemo(() => {
    if (!query.trim()) return pokemonList.slice(0, 50);
    const q = query.toLowerCase();
    return pokemonList
      .filter((s) => s.name.toLowerCase().includes(q) || String(s.nationalDexNumber).includes(q))
      .slice(0, 50);
  }, [pokemonList, query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.children[activeIndex] as HTMLElement | undefined;
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = useCallback((dexNum: number) => {
    onSelect(dexNum);
    setQuery("");
    setActiveIndex(0);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex].nationalDexNumber);
      }
    }
  }, [results, activeIndex, handleSelect]);

  return (
    <div className="battle-search-dropdown">
      <input
        ref={inputRef}
        className="battle-search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded="true"
        aria-activedescendant={results[activeIndex] ? `pokemon-opt-${results[activeIndex].nationalDexNumber}` : undefined}
      />
      <div className="battle-search-results" role="listbox" ref={listRef}>
        {results.map((species, i) => (
          <button
            key={species.nationalDexNumber}
            id={`pokemon-opt-${species.nationalDexNumber}`}
            type="button"
            className={`battle-search-option ${i === activeIndex ? "battle-search-option-active" : ""}`}
            role="option"
            aria-selected={i === activeIndex}
            onClick={() => handleSelect(species.nationalDexNumber)}
            onMouseEnter={() => setActiveIndex(i)}
          >
            <span className="mono">#{String(species.nationalDexNumber).padStart(4, "0")}</span>
            <span>{capitalize(species.name)}</span>
          </button>
        ))}
        {results.length === 0 && (
          <p className="muted battle-search-empty">No Pokemon found</p>
        )}
      </div>
    </div>
  );
}
