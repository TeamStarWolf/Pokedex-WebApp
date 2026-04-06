// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
type Props = {
  height?: string;
  width?: string;
  className?: string;
};

export function SkeletonBlock({ height = "1em", width = "100%", className }: Props) {
  return <div className={`skeleton-block ${className ?? ""}`} style={{ height, width }} />;
}
