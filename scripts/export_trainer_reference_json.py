#!/usr/bin/env python3
# PokeNav - Copyright (c) 2026 TeamStarWolf
# https://github.com/TeamStarWolf/PokeNav - MIT License
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
SOURCE_FILE = ROOT / "src" / "data" / "generatedTrainerTeams.json"
OUT_DIR = ROOT / "public" / "data" / "trainers"
MANIFEST_FILE = OUT_DIR / "manifest.json"
BY_TRAINER_DIR = OUT_DIR / "by-trainer"


def slugify(value: str) -> str:
    return re.sub(r"(^-+|-+$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def load_presets() -> list[dict[str, Any]]:
    return json.loads(SOURCE_FILE.read_text(encoding="utf-8"))


def build_appearance_summary(preset: dict[str, Any]) -> dict[str, Any]:
    trainer_slug = slugify(preset["trainer"])
    return {
        "slug": preset["id"].lower(),
        "trainerSlug": trainer_slug,
        "trainer": preset["trainer"],
        "presetId": preset["id"],
        "name": preset["name"],
        "region": preset["region"],
        "category": preset["category"],
        "battleLabel": preset["battleLabel"],
        "sourceGame": preset["sourceGame"],
        "sourceGroup": preset["sourceGroup"],
        "difficulty": preset["difficulty"],
        "canonical": preset["canonical"],
        "tags": preset["tags"],
        "members": preset["members"],
        "acePokemonId": preset["members"][-1] if preset["members"] else None,
        "source": preset.get("source"),
    }


def main() -> None:
    presets = load_presets()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    BY_TRAINER_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {"appearances": [build_appearance_summary(preset) for preset in presets]}
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for preset in presets:
        grouped[slugify(preset["trainer"])].append(preset)

    for trainer_slug, trainer_presets in grouped.items():
        payload = {"trainerSlug": trainer_slug, "presets": trainer_presets}
        target = BY_TRAINER_DIR / f"{trainer_slug}.json"
        target.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(f"Wrote trainer manifest to {MANIFEST_FILE}")
    print(f"Wrote {len(grouped)} trainer detail files to {BY_TRAINER_DIR}")


if __name__ == "__main__":
    main()
