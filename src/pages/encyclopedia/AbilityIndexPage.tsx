// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
<<<<<<< HEAD
import { useMemo } from "react";
=======
>>>>>>> 56d28b7 (Add TeamStarWolf copyright headers to all source files)
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listAbilities } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import type { AbilityEntity } from "../../lib/encyclopedia-schema";

export function AbilityIndexPage() {
  useDocumentTitle("Abilities");
  const { schema } = useEncyclopediaData();
  const abilities = listAbilities(schema);

  const coverageOptions = useMemo(() => [
    { value: "wide", label: "10+ Pokemon" },
    { value: "moderate", label: "3 - 9 Pokemon" },
    { value: "rare", label: "1 - 2 Pokemon" },
    { value: "none", label: "No linked Pokemon" },
  ], []);

  const filterFn = useMemo(() => {
    return (ability: AbilityEntity, activeFilters: Record<string, string>) => {
      if (activeFilters.coverage !== "all") {
        const count = ability.pokemonFormIds.length;
        switch (activeFilters.coverage) {
          case "wide": if (count < 10) return false; break;
          case "moderate": if (count < 3 || count > 9) return false; break;
          case "rare": if (count < 1 || count > 2) return false; break;
          case "none": if (count !== 0) return false; break;
        }
      }
      return true;
    };
  }, []);

  const sortOptions = useMemo(() => [
    { key: "name", label: "Name (A-Z)", compareFn: (a: AbilityEntity, b: AbilityEntity) => a.name.localeCompare(b.name) },
    { key: "name-desc", label: "Name (Z-A)", compareFn: (a: AbilityEntity, b: AbilityEntity) => b.name.localeCompare(a.name) },
    { key: "pokemon-desc", label: "Most Pokemon", compareFn: (a: AbilityEntity, b: AbilityEntity) => b.pokemonFormIds.length - a.pokemonFormIds.length },
    { key: "pokemon-asc", label: "Fewest Pokemon", compareFn: (a: AbilityEntity, b: AbilityEntity) => a.pokemonFormIds.length - b.pokemonFormIds.length },
  ], []);

  return (
    <EntityIndexPage
      title="Abilities"
      eyebrow="Entity index"
      subtitle="Browse ability articles, filter by coverage, and sort by linked Pokemon count."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Abilities" }]}
      entities={abilities}
      searchPlaceholder="Search abilities by name"
      hrefFor={(ability) => encyclopediaRoutes.ability(ability.slug)}
      metaFor={(ability) => `${ability.pokemonFormIds.length} linked forms`}
      detailFor={(ability) => ability.description || null}
      filters={[
        { key: "coverage", label: "Coverage", options: coverageOptions },
      ]}
      filterFn={filterFn}
      sortOptions={sortOptions}
      defaultSort="name"
    />
  );
}
