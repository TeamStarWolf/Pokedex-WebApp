// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { EncyclopediaSchema, TypeId } from "../../lib/encyclopedia-schema";
import { capitalize } from "../../lib/format";

type Props = {
  typeId: TypeId;
  schema: EncyclopediaSchema;
  size?: "xs" | "sm" | "md";
};

export function TypeBadge({ typeId, schema, size = "sm" }: Props) {
  const type = schema.types[typeId];
  const name = type?.name ?? typeId.replace("type:", "");
  const color = type?.colorToken ?? "#475569";

  const sizeClass = size === "md" ? "battle-type-badge-md" : size === "xs" ? "battle-type-badge-xs" : "";

  return (
    <span
      className={`battle-type-badge ${sizeClass}`}
      style={{ ["--type-color" as string]: color }}
    >
      {capitalize(name)}
    </span>
  );
}
