// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { EntityIndexPage } from "../../components/encyclopedia/EntityIndexPage";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useEncyclopediaData } from "../../hooks/useEncyclopediaData";
import { listGames } from "../../lib/encyclopedia";
import { encyclopediaRoutes } from "../../lib/encyclopedia-schema";

export function GameIndexPage() {
  useDocumentTitle("Games");
  const { schema } = useEncyclopediaData();
  const games = listGames(schema);

  return (
    <EntityIndexPage
      title="Games"
      eyebrow="Entity index"
      subtitle="Browse game-version pages as first-class encyclopedia topics."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Games" }]}
      entities={games}
      searchPlaceholder="Search games"
      hrefFor={(game) => encyclopediaRoutes.game(game.slug)}
      metaFor={(game) => `${game.shortName} · Gen ${game.generation || "?"}`}
    />
  );
}
