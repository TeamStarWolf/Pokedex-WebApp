#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import sqlite3
from collections import defaultdict
from pathlib import Path


def slugify(value: str) -> str:
    return "-".join(
        part for part in "".join(ch.lower() if ch.isalnum() else "-" for ch in value).split("-") if part
    )


def load_rows(conn: sqlite3.Connection, query: str, params: tuple = ()) -> list[sqlite3.Row]:
    return conn.execute(query, params).fetchall()


def clean_text(value: str) -> str:
    return " ".join(value.replace("\f", " ").replace("\n", " ").split())


def titleize_slug(value: str) -> str:
    return value.replace("-", " ").title()


def english_genus(raw_species: dict) -> str | None:
    for genus in raw_species.get("genera", []):
        if genus.get("language", {}).get("name") == "en":
            return genus.get("genus", "").replace("Pok\u00e9mon", "Pokemon")
    return None


def english_flavor_entries(raw_species: dict) -> list[dict]:
    entries = []
    for entry in raw_species.get("flavor_text_entries", []):
        if entry.get("language", {}).get("name") != "en":
            continue
        entries.append(
            {
                "version": entry.get("version", {}).get("name"),
                "text": clean_text(entry.get("flavor_text", "")),
            }
        )
    return entries


def with_internal_source(label: str, url: str | None = None) -> list[dict]:
    refs = [{"label": "Local SQLite export", "sourceType": "internal"}]
    if url:
        refs.append({"label": label, "sourceType": "pokeapi", "url": url})
    return refs


def build_type_map() -> dict[str, dict]:
    type_colors = {
        "normal": "#d4d4d8",
        "fire": "#fb923c",
        "water": "#60a5fa",
        "electric": "#facc15",
        "grass": "#6ee7b7",
        "ice": "#7dd3fc",
        "fighting": "#f97316",
        "poison": "#a78bfa",
        "ground": "#c08457",
        "flying": "#93c5fd",
        "psychic": "#f472b6",
        "bug": "#a3e635",
        "rock": "#ca8a04",
        "ghost": "#818cf8",
        "dragon": "#38bdf8",
        "dark": "#78716c",
        "steel": "#94a3b8",
        "fairy": "#f9a8d4",
    }
    return {
        f"type:{name}": {
            "id": f"type:{name}",
            "kind": "type",
            "slug": name,
            "name": name.title(),
            "summary": f"{name.title()}-type Pokemon and moves.",
            "status": "partial",
            "sourceRefs": [{"label": "Local SQLite export", "sourceType": "internal"}],
            "relatedLinks": [],
            "colorToken": color,
            "offensiveMatchups": [],
            "defensiveMatchups": [],
        }
        for name, color in type_colors.items()
    }


GAME_GENERATION_MAP: dict[str, int] = {
    # Version groups
    "red-blue": 1, "red-green-japan": 1, "blue-japan": 1, "yellow": 1,
    "gold-silver": 2, "crystal": 2,
    "ruby-sapphire": 3, "emerald": 3, "firered-leafgreen": 3, "colosseum": 3, "xd": 3,
    "diamond-pearl": 4, "platinum": 4, "heartgold-soulsilver": 4,
    "black-white": 5, "black-2-white-2": 5,
    "x-y": 6, "omega-ruby-alpha-sapphire": 6,
    "sun-moon": 7, "ultra-sun-ultra-moon": 7, "lets-go-pikachu-lets-go-eevee": 7,
    "sword-shield": 8, "brilliant-diamond-shining-pearl": 8, "legends-arceus": 8,
    "scarlet-violet": 9, "the-teal-mask": 9, "the-indigo-disk": 9,
    # Individual game versions
    "red": 1, "blue": 1, "green": 1, "yellow-version": 1,
    "gold": 1, "silver": 2, "crystal-version": 2,
    "ruby": 3, "sapphire": 3, "emerald-version": 3, "firered": 3, "leafgreen": 3,
    "diamond": 4, "pearl": 4, "platinum-version": 4, "heartgold": 4, "soulsilver": 4,
    "black": 5, "white": 5, "black-2": 5, "white-2": 5,
    "x": 6, "y": 6, "omega-ruby": 6, "alpha-sapphire": 6,
    "sun": 7, "moon": 7, "ultra-sun": 7, "ultra-moon": 7,
    "lets-go-pikachu": 7, "lets-go-eevee": 7,
    "sword": 8, "shield": 8,
    "brilliant-diamond": 8, "shining-pearl": 8,
    "scarlet": 9, "violet": 9,
}

GAME_SHORT_NAMES: dict[str, str] = {
    "red-blue": "RB", "yellow": "Y", "gold-silver": "GS", "crystal": "C",
    "ruby-sapphire": "RS", "emerald": "E", "firered-leafgreen": "FRLG",
    "diamond-pearl": "DP", "platinum": "Pt", "heartgold-soulsilver": "HGSS",
    "black-white": "BW", "black-2-white-2": "B2W2",
    "x-y": "XY", "omega-ruby-alpha-sapphire": "ORAS",
    "sun-moon": "SM", "ultra-sun-ultra-moon": "USUM",
    "lets-go-pikachu-lets-go-eevee": "LGPE",
    "sword-shield": "SwSh", "brilliant-diamond-shining-pearl": "BDSP",
    "legends-arceus": "PLA", "scarlet-violet": "SV",
    "colosseum": "Colo", "xd": "XD",
    "red": "Red", "blue": "Blue", "gold": "Gold", "silver": "Silver",
    "ruby": "Ruby", "sapphire": "Sapphire", "firered": "FR", "leafgreen": "LG",
    "diamond": "Diamond", "pearl": "Pearl", "heartgold": "HG", "soulsilver": "SS",
    "black": "Black", "white": "White", "black-2": "B2", "white-2": "W2",
    "x": "X", "y": "Y", "omega-ruby": "OR", "alpha-sapphire": "AS",
    "sun": "Sun", "moon": "Moon", "ultra-sun": "US", "ultra-moon": "UM",
    "lets-go-pikachu": "LGP", "lets-go-eevee": "LGE",
    "sword": "Sword", "shield": "Shield",
    "brilliant-diamond": "BD", "shining-pearl": "SP",
    "scarlet": "Scarlet", "violet": "Violet",
}


def build_game_entity(version_group: str) -> dict:
    label = version_group.replace("-", " ").title()
    short_name = GAME_SHORT_NAMES.get(version_group, label)
    generation = GAME_GENERATION_MAP.get(version_group, 0)
    return {
        "id": f"game:{version_group}",
        "kind": "game-version",
        "slug": version_group,
        "name": label,
        "summary": f"{label} version group.",
        "status": "partial",
        "sourceRefs": [{"label": "Local SQLite export", "sourceType": "internal"}],
        "relatedLinks": [],
        "shortName": short_name,
        "regionId": None,
        "generation": generation,
        "versionGroup": version_group,
        "releaseDate": None,
        "platform": None,
        "pairedGameIds": [],
    }


def derive_region_entity(name: str) -> dict:
    return {
        "id": f"region:{name}",
        "kind": "region",
        "slug": name,
        "name": name.title(),
        "summary": "Region inferred from local species data tagged to habitat and forms.",
        "status": "partial",
        "sourceRefs": [{"label": "Derived from local species data", "sourceType": "internal"}],
        "relatedLinks": [],
        "generationLabel": "Mixed",
        "introducedInGameId": None,
        "locationIds": [],
        "gameVersionIds": [],
    }


def parse_generation(value: str | None) -> int:
    if not value:
        return 0
    roman = {
        "i": 1,
        "ii": 2,
        "iii": 3,
        "iv": 4,
        "v": 5,
        "vi": 6,
        "vii": 7,
        "viii": 8,
        "ix": 9,
    }
    return roman.get(value.split("-")[-1], 0)


def build_region_map() -> dict[str, dict]:
    names = ["kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar", "hisui", "paldea"]
    return {f"region:{name}": derive_region_entity(name) for name in names}


def dedupe_preserve_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def build_dataset(conn: sqlite3.Connection) -> dict:
    types = build_type_map()
    seeded_move_type_overrides = {
        "vine-whip": "type:grass",
        "razor-leaf": "type:grass",
        "solar-beam": "type:grass",
        "ember": "type:fire",
        "flamethrower": "type:fire",
        "thunderbolt": "type:electric",
        "iron-tail": "type:steel",
        "bite": "type:dark",
        "mud-shot": "type:ground",
        "surf": "type:water",
    }
    species_rows = load_rows(conn, "SELECT * FROM species ORDER BY species_id")
    form_rows = load_rows(conn, "SELECT * FROM pokemon_forms ORDER BY species_id, is_default DESC, pokemon_id")
    ability_rows = load_rows(conn, "SELECT * FROM pokemon_abilities ORDER BY pokemon_id, slot")
    type_rows = load_rows(conn, "SELECT * FROM pokemon_types ORDER BY pokemon_id, slot")
    move_rows = load_rows(conn, "SELECT * FROM pokemon_moves ORDER BY pokemon_id, version_group_name, move_name")
    stat_rows = load_rows(conn, "SELECT pokemon_id, stat_name, base_stat FROM pokemon_stats ORDER BY pokemon_id, rowid")
    flavor_rows = load_rows(conn, "SELECT * FROM species_flavor_entries ORDER BY species_id, version_name")
    egg_rows = load_rows(conn, "SELECT * FROM species_egg_groups ORDER BY species_id, egg_group")
    evo_rows = load_rows(conn, "SELECT * FROM species_evolution_map ORDER BY evolution_chain_id, stage, species_id")

    abilities_by_pokemon: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in ability_rows:
        abilities_by_pokemon[row["pokemon_id"]].append(row)

    types_by_pokemon: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in type_rows:
        types_by_pokemon[row["pokemon_id"]].append(row)

    moves_by_pokemon: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in move_rows:
        moves_by_pokemon[row["pokemon_id"]].append(row)

    stats_by_pokemon: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in stat_rows:
        stats_by_pokemon[row["pokemon_id"]].append(row)

    flavor_by_species: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in flavor_rows:
        flavor_by_species[row["species_id"]].append(row)

    eggs_by_species: dict[int, list[str]] = defaultdict(list)
    for row in egg_rows:
        eggs_by_species[row["species_id"]].append(row["egg_group"])

    forms_by_species: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in form_rows:
        forms_by_species[row["species_id"]].append(row)

    species_by_name: dict[str, int] = {row["name"]: row["species_id"] for row in species_rows}

    game_versions: dict[str, dict] = {}
    ability_entities: dict[str, dict] = {}
    move_entities: dict[str, dict] = {}
    item_entities: dict[str, dict] = {}
    region_entities: dict[str, dict] = build_region_map()
    location_entities: dict[str, dict] = {}
    form_entities: dict[str, dict] = {}
    species_entities: dict[str, dict] = {}
    evolutions: dict[str, dict] = {}

    for species in species_rows:
        raw_species = json.loads(species["raw_json"])
        form_ids: list[str] = []
        related_item_ids: set[str] = set()
        region_hints: set[str] = set()

        for form in forms_by_species[species["species_id"]]:
            raw_form = json.loads(form["raw_json"] or "{}")
            form_slug = slugify(form["name"])
            form_id = f"form:{form_slug}"
            form_ids.append(form_id)
            type_ids = [f"type:{row['type_name']}" for row in types_by_pokemon[form["pokemon_id"]]]
            move_url_map = {entry.get("move", {}).get("name"): entry.get("move", {}).get("url") for entry in raw_form.get("moves", [])}
            ability_url_map = {entry.get("ability", {}).get("name"): entry.get("ability", {}).get("url") for entry in raw_form.get("abilities", [])}
            ability_slots = []
            for ability in abilities_by_pokemon[form["pokemon_id"]]:
                ability_id = f"ability:{ability['ability_name']}"
                ability_slots.append(
                    {
                        "abilityId": ability_id,
                        "slot": ability["slot"],
                        "isHidden": bool(ability["is_hidden"]),
                    }
                )
                ability_entity = ability_entities.setdefault(
                    ability_id,
                    {
                        "id": ability_id,
                        "kind": "ability",
                        "slug": ability["ability_name"],
                        "name": ability["ability_name"].replace("-", " ").title(),
                        "summary": f"{ability['ability_name'].replace('-', ' ').title()} ability.",
                        "status": "partial",
                        "sourceRefs": with_internal_source("PokeAPI ability", ability_url_map.get(ability["ability_name"])),
                        "relatedLinks": [],
                        "expansionNotes": ["Effect text and version-specific flavor text still need a richer import."],
                        "isMainSeries": True,
                        "description": "Imported from local form abilities. Effect text not yet present in the SQLite export.",
                        "effectText": "Detailed effect text is pending a richer source import.",
                        "flavorTextByVersion": [],
                        "pokemonFormIds": [],
                    },
                )
                ability_entity["pokemonFormIds"].append(form_id)

            stats = {row["stat_name"]: row["base_stat"] for row in stats_by_pokemon[form["pokemon_id"]]}
            ev_yield = {
                stat_entry["stat"]["name"]: stat_entry["effort"]
                for stat_entry in raw_form.get("stats", [])
                if stat_entry.get("effort")
            }
            learnset = []
            available_games: set[str] = set()
            for index, move in enumerate(moves_by_pokemon[form["pokemon_id"]], start=1):
                move_id = f"move:{move['move_name']}"
                game_id = f"game:{move['version_group_name']}"
                available_games.add(game_id)
                game_versions.setdefault(move["version_group_name"], build_game_entity(move["version_group_name"]))
                learnset.append(
                    {
                        "moveId": move_id,
                        "gameVersionId": game_id,
                        "method": move["learn_method"],
                        "level": move["level_learned_at"] or None,
                        "order": index,
                    }
                )
                move_entity = move_entities.setdefault(
                    move_id,
                    {
                        "id": move_id,
                        "kind": "move",
                        "slug": move["move_name"],
                        "name": move["move_name"].replace("-", " ").title(),
                        "summary": f"{move['move_name'].replace('-', ' ').title()} move.",
                        "status": "partial",
                        "sourceRefs": with_internal_source("PokeAPI move", move_url_map.get(move["move_name"])),
                        "relatedLinks": [],
                        "expansionNotes": ["Power, accuracy, and machine metadata still need a fuller move import."],
                        "typeId": seeded_move_type_overrides.get(move["move_name"], "type:normal"),
                        "damageClass": "status",
                        "power": None,
                        "accuracy": None,
                        "pp": None,
                        "priority": 0,
                        "target": "selected-pokemon",
                        "effectChance": None,
                        "effectText": "Detailed move metadata is pending a richer source import.",
                        "flavorTextByVersion": [],
                        "machineItemIds": [],
                        "pokemonFormIds": [],
                    },
                )
                move_entity["pokemonFormIds"].append(form_id)

            held_item_ids = []
            held_items_by_version = []
            for held_item in raw_form.get("held_items", []):
                item_name = held_item["item"]["name"]
                item_id = f"item:{item_name}"
                held_item_ids.append(item_id)
                related_item_ids.add(item_id)
                item_entity = item_entities.setdefault(
                    item_id,
                    {
                        "id": item_id,
                        "kind": "item",
                        "slug": item_name,
                        "name": item_name.replace("-", " ").title(),
                        "summary": f"{item_name.replace('-', ' ').title()} item.",
                        "status": "partial",
                        "sourceRefs": with_internal_source("PokeAPI item", held_item["item"].get("url")),
                        "relatedLinks": [],
                        "expansionNotes": ["Item effects and economy values remain sparse without a fuller item import."],
                        "category": "Held item",
                        "flingPower": None,
                        "flingEffect": None,
                        "purchasePrice": None,
                        "sellPrice": None,
                        "effectText": "Detailed item metadata is pending a richer source import.",
                        "versionEffects": [],
                        "relatedMoveIds": [],
                        "relatedPokemonIds": [],
                    },
                )
                item_entity["relatedPokemonIds"].append(f"pokemon:{species['name']}")
                for version_detail in held_item.get("version_details", []):
                    game_name = version_detail["version"]["name"]
                    game_id = f"game:{game_name}"
                    game_versions.setdefault(game_name, build_game_entity(game_name))
                    held_items_by_version.append(
                        {
                            "gameVersionId": game_id,
                            "state": "known",
                            "value": [item_id],
                            "notes": [f"Rarity {version_detail.get('rarity', 0)}%"],
                        }
                    )

            form_kind = "default"
            for hint in ("alola", "galar", "hisui", "paldea"):
                if hint in form["name"]:
                    region_hints.add(hint)
                    form_kind = "regional"

            form_entities[form_id] = {
                "id": form_id,
                "kind": "pokemon-form",
                "slug": form_slug,
                "name": form["name"].replace("-", " ").title(),
                "summary": f"{titleize_slug(form['name'])} form with {' / '.join(titleize_slug(type_id.replace('type:', '')) for type_id in type_ids) or 'unknown'} typing.",
                "status": "partial",
                "sourceRefs": with_internal_source("PokeAPI pokemon", f"https://pokeapi.co/api/v2/pokemon/{form['pokemon_id']}/"),
                "relatedLinks": [],
                "expansionNotes": ["Location and breeding metadata can be expanded with a fuller encounter import."],
                "speciesId": f"pokemon:{species['name']}",
                "formKey": slugify(form["name"].replace(species["name"], "")) or "default",
                "formName": form["name"].replace(species["name"], "").replace("-", " ").strip().title() or "Standard",
                "formKind": form_kind,
                "isDefault": bool(form["is_default"]),
                "introducedInGameId": None,
                "availableInGameIds": sorted(available_games),
                "typeIds": type_ids,
                "abilitySlots": ability_slots,
                "stats": {
                    "hp": stats.get("hp", 0),
                    "attack": stats.get("attack", 0),
                    "defense": stats.get("defense", 0),
                    "special-attack": stats.get("special-attack", 0),
                    "special-defense": stats.get("special-defense", 0),
                    "speed": stats.get("speed", 0),
                },
                "evYield": ev_yield,
                "heightDecimetres": raw_form.get("height"),
                "weightHectograms": raw_form.get("weight"),
                "heldItemIds": sorted(set(held_item_ids)),
                "heldItemsByVersion": held_items_by_version,
                "learnset": learnset,
                "breedingNotes": ["Breeding notes are pending a richer source import."],
                "spriteUrl": form["sprite_url"],
                "artworkUrl": f"/official-artwork/{form['pokemon_id']}.png",
            }

        raw_flavor_entries = english_flavor_entries(raw_species)
        entry_games = []
        pokedex_entries = []
        for row in flavor_by_species[species["species_id"]]:
            game_name = row["version_name"]
            game_id = f"game:{game_name}"
            game_versions.setdefault(game_name, build_game_entity(game_name))
            entry_games.append(game_id)
            pokedex_entries.append(
                {
                    "gameVersionId": game_id,
                    "text": " ".join(row["flavor_text"].split()),
                    "language": "en",
                }
            )
        if not pokedex_entries:
            for entry in raw_flavor_entries:
                if not entry["version"]:
                    continue
                game_name = entry["version"]
                game_id = f"game:{game_name}"
                game_versions.setdefault(game_name, build_game_entity(game_name))
                entry_games.append(game_id)
                pokedex_entries.append({"gameVersionId": game_id, "text": entry["text"], "language": "en"})

        for hint in region_hints:
            region_entities.setdefault(f"region:{hint}", derive_region_entity(hint))

        genus = english_genus(raw_species) or species["genus"] or "Pokemon"
        first_entry = pokedex_entries[0]["text"] if pokedex_entries else None
        lore_summary = []
        if first_entry:
            lore_summary.append(first_entry)
        if species["habitat"]:
            lore_summary.append(f"Common habitat tag: {titleize_slug(species['habitat'])}.")
        if species["shape"] or species["color"]:
            lore_summary.append(
                f"Shape: {titleize_slug(species['shape']) if species['shape'] else 'Unknown'} | Color: {titleize_slug(species['color']) if species['color'] else 'Unknown'}."
            )

        browse_tags = []
        if species["is_legendary"]:
            browse_tags.append("legendary")
        if species["is_mythical"]:
            browse_tags.append("mythical")
        if species["forms_switchable"]:
            browse_tags.append("form-switch")
        if species["variety_count"] > 1:
            browse_tags.append("multi-variety")
        if region_hints:
            browse_tags.append("regional-form")

        # Determine the correct default form ID by finding the form flagged is_default,
        # since some species have default forms with suffixed names (e.g., deoxys-normal)
        default_form_id = f"form:{slugify(species['name'])}"
        species_forms = forms_by_species.get(species["species_id"], [])
        for form in species_forms:
            if form["is_default"]:
                candidate = f"form:{slugify(form['name'])}"
                if candidate in form_entities:
                    default_form_id = candidate
                break

        species_id = f"pokemon:{species['name']}"
        species_entities[species_id] = {
            "id": species_id,
            "kind": "pokemon-species",
            "slug": species["name"],
            "name": species["name"].replace("-", " ").title(),
            "summary": first_entry or f"{species['name'].replace('-', ' ').title()} encyclopedia entry.",
            "status": "partial",
            "sourceRefs": with_internal_source("PokeAPI species", f"https://pokeapi.co/api/v2/pokemon-species/{species['species_id']}/"),
            "relatedLinks": [],
            "expansionNotes": ["Competitive, encounter, and media coverage can be expanded later without changing the page contract."],
            "nationalDexNumber": species["species_id"],
            "categoryLabel": genus,
            "defaultFormId": default_form_id,
            "formIds": form_ids,
            "generation": parse_generation(species["generation"]),
            "introducedInGameId": None,
            "primaryTypeIds": form_entities[form_ids[0]]["typeIds"] if form_ids else [],
            "eggGroups": eggs_by_species[species["species_id"]],
            "hatchCounter": species["hatch_counter"],
            "captureRate": species["capture_rate"],
            "baseFriendship": species["base_happiness"],
            "genderRatio": species["gender_rate"],
            "growthRate": species["growth_rate"],
            "isBaby": False,
            "isLegendary": bool(species["is_legendary"]),
            "isMythical": bool(species["is_mythical"]),
            "isParadox": "paradox" in species["name"],
            "browseTags": browse_tags,
            "habitat": species["habitat"],
            "shape": species["shape"],
            "color": species["color"],
            "evolutionIds": [],
            "pokedexGameIds": dedupe_preserve_order(entry_games),
            "pokedexEntries": pokedex_entries,
            "locationIds": [],
            "competitiveSummary": ["Competitive notes are pending a richer source import."],
            "loreSummary": lore_summary or [f"Imported from local species data for {species['name'].replace('-', ' ').title()}."],
            "trivia": [
                f"Varieties tracked locally: {species['variety_count']}.",
                f"Version groups with known data: {species['version_group_count']}.",
            ],
            "relatedItemIds": sorted(related_item_ids),
        }

    chains: dict[int, list[sqlite3.Row]] = defaultdict(list)
    for row in evo_rows:
        chains[row["evolution_chain_id"]].append(row)

    for chain_id, rows in chains.items():
        ordered = sorted(rows, key=lambda row: (row["stage"], row["species_id"]))
        for left, right in zip(ordered, ordered[1:]):
            if left["stage"] == right["stage"]:
                continue
            left_id = species_by_name.get(left["species_name"])
            right_id = species_by_name.get(right["species_name"])
            if not left_id or not right_id:
                continue
            evo_id = f"evolution:{left['species_name']}-to-{right['species_name']}"
            evolutions[evo_id] = {
                "id": evo_id,
                "kind": "evolution",
                "slug": slugify(f"{left['species_name']}-to-{right['species_name']}"),
                "name": f"{left['species_name'].replace('-', ' ').title()} to {right['species_name'].replace('-', ' ').title()}",
                "summary": "Evolution edge imported from local evolution chain stage data.",
                "status": "partial",
                "sourceRefs": [{"label": "Local SQLite export", "sourceType": "internal"}],
                "relatedLinks": [],
                "fromSpeciesId": f"pokemon:{left['species_name']}",
                "toSpeciesId": f"pokemon:{right['species_name']}",
                "requirements": [
                    {
                        "trigger": "other",
                        "notes": [f"Derived from evolution chain stage {left['stage']} to {right['stage']}"],
                    }
                ],
            }
            species_entities[f"pokemon:{left['species_name']}"]["evolutionIds"].append(evo_id)
            species_entities[f"pokemon:{right['species_name']}"]["evolutionIds"].append(evo_id)

    for ability in ability_entities.values():
        ability["pokemonFormIds"] = dedupe_preserve_order(ability["pokemonFormIds"])
    for move in move_entities.values():
        move["pokemonFormIds"] = dedupe_preserve_order(move["pokemonFormIds"])
    for item in item_entities.values():
        item["relatedPokemonIds"] = dedupe_preserve_order(item["relatedPokemonIds"])

    return {
        "pokemon": species_entities,
        "forms": form_entities,
        "evolutions": evolutions,
        "moves": move_entities,
        "abilities": ability_entities,
        "items": item_entities,
        "regions": region_entities,
        "gameVersions": {entity["id"]: entity for entity in game_versions.values()},
        "types": types,
        "locations": location_entities,
    }


def build_index_dataset(full: dict) -> dict:
    pokemon = {}
    for species_id, species in full["pokemon"].items():
        pokemon[species_id] = {
            **species,
            "pokedexEntries": [],
        }

    forms = {}
    for form_id, form in full["forms"].items():
        forms[form_id] = {
            **form,
            "heldItemsByVersion": [],
            "learnset": [],
        }

    return {
        **full,
        "pokemon": pokemon,
        "forms": forms,
    }


def collect_evolution_family_species(full: dict, root_species_id: str) -> set[str]:
    connected = {root_species_id}
    changed = True
    while changed:
        changed = False
        for evolution in full["evolutions"].values():
            if evolution["fromSpeciesId"] in connected or evolution["toSpeciesId"] in connected:
                before = len(connected)
                connected.add(evolution["fromSpeciesId"])
                connected.add(evolution["toSpeciesId"])
                if len(connected) != before:
                    changed = True
    return connected


def build_species_detail_dataset(full: dict, species_id: str) -> dict:
    family_species_ids = collect_evolution_family_species(full, species_id)
    pokemon = {entry_id: full["pokemon"][entry_id] for entry_id in family_species_ids if entry_id in full["pokemon"]}

    form_ids: set[str] = set()
    evolution_ids: set[str] = set()
    for species in pokemon.values():
        form_ids.update(species["formIds"])
        evolution_ids.update(species["evolutionIds"])

    forms = {form_id: full["forms"][form_id] for form_id in form_ids if form_id in full["forms"]}
    evolutions = {evo_id: full["evolutions"][evo_id] for evo_id in evolution_ids if evo_id in full["evolutions"]}

    ability_ids: set[str] = set()
    move_ids: set[str] = set()
    item_ids: set[str] = set()
    type_ids: set[str] = set()
    game_ids: set[str] = set()
    location_ids: set[str] = set()
    region_ids: set[str] = set()

    for species in pokemon.values():
        item_ids.update(species["relatedItemIds"])
        game_ids.update(species["pokedexGameIds"])
        location_ids.update(species["locationIds"])

    for form in forms.values():
        type_ids.update(form["typeIds"])
        item_ids.update(form["heldItemIds"])
        game_ids.update(form["availableInGameIds"])
        for held_items in form["heldItemsByVersion"]:
            game_ids.add(held_items["gameVersionId"])
            item_ids.update(held_items.get("value") or [])
        for ability in form["abilitySlots"]:
            ability_ids.add(ability["abilityId"])
        for move in form["learnset"]:
            move_ids.add(move["moveId"])
            game_ids.add(move["gameVersionId"])

    locations = {location_id: full["locations"][location_id] for location_id in location_ids if location_id in full["locations"]}
    for location in locations.values():
        if location["regionId"]:
            region_ids.add(location["regionId"])
        game_ids.update(location["gameVersionIds"])

    for game_id in list(game_ids):
        game = full["gameVersions"].get(game_id)
        if game and game["regionId"]:
            region_ids.add(game["regionId"])

    return {
        "pokemon": pokemon,
        "forms": forms,
        "evolutions": evolutions,
        "moves": {move_id: full["moves"][move_id] for move_id in move_ids if move_id in full["moves"]},
        "abilities": {ability_id: full["abilities"][ability_id] for ability_id in ability_ids if ability_id in full["abilities"]},
        "items": {item_id: full["items"][item_id] for item_id in item_ids if item_id in full["items"]},
        "regions": {region_id: full["regions"][region_id] for region_id in region_ids if region_id in full["regions"]},
        "gameVersions": {game_id: full["gameVersions"][game_id] for game_id in game_ids if game_id in full["gameVersions"]},
        "types": {type_id: full["types"][type_id] for type_id in type_ids if type_id in full["types"]},
        "locations": locations,
    }


def write_dataset(out_dir: Path, full: dict) -> None:
    if out_dir.exists():
        shutil.rmtree(out_dir)
    (out_dir / "pokemon").mkdir(parents=True, exist_ok=True)

    index_dataset = build_index_dataset(full)
    (out_dir / "index.json").write_text(json.dumps(index_dataset), encoding="utf-8")

    for species in full["pokemon"].values():
        detail_dataset = build_species_detail_dataset(full, species["id"])
        (out_dir / "pokemon" / f"{species['slug']}.json").write_text(json.dumps(detail_dataset), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()

    conn = sqlite3.connect(args.db)
    conn.row_factory = sqlite3.Row
    try:
        payload = build_dataset(conn)
    finally:
        conn.close()

    write_dataset(args.out_dir, payload)


if __name__ == "__main__":
    main()
