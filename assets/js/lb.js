// LIGHTBOX CON ZOOM HACIA EL CURSOR CORREGIDO
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Lightbox con zoom corregido');
  
  const CONFIG = {
    maxScale: 5,
    minScale: 0.5,
    zoomStep: 0.2
  };
  
  const state = {
    scale: 1,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    isOpen: false,
    transformOrigin: { x: 0.5, y: 0.5 } // Centro por defecto
  };
  
  let elements = {};
  
  // =====================
  // FUNCIONES BÁSICAS
  // =====================
  function getElements() {
    if (!document.getElementById('lightbox')) {
      const html = `
        <div id="lightbox">
          <div class="lightbox-overlay"></div>
          <div class="lightbox-inner">
            <img id="lightbox-img" alt="">
          </div>
          <span class="lightbox-close">&times;</span>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
    }
    
    elements = {
      lightbox: document.getElementById('lightbox'),
      image: document.getElementById('lightbox-img'),
      overlay: document.querySelector('.lightbox-overlay'),
      closeBtn: document.querySelector('.lightbox-close'),
      inner: document.querySelector('.lightbox-inner')
    };
    
    return elements;
  }
  
  function updateTransform() {
    // Aplicar transform-origin basado en la posición del cursor
    elements.image.style.transform = `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`;
  }
  
  function centerImage() {
    state.scale = 1;
    state.posX = 0;
    state.posY = 0;
    updateTransform();
    elements.image.style.cursor = 'default';
    console.log('🎯 Imagen centrada');
  }
  
  // =====================
  // ZOOM HACIA EL CURSOR (CORREGIDO)
  // =====================
  function zoomToCursor(delta, clientX, clientY) {
    const zoomIn = delta < 0;
    const oldScale = state.scale;
    
    // Calcular nuevo scale
    const newScale = zoomIn ? 
      Math.min(state.scale * (1 + CONFIG.zoomStep), CONFIG.maxScale) :
      Math.max(state.scale * (1 - CONFIG.zoomStep), CONFIG.minScale);
    
    // Si no hay cambio, salir
    if (newScale === oldScale) return;
    
    // Calcular posición relativa del cursor dentro de la imagen
    // Esto es CRÍTICO para que el zoom vaya hacia el cursor
    const rect = elements.image.getBoundingClientRect();
    
    // 1. Posición del cursor relativa a la imagen (0 a 1)
    const cursorX = (clientX - rect.left) / rect.width;
    const cursorY = (clientY - rect.top) / rect.height;
    
    // 2. Guardar estas coordenadas como origen de transformación
    elements.image.style.transformOrigin = `${cursorX * 100}% ${cursorY * 100}%`;
    
    // 3. Calcular cómo debe moverse la imagen para mantener el cursor en el mismo punto
    const scaleChange = newScale / oldScale;
    
    // 4. Ajustar posición para compensar el zoom
    // Fórmula: nuevaPos = posActual - (cursorRelativo * tamaño * (1 - 1/scaleChange))
    const imgWidth = rect.width / oldScale; // Tamaño original sin scale
    const imgHeight = rect.height / oldScale;
    
    state.posX -= (cursorX - 0.5) * imgWidth * (scaleChange - 1);
    state.posY -= (cursorY - 0.5) * imgHeight * (scaleChange - 1);
    
    // 5. Aplicar nuevo scale
    state.scale = newScale;
    
    updateTransform();
    elements.image.style.cursor = state.scale > 1 ? 'grab' : 'default';
    
    console.log('🔍 Zoom corregido:', {
      from: oldScale,
      to: newScale,
      cursorAt: { x: cursorX.toFixed(2), y: cursorY.toFixed(2) },
      transformOrigin: elements.image.style.transformOrigin
    });
  }
  
  // =====================
  // FUNCIONES PRINCIPALES
  // =====================
  function openLightbox(src) {
    getElements();
    
    // Pre-cargar imagen
    const loader = new Image();
    loader.onload = function() {
      elements.image.src = src;
      elements.lightbox.classList.add('active');
      document.body.classList.add('lightbox-open');
      state.isOpen = true;
      
      // Esperar un frame para que la imagen se renderice
      setTimeout(() => {
        centerImage();
      }, 10);
    };
    loader.src = src;
  }
  
  function closeLightbox() {
    elements.lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    state.isOpen = false;
    
    setTimeout(() => {
      elements.image.src = '';
      centerImage();
      elements.image.style.transformOrigin = 'center center'; // Resetear
    }, 300);
  }
  
  // =====================
  // EVENTOS
  // =====================
  function setupEvents() {
    // Imágenes de galería
    document.querySelectorAll('.lightbox-img').forEach(img => {
      img.addEventListener('click', function(e) {
        e.preventDefault();
        openLightbox(this.src);
      });
    });
    
    // Cerrar
    elements.closeBtn.addEventListener('click', closeLightbox);
    elements.overlay.addEventListener('click', closeLightbox);
    
    // Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.isOpen) closeLightbox();
    });
    
    // Zoom con rueda (CORREGIDO)
    elements.lightbox.addEventListener('wheel', function(e) {
      e.preventDefault();
      zoomToCursor(e.deltaY, e.clientX, e.clientY);
    });
    
    // Doble click para reset
    elements.image.addEventListener('dblclick', function(e) {
      e.preventDefault();
      centerImage();
      elements.image.style.transformOrigin = 'center center';
    });
    
    // Drag
    elements.image.addEventListener('mousedown', function(e) {
      if (e.button !== 0 || state.scale <= 1) return;
      
      e.preventDefault();
      state.isDragging = true;
      state.startX = e.clientX - state.posX;
      state.startY = e.clientY - state.posY;
      elements.image.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!state.isDragging) return;
      
      e.preventDefault();
      state.posX = e.clientX - state.startX;
      state.posY = e.clientY - state.startY;
      updateTransform();
    });
    
    document.addEventListener('mouseup', function() {
      if (!state.isDragging) return;
      
      state.isDragging = false;
      elements.image.style.cursor = state.scale > 1 ? 'grab' : 'default';
    });
  }
  
  // =====================
  // INICIALIZACIÓN
  // =====================
  function init() {
    getElements();
    setupEvents();
    
    window.JasicLightbox = {
      open: openLightbox,
      close: closeLightbox,
      center: centerImage,
      getState: () => ({ ...state }),
      testZoom: function(x, y) {
        // Testear zoom en posición específica
        zoomToCursor(-1, x || window.innerWidth/2, y || window.innerHeight/2);
      }
    };
    
    console.log('✅ Lightbox con zoom corregido listo');
    console.log('🔧 Usa JasicLightbox.testZoom(x, y) para probar');
  }
  
  init();
});