// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { Search } from "lucide-react";
import { useMemo } from "react";
import { TeamBuilder } from "./TeamBuilder";
import { TrainerDossierPanel } from "./TrainerDossierPanel";
import { TeamSetsPanel } from "./TeamSetsPanel";
import { buildTrainerDossiers } from "../lib/trainers";
import { buildTrainerAppearanceSummaries } from "../lib/trainerEncyclopedia";
import type { CustomTeamSet, PokemonSummary, PresetTeam, TeamMemberConfig, TeamProfile } from "../lib/types";

type Props = {
  teamQuery: string;
  onTeamQueryChange: (value: string) => void;
  teamRegion: string;
  onTeamRegionChange: (value: string) => void;
  teamCategory: string;
  onTeamCategoryChange: (value: string) => void;
  teamDifficulty: string;
  onTeamDifficultyChange: (value: string) => void;
  teamGame: string;
  onTeamGameChange: (value: string) => void;
  regionOptions: string[];
  categoryOptions: string[];
  difficultyOptions: string[];
  gameOptions: string[];
  totalPresetCount: number;
  presetPage: number;
  totalPresetPages: number;
  onPresetPageChange: (page: number) => void;
  currentTeam: TeamMemberConfig[];
  currentTeamProfile: TeamProfile;
  customTeamSets: CustomTeamSet[];
  presets: PresetTeam[];
  allFilteredPresets: PresetTeam[];
  pokemonList: PokemonSummary[];
  onToggleTeam: (id: number) => void;
  onUpdateMember: (index: number, patch: Partial<TeamMemberConfig>) => void;
  onUpdateProfile: (patch: Partial<TeamProfile>) => void;
  onClear: () => void;
  onSaveCurrentTeam: (name: string, description: string, notes: string, tags: string[]) => void;
  onLoadTeam: (members: TeamMemberConfig[] | number[]) => void;
  onDeleteCustomTeam: (id: string) => void;
  onImportTeamSets: (payload: string) => void;
  onExportTeamSets: () => void;
};

export function TrainerTeamsPage(props: Props) {
  const {
    teamQuery,
    onTeamQueryChange,
    teamRegion,
    onTeamRegionChange,
    teamCategory,
    onTeamCategoryChange,
    teamDifficulty,
    onTeamDifficultyChange,
    teamGame,
    onTeamGameChange,
    regionOptions,
    categoryOptions,
    difficultyOptions,
    gameOptions,
    totalPresetCount,
    presetPage,
    totalPresetPages,
    onPresetPageChange,
    currentTeam,
    currentTeamProfile,
    customTeamSets,
    presets,
    allFilteredPresets,
    pokemonList,
    onToggleTeam,
    onUpdateMember,
    onUpdateProfile,
    onClear,
    onSaveCurrentTeam,
    onLoadTeam,
    onDeleteCustomTeam,
    onImportTeamSets,
    onExportTeamSets,
  } = props;

  const { canonicalCount, inspiredCount, uniqueTrainerCount, eliteCount } = useMemo(() => {
    const canonical = allFilteredPresets.filter((preset) => preset.canonical).length;
    return {
      canonicalCount: canonical,
      inspiredCount: allFilteredPresets.length - canonical,
      uniqueTrainerCount: new Set(allFilteredPresets.map((preset) => preset.trainer)).size,
      eliteCount: allFilteredPresets.filter((preset) => preset.difficulty === "elite").length,
    };
  }, [allFilteredPresets]);
  const trainerDossiers = useMemo(() => buildTrainerDossiers(buildTrainerAppearanceSummaries(allFilteredPresets), pokemonList), [allFilteredPresets, pokemonList]);

  return (
    <>
      <section className="panel controls-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Opponent scouting and squad planning</p>
            <h2>Trainer Archive</h2>
            <p className="muted">Browse iconic opponents, load their teams, and build custom counters with matchup notes and exportable sets.</p>
          </div>
        </div>
        <div className="search-box search-box-prominent">
          <Search size={18} />
          <input value={teamQuery} onChange={(event) => onTeamQueryChange(event.target.value)} placeholder="Search trainers, games, tags, battles, or strategy notes" />
        </div>
        <div className="controls-grid">
          <select value={teamRegion} onChange={(event) => onTeamRegionChange(event.target.value)}>
            <option value="all">All regions</option>
            {regionOptions.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
          <select value={teamCategory} onChange={(event) => onTeamCategoryChange(event.target.value)}>
            <option value="all">All categories</option>
            {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select value={teamDifficulty} onChange={(event) => onTeamDifficultyChange(event.target.value)}>
            <option value="all">All difficulties</option>
            {difficultyOptions.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
          </select>
          <select value={teamGame} onChange={(event) => onTeamGameChange(event.target.value)}>
            <option value="all">All games</option>
            {gameOptions.map((game) => <option key={game} value={game}>{game}</option>)}
          </select>
        </div>
        <div className="trainer-stats-grid">
          <div><strong>{presets.length}</strong><span>Visible presets</span></div>
          <div><strong>{uniqueTrainerCount}</strong><span>Trainers</span></div>
          <div><strong>{canonicalCount}</strong><span>Canonical</span></div>
          <div><strong>{inspiredCount}</strong><span>Inspired</span></div>
          <div><strong>{eliteCount}</strong><span>Elite fights</span></div>
          <div><strong>{regionOptions.length}</strong><span>Regions</span></div>
        </div>
        <div className="archive-callouts">
          <div>
            <strong>Preset coverage</strong>
            <p className="muted">Major rivals, bosses, champions, and player-inspired teams are grouped in one archive instead of mixed into the Pokedex grid.</p>
          </div>
          <div>
            <strong>Bulbapedia references</strong>
            <p className="muted">Preset cards now include Bulbapedia trainer-page links or a Bulbapedia search fallback so canon checks are one click away.</p>
          </div>
        </div>
      </section>

      <TrainerDossierPanel dossiers={trainerDossiers} />

      <TeamBuilder
        team={currentTeam}
        profile={currentTeamProfile}
        pokemonList={pokemonList}
        onToggleTeam={onToggleTeam}
        onUpdateMember={onUpdateMember}
        onUpdateProfile={onUpdateProfile}
        onClear={onClear}
      />

      <TeamSetsPanel
        totalPresetCount={totalPresetCount}
        presetPage={presetPage}
        totalPresetPages={totalPresetPages}
        onPresetPageChange={onPresetPageChange}
        currentTeam={currentTeam}
        customTeamSets={customTeamSets}
        presets={presets}
        pokemonList={pokemonList}
        onSaveCurrentTeam={onSaveCurrentTeam}
        onLoadTeam={onLoadTeam}
        onDeleteCustomTeam={onDeleteCustomTeam}
        onImportTeamSets={onImportTeamSets}
        onExportTeamSets={onExportTeamSets}
      />
    </>
  );
}
