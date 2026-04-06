// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useMemo } from "react";
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listItems } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";
import type { ItemEntity } from "../../lib/encyclopedia-schema";

export function ItemIndexPage() {
  useDocumentTitle("Items");
  const { schema } = useEncyclopediaData();
  const items = listItems(schema);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(items.map((item) => item.category))).filter(Boolean).sort();
    return categories.map((category) => ({ value: category, label: category }));
  }, [items]);

  const filterFn = useMemo(() => {
    return (item: ItemEntity, activeFilters: Record<string, string>) => {
      if (activeFilters.category !== "all" && item.category !== activeFilters.category) return false;
      return true;
    };
  }, []);

  const sortOptions = useMemo(() => [
    { key: "name", label: "Name (A-Z)", compareFn: (a: ItemEntity, b: ItemEntity) => a.name.localeCompare(b.name) },
    { key: "name-desc", label: "Name (Z-A)", compareFn: (a: ItemEntity, b: ItemEntity) => b.name.localeCompare(a.name) },
    { key: "category", label: "Category", compareFn: (a: ItemEntity, b: ItemEntity) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name) },
    { key: "price-desc", label: "Price (high to low)", compareFn: (a: ItemEntity, b: ItemEntity) => (b.purchasePrice ?? 0) - (a.purchasePrice ?? 0) },
  ], []);

  return (
    <EntityIndexPage
      title="Items"
      eyebrow="Entity index"
      subtitle="Browse items by category, sort by name or price, and explore linked effects."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Items" }]}
      entities={items}
      searchPlaceholder="Search items by name"
      hrefFor={(item) => encyclopediaRoutes.item(item.slug)}
      metaFor={(item) => item.category}
      detailFor={(item) => {
        const parts: string[] = [];
        if (item.purchasePrice) parts.push(`Buy: ${item.purchasePrice}`);
        if (item.sellPrice) parts.push(`Sell: ${item.sellPrice}`);
        if (item.flingPower) parts.push(`Fling: ${item.flingPower}`);
        return parts.length > 0 ? parts.join(" · ") : null;
      }}
      filters={[
        { key: "category", label: "Category", options: categoryOptions },
      ]}
      filterFn={filterFn}
      sortOptions={sortOptions}
      defaultSort="name"
    />
  );
}
