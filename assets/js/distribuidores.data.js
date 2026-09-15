/* =========================================================
   DATOS DE DISTRIBUIDORES — JASIC Argentina
   ---------------------------------------------------------
   Este archivo se regenera con herramientas/excel_a_distribuidores.py
   a partir de los formularios Excel. También se puede editar a mano.

   tipo:      "oficial" | "venta" | "servicio"
   whatsapp:  solo números con código de país (549...)
   lat / lng: coordenadas decimales (clic derecho en Google Maps)
              -> necesarias para el punto rojo en el mapa y el
                 orden por cercanía. Si faltan, el distribuidor
                 aparece en la lista pero no en el mapa.
   ========================================================= */

const DISTRIBUIDORES = [
  // ---- DATOS DE EJEMPLO: reemplazar por distribuidores reales ----
  {
    nombre: "JASIC Argentina — Casa Central",
    tipo: "oficial",
    ciudad: "La Plata",
    provincia: "Buenos Aires",
    direccion: "Parque Industrial, La Plata",
    telefono: "+54 11 3537 0248",
    whatsapp: "5491135370248",
    horario: "Lunes a Viernes · 8:00 – 17:00",
    web: "https://jasicargentina.com.ar",
    instagram: "https://www.instagram.com/jasicargentina",
    facebook: "",
    mapsQuery: "Jasic Argentina, La Plata",
    lat: -34.8475, lng: -57.9294
  },
  {
    nombre: "Ferretería Industrial Norte",
    tipo: "venta",
    ciudad: "San Martín",
    provincia: "Buenos Aires",
    direccion: "Av. Presidente Perón 1234, San Martín",
    telefono: "+54 11 4000 0000",
    whatsapp: "5491140000000",
    horario: "Lunes a Viernes · 8:30 – 18:00 · Sábados 9:00 – 13:00",
    web: "",
    instagram: "https://www.instagram.com/ferreterianorte",
    facebook: "https://www.facebook.com/ferreterianorte",
    mapsQuery: "Av. Presidente Perón 1234, San Martín, Buenos Aires",
    lat: -34.5735, lng: -58.5370
  },
  {
    nombre: "Soldatec Córdoba",
    tipo: "oficial",
    ciudad: "Córdoba",
    provincia: "Córdoba",
    direccion: "Bv. Los Alemanes 4567, Córdoba Capital",
    telefono: "+54 351 400 0000",
    whatsapp: "5493514000000",
    horario: "Lunes a Viernes · 8:00 – 18:00",
    web: "https://www.soldatec.com.ar",
    instagram: "",
    facebook: "",
    mapsQuery: "Bv. Los Alemanes 4567, Córdoba",
    lat: -31.3520, lng: -64.2150
  },
  {
    nombre: "Insumos Rosario S.R.L.",
    tipo: "venta",
    ciudad: "Rosario",
    provincia: "Santa Fe",
    direccion: "Av. Ovidio Lagos 2200, Rosario",
    telefono: "+54 341 400 0000",
    whatsapp: "5493414000000",
    horario: "Lunes a Viernes · 8:00 – 17:30",
    web: "",
    instagram: "",
    facebook: "",
    mapsQuery: "Av. Ovidio Lagos 2200, Rosario",
    lat: -32.9590, lng: -60.6660
  },
  {
    nombre: "Taller Electromecánico Cuyo",
    tipo: "servicio",
    ciudad: "Mendoza",
    provincia: "Mendoza",
    direccion: "Acceso Este 3400, Guaymallén",
    telefono: "+54 261 400 0000",
    whatsapp: "5492614000000",
    horario: "Lunes a Viernes · 9:00 – 18:00",
    web: "",
    instagram: "",
    facebook: "",
    mapsQuery: "Acceso Este 3400, Guaymallén, Mendoza",
    lat: -32.8890, lng: -68.7900
  },
  {
    nombre: "Patagonia Welding Supply",
    tipo: "venta",
    ciudad: "Neuquén",
    provincia: "Neuquén",
    direccion: "Ruta 22 km 1200, Parque Industrial Neuquén",
    telefono: "+54 299 400 0000",
    whatsapp: "5492994000000",
    horario: "Lunes a Viernes · 8:00 – 17:00",
    web: "",
    instagram: "",
    facebook: "",
    mapsQuery: "Parque Industrial Neuquén",
    lat: -38.9200, lng: -68.1400
  },
  {
    nombre: "Norte Soldaduras",
    tipo: "venta",
    ciudad: "San Miguel de Tucumán",
    provincia: "Tucumán",
    direccion: "Av. Roca 2500, San Miguel de Tucumán",
    telefono: "+54 381 400 0000",
    whatsapp: "5493814000000",
    horario: "Lunes a Viernes · 8:00 – 13:00 y 16:00 – 20:00",
    web: "",
    instagram: "",
    facebook: "",
    mapsQuery: "Av. Roca 2500, San Miguel de Tucumán",
    lat: -26.8300, lng: -65.2100
  },
  {
    nombre: "Austral Equipos",
    tipo: "servicio",
    ciudad: "Comodoro Rivadavia",
    provincia: "Chubut",
    direccion: "Ruta 3 km 1850, Comodoro Rivadavia",
    telefono: "+54 297 400 0000",
    whatsapp: "5492974000000",
    horario: "Lunes a Viernes · 8:00 – 17:00",
    web: "",
    instagram: "",
    facebook: "",
    mapsQuery: "Comodoro Rivadavia, Chubut",
    lat: -45.8640, lng: -67.4960
  }
];
