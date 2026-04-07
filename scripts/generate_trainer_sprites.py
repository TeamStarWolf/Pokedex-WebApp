#!/usr/bin/env python3
# PokeNav - Copyright (c) 2026 TeamStarWolf
# https://github.com/TeamStarWolf/PokeNav - MIT License
from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "src" / "data" / "trainerPresets"
OUT_DIR = ROOT / "public" / "trainer-sprites"


TRAINER_THEMES = {
    "Adaman": {"bg1": "#fbbf24", "bg2": "#f97316", "hair": "#111827", "outfit": "#0f172a", "accent": "#fcd34d", "coat": True},
    "Alder": {"bg1": "#fde68a", "bg2": "#f59e0b", "hair": "#d6d3d1", "outfit": "#7c2d12", "accent": "#fef3c7", "cape": True},
    "Archie": {"bg1": "#38bdf8", "bg2": "#1d4ed8", "hair": "#111827", "outfit": "#0f172a", "accent": "#ef4444", "bandana": True},
    "Arven": {"bg1": "#fca5a5", "bg2": "#f97316", "hair": "#f8fafc", "outfit": "#1f2937", "accent": "#facc15", "bag": True},
    "Barry": {"bg1": "#fde047", "bg2": "#f59e0b", "hair": "#facc15", "outfit": "#1d4ed8", "accent": "#ef4444", "scarf": True},
    "Blue": {"bg1": "#93c5fd", "bg2": "#2563eb", "hair": "#78350f", "outfit": "#1e3a8a", "accent": "#e5e7eb", "jacket": True},
    "Brendan": {"bg1": "#86efac", "bg2": "#16a34a", "hair": "#1f2937", "outfit": "#dc2626", "accent": "#f8fafc", "hat": True},
    "Bugsy": {"bg1": "#bef264", "bg2": "#65a30d", "hair": "#0f172a", "outfit": "#0f766e", "accent": "#fef08a", "cape": True},
    "Clair": {"bg1": "#c4b5fd", "bg2": "#7c3aed", "hair": "#1d4ed8", "outfit": "#0f172a", "accent": "#e9d5ff", "cape": True},
    "Cynthia": {"bg1": "#e5e7eb", "bg2": "#64748b", "hair": "#facc15", "outfit": "#111827", "accent": "#f8fafc", "fur": True},
    "Cyrus": {"bg1": "#cbd5e1", "bg2": "#475569", "hair": "#60a5fa", "outfit": "#111827", "accent": "#38bdf8", "jacket": True},
    "Diantha": {"bg1": "#fbcfe8", "bg2": "#ec4899", "hair": "#f1f5f9", "outfit": "#7c2d12", "accent": "#fdf2f8", "dress": True},
    "Geeta": {"bg1": "#ddd6fe", "bg2": "#8b5cf6", "hair": "#0f172a", "outfit": "#111827", "accent": "#fef3c7", "ornament": True},
    "Ghetsis": {"bg1": "#d1d5db", "bg2": "#111827", "hair": "#065f46", "outfit": "#166534", "accent": "#a7f3d0", "cape": True},
    "Giovanni": {"bg1": "#f5d0fe", "bg2": "#a21caf", "hair": "#111827", "outfit": "#111827", "accent": "#fef3c7", "suit": True},
    "Gladion": {"bg1": "#e5e7eb", "bg2": "#64748b", "hair": "#f8fafc", "outfit": "#111827", "accent": "#ef4444", "hood": True},
    "Gold / Ethan": {"bg1": "#fca5a5", "bg2": "#dc2626", "hair": "#1f2937", "outfit": "#111827", "accent": "#facc15", "hat": True},
    "Guzma": {"bg1": "#d1fae5", "bg2": "#10b981", "hair": "#f8fafc", "outfit": "#111827", "accent": "#ef4444", "glasses": True},
    "Hau": {"bg1": "#fde68a", "bg2": "#22c55e", "hair": "#78350f", "outfit": "#f97316", "accent": "#166534", "necklace": True},
    "Hilbert / Hilda": {"bg1": "#fca5a5", "bg2": "#111827", "hair": "#f8fafc", "outfit": "#1d4ed8", "accent": "#ef4444", "hat": True},
    "Irida": {"bg1": "#bfdbfe", "bg2": "#2563eb", "hair": "#f8fafc", "outfit": "#1e293b", "accent": "#f8fafc", "ornament": True},
    "Iris": {"bg1": "#f5d0fe", "bg2": "#9333ea", "hair": "#6d28d9", "outfit": "#f97316", "accent": "#fde68a", "cape": True},
    "Karen": {"bg1": "#f3f4f6", "bg2": "#111827", "hair": "#111827", "outfit": "#7c2d12", "accent": "#f9fafb", "fur": True},
    "Kieran": {"bg1": "#bfdbfe", "bg2": "#2563eb", "hair": "#111827", "outfit": "#0f172a", "accent": "#10b981", "mask": True},
    "Kris": {"bg1": "#fca5a5", "bg2": "#2563eb", "hair": "#78350f", "outfit": "#f97316", "accent": "#f8fafc", "hat": True},
    "Lance": {"bg1": "#fecaca", "bg2": "#dc2626", "hair": "#111827", "outfit": "#111827", "accent": "#60a5fa", "cape": True},
    "Leon": {"bg1": "#fca5a5", "bg2": "#7c3aed", "hair": "#312e81", "outfit": "#111827", "accent": "#facc15", "cape": True},
    "Lysandre": {"bg1": "#fde68a", "bg2": "#ef4444", "hair": "#ef4444", "outfit": "#111827", "accent": "#f8fafc", "suit": True},
    "Marnie": {"bg1": "#c4b5fd", "bg2": "#111827", "hair": "#111827", "outfit": "#f472b6", "accent": "#f8fafc", "hood": True},
    "Maxie": {"bg1": "#fca5a5", "bg2": "#b91c1c", "hair": "#111827", "outfit": "#7f1d1d", "accent": "#fef2f2", "bandana": True},
    "Mustard": {"bg1": "#fde68a", "bg2": "#f59e0b", "hair": "#f8fafc", "outfit": "#111827", "accent": "#f8fafc", "headband": True},
    "N": {"bg1": "#bbf7d0", "bg2": "#16a34a", "hair": "#bbf7d0", "outfit": "#111827", "accent": "#f8fafc", "hat": True},
    "Nemona": {"bg1": "#fef08a", "bg2": "#22c55e", "hair": "#0f172a", "outfit": "#f59e0b", "accent": "#1d4ed8", "bag": True},
    "Penny": {"bg1": "#bfdbfe", "bg2": "#8b5cf6", "hair": "#94a3b8", "outfit": "#f472b6", "accent": "#f8fafc", "eevee": True},
    "Professor Kukui": {"bg1": "#fde68a", "bg2": "#f97316", "hair": "#f8fafc", "outfit": "#f8fafc", "accent": "#22c55e", "cap": True},
    "Raihan": {"bg1": "#bae6fd", "bg2": "#0ea5e9", "hair": "#78350f", "outfit": "#111827", "accent": "#f8fafc", "hood": True},
    "Red": {"bg1": "#fecaca", "bg2": "#dc2626", "hair": "#78350f", "outfit": "#111827", "accent": "#f8fafc", "hat": True},
    "Sabrina": {"bg1": "#f5d0fe", "bg2": "#7e22ce", "hair": "#111827", "outfit": "#f8fafc", "accent": "#7c3aed", "dress": True},
    "Serena": {"bg1": "#fbcfe8", "bg2": "#ec4899", "hair": "#78350f", "outfit": "#111827", "accent": "#ef4444", "hat": True},
    "Silver": {"bg1": "#e5e7eb", "bg2": "#475569", "hair": "#dc2626", "outfit": "#111827", "accent": "#cbd5e1", "jacket": True},
    "Steven": {"bg1": "#cbd5e1", "bg2": "#0284c7", "hair": "#60a5fa", "outfit": "#0f172a", "accent": "#f8fafc", "suit": True},
    "Team Rocket Executive": {"bg1": "#d1d5db", "bg2": "#111827", "hair": "#111827", "outfit": "#111827", "accent": "#ef4444", "suit": True},
    "Volkner": {"bg1": "#fde68a", "bg2": "#f59e0b", "hair": "#facc15", "outfit": "#111827", "accent": "#38bdf8", "jacket": True},
    "Volo": {"bg1": "#fef3c7", "bg2": "#f59e0b", "hair": "#f8fafc", "outfit": "#111827", "accent": "#facc15", "coat": True},
    "Wallace": {"bg1": "#a5f3fc", "bg2": "#0891b2", "hair": "#67e8f9", "outfit": "#0f172a", "accent": "#f8fafc", "cape": True},
    "Wally": {"bg1": "#bbf7d0", "bg2": "#22c55e", "hair": "#34d399", "outfit": "#f8fafc", "accent": "#ef4444", "jacket": True},
    "Will": {"bg1": "#fde68a", "bg2": "#f97316", "hair": "#111827", "outfit": "#7c2d12", "accent": "#fef3c7", "mask": True},
    "Wolfe Glick": {"bg1": "#bfdbfe", "bg2": "#2563eb", "hair": "#78350f", "outfit": "#1f2937", "accent": "#f8fafc", "hood": True},
}


def slugify(value: str) -> str:
    return re.sub(r"(^-+|-+$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def palette_seed(value: str) -> int:
    hash_value = 0
    for char in value:
        hash_value = ord(char) + ((hash_value << 5) - hash_value)
    return abs(hash_value)


def fallback_theme(trainer: str) -> dict[str, str | bool]:
    seed = palette_seed(trainer)
    hue = seed % 360
    accent = (hue + 45) % 360
    return {
        "bg1": f"hsl({hue} 74% 76%)",
        "bg2": f"hsl({accent} 72% 50%)",
        "hair": "#1f2937",
        "outfit": "#0f172a",
        "accent": "#f8fafc",
        "jacket": True,
    }


def theme_for(trainer: str) -> dict[str, str | bool]:
    return {**fallback_theme(trainer), **TRAINER_THEMES.get(trainer, {})}


def draw_optional_accessories(theme: dict[str, str | bool]) -> str:
    accent = theme["accent"]
    outfit = theme["outfit"]
    parts: list[str] = []
    if theme.get("hat"):
        parts.append(f'<path d="M21 34h54l-7-11H29z" fill="{accent}" /><rect x="23" y="33" width="50" height="6" rx="3" fill="{outfit}" />')
    if theme.get("cap"):
        parts.append(f'<path d="M24 35c8-11 40-11 48 0v4H24z" fill="{accent}" /><path d="M60 39c8 0 12 2 14 5-6 0-12 0-18 1z" fill="{outfit}" />')
    if theme.get("bandana"):
        parts.append(f'<rect x="22" y="36" width="52" height="8" rx="4" fill="{accent}" />')
    if theme.get("headband"):
        parts.append(f'<rect x="24" y="37" width="48" height="6" rx="3" fill="{accent}" />')
    if theme.get("glasses"):
        parts.append('<rect x="30" y="45" width="14" height="8" rx="2" fill="#111827" opacity="0.85" /><rect x="52" y="45" width="14" height="8" rx="2" fill="#111827" opacity="0.85" /><rect x="44" y="48" width="8" height="2" fill="#111827" opacity="0.85" />')
    if theme.get("mask"):
        parts.append(f'<path d="M29 52c6 5 32 5 38 0v8c-6 5-32 5-38 0z" fill="{accent}" opacity="0.92" />')
    if theme.get("ornament"):
        parts.append(f'<circle cx="70" cy="40" r="6" fill="{accent}" /><circle cx="26" cy="41" r="4" fill="{accent}" opacity="0.88" />')
    if theme.get("necklace"):
        parts.append(f'<path d="M33 77c8 8 22 8 30 0" fill="none" stroke="{accent}" stroke-width="4" stroke-linecap="round" />')
    if theme.get("bag"):
        parts.append(f'<path d="M65 77h12v23H61V82c0-3 2-5 4-5z" fill="{accent}" opacity="0.95" />')
    if theme.get("eevee"):
        parts.append(f'<path d="M65 82l5-7 7 7-3 11h-6z" fill="{accent}" /><path d="M68 78l-3-9 8 7zM75 78l4-9-1 10z" fill="{outfit}" />')
    return "".join(parts)


def draw_outerwear(theme: dict[str, str | bool]) -> str:
    accent = theme["accent"]
    outfit = theme["outfit"]
    parts: list[str] = []
    if theme.get("cape"):
        parts.append(f'<path d="M18 80c8-17 20-26 30-26s22 9 30 26l-7 25H25z" fill="{outfit}" opacity="0.94" /><path d="M48 58l-7 14h14z" fill="{accent}" opacity="0.95" />')
    elif theme.get("coat"):
        parts.append(f'<path d="M22 72c8-11 18-16 26-16s18 5 26 16l-6 31H28z" fill="{outfit}" opacity="0.95" /><path d="M48 57v45" stroke="{accent}" stroke-width="3" />')
    elif theme.get("dress"):
        parts.append(f'<path d="M29 73c6-9 12-15 19-15s13 6 19 15l8 29H21z" fill="{outfit}" opacity="0.94" />')
    elif theme.get("suit"):
        parts.append(f'<path d="M28 72c5-10 12-15 20-15s15 5 20 15l5 28H23z" fill="{outfit}" opacity="0.96" /><path d="M48 58l-6 12 6 10 6-10z" fill="{accent}" opacity="0.95" />')
    elif theme.get("fur"):
        parts.append(f'<path d="M26 72c6-10 13-15 22-15s16 5 22 15l5 28H21z" fill="{outfit}" opacity="0.96" /><path d="M22 71c6-5 14-8 26-8s20 3 26 8l-6 8H28z" fill="#f8fafc" opacity="0.9" />')
    elif theme.get("hood"):
        parts.append(f'<path d="M24 72c7-11 15-16 24-16s17 5 24 16l5 28H19z" fill="{outfit}" opacity="0.96" /><path d="M29 55c6-8 12-11 19-11s13 3 19 11l-5 11H34z" fill="{accent}" opacity="0.9" />')
    elif theme.get("jacket"):
        parts.append(f'<path d="M27 72c5-10 12-15 21-15s16 5 21 15l5 28H22z" fill="{outfit}" opacity="0.95" /><path d="M33 71h30l-4 29H37z" fill="{accent}" opacity="0.14" />')
    else:
        parts.append(f'<path d="M27 72c5-10 12-15 21-15s16 5 21 15l5 28H22z" fill="{outfit}" opacity="0.95" />')
    if theme.get("scarf"):
        parts.append(f'<path d="M36 67c2-5 6-8 12-8s10 3 12 8l-6 11H42z" fill="{accent}" opacity="0.95" />')
    return "".join(parts)


def build_svg(trainer: str) -> str:
    theme = theme_for(trainer)
    accent = str(theme["accent"])
    body = draw_outerwear(theme)
    accessories = draw_optional_accessories(theme)
    from xml.sax.saxutils import escape
    safe_trainer = escape(trainer)
    initials = "".join(part[:1].upper() for part in re.split(r"\s+", trainer) if part)[:2]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 120" role="img" aria-label="{safe_trainer} trainer sprite">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{theme["bg1"]}" />
      <stop offset="100%" stop-color="{theme["bg2"]}" />
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="100%" stop-color="rgba(15,23,42,0.18)" />
    </linearGradient>
  </defs>
  <rect width="96" height="120" rx="20" fill="url(#bg)" />
  <rect x="10" y="10" width="76" height="100" rx="16" fill="rgba(255,255,255,0.08)" />
  <ellipse cx="48" cy="101" rx="26" ry="8" fill="rgba(15,23,42,0.14)" />
  <path d="M28 43c3-9 10-13 20-13s17 4 20 13v17H28z" fill="{theme["hair"]}" opacity="0.96" />
  <circle cx="48" cy="45" r="14" fill="#f6d2b8" />
  <circle cx="42" cy="46" r="1.6" fill="#111827" />
  <circle cx="54" cy="46" r="1.6" fill="#111827" />
  <path d="M43 54c3 2 7 2 10 0" fill="none" stroke="#7c2d12" stroke-width="1.6" stroke-linecap="round" />
  {accessories}
  {body}
  <path d="M32 72c4-8 10-12 16-12s12 4 16 12" fill="none" stroke="{accent}" stroke-width="3" stroke-linecap="round" opacity="0.92" />
  <rect x="29" y="94" width="38" height="14" rx="7" fill="rgba(15,23,42,0.22)" />
  <text x="48" y="104" text-anchor="middle" font-family="Trebuchet MS, Segoe UI, sans-serif" font-size="11" font-weight="700" fill="white">{initials}</text>
</svg>
"""


def main() -> None:
    trainers: set[str] = set()
    for path in SOURCE_DIR.glob("*.ts"):
        source_text = path.read_text(encoding="utf-8")
        trainers.update(re.findall(r'trainer:\s+"([^"]+)"', source_text))
    trainers = sorted(trainers)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for trainer in trainers:
        (OUT_DIR / f"{slugify(trainer)}.svg").write_text(build_svg(trainer), encoding="utf-8")


if __name__ == "__main__":
    main()
