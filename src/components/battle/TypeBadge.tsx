import type { EncyclopediaSchema, TypeId } from "../../lib/encyclopedia-schema";
import { capitalize } from "../../lib/format";

type Props = {
  typeId: TypeId;
  schema: EncyclopediaSchema;
  size?: "sm" | "md";
};

export function TypeBadge({ typeId, schema, size = "sm" }: Props) {
  const type = schema.types[typeId];
  const name = type?.name ?? typeId.replace("type:", "");
  const color = type?.colorToken ?? "#475569";

  return (
    <span
      className={`battle-type-badge ${size === "md" ? "battle-type-badge-md" : ""}`}
      style={{ ["--type-color" as string]: color }}
    >
      {capitalize(name)}
    </span>
  );
}
