import { Download, ExternalLink, Shield, Swords, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { capitalize } from "../lib/format";
import { sanitizeExternalUrl } from "../lib/security";
import type { CustomTeamSet, PokemonSummary, PresetTeam, TeamMemberConfig } from "../lib/types";
import { TrainerSprite } from "./TrainerSprite";

type Props = {
  totalPresetCount: number;
  presetPage: number;
  totalPresetPages: number;
  onPresetPageChange: (page: number) => void;
  currentTeam: TeamMemberConfig[];
  customTeamSets: CustomTeamSet[];
  presets: PresetTeam[];
  pokemonList: PokemonSummary[];
  onSaveCurrentTeam: (name: string, description: string, notes: string, tags: string[]) => void;
  onLoadTeam: (members: TeamMemberConfig[] | number[]) => void;
  onDeleteCustomTeam: (id: string) => void;
  onImportTeamSets: (payload: string) => void;
  onExportTeamSets: () => void;
};

export function TeamSetsPanel({
  totalPresetCount,
  presetPage,
  totalPresetPages,
  onPresetPageChange,
  currentTeam,
  customTeamSets,
  presets,
  pokemonList,
  onSaveCurrentTeam,
  onLoadTeam,
  onDeleteCustomTeam,
  onImportTeamSets,
  onExportTeamSets,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [importPayload, setImportPayload] = useState("");

  const presetGroups = useMemo(() => {
    return presets.reduce<Record<string, PresetTeam[]>>((acc, preset) => {
      acc[preset.category] = [...(acc[preset.category] ?? []), preset];
      return acc;
    }, {});
  }, [presets]);

  const pokemonById = useMemo(() => new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const)), [pokemonList]);

  function renderMembers(members: TeamMemberConfig[] | number[]) {
    const ids = members.map((member) => typeof member === "number" ? member : member.pokemonId);
    return ids
      .map((id) => pokemonList.find((pokemon) => pokemon.id === id)?.name)
      .filter(Boolean)
      .map((name) => capitalize(name))
      .join(", ");
  }

  function summarizePreset(members: number[]) {
    const entries = members.map((id) => pokemonById.get(id)).filter(Boolean) as PokemonSummary[];
    const uniqueTypes = new Set(entries.flatMap((pokemon) => pokemon.types));
    const totalMoveGroups = entries.reduce((sum, pokemon) => sum + pokemon.moveGroups.length, 0);
    const specialCount = entries.filter((pokemon) => pokemon.isLegendary || pokemon.isMythical).length;
    return {
      memberCount: entries.length,
      uniqueTypes: uniqueTypes.size,
      totalMoveGroups,
      specialCount,
    };
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Saved plans and preset rosters</p>
          <h2>Team Sets</h2>
          <p className="muted">{totalPresetCount} preset teams in archive | page {presetPage} of {totalPresetPages}</p>
        </div>
        <div className="inline-actions">
          <button type="button" className="ghost-button" disabled={presetPage <= 1} onClick={() => onPresetPageChange(presetPage - 1)}>Prev</button>
          <button type="button" className="ghost-button" disabled={presetPage >= totalPresetPages} onClick={() => onPresetPageChange(presetPage + 1)}>Next</button>
          <button type="button" className="ghost-button" onClick={onExportTeamSets}><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="team-set-creator rich-team-set-creator">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Team set name" />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" />
        <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags: rain, anti-champion, sand" />
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="How this team works, weak points, and matchup plan" />
        <button
          type="button"
          className="primary-button"
          disabled={currentTeam.length === 0 || !name.trim()}
          onClick={() => {
            onSaveCurrentTeam(name.trim(), description.trim(), notes.trim(), tags.split(",").map((tag) => tag.trim()).filter(Boolean));
            setName("");
            setDescription("");
            setNotes("");
            setTags("");
          }}
        >
          Save current team
        </button>
      </div>

      <div className="team-list">
        {customTeamSets.map((teamSet) => (
          <article key={teamSet.id} className="team-set-card">
            <div>
              <strong>{teamSet.name}</strong>
              <p className="muted">{teamSet.description || "Custom team set"}</p>
              {teamSet.tags.length > 0 ? <p className="small-copy">{teamSet.tags.join(" · ")}</p> : null}
              {teamSet.notes ? <p className="small-copy">{teamSet.notes}</p> : null}
              <p className="small-copy">{renderMembers(teamSet.members)}</p>
            </div>
            <div className="inline-actions">
              <button type="button" className="ghost-button" onClick={() => onLoadTeam(teamSet.members)}>Load</button>
              <button type="button" className="ghost-button" onClick={() => onDeleteCustomTeam(teamSet.id)}>Delete</button>
            </div>
          </article>
        ))}
        {customTeamSets.length === 0 ? <p className="muted">No custom team sets saved yet.</p> : null}
      </div>

      <div className="import-block">
        <label htmlFor="import-payload">Import team sets JSON</label>
        <textarea id="import-payload" value={importPayload} onChange={(event) => setImportPayload(event.target.value)} placeholder="Paste exported JSON here" />
        <button type="button" className="ghost-button" onClick={() => { onImportTeamSets(importPayload); setImportPayload(""); }}><Upload size={16} /> Import</button>
      </div>

      <div className="preset-groups">
        {Object.entries(presetGroups).map(([category, items]) => (
          <div key={category}>
            <h3>{category}</h3>
            <div className="team-list">
              {items.map((preset) => (
                (() => {
                  const summary = summarizePreset(preset.members);
                  const safeSourceUrl = preset.source ? sanitizeExternalUrl(preset.source.url) : null;

                  return (
                    <article key={preset.id} className="team-set-card preset-card">
                      <TrainerSprite trainer={preset.trainer} region={preset.region} />
                      <div className="preset-card-content">
                        <div className="preset-stat-grid">
                          <div><strong>{summary.memberCount}</strong><span>Members</span></div>
                          <div><strong>{summary.uniqueTypes}</strong><span>Types</span></div>
                          <div><strong>{summary.totalMoveGroups}</strong><span>Move groups</span></div>
                          <div><strong>{summary.specialCount}</strong><span>Legend/Mythic</span></div>
                        </div>
                        <div className="preset-card-header">
                          <div>
                            <strong>{preset.trainer}: {preset.name}</strong>
                            <p className="muted">{preset.sourceGame}</p>
                          </div>
                          {safeSourceUrl ? (
                            <a className="source-link" href={safeSourceUrl} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer">
                              <ExternalLink size={14} />
                              Reference
                            </a>
                          ) : null}
                        </div>
                        <div className="preset-meta-row">
                          <span className="mini-badge">{preset.battleLabel}</span>
                          <span className="mini-badge">{preset.region}</span>
                          <span className="mini-badge">Difficulty: {preset.difficulty}</span>
                          <span className="mini-badge">{preset.canonical ? "Canonical" : "Inspired"}</span>
                        </div>
                        <p className="small-copy">{preset.description}</p>
                        <p className="small-copy"><strong>Tags:</strong> {preset.tags.join(", ")}</p>
                        <p className="small-copy"><strong>Team:</strong> {renderMembers(preset.members)}</p>
                        <div className="strategy-box">
                          <div className="strategy-title"><Shield size={14} /> How to beat</div>
                          {preset.howToBeat.map((tip) => <p key={tip} className="small-copy">{tip}</p>)}
                        </div>
                      </div>
                      <div className="preset-card-actions">
                        <button type="button" className="ghost-button" onClick={() => onLoadTeam(preset.members)}><Swords size={14} /> Load</button>
                      </div>
                    </article>
                  );
                })()
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
