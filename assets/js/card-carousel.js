(function () {

  /* ================================================
     LIGHTBOX
     Requiere en el HTML:
       <div id="lightbox">
         <div class="lightbox-overlay" id="lightbox-overlay"></div>
         <div class="lightbox-inner">
           <img id="lightbox-img" src="" alt="">
         </div>
         <button class="lightbox-prev" id="lightbox-prev">&#8592;</button>
         <button class="lightbox-next" id="lightbox-next">&#8594;</button>
         <div class="lightbox-close" id="lightbox-close">&#x2715;</div>
       </div>
     ================================================ */

  const lb        = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbClose   = document.getElementById('lightbox-close');
  const lbOverlay = document.getElementById('lightbox-overlay');
  const lbPrev    = document.getElementById('lightbox-prev');
  const lbNext    = document.getElementById('lightbox-next');

  let lbImages = [];
  let lbIndex  = 0;

  function openLightbox(images, startIndex) {
    lbImages = images;
    lbIndex  = startIndex;
    lbImg.src = lbImages[lbIndex];
    lb.classList.add('active');
    document.body.classList.add('lightbox-open');
    updateLbArrows();
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    lbImg.src = '';
  }

  function lbGo(delta) {
    lbIndex = (lbIndex + delta + lbImages.length) % lbImages.length;
    lbImg.src = lbImages[lbIndex];
    updateLbArrows();
  }

  function updateLbArrows() {
    const show = lbImages.length > 1;
    if (lbPrev) lbPrev.style.display = show ? 'flex' : 'none';
    if (lbNext) lbNext.style.display = show ? 'flex' : 'none';
  }

  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
  if (lbPrev)    lbPrev.addEventListener('click', () => lbGo(-1));
  if (lbNext)    lbNext.addEventListener('click', () => lbGo(1));

  document.addEventListener('keydown', e => {
    if (!lb || !lb.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbGo(-1);
    if (e.key === 'ArrowRight') lbGo(1);
  });

  /* ================================================
     CARRUSELES
     Uso en cada card:
       <div class="card-carousel"
            data-images='["img1.png","img2.png","img3.png"]'>
       </div>
     ================================================ */

  document.querySelectorAll('.card-carousel').forEach(carousel => {

    let images, alts;
    try {
      images = JSON.parse(carousel.dataset.images || '[]');
      alts   = JSON.parse(carousel.dataset.alts   || '[]');
    } catch (e) {
      images = [];
      alts   = [];
    }
    if (!images.length) return;

    const total = images.length;
    let current = 0;
    let hoverTimer = null;

    /* -- Track -- */
    const track = document.createElement('div');
    track.className = 'card-carousel-track';

    images.forEach((src, index) => {
      const slide = document.createElement('div');
      slide.className = 'card-carousel-slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = alts[index] || '';
      img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
    });

    carousel.appendChild(track);

    /* -- Puntos + badge + zonas (solo si hay más de 1 imagen) -- */
    let dots = [];

    if (total > 1) {

      const dotsEl = document.createElement('div');
      dotsEl.className = 'card-carousel-dots';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'card-carousel-dot' + (i === 0 ? ' active' : '');
        dotsEl.appendChild(dot);
        dots.push(dot);
      }
      carousel.appendChild(dotsEl);

      const countEl = document.createElement('div');
      countEl.className = 'card-carousel-count';
      countEl.textContent = `1 / ${total}`;
      carousel.appendChild(countEl);

      ['left', 'right'].forEach(side => {
        const zone = document.createElement('div');
        zone.className = `card-carousel-zone ${side}`;
        carousel.appendChild(zone);

        zone.addEventListener('mouseenter', () => {
          const delta = side === 'right' ? 1 : -1;
          hoverTimer = setInterval(() => goTo(current + delta), 1500);
        });
        zone.addEventListener('mouseleave', () => clearInterval(hoverTimer));
        zone.addEventListener('click', e => {
          e.stopPropagation();
          goTo(current + (side === 'right' ? 1 : -1));
        });
      });
    }

    /* -- Lupa -- */
    const zoom = document.createElement('div');
    zoom.className = 'card-carousel-zoom';
    zoom.innerHTML = `<svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5"/><line x1="12" y1="12" x2="18" y2="18"/></svg>`;
    carousel.appendChild(zoom);

    /* -- Navegación -- */
    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      const countEl = carousel.querySelector('.card-carousel-count');
      if (countEl) countEl.textContent = `${current + 1} / ${total}`;
    }

    /* -- Abrir lightbox -- */
    function openFromCarousel() {
      openLightbox(images, current);
    }

    zoom.addEventListener('click', e => { e.stopPropagation(); openFromCarousel(); });
    track.addEventListener('click', openFromCarousel);

    /* -- Touch swipe -- */
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) goTo(current + (delta > 0 ? 1 : -1));
      else openFromCarousel();
    }, { passive: true });

  });

})();