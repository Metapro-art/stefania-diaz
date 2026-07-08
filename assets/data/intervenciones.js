/* ============================================================================
   Interventions by type — Stefania Díaz portfolio
   Data-driven: main.js renders one folder card per entry; clicking opens a modal
   with a before/after slider per project (or a "coming soon" state if empty).

   ---------------------------------------------------------------------------
   HOW TO ADD A PROJECT
   ---------------------------------------------------------------------------
   Push an entry onto the `projects` array for the relevant category:
     projects: [
       { before: 'assets/img/intervenciones/ceramica/ceramica-antes.jpg',
         after:  'assets/img/intervenciones/ceramica/ceramica-despues.jpg',
         aspect: '4/3',   // optional; overrides the slider aspect-ratio
         title:  'Cuenco arqueológico · consolidación y reintegración',
         desc:   '' }     // leave empty until text is ready
     ]
   For projects with multiple before/after pairs (e.g. anverso + reverso), use:
     { title: 'Proyecto 1', aspect: '3/4', pairs: [
       { before: '...a-antes.jpg', after: '...a-despues.jpg' },
       { before: '...b-antes.jpg', after: '...b-despues.jpg' }
     ]}
   The modal then shows a draggable before/after slider for each pair.
   While a category has no projects, its modal shows a "coming soon" panel.

   `img` is used only for the empty-state background in the modal.
   `icon_rest` / `icon_hover` are the card's sepia/color photo states.
============================================================================ */
window.INTERVENCIONES = {
  lienzoMadera: {
    title_key:  "interv.t1",
    img:        "assets/img/intervenciones/iconos/icon-pintura-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-pintura-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-pintura-color.jpg",
    projects: [
      /* PL&M/1 — Paisaje con rebaño (2 pares: anverso + reverso/bastidor) */
      { title: "Proyecto 1", desc: "", aspect: "4/3", pairs: [
        { before: "assets/img/intervenciones/lienzoMadera/p1/a-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p1/a-despues.jpg" },
        { before: "assets/img/intervenciones/lienzoMadera/p1/b-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p1/b-despues.jpg" }
      ]},
      /* PL&M/2 — Paisaje nocturno lunar (reencuadre + nuevo marco) */
      { title: "Proyecto 2", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/lienzoMadera/p2/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p2/despues.jpg" },
      /* PL&M/3 — Detalle microscópico: reparación de tela */
      { title: "Proyecto 3", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/lienzoMadera/p3/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p3/despues.jpg" },
      /* PL&M/4 — S. Juan Nepomuceno Mártir (2 pares: anverso + reverso) */
      { title: "Proyecto 4", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/lienzoMadera/p4/a-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p4/a-despues.jpg" },
        { before: "assets/img/intervenciones/lienzoMadera/p4/b-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p4/b-despues.jpg" }
      ]},
      /* PL&M/5 — Pequeño paisaje (A. Páramo) */
      { title: "Proyecto 5", desc: "", aspect: "4/3",
        before: "assets/img/intervenciones/lienzoMadera/p5/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p5/despues.jpg" }
    ]
  },
  escultura: {
    title_key:  "interv.t2",
    img:        "assets/img/intervenciones/iconos/icon-escultura-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-escultura-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-escultura-color.jpg",
    projects: [
      { title: "Proyecto 1", desc: "", aspect: "3/4",
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
      /* OG/1 — Acuarela (2 pares: anverso + reverso) */
      { title: "Proyecto 1", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p1/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p1/a-despues.jpg" },
        { before: "assets/img/intervenciones/grafica/p1/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p1/b-despues.jpg" }
      ]},
      /* OG/2 — Serigrafía Warhol (2 pares: anverso + reverso) */
      { title: "Proyecto 2", desc: "", aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p2/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p2/a-despues.jpg" },
        { before: "assets/img/intervenciones/grafica/p2/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p2/b-despues.jpg" }
      ]},
      /* OG/4 — Litografía "Las Monjas" */
      { title: "Proyecto 3", desc: "", aspect: "3/4",
        before: "assets/img/intervenciones/grafica/p4/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p4/despues.jpg" },
      /* OG/5 — "El Torito" (Grau) */
      { title: "Proyecto 4", desc: "", aspect: "4/3",
        before: "assets/img/intervenciones/grafica/p5/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p5/despues.jpg" },
      /* OG/6 — Spiritus Sapientiae (2 pares: anverso + reverso) */
      { title: "Proyecto 5", desc: "", aspect: "3/4", pairs: [
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
      { title: "Proyecto 1", desc: "", aspect: "4/3",
        before: "assets/img/intervenciones/ceramica/ceramica-antes.jpg",
        after:  "assets/img/intervenciones/ceramica/ceramica-despues.jpg" }
    ]
  }
};
