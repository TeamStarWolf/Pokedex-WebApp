import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { capitalize, formatFormLabel, formatVersionGroupLabel, formatVersionLabel, padDex, statLabels, typeColors } from "../lib/format";
import type { PokemonDetail } from "../lib/types";
import { StatsChart } from "./StatsChart";

type Props = {
  detail: PokemonDetail | null;
  loading: boolean;
  error: string;
  open: boolean;
  onClose: () => void;
};

export function PokemonDetailDialog({ detail, loading, error, open, onClose }: Props) {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState("all");
  const [selectedMoveGroup, setSelectedMoveGroup] = useState("all");

  useEffect(() => {
    if (!detail) return;
    setSelectedFormId(detail.defaultFormId ?? detail.forms[0]?.id ?? null);
    setSelectedVersion(detail.versionEntries[0]?.version ?? "all");
    setSelectedMoveGroup(detail.moveGameGroups[0] ?? "all");
  }, [detail]);

  const dialogRef = useRef<HTMLDivElement>(null);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") { onClose(); return; }
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [open, trapFocus]);

  const activeForm = useMemo(() => detail?.forms.find((form) => form.id === selectedFormId) ?? detail?.forms[0] ?? null, [detail, selectedFormId]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="none" onClick={onClose}>
      <div ref={dialogRef} className="dialog-shell detail-dialog-shell" role="dialog" aria-modal="true" aria-labelledby="pokemon-dialog-title" tabIndex={-1} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close details"><X size={18} /></button>
        {loading ? <div className="dialog-state">Loading Pokemon details...</div> : null}
        {!loading && error ? <div className="dialog-state error-copy">{error}</div> : null}
        {!loading && !error && detail && activeForm ? (
          <div className="detail-layout">
            <aside className="detail-hero">
              <div className="detail-hero-copy">
                <span className="badge mono">#{padDex(detail.id)}</span>
                <div className="detail-title-row">
                  <div>
                    <h2 id="pokemon-dialog-title">{formatFormLabel(activeForm.name, detail.speciesName)}</h2>
                    <p className="muted">{detail.genus}</p>
                  </div>
                  {activeForm.tag || activeForm.formFamily !== "Standard" ? (
                    <span className="detail-form-chip">{activeForm.tag ?? activeForm.formFamily}</span>
                  ) : null}
                </div>
              </div>
              <div className="detail-art-shell">
                <img src={activeForm.image} alt={activeForm.name} className="detail-art" />
              </div>
              <div className="type-row">
                {activeForm.types.map((type) => <span key={type} className={`type-pill ${typeColors[type] ?? ""}`}>{capitalize(type)}</span>)}
              </div>
              <div className="detail-callouts">
                <span className="detail-chip">{detail.generationLabel}</span>
                <span className="detail-chip">{detail.entryGameVersions.length} entry games</span>
                <span className="detail-chip">{activeForm.availableVersionGroups.length} move groups</span>
                <span className="detail-chip">BST {activeForm.baseStatTotal}</span>
              </div>
              <dl className="detail-facts">
                <div><dt>Height</dt><dd>{activeForm.height / 10} m</dd></div>
                <div><dt>Weight</dt><dd>{activeForm.weight / 10} kg</dd></div>
                <div><dt>Capture rate</dt><dd>{detail.captureRate ?? "Unknown"}</dd></div>
                <div><dt>Happiness</dt><dd>{detail.happiness ?? "Unknown"}</dd></div>
              </dl>
            </aside>
            <section className="detail-content">
              <div className="detail-section">
                <div className="detail-section-header">
                  <div>
                    <p className="eyebrow">Forms and variants</p>
                    <h3>Form Browser</h3>
                  </div>
                </div>
                <div className="form-grid">
                  {detail.forms.map((form) => (
                    <button key={form.id} type="button" className={`form-card ${form.id === activeForm.id ? "selected" : ""}`} onClick={() => setSelectedFormId(form.id)}>
                      <img src={form.image} alt={form.name} className="form-art" />
                      <strong>{formatFormLabel(form.name, detail.speciesName)}</strong>
                      {form.tag || form.formFamily !== "Standard" ? (
                        <span className="small-copy form-meta">{form.tag ?? form.formFamily}</span>
                      ) : (
                        <span className="small-copy form-meta">Standard</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-section two-column">
                <div className="data-panel">
                  <div className="detail-section-header">
                    <div>
                      <p className="eyebrow">Battle profile</p>
                      <h3>Stats</h3>
                    </div>
                  </div>
                  <StatsChart stats={activeForm.stats} />
                  <div className="stat-list">
                    {activeForm.stats.map((stat) => (
                      <div key={stat.name} className="stat-row">
                        <span>{statLabels[stat.name] ?? capitalize(stat.name)}</span>
                        <strong>{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="data-panel">
                  <div className="detail-section-header">
                    <div>
                      <p className="eyebrow">Species information</p>
                      <h3>Overview</h3>
                    </div>
                  </div>
                  <dl className="detail-facts compact">
                    <div><dt>Color</dt><dd>{capitalize(detail.color)}</dd></div>
                    <div><dt>Habitat</dt><dd>{capitalize(detail.habitat)}</dd></div>
                    <div><dt>Shape</dt><dd>{capitalize(detail.shape)}</dd></div>
                    <div><dt>Growth</dt><dd>{capitalize(detail.growthRate)}</dd></div>
                    <div><dt>Egg groups</dt><dd>{detail.eggGroups.map(capitalize).join(", ") || "Unknown"}</dd></div>
                    <div><dt>Abilities</dt><dd>{activeForm.abilities.map((ability) => capitalize(ability.name)).join(", ")}</dd></div>
                    <div><dt>Legendary</dt><dd>{detail.isLegendary ? "Yes" : "No"}</dd></div>
                    <div><dt>Mythical</dt><dd>{detail.isMythical ? "Yes" : "No"}</dd></div>
                  </dl>
                  <div className="evolution-box">
                    <span className="small-copy">Evolution line</span>
                    <p>{detail.evolutionRows.map((row) => `${row.stage}. ${capitalize(row.name)}`).join(" -> ") || "Unavailable"}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section two-column">
                <div className="data-panel">
                  <div className="detail-section-header">
                    <div>
                      <p className="eyebrow">Pokedex availability</p>
                      <h3>Entries by Game</h3>
                    </div>
                  </div>
                  <select value={selectedVersion} onChange={(event) => setSelectedVersion(event.target.value)}>
                    {detail.versionEntries.map((entry) => (
                      <option key={`${entry.version}-${entry.text}`} value={entry.version}>{formatVersionLabel(entry.version)}</option>
                    ))}
                  </select>
                  <p className="entry-copy">{detail.versionEntries.find((entry) => entry.version === selectedVersion)?.text ?? "No entry available."}</p>
                </div>
                <div className="data-panel">
                  <div className="detail-section-header">
                    <div>
                      <p className="eyebrow">Move learnset availability</p>
                      <h3>Moves by Version Group</h3>
                    </div>
                  </div>
                  <select value={selectedMoveGroup} onChange={(event) => setSelectedMoveGroup(event.target.value)}>
                    {activeForm.availableVersionGroups.map((group) => (
                      <option key={group} value={group}>{formatVersionGroupLabel(group)}</option>
                    ))}
                  </select>
                  <div className="move-list">
                    {(activeForm.versionGroupMoves[selectedMoveGroup] ?? []).slice(0, 80).map((move) => (
                      <div key={`${selectedMoveGroup}-${move.move}-${move.method}-${move.level}`} className="move-card">
                        <strong>{capitalize(move.move)}</strong>
                        <span className="small-copy">{capitalize(move.method)} | Lv {move.level}</span>
                      </div>
                    ))}
                    {(activeForm.versionGroupMoves[selectedMoveGroup] ?? []).length === 0 ? <p className="small-copy">No move data for this game group.</p> : null}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
