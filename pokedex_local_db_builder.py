#!/usr/bin/env python3
"""
Build a fully local Pokédex SQLite database and asset cache from PokeAPI.

What this stores locally:
- every Pokémon species
- every variety / form for every species
- species flavor text entries by version
- pokemon stats / types / abilities / moves
- evolution chains
- local artwork files on disk

Why this fixes the local-app problem:
- the database contains all Pokémon, not just the first generation
- every form is downloaded, not only the default form
- sprites/artwork are saved locally so the app does not need remote image URLs

Usage:
    python pokedex_local_db_builder.py --db pokedex.sqlite --assets ./assets
    python pokedex_local_db_builder.py --db pokedex.sqlite --assets ./assets --resume
    python pokedex_local_db_builder.py --db pokedex.sqlite --assets ./assets --limit 151

If you run the script with no arguments, it now uses sensible defaults:
    python pokedex_local_db_builder.py

Defaults:
    --db ./pokedex.sqlite
    --assets ./assets

Requirements:
    pip install requests
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://pokeapi.co/api/v2"
DEFAULT_TIMEOUT = 30
DEFAULT_PAGE_SIZE = 200
DEFAULT_SLEEP = 0.05
DEFAULT_DB_PATH = Path("./pokedex.sqlite")
DEFAULT_ASSETS_DIR = Path("./assets")
OFFICIAL_ARTWORK_BASE = (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/"
    "sprites/pokemon/other/official-artwork"
)


def get_id_from_url(url: str) -> int:
    return int(str(url).rstrip("/").split("/")[-1])


def normalize_text(text: str | None) -> str:
    return " ".join((text or "").replace("\f", " ").replace("\n", " ").replace("\r", " ").split())


def generation_label_from_api_name(name: str | None) -> str | None:
    if not name:
        return None
    roman = name.replace("generation-", "").upper()
    return f"Gen {roman}"


def official_artwork_url(pokemon_id: int) -> str:
    return f"{OFFICIAL_ARTWORK_BASE}/{pokemon_id}.png"


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def run_self_checks() -> None:
    checks = [
        (get_id_from_url("https://pokeapi.co/api/v2/pokemon/25/"), 25),
        (normalize_text("Hello\nWorld\fAgain"), "Hello World Again"),
        (generation_label_from_api_name("generation-iii"), "Gen III"),
        (generation_label_from_api_name(None), None),
        (official_artwork_url(6).endswith("/6.png"), True),
        (parse_args([]).db_path, DEFAULT_DB_PATH),
        (parse_args([]).assets_dir, DEFAULT_ASSETS_DIR),
        (parse_args(["--limit", "151"]).limit, 151),
    ]
    for actual, expected in checks:
        if actual != expected:
            raise RuntimeError(f"Self-check failed: expected {expected!r}, got {actual!r}")


@dataclass
class DownloaderConfig:
    db_path: Path
    assets_dir: Path
    page_size: int = DEFAULT_PAGE_SIZE
    timeout: int = DEFAULT_TIMEOUT
    sleep_seconds: float = DEFAULT_SLEEP
    resume: bool = False
    limit: int | None = None
    moves_only: bool = False


class PokeApiClient:
    def __init__(self, timeout: int = DEFAULT_TIMEOUT):
        self.session = requests.Session()
        retry = Retry(
            total=5,
            backoff_factor=0.5,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET",),
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        self.timeout = timeout

    def get_json(self, url: str) -> dict[str, Any]:
        response = self.session.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def download_file(self, url: str, dest: Path) -> None:
        ensure_parent_dir(dest)
        response = self.session.get(url, timeout=self.timeout)
        response.raise_for_status()
        dest.write_bytes(response.content)

    def iter_species_index(self, page_size: int = DEFAULT_PAGE_SIZE) -> Iterable[dict[str, Any]]:
        offset = 0
        while True:
            url = f"{BASE_URL}/pokemon-species?limit={page_size}&offset={offset}"
            data = self.get_json(url)
            results = data.get("results", [])
            for item in results:
                yield item
            if not data.get("next"):
                break
            offset += page_size


class LocalPokedexDb:
    def __init__(self, path: Path):
        self.path = path
        ensure_parent_dir(path)
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA foreign_keys=ON")

    def close(self) -> None:
        self.conn.close()

    def init_schema(self) -> None:
        self.conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS species (
                species_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                generation TEXT,
                generation_label TEXT,
                color TEXT,
                habitat TEXT,
                shape TEXT,
                genus TEXT,
                capture_rate INTEGER,
                base_happiness INTEGER,
                growth_rate TEXT,
                hatch_counter INTEGER,
                gender_rate INTEGER,
                is_legendary INTEGER NOT NULL DEFAULT 0,
                is_mythical INTEGER NOT NULL DEFAULT 0,
                forms_switchable INTEGER NOT NULL DEFAULT 0,
                default_variety_pokemon_id INTEGER,
                version_count INTEGER NOT NULL DEFAULT 0,
                version_group_count INTEGER NOT NULL DEFAULT 0,
                variety_count INTEGER NOT NULL DEFAULT 0,
                move_count INTEGER NOT NULL DEFAULT 0,
                raw_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS species_egg_groups (
                species_id INTEGER NOT NULL,
                egg_group TEXT NOT NULL,
                PRIMARY KEY (species_id, egg_group),
                FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS pokemon_forms (
                pokemon_id INTEGER PRIMARY KEY,
                species_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                is_default INTEGER NOT NULL DEFAULT 0,
                sprite_url TEXT,
                local_artwork_path TEXT,
                raw_json TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS pokemon_types (
                pokemon_id INTEGER NOT NULL,
                slot INTEGER NOT NULL,
                type_name TEXT NOT NULL,
                PRIMARY KEY (pokemon_id, slot),
                FOREIGN KEY (pokemon_id) REFERENCES pokemon_forms(pokemon_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS pokemon_abilities (
                pokemon_id INTEGER NOT NULL,
                ability_name TEXT NOT NULL,
                is_hidden INTEGER NOT NULL DEFAULT 0,
                slot INTEGER NOT NULL,
                PRIMARY KEY (pokemon_id, ability_name, slot),
                FOREIGN KEY (pokemon_id) REFERENCES pokemon_forms(pokemon_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS pokemon_stats (
                pokemon_id INTEGER NOT NULL,
                stat_name TEXT NOT NULL,
                base_stat INTEGER NOT NULL,
                effort INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (pokemon_id, stat_name),
                FOREIGN KEY (pokemon_id) REFERENCES pokemon_forms(pokemon_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS species_flavor_entries (
                species_id INTEGER NOT NULL,
                version_name TEXT NOT NULL,
                flavor_text TEXT NOT NULL,
                PRIMARY KEY (species_id, version_name, flavor_text),
                FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS pokemon_moves (
                pokemon_id INTEGER NOT NULL,
                move_name TEXT NOT NULL,
                version_group_name TEXT NOT NULL,
                learn_method TEXT NOT NULL,
                level_learned_at INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (pokemon_id, move_name, version_group_name, learn_method, level_learned_at),
                FOREIGN KEY (pokemon_id) REFERENCES pokemon_forms(pokemon_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS evolution_chains (
                evolution_chain_id INTEGER PRIMARY KEY,
                raw_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS species_evolution_map (
                species_id INTEGER NOT NULL,
                evolution_chain_id INTEGER NOT NULL,
                stage INTEGER NOT NULL,
                species_name TEXT NOT NULL,
                PRIMARY KEY (species_id, evolution_chain_id, stage, species_name),
                FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE,
                FOREIGN KEY (evolution_chain_id) REFERENCES evolution_chains(evolution_chain_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS moves (
                move_name TEXT PRIMARY KEY,
                type_name TEXT,
                damage_class TEXT,
                power INTEGER,
                accuracy INTEGER,
                pp INTEGER,
                priority INTEGER NOT NULL DEFAULT 0,
                target TEXT,
                effect_chance INTEGER,
                effect_text TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_species_name ON species(name);
            CREATE INDEX IF NOT EXISTS idx_species_generation ON species(generation);
            CREATE INDEX IF NOT EXISTS idx_flavor_species ON species_flavor_entries(species_id);
            CREATE INDEX IF NOT EXISTS idx_moves_pokemon_group ON pokemon_moves(pokemon_id, version_group_name);
            CREATE INDEX IF NOT EXISTS idx_forms_species ON pokemon_forms(species_id);
            """
        )
        self.conn.commit()

    def set_metadata(self, key: str, value: str) -> None:
        self.conn.execute(
            "INSERT INTO metadata(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, value),
        )

    def has_species(self, species_id: int) -> bool:
        row = self.conn.execute("SELECT 1 FROM species WHERE species_id = ? LIMIT 1", (species_id,)).fetchone()
        return row is not None

    def upsert_species_bundle(
        self,
        species: dict[str, Any],
        pokemon_forms_payloads: list[dict[str, Any]],
        evolution_chain: dict[str, Any] | None,
        artwork_paths: dict[int, str],
    ) -> None:
        species_id = int(species["id"])
        generation = (species.get("generation") or {}).get("name")
        generation_label = generation_label_from_api_name(generation)
        genus = next((g["genus"] for g in species.get("genera", []) if g.get("language", {}).get("name") == "en"), "Pokémon")
        flavor_entries = [
            {
                "version": entry["version"]["name"],
                "text": normalize_text(entry.get("flavor_text")),
            }
            for entry in species.get("flavor_text_entries", [])
            if entry.get("language", {}).get("name") == "en"
        ]
        unique_flavors = {(entry["version"], entry["text"]) for entry in flavor_entries if entry["text"]}

        default_form = next((v for v in species.get("varieties", []) if v.get("is_default")), None)
        default_variety_pokemon_id = get_id_from_url(default_form["pokemon"]["url"]) if default_form else None

        default_pokemon = next(
            (p for p in pokemon_forms_payloads if p["id"] == default_variety_pokemon_id),
            pokemon_forms_payloads[0] if pokemon_forms_payloads else None,
        )
        version_groups = sorted(
            {
                detail["version_group"]["name"]
                for move in (default_pokemon or {}).get("moves", [])
                for detail in move.get("version_group_details", [])
            }
        )

        self.conn.execute(
            """
            INSERT INTO species (
                species_id, name, generation, generation_label, color, habitat, shape, genus,
                capture_rate, base_happiness, growth_rate, hatch_counter, gender_rate,
                is_legendary, is_mythical, forms_switchable, default_variety_pokemon_id,
                version_count, version_group_count, variety_count, move_count, raw_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(species_id) DO UPDATE SET
                name=excluded.name,
                generation=excluded.generation,
                generation_label=excluded.generation_label,
                color=excluded.color,
                habitat=excluded.habitat,
                shape=excluded.shape,
                genus=excluded.genus,
                capture_rate=excluded.capture_rate,
                base_happiness=excluded.base_happiness,
                growth_rate=excluded.growth_rate,
                hatch_counter=excluded.hatch_counter,
                gender_rate=excluded.gender_rate,
                is_legendary=excluded.is_legendary,
                is_mythical=excluded.is_mythical,
                forms_switchable=excluded.forms_switchable,
                default_variety_pokemon_id=excluded.default_variety_pokemon_id,
                version_count=excluded.version_count,
                version_group_count=excluded.version_group_count,
                variety_count=excluded.variety_count,
                move_count=excluded.move_count,
                raw_json=excluded.raw_json,
                updated_at=CURRENT_TIMESTAMP
            """,
            (
                species_id,
                species["name"],
                generation,
                generation_label,
                (species.get("color") or {}).get("name"),
                (species.get("habitat") or {}).get("name"),
                (species.get("shape") or {}).get("name"),
                genus,
                species.get("capture_rate"),
                species.get("base_happiness"),
                (species.get("growth_rate") or {}).get("name"),
                species.get("hatch_counter"),
                species.get("gender_rate"),
                1 if species.get("is_legendary") else 0,
                1 if species.get("is_mythical") else 0,
                1 if species.get("forms_switchable") else 0,
                default_variety_pokemon_id,
                len({version for version, _ in unique_flavors}),
                len(version_groups),
                len(species.get("varieties", [])),
                len((default_pokemon or {}).get("moves", [])),
                json.dumps(species, ensure_ascii=False),
            ),
        )

        self.conn.execute("DELETE FROM species_egg_groups WHERE species_id = ?", (species_id,))
        self.conn.executemany(
            "INSERT OR REPLACE INTO species_egg_groups(species_id, egg_group) VALUES(?, ?)",
            [(species_id, egg["name"]) for egg in species.get("egg_groups", [])],
        )

        self.conn.execute("DELETE FROM species_flavor_entries WHERE species_id = ?", (species_id,))
        self.conn.executemany(
            "INSERT OR REPLACE INTO species_flavor_entries(species_id, version_name, flavor_text) VALUES(?, ?, ?)",
            [(species_id, version, text) for version, text in sorted(unique_flavors)],
        )

        self.conn.execute("DELETE FROM pokemon_forms WHERE species_id = ?", (species_id,))
        for pokemon in pokemon_forms_payloads:
            pokemon_id = int(pokemon["id"])
            self.conn.execute(
                """
                INSERT OR REPLACE INTO pokemon_forms(
                    pokemon_id, species_id, name, is_default, sprite_url, local_artwork_path, raw_json, updated_at
                ) VALUES(?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                (
                    pokemon_id,
                    species_id,
                    pokemon["name"],
                    1 if pokemon_id == default_variety_pokemon_id else 0,
                    official_artwork_url(pokemon_id),
                    artwork_paths.get(pokemon_id),
                    json.dumps(pokemon, ensure_ascii=False),
                ),
            )

            self.conn.execute("DELETE FROM pokemon_types WHERE pokemon_id = ?", (pokemon_id,))
            self.conn.executemany(
                "INSERT OR REPLACE INTO pokemon_types(pokemon_id, slot, type_name) VALUES(?, ?, ?)",
                [(pokemon_id, t["slot"], t["type"]["name"]) for t in pokemon.get("types", [])],
            )

            self.conn.execute("DELETE FROM pokemon_abilities WHERE pokemon_id = ?", (pokemon_id,))
            self.conn.executemany(
                "INSERT OR REPLACE INTO pokemon_abilities(pokemon_id, ability_name, is_hidden, slot) VALUES(?, ?, ?, ?)",
                [(pokemon_id, a["ability"]["name"], 1 if a.get("is_hidden") else 0, a["slot"]) for a in pokemon.get("abilities", [])],
            )

            self.conn.execute("DELETE FROM pokemon_stats WHERE pokemon_id = ?", (pokemon_id,))
            self.conn.executemany(
                "INSERT OR REPLACE INTO pokemon_stats(pokemon_id, stat_name, base_stat, effort) VALUES(?, ?, ?, ?)",
                [(pokemon_id, s["stat"]["name"], s["base_stat"], s.get("effort", 0)) for s in pokemon.get("stats", [])],
            )

            self.conn.execute("DELETE FROM pokemon_moves WHERE pokemon_id = ?", (pokemon_id,))
            move_rows = []
            for move in pokemon.get("moves", []):
                move_name = move["move"]["name"]
                for detail in move.get("version_group_details", []):
                    move_rows.append(
                        (
                            pokemon_id,
                            move_name,
                            detail["version_group"]["name"],
                            detail["move_learn_method"]["name"],
                            int(detail.get("level_learned_at", 0)),
                        )
                    )
            self.conn.executemany(
                "INSERT OR REPLACE INTO pokemon_moves(pokemon_id, move_name, version_group_name, learn_method, level_learned_at) VALUES(?, ?, ?, ?, ?)",
                move_rows,
            )

        if evolution_chain is not None:
            chain_id = int(evolution_chain["id"])
            self.conn.execute(
                """
                INSERT INTO evolution_chains(evolution_chain_id, raw_json, updated_at)
                VALUES(?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(evolution_chain_id) DO UPDATE SET raw_json=excluded.raw_json, updated_at=CURRENT_TIMESTAMP
                """,
                (chain_id, json.dumps(evolution_chain, ensure_ascii=False)),
            )
            self.conn.execute("DELETE FROM species_evolution_map WHERE species_id = ?", (species_id,))
            for stage, species_name in flatten_chain(evolution_chain["chain"]):
                self.conn.execute(
                    "INSERT OR REPLACE INTO species_evolution_map(species_id, evolution_chain_id, stage, species_name) VALUES(?, ?, ?, ?)",
                    (species_id, chain_id, stage, species_name),
                )

        self.conn.commit()


def flatten_chain(node: dict[str, Any], stage: int = 1) -> list[tuple[int, str]]:
    rows = [(stage, node["species"]["name"])]
    for child in node.get("evolves_to", []):
        rows.extend(flatten_chain(child, stage + 1))
    return rows


def download_artwork(client: PokeApiClient, assets_dir: Path, pokemon_id: int) -> str | None:
    artwork_dir = assets_dir / "official-artwork"
    dest = artwork_dir / f"{pokemon_id}.png"
    if not dest.exists():
        try:
            client.download_file(official_artwork_url(pokemon_id), dest)
        except requests.HTTPError:
            return None
    return str(dest.as_posix())


def download_moves(config: DownloaderConfig) -> None:
    """Fetch metadata for all moves from PokeAPI."""
    client = PokeApiClient(timeout=config.timeout)
    db = LocalPokedexDb(config.db_path)
    db.init_schema()

    # Try pokemon_moves first; if empty, fetch the full move index from PokeAPI
    rows = db.conn.execute("SELECT DISTINCT move_name FROM pokemon_moves ORDER BY move_name").fetchall()
    all_move_names = [r["move_name"] for r in rows]

    if not all_move_names:
        print("  No pokemon_moves data found. Fetching move list from PokeAPI...")
        move_index = client.get_json(f"{BASE_URL}/move?limit=2000")
        all_move_names = [item["name"] for item in move_index.get("results", [])]
        print(f"  Found {len(all_move_names)} moves in PokeAPI index.")

    existing = {
        r["move_name"]
        for r in db.conn.execute("SELECT move_name FROM moves").fetchall()
    }

    to_fetch = [n for n in all_move_names if n not in existing] if config.resume else all_move_names
    total = len(to_fetch)
    print(f"Fetching metadata for {total} moves ({len(existing)} already cached).")

    for idx, move_name in enumerate(to_fetch, start=1):
        try:
            data = client.get_json(f"{BASE_URL}/move/{move_name}")
        except requests.HTTPError as exc:
            print(f"  [{idx}/{total}] SKIP {move_name}: {exc}")
            continue

        type_name = (data.get("type") or {}).get("name")
        damage_class = (data.get("damage_class") or {}).get("name")
        target = (data.get("target") or {}).get("name")
        effect_entries = data.get("effect_entries", [])
        effect_text = next(
            (e.get("short_effect", "") for e in effect_entries if e.get("language", {}).get("name") == "en"),
            "",
        )

        db.conn.execute(
            """
            INSERT INTO moves (move_name, type_name, damage_class, power, accuracy, pp,
                               priority, target, effect_chance, effect_text, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(move_name) DO UPDATE SET
                type_name=excluded.type_name, damage_class=excluded.damage_class,
                power=excluded.power, accuracy=excluded.accuracy, pp=excluded.pp,
                priority=excluded.priority, target=excluded.target,
                effect_chance=excluded.effect_chance, effect_text=excluded.effect_text,
                updated_at=CURRENT_TIMESTAMP
            """,
            (
                move_name,
                type_name,
                damage_class,
                data.get("power"),
                data.get("accuracy"),
                data.get("pp"),
                data.get("priority", 0),
                target,
                data.get("effect_chance"),
                normalize_text(effect_text),
            ),
        )

        if idx % 50 == 0:
            db.conn.commit()
        print(f"  [{idx}/{total}] {move_name} — {type_name} {damage_class} pwr={data.get('power')}")
        time.sleep(config.sleep_seconds)

    db.conn.commit()
    db.close()
    print(f"Done. Move metadata saved for {total} moves.")


def download_database(config: DownloaderConfig) -> None:
    client = PokeApiClient(timeout=config.timeout)
    db = LocalPokedexDb(config.db_path)
    db.init_schema()

    processed = 0
    try:
        species_items = list(client.iter_species_index(page_size=config.page_size))
        if config.limit is not None:
            species_items = species_items[: config.limit]

        total = len(species_items)
        print(f"Found {total} species to process.")

        for item in species_items:
            species_id = get_id_from_url(item["url"])
            if config.resume and db.has_species(species_id):
                processed += 1
                print(f"[{processed}/{total}] skip species {species_id} {item['name']}")
                continue

            species = client.get_json(f"{BASE_URL}/pokemon-species/{species_id}")
            pokemon_payloads: list[dict[str, Any]] = []
            artwork_paths: dict[int, str] = {}

            for variety in species.get("varieties", []):
                pokemon_url = variety["pokemon"]["url"]
                pokemon_payload = client.get_json(pokemon_url)
                pokemon_payloads.append(pokemon_payload)
                pokemon_id = int(pokemon_payload["id"])
                local_artwork = download_artwork(client, config.assets_dir, pokemon_id)
                if local_artwork is not None:
                    artwork_paths[pokemon_id] = local_artwork
                time.sleep(config.sleep_seconds)

            evolution_chain = None
            if species.get("evolution_chain", {}).get("url"):
                evolution_chain = client.get_json(species["evolution_chain"]["url"])
                time.sleep(config.sleep_seconds)

            db.upsert_species_bundle(species, pokemon_payloads, evolution_chain, artwork_paths)
            processed += 1
            print(
                f"[{processed}/{total}] saved species {species_id} {species['name']} "
                f"({len(pokemon_payloads)} forms, {len(artwork_paths)} artworks)"
            )
            time.sleep(config.sleep_seconds)

        db.set_metadata("build_complete", "1")
        db.set_metadata("species_count", str(total))
        db.set_metadata("assets_dir", str(config.assets_dir.resolve()))
        db.conn.commit()
        print(f"Done. SQLite database saved to: {config.db_path}")
        print(f"Artwork saved under: {config.assets_dir.resolve()}")
    finally:
        db.close()


def parse_args(argv: list[str]) -> DownloaderConfig:
    parser = argparse.ArgumentParser(
        description="Download full Pokédex data from PokeAPI into SQLite and local assets."
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_PATH),
        help=f"Path to SQLite database file to create or update. Default: {DEFAULT_DB_PATH}",
    )
    parser.add_argument(
        "--assets",
        default=str(DEFAULT_ASSETS_DIR),
        help=f"Directory where local artwork files will be stored. Default: {DEFAULT_ASSETS_DIR}",
    )
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE, help="PokeAPI page size for species index.")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help="HTTP timeout in seconds.")
    parser.add_argument("--sleep", type=float, default=DEFAULT_SLEEP, help="Delay between requests in seconds.")
    parser.add_argument("--resume", action="store_true", help="Skip species already stored in the database.")
    parser.add_argument("--limit", type=int, default=None, help="Only download the first N species.")
    parser.add_argument("--moves-only", action="store_true", help="Only fetch move metadata (skips species download).")
    args = parser.parse_args(argv)
    return DownloaderConfig(
        db_path=Path(args.db),
        assets_dir=Path(args.assets),
        page_size=args.page_size,
        timeout=args.timeout,
        sleep_seconds=args.sleep,
        resume=args.resume,
        limit=args.limit,
        moves_only=getattr(args, "moves_only", False),
    )


if __name__ == "__main__":
    run_self_checks()
    try:
        config = parse_args(sys.argv[1:])
        if config.moves_only:
            download_moves(config)
        else:
            download_database(config)
            download_moves(config)
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        raise SystemExit(130)
