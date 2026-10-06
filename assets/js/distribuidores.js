/* =========================================================
   DÓNDE COMPRAR — Localizador de distribuidores JASIC
   ---------------------------------------------------------
   Los datos viven en distribuidores.data.js (array DISTRIBUIDORES).
   Este archivo solo contiene la lógica:
     - Mapa de Argentina (Leaflet + Esri Dark Gray Canvas, sin API key) con puntos rojos
     - Geolocalización aproximada por IP del visitante
     - Orden de la lista por cercanía (Haversine)
     - Búsqueda / filtros / tarjetas
   ========================================================= */

const TIPOS = {
  oficial:  "Distribuidor Oficial",
  venta:    "Punto de Venta",
  servicio: "Servicio Técnico"
};

/* Centro y encuadre de Argentina continental */
const AR_CENTER = [-38.5, -64.5];
const AR_BOUNDS = [[-55.5, -74.5], [-21.5, -53.0]];

/* ---------- Iconos SVG (inline, sin dependencias) ---------- */
const ICON = {
  pin:   '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  web:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
  ig:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  fb:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z"/></svg>',
  wa:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>',
  tt:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.4 1.4V7.3a4.3 4.3 0 0 1-3.3-1.5z"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  near:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>'
};

/* ---------- Estado ---------- */
const state = {
  q: "", provincia: "", tipo: "",
  activo: null,                 // índice en DISTRIBUIDORES
  visitante: null,              // { lat, lng, ciudad, fuente }
  orden: "cercania"             // "cercania" | "nombre"
};

let map = null;
const markers = new Map();      // idx -> L.marker

/* ---------- Referencias DOM ---------- */
const $list     = document.getElementById("dc-list");
const $count    = document.getElementById("dc-count");
const $search   = document.getElementById("dc-search");
const $prov     = document.getElementById("dc-provincia");
const $chips    = document.querySelectorAll(".dc-chip");
const $near     = document.getElementById("dc-near");
const $geoBtn   = document.getElementById("dc-geo");
const $ciudadForm  = document.getElementById("dc-ciudad-form");
const $ciudadInput = document.getElementById("dc-ciudad");
const $ciudadList  = document.getElementById("dc-ciudades");
let visitanteMarker = null;
const $statPuntos = document.getElementById("stat-puntos");
const $statProv   = document.getElementById("stat-provincias");

/* ---------- Utilidades ---------- */
const normalizar = (s) =>
  (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const tieneCoords = (d) => Number.isFinite(d.lat) && Number.isFinite(d.lng);

function mapsLinkUrl(d) {
  if (tieneCoords(d)) return `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.mapsQuery || d.direccion);
}

/* Distancia en km entre dos puntos (Haversine) */
function distanciaKm(a, b) {
  const R = 6371, toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ¿El punto cae en Argentina? Recuadro amplio (incluye Tierra del Fuego).
   Descarta ubicaciones erróneas del dispositivo o de la IP (p. ej. routers
   mal registrados en bases Wi-Fi que "ubican" al visitante en otro país). */
function enArgentina(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) &&
         lat <= -21.7 && lat >= -55.2 && lng >= -73.7 && lng <= -53.5;
}

function fmtKm(km) {
  if (km < 1) return "menos de 1 km";
  if (km < 100) return `${Math.round(km)} km`;
  return `${Math.round(km / 10) * 10} km`;
}

/* =========================================================
   GEOLOCALIZACIÓN POR IP
   Se consultan servicios gratuitos por HTTPS, en orden, con
   timeout corto. Si todos fallan, la lista queda en orden
   alfabético y la página sigue funcionando igual.
   ========================================================= */
const IP_SERVICES = [
  { url: "https://ipwho.is/",        parse: j => j.success !== false && { lat: j.latitude, lng: j.longitude, pais: j.country_code, ciudad: [j.city, j.region].filter(Boolean).join(", ") } },
  { url: "https://ipapi.co/json/",   parse: j => !j.error && { lat: j.latitude, lng: j.longitude, pais: j.country_code, ciudad: [j.city, j.region].filter(Boolean).join(", ") } },
  { url: "https://freeipapi.com/api/json", parse: j => ({ lat: j.latitude, lng: j.longitude, pais: j.countryCode, ciudad: [j.cityName, j.regionName].filter(Boolean).join(", ") }) }
];

async function fetchConTimeout(url, ms = 3500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function ubicarPorIP() {
  for (const s of IP_SERVICES) {
    try {
      const loc = s.parse(await fetchConTimeout(s.url));
      if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
        // Si la IP ubica fuera de Argentina, no se usa (sería un orden absurdo)
        if ((loc.pais && loc.pais !== "AR") || !enArgentina(loc.lat, loc.lng)) return null;
        return { ...loc, fuente: "ip" };
      }
    } catch (_) { /* probar el siguiente */ }
  }
  return null;
}

/* =========================================================
   MAPA
   ========================================================= */
function initMapa() {
  const el = document.getElementById("dc-map");
  if (!el || typeof L === "undefined") return;

  map = L.map(el, {
    center: AR_CENTER, zoom: 4, minZoom: 3, maxZoom: 16,
    zoomControl: true, scrollWheelZoom: false, attributionControl: true
  });

  // Mosaicos "Dark Gray Canvas" de Esri: gratuitos, sin API key, ya en tono
  // oscuro. Se cargan base + etiquetas por separado.
  const esriAttr = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors";
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
    attribution: esriAttr, maxZoom: 16
  }).addTo(map);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 16, pane: "tilePane", opacity: 0.85
  }).addTo(map);

  const icono = L.divIcon({
    className: "dc-marker",
    html: '<span class="dc-marker-dot"></span>',
    iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10]
  });

  DISTRIBUIDORES.forEach((d, idx) => {
    if (!tieneCoords(d)) return;
    const m = L.marker([d.lat, d.lng], { icon: icono, title: d.nombre })
      .addTo(map)
      .bindPopup(`<strong>${esc(d.nombre)}</strong><br>${esc(d.ciudad)}, ${esc(d.provincia)}`, { closeButton: false });
    m.on("click", () => seleccionar(idx, { desdeMapa: true }));
    markers.set(idx, m);
  });

  map.fitBounds(AR_BOUNDS, { padding: [10, 10] });

  // Activar zoom con rueda solo cuando el usuario hace clic en el mapa
  el.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: false });
  el.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
}

function marcarVisitante() {
  if (!map || !state.visitante) return;
  const v = state.visitante;
  if (visitanteMarker) map.removeLayer(visitanteMarker);
  visitanteMarker = L.circleMarker([v.lat, v.lng], {
    radius: 7, color: "#fff", weight: 2, fillColor: "#3b82f6", fillOpacity: 0.9, className: "dc-you"
  }).addTo(map).bindTooltip(v.fuente === "gps" ? "Tu ubicación" : v.fuente === "ciudad" ? esc(v.ciudad) : "Tu ubicación aproximada (por IP)", { direction: "top", offset: [0, -8] });
}

/* =========================================================
   UBICACIÓN EXACTA (GPS / red del dispositivo, con permiso)
   La geolocalización por IP falla con Starlink, redes móviles
   y VPN (todos los usuarios "aparecen" en la pasarela del
   proveedor). Este botón pide la ubicación real al navegador.
   ========================================================= */
function pedirUbicacionExacta() {
  if (!navigator.geolocation) {
    setNear("gps-error", "Tu navegador no permite obtener la ubicación");
    return;
  }
  if (!window.isSecureContext) {
    setNear("gps-error", "Abrí la página con https:// para poder usar tu ubicación");
    return;
  }
  $geoBtn.disabled = true;
  $geoBtn.classList.add("loading");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      if (!enArgentina(latitude, longitude)) {
        $geoBtn.classList.remove("loading");
        $geoBtn.disabled = false;
        setNear("gps-error", "Tu dispositivo informó una ubicación fuera de Argentina. Ingresá tu ciudad para ordenar por cercanía");
        if ($ciudadInput) $ciudadInput.focus();
        return;
      }
      state.visitante = { lat: latitude, lng: longitude, ciudad: "", fuente: "gps", precision: accuracy };
      state.orden = "cercania";
      marcarVisitante();
      setNear("gps");
      render();
      if (map) map.flyTo([latitude, longitude], accuracy > 5000 ? 7 : 10, { duration: 0.9 });
      $geoBtn.classList.remove("loading");
      $geoBtn.disabled = false;   // se deja visible para poder reintentar
    },
    (err) => {
      $geoBtn.disabled = false;
      $geoBtn.classList.remove("loading");
      const msg = {
        1: "Permiso de ubicación bloqueado. Habilitalo desde el candado de la barra de direcciones y volvé a intentar",
        2: "El dispositivo no informó su ubicación. En Windows/Mac revisá que la ubicación del sistema esté activada",
        3: "La ubicación tardó demasiado. Volvé a intentar"
      }[err.code] || "No se pudo obtener tu ubicación";
      setNear("gps-error", msg);
    },
    // Sin caché y con alta precisión: evita reusar una posición vieja o estimada por IP
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
  );
}

/* =========================================================
   UBICACIÓN POR CIUDAD (ingresada por el visitante)
   Alternativa confiable cuando el GPS/Wi-Fi o la IP fallan.
   1) lista local CIUDADES_AR  2) Photon (OSM) limitado a Argentina
   ========================================================= */
function initCiudades() {
  if (!$ciudadForm || typeof CIUDADES_AR === "undefined") return;
  if ($ciudadList) {
    $ciudadList.innerHTML = CIUDADES_AR
      .map(c => `<option value="${esc(c.nombre)}, ${esc(c.provincia)}"></option>`).join("");
  }
  $ciudadForm.addEventListener("submit", (e) => { e.preventDefault(); buscarCiudad($ciudadInput.value); });
  $ciudadInput.addEventListener("change", () => {
    if (buscarLocal($ciudadInput.value)) buscarCiudad($ciudadInput.value);
  });
}

function buscarLocal(texto) {
  const q = normalizar(texto).trim();
  if (!q) return null;
  const nombreQ = q.split(",")[0].trim();
  return CIUDADES_AR.find(c => normalizar(`${c.nombre}, ${c.provincia}`) === q) ||
         CIUDADES_AR.find(c => normalizar(c.nombre) === nombreQ) ||
         CIUDADES_AR.find(c => normalizar(c.nombre).startsWith(nombreQ) && nombreQ.length >= 4) ||
         null;
}

async function buscarCiudad(texto) {
  const t = (texto || "").trim();
  if (!t) return;
  let loc = buscarLocal(t);
  if (loc) {
    loc = { lat: loc.lat, lng: loc.lng, ciudad: `${loc.nombre}, ${loc.provincia}` };
  } else {
    setNear("buscando");
    try {
      const url = "https://photon.komoot.io/api/?limit=5&lang=es&bbox=-73.7,-55.2,-53.5,-21.7&q=" + encodeURIComponent(t + ", Argentina");
      const j = await fetchConTimeout(url, 5000);
      const f = (j.features || []).find(f =>
        (f.properties.countrycode || "").toUpperCase() === "AR" &&
        enArgentina(f.geometry.coordinates[1], f.geometry.coordinates[0]));
      if (f) {
        const p = f.properties;
        loc = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0],
                ciudad: [p.name, p.state].filter(Boolean).join(", ") };
      }
    } catch (_) { /* sin conexión al buscador */ }
  }
  if (!loc) {
    setNear("gps-error", `No encontramos "${t}". Probá con otra ciudad cercana`);
    return;
  }
  state.visitante = { ...loc, fuente: "ciudad" };
  state.orden = "cercania";
  marcarVisitante();
  setNear("ciudad");
  render();
  if (map) map.flyTo([loc.lat, loc.lng], 9, { duration: 0.9 });
}

function resaltarMarker(idx) {
  markers.forEach((m, i) => {
    const el = m.getElement();
    if (el) el.classList.toggle("is-active", i === idx);
  });
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */
async function init() {
  // Provincias únicas, ordenadas
  const provincias = [...new Set(DISTRIBUIDORES.map(d => d.provincia).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
  provincias.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p; opt.textContent = p;
    $prov.appendChild(opt);
  });

  if ($statPuntos) $statPuntos.textContent = DISTRIBUIDORES.length;
  if ($statProv)   $statProv.textContent   = provincias.length;

  const params = new URLSearchParams(window.location.search);
  const provParam = params.get("provincia");
  if (provParam && provincias.includes(provParam)) {
    state.provincia = provParam;
    $prov.value = provParam;
  }

  $search.addEventListener("input", (e) => { state.q = e.target.value; render(); });
  $prov.addEventListener("change", (e) => { state.provincia = e.target.value; render(); });
  $chips.forEach(chip => {
    chip.addEventListener("click", () => {
      $chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.tipo = chip.dataset.tipo || "";
      render();
    });
  });

  if ($geoBtn) $geoBtn.addEventListener("click", pedirUbicacionExacta);
  initCiudades();

  initMapa();
  setNear("buscando");
  render();

  // Ubicación por IP (no bloquea el primer render)
  const porIP = await ubicarPorIP();
  // Si el usuario ya obtuvo su ubicación exacta mientras se consultaba la IP,
  // el resultado por IP (menos preciso) NO debe pisarla.
  if (state.visitante && state.visitante.fuente !== "ip") return;
  state.visitante = porIP;
  if (state.visitante) {
    marcarVisitante();
    setNear("ok");
  } else {
    state.orden = "nombre";
    setNear("error");
  }
  render();
}

/* Indicador "cerca tuyo" en la cabecera de resultados */
function setNear(estado, extra) {
  if (!$near) return;
  const nota = extra ? ` <small>· ${esc(extra)}</small>` : "";
  if (estado === "buscando") {
    $near.className = "dc-near loading";
    $near.innerHTML = `${ICON.near} Detectando tu ubicación…`;
  } else if (estado === "ok") {
    $near.className = "dc-near ok";
    $near.innerHTML = `${ICON.near} Ordenado por cercanía a <strong>${esc(state.visitante.ciudad || "tu zona")}</strong> <small>(aproximada por IP; puede fallar con Starlink o redes móviles)</small>${nota}`;
  } else if (estado === "gps") {
    $near.className = "dc-near gps";
    const p = state.visitante && state.visitante.precision;
    $near.innerHTML = p > 5000
      ? `${ICON.near} Ordenado por cercanía a <strong>tu ubicación</strong> <small>(el dispositivo informó una precisión baja: ±${Math.round(p / 1000)} km)</small>`
      : `${ICON.near} Ordenado por cercanía a <strong>tu ubicación exacta</strong>`;
  } else if (estado === "ciudad") {
    $near.className = "dc-near gps";
    $near.innerHTML = `${ICON.near} Ordenado por cercanía a <strong>${esc(state.visitante.ciudad)}</strong>`;
  } else if (estado === "gps-error") {
    $near.className = "dc-near off";
    $near.innerHTML = `${ICON.near} ${esc(extra || "No se pudo obtener tu ubicación")}`;
  } else {
    $near.className = "dc-near off";
    $near.innerHTML = `${ICON.near} No pudimos estimar tu ubicación · orden alfabético${nota}`;
  }
}

/* =========================================================
   FILTRADO + ORDEN
   ========================================================= */
function filtrar() {
  const q = normalizar(state.q);
  let items = DISTRIBUIDORES.map((d, idx) => ({ d, idx }));

  items = items.filter(({ d }) => {
    if (state.provincia && d.provincia !== state.provincia) return false;
    if (state.tipo && d.tipo !== state.tipo) return false;
    if (q) {
      const blob = normalizar([d.nombre, d.ciudad, d.provincia, d.direccion].join(" "));
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  if (state.visitante && state.orden === "cercania") {
    items.forEach(it => {
      it.km = tieneCoords(it.d) ? distanciaKm(state.visitante, it.d) : Infinity;
    });
    items.sort((a, b) => a.km - b.km || a.d.nombre.localeCompare(b.d.nombre, "es"));
  } else {
    items.sort((a, b) => a.d.nombre.localeCompare(b.d.nombre, "es"));
  }
  return items;
}

/* =========================================================
   RENDER
   ========================================================= */
function render() {
  const items = filtrar();

  $count.innerHTML = `<strong>${items.length}</strong> ${items.length === 1 ? "resultado" : "resultados"}`;

  if (!items.length) {
    $list.innerHTML = `
      <div class="dc-empty">
        <strong>No encontramos distribuidores con ese criterio</strong>
        Probá con otra localidad o provincia, o
        <a href="Contacto.html">escribinos</a> y te indicamos el punto de venta más cercano.
      </div>`;
    return;
  }

  $list.innerHTML = items.map(({ d, idx, km }, i) => {
    const wa = d.whatsapp
      ? `<a class="dc-btn wa" href="https://wa.me/${esc(d.whatsapp)}?text=${encodeURIComponent("Hola, consulto por equipos JASIC.")}" target="_blank" rel="noopener">${ICON.wa} WhatsApp</a>`
      : "";
    const social = [
      d.web       && `<a href="${esc(d.web)}" target="_blank" rel="noopener" title="Sitio web">${ICON.web}</a>`,
      d.instagram && `<a href="${esc(d.instagram)}" target="_blank" rel="noopener" title="Instagram">${ICON.ig}</a>`,
      d.facebook  && `<a href="${esc(d.facebook)}" target="_blank" rel="noopener" title="Facebook">${ICON.fb}</a>`,
      d.tiktok    && `<a href="${esc(d.tiktok)}" target="_blank" rel="noopener" title="TikTok">${ICON.tt}</a>`
    ].filter(Boolean).join("");
    const dist = Number.isFinite(km)
      ? `<span class="dc-km">${i === 0 ? "El más cercano · " : ""}${fmtKm(km)}</span>`
      : "";

    return `
      <article class="dc-card ${idx === state.activo ? "active" : ""} ${i === 0 && Number.isFinite(km) ? "nearest" : ""}" data-idx="${idx}" style="animation-delay:${Math.min(i, 12) * 40}ms">
        <div>
          <div class="dc-card-top">
            <span class="dc-card-badge ${esc(d.tipo)}">${TIPOS[d.tipo] || esc(d.tipo)}</span>
            ${dist}
          </div>
          <h3>${esc(d.nombre)}</h3>
          <div class="dc-card-loc">${esc(d.ciudad)} · ${esc(d.provincia)}</div>
          <div class="dc-card-detail">${ICON.pin}<span>${esc(d.direccion)}</span></div>
          ${d.telefono ? `<div class="dc-card-detail">${ICON.phone}<a href="tel:${esc(d.telefono.replace(/\s/g, ""))}">${esc(d.telefono)}</a></div>` : ""}
          ${d.horario  ? `<div class="dc-card-detail">${ICON.clock}<span>${esc(d.horario)}</span></div>` : ""}
          ${social ? `<div class="dc-card-social">${social}</div>` : ""}
        </div>
        <div class="dc-card-actions">
          ${wa}
          <a class="dc-btn ghost" href="${mapsLinkUrl(d)}" target="_blank" rel="noopener">${ICON.route} Cómo llegar</a>
        </div>
      </article>`;
  }).join("");

  $list.querySelectorAll(".dc-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      seleccionar(Number(card.dataset.idx));
    });
  });
}

/* Selección de un distribuidor: resalta tarjeta y centra el mapa */
function seleccionar(idx, { desdeMapa = false } = {}) {
  state.activo = idx;
  const d = DISTRIBUIDORES[idx];
  if (!d) return;

  $list.querySelectorAll(".dc-card").forEach(c =>
    c.classList.toggle("active", Number(c.dataset.idx) === idx)
  );
  resaltarMarker(idx);

  if (map && tieneCoords(d)) {
    map.flyTo([d.lat, d.lng], Math.max(map.getZoom(), 11), { duration: 0.8 });
    const m = markers.get(idx);
    if (m && !desdeMapa) setTimeout(() => m.openPopup(), 850);
  }

  if (desdeMapa) {
    const card = $list.querySelector(`.dc-card[data-idx="${idx}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  } else if (map) {
    document.getElementById("dc-map-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.addEventListener("DOMContentLoaded", init);
