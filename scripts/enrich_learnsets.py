#!/usr/bin/env python3
# PokeNav - Copyright (c) 2026 TeamStarWolf
# https://github.com/TeamStarWolf/PokeNav - MIT License
"""
Enrich index.json forms with learnset data fetched from PokeAPI.

For each default form with an empty learnset, fetches the moves list from
PokeAPI's /pokemon/{id} endpoint and builds learnset entries. Uses the
existing moves table in pokedex.sqlite for move metadata (type, power, etc.)
and adds any missing move entities to the index.

Usage:
    python scripts/enrich_learnsets.py [--limit N] [--workers N]

This is idempotent: forms that already have a learnset are skipped.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sqlite3
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = ROOT / "public" / "data" / "encyclopedia" / "index.json"
DIST_INDEX_PATH = ROOT / "dist" / "data" / "encyclopedia" / "index.json"
DB_PATH = ROOT / "pokedex.sqlite"
POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon"


def fetch_json(url: str, retries: int = 3) -> dict | None:
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "PokeNav-Enricher/1.0"})
            with urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except (HTTPError, URLError, TimeoutError) as e:
            if attempt < retries - 1:
                time.sleep(1 * (attempt + 1))
            else:
                print(f"  Failed to fetch {url}: {e}")
                return None
    return None


def load_move_meta(db_path: Path) -> dict[str, dict]:
    """Load move metadata from the SQLite moves table."""
    meta = {}
    if not db_path.exists():
        return meta
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    try:
        for row in conn.execute("SELECT * FROM moves"):
            meta[row["move_name"]] = dict(row)
    except Exception:
        pass
    conn.close()
    return meta


def build_learnset_from_api(api_data: dict, form_id: str) -> list[dict]:
    """Build learnset entries from a PokeAPI /pokemon/{id} response."""
    learnset = []
    order = 1
    for move_entry in api_data.get("moves", []):
        move_name = move_entry.get("move", {}).get("name", "")
        if not move_name:
            continue
        move_id = f"move:{move_name}"

        for vg_detail in move_entry.get("version_group_details", []):
            game_name = vg_detail.get("version_group", {}).get("name", "")
            method = vg_detail.get("move_learn_method", {}).get("name", "level-up")
            level = vg_detail.get("level_learned_at") or None

            learnset.append({
                "moveId": move_id,
                "gameVersionId": f"game:{game_name}",
                "method": method,
                "level": level,
                "order": order,
            })
            order += 1

    return learnset


def ensure_move_entity(move_name: str, move_meta: dict[str, dict], move_entities: dict) -> None:
    """Create a move entity in the index if it doesn't exist yet."""
    move_id = f"move:{move_name}"
    if move_id in move_entities:
        return

    meta = move_meta.get(move_name)
    if meta:
        type_id = f"type:{meta['type_name']}" if meta.get("type_name") else "type:normal"
        move_entities[move_id] = {
            "id": move_id,
            "kind": "move",
            "slug": move_name,
            "name": move_name.replace("-", " ").title(),
            "summary": f"{move_name.replace('-', ' ').title()} move.",
            "status": "growing",
            "sourceRefs": [],
            "relatedLinks": [],
            "typeId": type_id,
            "damageClass": meta.get("damage_class") or "status",
            "power": meta.get("power"),
            "accuracy": meta.get("accuracy"),
            "pp": meta.get("pp"),
            "priority": meta.get("priority") or 0,
            "target": meta.get("target") or "selected-pokemon",
            "effectChance": meta.get("effect_chance"),
            "effectText": meta.get("effect_text") or "",
            "flavorTextByVersion": [],
            "machineItemIds": [],
            "pokemonFormIds": [],
        }
    else:
        move_entities[move_id] = {
            "id": move_id,
            "kind": "move",
            "slug": move_name,
            "name": move_name.replace("-", " ").title(),
            "summary": f"{move_name.replace('-', ' ').title()} move.",
            "status": "partial",
            "sourceRefs": [],
            "relatedLinks": [],
            "typeId": "type:normal",
            "damageClass": "status",
            "power": None,
            "accuracy": None,
            "pp": None,
            "priority": 0,
            "target": "selected-pokemon",
            "effectChance": None,
            "effectText": "",
            "flavorTextByVersion": [],
            "machineItemIds": [],
            "pokemonFormIds": [],
        }


def main():
    parser = argparse.ArgumentParser(description="Enrich index.json with learnset data from PokeAPI")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of Pokemon to enrich (0 = all)")
    parser.add_argument("--workers", type=int, default=8, help="Number of concurrent fetch workers")
    args = parser.parse_args()

    print(f"Loading index from {INDEX_PATH}...")
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loading move metadata from {DB_PATH}...")
    move_meta = load_move_meta(DB_PATH)
    print(f"  {len(move_meta)} moves in DB")

    # Find default forms that need learnsets
    forms_to_enrich: list[tuple[str, dict, int]] = []
    for form_id, form in data["forms"].items():
        if form.get("learnset") and len(form["learnset"]) > 0:
            continue
        if not form.get("isDefault"):
            continue
        # Get the dex number from the species
        species_id = form.get("speciesId", "")
        species = data["pokemon"].get(species_id)
        if not species:
            continue
        dex_num = species.get("nationalDexNumber")
        if not dex_num:
            continue
        forms_to_enrich.append((form_id, form, dex_num))

    if args.limit > 0:
        forms_to_enrich = forms_to_enrich[:args.limit]

    print(f"  {len(forms_to_enrich)} default forms need learnset enrichment")
    if not forms_to_enrich:
        print("Nothing to do.")
        return

    # Fetch from PokeAPI in parallel
    results: dict[str, list[dict]] = {}
    move_names_found: set[str] = set()
    success_count = 0
    fail_count = 0

    def fetch_pokemon(item):
        form_id, form, dex_num = item
        api_data = fetch_json(f"{POKEAPI_BASE}/{dex_num}")
        if api_data:
            learnset = build_learnset_from_api(api_data, form_id)
            names = set()
            for entry in learnset:
                mid = entry["moveId"].replace("move:", "")
                names.add(mid)
            return (form_id, learnset, names, True)
        return (form_id, [], set(), False)

    print(f"Fetching learnsets from PokeAPI with {args.workers} workers...")
    start = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(fetch_pokemon, item): item for item in forms_to_enrich}
        for i, future in enumerate(as_completed(futures), 1):
            form_id, learnset, names, ok = future.result()
            if ok:
                results[form_id] = learnset
                move_names_found |= names
                success_count += 1
            else:
                fail_count += 1

            if i % 50 == 0 or i == len(forms_to_enrich):
                elapsed = time.time() - start
                rate = i / elapsed if elapsed > 0 else 0
                print(f"  {i}/{len(forms_to_enrich)} fetched ({rate:.1f}/s) - {success_count} ok, {fail_count} failed")

    elapsed = time.time() - start
    print(f"Fetched {success_count} learnsets in {elapsed:.1f}s")

    # Apply learnsets to forms
    for form_id, learnset in results.items():
        data["forms"][form_id]["learnset"] = learnset

    # Ensure all discovered moves exist as entities
    new_moves = 0
    for move_name in move_names_found:
        move_id = f"move:{move_name}"
        if move_id not in data["moves"]:
            ensure_move_entity(move_name, move_meta, data["moves"])
            new_moves += 1

    # Update pokemonFormIds on move entities
    for form_id, learnset in results.items():
        seen = set()
        for entry in learnset:
            mid = entry["moveId"]
            if mid in data["moves"] and mid not in seen:
                seen.add(mid)
                if form_id not in data["moves"][mid].get("pokemonFormIds", []):
                    data["moves"][mid].setdefault("pokemonFormIds", []).append(form_id)

    print(f"  Added {new_moves} new move entities")

    # Write back
    backup = INDEX_PATH.with_suffix(".json.bak")
    shutil.copy2(INDEX_PATH, backup)
    print(f"  Backup saved to {backup}")

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print(f"  Updated {INDEX_PATH}")

    # Copy to dist if it exists
    if DIST_INDEX_PATH.parent.exists():
        shutil.copy2(INDEX_PATH, DIST_INDEX_PATH)
        print(f"  Copied to {DIST_INDEX_PATH}")

    total_with_learnset = sum(1 for f in data["forms"].values() if f.get("learnset") and len(f["learnset"]) > 0)
    print(f"\nDone! {total_with_learnset}/{len(data['forms'])} forms now have learnsets.")
    print(f"Total moves in index: {len(data['moves'])}")


if __name__ == "__main__":
    main()
