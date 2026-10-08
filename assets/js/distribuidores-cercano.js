/* =========================================================
   DISTRIBUIDORES — "El más cercano primero"
   ---------------------------------------------------------
   Lee los datos de distribuidores.data.js (DISTRIBUIDORES)
   y ciudades-ar.data.js (CIUDADES_AR). No los modifica.
   1. Estima la ubicación del visitante (IP; luego GPS o ciudad
      si el visitante lo pide).
   2. Muestra el punto de venta más cercano con sus contactos.
   3. Dibuja en el mapa la línea medida hasta el local elegido.
   4. Lista toda la red ordenada por distancia.
   ========================================================= */
(function () {
  "use strict";

  if (typeof DISTRIBUIDORES === "undefined") return;

  const AR_BOUNDS = [[-55.2, -73.7], [-21.7, -53.5]];
  const TILE_BASE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
  const TILE_REF  = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
  const MENSAJE_WA = "Hola, los contacto desde la web de JASIC Argentina. Quería consultar por equipos JASIC.";

  /* ---------- Iconos ---------- */
  const SVG = (inner, cls) => `<svg class="dx-ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
  const ICO = {
    tel:   SVG('<path d="M21 16.4v3a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6A19.6 19.6 0 0 1 1.3 3.8 2 2 0 0 1 3.3 1.6h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L7.3 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    wa:    SVG('<path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.28-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.66-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.24-.7.24-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>', "dx-ico-relleno"),
    ir:    SVG('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    pin:   SVG('<path d="M20 10c0 6.2-8 12-8 12s-8-5.8-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/>'),
    reloj: SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>'),
    web:   SVG('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9"/>'),
    mapa:  SVG('<path d="m9 4-6 2.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4zM9 4v13.5M15 6.5V20"/>')
  };

  /* ---------- Utilidades ---------- */
  const $ = (id) => document.getElementById(id);
  const normalizar = (s) => (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tieneCoords = (d) => Number.isFinite(d.lat) && Number.isFinite(d.lng);
  const enArgentina = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat <= -21.7 && lat >= -55.2 && lng >= -73.7 && lng <= -53.5;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function distanciaKm(a, b) {
    const R = 6371, r = (x) => x * Math.PI / 180;
    const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function kmTexto(km) {
    if (!Number.isFinite(km)) return "";
    if (km < 1) return "menos de 1 km";
    if (km < 100) return `${Math.round(km)} km`;
    return `${(Math.round(km / 10) * 10).toLocaleString("es-AR")} km`;
  }
  function kmNumero(km) {
    if (km < 1) return "<1";
    if (km < 100) return String(Math.round(km));
    return (Math.round(km / 10) * 10).toLocaleString("es-AR");
  }
  const telHref = (t) => "tel:" + String(t).replace(/[^\d+]/g, "");
  const waHref = (n) => `https://wa.me/${String(n).replace(/\D/g, "")}?text=${encodeURIComponent(MENSAJE_WA)}`;
  const comoLlegar = (d) => tieneCoords(d)
    ? `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`
    : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.mapsQuery || d.direccion);
  const dominio = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (_) { return u; } };

  async function fetchJSON(url, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms || 3500);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  /* ---------- Estado ---------- */
  const PUNTOS = DISTRIBUIDORES.map((d, i) => ({ ...d, _i: i }));
  const state = {
    visitante: null,     // { lat, lng, ciudad, fuente: "ip" | "gps" | "ciudad" }
    sel: null,           // índice del punto mostrado en el panel
    manual: false,       // true si el visitante eligió otro punto de la lista
    q: "",
    prov: ""
  };

  /* ---------- DOM ---------- */
  const $ficha = $("dx-ficha"), $titulo = $("dx-titulo"), $origen = $("dx-origen");
  const $gps = $("dx-gps"), $form = $("dx-ciudad-form"), $ciudad = $("dx-ciudad"), $ciudades = $("dx-ciudades");
  const $lista = $("dx-lista"), $resumen = $("dx-red-resumen"), $buscar = $("dx-buscar"), $prov = $("dx-provincia");

  /* =========================================================
     MAPA + LÍNEA MEDIDA
     ========================================================= */
  let map = null, pendiente = null, capaLinea = null, capaEtiqueta = null, marcaYo = null;
  const pines = new Map();

  function iniciarMapa() {
    if (typeof L === "undefined") return;
    map = L.map("dx-mapa", { zoomControl: true, scrollWheelZoom: false, dragging: !L.Browser.mobile, attributionControl: true, minZoom: 3, maxZoom: 16 });
    const attr = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors";
    L.tileLayer(TILE_BASE, { attribution: attr, maxZoom: 16 }).addTo(map);
    L.tileLayer(TILE_REF, { maxZoom: 16, opacity: 0.85 }).addTo(map);
    map.zoomControl.setPosition("topright");
    map.fitBounds(AR_BOUNDS, { padding: [20, 20] });

    PUNTOS.forEach(p => {
      if (!tieneCoords(p)) return;
      const m = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: "dx-pin", html: "<span></span>", iconSize: [24, 24], iconAnchor: [12, 12] }),
        title: p.nombre, keyboard: true, riseOnHover: true
      }).addTo(map).bindTooltip(`${esc(p.nombre)} · ${esc(p.ciudad)}`, { direction: "top", offset: [0, -10] });
      m.on("click", () => elegir(p._i, { desdeMapa: true }));
      pines.set(p._i, m);
    });

    const el = $("dx-mapa");
    // En celulares el mapa no captura el arrastre hasta tocarlo, para no trabar el scroll de la página
    el.addEventListener("click", () => { map.scrollWheelZoom.enable(); map.dragging.enable(); });
    el.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
  }

  function marcarYo() {
    if (!map) return;
    if (marcaYo) map.removeLayer(marcaYo);
    marcaYo = null;
    const v = state.visitante;
    if (!v) return;
    const etiqueta = v.fuente === "gps" ? "Tu ubicación" : v.fuente === "ciudad" ? v.ciudad : `${v.ciudad || "Tu zona"} (aproximado)`;
    marcaYo = L.marker([v.lat, v.lng], {
      icon: L.divIcon({ className: "dx-yo", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] }),
      interactive: true, keyboard: false, zIndexOffset: 500
    }).addTo(map).bindTooltip(esc(etiqueta), { direction: "top", offset: [0, -10] });
  }

  function trazarLinea(p, km) {
    if (!map) return;
    if (pendiente) { map.off("moveend", pendiente); pendiente = null; }
    if (capaLinea) { map.removeLayer(capaLinea); capaLinea = null; }
    if (capaEtiqueta) { map.removeLayer(capaEtiqueta); capaEtiqueta = null; }
    pines.forEach((m, i) => { const el = m.getElement(); if (el) el.classList.toggle("is-activo", i === (p && p._i)); });
    if (!p || !tieneCoords(p)) return;

    const v = state.visitante;
    if (!v) {
      map.flyTo([p.lat, p.lng], 12, { duration: reduceMotion ? 0 : 0.8 });
      return;
    }
    const a = L.latLng(v.lat, v.lng), b = L.latLng(p.lat, p.lng);
    const ajuste = () => {
      pendiente = null;
      if (capaLinea) map.removeLayer(capaLinea);
      if (capaEtiqueta) map.removeLayer(capaEtiqueta);
      capaLinea = L.polyline([a, b], { className: "dx-medida", interactive: false }).addTo(map);
      const path = capaLinea.getElement();
      if (path && !reduceMotion) {
        const largo = path.getTotalLength();
        path.style.transition = "none";
        path.style.strokeDasharray = `${largo} ${largo}`;
        path.style.strokeDashoffset = String(largo);
        path.getBoundingClientRect();
        path.style.transition = "";
        requestAnimationFrame(() => { path.style.strokeDashoffset = "0"; });
        // Al terminar, se libera el dasharray para que el zoom no recorte la línea
        setTimeout(() => { path.style.strokeDasharray = ""; path.style.strokeDashoffset = ""; }, 1300);
      }
      const medio = L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
      capaEtiqueta = L.marker(medio, {
        icon: L.divIcon({ className: "dx-medida-etiqueta", html: `<span>${kmTexto(km)}</span>`, iconSize: [0, 0] }),
        interactive: false, keyboard: false, zIndexOffset: 400
      }).addTo(map);
      requestAnimationFrame(() => { const el = capaEtiqueta && capaEtiqueta.getElement(); if (el) el.classList.add("is-visible"); });
    };

    const bounds = L.latLngBounds([a, b]);
    if (a.distanceTo(b) < 400) bounds.pad(0.02);
    if (pendiente) map.off("moveend", pendiente);
    pendiente = ajuste;
    map.once("moveend", ajuste);
    map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 14, duration: reduceMotion ? 0 : 0.9 });
  }

  /* =========================================================
     FICHA (panel izquierdo)
     ========================================================= */
  function datosHTML(p) {
    const filas = [];
    if (p.direccion) filas.push(`<li>${ICO.pin}<span>${esc(p.direccion)}</span></li>`);
    if (p.telefono)  filas.push(`<li>${ICO.tel}<a href="${telHref(p.telefono)}">${esc(p.telefono)}</a></li>`);
    if (p.horario)   filas.push(`<li>${ICO.reloj}<span>${esc(p.horario)}</span></li>`);
    const redes = [
      p.web && `<a href="${esc(p.web)}" target="_blank" rel="noopener">${esc(dominio(p.web))}</a>`,
      p.instagram && `<a href="${esc(p.instagram)}" target="_blank" rel="noopener">Instagram</a>`,
      p.facebook && `<a href="${esc(p.facebook)}" target="_blank" rel="noopener">Facebook</a>`,
      p.tiktok && `<a href="${esc(p.tiktok)}" target="_blank" rel="noopener">TikTok</a>`
    ].filter(Boolean);
    if (redes.length) filas.push(`<li>${ICO.web}<span class="dx-redes">${redes.join("")}</span></li>`);
    return `<ul class="dx-datos">${filas.join("")}</ul>`;
  }

  function accionesHTML(p) {
    return [
      p.telefono && `<a class="dx-btn dx-btn-primario" href="${telHref(p.telefono)}">${ICO.tel}Llamar</a>`,
      p.whatsapp && `<a class="dx-btn dx-btn-secundario" href="${waHref(p.whatsapp)}" target="_blank" rel="noopener">${ICO.wa}WhatsApp</a>`,
      `<a class="dx-link" href="${comoLlegar(p)}" target="_blank" rel="noopener">Cómo llegar${ICO.ir}</a>`
    ].filter(Boolean).join("");
  }

  function pintarFicha() {
    $ficha.setAttribute("aria-busy", "false");
    const v = state.visitante;
    const p = state.sel != null ? PUNTOS[state.sel] : null;

    if (!p) {
      $titulo.textContent = "Encontrá tu punto de venta JASIC";
      $ficha.innerHTML = `
        <div class="dx-sin-ubicacion">
          <h2>¿Desde dónde nos visitás?</h2>
          <p>No pudimos estimar tu ubicación. Usá la de tu dispositivo o escribí tu ciudad y te mostramos el punto de venta más cercano.</p>
        </div>`;
      $gps.classList.replace("dx-btn-ghost", "dx-btn-primario");
      return;
    }
    $gps.classList.replace("dx-btn-primario", "dx-btn-ghost");

    const km = v && tieneCoords(p) ? distanciaKm(v, p) : NaN;
    const masCercano = !state.manual;
    $titulo.textContent = masCercano && v ? "Tu punto de venta JASIC más cercano" : "Punto de venta seleccionado";

    const lugar = `${esc(p.ciudad)}, ${esc(p.provincia)}`;
    let kmHTML = "";
    if (Number.isFinite(km)) {
      const desde = v.fuente === "gps" ? "de tu ubicación" : `de ${esc((v.ciudad || "tu zona").split(",")[0])}`;
      kmHTML = `<p class="dx-ficha-km"><span class="dx-distancia">${kmNumero(km)}</span> km ${desde}</p>`;
    }

    $ficha.innerHTML = `
      <h2 class="dx-ficha-nombre">${esc(p.nombre)}</h2>
      <p class="dx-ficha-lugar">${lugar}</p>
      ${kmHTML}
      ${datosHTML(p)}
      <div class="dx-acciones">${accionesHTML(p)}</div>
      ${state.manual && v ? '<button type="button" class="dx-volver" id="dx-volver">Volver al más cercano</button>' : ""}`;

    const volver = $("dx-volver");
    if (volver) volver.addEventListener("click", () => { state.manual = false; elegirMasCercano(); });
  }

  function pintarOrigen(mensaje, aviso) {
    const v = state.visitante;
    $origen.classList.toggle("is-aviso", !!aviso);
    if (mensaje) { $origen.textContent = mensaje; return; }
    if (!v) { $origen.textContent = "Elegí desde dónde medir las distancias."; return; }
    if (v.fuente === "gps") {
      $origen.innerHTML = v.precision > 5000
        ? `Distancias desde <strong>tu ubicación</strong>, con precisión baja (±${Math.round(v.precision / 1000)} km). Si no es correcta, escribí tu ciudad.`
        : "Distancias en línea recta desde <strong>tu ubicación</strong>.";
    } else if (v.fuente === "ciudad") {
      $origen.innerHTML = `Distancias en línea recta desde <strong>${esc(v.ciudad)}</strong>.`;
    } else {
      $origen.innerHTML = `Distancias desde <strong>${esc(v.ciudad || "tu zona")}</strong>, estimado por tu conexión. Con Starlink o datos móviles puede no ser exacto.`;
    }
  }

  /* =========================================================
     LISTA
     ========================================================= */
  function itemsOrdenados() {
    const v = state.visitante, q = normalizar(state.q);
    let items = PUNTOS.filter(p => {
      if (state.prov && p.provincia !== state.prov) return false;
      if (q && !normalizar([p.nombre, p.ciudad, p.provincia, p.direccion].join(" ")).includes(q)) return false;
      return true;
    }).map(p => ({ p, km: v && tieneCoords(p) ? distanciaKm(v, p) : NaN }));
    if (v) items.sort((a, b) => (Number.isFinite(a.km) ? a.km : Infinity) - (Number.isFinite(b.km) ? b.km : Infinity) || a.p.nombre.localeCompare(b.p.nombre, "es"));
    else items.sort((a, b) => a.p.nombre.localeCompare(b.p.nombre, "es"));
    return items;
  }

  function pintarLista() {
    const items = itemsOrdenados();
    const v = state.visitante;
    const nProv = new Set(PUNTOS.map(p => p.provincia)).size;
    const base = `${PUNTOS.length} puntos de venta en ${nProv} provincias`;
    $resumen.textContent = v
      ? `${base}, ordenados por distancia desde ${(v.fuente === "gps" ? "tu ubicación" : (v.ciudad || "tu zona").split(",")[0])}.`
      : `${base}, en orden alfabético.`;

    if (!items.length) {
      $lista.innerHTML = `<li class="dx-vacio"><strong>Ningún punto de venta coincide con tu búsqueda.</strong>Probá con otra ciudad o provincia.<br><button type="button" class="dx-btn dx-btn-ghost" id="dx-limpiar">Limpiar búsqueda</button></li>`;
      $("dx-limpiar").addEventListener("click", () => { state.q = ""; state.prov = ""; $buscar.value = ""; $prov.value = ""; pintarLista(); $buscar.focus(); });
      return;
    }

    $lista.innerHTML = items.map(({ p, km }) => `
      <li class="dx-fila${p._i === state.sel ? " is-activa" : ""}" data-i="${p._i}">
        <div class="dx-fila-km${Number.isFinite(km) ? "" : " is-vacio"}">${Number.isFinite(km) ? `${kmNumero(km)}<small>km</small>` : "—"}</div>
        <div class="dx-fila-info">
          <div class="dx-fila-nombre">${esc(p.nombre)}</div>
          <div class="dx-fila-lugar">${esc(p.ciudad)}, ${esc(p.provincia)}</div>
        </div>
        <div class="dx-fila-tel">${p.telefono ? `<a href="${telHref(p.telefono)}">${esc(p.telefono)}</a>` : ""}</div>
        <div class="dx-fila-acciones">
          ${p.telefono ? `<a class="dx-btn dx-btn-ghost dx-btn-icon" href="${telHref(p.telefono)}" aria-label="Llamar a ${esc(p.nombre)}">${ICO.tel}</a>` : ""}
          ${p.whatsapp ? `<a class="dx-btn dx-btn-ghost dx-btn-icon" href="${waHref(p.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp de ${esc(p.nombre)}">${ICO.wa}</a>` : ""}
          <button type="button" class="dx-btn dx-btn-ghost dx-ver" data-i="${p._i}">${ICO.mapa}Ver en el mapa</button>
        </div>
      </li>`).join("");

    $lista.querySelectorAll(".dx-ver").forEach(b => b.addEventListener("click", () => {
      elegir(Number(b.dataset.i), { desdeLista: true });
    }));
  }

  /* =========================================================
     ELECCIÓN DEL PUNTO
     ========================================================= */
  function masCercano() {
    const v = state.visitante;
    if (!v) return null;
    let mejor = null, dMin = Infinity;
    PUNTOS.forEach(p => { if (!tieneCoords(p)) return; const d = distanciaKm(v, p); if (d < dMin) { dMin = d; mejor = p; } });
    return mejor;
  }

  function elegirMasCercano() {
    const p = masCercano();
    state.sel = p ? p._i : null;
    state.manual = false;
    pintarFicha();
    pintarLista();
    trazarLinea(p, p ? distanciaKm(state.visitante, p) : NaN);
  }

  function elegir(i, opts) {
    const cercano = masCercano();
    state.sel = i;
    state.manual = !(cercano && cercano._i === i);
    const p = PUNTOS[i];
    pintarFicha();
    pintarLista();
    trazarLinea(p, state.visitante && tieneCoords(p) ? distanciaKm(state.visitante, p) : NaN);
    if (opts && opts.desdeLista) {
      document.querySelector(".dx-stage").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function fijarVisitante(v) {
    state.visitante = v;
    marcarYo();
    pintarOrigen();
    elegirMasCercano();
  }

  /* =========================================================
     UBICACIÓN: IP, GPS, CIUDAD
     ========================================================= */
  const IP = [
    { url: "https://ipwho.is/", parse: j => j.success !== false && { lat: j.latitude, lng: j.longitude, pais: j.country_code, ciudad: [j.city, j.region].filter(Boolean).join(", ") } },
    { url: "https://ipapi.co/json/", parse: j => !j.error && { lat: j.latitude, lng: j.longitude, pais: j.country_code, ciudad: [j.city, j.region].filter(Boolean).join(", ") } },
    { url: "https://freeipapi.com/api/json", parse: j => ({ lat: j.latitude, lng: j.longitude, pais: j.countryCode, ciudad: [j.cityName, j.regionName].filter(Boolean).join(", ") }) }
  ];
  // Los tres servicios se consultan a la vez y gana el primero que responda bien (máx. ~4 s)
  async function porIP() {
    const intentos = IP.map(async s => {
      const loc = s.parse(await fetchJSON(s.url, 4000));
      if (!loc || !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) throw new Error("sin datos");
      return loc;
    });
    try {
      const loc = await Promise.any(intentos);
      if ((loc.pais && loc.pais !== "AR") || !enArgentina(loc.lat, loc.lng)) return null;
      return { ...loc, fuente: "ip" };
    } catch (_) { return null; }
  }

  function usarGPS() {
    if (!navigator.geolocation) return pintarOrigen("Tu navegador no permite obtener la ubicación. Escribí tu ciudad.", true);
    if (!window.isSecureContext) return pintarOrigen("Para usar tu ubicación, abrí la página con https://. Mientras tanto, escribí tu ciudad.", true);
    $gps.disabled = true; $gps.classList.add("is-cargando");
    pintarOrigen("Obteniendo tu ubicación…");
    navigator.geolocation.getCurrentPosition(pos => {
      $gps.disabled = false; $gps.classList.remove("is-cargando");
      const { latitude, longitude, accuracy } = pos.coords;
      if (!enArgentina(latitude, longitude)) {
        pintarOrigen("Tu dispositivo informó una ubicación fuera de Argentina. Escribí tu ciudad para calcular las distancias.", true);
        $ciudad.focus();
        return;
      }
      fijarVisitante({ lat: latitude, lng: longitude, ciudad: "", fuente: "gps", precision: accuracy });
    }, err => {
      $gps.disabled = false; $gps.classList.remove("is-cargando");
      const msg = {
        1: "No diste permiso de ubicación. Podés habilitarlo desde el candado de la barra de direcciones o escribir tu ciudad.",
        2: "Tu dispositivo no informó su ubicación. Escribí tu ciudad.",
        3: "La ubicación tardó demasiado. Volvé a intentar o escribí tu ciudad."
      }[err.code] || "No pudimos obtener tu ubicación. Escribí tu ciudad.";
      pintarOrigen(msg, true);
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  function ciudadLocal(texto) {
    if (typeof CIUDADES_AR === "undefined") return null;
    const q = normalizar(texto).trim();
    if (!q) return null;
    const n = q.split(",")[0].trim();
    return CIUDADES_AR.find(c => normalizar(`${c.nombre}, ${c.provincia}`) === q) ||
           CIUDADES_AR.find(c => normalizar(c.nombre) === n) ||
           (n.length >= 4 ? CIUDADES_AR.find(c => normalizar(c.nombre).startsWith(n)) : null) || null;
  }

  async function usarCiudad(texto) {
    const t = (texto || "").trim();
    if (!t) { $ciudad.focus(); return; }
    let loc = ciudadLocal(t);
    if (loc) loc = { lat: loc.lat, lng: loc.lng, ciudad: `${loc.nombre}, ${loc.provincia}` };
    else {
      pintarOrigen(`Buscando "${t}"…`);
      try {
        const j = await fetchJSON("https://photon.komoot.io/api/?limit=5&lang=es&bbox=-73.7,-55.2,-53.5,-21.7&q=" + encodeURIComponent(t + ", Argentina"), 5000);
        const f = (j.features || []).find(f => (f.properties.countrycode || "").toUpperCase() === "AR" && enArgentina(f.geometry.coordinates[1], f.geometry.coordinates[0]));
        if (f) loc = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], ciudad: [f.properties.name, f.properties.state].filter(Boolean).join(", ") };
      } catch (_) { /* sin buscador */ }
    }
    if (!loc) return pintarOrigen(`No encontramos "${t}". Probá con una ciudad cercana.`, true);
    fijarVisitante({ ...loc, fuente: "ciudad" });
  }

  /* =========================================================
     INICIO
     ========================================================= */
  async function init() {
    [...new Set(PUNTOS.map(p => p.provincia))].sort((a, b) => a.localeCompare(b, "es"))
      .forEach(p => { const o = document.createElement("option"); o.value = p; o.textContent = p; $prov.appendChild(o); });
    if (typeof CIUDADES_AR !== "undefined") {
      $ciudades.innerHTML = CIUDADES_AR.map(c => `<option value="${esc(c.nombre)}, ${esc(c.provincia)}"></option>`).join("");
    }

    $buscar.addEventListener("input", e => { state.q = e.target.value; pintarLista(); });
    $prov.addEventListener("change", e => { state.prov = e.target.value; pintarLista(); });
    $gps.addEventListener("click", usarGPS);
    $form.addEventListener("submit", e => { e.preventDefault(); usarCiudad($ciudad.value); });
    $ciudad.addEventListener("change", () => { if (ciudadLocal($ciudad.value)) usarCiudad($ciudad.value); });

    iniciarMapa();
    pintarLista();

    const ip = await porIP();
    if (state.visitante) return;            // el visitante ya eligió GPS o ciudad
    if (ip) fijarVisitante(ip);
    else { pintarFicha(); pintarOrigen(); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
