# alexcason.dev — personal site
 
A static personal/research site, built from small templates and content
files rather than hand-edited HTML. A short Python script (`build.py`)
assembles everything into `dist/`, a plain static site with no framework
and no client-side build step — it hosts for free on GitHub Pages.

You never edit `dist/` directly — it's regenerated from `src/` every time.

## How it's organized

```
src/
  templates/        Jinja2 templates. base.html holds the header, nav, and
                      footer — every other template extends it, so that
                      markup exists in exactly one place.
  content/
    pages/            About, CV — plain Markdown with a little YAML front
                        matter (title, etc.) at the top of each file.
    notes/             Notes — Markdown (.md) or LaTeX (.tex), one file
                        per note. This is where you'll spend the most time.
  data/               projects.yaml, videos.yaml, social-links.yaml — the
                        content behind the Projects/YouTube/Contact pages.
  static/              CSS, JS, images — copied through unchanged.
build.py               The generator. Reads everything above, writes dist/.
requirements.txt         Python dependencies for build.py.
.github/workflows/       GitHub Actions: builds and deploys automatically
                          on every push to main.
```

Research, Projects, and Notes were deliberately left empty as scaffolds —
see "What's a placeholder right now" below.

## Building locally

```bash
pip install -r requirements.txt
python build.py            # writes dist/
python build.py --serve    # writes dist/, then serves it at localhost:8000
```

LaTeX notes additionally require [pandoc](https://pandoc.org/installing.html)
(`apt install pandoc`, `brew install pandoc`, etc.) to be on your PATH.
Markdown notes don't need it. If pandoc isn't installed, `.tex` notes are
skipped with a warning rather than breaking the build.

## Deploying on GitHub Pages (free, automatic)

1. Create a GitHub repository and push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. In the repo on GitHub: **Settings → Pages → Source**, choose
   **GitHub Actions**.
3. That's it. The workflow in `.github/workflows/deploy.yml` runs on every
   push to `main` — it installs pandoc + the Python dependencies, runs
   `build.py`, and publishes `dist/` to Pages. `dist/` itself is
   `.gitignore`d; you never commit generated output, only source.

You don't need to run `build.py` yourself to deploy — push Markdown/YAML
changes and the site rebuilds itself. Running it locally is just for
previewing before you push.

### Fallback: deploying without GitHub Actions

If you'd rather not use Actions, run `python build.py` locally, then
commit the contents of `dist/` to a branch (e.g. `gh-pages`) or a `/docs`
folder on `main`, and point **Settings → Pages → Source** at that instead.
You'd need to repeat this by hand after every content change.

## Adding content

### A note (the main way this site grows)

Copy a template and edit it — either works, use whichever you already
have:

- **Markdown**: copy `src/content/notes/_template.md` to
  `your-note-slug.md`. Front matter at the top (`title`, `date`, `tags`,
  `summary`) plus the body below. Math as `$...$` / `$$...$$`, code as
  fenced ```` ```python ```` blocks, figures as `<figure><img>...</figure>`.
- **LaTeX**: copy `src/content/notes/_template.tex` to
  `your-note-slug.tex`. This is for importing notes you've already
  written in LaTeX — most existing `.tex` files (sections, equations,
  `\newcommand` macros, figures, itemize/enumerate, verbatim blocks) will
  convert as-is. `\title{}` and `\date{}` are read automatically; add
  `% tags: ...` and `% summary: ...` comment lines at the very top for
  the two pieces of metadata LaTeX has no standard command for. LaTeX
  `\label`/`\ref` cross-references aren't resolved — write those as plain
  text instead.

Either way, the filename (minus extension) becomes the URL —
`hamiltons-equations.md` → `notes/hamiltons-equations.html` — and the note
appears on the Notes index automatically after a rebuild, with search and
tag filtering already working. Files starting with `_` (like the two
templates) are never published, so they're safe to leave in place.

### A project or video

Edit `src/data/projects.yaml` or `src/data/videos.yaml` — each has a
commented example entry showing the schema. Leave a `github`/`paper`/`url`
field as `""` until a real link exists; it won't render a broken link,
it just won't show that button yet.

### Contact links

Edit `src/data/social-links.yaml`. Same rule — empty means hidden, not
broken.

### Research page

`src/templates/research.html` is currently just a placeholder line and a
commented-out example of the pattern (a "cluster": a heading, a paragraph,
an optional equation, and a row of topic tags). Copy that block, edit it,
delete the placeholder paragraph.

### CV

Drop a PDF at `src/static/cv/your-cv.pdf`, then edit
`src/content/pages/cv.md` — it has the exact line to uncomment.

## What's a placeholder right now

- **Research** — empty scaffold, ready for you to fill in (see above).
- **Projects** — `src/data/projects.yaml` is empty; the page shows an
  honest "no projects listed yet" message until you add some.
- **Notes** — no notes exist yet; same honest empty-state message.
- **About** — left blank per request (`src/content/pages/about.md`).
- **Contact / CV** — all fields empty; nothing renders until you fill
  them in.
- **`sitemap.xml`/`robots.txt`** — generated with `https://example.com`
  as a placeholder domain. Update the domain in `build_seo_files()` in
  `build.py` once you know your real URL (custom domain or
  `*.github.io`).

## Design system

Colors, type, and spacing are all CSS custom properties at the top of
`src/static/css/style.css` — change a value there and it propagates
everywhere. Fonts: Spectral (headings), Source Serif 4 (body), IBM Plex
Sans (navigation/UI), IBM Plex Mono (code). Math is rendered client-side
by [KaTeX](https://katex.org/) (CDN, loaded on every page).
