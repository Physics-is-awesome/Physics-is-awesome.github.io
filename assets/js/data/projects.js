/**
 * Projects.
 *
 * To add a new project, append an object to this array — projects.html
 * renders the list automatically, newest first. Leave `github` or `paper`
 * as "" (empty string) until a real link exists; the button simply won't
 * render until then.
 *
 * status: "active" | "progress" | "planned"
 */
const PROJECTS = [
  {
    title: "manimacs",
    status: "active",
    tagline: "A theme-driven animation framework for physics & math video",
    description:
      "A reusable, general-purpose Python/Manim library for producing " +
      "technical physics and mathematics videos — built around a data-driven " +
      "theme system (no hard-coded colors, fonts, or spacing in any scene) " +
      "and an Emacs-inspired visual language for on-screen code, derivations, " +
      "and annotated equations. Currently through the theme system and a full " +
      "set of editor-style UI components (windows, buffers, mode lines, file " +
      "trees); typing/cursor animation and physics visualization primitives " +
      "are in active development.",
    tags: ["Scientific Computing", "Visualization", "Python"],
    github: "",
    paper: "",
    linkLabel: "Repository",
  },
  {
    title: "Symplectic Integrator Toolkit",
    status: "progress",
    tagline: "Structure-preserving integrators for Hamiltonian systems",
    description:
      "A small Python library of structure-preserving time integrators — " +
      "Störmer–Verlet, implicit midpoint, and Lie–Trotter/Strang splitting — " +
      "benchmarked against classical Runge–Kutta methods on the Kepler " +
      "problem and the Hénon–Heiles system, tracking long-time energy and " +
      "angular-momentum drift rather than single-step accuracy.",
    tags: ["Symplectic Integration", "Hamiltonian Mechanics", "Numerical Methods"],
    github: "",
    paper: "",
    linkLabel: "Repository",
  },
  {
    title: "Electrostatic PIC Solver",
    status: "planned",
    tagline: "1D–1V particle-in-cell solver for the Vlasov–Poisson system",
    description:
      "A planned electrostatic particle-in-cell (PIC) solver for a " +
      "one-dimensional, one-velocity plasma, aimed at comparing standard " +
      "leapfrog particle pushers against energy-conserving discretizations " +
      "of the Vlasov–Poisson system.",
    tags: ["Plasma Physics", "Particle-in-Cell", "Scientific Computing"],
    github: "",
    paper: "",
    linkLabel: "Repository",
  },
  {
    title: "Metriplectic Dynamics — Notes & Simulations",
    status: "progress",
    tagline: "Working notes on GENERIC / metriplectic formulations",
    description:
      "An evolving set of derivations and small simulations exploring " +
      "metriplectic (GENERIC) formulations of dissipative Hamiltonian " +
      "systems — how a reversible Poisson bracket and an irreversible " +
      "metric bracket combine to drive a system toward equilibrium.",
    tags: ["Metriplectic Dynamics", "Mathematical Physics"],
    github: "",
    paper: "",
    notesLink: "notes.html?tag=Metriplectic%20Dynamics",
    linkLabel: "Repository",
  },
];
