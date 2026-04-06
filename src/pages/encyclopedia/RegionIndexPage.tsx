// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listRegions } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function RegionIndexPage() {
  useDocumentTitle("Regions");
  const { schema } = useEncyclopediaData();
  const regions = listRegions(schema);

  return (
    <EntityIndexPage
      title="Regions"
      eyebrow="Entity index"
      subtitle="Browse regional articles, linked locations, and game groupings."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Regions" }]}
      entities={regions}
      searchPlaceholder="Search regions"
      hrefFor={(region) => encyclopediaRoutes.region(region.slug)}
      metaFor={(region) => region.generationLabel}
    />
  );
}
