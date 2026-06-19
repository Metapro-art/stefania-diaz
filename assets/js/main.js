/* ============================================================================
   main.js — Stefania Díaz portfolio
   Plain JS, no dependencies. Loaded (with i18n.js + data files) at the end of
   <body> so the DOM exists and the first paint is already translated.
   Depends on globals: window.I18N, window.INTERVENCIONES, window.PREVENTIVA
============================================================================ */
(function () {
  "use strict";

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

  /* --- Interventions: folder cards -> modal with before/after slider ------
     The slider reuses the .ba component. To add a real before/after pair: drop
     the two images in assets/img/intervenciones/<tipo>/ and push an entry onto
     INTERVENCIONES[<tipo>].pairs in assets/data/intervenciones.js, e.g.:
       { before: 'assets/img/intervenciones/madera/x-antes.jpg',
         after:  'assets/img/intervenciones/madera/x-despues.jpg',
         caption: 'Tratamiento de ...' }
     With pairs present the modal renders one slider per pair; empty -> a tidy
     "coming soon" state. */
  var sdModal = null, sdLastFocus = null, sdRender = null;

  function buildIvSlider(pair) {
    var fig = document.createElement("figure");
    fig.className = "iv-slider";
    var ba = document.createElement("div");
    ba.className = "ba";
    ba.setAttribute("role", "group");
    ba.innerHTML =
      '<div class="ba__layer ba__before"><img src="' + pair.before + '" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="ba__layer ba__after"><img src="' + pair.after + '" alt="" loading="lazy" decoding="async"></div>' +
      '<span class="ba__tag ba__tag--after"></span><span class="ba__tag ba__tag--before"></span>' +
      '<div class="ba__handle" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><span class="ba__knob"></span></div>';
    var afterLayer = ba.querySelector(".ba__after");
    var handle = ba.querySelector(".ba__handle");
    var before = t("iv.before"), after = t("iv.after");
    ba.querySelector(".ba__tag--after").textContent = after;
    ba.querySelector(".ba__tag--before").textContent = before;
    ba.setAttribute("aria-label", before + " / " + after);
    handle.setAttribute("aria-label", before + " / " + after);
    ba.querySelector(".ba__before img").alt = (pair.caption ? pair.caption + " — " : "") + before;
    ba.querySelector(".ba__after img").alt = (pair.caption ? pair.caption + " — " : "") + after;
    function setPos(p) {
      p = Math.max(0, Math.min(100, p));
      afterLayer.style.setProperty("--pos", p + "%");
      handle.style.left = p + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(p)));
      handle.setAttribute("aria-valuetext", Math.round(p) + "% — " + after);
    }
    var drag = false;
    function fromEvent(e) { var r = ba.getBoundingClientRect(); setPos(((e.clientX - r.left) / r.width) * 100); }
    ba.addEventListener("pointerdown", function (e) { drag = true; try { ba.setPointerCapture(e.pointerId); } catch (err) {} fromEvent(e); });
    ba.addEventListener("pointermove", function (e) { if (drag) fromEvent(e); });
    ba.addEventListener("pointerup", function () { drag = false; });
    ba.addEventListener("pointercancel", function () { drag = false; });
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 50, st = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setPos(cur - st); e.preventDefault(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") { setPos(cur + st); e.preventDefault(); }
      else if (e.key === "Home") { setPos(0); e.preventDefault(); }
      else if (e.key === "End") { setPos(100); e.preventDefault(); }
    });
    setPos(50);
    fig.appendChild(ba);
    if (pair.caption) {
      var cap = document.createElement("figcaption");
      cap.className = "iv-slider__cap";
      cap.textContent = pair.caption;
      fig.appendChild(cap);
    }
    return fig;
  }

  function buildSdModal() {
    sdModal = document.createElement("div");
    sdModal.className = "ivmodal";
    sdModal.setAttribute("role", "dialog");
    sdModal.setAttribute("aria-modal", "true");
    sdModal.setAttribute("aria-labelledby", "sd-modal-title");
    sdModal.hidden = true;
    sdModal.innerHTML =
      '<div class="ivmodal__backdrop" data-modal-close></div>' +
      '<div class="ivmodal__dialog">' +
        '<button class="ivmodal__close" type="button" data-modal-close>&#215;</button>' +
        '<h3 class="ivmodal__title" id="sd-modal-title"></h3>' +
        '<div class="ivmodal__body"></div>' +
      '</div>';
    document.body.appendChild(sdModal);
    sdModal.querySelectorAll("[data-modal-close]").forEach(function (el) { el.addEventListener("click", closeSdModal); });
    sdModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeSdModal(); return; }
      if (e.key === "Tab") {
        var f = sdModal.querySelectorAll("button, [tabindex='0']");
        var vis = Array.prototype.filter.call(f, function (b) { return b.offsetParent !== null; });
        if (!vis.length) return;
        var first = vis[0], last = vis[vis.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  }

  // Shared modal. `render(titleEl, bodyEl)` fills the content; it is retained so
  // the modal can be re-rendered in place when the language changes.
  function openSdModal(render, trigger) {
    if (!sdModal) buildSdModal();
    sdRender = render;
    sdLastFocus = trigger || document.activeElement;
    sdModal.querySelector(".ivmodal__close").setAttribute("aria-label", t("ui.close"));
    render(sdModal.querySelector(".ivmodal__title"), sdModal.querySelector(".ivmodal__body"));
    sdModal.hidden = false;
    document.body.classList.add("lb-open"); // lock background scroll
    sdModal.querySelector(".ivmodal__close").focus();
  }
  function closeSdModal() {
    if (!sdModal || sdModal.hidden) return;
    sdModal.hidden = true;
    sdRender = null;
    document.body.classList.remove("lb-open");
    if (sdLastFocus && sdLastFocus.focus) sdLastFocus.focus();
  }

  // Intervenciones: each folder opens the modal with a before/after slider per
  // pair, or a tidy "coming soon" state while the pairs array is empty.
  function wireIntervenciones() {
    var cards = document.querySelectorAll(".folder[data-folder]");
    if (!cards.length) return;
    cards.forEach(function (card) {
      var key = card.getAttribute("data-folder");
      card.addEventListener("click", function () {
        openSdModal(function (titleEl, bodyEl) {
          var data = (window.INTERVENCIONES || {})[key];
          if (!data) return;
          titleEl.textContent = t(data.title_key);
          bodyEl.innerHTML = "";
          if (data.pairs && data.pairs.length) {
            data.pairs.forEach(function (pair) { bodyEl.appendChild(buildIvSlider(pair)); });
          } else {
            var empty = document.createElement("div");
            empty.className = "iv-empty";
            var img = document.createElement("img");
            img.src = data.img; img.alt = ""; img.setAttribute("aria-hidden", "true");
            var msg = document.createElement("p");
            msg.className = "iv-empty__msg";
            msg.textContent = t("interv.empty");
            empty.appendChild(img); empty.appendChild(msg);
            bodyEl.appendChild(empty);
          }
        }, card);
      });
    });
  }

  // Preventiva: each folder opens the modal with the area image + a short
  // description (data-driven via window.PREVENTIVA).
  function wirePreventiva() {
    var cards = document.querySelectorAll(".folder[data-prev]");
    if (!cards.length) return;
    cards.forEach(function (card) {
      var key = card.getAttribute("data-prev");
      card.addEventListener("click", function () {
        openSdModal(function (titleEl, bodyEl) {
          var data = (window.PREVENTIVA || {})[key];
          if (!data) return;
          titleEl.textContent = t(data.title_key);
          bodyEl.innerHTML = "";
          var fig = document.createElement("figure");
          fig.className = "prev-detail";
          var img = document.createElement("img");
          img.src = data.img; img.alt = ""; img.setAttribute("aria-hidden", "true");
          img.setAttribute("loading", "lazy"); img.setAttribute("decoding", "async");
          var p = document.createElement("p");
          p.className = "prev-detail__text";
          p.textContent = t(data.desc_key);
          fig.appendChild(img); fig.appendChild(p);
          bodyEl.appendChild(fig);
        }, card);
      });
    });
  }

  // Re-render an open modal (title + body + close label) when the language changes.
  function wireModalI18n() {
    dynamicUpdaters.push(function () {
      if (sdModal && !sdModal.hidden && sdRender) {
        sdModal.querySelector(".ivmodal__close").setAttribute("aria-label", t("ui.close"));
        sdRender(sdModal.querySelector(".ivmodal__title"), sdModal.querySelector(".ivmodal__body"));
      }
    });
  }

  /* --- Contact form (Web3Forms AJAX + hCaptcha) --------------------------- */
  function wireContactForm() {
    var form = document.getElementById("contact-form");
    var statusEl = document.getElementById("cf-status");
    if (!form || !statusEl) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // hCaptcha token must travel in the POST body for Web3Forms to verify it.
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
  wireIntervenciones();
  wirePreventiva();
  wireModalI18n();
  wireContactForm();
  setLang(lang);   // first paint already translated (script runs at end of body)
  wireReveal();
})();
