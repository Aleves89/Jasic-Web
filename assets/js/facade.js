// Carga diferida de videos de YouTube y del mapa de Google: el contenido de terceros
// (y sus cookies) se carga recién cuando el visitante hace clic (REN-11, PRI-04).
(function () {
  "use strict";
  document.querySelectorAll("[data-youtube]").forEach(function (b) {
    var id = b.getAttribute("data-youtube");
    b.style.backgroundImage = "url('https://i.ytimg.com/vi/" + id + "/hqdefault.jpg')";
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = b.getAttribute("data-titulo") || "Video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      b.replaceWith(f);
      f.focus();
    });
  });

  document.querySelectorAll("[data-mapa]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = b.getAttribute("data-mapa");
      f.title = b.getAttribute("data-titulo") || "Mapa";
      f.loading = "lazy";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      f.allowFullscreen = true;
      b.replaceWith(f);
    });
  });

  // Contacto: completa el mensaje cuando se llega desde una ficha (?equipo=...)
  var equipo = new URLSearchParams(window.location.search).get("equipo");
  var mensaje = document.getElementById("mensaje");
  if (equipo && mensaje && !mensaje.value) {
    mensaje.value = "Consulta técnica sobre el equipo " + equipo.slice(0, 80) + ": ";
  }
})();
