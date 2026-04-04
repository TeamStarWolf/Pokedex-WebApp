import type { ReactNode } from "react";
import { Link, useSearchParams, type LinkProps } from "react-router-dom";

type GameScopedLinkProps = Omit<LinkProps, "to"> & {
  to: string;
  children: ReactNode;
  preserveGame?: boolean;
};

function mergeQuery(to: string, searchParams: URLSearchParams, preserveGame: boolean) {
  if (!preserveGame) return to;

  const activeGame = searchParams.get("game");
  if (!activeGame) return to;

  const [pathname, query = ""] = to.split("?");
  const next = new URLSearchParams(query);
  if (!next.has("game")) next.set("game", activeGame);
  const serialized = next.toString();
  return `${pathname}${serialized ? `?${serialized}` : ""}`;
}

export function GameScopedLink({ to, preserveGame = true, children, ...rest }: GameScopedLinkProps) {
  const [searchParams] = useSearchParams();
  return (
    <Link to={mergeQuery(to, searchParams, preserveGame)} {...rest}>
      {children}
    </Link>
  );
}
