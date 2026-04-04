import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listAbilities } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function AbilityIndexPage() {
  const { schema } = useEncyclopediaData();
  const abilities = listAbilities(schema);

  return (
    <EntityIndexPage
      title="Abilities"
      eyebrow="Entity index"
      subtitle="Browse ability articles and their linked form coverage."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Abilities" }]}
      entities={abilities}
      searchPlaceholder="Search abilities"
      hrefFor={(ability) => encyclopediaRoutes.ability(ability.slug)}
      metaFor={(ability) => `${ability.pokemonFormIds.length} linked forms`}
    />
  );
}
