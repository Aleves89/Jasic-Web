// Filtro del listado de productos (FUN-09, ACC-11)
document.addEventListener("DOMContentLoaded", function () {
  var botones = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var secciones = Array.prototype.slice.call(document.querySelectorAll(".product-section"));
  if (!botones.length) return;
  var validas = botones.map(function (b) { return b.dataset.filter; });

  function aplicar(filtro, actualizarURL) {
    if (validas.indexOf(filtro) === -1) filtro = "all";
    secciones.forEach(function (s) {
      s.hidden = !(filtro === "all" || s.dataset.category === filtro);
    });
    botones.forEach(function (b) {
      var activo = b.dataset.filter === filtro;
      b.classList.toggle("active", activo);
      b.setAttribute("aria-pressed", activo ? "true" : "false");
    });
    if (actualizarURL && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (filtro === "all") url.searchParams.delete("categoria");
      else url.searchParams.set("categoria", filtro);
      window.history.replaceState(null, "", url);
    }
  }

  botones.forEach(function (b) {
    b.addEventListener("click", function () { aplicar(b.dataset.filter, true); });
  });

  aplicar(new URLSearchParams(window.location.search).get("categoria") || "all", false);
});
