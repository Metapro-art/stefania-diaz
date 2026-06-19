/* ============================================================================
   Preventive conservation & collections management — Stefania Díaz portfolio
   Data-driven: main.js renders one folder card per entry; clicking opens the
   shared modal with the area's image + a short description.
   Loaded as a global (window.PREVENTIVA) so it works via file:// and Pages.

   Each entry: { title_key, desc_key, img }  (text in i18n.js: prev.t1..t4, prev.d1..d4)
============================================================================ */
window.PREVENTIVA = {
  catalogacion: { title_key: "prev.t1", desc_key: "prev.d1", img: "assets/img/preventiva/prev-catalogacion.jpg" },
  exhibicion:   { title_key: "prev.t2", desc_key: "prev.d2", img: "assets/img/preventiva/prev-exhibicion.jpg" },
  ambientales:  { title_key: "prev.t3", desc_key: "prev.d3", img: "assets/img/preventiva/prev-ambientales.jpg" },
  diagnostico:  { title_key: "prev.t4", desc_key: "prev.d4", img: "assets/img/preventiva/prev-diagnostico.jpg" }
};
