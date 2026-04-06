#!/usr/bin/env python3
# PokeNav - Copyright (c) 2026 TeamStarWolf
# https://github.com/TeamStarWolf/PokeNav - MIT License
from __future__ import annotations

import argparse
import json
import sqlite3
from collections import defaultdict
from pathlib import Path
import shutil


def normalize_name(value: str | None) -> str:
    return " ".join((value or "").replace("\n", " ").replace("\f", " ").replace("\r", " ").split())


def get_form_tag(name: str) -> str | None:
    lowered = name.lower()
    if "alola" in lowered:
        return "Alolan"
    if "galar" in lowered:
        return "Galarian"
    if "hisui" in lowered:
        return "Hisuian"
    if "paldea" in lowered:
        return "Paldean"
    if "mega" in lowered:
        return "Mega"
    if "gmax" in lowered:
        return "Gigantamax"
    if "totem" in lowered:
        return "Totem"
    if "primal" in lowered:
        return "Primal"
    return None


def get_form_family(name: str) -> str:
    tag = get_form_tag(name)
    if tag in {"Alolan", "Galarian", "Hisuian", "Paldean"}:
        return "Regional"
    if tag in {"Mega", "Gigantamax"}:
        return tag
    if tag in {"Totem", "Primal"}:
        return "Battle"
    return "Standard"


def load_index(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        SELECT
          s.species_id,
          s.name,
          s.generation,
          s.generation_label,
          s.version_count,
          s.version_group_count,
          s.variety_count,
          s.move_count,
          s.is_legendary,
          s.is_mythical,
          s.default_variety_pokemon_id,
          GROUP_CONCAT(DISTINCT pt.type_name) AS types
        FROM species s
        LEFT JOIN pokemon_types pt ON pt.pokemon_id = s.default_variety_pokemon_id
        GROUP BY s.species_id
        ORDER BY s.species_id
        """
    ).fetchall()

    payload: list[dict] = []
    for row in rows:
        entry_games = [
            item["version_name"]
            for item in conn.execute(
                "SELECT DISTINCT version_name FROM species_flavor_entries WHERE species_id = ? ORDER BY version_name",
                (row["species_id"],),
            ).fetchall()
        ]
        move_groups = [
            item["version_group_name"]
            for item in conn.execute(
                """
                SELECT DISTINCT pm.version_group_name
                FROM pokemon_moves pm
                JOIN pokemon_forms pf ON pf.pokemon_id = pm.pokemon_id
                WHERE pf.species_id = ?
                ORDER BY pm.version_group_name
                """,
                (row["species_id"],),
            ).fetchall()
        ]
        forms = load_detail(conn, row["species_id"])["forms"]
        default_form_id = row["default_variety_pokemon_id"] or row["species_id"]
        payload.append(
            {
                "id": row["species_id"],
                "name": row["name"],
                "image": f"/official-artwork/{default_form_id}.png",
                "generation": row["generation"] or "",
                "generationLabel": row["generation_label"] or "Unknown",
                "types": sorted({item for item in (row["types"] or "").split(",") if item}),
                "versionCount": row["version_count"] or 0,
                "versionGroupCount": row["version_group_count"] or 0,
                "varietyCount": row["variety_count"] or 0,
                "moveCount": row["move_count"] or 0,
                "isLegendary": bool(row["is_legendary"]),
                "isMythical": bool(row["is_mythical"]),
                "entryGames": entry_games,
                "moveGroups": move_groups,
                "formNames": [form["name"] for form in forms],
                "formTags": sorted({form["tag"].lower() for form in forms if form.get("tag")}),
            }
        )
    return payload


def load_detail(conn: sqlite3.Connection, species_id: int) -> dict:
    species = conn.execute("SELECT * FROM species WHERE species_id = ?", (species_id,)).fetchone()
    if species is None:
        raise KeyError(species_id)

    forms = []
    form_rows = conn.execute(
        "SELECT * FROM pokemon_forms WHERE species_id = ? ORDER BY is_default DESC, pokemon_id ASC",
        (species_id,),
    ).fetchall()

    for form in form_rows:
        pokemon_id = form["pokemon_id"]
        types = [
            row["type_name"]
            for row in conn.execute("SELECT type_name FROM pokemon_types WHERE pokemon_id = ? ORDER BY slot", (pokemon_id,)).fetchall()
        ]
        abilities = [
            {"name": row["ability_name"], "hidden": bool(row["is_hidden"])}
            for row in conn.execute(
                "SELECT ability_name, is_hidden FROM pokemon_abilities WHERE pokemon_id = ? ORDER BY slot",
                (pokemon_id,),
            ).fetchall()
        ]
        stats = [
            {"name": row["stat_name"], "value": row["base_stat"]}
            for row in conn.execute(
                "SELECT stat_name, base_stat FROM pokemon_stats WHERE pokemon_id = ? ORDER BY rowid",
                (pokemon_id,),
            ).fetchall()
        ]
        raw_json = json.loads(form["raw_json"])
        grouped_moves: dict[str, list[dict]] = defaultdict(list)
        for move in conn.execute(
            """
            SELECT move_name, version_group_name, learn_method, level_learned_at
            FROM pokemon_moves
            WHERE pokemon_id = ?
            ORDER BY version_group_name, level_learned_at, move_name
            """,
            (pokemon_id,),
        ).fetchall():
            grouped_moves[move["version_group_name"]].append(
                {
                    "move": move["move_name"],
                    "method": move["learn_method"],
                    "level": move["level_learned_at"],
                }
            )
        forms.append(
            {
                "id": pokemon_id,
                "speciesId": species_id,
                "name": form["name"],
                "image": f"/official-artwork/{pokemon_id}.png",
                "isDefault": bool(form["is_default"]),
                "tag": get_form_tag(form["name"]),
                "formFamily": get_form_family(form["name"]),
                "types": types,
                "abilities": abilities,
                "stats": stats,
                "baseStatTotal": sum(stat["value"] for stat in stats),
                "height": raw_json.get("height", 0) / 10,
                "weight": raw_json.get("weight", 0) / 10,
                "moveCount": sum(len(moves) for moves in grouped_moves.values()),
                "availableVersionGroups": sorted(grouped_moves.keys()),
                "versionGroupMoves": dict(grouped_moves),
            }
        )

    version_entries = [
        {"version": row["version_name"], "text": normalize_name(row["flavor_text"])}
        for row in conn.execute(
            "SELECT DISTINCT version_name, flavor_text FROM species_flavor_entries WHERE species_id = ? ORDER BY version_name",
            (species_id,),
        ).fetchall()
    ]
    evolution_rows = [
        {"stage": row["stage"], "name": row["species_name"]}
        for row in conn.execute(
            "SELECT stage, species_name FROM species_evolution_map WHERE species_id = ? ORDER BY stage, species_name",
            (species_id,),
        ).fetchall()
    ]
    egg_groups = [
        row["egg_group"]
        for row in conn.execute("SELECT egg_group FROM species_egg_groups WHERE species_id = ? ORDER BY egg_group", (species_id,)).fetchall()
    ]

    return {
        "id": species["species_id"],
        "speciesName": species["name"],
        "genus": species["genus"] or "Pokemon",
        "generation": species["generation"] or "",
        "generationLabel": species["generation_label"] or "Unknown",
        "color": species["color"] or "unknown",
        "habitat": species["habitat"] or "Unknown",
        "shape": species["shape"] or "Unknown",
        "captureRate": species["capture_rate"],
        "happiness": species["base_happiness"],
        "growthRate": species["growth_rate"] or "Unknown",
        "eggGroups": egg_groups,
        "hatchCounter": species["hatch_counter"],
        "genderRate": species["gender_rate"],
        "isLegendary": bool(species["is_legendary"]),
        "isMythical": bool(species["is_mythical"]),
        "forms": forms,
        "defaultFormId": species["default_variety_pokemon_id"],
        "versionEntries": version_entries,
        "entryGameVersions": sorted({entry["version"] for entry in version_entries}),
        "moveGameGroups": sorted({group for form in forms for group in form["availableVersionGroups"]}),
        "evolutionRows": evolution_rows,
    }


def export_dataset(db_path: Path, assets_path: Path, out_path: Path) -> None:
    out_path.mkdir(parents=True, exist_ok=True)
    (out_path / "pokemon").mkdir(parents=True, exist_ok=True)
    public_root = out_path.parent
    public_artwork = public_root / "official-artwork"
    source_artwork = assets_path / "official-artwork"
    if public_artwork.exists():
        shutil.rmtree(public_artwork)
    if source_artwork.exists():
        shutil.copytree(source_artwork, public_artwork)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        index_payload = load_index(conn)
        (out_path / "index.json").write_text(json.dumps(index_payload, indent=2), encoding="utf-8")
        for row in index_payload:
            detail_payload = load_detail(conn, row["id"])
            (out_path / "pokemon" / f"{row['id']}.json").write_text(json.dumps(detail_payload), encoding="utf-8")
        manifest = {
            "speciesCount": len(index_payload),
            "dbPath": str(db_path.resolve()),
            "assetsPath": str(assets_path.resolve()),
        }
        (out_path / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    finally:
        conn.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export local Pokedex JSON from SQLite.")
    parser.add_argument("--db", required=True)
    parser.add_argument("--assets", required=True)
    parser.add_argument("--out", required=True)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    export_dataset(Path(args.db), Path(args.assets), Path(args.out))
