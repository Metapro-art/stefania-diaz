/* ============================================================================
   Consultoría — Conservación Preventiva y Gestión de Colecciones
   Stefania Díaz portfolio — data-driven, loaded as window.CONSULTORIA.
   main.js:wireConsultoria() renders folder cards; clicking opens the shared
   modal with the area image + multi-paragraph description (i18n keys).

   Each entry: { title_key, desc_keys: [], img, pos? }
   desc_keys → array of i18n keys, one per paragraph (rendered in order).
   pos → object-position del retrato en el modal (la caja recorta a 42vh con
   object-fit:cover; úsalo cuando el encuadre centrado corte lo importante).
============================================================================ */
window.CONSULTORIA = {
  catalogacion: {
    title_key: "cons.title1",
    desc_keys: ["cons.d1a", "cons.d1b"],
    img: "assets/img/consultoria/cons-catalogacion.jpg",
    pos: "50% 18%"
  },
  diagnostico: {
    title_key: "cons.title2",
    desc_keys: ["cons.d2a", "cons.d2b", "cons.d2c"],
    img: "assets/img/consultoria/cons-diagnostico.jpg"
  },
  ambientales: {
    title_key: "cons.title3",
    desc_keys: ["cons.d3a", "cons.d3b", "cons.d3c"],
    img: "assets/img/consultoria/cons-ambientales.jpg"
  },
  curatorial: {
    title_key: "cons.title4",
    desc_keys: ["cons.d4a", "cons.d4b"],
    img: "assets/img/consultoria/cons-curatorial.jpg"
  }
};
