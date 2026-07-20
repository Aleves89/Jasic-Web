// Carrusel de banners (home)
(function () {
  var slides = document.querySelectorAll(".carousel-slide");
  var container = document.querySelector(".carousel-container");
  if (!slides.length || !container) return;

  var currentIndex = 0;
  var timer = null;

  // Indicadores (dots)
  var dots = document.createElement("div");
  dots.className = "carousel-dots";
  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", "Ir al banner " + (i + 1));
    dot.addEventListener("click", function () {
      currentIndex = i;
      updateCarousel();
      restart();
    });
    dots.appendChild(dot);
  });
  container.parentNode.appendChild(dots);

  function updateCarousel() {
    slides.forEach(function (slide, index) {
      slide.classList.toggle("active", index === currentIndex);
    });
    dots.querySelectorAll(".carousel-dot").forEach(function (d, i) {
      d.classList.toggle("active", i === currentIndex);
    });

    var slideWidth = slides[0].offsetWidth + 50; // margin incluido
    var viewportCenter = window.innerWidth / 2;
    var slideCenter = slideWidth / 2;
    var offset = viewportCenter - slideCenter - currentIndex * slideWidth;
    container.style.transform = "translateX(" + offset + "px)";
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }

  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 4000);
  }

  window.addEventListener("resize", updateCarousel);

  updateCarousel();
  restart();
})();
