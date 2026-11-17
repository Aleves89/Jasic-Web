// Google Analytics con aviso de cookies (PRI-02).
// Modelo de exclusión: la medición funciona salvo que el visitante la rechace.
// La elección se guarda en el navegador y se puede cambiar desde la política de privacidad.
(function () {
  "use strict";
  var ID = "G-425YKFZRV4";
  var CLAVE = "jasic-cookies";

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento */ } }

  function cargarGA() {
    if (window.gtag) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ID, { cookie_domain: "auto", allow_google_signals: false, allow_ad_personalization_signals: false });
  }

  function raizSitio() {
    var s = document.currentScript || document.querySelector('script[src*="analytics.js"]');
    return s ? s.src.replace(/assets\/js\/analytics\.js.*$/, "") : "/";
  }
  var raiz = raizSitio();

  function aviso() {
    var d = document.createElement("div");
    d.className = "aviso-cookies";
    d.setAttribute("role", "region");
    d.setAttribute("aria-label", "Aviso de cookies");
    d.innerHTML =
      '<p>Usamos cookies de Google Analytics para saber cuántas personas visitan el sitio. ' +
      '<a href="' + raiz + 'pages/privacidad.html#cookies">Más información</a>.</p>' +
      '<div><button type="button" data-v="si">Aceptar</button>' +
      '<button type="button" data-v="no">Rechazar</button></div>';
    d.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      guardar(b.getAttribute("data-v"));
      if (b.getAttribute("data-v") === "no") {
        window["ga-disable-" + ID] = true;
        document.cookie.split(";").forEach(function (c) {
          var n = c.split("=")[0].trim();
          if (n.indexOf("_ga") === 0) document.cookie = n + "=; Max-Age=0; path=/; domain=." + location.hostname.replace(/^www\./, "");
        });
      }
      d.remove();
    });
    document.body.appendChild(d);
  }

  // Permite cambiar la elección desde la política de privacidad
  window.jasicCookies = function () { try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } location.reload(); };
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-cookies-cambiar]")) window.jasicCookies();
  });

  var eleccion = leer();
  if (eleccion === "no") {
    window["ga-disable-" + ID] = true;
    return;
  }
  cargarGA();
  if (eleccion !== "si") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aviso);
    else aviso();
  }
})();
