#!/usr/bin/env python3
from __future__ import annotations

import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
SPRITE_DIR = ROOT / "public" / "trainer-sprites"
MANIFEST_FILE = ROOT / "src" / "data" / "trainerSpriteManifest.ts"
OUT_FILE = ROOT / "public" / "trainer-sprite-sheet.png"


def load_manifest() -> list[tuple[str, str]]:
    text = MANIFEST_FILE.read_text(encoding="utf-8")
    entries = re.findall(r'"([^"]+)":\s+"([^"]+)"', text)
    return sorted(entries, key=lambda item: item[0].lower())


def main() -> None:
    entries = load_manifest()
    if not entries:
        raise SystemExit("No trainer sprite manifest entries found.")

    cols = 4
    cell_w = 300
    cell_h = 360
    padding = 20
    rows = math.ceil(len(entries) / cols)
    sheet = Image.new("RGB", (cols * cell_w + padding * 2, rows * cell_h + padding * 2), "#f8fafc")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, (trainer, filename) in enumerate(entries):
        col = index % cols
        row = index // cols
        x = padding + col * cell_w
        y = padding + row * cell_h
        draw.rounded_rectangle((x, y, x + cell_w - 18, y + cell_h - 18), radius=18, fill="#ffffff", outline="#cbd5e1", width=2)

        image_path = SPRITE_DIR / filename
        sprite = Image.open(image_path).convert("RGBA")
        sprite.thumbnail((cell_w - 50, 250))
        sprite_x = x + ((cell_w - 18) - sprite.width) // 2
        sprite_y = y + 18
        sheet.paste(sprite, (sprite_x, sprite_y), sprite)

        text_y = y + 280
        draw.text((x + 16, text_y), trainer, fill="#0f172a", font=font)
        draw.text((x + 16, text_y + 18), filename, fill="#475569", font=font)

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_FILE)
    print(f"Wrote {OUT_FILE}")


if __name__ == "__main__":
    main()
