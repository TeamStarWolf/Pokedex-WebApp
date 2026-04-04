import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import { listMoves } from "../../lib/encyclopedia";

export function MoveIndexPage() {
  const { schema } = useEncyclopediaData();
  const moves = listMoves(schema);

  return (
    <EntityIndexPage
      title="Moves"
      eyebrow="Entity index"
      subtitle="Browse move entries directly instead of discovering them only through species pages."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Moves" }]}
      entities={moves}
      searchPlaceholder="Search moves"
      hrefFor={(move) => encyclopediaRoutes.move(move.slug)}
      metaFor={(move) => `${schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")} | ${move.damageClass}`}
    />
  );
}
