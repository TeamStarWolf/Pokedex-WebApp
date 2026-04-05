import { useEffect, useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

const BASE = import.meta.env.BASE_URL;

/** Prefix absolute paths with the deploy base so images resolve on GitHub Pages. */
function resolveAssetUrl(url: string): string {
  if (url.startsWith("/") && !url.startsWith(BASE)) {
    return `${BASE}${url.slice(1)}`;
  }
  return url;
}

export function PokemonImage({ src, alt, className, loading }: Props) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (!src || broken) {
    return (
      <div className={`pokemon-image-fallback ${className ?? ""}`} aria-label={alt}>
        <span>{alt.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return <img src={resolveAssetUrl(src)} alt={alt} className={className} loading={loading} onError={() => setBroken(true)} />;
}
