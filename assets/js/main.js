/* ============================================================================
   main.js — Stefania Díaz portfolio
   Plain JS, no dependencies. Loaded (with i18n.js + data files) at the end of
   <body> so the DOM exists and the first paint is already translated.
   Depends on globals: window.I18N, window.INTERVENCIONES, window.CONSULTORIA
============================================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "sd-lang";
  var FALLBACK_LANG = "es";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Language resolution ------------------------------------------------
     El script inline del <head> ya resolvió el idioma ANTES del primer paint
     (preferencia guardada → DEFAULT_LANG → navegador) y lo dejó en <html lang>.
     Leerlo de ahí evita mantener la detección duplicada en dos archivos. */
  function resolveInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "es" || saved === "en") return saved;
    } catch (e) { /* localStorage may be unavailable */ }
    var early = document.documentElement.lang;
    if (early === "es" || early === "en") return early;
    var nav = (navigator.language || navigator.userLanguage || FALLBACK_LANG).toLowerCase();
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
  var sdModal = null, sdLastFocus = null, sdRender = null, sdActiveHash = null;

  function buildIvSlider(pair) {
    var fig = document.createElement("figure");
    fig.className = "iv-slider";
    var ba = document.createElement("div");
    ba.className = "ba";
    if (pair.aspect) ba.style.aspectRatio = pair.aspect;
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
    ba.querySelector(".ba__before img").alt = pair.altBefore || ((pair.caption ? pair.caption + " — " : "") + before);
    ba.querySelector(".ba__after img").alt = pair.altAfter || ((pair.caption ? pair.caption + " — " : "") + after);
    function setPos(p) {
      p = Math.max(0, Math.min(100, p));
      ba.style.setProperty("--pos", p + "%");
      handle.style.left = p + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(p)));
      handle.setAttribute("aria-valuetext", Math.round(p) + "% — " + after);
    }
    var drag = false;
    function fromEvent(e) { var r = ba.getBoundingClientRect(); setPos(((e.clientX - r.left) / r.width) * 100); }
    ba.addEventListener("pointerdown", function (e) {
      drag = false;
      if (e.target !== handle && !handle.contains(e.target)) return;
      drag = true;
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
    });
    ba.addEventListener("pointermove", function (e) { if (drag) fromEvent(e); });
    ba.addEventListener("pointerup",     function () { drag = false; });
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
    // Los modales legales viven en el hash (#politica-datos / #propiedad-intelectual):
    // al cerrar, se limpia el hash SIN recargar. Los demás modales no tocan la URL.
    if (sdActiveHash) {
      sdActiveHash = null;
      try { history.replaceState(null, "", location.pathname + location.search); }
      catch (e) { location.hash = ""; }
    }
    if (sdLastFocus && sdLastFocus.focus) sdLastFocus.focus();
  }

  // Intervenciones: each folder opens the modal with one block per project
  // (title + before/after slider + optional desc), or a "coming soon" state.
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
          if (data.projects && data.projects.length) {
            data.projects.forEach(function (proj) {
              var wrap = document.createElement("div");
              wrap.className = "iv-project";
              // Cartela de museo: nombre (t) · obra y año (sub) · ficha técnica (meta).
              // t y meta admiten <em> del diccionario (términos y títulos en cursiva).
              var tTxt = proj.t_key ? t(proj.t_key) : (proj.title || "");
              var subTxt = proj.sub_key ? t(proj.sub_key) : "";
              var metaTxt = proj.meta_key ? t(proj.meta_key) : "";
              var descTxt = proj.desc_key ? t(proj.desc_key) : (proj.desc || "");
              if (tTxt) {
                var h4 = document.createElement("h4");
                h4.className = "iv-project__t";
                h4.innerHTML = tTxt;
                wrap.appendChild(h4);
              }
              if (subTxt) {
                var sub = document.createElement("p");
                sub.className = "iv-project__sub";
                sub.textContent = subTxt;
                wrap.appendChild(sub);
              }
              if (metaTxt) {
                var meta = document.createElement("p");
                meta.className = "iv-project__meta";
                metaTxt.split("\n").forEach(function (line) {
                  var span = document.createElement("span");
                  span.innerHTML = line;
                  meta.appendChild(span);
                });
                wrap.appendChild(meta);
              }
              var altName = (tTxt + (subTxt ? " — " + subTxt : "")).replace(/<[^>]+>/g, "");
              var pairsToRender = (proj.pairs && proj.pairs.length)
                ? proj.pairs
                : [{ before: proj.before, after: proj.after, caption: proj.caption || "" }];
              pairsToRender.forEach(function (pair) {
                var capTxt = pair.cap_key ? t(pair.cap_key) : (pair.caption || "");
                var side = capTxt ? " (" + capTxt + ")" : "";
                wrap.appendChild(buildIvSlider({
                  before: pair.before, after: pair.after, aspect: proj.aspect, caption: capTxt,
                  altBefore: altName ? altName + side + ", " + t("interv.alt.before") : "",
                  altAfter:  altName ? altName + side + ", " + t("interv.alt.after") : ""
                }));
              });
              if (descTxt) {
                descTxt.split("\n\n").forEach(function (parText) {
                  var p = document.createElement("p");
                  p.className = "iv-project__d";
                  p.textContent = parText;
                  wrap.appendChild(p);
                });
              }
              bodyEl.appendChild(wrap);
            });
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

  // Consultoria: each folder opens the modal with the area image + multi-paragraph
  // description (desc_keys array → one <p> per key, via window.CONSULTORIA).
  function wireConsultoria() {
    var cards = document.querySelectorAll(".folder[data-cons]");
    if (!cards.length) return;
    cards.forEach(function (card) {
      var key = card.getAttribute("data-cons");
      card.addEventListener("click", function () {
        openSdModal(function (titleEl, bodyEl) {
          var data = (window.CONSULTORIA || {})[key];
          if (!data) return;
          titleEl.textContent = t(data.title_key);
          bodyEl.innerHTML = "";
          var fig = document.createElement("figure");
          fig.className = "prev-detail";
          var img = document.createElement("img");
          img.src = data.img; img.alt = ""; img.setAttribute("aria-hidden", "true");
          img.setAttribute("loading", "lazy"); img.setAttribute("decoding", "async");
          if (data.pos) img.style.objectPosition = data.pos; // encuadre por imagen (la caja 42vh recorta)
          fig.appendChild(img);
          bodyEl.appendChild(fig);
          var paras = document.createElement("div");
          paras.className = "cons-paras";
          (data.desc_keys || []).forEach(function (dk) {
            var p = document.createElement("p");
            p.textContent = t(dk);
            paras.appendChild(p);
          });
          bodyEl.appendChild(paras);
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

  /* --- Avisos legales: dos modales con enlace profundo -------------------- //
     Reutilizan el modal compartido (openSdModal → foco atrapado, Esc, backdrop,
     scroll interno, re-render en caliente al cambiar de idioma vía wireModalI18n).
     Cada aviso vive en su hash para poder citarse por URL:
       stefaniadiaz.art/#politica-datos   ·   stefaniadiaz.art/#propiedad-intelectual
     Los documentos son texto legal por numeral (una clave i18n por sección). */
  var LEGAL = {
    "politica-datos": {
      titleKey: "legal.datos.title",
      enNoticeKey: "legal.datos.enNotice",
      sections: ["legal.datos.s1", "legal.datos.s2", "legal.datos.s3", "legal.datos.s4",
        "legal.datos.s5", "legal.datos.s6", "legal.datos.s7", "legal.datos.s8",
        "legal.datos.s9", "legal.datos.s10"]
    },
    "propiedad-intelectual": {
      titleKey: "legal.pi.title",
      enNoticeKey: "legal.pi.enNotice",
      sections: ["legal.pi.s1", "legal.pi.s2", "legal.pi.s3", "legal.pi.s4",
        "legal.pi.s5", "legal.pi.s6", "legal.pi.s7", "legal.pi.s8"]
    }
  };

  function renderLegal(key) {
    return function (titleEl, bodyEl) {
      var doc = LEGAL[key];
      titleEl.textContent = t(doc.titleKey);
      bodyEl.innerHTML = "";
      // El aviso de "traducción de cortesía" solo aplica a la versión en inglés
      // (el español prevalece); en ES no se muestra.
      if (lang === "en" && doc.enNoticeKey) {
        var note = document.createElement("p");
        note.className = "legal__note";
        note.textContent = t(doc.enNoticeKey);
        bodyEl.appendChild(note);
      }
      doc.sections.forEach(function (k) {
        var s = document.createElement("div");
        s.className = "legal__s";
        s.innerHTML = t(k);
        bodyEl.appendChild(s);
      });
    };
  }

  function openLegal(key, fromHash) {
    if (!LEGAL[key]) return;
    openSdModal(renderLegal(key), document.activeElement);
    sdActiveHash = "#" + key;
    // Al abrir desde un clic, sembramos el hash (sin recargar) para que la URL sea
    // citable; al abrir desde el hash (carga directa / back-forward) ya está puesto.
    if (!fromHash) {
      try { history.pushState(null, "", "#" + key); }
      catch (e) { location.hash = key; }
    }
  }

  function currentLegalHash() {
    var h = (location.hash || "").replace(/^#/, "");
    return LEGAL[h] ? h : null;
  }

  function syncLegalFromHash() {
    var h = currentLegalHash();
    if (h) {
      if (sdActiveHash !== "#" + h) openLegal(h, true);
    } else if (sdActiveHash) {
      // El hash se limpió o cambió (p. ej. botón atrás): cerramos el modal legal.
      closeSdModal();
    }
  }

  function wireLegal() {
    // Delegación: cualquier [data-legal] abre su modal sin navegar ni enviar el
    // formulario. En la casilla, stopPropagation evita marcar/desmarcar el checkbox.
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-legal]");
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      openLegal(a.getAttribute("data-legal"), false);
    });
    window.addEventListener("hashchange", syncLegalFromHash);
    syncLegalFromHash(); // enlace profundo en carga directa
  }

  /* --- Contact form (Web3Forms AJAX + hCaptcha) --------------------------- */
  function wireContactForm() {
    var form = document.getElementById("contact-form");
    var statusEl = document.getElementById("cf-status");
    if (!form || !statusEl) return;

    // 'coleccion' es opcional: un segundo clic sobre el mismo radio lo deselecciona.
    form.querySelectorAll('input[name="coleccion"]').forEach(function (r) {
      r.addEventListener("click", function () {
        if (this.dataset.was === "1") { this.checked = false; delete this.dataset.was; }
        else {
          form.querySelectorAll('input[name="coleccion"]').forEach(function (o) { delete o.dataset.was; });
          this.dataset.was = "1";
        }
      });
    });
    form.addEventListener("reset", function () { // tras enviar, el flag no puede quedar obsoleto
      form.querySelectorAll('input[name="coleccion"]').forEach(function (o) { delete o.dataset.was; });
    });

    // Validación propia (el form lleva novalidate para que los errores salgan
    // inline, estilados y en el idioma del sitio — no burbujas del navegador).
    // Obligatorios: SOLO nombre, correo y mensaje. Nada del bloque de obra bloquea.
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function setFieldError(input, errId, msgKey) {
      var errEl = document.getElementById(errId);
      if (msgKey) {
        errEl.textContent = t(msgKey);
        errEl.hidden = false;
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", errId);
      } else {
        errEl.textContent = "";
        errEl.hidden = true;
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    }
    var consentEl = document.getElementById("cf-consent");
    function validate() {
      var checks = [
        { el: document.getElementById("cf-name"), err: "cf-name-err", key: "con.errName",
          ok: function (v) { return !!v.trim(); } },
        { el: document.getElementById("cf-email"), err: "cf-email-err", key: "con.errEmail",
          ok: function (v) { return EMAIL_RE.test(v.trim()); } },
        { el: document.getElementById("cf-message"), err: "cf-message-err", key: "con.errMessage",
          ok: function (v) { return !!v.trim(); } },
        // Cuarto obligatorio: la autorización de datos (Ley 1581/2012, art. 9).
        // Lee .checked, no .value; sin marcar → no se envía, error inline, foco a la casilla.
        { el: consentEl, err: "cf-consent-err", key: "con.errConsent",
          ok: function () { return consentEl.checked; } }
      ];
      var firstBad = null;
      checks.forEach(function (c) {
        var good = c.ok(c.el.value);
        setFieldError(c.el, c.err, good ? null : c.key);
        if (!good && !firstBad) firstBad = c.el;
      });
      if (firstBad) { firstBad.focus(); return false; }
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validate()) return; // sin envío: errores inline + foco al primer inválido

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

      // Asunto autocompuesto para triage desde la bandeja, en el idioma del visitante:
      // "Consulta web · {tipologia} · {coleccion} · {nombre}" — los vacíos se omiten.
      var subj = [t("con.subjectPrefix")];
      ["tipologia", "coleccion"].forEach(function (k) {
        var v = String(formData.get(k) || "").trim();
        if (v) subj.push(v);
      });
      var who = String(formData.get("name") || "").trim();
      if (who) subj.push(who);
      formData.set("subject", subj.join(" · "));

      // Web3Forms (free) no tiene plantillas de correo: el email lista lo enviado.
      // Fuera los campos vacíos para que a Stefania le llegue solo lo que llenaron.
      Array.from(formData.keys()).forEach(function (k) {
        if (!String(formData.get(k)).trim()) formData.delete(k);
      });

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
  wireConsultoria();
  wireModalI18n();
  wireLegal();
  wireContactForm();
  setLang(lang);   // first paint already translated (script runs at end of body)
  wireReveal();
})();
