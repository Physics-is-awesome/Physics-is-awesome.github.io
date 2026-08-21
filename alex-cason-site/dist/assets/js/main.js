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
function renderProjects() {
  const el = document.getElementById("project-grid");
  if (!el || typeof PROJECTS === "undefined") return;

  const emptyEl = document.getElementById("project-empty");
  if (!PROJECTS.length) {
    el.innerHTML = "";
    if (emptyEl) emptyEl.classList.add("is-visible");
    return;
  }
  if (emptyEl) emptyEl.classList.remove("is-visible");

  el.innerHTML = PROJECTS.map((p) => {
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
          <h3>${escapeHtml(p.title)}</h3>
          <span class="status status--${p.status}">${statusLabel(p.status)}</span>
        </div>
        <p><em>${escapeHtml(p.tagline)}</em></p>
        <p>${escapeHtml(p.description)}</p>
        <div class="tags">${p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        ${linksHtml}
      </article>
    `;
  }).join("");
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

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  renderVideos();
  renderContact("contact-container");
  renderNotes();
  renderMath();
  initPhaseDot();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
