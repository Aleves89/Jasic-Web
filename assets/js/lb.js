// LIGHTBOX COMPLETO - PC + MÓVIL
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Lightbox JASIC - Inicializando...');
  
  // ============================================
  // CONFIGURACIÓN
  // ============================================
  const CONFIG = {
    lightboxId: 'lightbox',
    lightboxImgId: 'lightbox-img',
    galleryImgClass: 'lightbox-img',
    maxScale: 5,
    minScale: 0.5,
    zoomStep: 0.2,
    enableDragAlways: false // true = drag siempre, false = solo con zoom
  };
  
  // ============================================
  // ESTADO
  // ============================================
  const state = {
    scale: 1,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    isOpen: false,
    // Touch state
    initialDistance: 0,
    initialScale: 1,
    lastTouchX: 0,
    lastTouchY: 0,
    isPinching: false
  };
  
  // ============================================
  // ELEMENTOS DEL DOM
  // ============================================
  let elements = {};
  
  // ============================================
  // 1. OBTENER/CREAR ELEMENTOS
  // ============================================
  function getElements() {
    // Si el lightbox no existe, crearlo
    if (!document.getElementById(CONFIG.lightboxId)) {
      console.log('🔧 Creando elementos del lightbox...');
      
      const html = `
        <div id="${CONFIG.lightboxId}">
          <div class="lightbox-overlay"></div>
          <div class="lightbox-inner">
            <img id="${CONFIG.lightboxImgId}" alt="" class="lightbox-image">
          </div>
          <span class="lightbox-close">&times;</span>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', html);
    }
    
    // Guardar referencias
    elements = {
      lightbox: document.getElementById(CONFIG.lightboxId),
      image: document.getElementById(CONFIG.lightboxImgId),
      overlay: document.querySelector('.lightbox-overlay'),
      closeBtn: document.querySelector('.lightbox-close'),
      inner: document.querySelector('.lightbox-inner')
    };
    
    // Aplicar estilos críticos por si falla el CSS
    applyCriticalStyles();
    
    return elements;
  }
  
  // ============================================
  // 2. APLICAR ESTILOS CRÍTICOS
  // ============================================
  function applyCriticalStyles() {
    // Lightbox principal
    Object.assign(elements.lightbox.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      zIndex: '999999',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center'
    });
    
    // Overlay
    Object.assign(elements.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.95)',
      zIndex: '1',
      cursor: 'pointer'
    });
    
    // Contenedor interno
    Object.assign(elements.inner.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90vw',
      maxHeight: '90vh',
      zIndex: '2',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
    
    // Imagen
    Object.assign(elements.image.style, {
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
      objectFit: 'contain',
      display: 'block',
      transformOrigin: 'center center',
      cursor: 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none' // IMPORTANTE para móviles
    });
    
    // Botón cerrar
    Object.assign(elements.closeBtn.style, {
      position: 'fixed',
      top: '20px',
      right: '30px',
      zIndex: '3',
      fontSize: '36px',
      color: 'white',
      cursor: 'pointer',
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      lineHeight: '1',
      border: '2px solid rgba(255,255,255,0.3)'
    });
  }
  
  // ============================================
  // 3. FUNCIONES DE TRANSFORMACIÓN
  // ============================================
  function updateTransform() {
    elements.image.style.transform = `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`;
  }
  
  function centerImage() {
    state.scale = 1;
    state.posX = 0;
    state.posY = 0;
    updateTransform();
    elements.image.style.cursor = 'default';
    elements.image.style.transformOrigin = 'center center';
  }
  
  function clampPosition() {
    if (state.scale <= 1) {
      state.posX = 0;
      state.posY = 0;
      return;
    }
    
    const imgRect = elements.image.getBoundingClientRect();
    const containerRect = elements.lightbox.getBoundingClientRect();
    
    const originalWidth = elements.image.naturalWidth || imgRect.width;
    const originalHeight = elements.image.naturalHeight || imgRect.height;
    const scaledWidth = originalWidth * state.scale;
    const scaledHeight = originalHeight * state.scale;
    
    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
    
    state.posX = Math.min(maxX, Math.max(-maxX, state.posX));
    state.posY = Math.min(maxY, Math.max(-maxY, state.posY));
  }
  
  // ============================================
  // 4. ZOOM HACIA EL CURSOR (PC)
  // ============================================
  function zoomToCursor(delta, clientX, clientY) {
    const zoomIn = delta < 0;
    const oldScale = state.scale;
    
    // Calcular nuevo scale
    const newScale = zoomIn ? 
      Math.min(state.scale * (1 + CONFIG.zoomStep), CONFIG.maxScale) :
      Math.max(state.scale * (1 - CONFIG.zoomStep), CONFIG.minScale);
    
    // Si no hay cambio, salir
    if (newScale === oldScale) return;
    
    // Calcular posición relativa del cursor
    const rect = elements.image.getBoundingClientRect();
    const cursorX = (clientX - rect.left) / rect.width;
    const cursorY = (clientY - rect.top) / rect.height;
    
    // Establecer origen de transformación
    elements.image.style.transformOrigin = `${cursorX * 100}% ${cursorY * 100}%`;
    
    // Ajustar posición para mantener el cursor en el mismo lugar
    const scaleChange = newScale / oldScale;
    const imgWidth = rect.width / oldScale;
    const imgHeight = rect.height / oldScale;
    
    state.posX -= (cursorX - 0.5) * imgWidth * (scaleChange - 1);
    state.posY -= (cursorY - 0.5) * imgHeight * (scaleChange - 1);
    state.scale = newScale;
    
    clampPosition();
    updateTransform();
    elements.image.style.cursor = state.scale > 1 ? 'grab' : 'default';
  }
  
  // ============================================
  // 5. PINCH ZOOM (MÓVIL)
  // ============================================
  function handlePinchZoom(touch1, touch2, isStart = false) {
    if (isStart) {
      // Iniciar pinch
      state.initialScale = state.scale;
      state.initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      state.isPinching = true;
      return;
    }
    
    // Continuar pinch
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    if (state.initialDistance > 0) {
      const scaleChange = currentDistance / state.initialDistance;
      const newScale = Math.min(
        Math.max(state.initialScale * scaleChange, CONFIG.minScale),
        CONFIG.maxScale
      );
      
      // Calcular centro entre dedos
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // Aplicar zoom hacia el centro
      if (newScale !== state.scale) {
        const oldScale = state.scale;
        const rect = elements.image.getBoundingClientRect();
        const relativeX = (centerX - rect.left) / rect.width;
        const relativeY = (centerY - rect.top) / rect.height;
        
        elements.image.style.transformOrigin = `${relativeX * 100}% ${relativeY * 100}%`;
        
        const scaleRatio = newScale / oldScale;
        const imgWidth = rect.width / oldScale;
        const imgHeight = rect.height / oldScale;
        
        state.posX -= (relativeX - 0.5) * imgWidth * (scaleRatio - 1);
        state.posY -= (relativeY - 0.5) * imgHeight * (scaleRatio - 1);
        state.scale = newScale;
        
        clampPosition();
        updateTransform();
      }
    }
  }
  
  // ============================================
  // 6. FUNCIONES PRINCIPALES
  // ============================================
  function openLightbox(src) {
    if (state.isOpen) return;
    
    getElements();
    
    // Pre-cargar imagen
    const loader = new Image();
    loader.onload = function() {
      elements.image.src = src;
      elements.lightbox.style.display = 'flex';
      elements.lightbox.classList.add('active');
      document.body.classList.add('lightbox-open');
      state.isOpen = true;
      
      // Centrar imagen
      setTimeout(() => {
        centerImage();
      }, 10);
    };
    
    loader.onerror = function() {
      console.error('❌ Error al cargar la imagen:', src);
    };
    
    loader.src = src;
  }
  
  function closeLightbox() {
    if (!state.isOpen) return;
    
    elements.lightbox.style.display = 'none';
    elements.lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    state.isOpen = false;
    
    // Resetear después de un momento
    setTimeout(() => {
      elements.image.src = '';
      centerImage();
      state.isDragging = false;
      state.isPinching = false;
    }, 100);
  }
  
  // ============================================
  // 7. EVENTOS DE MOUSE (PC)
  // ============================================
  function setupMouseEvents() {
    // Zoom con rueda
    elements.lightbox.addEventListener('wheel', function(e) {
      if (!state.isOpen) return;
      e.preventDefault();
      zoomToCursor(e.deltaY, e.clientX, e.clientY);
    });
    
    // Drag
    elements.image.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      if (!CONFIG.enableDragAlways && state.scale <= 1) return;
      
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
      
      clampPosition();
      updateTransform();
    });
    
    document.addEventListener('mouseup', function() {
      if (!state.isDragging) return;
      
      state.isDragging = false;
      elements.image.style.cursor = state.scale > 1 ? 'grab' : 'default';
    });
    
    // Doble click para reset
    elements.image.addEventListener('dblclick', function(e) {
      e.preventDefault();
      centerImage();
    });
  }
  
  // ============================================
  // 8. EVENTOS TOUCH (MÓVIL)
  // ============================================
  function setupTouchEvents() {
    // Prevenir zoom nativo del navegador
    elements.image.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Touchstart
    elements.image.addEventListener('touchstart', function(e) {
      if (!state.isOpen) return;
      
      if (e.touches.length === 2) {
        // Pinch zoom
        handlePinchZoom(e.touches[0], e.touches[1], true);
        state.lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        state.lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      } else if (e.touches.length === 1 && state.scale > 1) {
        // Drag con un dedo
        state.lastTouchX = e.touches[0].clientX;
        state.lastTouchY = e.touches[0].clientY;
      }
    });
    
    // Touchmove
    elements.image.addEventListener('touchmove', function(e) {
      if (!state.isOpen) return;
      
      if (e.touches.length === 2 && state.isPinching) {
        // Pinch zoom activo
        e.preventDefault();
        handlePinchZoom(e.touches[0], e.touches[1]);
        
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        state.lastTouchX = centerX;
        state.lastTouchY = centerY;
        
      } else if (e.touches.length === 1 && state.scale > 1) {
        // Drag con un dedo
        const touch = e.touches[0];
        const deltaX = touch.clientX - state.lastTouchX;
        const deltaY = touch.clientY - state.lastTouchY;
        
        state.posX += deltaX;
        state.posY += deltaY;
        
        state.lastTouchX = touch.clientX;
        state.lastTouchY = touch.clientY;
        
        clampPosition();
        updateTransform();
      }
    }, { passive: false });
    
    // Touchend
    elements.image.addEventListener('touchend', function() {
      state.isPinching = false;
      state.initialDistance = 0;
    });
  }
  
  // ============================================
  // 9. CONFIGURAR EVENTOS GLOBALES
  // ============================================
  function setupGlobalEvents() {
    // Imágenes de galería
    document.querySelectorAll('.' + CONFIG.galleryImgClass).forEach(img => {
      // Clonar para limpiar eventos antiguos
      const newImg = img.cloneNode(true);
      img.parentNode.replaceChild(newImg, img);
      
      // Nuevo evento
      newImg.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(this.src);
      });
    });
    
    // Botón cerrar
    elements.closeBtn.addEventListener('click', closeLightbox);
    
    // Overlay (fondo)
    elements.overlay.addEventListener('click', closeLightbox);
    
    // Tecla Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.isOpen) {
        closeLightbox();
      }
    });
    
    // Setup eventos específicos
    setupMouseEvents();
    setupTouchEvents();
  }
  
  // ============================================
  // 10. INICIALIZACIÓN
  // ============================================
  function init() {
    console.log('🎬 Inicializando lightbox...');
    
    // 1. Obtener/crear elementos
    getElements();
    
    // 2. Configurar eventos
    setupGlobalEvents();
    
    // 3. API pública
    window.JasicLightbox = {
      open: openLightbox,
      close: closeLightbox,
      center: centerImage,
      getState: () => ({ ...state }),
      enableDrag: (enable) => {
        CONFIG.enableDragAlways = enable;
        elements.image.style.cursor = enable ? 'grab' : 'default';
      }
    };
    
    console.log('✨ Lightbox inicializado correctamente');
    console.log('📋 Usa JasicLightbox en la consola para controlar');
  }
  
  // ============================================
  // EJECUCIÓN
  // ============================================
  // Pequeño delay para asegurar que todo el DOM esté listo
  setTimeout(init, 100);
});

// ============================================
// FUNCIONES DE EMERGENCIA (siempre disponibles)
// ============================================
(function() {
  // Comando de emergencia global
  window.fixLightboxEmergency = function() {
    console.log('🆘 EJECUTANDO REPARACIÓN DE EMERGENCIA');
    
    // Forzar cierre si está abierto
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.style.display = 'none';
      lb.classList.remove('active');
      document.body.classList.remove('lightbox-open');
      console.log('🚪 Lightbox cerrado forzosamente');
    }
    
    // Reconectar todas las imágenes
    const images = document.querySelectorAll('.lightbox-img');
    images.forEach((img, i) => {
      const newImg = img.cloneNode(true);
      img.parentNode.replaceChild(newImg, img);
      
      newImg.onclick = function(e) {
        e.preventDefault();
        const lbImg = document.getElementById('lightbox-img');
        const lb = document.getElementById('lightbox');
        if (lbImg && lb) {
          lbImg.src = this.src;
          lb.style.display = 'flex';
          lb.classList.add('active');
          document.body.classList.add('lightbox-open');
          console.log(`📸 Imagen ${i+1} abierta`);
        }
      };
    });
    
    // Reconectar botón cerrar
    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.onclick = function() {
        const lb = document.getElementById('lightbox');
        if (lb) {
          lb.style.display = 'none';
          lb.classList.remove('active');
          document.body.classList.remove('lightbox-open');
        }
      };
    }
    
    console.log(`✅ ${images.length} imágenes reconectadas`);
    console.log('💡 Prueba hacer click en una imagen ahora');
  };
  
  console.log('🛠️ Comandos de emergencia cargados:');
  console.log('   - fixLightboxEmergency()');
})();