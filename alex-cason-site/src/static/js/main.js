
function definePhysicsMacros() {
  if (typeof katex === "undefined") return;
  try {
    katex.__defineMacro("\\pdv", "\\frac{\\partial #1}{\\partial #2}");
    katex.__defineMacro("\\dv", "\\frac{d#1}{d#2}");
    katex.__defineMacro("\\vu", "\\hat{#1}");
    katex.__defineMacro("\\vb", "\\mathbf{#1}");
    katex.__defineMacro("\\abs", "\\left|#1\\right|");
    katex.__defineMacro("\\norm", "\\left\\|#1\\right\\|");
    katex.__defineMacro("\\bra", "\\langle #1|");
    katex.__defineMacro("\\ket", "|#1\\rangle");
    katex.__defineMacro("\\braket", "\\langle #1\\mid #2\\rangle");
    katex.__defineMacro("\\comm", "\\left[#1,#2\\right]");
    katex.__defineMacro("\\acomm", "\\left\\{#1,#2\\right\\}");
  } catch (e) {}
}

// ---------------------------------------------------------------------
// Alex Cason — site behavior
// Vanilla JS, no build step. Each render* function only runs if its
// target container exists on the current page.
// ---------------------------------------------------------------------

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function statusLabel(status) {
  return { active: "Active", progress: "In progress", planned: "Planned" }[status] || status;
}

// -- Projects -----------------------------------------------------------
function projectEra(p) {
  const era = String(p.era || p.period || "").trim().toLowerCase();
  if (["past", "completed", "done", "finished", "former", "archived"].includes(era)) return "Past";
  if (["now", "current", "present", "active", "ongoing"].includes(era)) return "Now";
  const status = String(p.status || "").trim().toLowerCase();
  if (["completed", "done", "finished", "past", "archived"].includes(status)) return "Past";
  return "Now";
}

function renderProjects() {
  const el = document.getElementById("project-grid");
  if (!el || typeof PROJECTS === "undefined") return;

  const emptyEl = document.getElementById("project-empty");
  const projects = Array.isArray(PROJECTS) ? PROJECTS : [];
  if (!projects.length) {
    el.innerHTML = "";
    if (emptyEl) emptyEl.classList.add("is-visible");
    return;
  }
  if (emptyEl) emptyEl.classList.remove("is-visible");

  const sections = ["Research", "Open Source Code", "Personal Projects", "YouTube"];

  function cardHtml(p) {
    const links = [];
    if (p.github) links.push(`<a href="${p.github}">${p.linkLabel || "Repository"} →</a>`);
    if (p.paper) links.push(`<a href="${p.paper}">Paper / docs →</a>`);
    if (p.notesLink) links.push(`<a href="${p.notesLink}">Related notes →</a>`);
    const linksHtml = links.length
      ? `<div class="card-links">${links.join("")}</div>`
      : `<div class="card-note">${p.status === "planned" ? "Not yet started publicly" : "Repository forthcoming"}</div>`;

    return `
      <article class="card">
        <div class="card-top">
          <h3>${escapeHtml(p.title || "")}</h3>
          ${p.status ? `<span class="status status--${p.status}">${statusLabel(p.status)}</span>` : ""}
        </div>
        ${p.tagline ? `<p><em>${escapeHtml(p.tagline)}</em></p>` : ""}
        <p>${escapeHtml(p.description || "")}</p>
        ${Array.isArray(p.tags) && p.tags.length ? `<div class="tags">${p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        ${linksHtml}
      </article>
    `;
  }

  const hasSections = projects.some((p) => p && (p.section || p.category));

  const eras = { Now: {}, Past: {} };
  for (const s of sections) { eras.Now[s] = []; eras.Past[s] = []; }
  const uncategorized = { Now: [], Past: [] };

  for (const p of projects) {
    if (!p || typeof p !== "object") continue;
    const era = projectEra(p);
    if (hasSections) {
      const key = p.section || p.category || sections[0];
      if (!eras[era][key]) eras[era][key] = [];
      eras[era][key].push(p);
    } else {
      uncategorized[era].push(p);
    }
  }

  const blocks = [];
  for (const era of ["Now", "Past"]) {
    if (hasSections) {
      const catBlocks = [];
      for (const s of sections) {
        const items = eras[era][s] || [];
        if (!items.length) continue;
        const cards = items.map(cardHtml).join("");
        catBlocks.push(`
          <section class="project-section">
            <header class="project-section__header">
              <h2>${escapeHtml(s)}</h2>
            </header>
            <div class="card-grid">${cards}</div>
          </section>
        `);
      }
      for (const key of Object.keys(eras[era])) {
        if (sections.includes(key)) continue;
        const items = eras[era][key] || [];
        if (!items.length) continue;
        const cards = items.map(cardHtml).join("");
        catBlocks.push(`
          <section class="project-section">
            <header class="project-section__header">
              <h2>${escapeHtml(key)}</h2>
            </header>
            <div class="card-grid">${cards}</div>
          </section>
        `);
      }
      if (!catBlocks.length) continue;
      blocks.push(`
        <section class="projects-era">
          <h2 class="projects-era__title">${era}</h2>
          ${catBlocks.join("")}
        </section>
      `);
    } else {
      const items = uncategorized[era];
      if (!items.length) continue;
      const cards = items.map(cardHtml).join("");
      blocks.push(`
        <section class="projects-era">
          <h2 class="projects-era__title">${era}</h2>
          <div class="card-grid">${cards}</div>
        </section>
      `);
    }
  }

  el.innerHTML = blocks.join("");
}

// -- Videos ---------------------------------------------------------------
function placeholderThumb(title) {
  const initials = title
    .split(/\s+/)
    .filter((w) => /[a-zA-Z]/.test(w))
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return `
    <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Video placeholder thumbnail">
      <rect width="320" height="180" fill="#1b1f27"/>
      <line x1="0" y1="60" x2="320" y2="60" stroke="#3b4c8c" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="120" x2="320" y2="120" stroke="#3b4c8c" stroke-width="1" opacity="0.5"/>
      <text x="160" y="98" fill="#e7e5da" font-family="IBM Plex Mono, monospace" font-size="30" text-anchor="middle" opacity="0.85">${escapeHtml(initials || "?")}</text>
    </svg>
  `;
}

function renderVideos() {
  const el = document.getElementById("video-grid");
  if (!el || typeof VIDEOS === "undefined") return;

  const emptyEl = document.getElementById("video-empty");
  if (emptyEl) emptyEl.classList.toggle("is-visible", VIDEOS.length === 0);

  el.innerHTML = VIDEOS.map((v) => {
    const thumb = v.thumbnail
      ? `<img src="${v.thumbnail}" alt="${escapeHtml(v.title)} thumbnail">`
      : placeholderThumb(v.title);
    const titleHtml = v.url
      ? `<a href="${v.url}">${escapeHtml(v.title)}</a>`
      : escapeHtml(v.title);
    const meta = v.url
      ? `<span class="mono-label">${v.date || "Watch on YouTube"}</span>`
      : `<span class="mono-label">Link coming soon</span>`;

    return `
      <article class="card video-card">
        <div class="video-thumb">${thumb}</div>
        <div class="video-body">
          <h3>${titleHtml}</h3>
          <p>${escapeHtml(v.description)}</p>
          ${meta}
        </div>
      </article>
    `;
  }).join("");

  const sub = document.getElementById("subscribe-link");
  if (sub) {
    if (typeof CHANNEL_URL !== "undefined" && CHANNEL_URL) {
      sub.href = CHANNEL_URL;
      sub.textContent = "Subscribe on YouTube →";
      sub.classList.remove("is-hidden");
    } else {
      sub.remove();
    }
  }
}

// -- Contact --------------------------------------------------------------
function renderContact(targetId) {
  const el = document.getElementById(targetId);
  if (!el || typeof SOCIAL_LINKS === "undefined") return;

  const present = SOCIAL_LINKS.filter((s) => s.url);
  if (!present.length) {
    el.innerHTML = `<p class="placeholder-note">Contact links will appear here once added.</p>`;
    return;
  }
  el.innerHTML = `<ul class="contact-list">${present
    .map(
      (s) => `<li><span class="label">${escapeHtml(s.label)}</span><a href="${s.url}">${escapeHtml(
        s.url.startsWith("mailto:") ? s.url.replace("mailto:", "") : s.url
      )}</a></li>`
    )
    .join("")}</ul>`;
}

// -- Notes: list, search, tag filters --------------------------------------
function renderNotes() {
  const listEl = document.getElementById("notes-list");
  if (!listEl || typeof NOTES_INDEX === "undefined") return;

  const searchInput = document.getElementById("notes-search");
  const tagWrap = document.getElementById("tag-filters");
  const emptyEl = document.getElementById("notes-empty");

  const allTags = [...new Set(NOTES_INDEX.flatMap((n) => n.tags))].sort();
  const params = new URLSearchParams(window.location.search);
  const initialTag = params.get("tag");
  const activeTags = new Set(initialTag ? [initialTag] : []);

  if (tagWrap) {
    tagWrap.innerHTML = allTags
      .map(
        (t) =>
          `<button type="button" class="tag-filter${activeTags.has(t) ? " is-active" : ""}" data-tag="${escapeHtml(
            t
          )}">${escapeHtml(t)}</button>`
      )
      .join("");
  }

  const sorted = [...NOTES_INDEX].sort((a, b) => (a.date < b.date ? 1 : -1));

  function draw() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const filtered = sorted.filter((n) => {
      const matchesTags = activeTags.size === 0 || n.tags.some((t) => activeTags.has(t));
      const haystack = (n.title + " " + n.summary + " " + n.tags.join(" ")).toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesTags && matchesQuery;
    });

    listEl.innerHTML = filtered
      .map(
        (n) => `
        <article class="note-card">
          <span class="note-date">${n.date}</span>
          <h3><a href="notes/${n.slug}.html">${escapeHtml(n.title)}</a></h3>
          <p>${escapeHtml(n.summary)}</p>
          <div class="tags">${n.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        </article>
      `
      )
      .join("");

    if (emptyEl) {
      emptyEl.classList.toggle("is-visible", filtered.length === 0);
      emptyEl.textContent = NOTES_INDEX.length === 0
        ? "No notes published yet — check back soon."
        : "No notes match that search or tag combination.";
    }
  }

  searchInput?.addEventListener("input", draw);
  tagWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-filter");
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (activeTags.has(tag)) {
      activeTags.delete(tag);
      btn.classList.remove("is-active");
    } else {
      activeTags.add(tag);
      btn.classList.add("is-active");
    }
    draw();
  });

  draw();
}

// -- KaTeX auto-render (only fires if katex + auto-render loaded) ----------
function renderMath() {
  if (typeof renderMathInElement === "undefined") return;
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
}

// -- Phase portrait dot: SMIL animation, gated on reduced-motion ----------
function initPhaseDot() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  document.querySelectorAll(".phase-portrait animateMotion").forEach((anim) => {
    try {
      anim.beginElement();
    } catch (e) {
      /* SMIL not supported — the static SVG still reads fine without it */
    }
  });
}

function enhanceNote() {
  const body = document.getElementById("note-body");
  if (!body) return;

  const headings = body.querySelectorAll("h2, h3, h4");
  headings.forEach((h, i) => {
    if (!h.id) h.id = "section-" + (i + 1);
    if (!h.querySelector(".heading-anchor")) {
      const a = document.createElement("a");
      a.className = "heading-anchor";
      a.href = "#" + h.id;
      a.textContent = "#";
      a.setAttribute("aria-label", "Link to this section");
      h.appendChild(a);
    }
  });

  const toc = document.getElementById("note-toc");
  const list = document.getElementById("note-toc-list");
  if (toc && list && headings.length >= 3) {
    toc.hidden = false;
    list.innerHTML = Array.from(headings)
      .map(
        (h) =>
          `<li class="toc-${h.tagName.toLowerCase()}"><a href="#${h.id}">${escapeHtml(
            h.textContent.replace("#", "").trim()
          )}</a></li>`
      )
      .join("");
  }

  body.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".code-copy")) return;
    const btn = document.createElement("button");
    btn.className = "code-copy";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code") || pre;
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      });
    });
    pre.style.position = "relative";
    pre.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  renderVideos();
  renderContact("contact-container");
  renderNotes();
  definePhysicsMacros();
  renderMath();
  initPhaseDot();
  enhanceNote();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
