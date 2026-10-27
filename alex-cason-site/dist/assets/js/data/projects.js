const PROJECTS = [
  {
    "section": "Research",
    "title": "CCSN Gravitational-Wave Memory Analysis for Next-Generation Detectors",
    "status": "progress",
    "tagline": "Characterizing GW memory from core-collapse supernovae",
    "description": "Analysis of gravitational-wave memory from core-collapse supernovae (CCSNe), with an emphasis on its characterization and potential detectability using next-generation gravitational-wave detectors.",
    "tags": [
      "Gravitational Waves",
      "Core-Collapse Supernovae",
      "GW Memory",
      "Next-Generation Detectors"
    ],
    "github": "",
    "paper": ""
  },
  {
    "section": "Open Source Code",
    "title": "GeometricIntegrators.jl \u2014 Developer Documentation",
    "status": "progress",
    "tagline": "Improving docs for geometric numerical integration in Julia",
    "description": "Contribution to the developer documentation of GeometricIntegrators.jl, an open-source Julia library for geometric numerical integration, with a focus on improving documentation structure, navigation, and developer guidance.",
    "tags": [
      "Julia",
      "Geometric Integration",
      "Documentation",
      "Open Source"
    ],
    "github": "",
    "paper": ""
  },
  {
    "section": "Open Source Code",
    "title": "GeometricIntegrators.jl \u2014 Hamiltonian-(finish)",
    "status": "planned",
    "tagline": "Devloping Geometric numerical integrator",
    "description": "(finish later)",
    "tags": [
      "Julia",
      "Geometric Integration",
      "numerics",
      "Open Source"
    ],
    "github": "",
    "paper": null
  },
  {
    "section": "Open Source Code",
    "title": "PlasmaPy \u2014 GEMPIC",
    "status": "planned",
    "tagline": "Devloping Geometric Electromagnetic Particle in Cell",
    "description": "(finish later)",
    "tags": [
      "python",
      "plasma",
      "Geometric Integration",
      "numerics",
      "Open Source"
    ],
    "github": "",
    "paper": null
  },
  {
    "section": "YouTube",
    "title": "Metriplectic series 1: Why Ordinary Hamiltonians are non-dissipative",
    "status": "active",
    "tagline": "Hamiltonian (symplectic) systems cannot describe dissipation",
    "description": "First in a series on metriplectic dynamics, starting from why ordinary Hamiltonian systems cannot describe dissipation in order to motivate the metriplectic system.",
    "tags": [
      "Metriplectic",
      "Hamiltonian",
      "Symplectic",
      "Dissipation",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=WF8mm-Z2oQM",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "What is Velocity really? (joke video)",
    "status": "active",
    "tagline": "An obtuse mathematical abstraction",
    "description": "A joke video asking what velocity really is, using obtuse mathematical abstraction.",
    "tags": [
      "Joke",
      "Mathematics",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=K4NQshgqGrM",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "Introduction to Discontinuous Galerkin through Toy Core Collapse Supernova",
    "status": "active",
    "tagline": "DG methods applied to a toy self-gravitating fluid",
    "description": "An introduction to discontinuous Galerkin methods, using a toy model of a self-gravitating fluid. Expanding even more by conserving energy as well as positivity.",
    "tags": [
      "Discontinuous Galerkin",
      "Hydrodynamics",
      "Core Collapse",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=8vs1dTuPKFw",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "Lie Operator Splitting: One of the Ten Pillars",
    "status": "active",
    "tagline": "Introduction to Lie operator splitting in numerical methods",
    "description": "A look at Lie operator splitting, framed as one of 'ten pillars.'",
    "tags": [
      "Operator Splitting",
      "Numerical Methods",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=qgA-iY-iA4k",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "Building Hyper Efficient Solar System Model: WHCKL",
    "status": "active",
    "tagline": "Long-time integration of a reduced solar system",
    "description": "Building a highly efficient solar system model using WHCKL. Able to simulate a reduced solar system for two billion years.",
    "tags": [
      "N-body",
      "Symplectic Integration",
      "WHCKL",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=bRJSR83mbBw",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "What if you exert a Planck Force onto the Earth?",
    "status": "active",
    "tagline": "TOV + Einstein Toolkit thought experiment",
    "description": "Simulating a Planck force onto a TOV simulation of the Earth, or a close enough approximation, using the Einstein Toolkit. Then, trying to abstract out to see if one could destroy a universe.",
    "tags": [
      "General Relativity",
      "TOV",
      "Einstein Toolkit",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=T1Wavd506Do",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "Variational Integrators for Reduced Magnetohydrodynamics",
    "status": "active",
    "tagline": "Structure-preserving integrators for RMHD",
    "description": "Deriving variational integrators applied to reduced magnetohydrodynamics.",
    "tags": [
      "Variational Integrators",
      "RMHD",
      "Structure-Preserving",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=9vPSSewfwI4",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "YouTube",
    "title": "Introduction to Symplectic integrators",
    "status": "active",
    "tagline": "Foundations of symplectic integration",
    "description": "An introduction to symplectic integrators.",
    "tags": [
      "Symplectic Integration",
      "Numerical Methods",
      "YouTube"
    ],
    "github": "",
    "paper": "https://www.youtube.com/watch?v=yYiiJV7aWlY",
    "linkLabel": "Watch on YouTube"
  },
  {
    "section": "Personal Projects",
    "title": "BSSNOK Solver",
    "status": "progress",
    "tagline": "Numerical relativity for black-hole spacetimes",
    "description": "Development of a numerical relativity solver implementing the Baumgarte\u2013Shapiro\u2013Shibata\u2013Nakamura (BSSNOK) formulation for evolving black-hole spacetimes.",
    "tags": [
      "Numerical Relativity",
      "Computational Physics",
      "Scientific Computing",
      "BSSNOK",
      "Black Holes"
    ],
    "github": "",
    "paper": ""
  }
];
