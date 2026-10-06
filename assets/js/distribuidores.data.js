/* =========================================================
   DATOS DE DISTRIBUIDORES — JASIC Argentina
   ---------------------------------------------------------
   Fuente: formularios Excel completados por cada distribuidor
   (octubre 2026). Coordenadas tomadas de Google Maps.
   Se puede regenerar con herramientas/excel_a_distribuidores.py
   o editar a mano.

   tipo:      "oficial" | "venta" | "servicio"
   whatsapp:  solo números con código de país (549...)
   lat / lng: coordenadas decimales (sin ellas no aparece en el mapa)
   ========================================================= */

const DISTRIBUIDORES = [
  {
    nombre: "Bulonera del Sur",
    tipo: "venta",
    ciudad: "Quilmes",
    provincia: "Buenos Aires",
    direccion: "Av. La Plata 1909, Quilmes",
    telefono: "+54 11 5365-7004",
    whatsapp: "5491124571960",
    horario: "Lunes a Viernes · 8:00 – 17:30 · Sábados 8:00 – 13:00",
    web: "",
    instagram: "https://www.instagram.com/buloneradelsur_quilmes",
    facebook: "https://www.facebook.com/Bul.delsur/",
    tiktok: "https://www.tiktok.com/@buloneradelsuryfcinsumos",
    mapsQuery: "Bulonera del Sur, Av. La Plata 1909, Quilmes",
    lat: -34.7392937, lng: -58.2760194
  },
  {
    nombre: "Soldaduras Tigre",
    tipo: "oficial",
    ciudad: "Tigre",
    provincia: "Buenos Aires",
    direccion: "Chubut 1430, Tigre",
    telefono: "+54 9 11 2488-0610",
    whatsapp: "5491124880610",
    horario: "Lunes a Viernes · 8:00 – 12:00 y 14:00 – 18:00",
    web: "https://www.soldadurastigre.com.ar/",
    instagram: "https://www.instagram.com/soldaduras_tigre",
    facebook: "",
    tiktok: "",
    mapsQuery: "Soldaduras Tigre, Chubut 1430, Tigre",
    lat: -34.4079373, lng: -58.5941886
  },
  {
    nombre: "Segutecnica — Local Comercial",
    tipo: "venta",
    ciudad: "Berisso",
    provincia: "Buenos Aires",
    direccion: "Calle 4 Nº 2901 (Av. del Petróleo Argentino), Berisso",
    telefono: "(0221) 463-1912",
    whatsapp: "",
    horario: "Lunes a Viernes · 8:30 – 17:00",
    web: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    mapsQuery: "Segutecnica Local Comercial Berisso",
    lat: -34.8822579, lng: -57.9013397
  },
  {
    nombre: "Segutecnica — Sucursal Calle 44",
    tipo: "venta",
    ciudad: "Berisso",
    provincia: "Buenos Aires",
    direccion: "Calle 44 Nº 4341, Berisso",
    telefono: "(0221) 463-7933",
    whatsapp: "",
    horario: "Lunes a Viernes · 8:30 – 17:00",
    web: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    mapsQuery: "Calle 44 4341, Berisso, Buenos Aires",
    lat: -34.8863024, lng: -57.8466388
  },
  {
    nombre: "Ferrosol SAS",
    tipo: "venta",
    ciudad: "Córdoba",
    provincia: "Córdoba",
    direccion: "Av. Vélez Sarsfield 3064, Córdoba",
    telefono: "+54 9 351 752-8243",
    whatsapp: "5493517528243",
    horario: "Lunes a Viernes · 8:30 – 18:00 · Sábados 9:00 – 13:00",
    web: "",
    instagram: "https://www.instagram.com/ferrosolsas",
    facebook: "https://www.facebook.com/ferrosolsas",
    tiktok: "https://www.tiktok.com/@ferrosolsas",
    mapsQuery: "Ferrosol SAS, Av. Vélez Sarsfield 3064, Córdoba",
    lat: -31.4459443, lng: -64.1987038
  },
  {
    nombre: "Exsold",
    tipo: "venta",
    ciudad: "Godoy Cruz",
    provincia: "Mendoza",
    direccion: "Cervantes 2455, Godoy Cruz",
    telefono: "(0261) 463-1812",
    whatsapp: "5492616831165",
    horario: "Lunes a Viernes · 8:30 – 17:00",
    web: "https://exsold.com.ar/",
    instagram: "https://www.instagram.com/exsold_soldaduras",
    facebook: "",
    tiktok: "",
    mapsQuery: "EXSOLD de Soldaduras del Oeste, Cervantes 2455, Godoy Cruz",
    lat: -32.9544448, lng: -68.8487777
  },
  {
    nombre: "Solplas",
    tipo: "venta",
    ciudad: "Rosario",
    provincia: "Santa Fe",
    direccion: "Almafuerte 1655, Rosario",
    telefono: "+54 9 341 562-2739",
    whatsapp: "5493416873029",
    horario: "Lunes a Viernes · 8:00 – 17:00",
    web: "",
    instagram: "https://www.instagram.com/solplas",
    facebook: "",
    tiktok: "",
    mapsQuery: "Solplas, Almafuerte 1655, Rosario",
    lat: -32.9174369, lng: -60.6860277
  },
  {
    nombre: "CAZ Insumos Industriales",
    tipo: "venta",
    ciudad: "San Miguel de Tucumán",
    provincia: "Tucumán",
    direccion: "Viamonte 32, San Miguel de Tucumán",
    telefono: "+54 381 401-7066",
    whatsapp: "5493814017066",
    horario: "Lunes a Viernes · 8:30 – 18:00 · Sábados 9:00 – 13:00",
    web: "",
    instagram: "https://www.instagram.com/caz_insumos_industriales",
    facebook: "",
    tiktok: "",
    mapsQuery: "CAZ Insumos Industriales, Viamonte 32, San Miguel de Tucumán",
    lat: -26.8224515, lng: -65.2410402
  },
  {
    nombre: "Máquinas para Soldaduras",
    tipo: "servicio",
    ciudad: "Mar del Plata",
    provincia: "Buenos Aires",
    direccion: "Magallanes 6423, Mar del Plata",
    telefono: "(0223) 526-9695",
    whatsapp: "5492235269695",
    horario: "Lunes a Viernes · 8:00 – 16:30",
    web: "https://www.maquinasparasoldar.com.ar",
    instagram: "",
    facebook: "",
    tiktok: "",
    mapsQuery: "Magallanes 6423, Mar del Plata",
    lat: -38.0228271, lng: -57.574564
  },
  {
    nombre: "Soldaduras · Welding.com.ar",
    tipo: "venta",
    ciudad: "Lomas del Mirador",
    provincia: "Buenos Aires",
    direccion: "Av. Gral. Enrique Mosconi 338, Lomas del Mirador",
    telefono: "+54 9 11 4916-2325",
    whatsapp: "5491149162325",
    horario: "Lunes a Viernes · 8:00 – 16:00",
    web: "https://www.welding.com.ar/",
    instagram: "https://www.instagram.com/soldaduras",
    facebook: "",
    tiktok: "https://www.tiktok.com/@welding.com.ar",
    mapsQuery: "Soldaduras, Av. Gral. Enrique Mosconi 338, Lomas del Mirador",
    lat: -34.659043, lng: -58.5296264
  }
];
