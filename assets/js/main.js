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
      // Demo surfaces are pure CSS gradients (see .ba--demo). The previous SVG
      // raking-light filter (feTurbulence) was removed for performance.
      ba.innerHTML =
        '<div class="ba__layer ba__before"></div>' +
        '<div class="ba__layer ba__after"></div>';
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

  /* --- Interventions gallery (square grid + accessible lightbox) ---------- */
  var lightbox = null;
  var lbState = { items: [], index: 0, lastFocus: null };

  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-labelledby", "sd-lightbox-cap"); // named by the per-image caption
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<div class="lightbox__backdrop" data-lb-close></div>' +
      '<button class="lightbox__btn lightbox__close" type="button" data-lb-close>&#215;</button>' +
      '<button class="lightbox__btn lightbox__nav lightbox__prev" type="button" data-lb-prev>&#8249;</button>' +
      '<button class="lightbox__btn lightbox__nav lightbox__next" type="button" data-lb-next>&#8250;</button>' +
      '<figure class="lightbox__dialog">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__cap" id="sd-lightbox-cap"></figcaption>' +
      '</figure>';
    document.body.appendChild(lightbox);
    lightbox.querySelectorAll("[data-lb-close]").forEach(function (el) { el.addEventListener("click", closeLightbox); });
    lightbox.querySelector("[data-lb-prev]").addEventListener("click", function () { step(-1); });
    lightbox.querySelector("[data-lb-next]").addEventListener("click", function () { step(1); });
    lightbox.addEventListener("keydown", onLightboxKey);
  }

  function lbApplyLabels(l) {
    if (!lightbox) return;
    var d = dict(l);
    lightbox.querySelector(".lightbox__close").setAttribute("aria-label", d["ui.close"] || "Close");
    lightbox.querySelector(".lightbox__prev").setAttribute("aria-label", d["ui.prev"] || "Previous");
    lightbox.querySelector(".lightbox__next").setAttribute("aria-label", d["ui.next"] || "Next");
    if (!lightbox.hidden) renderLightbox();
  }

  function renderLightbox() {
    var item = lbState.items[lbState.index];
    if (!item) return;
    var img = lightbox.querySelector(".lightbox__img");
    img.src = item.src;                          // full-res in the lightbox (contain, no crop)
    img.setAttribute("alt", item["alt_" + lang] || "");
    lightbox.querySelector(".lightbox__cap").textContent = item["caption_" + lang] || "";
    var many = lbState.items.length > 1;
    lightbox.querySelector(".lightbox__prev").style.display = many ? "" : "none";
    lightbox.querySelector(".lightbox__next").style.display = many ? "" : "none";
  }

  function openLightbox(index, trigger) {
    if (!lightbox) buildLightbox();
    lbApplyLabels(lang);
    lbState.index = index;
    lbState.lastFocus = trigger || document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    document.body.classList.add("lb-open");
    lightbox.querySelector(".lightbox__close").focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("lb-open");
    if (lbState.lastFocus && lbState.lastFocus.focus) lbState.lastFocus.focus();
  }
  function step(dir) {
    var n = lbState.items.length;
    if (!n) return;
    lbState.index = (lbState.index + dir + n) % n;
    renderLightbox();
  }
  function onLightboxKey(e) {
    if (e.key === "Escape") { closeLightbox(); }
    else if (e.key === "ArrowLeft") { step(-1); }
    else if (e.key === "ArrowRight") { step(1); }
    else if (e.key === "Tab") {
      var focusables = lightbox.querySelectorAll("button:not([style*='display: none'])");
      var visible = Array.prototype.filter.call(focusables, function (b) { return b.offsetParent !== null; });
      if (!visible.length) return;
      var first = visible[0], last = visible[visible.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  }

  function renderGallery() {
    var grid = document.getElementById("galleryGrid");
    if (!grid || !window.GALLERY) return;
    lbState.items = window.GALLERY;
    grid.innerHTML = "";
    window.GALLERY.forEach(function (item, i) {
      var tile = document.createElement("button");
      tile.type = "button";
      tile.className = "gtile";
      var img = document.createElement("img");
      img.src = item.thumb || item.src;          // square thumb in the grid (cover)
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
      img.setAttribute("width", item.w);
      img.setAttribute("height", item.h);
      img.setAttribute("alt", item["alt_" + lang] || "");
      tile.appendChild(img);
      tile.addEventListener("click", function () { openLightbox(i, tile); });
      grid.appendChild(tile);
    });
    dynamicUpdaters.push(function (l) {
      var imgs = grid.querySelectorAll(".gtile img");
      window.GALLERY.forEach(function (item, i) {
        if (imgs[i]) imgs[i].setAttribute("alt", item["alt_" + l] || "");
      });
      lbApplyLabels(l);
    });
  }

  /* --- Contact form (Web3Forms AJAX + hCaptcha) --------------------------- */
  function wireContactForm() {
    var form = document.getElementById("contact-form");
    var statusEl = document.getElementById("cf-status");
    if (!form || !statusEl) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // The hCaptcha token must travel inside the POST body for Web3Forms to
      // verify it (Manual Setup). Read it explicitly and inject it into FormData.
      var token = "";
      try { if (window.hcaptcha && window.hcaptcha.getResponse) token = window.hcaptcha.getResponse(); } catch (err) {}
      if (!token) {
        var ta = form.querySelector('textarea[name="h-captcha-response"]');
        token = ta ? ta.value : "";
      }
      if (!token) {
        statusEl.className = "cform__status is-err";
        statusEl.textContent = t("con.formCaptcha");
        return;
      }

      statusEl.className = "cform__status";
      statusEl.textContent = t("con.formSending");

      var formData = new FormData(form);
      formData.set("h-captcha-response", token); // ensure the token is included
      formData.delete("g-recaptcha-response");   // avoid Web3Forms treating it as reCaptcha (Pro feature)

      var httpStatus = 0;
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" }, // no Content-Type: the browser sets the multipart boundary
        body: formData
      }).then(function (r) { httpStatus = r.status; return r.json(); }).then(function (data) {
        if (data && data.success) {
          form.reset();
          if (window.hcaptcha && window.hcaptcha.reset) { try { window.hcaptcha.reset(); } catch (err) {} }
          statusEl.className = "cform__status is-ok";
          statusEl.textContent = t("con.formOk");
        } else {
          if (window.console) console.error("Web3Forms error:", data);
          statusEl.className = "cform__status is-err";
          statusEl.textContent = t("con.formErr") + " — " + ((data && data.message) || ("HTTP " + httpStatus));
        }
      }).catch(function (err) {
        if (window.console) console.error(err);
        statusEl.className = "cform__status is-err";
        statusEl.textContent = t("con.formErr");
      });
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
  renderGallery();
  wireContactForm();
  setLang(lang);   // first paint already translated (script runs at end of body)
  wireReveal();
})();
