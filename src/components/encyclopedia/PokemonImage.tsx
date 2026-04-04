import { useEffect, useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

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

  return <img src={src} alt={alt} className={className} loading={loading} onError={() => setBroken(true)} />;
}
