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
// TOUCH EVENTS PARA MÓVIL
// =====================
function setupTouchEvents() {
  let initialDistance = 0;
  let initialScale = 1;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let isPinching = false;
  
  // TOUCHSTART - Iniciar interacción
  elements.image.addEventListener('touchstart', function(e) {
    if (!state.isOpen) return;
    
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // PINCH ZOOM (dos dedos)
      isPinching = true;
      initialScale = state.scale;
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calcular centro entre los dos dedos
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // Guardar como último centro para zoom
      lastTouchX = centerX;
      lastTouchY = centerY;
      
    } else if (e.touches.length === 1 && state.scale > 1) {
      // DRAG (un dedo, solo si hay zoom)
      const touch = e.touches[0];
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    }
    
  }, { passive: false }); // IMPORTANTE: passive: false para poder usar preventDefault()
  
  // TOUCHMOVE - Manejar movimiento
  elements.image.addEventListener('touchmove', function(e) {
    if (!state.isOpen) return;
    
    e.preventDefault();
    
    if (e.touches.length === 2 && isPinching) {
      // ZOOM CON PINCH
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calcular nuevo scale basado en la distancia
      if (initialDistance > 0) {
        const scaleChange = currentDistance / initialDistance;
        state.scale = Math.min(
          Math.max(initialScale * scaleChange, CONFIG.minScale),
          CONFIG.maxScale
        );
        
        // Calcular centro actual
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Ajustar posición para zoom hacia el centro
        adjustPositionForZoom(centerX, centerY, scaleChange);
        
        lastTouchX = centerX;
        lastTouchY = centerY;
        
        updateTransform();
      }
      
    } else if (e.touches.length === 1 && state.scale > 1) {
      // DRAG CON UN DEDO
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchX;
      const deltaY = touch.clientY - lastTouchY;
      
      state.posX += deltaX;
      state.posY += deltaY;
      
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      
      updateTransform();
    }
    
  }, { passive: false });
  
  // TOUCHEND - Finalizar interacción
  elements.image.addEventListener('touchend', function(e) {
    isPinching = false;
    initialDistance = 0;
  }, { passive: true });
  
  // Función auxiliar para ajustar posición durante zoom
  function adjustPositionForZoom(centerX, centerY, scaleChange) {
    const rect = elements.image.getBoundingClientRect();
    
    // Calcular posición relativa del centro en la imagen
    const relativeX = (centerX - rect.left) / rect.width;
    const relativeY = (centerY - rect.top) / rect.height;
    
    // Ajustar posición para mantener el punto bajo los dedos
    state.posX = state.posX * scaleChange - (relativeX - 0.5) * rect.width * (scaleChange - 1);
    state.posY = state.posY * scaleChange - (relativeY - 0.5) * rect.height * (scaleChange - 1);
  }
  
  console.log('📱 Touch events configurados para móvil');
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