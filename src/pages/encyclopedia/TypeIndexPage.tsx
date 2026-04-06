// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listTypes } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function TypeIndexPage() {
  useDocumentTitle("Types");
  const { schema } = useEncyclopediaData();
  const types = listTypes(schema);

  return (
    <EntityIndexPage
      title="Types"
      eyebrow="Entity index"
      subtitle="Browse type pages and move into matchup-driven browsing."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Types" }]}
      entities={types}
      searchPlaceholder="Search types"
      hrefFor={(type) => encyclopediaRoutes.type(type.slug)}
      metaFor={(type) => `${type.offensiveMatchups.length} offensive matchups`}
    />
  );
}
