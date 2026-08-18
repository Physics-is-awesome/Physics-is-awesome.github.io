/**
 * Notes index.
 *
 * To publish a new note:
 *   1. Copy an existing file in /notes/ as a template.
 *   2. Write the note (KaTeX, code blocks, figures, references all supported —
 *      see the template comments in any existing note for the exact markup).
 *   3. Add one entry here with a matching `slug` (the .html filename, no extension).
 *
 * notes.html reads this file to render the list, and to power search + tag
 * filtering — you don't need to touch notes.html itself.
 */
const NOTES_INDEX = [
  {
    slug: "hamiltons-equations-action-principle",
    title: "Hamilton's Equations from the Action Principle",
    summary:
      "Deriving the canonical equations of motion from stationary action, " +
      "and reading off the symplectic structure they preserve.",
    tags: ["Mathematical Physics", "Hamiltonian Mechanics"],
    date: "2026-02-14",
  },
  {
    slug: "symplectic-integrators-energy-conservation",
    title: "Why Symplectic Integrators Conserve Energy (on Average)",
    summary:
      "A leapfrog integrator, a backward error analysis argument, and a " +
      "plot of why the energy error stays bounded instead of drifting.",
    tags: ["Numerical Methods", "Symplectic Integration", "Computational Physics"],
    date: "2026-03-02",
  },
  {
    slug: "vlasov-poisson-notes",
    title: "Notes on the Vlasov–Poisson System",
    summary:
      "Working through the collisionless Vlasov equation coupled to Poisson's " +
      "equation, and what a particle-in-cell discretization actually does to it.",
    tags: ["Plasma Physics", "Mathematical Physics"],
    date: "2026-04-19",
  },
];
