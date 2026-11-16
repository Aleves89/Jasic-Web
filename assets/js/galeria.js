// Visor de fotos de las fichas (reemplaza lb.js): <dialog> nativo, teclado, anterior/siguiente.
// Marcado: botones con [data-visor] y atributos data-grande (imagen) y data-titulo (texto).
(function () {
  "use strict";
  var botones = Array.prototype.slice.call(document.querySelectorAll("[data-visor]"));
  var visor = document.getElementById("visor");
  if (!botones.length || !visor || typeof visor.showModal !== "function") return;

  // Fotos únicas (la foto principal también está en la galería)
  var fotos = [];
  var indice = {};
  botones.forEach(function (b) {
    var src = b.getAttribute("data-grande");
    if (!(src in indice)) { indice[src] = fotos.length; fotos.push(b); }
  });

  var img = visor.querySelector("img");
  var leyenda = visor.querySelector("figcaption");
  var actual = 0;
  var tocarX = null;

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length;
    var b = fotos[actual];
    img.src = b.getAttribute("data-grande");
    img.alt = b.getAttribute("data-titulo") || "";
    leyenda.textContent = (b.getAttribute("data-titulo") || "") + "";
  }

  var origen = null;
  botones.forEach(function (b) {
    b.addEventListener("click", function () {
      origen = b;
      mostrar(indice[b.getAttribute("data-grande")]);
      document.body.classList.add("lightbox-open");
      visor.showModal();
    });
  });

  visor.querySelector(".visor-cerrar").addEventListener("click", function () { visor.close(); });
  visor.querySelector(".visor-ant").addEventListener("click", function () { mostrar(actual - 1); });
  visor.querySelector(".visor-sig").addEventListener("click", function () { mostrar(actual + 1); });

  visor.addEventListener("click", function (e) { if (e.target === visor) visor.close(); });
  visor.addEventListener("close", function () {
    document.body.classList.remove("lightbox-open");
    img.removeAttribute("src");
    if (origen) origen.focus();
  });
  visor.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });
  visor.addEventListener("touchstart", function (e) { tocarX = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener("touchend", function (e) {
    if (tocarX === null) return;
    var d = e.changedTouches[0].clientX - tocarX;
    if (Math.abs(d) > 50) mostrar(actual + (d < 0 ? 1 : -1));
    tocarX = null;
  }, { passive: true });

  if (fotos.length < 2) {
    visor.querySelector(".visor-ant").hidden = true;
    visor.querySelector(".visor-sig").hidden = true;
  }
})();
