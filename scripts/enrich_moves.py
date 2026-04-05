#!/usr/bin/env python3
"""
Enrich the existing encyclopedia index.json with move metadata from the SQLite moves table.

Usage:
    python scripts/enrich_moves.py --db pokedex.sqlite --json dist/data/encyclopedia/index.json
    python scripts/enrich_moves.py  # uses defaults
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import shutil
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich encyclopedia moves with metadata from SQLite.")
    parser.add_argument("--db", default="pokedex.sqlite", help="Path to SQLite database with moves table.")
    parser.add_argument("--json", default="dist/data/encyclopedia/index.json", help="Path to encyclopedia index.json.")
    args = parser.parse_args()

    db_path = Path(args.db)
    json_path = Path(args.json)

    if not db_path.exists():
        print(f"ERROR: Database not found: {db_path}")
        raise SystemExit(1)
    if not json_path.exists():
        print(f"ERROR: JSON file not found: {json_path}")
        raise SystemExit(1)

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    try:
        move_rows = conn.execute("SELECT * FROM moves").fetchall()
    except sqlite3.OperationalError:
        print("ERROR: No 'moves' table found. Run: python pokedex_local_db_builder.py --moves-only")
        raise SystemExit(1)

    move_meta = {row["move_name"]: row for row in move_rows}
    print(f"Loaded {len(move_meta)} move metadata entries from SQLite.")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    moves = data.get("moves", {})
    updated = 0
    for move_id, move in moves.items():
        slug = move.get("slug", "")
        meta = move_meta.get(slug)
        if not meta:
            continue

        if meta["type_name"]:
            move["typeId"] = f"type:{meta['type_name']}"
        if meta["damage_class"]:
            move["damageClass"] = meta["damage_class"]
        move["power"] = meta["power"]
        move["accuracy"] = meta["accuracy"]
        move["pp"] = meta["pp"]
        move["priority"] = meta["priority"] or 0
        if meta["target"]:
            move["target"] = meta["target"]
        move["effectChance"] = meta["effect_chance"]
        if meta["effect_text"]:
            move["effectText"] = meta["effect_text"]
        move["status"] = "growing"
        move["expansionNotes"] = []
        updated += 1

    # Also write to the public directory if it exists
    public_json = Path("public/data/encyclopedia/index.json")

    # Back up original
    backup = json_path.with_suffix(".json.bak")
    shutil.copy2(json_path, backup)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    if public_json.exists():
        shutil.copy2(json_path, public_json)
        print(f"Also updated {public_json}")

    print(f"Updated {updated}/{len(moves)} moves in {json_path}")
    print(f"Backup saved to {backup}")

    conn.close()


if __name__ == "__main__":
    main()
