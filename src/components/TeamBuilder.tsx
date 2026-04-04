import { capitalize } from "../lib/format";
import type { PokemonSummary, TeamMemberConfig, TeamProfile } from "../lib/types";

type Props = {
  team: TeamMemberConfig[];
  profile: TeamProfile;
  pokemonList: PokemonSummary[];
  onToggleTeam: (id: number) => void;
  onUpdateMember: (index: number, patch: Partial<TeamMemberConfig>) => void;
  onUpdateProfile: (patch: Partial<TeamProfile>) => void;
  onClear: () => void;
};

export function TeamBuilder({ team, profile, pokemonList, onToggleTeam, onUpdateMember, onUpdateProfile, onClear }: Props) {
  const members = team
    .map((member) => ({
      member,
      pokemon: pokemonList.find((pokemon) => pokemon.id === member.pokemonId),
    }))
    .filter((entry) => entry.pokemon) as Array<{ member: TeamMemberConfig; pokemon: PokemonSummary }>;
  const filledSlots = members.length;

  return (
    <section className="panel trainer-builder-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Custom build workspace</p>
          <h2>{profile.name || "Current Team"}</h2>
          <p className="muted">Editable slots, nicknames, roles, and matchup notes for your counter-team.</p>
        </div>
        <button type="button" className="ghost-button" onClick={onClear}>Clear team</button>
      </div>
      <div className="team-builder-summary">
        <div><strong>{filledSlots}/6</strong><span>Slots filled</span></div>
        <div><strong>{members.filter((member) => member.member.role.trim()).length}</strong><span>Defined roles</span></div>
        <div><strong>{members.filter((member) => member.member.notes.trim()).length}</strong><span>Slots with notes</span></div>
      </div>
      <div className="team-profile-grid">
        <input value={profile.name} onChange={(event) => onUpdateProfile({ name: event.target.value })} placeholder="Team name" />
        <textarea value={profile.notes} onChange={(event) => onUpdateProfile({ notes: event.target.value })} placeholder="Overall team plan, weaknesses, and goals" />
      </div>
      <div className="team-grid">
        {Array.from({ length: 6 }).map((_, index) => {
          const member = members[index];
          return (
            <div key={member ? `pokemon-${member.member.pokemonId}` : `empty-${index}`} className="team-slot">
              {member ? (
                <>
                  <div className="team-slot-header">
                    <img src={member.pokemon.image} alt={member.pokemon.name} className="team-art" />
                    <div>
                      <strong>{member.member.nickname || capitalize(member.pokemon.name)}</strong>
                      <p className="small-copy">{capitalize(member.pokemon.name)}</p>
                      <p className="small-copy">{member.pokemon.generationLabel}</p>
                    </div>
                  </div>
                  <input value={member.member.nickname} onChange={(event) => onUpdateMember(index, { nickname: event.target.value })} placeholder="Nickname" />
                  <input value={member.member.role} onChange={(event) => onUpdateMember(index, { role: event.target.value })} placeholder="Role or matchup job" />
                  <textarea value={member.member.notes} onChange={(event) => onUpdateMember(index, { notes: event.target.value })} placeholder="Slot notes, tech choices, counters" />
                  <button type="button" className="text-button" onClick={() => onToggleTeam(member.pokemon.id)}>Remove</button>
                </>
              ) : (
                <div className="empty-slot-copy">
                  <strong>Empty slot</strong>
                  <span className="muted">Add a Pokemon from the Pokedex view or load a trainer preset.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
