document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".filter-btn");
  const sections = document.querySelectorAll(".product-section");

  const params = new URLSearchParams(window.location.search);
  const categoriaURL = params.get("categoria");

  function aplicarFiltro(filtro) {
    sections.forEach(section => {
      if (filtro === "all" || section.dataset.category === filtro) {
        section.style.display = "block";
      } else {
        section.style.display = "none";
      }
    });

    buttons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filter === filtro);
    });
  }

  // Click manual
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      aplicarFiltro(button.dataset.filter);
    });
  });

  // Filtro automático desde URL
  if (categoriaURL) {
    aplicarFiltro(categoriaURL);
  } else {
    aplicarFiltro("all");
  }
});
