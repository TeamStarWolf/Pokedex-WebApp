#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

import requests


ROOT = Path(__file__).resolve().parent.parent
API_URL = "https://bulbapedia.bulbagarden.net/w/api.php"
RAW_URL = "https://bulbapedia.bulbagarden.net/w/index.php"
OUT_FILE = ROOT / "src" / "data" / "generatedTrainerTeams.json"
BULBAPEDIA_FILE = ROOT / "src" / "data" / "trainerPresets" / "bulbapedia.ts"
PRESET_DIR = ROOT / "src" / "data" / "trainerPresets"
POKEDEX_INDEX = ROOT / "public" / "data" / "index.json"

CATEGORY_SOURCES = [
    ("Category:Gym Leaders", "Gym Leaders / Elite Four / Champions"),
    ("Category:Champions", "Champions"),
    ("Category:Trial Captains", "Gym Leaders / Elite Four / Champions"),
    ("Category:Frontier Brains", "Gym Leaders / Elite Four / Champions"),
]

GAME_MAP: dict[str, tuple[str, str, str]] = {
    "RGB": ("Pokemon Red / Green / Blue", "red-blue", "Kanto"),
    "RGBY": ("Pokemon Red / Green / Blue / Yellow", "red-blue", "Kanto"),
    "RB": ("Pokemon Red / Blue", "red-blue", "Kanto"),
    "Y": ("Pokemon Yellow", "yellow", "Kanto"),
    "YELLOW": ("Pokemon Yellow", "yellow", "Kanto"),
    "FRLG": ("Pokemon FireRed / LeafGreen", "firered-leafgreen", "Kanto"),
    "PE": ("Pokemon Let's Go Pikachu / Eevee", "lets-go-pikachu-lets-go-eevee", "Kanto"),
    "LGP": ("Pokemon Let's Go Pikachu", "lets-go-pikachu-lets-go-eevee", "Kanto"),
    "LGE": ("Pokemon Let's Go Eevee", "lets-go-pikachu-lets-go-eevee", "Kanto"),
    "LGPE": ("Pokemon Let's Go Pikachu / Eevee", "lets-go-pikachu-lets-go-eevee", "Kanto"),
    "STADIUM": ("Pokemon Stadium", "stadium", "Kanto"),
    "STADIUM2": ("Pokemon Stadium 2", "stadium-2", "Johto"),
    "GS": ("Pokemon Gold / Silver", "gold-silver", "Johto"),
    "GSC": ("Pokemon Gold / Silver / Crystal", "gold-silver", "Johto"),
    "HGSS": ("Pokemon HeartGold / SoulSilver", "heartgold-soulsilver", "Johto"),
    "RS": ("Pokemon Ruby / Sapphire", "ruby-sapphire", "Hoenn"),
    "E": ("Pokemon Emerald", "emerald", "Hoenn"),
    "ORAS": ("Pokemon Omega Ruby / Alpha Sapphire", "omega-ruby-alpha-sapphire", "Hoenn"),
    "DP": ("Pokemon Diamond / Pearl", "diamond-pearl", "Sinnoh"),
    "PT": ("Pokemon Platinum", "platinum", "Sinnoh"),
    "PTHGSS": ("Pokemon Platinum / HeartGold / SoulSilver", "platinum", "Sinnoh"),
    "BDSP": ("Pokemon Brilliant Diamond / Shining Pearl", "brilliant-diamond-and-shining-pearl", "Sinnoh"),
    "BW": ("Pokemon Black / White", "black-white", "Unova"),
    "B2W2": ("Pokemon Black 2 / White 2", "black-2-white-2", "Unova"),
    "BLACK AND WHITE": ("Pokemon Black / White", "black-white", "Unova"),
    "BL": ("Pokemon Black", "black-white", "Unova"),
    "W": ("Pokemon White", "black-white", "Unova"),
    "XY": ("Pokemon X / Y", "x-y", "Kalos"),
    "X AND Y": ("Pokemon X / Y", "x-y", "Kalos"),
    "ZA": ("Pokemon Legends: Z-A", "legends-z-a", "Kalos"),
    "SM": ("Pokemon Sun / Moon", "sun-moon", "Alola"),
    "USUM": ("Pokemon Ultra Sun / Ultra Moon", "ultra-sun-ultra-moon", "Alola"),
    "SMUSUM": ("Pokemon Sun / Moon / Ultra Sun / Ultra Moon", "ultra-sun-ultra-moon", "Alola"),
    "SU": ("Pokemon Sun", "sun-moon", "Alola"),
    "US": ("Pokemon Ultra Sun", "ultra-sun-ultra-moon", "Alola"),
    "M": ("Pokemon Moon", "sun-moon", "Alola"),
    "UM": ("Pokemon Ultra Moon", "ultra-sun-ultra-moon", "Alola"),
    "MUM": ("Pokemon Moon / Ultra Moon", "ultra-sun-ultra-moon", "Alola"),
    "SUS": ("Pokemon Sun / Ultra Sun", "ultra-sun-ultra-moon", "Alola"),
    "SWSH": ("Pokemon Sword / Shield", "sword-shield", "Galar"),
    "SW": ("Pokemon Sword", "sword-shield", "Galar"),
    "SH": ("Pokemon Shield", "sword-shield", "Galar"),
    "SV": ("Pokemon Scarlet / Violet", "scarlet-violet", "Paldea"),
    "LA": ("Pokemon Legends: Arceus", "legends-arceus", "Hisui"),
    "PLA": ("Pokemon Legends: Arceus", "legends-arceus", "Hisui"),
}


def slugify(value: str) -> str:
    return re.sub(r"(^-+|-+$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def normalize_title_key(value: str) -> str:
    return unquote(value).replace("_", " ").strip()


def clean_wiki_text(value: str) -> str:
    cleaned = value
    cleaned = re.sub(r"<ref[^>]*>.*?</ref>", "", cleaned)
    cleaned = re.sub(r"<br\s*/?>", " / ", cleaned)
    cleaned = re.sub(r"\[\[([^|\]]+)\|([^\]]+)\]\]", r"\2", cleaned)
    cleaned = re.sub(r"\[\[([^\]]+)\]\]", r"\1", cleaned)
    cleaned = re.sub(r"\{\{PlayerChoice\|[^|]+\|([^}]+)\}\}", r"\1", cleaned)
    cleaned = re.sub(r"\{\{color2\|[^|]+\|[^|]+\|([^}]+)\}\}", r"\1", cleaned)
    cleaned = re.sub(r"\{\{[^|}]+\|([^}]+)\}\}", r"\1", cleaned)
    cleaned = re.sub(r"\{\{[^}]+\}\}", "", cleaned)
    cleaned = cleaned.replace("Pokémon", "Pokemon")
    cleaned = re.sub(r"&nbsp;?", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip(" -|")


def normalize_game_code(value: str) -> str:
    cleaned = clean_wiki_text(value).upper()
    cleaned = cleaned.replace("/", "").replace("-", " ").strip()
    return cleaned


def infer_difficulty(levels: list[int]) -> str:
    max_level = max(levels, default=1)
    if max_level >= 70:
        return "elite"
    if max_level >= 50:
        return "high"
    if max_level >= 25:
        return "medium"
    return "low"


def load_existing_categories() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for path in PRESET_DIR.glob("*.ts"):
        text = path.read_text(encoding="utf-8")
        for trainer, category in re.findall(r'trainer:\s+"([^"]+)".*?category:\s+"([^"]+)"', text, flags=re.DOTALL):
            mapping.setdefault(trainer, category)
    return mapping


def load_manual_sources(existing_categories: dict[str, str]) -> dict[str, dict[str, str]]:
    text = BULBAPEDIA_FILE.read_text(encoding="utf-8")
    entries = re.findall(r'"([^"]+)":\s+"(https://bulbapedia\.bulbagarden\.net/wiki/[^"]+)"', text)
    output: dict[str, dict[str, str]] = {}
    for trainer, url in entries:
      raw_title = unquote(urlparse(url).path.rsplit("/wiki/", 1)[1])
      key = normalize_title_key(raw_title)
      output[key] = {
          "raw_title": raw_title,
          "trainer": trainer,
          "category": existing_categories.get(trainer, "Main Characters"),
          "url": url,
      }
    return output


def fetch_category_members(category: str) -> list[str]:
    titles: list[str] = []
    continuation: dict[str, Any] = {}
    session = requests.Session()
    while True:
        response = session.get(
            API_URL,
            params={"action": "query", "list": "categorymembers", "cmtitle": category, "cmlimit": "500", "format": "json", **continuation},
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json()
        titles.extend(member["title"] for member in payload.get("query", {}).get("categorymembers", []))
        if "continue" not in payload:
            break
        continuation = payload["continue"]
    return titles


def keep_category_title(title: str) -> bool:
    if title in {"Gym Leader", "Frontier Brain", "Pokemon Champion"}:
        return False
    for marker in ("(Masters)", "(Adventures)", "(anime)", "(manga)"):
        if marker in title:
            return False
    if "(" in title and "(game)" not in title:
        return False
    return True


def build_source_pages() -> dict[str, dict[str, str]]:
    existing_categories = load_existing_categories()
    pages = load_manual_sources(existing_categories)
    for wiki_category, app_category in CATEGORY_SOURCES:
        for title in fetch_category_members(wiki_category):
            if not keep_category_title(title):
                continue
            key = normalize_title_key(title)
            if key not in pages:
                trainer = key.replace(" (game)", "")
                pages[key] = {
                    "raw_title": title.replace(" ", "_"),
                    "trainer": trainer,
                    "category": app_category,
                    "url": f"https://bulbapedia.bulbagarden.net/wiki/{title.replace(' ', '_')}",
                }
    return pages


def fetch_raw_page(raw_title: str) -> str:
    response = requests.get(RAW_URL, params={"title": raw_title, "action": "raw"}, timeout=30)
    response.raise_for_status()
    return response.text


def extract_party_blocks(source_text: str) -> list[str]:
    blocks: list[str] = []
    start = 0
    while True:
        open_index = source_text.find("{{Party", start)
        if open_index == -1:
            break
        close_index = source_text.find("{{Party/end}}", open_index)
        if close_index == -1:
            break
        blocks.append(source_text[open_index:close_index + len("{{Party/end}}")])
        start = close_index + len("{{Party/end}}")
    return blocks


def parse_party_block(block: str) -> dict[str, Any] | None:
    lines = block.splitlines()
    header: dict[str, str] = {}
    members: list[dict[str, Any]] = []
    state = "header"
    current_member: list[str] = []

    for line in lines[1:]:
        stripped = line.strip()
        if state == "header":
            if stripped == "}}":
                state = "body"
                continue
            match = re.match(r"\|\s*([^=]+?)\s*=\s*(.*)", line)
            if match:
                header[match.group(1).strip()] = match.group(2).strip()
            continue

        if stripped.startswith("{{Pok"):
            current_member = []
            state = "pokemon"
            continue

        if state == "pokemon":
            if stripped == "}}":
                fields: dict[str, str] = {}
                for member_line in current_member:
                    match = re.match(r"\|\s*([^=]+?)\s*=\s*(.*)", member_line)
                    if match:
                        fields[match.group(1).strip()] = match.group(2).strip()
                ndex = fields.get("ndex", "").strip()
                pokemon = clean_wiki_text(fields.get("pokemon", ""))
                level_text = re.sub(r"[^0-9]", "", fields.get("level", ""))
                if ndex.isdigit():
                    members.append({
                        "pokemon_id": int(ndex),
                        "pokemon_name": pokemon,
                        "level": int(level_text or "1"),
                    })
                state = "body"
                current_member = []
                continue
            current_member.append(line)

    if not members:
        return None
    return {"header": header, "members": members}


def load_pokedex_index() -> dict[int, dict[str, Any]]:
    entries = json.loads(POKEDEX_INDEX.read_text(encoding="utf-8"))
    return {int(entry["id"]): entry for entry in entries}


def summarize_team(member_ids: list[int], pokedex: dict[int, dict[str, Any]]) -> tuple[str, list[str]]:
    entries = [pokedex.get(member_id) for member_id in member_ids]
    entries = [entry for entry in entries if entry]
    type_counts: dict[str, int] = defaultdict(int)
    for entry in entries:
        for pokemon_type in entry.get("types", []):
            type_counts[pokemon_type] += 1
    top_types = [pokemon_type for pokemon_type, count in sorted(type_counts.items(), key=lambda item: (-item[1], item[0]))[:2] if count >= 2]
    ace_entry = entries[-1] if entries else None
    tips = []
    if ace_entry:
        tips.append(f"Keep a stable answer for {clean_wiki_text(ace_entry['name'])}, which functions as the likely closer in this roster.")
    if top_types:
        readable = " and ".join(top_types)
        tips.append(f"Bring pressure that does not fold to the team's {readable} core.")
    else:
        tips.append("This roster spreads its coverage broadly, so avoid over-specializing into one matchup.")
    return (
        f"Bulbapedia-imported trainer roster for this battle in offline archive form.",
        tips,
    )


def build_presets() -> list[dict[str, Any]]:
    pokedex = load_pokedex_index()
    pages = build_source_pages()
    presets: list[dict[str, Any]] = []

    for page in pages.values():
        source_text = fetch_raw_page(page["raw_title"])
        for index, block in enumerate(extract_party_blocks(source_text), start=1):
            parsed = parse_party_block(block)
            if not parsed:
                continue
            header = parsed["header"]
            members = parsed["members"]
            raw_game_code = header.get("game", "")
            game_key = normalize_game_code(raw_game_code)
            if game_key not in GAME_MAP:
                continue

            source_game, source_group, region = GAME_MAP[game_key]
            battle_base = clean_wiki_text(header.get("locationname") or header.get("location") or header.get("caption") or "Battle")
            caption = clean_wiki_text(header.get("caption", ""))
            if caption and caption.lower() not in battle_base.lower():
                battle_label = f"{battle_base} | {caption}" if battle_base else caption
            else:
                battle_label = battle_base or "Battle"

            member_ids = [member["pokemon_id"] for member in members]
            levels = [member["level"] for member in members]
            description, how_to_beat = summarize_team(member_ids, pokedex)
            tags = sorted({
                "bulbapedia-imported",
                region.lower(),
                source_group,
                slugify(page["category"]),
            })
            presets.append({
                "id": f"bulba-{slugify(page['trainer'])}-{slugify(source_group)}-{index}",
                "name": battle_label,
                "trainer": page["trainer"],
                "category": page["category"],
                "region": region,
                "battleLabel": battle_label,
                "sourceGame": source_game,
                "sourceGroup": source_group,
                "difficulty": infer_difficulty(levels),
                "canonical": True,
                "description": description,
                "howToBeat": how_to_beat,
                "tags": tags,
                "allowDuplicates": len(set(member_ids)) != len(member_ids),
                "members": member_ids,
                "source": {
                    "kind": "bulbapedia",
                    "label": "Bulbapedia trainer page",
                    "url": page["url"],
                    "note": "Imported from Bulbapedia party templates for offline local archive use.",
                },
            })

    deduped: dict[str, dict[str, Any]] = {}
    for preset in presets:
        key = "|".join([
            preset["trainer"].lower(),
            preset["sourceGroup"].lower(),
            preset["battleLabel"].lower(),
            "-".join(str(member) for member in preset["members"]),
        ])
        deduped[key] = preset
    return sorted(deduped.values(), key=lambda preset: (preset["region"], preset["sourceGame"], preset["trainer"], preset["name"]))


def main() -> None:
    presets = build_presets()
    OUT_FILE.write_text(json.dumps(presets, indent=2), encoding="utf-8")
    print(f"Wrote {len(presets)} presets to {OUT_FILE}")


if __name__ == "__main__":
    main()
