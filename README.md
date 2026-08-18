# alexcason.dev — personal site

A static personal/research site. No build step, no framework, no
dependencies to install — plain HTML, CSS, and vanilla JS, so it can be
hosted for free on GitHub Pages exactly as-is.

## Deploying on GitHub Pages (free)

1. Create a new GitHub repository (e.g. `alex-cason.github.io` for a
   root-domain-style URL, or any name for `username.github.io/repo-name`).
2. Push the contents of this folder to the repository's default branch:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. In the repo on GitHub: **Settings → Pages → Source → Deploy from a
   branch**, pick `main` and the root folder (`/`), save.
4. The site goes live at `https://<your-username>.github.io/<repo-name>/`
   (or `https://<your-username>.github.io/` if you used the special
   `username.github.io` repo name) within a minute or two.

The `.nojekyll` file in this folder tells GitHub Pages to serve the files
exactly as they are, with no Jekyll processing — keeps things simple and
predictable.

## Editing content

Nothing here requires touching HTML structure to add routine content —
each section reads from a small JS data file:

| To add...           | Edit this file                              |
|----------------------|---------------------------------------------|
| A project            | `assets/js/data/projects.js`                |
| A note               | `notes-index.js` **and** add a page in `notes/` (copy an existing one as a template) |
| A video              | `assets/js/data/videos.js`                  |
| Contact links        | `assets/js/data/social-links.js`            |

Each file has comments explaining the exact fields. Links (GitHub repo,
paper, channel URL, contact links) only render once you fill them in —
leaving a field as `""` simply hides that link, it never shows a broken
one.

### Adding a new note

1. Copy any file in `notes/` as a starting template.
2. Write the note — KaTeX (`\( ... \)` inline, `\[ ... \]` display), code
   blocks (`<pre><code>`), figures (`<figure><img>/<svg></figure>`), and a
   references list are already wired up and styled; just follow the
   existing structure.
3. Add a matching entry to `assets/js/data/notes-index.js` with the same
   `slug` as the filename (no `.html`). It will appear on the Notes index
   automatically, with search and tag filtering.

### CV

Drop a PDF at `assets/cv/alex-cason-cv.pdf` and update the link on
`cv.html` (a comment there shows exactly what to change).

## Structure

```
index.html          Home
research.html        Research interests
projects.html         Projects (data-driven grid)
notes.html            Notes index (search + tags)
notes/*.html           Individual notes
youtube.html           YouTube channel + videos (data-driven)
about.html             About + Contact
cv.html                 CV placeholder
assets/css/style.css    Design system (all colors/type as CSS variables)
assets/js/main.js        Rendering logic + KaTeX trigger
assets/js/data/*.js       Editable content
```

Math rendering is via [KaTeX](https://katex.org/) (CDN, auto-rendered on
page load). No build tooling required for any of it.
