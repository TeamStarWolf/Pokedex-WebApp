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

  const powerRangeOptions = useMemo(() => [
    { value: "0", label: "Status (no power)" },
    { value: "1-60", label: "1 - 60" },
    { value: "61-90", label: "61 - 90" },
    { value: "91-120", label: "91 - 120" },
    { value: "121+", label: "121+" },
  ], []);

  const filterFn = useMemo(() => {
    return (move: MoveEntity, activeFilters: Record<string, string>) => {
      if (activeFilters.type !== "all" && move.typeId !== activeFilters.type) return false;
      if (activeFilters.class !== "all" && move.damageClass !== activeFilters.class) return false;
      if (activeFilters.power !== "all") {
        const p = move.power ?? 0;
        switch (activeFilters.power) {
          case "0": if (p !== 0) return false; break;
          case "1-60": if (p < 1 || p > 60) return false; break;
          case "61-90": if (p < 61 || p > 90) return false; break;
          case "91-120": if (p < 91 || p > 120) return false; break;
          case "121+": if (p < 121) return false; break;
        }
      }
      return true;
    };
  }, []);

  const sortOptions = useMemo(() => [
    { key: "name", label: "Name (A-Z)", compareFn: (a: MoveEntity, b: MoveEntity) => a.name.localeCompare(b.name) },
    { key: "name-desc", label: "Name (Z-A)", compareFn: (a: MoveEntity, b: MoveEntity) => b.name.localeCompare(a.name) },
    { key: "power-desc", label: "Power (high to low)", compareFn: (a: MoveEntity, b: MoveEntity) => (b.power ?? 0) - (a.power ?? 0) },
    { key: "power-asc", label: "Power (low to high)", compareFn: (a: MoveEntity, b: MoveEntity) => (a.power ?? 0) - (b.power ?? 0) },
    { key: "accuracy-desc", label: "Accuracy (high to low)", compareFn: (a: MoveEntity, b: MoveEntity) => (b.accuracy ?? 101) - (a.accuracy ?? 101) },
    { key: "pp-desc", label: "PP (high to low)", compareFn: (a: MoveEntity, b: MoveEntity) => (b.pp ?? 0) - (a.pp ?? 0) },
    { key: "learners", label: "Most learners", compareFn: (a: MoveEntity, b: MoveEntity) => b.pokemonFormIds.length - a.pokemonFormIds.length },
  ], []);

  return (
    <EntityIndexPage
      title="Moves"
      eyebrow="Entity index"
      subtitle="Browse, filter, and sort all moves by type, class, power, and more."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Moves" }]}
      entities={moves}
      searchPlaceholder="Search moves by name"
      hrefFor={(move) => encyclopediaRoutes.move(move.slug)}
      metaFor={(move) => {
        const typeName = schema.types[move.typeId]?.name ?? move.typeId.replace("type:", "");
        const cls = move.damageClass.charAt(0).toUpperCase() + move.damageClass.slice(1);
        return `${typeName} · ${cls}`;
      }}
      detailFor={(move) => {
        const parts: string[] = [];
        if (move.power) parts.push(`Pwr ${move.power}`);
        if (move.accuracy) parts.push(`Acc ${move.accuracy}%`);
        if (move.pp) parts.push(`PP ${move.pp}`);
        parts.push(`${move.pokemonFormIds.length} learners`);
        return parts.join(" · ");
      }}
      filters={[
        { key: "type", label: "Type", options: typeOptions },
        { key: "class", label: "Class", options: damageClassOptions },
        { key: "power", label: "Power", options: powerRangeOptions },
      ]}
      filterFn={filterFn}
      sortOptions={sortOptions}
      defaultSort="name"
    />
  );
}
