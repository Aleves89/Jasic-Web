const slides = document.querySelectorAll('.carousel-slide');
const container = document.querySelector('.carousel-container');

let currentIndex = 0;

function updateCarousel() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentIndex);
  });

  const slideWidth = slides[0].offsetWidth + 50; // margin incluido
  const viewportCenter = window.innerWidth / 2;
  const slideCenter = slideWidth / 2;

  const offset =
    viewportCenter - slideCenter - currentIndex * slideWidth;

  container.style.transform = `translateX(${offset}px)`;
}


function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  updateCarousel();
}

// automático
setInterval(nextSlide, 4000);

// iniciar
updateCarousel();
