import { useMemo } from "react";
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import type { MoveEntity } from "../../lib/encyclopedia-schema";
import { listMoves, listTypes } from "../../lib/encyclopedia";

export function MoveIndexPage() {
  useDocumentTitle("Moves");
  const { schema } = useEncyclopediaData();
  const moves = listMoves(schema);
  const types = listTypes(schema);

  const typeOptions = useMemo(() =>
    types.map((type) => ({ value: type.id, label: type.name })),
    [types],
  );

  const damageClassOptions = useMemo(() => {
    const classes = Array.from(new Set(moves.map((move) => move.damageClass))).sort();
    return classes.map((dc) => ({ value: dc, label: dc.charAt(0).toUpperCase() + dc.slice(1) }));
  }, [moves]);

  const filterFn = useMemo(() => {
    return (move: MoveEntity, activeFilters: Record<string, string>) => {
      if (activeFilters.type !== "all" && move.typeId !== activeFilters.type) return false;
      if (activeFilters.class !== "all" && move.damageClass !== activeFilters.class) return false;
      return true;
    };
  }, []);

  return (
    <EntityIndexPage
      title="Moves"
      eyebrow="Entity index"
      subtitle="Browse move entries directly instead of discovering them only through species pages."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Moves" }]}
      entities={moves}
      searchPlaceholder="Search moves"
      hrefFor={(move) => encyclopediaRoutes.move(move.slug)}
      metaFor={(move) => `${schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "")} · ${move.damageClass}`}
      filters={[
        { key: "type", label: "Type", options: typeOptions },
        { key: "class", label: "Class", options: damageClassOptions },
      ]}
      filterFn={filterFn}
    />
  );
}
