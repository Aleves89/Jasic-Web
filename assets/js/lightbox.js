/**
 * LIGHTBOX JASIC - VERSIÓN LIGERA Y OPTIMIZADA
 * Archivo: lb-light.js
 */

// ============================================
// CONFIGURACIÓN MÍNIMA
// ============================================
const LightboxConfig = {
  lightboxId: 'lightbox',
  imageId: 'lightbox-img',
  galleryClass: 'lightbox-img',
  maxScale: 3,
  minScale: 0.5
};

// ============================================
// ESTADO SIMPLIFICADO
// ============================================
let LightboxState = {
  isOpen: false,
  scale: 1,
  posX: 0,
  posY: 0,
  isDragging: false
};

// ============================================
// ELEMENTOS DEL DOM (caché)
// ============================================
let LightboxElements = {};

// ============================================
// FUNCIÓN PRINCIPAL - CREAR LIGHTBOX
// ============================================
function createLightbox() {
  // Remover si ya existe
  const existing = document.getElementById(LightboxConfig.lightboxId);
  if (existing) existing.remove();
  
  // Crear HTML mínimo
  const html = `
    <div id="${LightboxConfig.lightboxId}" style="
      position:fixed;top:0;left:0;width:100vw;height:100vh;
      background:#000;z-index:999999;display:none;
      justify-content:center;align-items:center;">
      
      <div class="lightbox-overlay" style="
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        background:rgba(0,0,0,0.95);z-index:1;cursor:pointer;"></div>
      
      <div class="lightbox-inner" style="
        position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        max-width:90vw;max-height:90vh;z-index:2;
        display:flex;justify-content:center;align-items:center;">
        <img id="${LightboxConfig.imageId}" alt="" style="
          max-width:100%;max-height:100%;width:auto;height:auto;
          object-fit:contain;display:block;">
      </div>
      
      <span class="lightbox-close" style="
        position:fixed;top:20px;right:30px;z-index:3;
        font-size:36px;color:white;cursor:pointer;
        background:rgba(0,0,0,0.5);width:50px;height:50px;
        border-radius:50%;display:flex;justify-content:center;
        align-items:center;line-height:1;">&times;</span>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
  
  // Guardar referencias
  LightboxElements = {
    lightbox: document.getElementById(LightboxConfig.lightboxId),
    image: document.getElementById(LightboxConfig.imageId),
    overlay: document.querySelector('.lightbox-overlay'),
    closeBtn: document.querySelector('.lightbox-close'),
    inner: document.querySelector('.lightbox-inner')
  };
}

// ============================================
// FUNCIONES BÁSICAS
// ============================================
function openLightbox(src) {
  if (LightboxState.isOpen) return;
  
  LightboxElements.image.src = src;
  LightboxElements.lightbox.style.display = 'flex';
  LightboxState.isOpen = true;
  LightboxState.scale = 1;
  LightboxState.posX = 0;
  LightboxState.posY = 0;
  
  // Bloquear scroll
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!LightboxState.isOpen) return;
  
  LightboxElements.lightbox.style.display = 'none';
  LightboxState.isOpen = false;
  
  // Restaurar scroll
  document.body.style.overflow = '';
  
  // Limpiar después de un momento
  setTimeout(() => {
    LightboxElements.image.src = '';
  }, 300);
}

// ============================================
// EVENTOS SIMPLIFICADOS
// ============================================
function setupEvents() {
  // 1. Imágenes de galería
  document.querySelectorAll('.' + LightboxConfig.galleryClass).forEach(img => {
    // Usar evento simple
    img.addEventListener('click', function(e) {
      e.preventDefault();
      openLightbox(this.src);
    });
  });
  
  // 2. Botón cerrar
  LightboxElements.closeBtn.addEventListener('click', closeLightbox);
  
  // 3. Overlay
  LightboxElements.overlay.addEventListener('click', closeLightbox);
  
  // 4. Tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && LightboxState.isOpen) {
      closeLightbox();
    }
  });
  
  // 5. Zoom básico (solo rueda)
  LightboxElements.lightbox.addEventListener('wheel', function(e) {
    if (!LightboxState.isOpen) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    LightboxState.scale = Math.max(
      LightboxConfig.minScale,
      Math.min(LightboxConfig.maxScale, LightboxState.scale * delta)
    );
    
    LightboxElements.image.style.transform = `scale(${LightboxState.scale})`;
  });
}

// ============================================
// INICIALIZACIÓN (DOMContentLoaded)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('⚡ Lightbox ligero inicializando...');
  
  // Crear estructura
  createLightbox();
  
  // Configurar eventos
  setupEvents();
  
  console.log('✅ Lightbox listo');
  
  // API simple
  window.SimpleLightbox = {
    open: openLightbox,
    close: closeLightbox
  };
});

// ============================================
// COMANDO DE EMERGENCIA (siempre disponible)
// ============================================
window.fixLightboxFast = function() {
  console.log('🔧 Reparación rápida...');
  
  const lb = document.getElementById('lightbox');
  if (lb) lb.style.display = 'none';
  
  document.body.style.overflow = '';
  
  // Reconectar imágenes
  document.querySelectorAll('.lightbox-img').forEach(img => {
    img.onclick = function(e) {
      e.preventDefault();
      const lbImg = document.getElementById('lightbox-img');
      const lb = document.getElementById('lightbox');
      if (lbImg && lb) {
        lbImg.src = this.src;
        lb.style.display = 'flex';
      }
    };
  });
  
  console.log('✅ Reparado');
};