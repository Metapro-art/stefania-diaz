/* ============================================================================
   Before / after comparison pairs — Stefania Díaz portfolio
   Data-driven: main.js renders ONE slider per entry in this array.

   Loaded as a global (window.BEFORE_AFTER) so it works via file:// and Pages.

   ---------------------------------------------------------------------------
   HOW TO ADD A REAL PAIR (when the "antes despues" photos exist)
   ---------------------------------------------------------------------------
   1. Drop the two photos in a new folder, e.g.
        Resources/Intervenciones/antes despues/
   2. Add two rows to tools/optimize-images.mjs, e.g.
        ['Resources/Intervenciones/antes despues/escultura-pesebre-antes.jpg',
         'before-after/escultura-pesebre-before', 'jpeg', 1600, 84],
        ['Resources/Intervenciones/antes despues/escultura-pesebre-despues.jpg',
         'before-after/escultura-pesebre-after',  'jpeg', 1600, 84],
      then run:  node tools/optimize-images.mjs
   3. Add a real entry below (and you can delete the demo entry, or keep it):
        {
          id: "escultura-pesebre",
          before: "assets/img/before-after/escultura-pesebre-before.jpg",
          after:  "assets/img/before-after/escultura-pesebre-after.jpg",
          title_es: "Escultura policromada · pieza colonial",
          title_en: "Polychrome sculpture · colonial piece",
          meta_es: "Antes y después de la reintegración cromática.",
          meta_en: "Before and after chromatic reintegration."
        }
   4. Remove the "demo: true" entry (or set SHOW_DEMO = false in main.js) so the
      "Ejemplo" label disappears once real pairs are live.

   A REAL entry needs:  { id, before, after, title_es, title_en, meta_es, meta_en }
   A DEMO entry needs:  { id, demo: true, title_es, title_en, meta_es, meta_en }
   ---------------------------------------------------------------------------
============================================================================ */
window.BEFORE_AFTER = [
  // DEMO — no real pair exists yet. Uses the CSS "raking light" simulated
  // surfaces (no <img>). Clearly labeled as an example in the UI.
  {
    id: "demo",
    demo: true,
    title_es: "Comparación antes / después",
    title_en: "Before / after comparison",
    meta_es: "Superficies simuladas — a la espera de la documentación fotográfica real.",
    meta_en: "Simulated surfaces — awaiting the real photographic record."
  }
];
