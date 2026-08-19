---
title: Note Title Goes Here
date: 2026-01-01
tags: [Tag One, Tag Two]
summary: One or two sentences describing the note — shown on the notes index.
---

Ordinary prose goes here, in plain Markdown: **bold**, *italic*, and
[links](https://example.com) all work as usual.

## A section heading

Inline math like $\dot q = \partial H/\partial p$ works, and so does display
math:

$$
H(q, p) = \frac{p^2}{2m} + V(q)
$$

A code block:

```python
def euler_step(q, p, dt):
    return q + dt * p, p - dt * dq_of(q)
```

A figure — either an inline SVG or an image:

<figure>
  <img src="../assets/img/your-figure.svg" alt="Description of the figure for screen readers">
  <figcaption>Figure 1. A caption explaining what the figure shows.</figcaption>
</figure>

## References

1. Author, *Title*, Publisher, Year.
2. Author, *Title*, Publisher, Year.

<!--
To publish this note:
  1. Copy this file to a new name, e.g. my-new-note.md (the filename
     becomes the URL: notes/my-new-note.html).
  2. Edit the front matter and body above.
  3. Rebuild — it will appear on the Notes index automatically, with
     search and tag filtering, sorted by date.

Files starting with an underscore (like this one) are never published —
that's what keeps this safe to leave in place as a template.
-->
