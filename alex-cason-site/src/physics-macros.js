window.MathJax = {
  tex: {
    packages: {'[+]': ['physics']},
    macros: {
      pdv: ["\\frac{\\partial #1}{\\partial #2}", 2],
      dv: ["\\frac{d#1}{d#2}", 2],
      vu: ["\\hat{#1}", 1],
      vb: ["\\mathbf{#1}", 1],
      grad: ["\\nabla"],
      div: ["\\nabla\\cdot"],
      curl: ["\\nabla\\times"],
      bra: ["\\langle #1|", 1],
      ket: ["|#1\\rangle", 1],
      braket: ["\\langle #1|#2\\rangle", 2]
    }
  }
};
