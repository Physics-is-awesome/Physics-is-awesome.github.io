#!/usr/bin/env python3
"""
Build script for alexcason.dev.
"""

import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
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


def escape_html(s: str) -> str:
    if s is None:
        return ""
    s = str(s)
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


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
            f"missing {PANDOC_META_TEMPLATE.relative_to(ROOT)} — this ships with the repo"
        )

    meta_out = subprocess.run(
        [
            "pandoc",
            str(path),
            "-f",
            "latex",
            "-s",
            "-t",
            "html",
            "--template",
            str(PANDOC_META_TEMPLATE),
        ],
        capture_output=True,
        text=True,
    )
    title, _, date_part = meta_out.stdout.partition("@@@DATE@@@")
    title = title.strip() or slug.replace("-", " ").title()
    note_date = date_part.strip()

    body_out = subprocess.run(
        ["pandoc", str(path), "-f", "latex", "-t", "html", "--mathjax"],
        capture_output=True,
        text=True,
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
# Data loading
# ---------------------------------------------------------------------
def load_projects() -> list:
    path = SRC / "data" / "projects.yaml"
    data = yaml.safe_load(path.read_text()) or []
    return data if isinstance(data, list) else []


def load_videos_doc() -> dict:
    path = SRC / "data" / "videos.yaml"
    data = yaml.safe_load(path.read_text()) or {}
    return data if isinstance(data, dict) else {}


def load_social_links() -> dict:
    path = SRC / "data" / "social-links.yaml"
    data = yaml.safe_load(path.read_text()) or {}
    return data if isinstance(data, dict) else {}


# ---------------------------------------------------------------------
# HTML rendering (server-side)
# ---------------------------------------------------------------------
def status_label(status: str) -> str:
    return {
        "active": "Active",
        "progress": "In progress",
        "planned": "Planned",
        "completed": "Completed",
        "done": "Done",
    }.get(status or "", status or "")


def project_era(p: dict) -> str:
    """Whether a project belongs to the 'Now' or 'Past' group."""
    era = (p.get("era") or p.get("period") or "").strip().lower()
    if era in {"past", "completed", "done", "finished", "former", "archived"}:
        return "Past"
    if era in {"now", "current", "present", "active", "ongoing"}:
        return "Now"
    status = (p.get("status") or "").strip().lower()
    if status in {"completed", "done", "finished", "past", "archived"}:
        return "Past"
    return "Now"


def render_projects_html(projects: list) -> str:
    if not projects:
        return ""

    sections_order = ["Research", "Open Source Code", "Personal Projects", "YouTube"]
    projects = projects if isinstance(projects, list) else []

    has_sections = any(p and (p.get("section") or p.get("category")) for p in projects)

    def card_html(p: dict) -> str:
        links = []
        if p.get("github"):
            label = p.get("linkLabel") or "Repository"
            links.append(
                f'<a href="{escape_html(p["github"])}">{escape_html(label)} →</a>'
            )
        if p.get("paper"):
            links.append(
                f'<a href="{escape_html(p["paper"])}">Paper / docs →</a>'
            )
        if p.get("notesLink"):
            links.append(
                f'<a href="{escape_html(p["notesLink"])}">Related notes →</a>'
            )
        if links:
            links_html = '<div class="card-links">' + "".join(links) + "</div>"
        else:
            if p.get("status") == "planned":
                note = "Not yet started publicly"
            else:
                note = "Repository forthcoming"
            links_html = f'<div class="card-note">{escape_html(note)}</div>'

        status_html = ""
        if p.get("status"):
            status_html = f'<span class="status status--{escape_html(p["status"])}">{escape_html(status_label(p["status"]))}</span>'

        tagline_html = ""
        if p.get("tagline"):
            tagline_html = f"<p><em>{escape_html(p['tagline'])}</em></p>"

        desc_html = f"<p>{escape_html(p.get('description') or '')}</p>"

        tags_html = ""
        tags = p.get("tags") or []
        if isinstance(tags, list) and tags:
            tag_spans = "".join(
                f'<span class="tag">{escape_html(t)}</span>' for t in tags
            )
            tags_html = f'<div class="tags">{tag_spans}</div>'

        return f"""              <article class="card">
                <div class="card-top">
                  <h3>{escape_html(p.get('title') or '')}</h3>
                  {status_html}
                </div>
                {tagline_html}
                {desc_html}
                {tags_html}
                {links_html}
              </article>"""

    def category_block(title: str, items: list) -> str:
        cards = [card_html(p) for p in items if isinstance(p, dict)]
        return f"""          <section class="project-section">
            <header class="project-section__header">
              <h2>{escape_html(title)}</h2>
            </header>
            <div class="card-grid">
{chr(10).join(cards)}
            </div>
          </section>"""

    eras = {"Now": {s: [] for s in sections_order}, "Past": {s: [] for s in sections_order}}
    uncategorized = {"Now": [], "Past": []}

    if has_sections:
        for p in projects:
            if not isinstance(p, dict):
                continue
            era = project_era(p)
            key = p.get("section") or p.get("category") or sections_order[0]
            if key not in sections_order:
                if key not in eras[era]:
                    eras[era][key] = []
                eras[era][key].append(p)
            else:
                eras[era][key].append(p)
    else:
        for p in projects:
            if not isinstance(p, dict):
                continue
            uncategorized[project_era(p)].append(p)

    era_blocks = []
    for era in ("Now", "Past"):
        if has_sections:
            cat_blocks = []
            for s in sections_order:
                items = eras[era].get(s) or []
                if items:
                    cat_blocks.append(category_block(s, items))
            # any extra sections
            for key, items in eras[era].items():
                if key in sections_order or not items:
                    continue
                cat_blocks.append(category_block(key, items))
            if not cat_blocks:
                continue
            era_blocks.append(
                f"""      <section class="projects-era">
        <h2 class="projects-era__title">{era}</h2>
{chr(10).join(cat_blocks)}
      </section>"""
            )
        else:
            items = uncategorized[era]
            if not items:
                continue
            cards = [card_html(p) for p in items]
            era_blocks.append(
                f"""      <section class="projects-era">
        <h2 class="projects-era__title">{era}</h2>
        <div class="card-grid">
{chr(10).join(cards)}
        </div>
      </section>"""
            )

    return "\n".join(era_blocks)


def placeholder_thumb_svg(title: str) -> str:
    initials = ""
    for w in title.split():
        if re.search(r"[a-zA-Z]", w):
            initials += w[0]
        if len(initials) >= 3:
            break
    initials = initials.upper() or "?"
    return f"""    <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Video placeholder thumbnail">
      <rect width="320" height="180" fill="#1b1f27"/>
      <line x1="0" y1="60" x2="320" y2="60" stroke="#3b4c8c" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="120" x2="320" y2="120" stroke="#3b4c8c" stroke-width="1" opacity="0.5"/>
      <text x="160" y="98" fill="#e7e5da" font-family="IBM Plex Mono, monospace" font-size="30" text-anchor="middle" opacity="0.85">{escape_html(initials)}</text>
    </svg>"""


def render_videos_html(videos_doc: dict) -> str:
    videos = videos_doc.get("videos") if isinstance(videos_doc, dict) else []
    channel_url = videos_doc.get("channel_url") if isinstance(videos_doc, dict) else ""
    videos = videos if isinstance(videos, list) else []
    if not videos:
        return ""

    cards = []
    for v in videos:
        if not isinstance(v, dict):
            continue
        title = v.get("title") or ""
        desc = v.get("description") or ""
        url = v.get("url") or ""
        thumb = v.get("thumbnail") or ""
        date = v.get("date") or ""

        if thumb:
            thumb_html = f'<img src="{escape_html(thumb)}" alt="{escape_html(title)} thumbnail">'
        else:
            thumb_html = placeholder_thumb_svg(title)

        if url:
            title_html = f'<a href="{escape_html(url)}">{escape_html(title)}</a>'
            meta_html = f'<span class="mono-label">{escape_html(date) if date else "Watch on YouTube"}</span>'
        else:
            title_html = escape_html(title)
            meta_html = '<span class="mono-label">Link coming soon</span>'

        cards.append(
            f"""      <article class="card video-card">
        <div class="video-thumb">{thumb_html}</div>
        <div class="video-body">
          <h3>{title_html}</h3>
          <p>{escape_html(desc)}</p>
          {meta_html}
        </div>
      </article>"""
        )
    html = '<div id="video-grid" class="card-grid">\n' + "\n".join(cards) + "\n    </div>"
    if channel_url:
        html += f'\n    <p class="lede" style="margin-top:1rem;"><a id="subscribe-link" href="{escape_html(channel_url)}">Subscribe on YouTube →</a></p>'
    return html


def render_notes_index_html(notes_index: list) -> str:
    if not notes_index:
        return ""
    sorted_notes = sorted(
        notes_index, key=lambda n: n.get("date", ""), reverse=True
    )
    cards = []
    for n in sorted_notes:
        slug = n.get("slug") or ""
        title = n.get("title") or slug
        date = n.get("date") or ""
        summary = n.get("summary") or ""
        tags = n.get("tags") or []
        if not isinstance(tags, list):
            tags = []
        tags_html = "".join(
            f'<span class="tag">{escape_html(t)}</span>' for t in tags
        )
        cards.append(
            f"""    <article class="note-card">
      <span class="note-date">{escape_html(date)}</span>
      <h3><a href="notes/{escape_html(slug)}.html">{escape_html(title)}</a></h3>
      <p>{escape_html(summary)}</p>
      <div class="tags">{tags_html}</div>
    </article>"""
        )
    return "\n".join(cards)


def render_social_html(social: dict) -> str:
    social = social if isinstance(social, dict) else {}
    entries = [
        ("email", "Email"),
        ("github", "GitHub"),
        ("youtube", "YouTube"),
        ("linkedin", "LinkedIn"),
        ("scholar", "Google Scholar"),
        ("orcid", "ORCID"),
    ]
    present = []
    for key, label in entries:
        url = social.get(key) or ""
        if url:
            present.append((label, url))
    if not present:
        return '<p class="placeholder-note">Contact links will appear here once added.</p>'
    items = []
    for label, url in present:
        if url.startswith("mailto:"):
            display = url.replace("mailto:", "")
        else:
            display = url
        items.append(
            f'<li><span class="label">{escape_html(label)}</span><a href="{escape_html(url)}">{escape_html(display)}</a></li>'
        )
    return '<ul class="contact-list">' + "".join(items) + "</ul>"


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
        log(
            f"WARNING: {len(tex_files)} .tex note(s) found but pandoc is not installed — "
            f"skipping them."
        )
        tex_files = []

    for path in md_files:
        note = load_markdown_note(path)
        html = template.render(root="../", active="notes", year=datetime.now().year, **note)
        (out_dir / f"{note['slug']}.html").write_text(html, encoding="utf-8")
        index.append(note)
        log(f"note (md):  {path.name} -> notes/{note['slug']}.html")

    for path in tex_files:
        note = load_tex_note(path)
        html = template.render(root="../", active="notes", year=datetime.now().year, **note)
        (out_dir / f"{note['slug']}.html").write_text(html, encoding="utf-8")
        index.append(note)
        log(f"note (tex): {path.name} -> notes/{note['slug']}.html")

    index.sort(key=lambda n: n.get("date", ""), reverse=True)
    return index


def build_pages(env, social_html: str = ""):
    pages_src = SRC / "content" / "pages"
    for path in sorted(pages_src.glob("*.md")):
        if not is_published(path):
            continue
        post = frontmatter.load(path)
        meta = post.metadata
        slug = slugify_from_path(path)
        show_contact = bool(meta.get("show_contact", False))
        html = env.get_template("prose.html").render(
            root="",
            active=slug,
            year=datetime.now().year,
            title=meta.get("title", slug.title()),
            eyebrow=meta.get("eyebrow", ""),
            description=meta.get("description", ""),
            show_contact=show_contact,
            contact_html=social_html if show_contact else "",
            body_html=render_markdown(post.content),
        )
        (DIST / f"{slug}.html").write_text(html, encoding="utf-8")
        log(f"page: {path.name} -> {slug}.html")


def build_simple_templates(env, projects_html: str, videos_html: str, notes_list_html: str):
    html = env.get_template("home.html").render(root="", active="home", year=datetime.now().year)
    (DIST / "index.html").write_text(html, encoding="utf-8")
    log("page: home.html -> index.html")

    html = env.get_template("research.html").render(root="", active="research", year=datetime.now().year)
    (DIST / "research.html").write_text(html, encoding="utf-8")
    log("page: research.html -> research.html")

    html = env.get_template("projects.html").render(
        root="", active="projects", year=datetime.now().year, projects_html=projects_html
    )
    (DIST / "projects.html").write_text(html, encoding="utf-8")
    log("page: projects.html -> projects.html")

    html = env.get_template("notes-index.html").render(
        root="", active="notes", year=datetime.now().year, notes_list_html=notes_list_html
    )
    (DIST / "notes.html").write_text(html, encoding="utf-8")
    log("page: notes-index.html -> notes.html")

    html = env.get_template("youtube.html").render(
        root="", active="youtube", year=datetime.now().year, videos_html=videos_html
    )
    (DIST / "youtube.html").write_text(html, encoding="utf-8")
    log("page: youtube.html -> youtube.html")

    html404 = env.get_template("404.html").render(root="", active="", year=datetime.now().year)
    (DIST / "404.html").write_text(html404, encoding="utf-8")
    log("page: 404.html -> 404.html")


def build_data_scripts(notes_index: list):
    data_dir = DIST / "assets" / "js" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    projects = load_projects()
    videos_doc = load_videos_doc()
    social = load_social_links()

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
            ("email", "Email"),
            ("github", "GitHub"),
            ("youtube", "YouTube"),
            ("linkedin", "LinkedIn"),
            ("scholar", "Google Scholar"),
            ("orcid", "ORCID"),
        ]
    ]
    (data_dir / "social-links.js").write_text(
        "const SOCIAL_LINKS = " + json.dumps(social_list, indent=2) + ";\n",
        encoding="utf-8",
    )

    note_summaries = [
        {
            "slug": n["slug"],
            "title": n["title"],
            "summary": n["summary"],
            "tags": n["tags"],
            "date": n["date"],
        }
        for n in notes_index
    ]
    (data_dir / "notes-index.js").write_text(
        "const NOTES_INDEX = " + json.dumps(note_summaries, indent=2) + ";\n",
        encoding="utf-8",
    )
    log(
        f"data: projects.js, videos.js, social-links.js, notes-index.js "
        f"({len(projects)} projects, {len(notes_index)} notes)"
    )


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
    sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    sitemap += [f"  <url><loc>{u}</loc></url>" for u in urls]
    sitemap.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (DIST / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n",
        encoding="utf-8",
    )
    log("seo: sitemap.xml, robots.txt")


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
        autoescape=True,
    )

    print("Building alexcason.dev ...")
    notes_index = build_notes(env, DIST / "notes")

    projects = load_projects()
    videos_doc = load_videos_doc()
    social = load_social_links()

    projects_html = render_projects_html(projects)
    videos_html = render_videos_html(videos_doc)
    notes_list_html = render_notes_index_html(notes_index)
    social_html = render_social_html(social)

    build_pages(env, social_html=social_html)
    build_simple_templates(env, projects_html, videos_html, notes_list_html)
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
