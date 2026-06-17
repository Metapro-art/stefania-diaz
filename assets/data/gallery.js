/* ============================================================================
   Interventions gallery — Stefania Díaz portfolio
   Data-driven: main.js renders one tile per entry, in order.
   Loaded as a global (window.GALLERY) so it works via file:// and Pages.

   To add a photo: optimize it into assets/img/ (see tools/optimize-images.mjs)
   and append an entry below. w/h are the OPTIMIZED pixel dimensions and are
   used to reserve space (prevent layout shift) and for the lightbox.

   Each entry: { src, w, h, caption_es, caption_en, alt_es, alt_en }
============================================================================ */
window.GALLERY = [
  {
    src: "assets/img/gallery-gilding-reintegration.jpg", thumb: "assets/img/gallery-gilding-reintegration-thumb.jpg", w: 1600, h: 1600,
    caption_es: "Reintegración cromática en obra policromada",
    caption_en: "Chromatic reintegration on a polychrome work",
    alt_es: "Reintegración cromática con hisopo sobre un panel policromado y dorado.",
    alt_en: "Chromatic reintegration with a cotton swab on a gilded polychrome panel."
  },
  {
    src: "assets/img/gallery-painting-cleaning.jpg", thumb: "assets/img/gallery-painting-cleaning-thumb.jpg", w: 1600, h: 1309,
    caption_es: "Limpieza de una pintura de paisaje",
    caption_en: "Cleaning a landscape painting",
    alt_es: "Remoción de barniz con bisturí sobre una pintura de paisaje.",
    alt_en: "Varnish removal with a scalpel on a landscape painting."
  },
  {
    src: "assets/img/gallery-paper-conservation.jpg", thumb: "assets/img/gallery-paper-conservation-thumb.jpg", w: 1200, h: 1600,
    caption_es: "Conservación de obra sobre papel",
    caption_en: "Conservation of a work on paper",
    alt_es: "Remoción de adhesivo con pinza y espátula sobre un soporte de papel.",
    alt_en: "Adhesive removal with tweezers and a spatula on a paper support."
  },
  {
    src: "assets/img/gallery-painting-facing.jpg", thumb: "assets/img/gallery-painting-facing-thumb.jpg", w: 1600, h: 1200,
    caption_es: "Protección del soporte de una pintura",
    caption_en: "Facing a painting's support",
    alt_es: "Aplicación de un papel de protección sobre el reverso de una pintura, frente a la ventana del taller.",
    alt_en: "Applying a facing tissue to the back of a painting by the studio window."
  },
  {
    src: "assets/img/gallery-paint-examination.jpg", thumb: "assets/img/gallery-paint-examination-thumb.jpg", w: 1280, h: 960,
    caption_es: "Examen de la capa pictórica",
    caption_en: "Examining the paint layer",
    alt_es: "Examen con lupa frontal de la craqueladura de una pintura.",
    alt_en: "Examining a painting's craquelure with a head-mounted magnifier."
  },
  {
    src: "assets/img/gallery-collection-handling.jpg", thumb: "assets/img/gallery-collection-handling-thumb.jpg", w: 960, h: 1280,
    caption_es: "Manejo de una obra de colección",
    caption_en: "Handling a collection work",
    alt_es: "Manipulación con guantes de una pintura enmarcada en una colección.",
    alt_en: "Gloved handling of a framed painting in a collection."
  }
];
