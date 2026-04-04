#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests


ROOT = Path(__file__).resolve().parent.parent
SOURCE_FILE = ROOT / "src" / "data" / "trainerPresets" / "bulbapedia.ts"
GENERATED_TEAMS_FILE = ROOT / "src" / "data" / "generatedTrainerTeams.json"
OUT_DIR = ROOT / "public" / "trainer-sprites"
MANIFEST_FILE = ROOT / "src" / "data" / "trainerSpriteManifest.ts"


def slugify(value: str) -> str:
    return re.sub(r"(^-+|-+$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def parse_trainer_pages() -> dict[str, str]:
    source_text = SOURCE_FILE.read_text(encoding="utf-8")
    trainer_pages = dict(re.findall(r'"([^"]+)":\s+"(https://bulbapedia\.bulbagarden\.net/wiki/[^"]+)"', source_text))
    if GENERATED_TEAMS_FILE.exists():
        import json

        generated_teams = json.loads(GENERATED_TEAMS_FILE.read_text(encoding="utf-8"))
        for team in generated_teams:
            trainer = team.get("trainer")
            source = team.get("source") or {}
            url = source.get("url")
            if isinstance(trainer, str) and isinstance(url, str) and url.startswith("https://bulbapedia.bulbagarden.net/wiki/"):
                trainer_pages.setdefault(trainer, url)
    return trainer_pages


def extract_raw_title(page_url: str) -> str:
    return unquote(urlparse(page_url).path.rsplit("/wiki/", 1)[1])


def fetch_raw_page(session: requests.Session, raw_title: str) -> str:
    response = session.get(
        "https://bulbapedia.bulbagarden.net/w/index.php",
        params={"title": raw_title, "action": "raw"},
        timeout=30,
    )
    response.raise_for_status()
    return response.text


def extract_infobox_filename(raw_text: str) -> str | None:
    match = re.search(r"^\|\s*image\s*=\s*(.+)$", raw_text, re.MULTILINE)
    if not match:
        return None
    value = match.group(1).strip()
    return value if value and not value.startswith("{{") else None


def archives_file_url(filename: str) -> str:
    safe_name = filename.replace(" ", "_")
    md5 = __import__("hashlib").md5(safe_name.encode("utf-8")).hexdigest()
    return f"https://archives.bulbagarden.net/media/upload/{md5[0]}/{md5[:2]}/{safe_name}"


def extract_image_url(page_html: str) -> str | None:
    match = re.search(r"https://archives\.bulbagarden\.net/media/upload/thumb/[^\"']+", page_html)
    if not match:
        return None
    thumb_url = match.group(0)
    thumb_match = re.search(r"/thumb/([0-9a-f]/[0-9a-f]{2}/[^/]+)/[^/]+$", thumb_url)
    if not thumb_match:
        return None
    return f"https://archives.bulbagarden.net/media/upload/{thumb_match.group(1)}"


def detect_extension(url: str) -> str:
    path = unquote(urlparse(url).path)
    suffix = Path(path).suffix.lower()
    return suffix if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp"} else ".png"


def main() -> None:
    session = requests.Session()
    session.headers["User-Agent"] = "Codex Trainer Art Importer/1.0"
    trainer_pages = parse_trainer_pages()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, str] = {}

    for trainer, page_url in sorted(trainer_pages.items()):
        raw_title = extract_raw_title(page_url)
        try:
            response = session.get(page_url, timeout=30)
            response.raise_for_status()
        except requests.RequestException as exc:
            print(f"Missing page for {trainer}: {page_url} ({exc})")
            continue
        image_url = None
        try:
            raw_text = fetch_raw_page(session, raw_title)
            infobox_filename = extract_infobox_filename(raw_text)
            if infobox_filename:
                image_url = archives_file_url(infobox_filename)
        except requests.RequestException:
            image_url = None
        if not image_url:
            image_url = extract_image_url(response.text)
        if not image_url:
            print(f"Missing image for {trainer}: {page_url}")
            continue

        extension = detect_extension(image_url)
        filename = f"{slugify(trainer)}{extension}"
        try:
            image_response = session.get(image_url, timeout=30)
            image_response.raise_for_status()
        except requests.RequestException as exc:
            print(f"Missing asset for {trainer}: {image_url} ({exc})")
            continue
        (OUT_DIR / filename).write_bytes(image_response.content)
        manifest[trainer] = filename
        print(f"Imported {trainer} -> {filename}")

    manifest_lines = [
        "export const trainerSpriteManifest: Record<string, string> = {",
        *[f'  "{trainer}": "{filename}",' for trainer, filename in sorted(manifest.items())],
        "};",
        "",
    ]
    MANIFEST_FILE.write_text("\n".join(manifest_lines), encoding="utf-8")


if __name__ == "__main__":
    main()
