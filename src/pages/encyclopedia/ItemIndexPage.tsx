import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listItems } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function ItemIndexPage() {
  useDocumentTitle("Items");
  const { schema } = useEncyclopediaData();
  const items = listItems(schema);

  return (
    <EntityIndexPage
      title="Items"
      eyebrow="Entity index"
      subtitle="Browse item pages directly from the encyclopedia shell."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Items" }]}
      entities={items}
      searchPlaceholder="Search items"
      hrefFor={(item) => encyclopediaRoutes.item(item.slug)}
      metaFor={(item) => item.category}
    />
  );
}
