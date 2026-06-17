/* ============================================================================
   main.js — Stefania Díaz portfolio
   Plain JS, no dependencies. Loaded (with i18n.js + data files) at the end of
   <body> so the DOM exists and the first paint is already translated.
   Depends on globals: window.I18N, window.BEFORE_AFTER, window.GALLERY
============================================================================ */
(function () {
  "use strict";

  /* --- Config -------------------------------------------------------------
     Show the labeled "Ejemplo" before/after demo to visitors. Set to false to
     hide demo entries until real pairs exist (see assets/data/before-after.js). */
  var SHOW_DEMO = true;

  var STORAGE_KEY = "sd-lang";
  var DEFAULT_LANG = "es";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Language resolution ------------------------------------------------ */
  function resolveInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "es" || saved === "en") return saved;
    } catch (e) { /* localStorage may be unavailable */ }
    var nav = (navigator.language || navigator.userLanguage || DEFAULT_LANG).toLowerCase();
    return nav.indexOf("es") === 0 ? "es" : "en";
  }

  var lang = resolveInitialLang();
  var dict = function (l) { return (window.I18N && window.I18N[l]) || {}; };
  function t(key) {
    var d = dict(lang);
    return Object.prototype.hasOwnProperty.call(d, key) ? d[key] : key;
  }

  // Dynamic (JS-rendered) pieces register a re-translation callback here.
  var dynamicUpdaters = [];

  /* --- Static i18n application -------------------------------------------- */
  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var i = pair.indexOf(":");
        if (i < 0) return;
        var attr = pair.slice(0, i).trim();
        var key = pair.slice(i + 1).trim();
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  }

  function setLang(next) {
    lang = (next === "en") ? "en" : "es";
    document.documentElement.setAttribute("lang", lang);
    applyStaticI18n();
    dynamicUpdaters.forEach(function (fn) { try { fn(lang); } catch (e) {} });
    // Toggle state
    document.querySelectorAll(".lang__btn").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.classList.remove("lang-loading"); // lift EN paint-gate
  }

  function wireLangToggle() {
    document.querySelectorAll(".lang__btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang")); });
    });
  }

  /* --- Nav: stuck on scroll + mobile menu --------------------------------- */
  function wireNav() {
    var nav = document.getElementById("nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 40); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    var tg = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (tg && links) {
      tg.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        tg.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          tg.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* --- Hero raking light follows the cursor ------------------------------- */
  function wireHeroRake() {
    var rake = document.getElementById("rake");
    var hero = document.getElementById("hero");
    if (rake && hero && !reduce && window.matchMedia("(hover:hover)").matches) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        rake.style.setProperty("--sweep", (-80 + x * 70).toFixed(1) + "%");
      });
    }
  }

  /* --- Before / after sliders (data-driven) ------------------------------- */
  function clampPct(p) { return Math.max(0, Math.min(100, p)); }

  function buildSlider(entry) {
    var module = document.createElement("div");
    module.className = "ba-module";

    var head = document.createElement("div");
    head.className = "ba-module__head";
    if (entry.demo) {
      var tag = document.createElement("span");
      tag.className = "ba-module__tag";
      head.appendChild(tag);
    }
    var title = document.createElement("span");
    title.className = "ba-module__title";
    var meta = document.createElement("span");
    meta.className = "ba-module__meta";
    head.appendChild(title);
    head.appendChild(meta);
    module.appendChild(head);

    var ba = document.createElement("div");
    ba.className = "ba" + (entry.demo ? " ba--demo" : "");
    ba.setAttribute("role", "group");

    if (entry.demo) {
      ba.innerHTML =
        '<div class="ba__layer ba__before"><svg class="ba__surface" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100%" height="100%" filter="url(#raking)"/></svg></div>' +
        '<div class="ba__layer ba__after"><svg class="ba__surface" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100%" height="100%" filter="url(#raking)"/></svg></div>';
    } else {
      ba.innerHTML =
        '<div class="ba__layer ba__before"><img src="' + entry.before + '" alt="" loading="lazy" decoding="async"></div>' +
        '<div class="ba__layer ba__after"><img src="' + entry.after + '" alt="" loading="lazy" decoding="async"></div>';
    }
    var tagAfter = document.createElement("span");
    tagAfter.className = "ba__tag ba__tag--after";
    var tagBefore = document.createElement("span");
    tagBefore.className = "ba__tag ba__tag--before";
    var handle = document.createElement("div");
    handle.className = "ba__handle";
    handle.setAttribute("role", "slider");
    handle.setAttribute("tabindex", "0");
    handle.setAttribute("aria-valuemin", "0");
    handle.setAttribute("aria-valuemax", "100");
    handle.setAttribute("aria-valuenow", "50");
    handle.innerHTML = '<span class="ba__knob"></span>';
    ba.appendChild(tagAfter);
    ba.appendChild(tagBefore);
    ba.appendChild(handle);
    module.appendChild(ba);

    var afterLayer = ba.querySelector(".ba__after");
    var beforeImg = ba.querySelector(".ba__before img");
    var afterImg = ba.querySelector(".ba__after img");

    function setPos(p) {
      p = clampPct(p);
      afterLayer.style.setProperty("--pos", p + "%");
      handle.style.left = p + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(p)));
      handle.setAttribute("aria-valuetext", Math.round(p) + "% — " + (dict(lang)["ba.after"] || ""));
    }
    var dragging = false;
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    }
    ba.addEventListener("pointerdown", function (e) {
      dragging = true;
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
      fromEvent(e);
    });
    ba.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener("pointerup", function () { dragging = false; });
    ba.addEventListener("pointercancel", function () { dragging = false; });
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      var step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setPos(cur - step); e.preventDefault(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") { setPos(cur + step); e.preventDefault(); }
      else if (e.key === "Home") { setPos(0); e.preventDefault(); }
      else if (e.key === "End") { setPos(100); e.preventDefault(); }
    });
    setPos(50);

    // Re-translation for this module's labels.
    function translate(l) {
      var d = dict(l);
      var tag = head.querySelector(".ba-module__tag");
      if (tag) tag.textContent = d["ba.demo"] || "";
      title.textContent = entry["title_" + l] || "";
      meta.textContent = entry["meta_" + l] || "";
      ba.setAttribute("aria-label", d["ba.aria"] || "");
      handle.setAttribute("aria-label", d["ba.aria"] || "");   // name the slider itself
      tagAfter.textContent = d["ba.after"] || "";
      tagBefore.textContent = d["ba.before"] || "";
      var titleTxt = entry["title_" + l] || "";
      if (beforeImg) beforeImg.setAttribute("alt", titleTxt + " — " + (d["ba.before"] || ""));
      if (afterImg) afterImg.setAttribute("alt", titleTxt + " — " + (d["ba.after"] || ""));
      var nowP = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      handle.setAttribute("aria-valuetext", Math.round(nowP) + "% — " + (d["ba.after"] || ""));
    }
    dynamicUpdaters.push(translate);
    translate(lang);

    return module;
  }

  function renderSliders() {
    var list = document.getElementById("baList");
    if (!list || !window.BEFORE_AFTER) return;
    list.innerHTML = "";
    var shown = window.BEFORE_AFTER.filter(function (e) { return SHOW_DEMO || !e.demo; });
    shown.forEach(function (entry) { list.appendChild(buildSlider(entry)); });
  }

  /* --- Interventions carousel (fixed-height, data-driven) ----------------- */
  var carousel = { index: 0, count: 0, els: null };

  function carouselUpdate() {
    if (!carousel.els) return;
    var idx = carousel.index, items = carousel.els.items, d = dict(lang);
    carousel.els.track.style.transform = "translateX(-" + (idx * 100) + "%)";
    var dots = carousel.els.dotsWrap.querySelectorAll(".carousel__dot");
    for (var i = 0; i < dots.length; i++) {
      dots[i].setAttribute("aria-current", i === idx ? "true" : "false");
      dots[i].setAttribute("aria-label", (d["ui.goImage"] || "") + " " + (i + 1));
    }
    var slides = carousel.els.track.querySelectorAll(".carousel__slide");
    for (var j = 0; j < slides.length; j++) {
      slides[j].setAttribute("aria-hidden", j === idx ? "false" : "true");
      slides[j].setAttribute("aria-label", (j + 1) + " / " + items.length);
    }
    carousel.els.caption.textContent = items[idx] ? (items[idx]["caption_" + lang] || "") : "";
  }

  function carouselGo(i) {
    if (!carousel.count) return;
    carousel.index = ((i % carousel.count) + carousel.count) % carousel.count;
    carouselUpdate();
  }

  function renderCarousel() {
    var root = document.getElementById("gallery");
    var track = document.getElementById("galleryTrack");
    var dotsWrap = document.getElementById("galleryDots");
    var viewport = document.getElementById("galleryViewport");
    var caption = document.getElementById("galleryCaption");
    if (!root || !track || !window.GALLERY) return;
    var items = window.GALLERY;
    carousel.count = items.length;
    track.innerHTML = ""; dotsWrap.innerHTML = "";

    items.forEach(function (item, i) {
      var li = document.createElement("li");
      li.className = "carousel__slide";
      li.setAttribute("role", "group");
      li.setAttribute("aria-roledescription", dict(lang)["ui.slide"] || "slide");
      var img = document.createElement("img");
      img.src = item.thumb || item.src; // contained in a fixed-height viewer; thumb is plenty
      img.setAttribute("loading", i === 0 ? "eager" : "lazy");
      img.setAttribute("decoding", "async");
      img.setAttribute("width", item.w);
      img.setAttribute("height", item.h);
      img.setAttribute("alt", item["alt_" + lang] || "");
      li.appendChild(img);
      track.appendChild(li);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel__dot";
      dot.addEventListener("click", function () { carouselGo(i); });
      dotsWrap.appendChild(dot);
    });

    var prev = root.querySelector(".carousel__prev");
    var next = root.querySelector(".carousel__next");
    if (prev) prev.addEventListener("click", function () { carouselGo(carousel.index - 1); });
    if (next) next.addEventListener("click", function () { carouselGo(carousel.index + 1); });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { carouselGo(carousel.index - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { carouselGo(carousel.index + 1); e.preventDefault(); }
    });

    // Touch / pointer swipe
    var startX = null, dragging = false;
    viewport.addEventListener("pointerdown", function (e) { startX = e.clientX; dragging = true; });
    viewport.addEventListener("pointerup", function (e) {
      if (!dragging || startX === null) { dragging = false; return; }
      var dx = e.clientX - startX; dragging = false; startX = null;
      if (Math.abs(dx) > 40) carouselGo(carousel.index + (dx < 0 ? 1 : -1));
    });
    viewport.addEventListener("pointercancel", function () { dragging = false; startX = null; });

    carousel.els = { track: track, dotsWrap: dotsWrap, caption: caption, items: items };
    carouselUpdate();

    // Re-translate alts / caption / dot+slide labels on language change.
    dynamicUpdaters.push(function (l) {
      var slides = track.querySelectorAll(".carousel__slide");
      items.forEach(function (item, i) {
        var im = slides[i] && slides[i].querySelector("img");
        if (im) im.setAttribute("alt", item["alt_" + l] || "");
        if (slides[i]) slides[i].setAttribute("aria-roledescription", dict(l)["ui.slide"] || "slide");
      });
      carouselUpdate();
    });
  }

  /* --- Reveal on scroll --------------------------------------------------- */
  function wireReveal() {
    var els = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --- Init --------------------------------------------------------------- */
  wireNav();
  wireHeroRake();
  wireLangToggle();
  renderSliders();
  renderCarousel();
  setLang(lang);   // first paint already translated (script runs at end of body)
  wireReveal();
})();
