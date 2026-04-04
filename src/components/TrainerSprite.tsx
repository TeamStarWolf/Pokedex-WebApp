import { useState } from "react";
import { trainerSpriteManifest } from "../data/trainerSpriteManifest";

type Props = {
  trainer: string;
  region: string;
};

const TRAINER_SPRITE_VERSION = "20260313b";

function slugifyTrainer(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TrainerSprite({ trainer, region }: Props) {
  const [broken, setBroken] = useState(false);
  const initials = trainer
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const spriteFilename = trainerSpriteManifest[trainer] ?? `${slugifyTrainer(trainer)}.svg`;
  const spritePath = `/trainer-sprites/${spriteFilename}?v=${TRAINER_SPRITE_VERSION}`;

  if (!broken) {
    return (
      <img
        src={spritePath}
        alt={`${trainer} trainer sprite`}
        className="trainer-sprite-image"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div className="trainer-sprite" aria-label={`${trainer} trainer sprite`}>
      <div className="trainer-sprite-head" />
      <div className="trainer-sprite-body" />
      <span>{initials}{region[0]?.toUpperCase() ?? ""}</span>
    </div>
  );
}
