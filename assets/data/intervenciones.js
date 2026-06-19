/* ============================================================================
   Interventions by type — Stefania Díaz portfolio
   Data-driven: main.js renders one folder card per entry; clicking opens a modal
   with a before/after slider per pair (or a tidy "coming soon" state if empty).
   Loaded as a global (window.INTERVENCIONES) so it works via file:// and Pages.

   ---------------------------------------------------------------------------
   HOW TO ADD A REAL BEFORE/AFTER PAIR
   ---------------------------------------------------------------------------
   1. Drop the two photos in assets/img/intervenciones/<tipo>/  e.g.
        assets/img/intervenciones/madera/retablo-antes.jpg
        assets/img/intervenciones/madera/retablo-despues.jpg
      (optimize them first with tools/optimize-images.mjs if they are large).
   2. Push an entry onto that type's `pairs` array below:
        pairs: [
          { before: 'assets/img/intervenciones/madera/retablo-antes.jpg',
            after:  'assets/img/intervenciones/madera/retablo-despues.jpg',
            caption: 'Retablo colonial · limpieza y reintegración' }
        ]
   The modal then shows a draggable before/after slider for each pair. While a
   type has no pairs, its modal shows an intentional "coming soon" panel.

   `img` is the folder card's cover image. Each pair: { before, after, caption }.
============================================================================ */
window.INTERVENCIONES = {
  madera:    { title_key: "interv.t1", img: "assets/img/intervenciones/interv-madera.jpg",    pairs: [] },
  grafica:   { title_key: "interv.t2", img: "assets/img/intervenciones/interv-grafica.jpg",   pairs: [] },
  lienzo:    { title_key: "interv.t3", img: "assets/img/intervenciones/interv-lienzo.jpg",     pairs: [] },
  escultura: { title_key: "interv.t4", img: "assets/img/intervenciones/interv-escultura.jpg",  pairs: [] }
};
