#!/usr/bin/env python3
"""
Build script for alexcason.dev.

Reads:
  src/templates/    Jinja2 templates (base layout + one per page type)
  src/content/pages/  Markdown pages (About, CV) with YAML front matter
  src/content/notes/  Markdown (.md) or LaTeX (.tex) notes
  src/data/          YAML data: projects, videos, social links
  src/static/        CSS, JS, images — copied through unchanged

Writes:
  dist/              A complete, ready-to-serve static site

Usage:
  python build.py            # build once
  python build.py --serve    # build, then serve dist/ at http://localhost:8000
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import frontmatter
import markdown
import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).parent.resolve()
SRC = ROOT / "src"
DIST = ROOT / "dist"

MD_EXTENSIONS = ["extra", "sane_lists", "pymdownx.arithmatex"]
MD_EXTENSION_CONFIGS = {"pymdownx.arithmatex": {"generic": True}}

PANDOC_META_TEMPLATE = SRC / "_pandoc-meta.tmpl"


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def log(msg):
    print(f"  {msg}")


def slugify_from_path(path: Path) -> str:
    return path.stem


def is_published(path: Path) -> bool:
    """Files/folders starting with '_' are templates, never published."""
    return not path.stem.startswith("_")


# ---------------------------------------------------------------------
# Markdown notes / pages
# ---------------------------------------------------------------------
def render_markdown(text: str) -> str:
    return markdown.markdown(
        text,
        extensions=MD_EXTENSIONS,
        extension_configs=MD_EXTENSION_CONFIGS,
    )


def load_markdown_note(path: Path) -> dict:
    post = frontmatter.load(path)
    slug = slugify_from_path(path)
    meta = post.metadata
    d = meta.get("date", "")
    return {
        "slug": slug,
        "title": meta.get("title") or slug.replace("-", " ").title(),
        "date": str(d) if d else "",
        "tags": meta.get("tags", []) or [],
        "summary": meta.get("summary", ""),
        "body_html": render_markdown(post.content),
    }


# ---------------------------------------------------------------------
# LaTeX notes (via pandoc)
# ---------------------------------------------------------------------
def pandoc_available() -> bool:
    return shutil.which("pandoc") is not None


def load_tex_note(path: Path) -> dict:
    slug = slugify_from_path(path)
    raw = path.read_text(encoding="utf-8")

    tags_match = re.search(r"^%\s*tags:\s*(.+)$", raw, re.MULTILINE | re.IGNORECASE)
    summary_match = re.search(r"^%\s*summary:\s*(.+)$", raw, re.MULTILINE | re.IGNORECASE)
    tags = [t.strip() for t in tags_match.group(1).split(",")] if tags_match else []
    summary = summary_match.group(1).strip() if summary_match else ""

    if not PANDOC_META_TEMPLATE.exists():
        raise FileNotFoundError(
            f"missing {PANDOC_META_TEMPLATE.relative_to(ROOT)} — this ships with the repo; "
            f"if it's gone, restore it (see build.py's PANDOC_META_TEMPLATE)."
        )

    meta_out = subprocess.run(
        ["pandoc", str(path), "-f", "latex", "-s", "-t", "html",
         "--template", str(PANDOC_META_TEMPLATE)],
        capture_output=True, text=True,
    )
    title, _, date_part = meta_out.stdout.partition("@@@DATE@@@")
    title = title.strip() or slug.replace("-", " ").title()
    note_date = date_part.strip()

    body_out = subprocess.run(
        ["pandoc", str(path), "-f", "latex", "-t", "html", "--mathjax"],
        capture_output=True, text=True,
    )
    if body_out.returncode != 0:
        raise RuntimeError(f"pandoc failed converting {path.name}:\n{body_out.stderr}")

    return {
        "slug": slug,
        "title": title,
        "date": note_date,
        "tags": tags,
        "summary": summary,
        "body_html": body_out.stdout,
    }


# ---------------------------------------------------------------------
# Build steps
# ---------------------------------------------------------------------
def build_notes(env, out_dir: Path) -> list:
    notes_src = SRC / "content" / "notes"
    out_dir.mkdir(parents=True, exist_ok=True)
    template = env.get_template("note.html")
    index = []

    md_files = [p for p in sorted(notes_src.glob("*.md")) if is_published(p)]
    tex_files = [p for p in sorted(notes_src.glob("*.tex")) if is_published(p)]

    if tex_files and not pandoc_available():
        log(f"WARNING: {len(tex_files)} .tex note(s) found but pandoc is not installed — "
            f"skipping them. Install pandoc to enable LaTeX notes (see README.md).")
        tex_files = []

    for path in md_files:
        note = load_markdown_note(path)
        html = template.render(root="../", active="notes", **note)
        (out_dir / f"{note['slug']}.html").write_text(html, encoding="utf-8")
        index.append(note)
        log(f"note (md):  {path.name} -> notes/{note['slug']}.html")

    for path in tex_files:
        note = load_tex_note(path)
        html = template.render(root="../", active="notes", **note)
        (out_dir / f"{note['slug']}.html").write_text(html, encoding="utf-8")
        index.append(note)
        log(f"note (tex): {path.name} -> notes/{note['slug']}.html")

    index.sort(key=lambda n: n["date"], reverse=True)
    return index


def build_pages(env):
    pages_src = SRC / "content" / "pages"
    for path in sorted(pages_src.glob("*.md")):
        if not is_published(path):
            continue
        post = frontmatter.load(path)
        meta = post.metadata
        slug = slugify_from_path(path)
        html = env.get_template("prose.html").render(
            root="",
            active=slug,
            title=meta.get("title", slug.title()),
            eyebrow=meta.get("eyebrow", ""),
            description=meta.get("description", ""),
            show_contact=meta.get("show_contact", False),
            body_html=render_markdown(post.content),
        )
        (DIST / f"{slug}.html").write_text(html, encoding="utf-8")
        log(f"page: {path.name} -> {slug}.html")


def build_simple_templates(env):
    for name, active in [
        ("home.html", "home"),
        ("research.html", "research"),
        ("projects.html", "projects"),
        ("notes-index.html", "notes"),
        ("youtube.html", "youtube"),
    ]:
        html = env.get_template(name).render(root="", active=active)
        out_name = "index.html" if name == "home.html" else (
            "notes.html" if name == "notes-index.html" else name
        )
        (DIST / out_name).write_text(html, encoding="utf-8")
        log(f"page: {name} -> {out_name}")

    html404 = env.get_template("404.html").render(root="", active="")
    (DIST / "404.html").write_text(html404, encoding="utf-8")
    log("page: 404.html -> 404.html")


def build_data_scripts(notes_index: list):
    data_dir = DIST / "assets" / "js" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    projects = yaml.safe_load((SRC / "data" / "projects.yaml").read_text()) or []
    videos_doc = yaml.safe_load((SRC / "data" / "videos.yaml").read_text()) or {}
    social = yaml.safe_load((SRC / "data" / "social-links.yaml").read_text()) or {}

    (data_dir / "projects.js").write_text(
        "const PROJECTS = " + json.dumps(projects, indent=2) + ";\n", encoding="utf-8"
    )
    (data_dir / "videos.js").write_text(
        "const CHANNEL_URL = " + json.dumps(videos_doc.get("channel_url", "")) + ";\n\n"
        "const VIDEOS = " + json.dumps(videos_doc.get("videos", []), indent=2) + ";\n",
        encoding="utf-8",
    )
    social_list = [
        {"label": label, "key": key, "url": social.get(key, "") or ""}
        for key, label in [
            ("email", "Email"), ("github", "GitHub"), ("youtube", "YouTube"),
            ("linkedin", "LinkedIn"), ("scholar", "Google Scholar"), ("orcid", "ORCID"),
        ]
    ]
    (data_dir / "social-links.js").write_text(
        "const SOCIAL_LINKS = " + json.dumps(social_list, indent=2) + ";\n", encoding="utf-8"
    )

    note_summaries = [
        {"slug": n["slug"], "title": n["title"], "summary": n["summary"],
         "tags": n["tags"], "date": n["date"]}
        for n in notes_index
    ]
    (data_dir / "notes-index.js").write_text(
        "const NOTES_INDEX = " + json.dumps(note_summaries, indent=2) + ";\n", encoding="utf-8"
    )
    log(f"data: projects.js, videos.js, social-links.js, notes-index.js "
        f"({len(projects)} projects, {len(notes_index)} notes)")


def copy_static():
    css_out = DIST / "assets" / "css"
    js_out = DIST / "assets" / "js"
    img_out = DIST / "assets" / "img"
    css_out.mkdir(parents=True, exist_ok=True)
    js_out.mkdir(parents=True, exist_ok=True)

    shutil.copy(SRC / "static" / "css" / "style.css", css_out / "style.css")
    shutil.copy(SRC / "static" / "js" / "main.js", js_out / "main.js")

    img_src = SRC / "static" / "img"
    if img_src.exists() and any(img_src.iterdir()):
        shutil.copytree(img_src, img_out, dirs_exist_ok=True)

    cv_src = SRC / "static" / "cv"
    if cv_src.exists() and any(cv_src.iterdir()):
        shutil.copytree(cv_src, DIST / "assets" / "cv", dirs_exist_ok=True)

    (DIST / ".nojekyll").touch()
    log("static: css, js, img copied")


def build_seo_files(notes_index: list):
    pages = ["", "research.html", "projects.html", "notes.html", "youtube.html",
             "about.html", "cv.html"]
    urls = [f"https://example.com/{p}" for p in pages]
    urls += [f"https://example.com/notes/{n['slug']}.html" for n in notes_index]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap += [f"  <url><loc>{u}</loc></url>" for u in urls]
    sitemap.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (DIST / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n",
        encoding="utf-8",
    )
    log("seo: sitemap.xml, robots.txt (update the domain in build.py's build_seo_files "
        "once you know your real URL)")


# ---------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------
def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    env = Environment(
        loader=FileSystemLoader(str(SRC / "templates")),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )

    print("Building alexcason.dev ...")
    notes_index = build_notes(env, DIST / "notes")
    build_pages(env)
    build_simple_templates(env)
    build_data_scripts(notes_index)
    copy_static()
    build_seo_files(notes_index)
    print(f"Done — output in {DIST.relative_to(ROOT)}/")

    if "--serve" in sys.argv:
        import http.server
        import functools
        import os

        os.chdir(DIST)
        handler = functools.partial(http.server.SimpleHTTPRequestHandler)
        with http.server.ThreadingHTTPServer(("localhost", 8000), handler) as httpd:
            print("Serving http://localhost:8000 — Ctrl+C to stop")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                pass


if __name__ == "__main__":
    main()
