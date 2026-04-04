import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listLocations } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function LocationIndexPage() {
  const { schema } = useEncyclopediaData();
  const locations = listLocations(schema);

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
    />
  );
}
