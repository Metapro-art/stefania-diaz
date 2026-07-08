/* ============================================================================
   Interventions by type — Stefania Díaz portfolio
   Data-driven: main.js renders one folder card per entry; clicking opens a modal
   with a before/after slider per project (or a "coming soon" state if empty).

   HOW TO ADD A PROJECT
   ---------------------------------------------------------------------------
   Single pair:
     { before:'path/antes.jpg', after:'path/despues.jpg', aspect:'3/4',
       title:'Proyecto N', desc:'' }
   Multiple pairs per project (anverso + reverso, etc.):
     { title:'Proyecto N', desc:'', aspect:'3/4', pairs:[
       { before:'path/a-antes.jpg', after:'path/a-despues.jpg' },
       { before:'path/b-antes.jpg', after:'path/b-despues.jpg' }
     ]}
   `img` → empty-state modal background. `icon_rest/hover` → card states.
   aspect → CSS aspect-ratio for the .ba slider container. Both images in a
   pair MUST share the same pixel dimensions (centre-cropped at build time).
============================================================================ */
window.INTERVENCIONES = {
  lienzoMadera: {
    title_key:  "interv.t1",
    img:        "assets/img/intervenciones/iconos/icon-pintura-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-pintura-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-pintura-color.jpg",
    projects: [
      /* PL&M/1 — Paisaje con rebaño · 2 pares (frente + bastidor) */
      { title: "Proyecto 1", desc: "", aspect: "4/3", pairs: [
        { before: "assets/img/intervenciones/lienzoMadera/p1/a-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p1/a-despues.jpg" },
        { before: "assets/img/intervenciones/lienzoMadera/p1/b-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p1/b-despues.jpg" }
      ]},
      /* PL&M/2 — Paisaje nocturno lunar */
      { title: "Proyecto 2", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/lienzoMadera/p2/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p2/despues.jpg" },
      /* PL&M/3 — Detalle microscópico reparación de tela */
      { title: "Proyecto 3", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/lienzoMadera/p3/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p3/despues.jpg" },
      /* PL&M/4 — S. Juan Nepomuceno Mártir · 2 pares (frente + reverso) */
      { title: "Proyecto 4", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/lienzoMadera/p4/a-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p4/a-despues.jpg" },
        { before: "assets/img/intervenciones/lienzoMadera/p4/b-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p4/b-despues.jpg" }
      ]},
      /* PL&M/5 — Pequeño paisaje (A. Páramo) */
      { title: "Proyecto 5", desc: "", aspect: "4/3",
        before: "assets/img/intervenciones/lienzoMadera/p5/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p5/despues.jpg" },
      /* PL&M/6 — Paisaje de niebla (con marco → sin marco) */
      { title: "Proyecto 6", desc: "En preparación", aspect: "3/2",
        before: "assets/img/intervenciones/lienzoMadera/p6/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p6/despues.jpg" }
    ]
  },
  escultura: {
    title_key:  "interv.t2",
    img:        "assets/img/intervenciones/iconos/icon-escultura-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-escultura-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-escultura-color.jpg",
    projects: [
      /* Both images centre-cropped to 676×1200 from source for pixel-perfect sync */
      { title: "Proyecto 1", desc: "", aspect: "9/16",
        before: "assets/img/intervenciones/escultura/escultura-antes.jpg",
        after:  "assets/img/intervenciones/escultura/escultura-despues.jpg" }
    ]
  },
  grafica: {
    title_key:  "interv.t3",
    img:        "assets/img/intervenciones/iconos/icon-grafica-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-grafica-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-grafica-color.jpg",
    projects: [
      /* OG/1 — Acuarela figurativa · 2 pares (anverso + reverso) */
      { title: "Proyecto 1", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p1/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p1/a-despues.jpg" },
        { before: "assets/img/intervenciones/grafica/p1/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p1/b-despues.jpg" }
      ]},
      /* OG/2 — Serigrafía Warhol · 2 pares (anverso + reverso) */
      { title: "Proyecto 2", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p2/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p2/a-despues.jpg" },
        { before: "assets/img/intervenciones/grafica/p2/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p2/b-despues.jpg" }
      ]},
      /* OG/3 — David Manzur watercolor (acuarela, 1983) */
      { title: "Proyecto 3", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/grafica/p3/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p3/despues.jpg" },
      /* OG/4 — Litografía "Las Monjas" */
      { title: "Proyecto 4", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/grafica/p4/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p4/despues.jpg" },
      /* OG/5 — "El Torito" (Grau) */
      { title: "Proyecto 5", desc: "", aspect: "4/3",
        before: "assets/img/intervenciones/grafica/p5/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p5/despues.jpg" },
      /* OG/6 — Spiritus Sapientiae · 2 pares (anverso + reverso) */
      { title: "Proyecto 6", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p6/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p6/a-despues.jpg" },
        { before: "assets/img/intervenciones/grafica/p6/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p6/b-despues.jpg" }
      ]}
    ]
  },
  ceramica: {
    title_key:  "interv.t4",
    img:        "assets/img/intervenciones/iconos/icon-ceramica-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-ceramica-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-ceramica-color.jpg",
    projects: [
      /* antes centre-cropped to 1200×800 to match despues (both 3:2 landscape) */
      { title: "Proyecto 1", desc: "", aspect: "3/2",
        before: "assets/img/intervenciones/ceramica/ceramica-antes.jpg",
        after:  "assets/img/intervenciones/ceramica/ceramica-despues.jpg" }
    ]
  }
};
