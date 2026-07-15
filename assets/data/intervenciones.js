/* ============================================================================
   Interventions by type — Stefania Díaz portfolio
   Data-driven: main.js renders one folder card per entry; clicking opens a modal
   with, per project, a museum-style label (t/sub/meta) + one before/after slider
   per pair + the treatment text (desc). All text lives in i18n.js (ES + EN).

   HOW TO ADD A PROJECT
   ---------------------------------------------------------------------------
   Single pair:
     { t_key:'interv.xx.pN.t', sub_key:'interv.xx.pN.sub',
       meta_key:'interv.xx.pN.meta', desc_key:'interv.xx.pN.desc',
       aspect:'3/4', before:'path/antes.jpg', after:'path/despues.jpg' }
   Multiple pairs per project (anverso + reverso): pairs:[], each with cap_key
   ('interv.cap.anverso' / 'interv.cap.reverso') for the slider caption:
     { t_key:'…', …, aspect:'3/4', pairs:[
       { before:'path/a-antes.jpg', after:'path/a-despues.jpg', cap_key:'interv.cap.anverso' },
       { before:'path/b-antes.jpg', after:'path/b-despues.jpg', cap_key:'interv.cap.reverso' }
     ]}
   Omit sub_key/meta_key when the project has no such line (e.g. PL&M/3).
   Add the referenced keys to BOTH languages in i18n.js — `npm run check:i18n`
   fails on any key missing or untranslated. (Legacy plain-string title/desc/
   caption still render when no *_key is present.)
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
      /* PL&M/1 — Gómez Campuzano, paisaje con rebaño · 2 pares (anverso + reverso/bastidor) */
      { t_key: "interv.lm.p1.t", sub_key: "interv.lm.p1.sub", meta_key: "interv.lm.p1.meta", desc_key: "interv.lm.p1.desc",
        aspect: "4/3", pairs: [
        { before: "assets/img/intervenciones/lienzoMadera/p1/a-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p1/a-despues.jpg", cap_key: "interv.cap.anverso" },
        { before: "assets/img/intervenciones/lienzoMadera/p1/b-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p1/b-despues.jpg", cap_key: "interv.cap.reverso" }
      ]},
      /* PL&M/2 — Jim Amaral, Dead Moon N° 95 */
      { t_key: "interv.lm.p2.t", sub_key: "interv.lm.p2.sub", meta_key: "interv.lm.p2.meta", desc_key: "interv.lm.p2.desc",
        aspect: "3/4",
        before: "assets/img/intervenciones/lienzoMadera/p2/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p2/despues.jpg" },
      /* PL&M/3 — Reconstrucción thread-by-thread bajo microscopio (demostración de técnica: sin sub/meta) */
      { t_key: "interv.lm.p3.t", desc_key: "interv.lm.p3.desc",
        aspect: "3/4",
        before: "assets/img/intervenciones/lienzoMadera/p3/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p3/despues.jpg" },
      /* PL&M/4 — S. Juan Nepomuceno Mártir · 2 pares (anverso + reverso) */
      { t_key: "interv.lm.p4.t", sub_key: "interv.lm.p4.sub", meta_key: "interv.lm.p4.meta", desc_key: "interv.lm.p4.desc",
        aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/lienzoMadera/p4/a-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p4/a-despues.jpg", cap_key: "interv.cap.anverso" },
        { before: "assets/img/intervenciones/lienzoMadera/p4/b-antes.jpg",
          after:  "assets/img/intervenciones/lienzoMadera/p4/b-despues.jpg", cap_key: "interv.cap.reverso" }
      ]},
      /* PL&M/5 — Roberto Páramo, pequeño paisaje */
      { t_key: "interv.lm.p5.t", sub_key: "interv.lm.p5.sub", meta_key: "interv.lm.p5.meta", desc_key: "interv.lm.p5.desc",
        aspect: "4/3",
        before: "assets/img/intervenciones/lienzoMadera/p5/antes.jpg",
        after:  "assets/img/intervenciones/lienzoMadera/p5/despues.jpg" },
      /* PL&M/6 — Antonio Barrera, paisaje de niebla (con marco → sin marco) */
      { t_key: "interv.lm.p6.t", sub_key: "interv.lm.p6.sub", meta_key: "interv.lm.p6.meta", desc_key: "interv.lm.p6.desc",
        aspect: "3/2",
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
      /* Mujer con copa, Escuela Quiteña s. XVII. Both images centre-cropped to 676×1200 for pixel-perfect sync */
      { t_key: "interv.esc.t", sub_key: "interv.esc.sub", meta_key: "interv.esc.meta", desc_key: "interv.esc.desc",
        aspect: "9/16",
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
      /* OG/1 — Botero, Jornaleros · 2 pares (anverso + reverso) */
      { t_key: "interv.gr.p1.t", sub_key: "interv.gr.p1.sub", meta_key: "interv.gr.p1.meta", desc_key: "interv.gr.p1.desc",
        aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p1/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p1/a-despues.jpg", cap_key: "interv.cap.anverso" },
        { before: "assets/img/intervenciones/grafica/p1/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p1/b-despues.jpg", cap_key: "interv.cap.reverso" }
      ]},
      /* OG/2 — Warhol, «Mick Jagger» Red · 2 pares (anverso + reverso) */
      { t_key: "interv.gr.p2.t", sub_key: "interv.gr.p2.sub", meta_key: "interv.gr.p2.meta", desc_key: "interv.gr.p2.desc",
        aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p2/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p2/a-despues.jpg", cap_key: "interv.cap.anverso" },
        { before: "assets/img/intervenciones/grafica/p2/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p2/b-despues.jpg", cap_key: "interv.cap.reverso" }
      ]},
      /* OG/3 — David Manzur, Madama Butterfly (acuarela, 1983) */
      { t_key: "interv.gr.p3.t", sub_key: "interv.gr.p3.sub", meta_key: "interv.gr.p3.meta", desc_key: "interv.gr.p3.desc",
        aspect: "3/4",
        before: "assets/img/intervenciones/grafica/p3/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p3/despues.jpg" },
      /* OG/4 — Débora Arango, serigrafía "Las Monjas y el Cardenal" */
      { t_key: "interv.gr.p4.t", sub_key: "interv.gr.p4.sub", meta_key: "interv.gr.p4.meta", desc_key: "interv.gr.p4.desc",
        aspect: "3/4",
        before: "assets/img/intervenciones/grafica/p4/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p4/despues.jpg" },
      /* OG/5 — Grau, "El Torito" */
      { t_key: "interv.gr.p5.t", sub_key: "interv.gr.p5.sub", meta_key: "interv.gr.p5.meta", desc_key: "interv.gr.p5.desc",
        aspect: "4/3",
        before: "assets/img/intervenciones/grafica/p5/antes.jpg",
        after:  "assets/img/intervenciones/grafica/p5/despues.jpg" },
      /* OG/6 — Walter Wolff, Spiritus Sapientiae · 2 pares (anverso + reverso) */
      { t_key: "interv.gr.p6.t", sub_key: "interv.gr.p6.sub", meta_key: "interv.gr.p6.meta", desc_key: "interv.gr.p6.desc",
        aspect: "3/4", pairs: [
        { before: "assets/img/intervenciones/grafica/p6/a-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p6/a-despues.jpg", cap_key: "interv.cap.anverso" },
        { before: "assets/img/intervenciones/grafica/p6/b-antes.jpg",
          after:  "assets/img/intervenciones/grafica/p6/b-despues.jpg", cap_key: "interv.cap.reverso" }
      ]}
    ]
  },
  ceramica: {
    title_key:  "interv.t4",
    img:        "assets/img/intervenciones/iconos/icon-ceramica-color.jpg",
    icon_rest:  "assets/img/intervenciones/iconos/icon-ceramica-sepia.jpg",
    icon_hover: "assets/img/intervenciones/iconos/icon-ceramica-color.jpg",
    projects: [
      /* Copa Muisca, UPTC. antes centre-cropped to 1200×800 to match despues (both 3:2 landscape) */
      { t_key: "interv.cer.t", sub_key: "interv.cer.sub", meta_key: "interv.cer.meta", desc_key: "interv.cer.desc",
        aspect: "3/2",
        before: "assets/img/intervenciones/ceramica/ceramica-antes.jpg",
        after:  "assets/img/intervenciones/ceramica/ceramica-despues.jpg" }
    ]
  }
};
