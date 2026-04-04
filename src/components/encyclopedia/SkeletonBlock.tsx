type Props = {
  height?: string;
  width?: string;
  className?: string;
};

export function SkeletonBlock({ height = "1em", width = "100%", className }: Props) {
  return <div className={`skeleton-block ${className ?? ""}`} style={{ height, width }} />;
}
