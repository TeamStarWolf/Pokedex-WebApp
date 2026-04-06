// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
<<<<<<< HEAD
import { useMemo } from "react";
=======
>>>>>>> 56d28b7 (Add TeamStarWolf copyright headers to all source files)
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listLocations, listRegions } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import type { LocationEntity } from "../../lib/encyclopedia-schema";

export function LocationIndexPage() {
  useDocumentTitle("Locations");
  const { schema } = useEncyclopediaData();
  const locations = listLocations(schema);
  const regions = listRegions(schema);

  const regionOptions = useMemo(() =>
    regions.map((region) => ({ value: region.id, label: region.name })),
    [regions],
  );

  const filterFn = useMemo(() => {
    return (location: LocationEntity, activeFilters: Record<string, string>) => {
      if (activeFilters.region !== "all" && location.regionId !== activeFilters.region) return false;
      return true;
    };
  }, []);

  return (
    <EntityIndexPage
      title="Locations"
      eyebrow="Entity index"
      subtitle="Browse location pages directly and pivot into encounter-linked references."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Locations" }]}
      entities={locations}
      searchPlaceholder="Search locations"
      hrefFor={(location) => encyclopediaRoutes.location(location.slug)}
      metaFor={(location) => (location.regionId ? schema.regions[location.regionId]?.name : null) ?? "Region unknown"}
      filters={[
        { key: "region", label: "Region", options: regionOptions },
      ]}
      filterFn={filterFn}
    />
  );
}
