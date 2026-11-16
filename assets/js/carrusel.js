// Banners del inicio (FUN-04, ACC-03, REN-15): banda de ancho completo con scroll-snap,
// anterior/siguiente, pausa y avance automático que se detiene con el cursor, el foco,
// la pestaña oculta o la preferencia de movimiento reducido.
(function () {
  "use strict";
  var raiz = document.querySelector(".banners");
  if (!raiz) return;
  var pista = raiz.querySelector(".banners-pista");
  var slides = Array.prototype.slice.call(pista.children);
  if (slides.length < 2) return;

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pausado = reducido;
  var actual = 0;
  var timer = null;

  var controles = document.createElement("div");
  controles.className = "banners-controles";
  controles.innerHTML =
    '<button type="button" class="banners-ant" aria-label="Banner anterior">&#8592;</button>' +
    '<div class="banners-puntos"></div>' +
    '<button type="button" class="banners-sig" aria-label="Banner siguiente">&#8594;</button>' +
    '<button type="button" class="banners-pausa"></button>';
  raiz.appendChild(controles);
  var puntos = controles.querySelector(".banners-puntos");
  var btnPausa = controles.querySelector(".banners-pausa");

  slides.forEach(function (_, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Ver banner " + (i + 1) + " de " + slides.length);
    b.addEventListener("click", function () { ir(i); });
    puntos.appendChild(b);
  });

  function marcar() {
    Array.prototype.forEach.call(puntos.children, function (b, i) {
      b.setAttribute("aria-current", i === actual ? "true" : "false");
    });
    btnPausa.textContent = pausado ? "▶" : "❚❚";
    btnPausa.setAttribute("aria-label", pausado ? "Reanudar banners" : "Pausar banners");
  }

  function ir(i) {
    actual = (i + slides.length) % slides.length;
    pista.scrollTo({ left: slides[actual].offsetLeft - pista.offsetLeft, behavior: reducido ? "auto" : "smooth" });
    marcar();
  }

  function arrancar() {
    detener();
    if (!pausado && !document.hidden) timer = setInterval(function () { ir(actual + 1); }, 6000);
  }
  function detener() { if (timer) { clearInterval(timer); timer = null; } }

  controles.querySelector(".banners-ant").addEventListener("click", function () { ir(actual - 1); arrancar(); });
  controles.querySelector(".banners-sig").addEventListener("click", function () { ir(actual + 1); arrancar(); });
  btnPausa.addEventListener("click", function () { pausado = !pausado; marcar(); arrancar(); });

  // Sincroniza el punto activo cuando el usuario desliza con el dedo
  var espera;
  pista.addEventListener("scroll", function () {
    clearTimeout(espera);
    espera = setTimeout(function () {
      var i = Math.round(pista.scrollLeft / pista.clientWidth);
      if (i !== actual) { actual = i; marcar(); }
    }, 120);
  }, { passive: true });

  raiz.addEventListener("mouseenter", detener);
  raiz.addEventListener("mouseleave", arrancar);
  raiz.addEventListener("focusin", detener);
  raiz.addEventListener("focusout", arrancar);
  document.addEventListener("visibilitychange", function () { document.hidden ? detener() : arrancar(); });

  marcar();
  arrancar();
})();
