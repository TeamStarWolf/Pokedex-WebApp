# PokeNav - Copyright (c) 2026 TeamStarWolf
# https://github.com/TeamStarWolf/PokeNav - MIT License
"""
Enrich type matchup data by fetching from PokeAPI.
Populates both offensive and defensive matchups for all 18 types.
"""

import json
import urllib.request
from pathlib import Path

INDEX_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "encyclopedia" / "index.json"

TYPE_NAMES = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy",
]

def fetch_type(name: str) -> dict:
    url = f"https://pokeapi.co/api/v2/type/{name}"
    print(f"  Fetching {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "PokeNav/1.0"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def build_matchups(api_data: dict) -> tuple[list, list]:
    """Build offensive and defensive matchup arrays from PokeAPI type data."""
    relations = api_data["damage_relations"]

    # Offensive: what this type does TO other types
    offensive = []
    for entry in relations["double_damage_to"]:
        offensive.append({"attackingTypeId": f"type:{entry['name']}", "multiplier": 2})
    for entry in relations["half_damage_to"]:
        offensive.append({"attackingTypeId": f"type:{entry['name']}", "multiplier": 0.5})
    for entry in relations["no_damage_to"]:
        offensive.append({"attackingTypeId": f"type:{entry['name']}", "multiplier": 0})

    # Defensive: what other types do TO this type
    # Format: attackingTypeId = the type attacking us, multiplier = damage we take
    defensive = []
    for entry in relations["double_damage_from"]:
        defensive.append({"attackingTypeId": f"type:{entry['name']}", "multiplier": 2})
    for entry in relations["half_damage_from"]:
        defensive.append({"attackingTypeId": f"type:{entry['name']}", "multiplier": 0.5})
    for entry in relations["no_damage_from"]:
        defensive.append({"attackingTypeId": f"type:{entry['name']}", "multiplier": 0})

    return offensive, defensive


def main():
    print(f"Loading {INDEX_PATH}")
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    types_dict = data.get("types", {})
    print(f"Found {len(types_dict)} types in index.json")

    updated = 0
    for type_name in TYPE_NAMES:
        type_id = f"type:{type_name}"
        if type_id not in types_dict:
            print(f"  WARNING: {type_id} not found in index.json, skipping")
            continue

        api_data = fetch_type(type_name)
        offensive, defensive = build_matchups(api_data)

        types_dict[type_id]["offensiveMatchups"] = offensive
        types_dict[type_id]["defensiveMatchups"] = defensive

        print(f"  {type_name}: {len(offensive)} offensive, {len(defensive)} defensive matchups")
        updated += 1

    print(f"\nUpdated {updated} types. Writing back to {INDEX_PATH}")
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))

    print("Done!")


if __name__ == "__main__":
    main()
