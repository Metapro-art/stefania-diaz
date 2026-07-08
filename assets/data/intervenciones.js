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
   The modal then shows a draggable before/after slider for each project.
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
    projects: []
  },
  escultura: {
    title_key:  "interv.t2",
    img:        "assets/img/intervenciones/iconos/icon-escultura-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-escultura-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-escultura-color.jpg",
    projects: [
      { before: "assets/img/intervenciones/escultura/escultura-antes.jpg",
        after:  "assets/img/intervenciones/escultura/escultura-despues.jpg",
        aspect: "3/4",
        title:  "Proyecto 1",
        desc:   "" }
    ]
  },
  grafica: {
    title_key:  "interv.t3",
    img:        "assets/img/intervenciones/iconos/icon-grafica-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-grafica-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-grafica-color.jpg",
    projects: []
  },
  ceramica: {
    title_key:  "interv.t4",
    img:        "assets/img/intervenciones/iconos/icon-ceramica-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-ceramica-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-ceramica-color.jpg",
    projects: [
      { before: "assets/img/intervenciones/ceramica/ceramica-antes.jpg",
        after:  "assets/img/intervenciones/ceramica/ceramica-despues.jpg",
        aspect: "4/3",
        title:  "Proyecto 1",
        desc:   "" }
    ]
  }
};
