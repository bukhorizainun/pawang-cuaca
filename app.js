/* ===== Pawang Cuaca — prakiraan multi-model ===== */

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const STORAGE_KEY = "pawang-cuaca:place";
const REFRESH_MS = 10 * 60 * 1000;

const DEFAULT_PLACE = {
  name: "Linz", admin1: "Oberösterreich", country: "Austria",
  country_code: "AT", latitude: 48.3069, longitude: 14.2858
};

const QUICK_PLACES = {
  linz: DEFAULT_PLACE,
  jakarta: { name: "Jakarta", admin1: "", country: "Indonesia", country_code: "ID", latitude: -6.2146, longitude: 106.8451 },
  yogyakarta: { name: "Yogyakarta", admin1: "", country: "Indonesia", country_code: "ID", latitude: -7.8014, longitude: 110.3647 }
};

/* Deskripsi kode cuaca WMO */
const WMO_TEXT = {
  0: "Cerah", 1: "Cerah berawan", 2: "Berawan sebagian", 3: "Mendung",
  45: "Kabut", 48: "Kabut beku",
  51: "Gerimis ringan", 53: "Gerimis", 55: "Gerimis lebat",
  56: "Gerimis beku", 57: "Gerimis beku lebat",
  61: "Hujan ringan", 63: "Hujan sedang", 65: "Hujan lebat",
  66: "Hujan beku", 67: "Hujan beku lebat",
  71: "Salju ringan", 73: "Salju sedang", 75: "Salju lebat", 77: "Butiran salju",
  80: "Hujan lokal ringan", 81: "Hujan lokal sedang", 82: "Hujan lokal deras",
  85: "Salju lokal ringan", 86: "Salju lokal lebat",
  95: "Badai petir", 96: "Badai petir, hujan es", 99: "Badai petir, hujan es lebat"
};

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const ARAH_ANGIN = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];

const MODELS = [
  { key: "ecmwf_ifs025", name: "ECMWF", color: "#e8b64c" },
  { key: "gfs_seamless", name: "GFS", color: "#5aa2e0" },
  { key: "icon_seamless", name: "ICON", color: "#7dcf8a" }
];

/* ===== observasi stasiun ===== */

const GEOSPHERE_API = "https://dataset.api.hub.geosphere.at/v1/station/current/tawes-v1-10min";
const METNO_METAR = "https://api.met.no/weatherapi/tafmetar/1.0/metar.txt";

/* Bandara ber-METAR: Austria, Indonesia (lengkap), dan hub dunia */
const AIRPORTS = [
  // Austria
  ["LOWL", "Linz/Hörsching", 48.23, 14.19], ["LOWW", "Wina Schwechat", 48.11, 16.57],
  ["LOWS", "Salzburg", 47.79, 13.00], ["LOWI", "Innsbruck", 47.26, 11.34],
  ["LOWG", "Graz", 46.99, 15.44], ["LOWK", "Klagenfurt", 46.64, 14.34],
  // Indonesia
  ["WIII", "Soekarno-Hatta, Jakarta", -6.13, 106.66], ["WAHI", "Yogyakarta Int'l (YIA)", -7.91, 110.06],
  ["WARR", "Juanda, Surabaya", -7.38, 112.79], ["WADD", "Ngurah Rai, Denpasar", -8.75, 115.17],
  ["WIMM", "Kualanamu, Medan", 3.64, 98.89], ["WAAA", "Hasanuddin, Makassar", -5.06, 119.55],
  ["WALL", "Sepinggan, Balikpapan", -1.27, 116.89], ["WIBB", "Pekanbaru", -0.46, 101.44],
  ["WIPP", "Palembang", -2.90, 104.70], ["WICC", "Husein, Bandung", -6.90, 107.58],
  ["WIOO", "Supadio, Pontianak", -0.15, 109.40], ["WADL", "Praya, Lombok", -8.76, 116.28],
  ["WAMM", "Sam Ratulangi, Manado", 1.55, 124.93], ["WAJJ", "Sentani, Jayapura", -2.58, 140.52],
  ["WATT", "El Tari, Kupang", -10.17, 123.67], ["WIEE", "Minangkabau, Padang", -0.79, 100.28],
  ["WAHS", "Ahmad Yani, Semarang", -6.97, 110.37], ["WAOO", "Banjarmasin", -3.44, 114.76],
  // Eropa
  ["EDDM", "München", 48.35, 11.79], ["EDDF", "Frankfurt", 50.03, 8.57], ["EDDB", "Berlin", 52.36, 13.50],
  ["LSZH", "Zürich", 47.46, 8.55], ["LFPG", "Paris CDG", 49.01, 2.55], ["EGLL", "London Heathrow", 51.47, -0.45],
  ["EHAM", "Amsterdam", 52.31, 4.76], ["EBBR", "Brussel", 50.90, 4.48], ["LEMD", "Madrid", 40.47, -3.56],
  ["LEBL", "Barcelona", 41.30, 2.08], ["LIRF", "Roma Fiumicino", 41.80, 12.24], ["LIMC", "Milan Malpensa", 45.63, 8.72],
  ["LKPR", "Praha", 50.10, 14.26], ["LHBP", "Budapest", 47.44, 19.26], ["LZIB", "Bratislava", 48.17, 17.21],
  ["LJLJ", "Ljubljana", 46.22, 14.46], ["LDZA", "Zagreb", 45.74, 16.07], ["EPWA", "Warsawa", 52.17, 20.97],
  ["EKCH", "Kopenhagen", 55.62, 12.65], ["ESSA", "Stockholm", 59.65, 17.92], ["ENGM", "Oslo", 60.19, 11.10],
  ["EFHK", "Helsinki", 60.32, 24.96], ["LTFM", "Istanbul", 41.26, 28.74], ["LGAV", "Athena", 37.94, 23.94],
  // Asia & Timur Tengah
  ["OMDB", "Dubai", 25.25, 55.36], ["OTHH", "Doha", 25.27, 51.61], ["OERK", "Riyadh", 24.96, 46.70],
  ["OEJN", "Jeddah", 21.68, 39.16], ["VIDP", "Delhi", 28.57, 77.10], ["VABB", "Mumbai", 19.09, 72.87],
  ["VCBI", "Kolombo", 7.18, 79.88], ["VTBS", "Bangkok Suvarnabhumi", 13.69, 100.75],
  ["WSSS", "Singapura Changi", 1.36, 103.99], ["WMKK", "Kuala Lumpur", 2.75, 101.71],
  ["WBSB", "Brunei", 4.94, 114.93], ["VVNB", "Hanoi", 21.22, 105.81], ["VVTS", "Ho Chi Minh", 10.82, 106.65],
  ["RPLL", "Manila", 14.51, 121.02], ["VHHH", "Hong Kong", 22.31, 113.91], ["ZBAA", "Beijing", 40.08, 116.58],
  ["ZSPD", "Shanghai Pudong", 31.14, 121.81], ["RJTT", "Tokyo Haneda", 35.55, 139.78],
  ["RKSI", "Seoul Incheon", 37.46, 126.44],
  // Oseania, Amerika, Afrika
  ["YPDN", "Darwin", -12.41, 130.88], ["YSSY", "Sydney", -33.95, 151.18], ["YMML", "Melbourne", -37.67, 144.84],
  ["NZAA", "Auckland", -37.01, 174.79], ["KJFK", "New York JFK", 40.64, -73.78], ["KORD", "Chicago", 41.98, -87.90],
  ["KLAX", "Los Angeles", 33.94, -118.41], ["KSFO", "San Francisco", 37.62, -122.38],
  ["CYYZ", "Toronto", 43.68, -79.63], ["MMMX", "Mexico City", 19.44, -99.07],
  ["SBGR", "São Paulo", -23.44, -46.47], ["SAEZ", "Buenos Aires", -34.82, -58.54],
  ["SCEL", "Santiago", -33.39, -70.79], ["SKBO", "Bogotá", 4.70, -74.15],
  ["HECA", "Kairo", 30.12, 31.41], ["DNMM", "Lagos", 6.58, 3.32],
  ["FAOR", "Johannesburg", -26.14, 28.25], ["HKJK", "Nairobi", -1.32, 36.93],
  ["GMMN", "Casablanca", 33.37, -7.59]
];

const WX_MAP = {
  DZ: "gerimis", RA: "hujan", SN: "salju", SG: "butir salju", PL: "es pelet",
  GR: "hujan es", GS: "es kecil", UP: "presipitasi", BR: "halimun", FG: "kabut",
  FU: "asap", VA: "abu vulkanik", DU: "debu", SA: "pasir", HZ: "udara kabur",
  SQ: "squall", FC: "puting beliung", TS: "badai petir", SH: "hujan lokal",
  FZ: "membeku", VC: "di sekitar", MI: "tipis", BC: "berkas", DR: "melayang",
  BL: "tertiup", PR: "sebagian", PO: "pusaran debu", DS: "badai debu", SS: "badai pasir"
};

const CLOUD_MAP = { FEW: "sedikit awan", SCT: "awan tersebar", BKN: "awan pecah", OVC: "tertutup awan", VV: "visibilitas vertikal" };

const $ = id => document.getElementById(id);

let currentPlace = loadPlace();
let hourlyData = null;   // untuk grafik 24 jam
let modelData = null;    // untuk grafik perbandingan model
let searchTimer = null;
let searchResults = [];

/* ===================== ikon SVG ===================== */

const CLOUD = 'M18 10h-1.26A8 8 0 1 0 9 20h9a4 4 0 0 0 0-8z';

const SUN_FULL =
  '<g class="i-sun"><circle cx="16" cy="16" r="6"/>' +
  '<line x1="16" y1="4.5" x2="16" y2="7.5"/><line x1="16" y1="24.5" x2="16" y2="27.5"/>' +
  '<line x1="4.5" y1="16" x2="7.5" y2="16"/><line x1="24.5" y1="16" x2="27.5" y2="16"/>' +
  '<line x1="8.2" y1="8.2" x2="10.3" y2="10.3"/><line x1="21.7" y1="21.7" x2="23.8" y2="23.8"/>' +
  '<line x1="8.2" y1="23.8" x2="10.3" y2="21.7"/><line x1="21.7" y1="10.3" x2="23.8" y2="8.2"/></g>';

const SUN_SMALL =
  '<g class="i-sun"><circle cx="21" cy="9.5" r="4"/>' +
  '<line x1="21" y1="3.2" x2="21" y2="5"/><line x1="25.6" y1="9.5" x2="27.4" y2="9.5"/>' +
  '<line x1="24.3" y1="6.2" x2="25.6" y2="4.9"/><line x1="17.7" y1="6.2" x2="16.4" y2="4.9"/></g>';

const MOON_FULL =
  '<g transform="translate(4.5,4.5) scale(0.96)"><path class="i-moon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></g>';

const MOON_SMALL =
  '<g transform="translate(14,2.5) scale(0.5)"><path class="i-moon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></g>';

function cloudAt(tx, ty, s, cls) {
  return `<g transform="translate(${tx},${ty}) scale(${s})"><path class="${cls}" d="${CLOUD}"/></g>`;
}

const RAIN3 =
  '<g class="i-rain"><line x1="12" y1="24.5" x2="10.9" y2="29.3"/>' +
  '<line x1="17" y1="24.5" x2="15.9" y2="29.3"/><line x1="22" y1="24.5" x2="20.9" y2="29.3"/></g>';

const RAIN4 =
  '<g class="i-rain"><line x1="10.5" y1="24.5" x2="9.4" y2="29.5"/>' +
  '<line x1="15" y1="24.5" x2="13.9" y2="29.5"/><line x1="19.5" y1="24.5" x2="18.4" y2="29.5"/>' +
  '<line x1="24" y1="24.5" x2="22.9" y2="29.5"/></g>';

const DRIZZLE3 =
  '<g class="i-rain"><line x1="12" y1="25" x2="11.6" y2="27"/>' +
  '<line x1="17" y1="26" x2="16.6" y2="28"/><line x1="22" y1="25" x2="21.6" y2="27"/></g>';

function flake(x, y) {
  return `<line x1="${x - 1.6}" y1="${y}" x2="${x + 1.6}" y2="${y}"/>` +
         `<line x1="${x}" y1="${y - 1.6}" x2="${x}" y2="${y + 1.6}"/>`;
}
const SNOW3 = `<g class="i-snow">${flake(12, 26.5)}${flake(17, 28)}${flake(22, 26.5)}</g>`;

const BOLT = '<path class="i-bolt" d="M17.6 20.5 13.4 26.6h3.3l-2 5.3 5.9-7.6h-3.4l2.4-3.8z"/>';

const FOG_LINES =
  '<g class="i-fog"><line x1="8" y1="25.5" x2="24" y2="25.5"/><line x1="11" y1="29" x2="21" y2="29"/></g>';

const ICONS = {
  "clear-d": SUN_FULL,
  "clear-n": MOON_FULL,
  "part-d": SUN_SMALL + cloudAt(2, 8, 1.0, "i-cloud i-cloud-fill"),
  "part-n": MOON_SMALL + cloudAt(2, 8, 1.0, "i-cloud i-cloud-fill"),
  "overcast": cloudAt(10, 2.5, 0.75, "i-cloud-back") + cloudAt(1.5, 8, 1.0, "i-cloud i-cloud-fill"),
  "fog": cloudAt(4, 1.5, 0.95, "i-cloud") + FOG_LINES,
  "drizzle": cloudAt(4, 1, 0.95, "i-cloud") + DRIZZLE3,
  "rain": cloudAt(4, 1, 0.95, "i-cloud") + RAIN3,
  "rain-heavy": cloudAt(4, 1, 0.95, "i-cloud") + RAIN4,
  "snow": cloudAt(4, 1, 0.95, "i-cloud") + SNOW3,
  "storm": cloudAt(4, 0.5, 0.95, "i-cloud") + BOLT
};

function iconKey(code, isDay) {
  const sfx = isDay ? "d" : "n";
  if (code === 0) return "clear-" + sfx;
  if (code === 1 || code === 2) return "part-" + sfx;
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ([61, 66, 80].includes(code)) return "rain";
  if ([63, 65, 67, 81, 82].includes(code)) return "rain-heavy";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "overcast";
}

function iconSVG(code, isDay) {
  return `<svg viewBox="0 0 32 32" class="wicon" aria-hidden="true">${ICONS[iconKey(code, isDay)]}</svg>`;
}

/* ===================== util ===================== */

function wmoText(code) { return WMO_TEXT[code] || "Kondisi tidak lazim (kode " + code + ")"; }

function flagEmoji(cc) {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

function windDir(deg) { return ARAH_ANGIN[Math.round(deg / 45) % 8]; }

function glowClass(code, isDay) {
  if (code >= 95) return "w-storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "w-snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "w-rain";
  if (code === 45 || code === 48) return "w-fog";
  if (code <= 1) return isDay ? "w-clear-day" : "w-clear-night";
  return "w-cloudy";
}

/* ISO lokal "2026-07-03T08:00" — sudah dalam zona waktu kota terpilih */
function dayOfWeek(iso) {
  return new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)).getDay();
}
function fmtDate(iso) { return +iso.slice(8, 10) + " " + BULAN[+iso.slice(5, 7) - 1]; }
function fmtClock(iso) { return iso.slice(11, 16); }

function isDayAt(iso, daily) {
  const di = daily.time.indexOf(iso.slice(0, 10));
  if (di < 0) return true;
  return iso >= daily.sunrise[di] && iso < daily.sunset[di];
}

function placeLabel(p) {
  const parts = [p.name];
  if (p.admin1 && p.admin1 !== p.name) parts.push(p.admin1);
  if (p.country) parts.push(p.country);
  return parts.join(", ") + (p.country_code ? " " + flagEmoji(p.country_code) : "");
}

function loadPlace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.latitude === "number" && typeof p.longitude === "number" && p.name) return p;
    }
  } catch (e) { /* localStorage bisa mati di file:// */ }
  return DEFAULT_PLACE;
}

function savePlace(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) { /* abaikan */ }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/* ===================== observasi stasiun ===================== */

function distKm(lat1, lon1, lat2, lon2) {
  const d = Math.PI / 180, R = 6371;
  const s = Math.sin((lat2 - lat1) * d / 2) ** 2 +
    Math.cos(lat1 * d) * Math.cos(lat2 * d) * Math.sin((lon2 - lon1) * d / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function titleCase(s) {
  return s.toLowerCase().replace(/(^|[\s\-\/.])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
}

function inAustria(lat, lon) {
  return lat >= 46.3 && lat <= 49.1 && lon >= 9.4 && lon <= 17.2;
}

function ageText(ms) {
  const min = Math.round(ms / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return min + " mnt lalu";
  return Math.floor(min / 60) + " j " + (min % 60) + " mnt lalu";
}

function kvRow(label, val, cls) {
  return `<div class="kv${cls ? " " + cls : ""}"><span>${label}</span><b>${val}</b></div>`;
}

function relHumidity(T, Td) {
  const e = t => Math.exp(17.625 * t / (243.04 + t));
  return Math.round(100 * e(Td) / e(T));
}

/* --- GeoSphere Austria (TAWES) --- */

let geoMetaCache = null;

async function getGeoStations() {
  if (!geoMetaCache) {
    const meta = await fetchJson(GEOSPHERE_API + "/metadata");
    geoMetaCache = meta.stations.filter(s => s.is_active);
  }
  return geoMetaCache;
}

async function loadGeoSphere(place, modelTemp) {
  const panel = $("obs-geo");
  if (!inAustria(place.latitude, place.longitude)) { panel.hidden = true; return false; }

  panel.hidden = false;
  $("geo-station").textContent = "Mencari stasiun terdekat…";
  $("geo-stats").innerHTML = "";
  $("geo-age").textContent = "";

  try {
    const stations = await getGeoStations();
    const nearest = stations
      .map(s => ({ ...s, dist: distKm(place.latitude, place.longitude, s.lat, s.lon) }))
      .sort((a, b) => a.dist - b.dist)[0];

    const data = await fetchJson(
      `${GEOSPHERE_API}?parameters=TL,TP,RF,DD,FFAM,FFX,PRED,RR&station_ids=${nearest.id}`);
    const P = data.features[0].properties.parameters;
    const v = k => P[k] && P[k].data[0] != null ? P[k].data[0] : null;

    $("geo-age").textContent = ageText(Date.now() - Date.parse(data.timestamps[0]));
    $("geo-station").innerHTML =
      `${titleCase(nearest.name)} <span class="o-sub">· ${nearest.dist.toFixed(1)} km · ${Math.round(nearest.altitude)} m dpl</span>`;

    const rows = [];
    if (v("TL") != null) rows.push(kvRow("Suhu udara", v("TL").toFixed(1) + " °C"));
    if (v("TP") != null) rows.push(kvRow("Titik embun", v("TP").toFixed(1) + " °C"));
    if (v("RF") != null) rows.push(kvRow("Kelembapan", Math.round(v("RF")) + "%"));
    if (v("FFAM") != null) rows.push(kvRow("Angin", Math.round(v("FFAM") * 3.6) + " km/j" + (v("DD") != null ? " " + windDir(v("DD")) : "")));
    if (v("FFX") != null) rows.push(kvRow("Hembusan", Math.round(v("FFX") * 3.6) + " km/j"));
    if (v("PRED") != null) rows.push(kvRow("Tekanan (MSL)", Math.round(v("PRED")) + " hPa"));
    if (v("RR") != null) rows.push(kvRow("Hujan 10 mnt", v("RR").toFixed(1) + " mm"));
    if (v("TL") != null && modelTemp != null) {
      const dT = v("TL") - modelTemp;
      rows.push(kvRow("Selisih vs model", (dT >= 0 ? "+" : "") + dT.toFixed(1) + " °C", "kv-delta"));
    }
    $("geo-stats").innerHTML = rows.join("");
    return true;
  } catch (err) {
    $("geo-station").textContent = "";
    $("geo-stats").innerHTML = `<div class="obs-empty">Stasiun GeoSphere sedang tidak bisa dihubungi (${err.message}).</div>`;
    return true;
  }
}

/* --- METAR (laporan stasiun bandara, arsip MET Norway) --- */

function parseMetar(raw) {
  const m = { clouds: [], wx: [] };
  const parts = raw.replace(/=+\s*$/, "").trim().split(/\s+/);
  m.station = parts[0];
  let afterWind = false;
  for (const p of parts) {
    let t;
    if ((t = p.match(/^(\d{2})(\d{2})(\d{2})Z$/))) {
      m.day = +t[1]; m.hh = +t[2]; m.mm = +t[3];
    } else if ((t = p.match(/^(VRB|\d{3})(\d{2,3})(G(\d{2,3}))?(KT|MPS)$/))) {
      const k = t[5] === "KT" ? 1.852 : 3.6;
      m.windDir = t[1] === "VRB" ? null : +t[1];
      m.windKmh = Math.round(+t[2] * k);
      m.gustKmh = t[4] ? Math.round(+t[4] * k) : null;
      afterWind = true;
    } else if (p === "CAVOK") {
      m.cavok = true; m.visM = 9999;
    } else if (afterWind && m.visM == null && (t = p.match(/^(\d{4})(NDV)?$/))) {
      m.visM = +t[1];
    } else if (afterWind && m.visM == null && (t = p.match(/^(\d{1,2})(\/(\d))?SM$/))) {
      m.visM = Math.round((+t[1] / (t[3] ? +t[3] : 1)) * 1609);
    } else if ((t = p.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})/))) {
      m.clouds.push({ cover: t[1], baseM: Math.round(+t[2] * 30.48) });
    } else if ((t = p.match(/^(M?)(\d{2})\/(M?)(\d{2})$/))) {
      m.temp = (t[1] ? -1 : 1) * +t[2];
      m.dew = (t[3] ? -1 : 1) * +t[4];
    } else if ((t = p.match(/^Q(\d{4})$/))) {
      m.qnh = +t[1];
    } else if ((t = p.match(/^A(\d{4})$/))) {
      m.qnh = Math.round(+t[1] * 0.338639);
    } else if (/^(\+|-|VC)?(MI|BC|PR|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS)+$/.test(p)) {
      m.wx.push(p);
    }
  }
  return m;
}

function wxText(tok) {
  let s = tok, intensity = "";
  if (s.startsWith("+")) { intensity = " lebat"; s = s.slice(1); }
  else if (s.startsWith("-")) { intensity = " ringan"; s = s.slice(1); }
  const words = [];
  for (let i = 0; i < s.length; i += 2) words.push(WX_MAP[s.slice(i, i + 2)] || s.slice(i, i + 2));
  return words.join(" ") + intensity;
}

function metarDate(day, hh, mm) {
  const now = new Date();
  let d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hh, mm));
  if (d.getTime() - now.getTime() > 2 * 86400000) {
    d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, day, hh, mm));
  }
  return d;
}

async function loadMetar(place, modelTemp) {
  const panel = $("obs-metar");
  panel.hidden = false;
  $("metar-station").textContent = "Mencari bandara terdekat…";
  $("metar-stats").innerHTML = "";
  $("metar-raw").textContent = "";
  $("metar-age").textContent = "";

  const candidates = AIRPORTS
    .map(([icao, name, lat, lon]) => ({ icao, name, dist: distKm(place.latitude, place.longitude, lat, lon) }))
    .filter(a => a.dist <= 500)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  if (!candidates.length) {
    $("metar-station").textContent = "";
    $("metar-stats").innerHTML = '<div class="obs-empty">Tidak ada bandara ber-METAR dalam radius 500 km dari titik ini.</div>';
    return true;
  }

  for (const ap of candidates) {
    try {
      const res = await fetch(`${METNO_METAR}?icao=${ap.icao}`);
      if (!res.ok) continue;
      const text = (await res.text()).trim();
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.startsWith(ap.icao));
      if (!lines.length) continue;

      const raw = lines[lines.length - 1];
      const m = parseMetar(raw);

      if (m.day != null) $("metar-age").textContent = ageText(Date.now() - metarDate(m.day, m.hh, m.mm).getTime());
      $("metar-station").innerHTML = `${ap.name} <span class="o-sub">· ${ap.icao} · ${ap.dist.toFixed(0)} km</span>`;

      const rows = [];
      if (m.temp != null) rows.push(kvRow("Suhu udara", m.temp + " °C"));
      if (m.dew != null) rows.push(kvRow("Titik embun", m.dew + " °C"));
      if (m.temp != null && m.dew != null) rows.push(kvRow("Kelembapan", relHumidity(m.temp, m.dew) + "%"));
      if (m.windKmh != null) rows.push(kvRow("Angin", m.windKmh + " km/j" + (m.windDir != null ? " " + windDir(m.windDir) : " variabel")));
      if (m.gustKmh != null) rows.push(kvRow("Hembusan", m.gustKmh + " km/j"));
      if (m.visM != null) rows.push(kvRow("Visibilitas", m.visM >= 9999 ? "≥ 10 km" + (m.cavok ? " (CAVOK)" : "") : (m.visM / 1000).toFixed(1) + " km"));
      if (m.wx.length) rows.push(kvRow("Fenomena", m.wx.map(wxText).join(", ")));
      if (m.clouds.length) {
        const c = m.clouds[0];
        rows.push(kvRow("Awan", `${CLOUD_MAP[c.cover] || c.cover} ${c.baseM.toLocaleString("id-ID")} m`));
      } else if (m.cavok) {
        rows.push(kvRow("Awan", "tidak signifikan (CAVOK)"));
      }
      if (m.qnh != null) rows.push(kvRow("Tekanan (QNH)", m.qnh + " hPa"));
      if (m.temp != null && modelTemp != null) {
        const dT = m.temp - modelTemp;
        rows.push(kvRow("Selisih vs model", (dT >= 0 ? "+" : "") + dT.toFixed(1) + " °C", "kv-delta"));
      }
      $("metar-stats").innerHTML = rows.join("");
      $("metar-raw").textContent = raw;
      return true;
    } catch (err) { /* coba kandidat berikutnya */ }
  }

  $("metar-station").textContent = "";
  $("metar-stats").innerHTML = '<div class="obs-empty">METAR bandara terdekat sedang tidak tersedia.</div>';
  return true;
}

async function loadObservations(place, modelTemp) {
  const [geo, metar] = await Promise.all([
    loadGeoSphere(place, modelTemp),
    loadMetar(place, modelTemp)
  ]);
  $("obs-card").hidden = !(geo || metar);
}

/* ===================== Catatan Mbah ===================== */

function catatanMbah(data, place) {
  const c = data.current;
  const code = c.weather_code, T = c.temperature_2m;
  const nama = place.name;
  const prob = data.daily.precipitation_probability_max[0];
  const uv = data.daily.uv_index_max[0];
  const hujanGroup = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const lines = [];

  if (code >= 95) {
    lines.push(`Petir sedang aktif di ${nama}. Mbah menyarankan menunda ambisi luar ruangan; teh hangat secara statistik lebih aman.`);
  } else if ([63, 65, 67, 81, 82].includes(code)) {
    lines.push(`Hujan yang serius di ${nama}. Hari ini payung bukan aksesori, melainkan kebutuhan primer.`);
  } else if ([51, 53, 55, 56, 57, 61, 66, 80].includes(code)) {
    lines.push(`Gerimis tipis-tipis di ${nama}. Payung lipat di dalam tas tidak pernah mengkhianati.`);
  } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    lines.push(`Salju turun di ${nama}. Sepatu anti-licin dahulu, estetika menyusul.`);
  } else if (code === 45 || code === 48) {
    lines.push(`Kabut di ${nama}; jarak pandang sedang irit. Berkendara seperlunya, menyalip juga seperlunya.`);
  } else if (code <= 1) {
    if (T >= 30) lines.push(`Cerah dan panas di ${nama}. Hidrasi hari ini bukan saran, melainkan instruksi.`);
    else if (T <= 10) lines.push(`Cerah tapi menggigit di ${nama}. Jaket dahulu, gaya kemudian.`);
    else lines.push(`Langit ${nama} sedang bersahabat. Sayang kalau hanya ditonton dari jendela.`);
  } else {
    lines.push(`Langit ${nama} abu-abu netral. Aman untuk hampir semua rencana, kecuali menjemur pakaian.`);
  }

  if (T <= 0) lines.push("Suhu di bawah nol; sarung tangan berstatus wajib.");
  if (prob >= 60 && !hujanGroup) lines.push(`Peluang hujan hari ini ${prob}% — payung sebaiknya ikut bepergian.`);
  if (uv >= 8) lines.push(`Indeks UV ${Math.round(uv)}; tabir surya jangan hanya menghuni rak.`);

  return lines.join(" ");
}

/* ===================== ambil & render ===================== */

async function loadWeather(place) {
  const statusEl = $("status");
  statusEl.hidden = false;
  statusEl.classList.remove("error");
  statusEl.textContent = `Menerawang langit ${place.name}…`;

  const base = `latitude=${place.latitude}&longitude=${place.longitude}&timezone=auto`;

  const mainUrl = `${WEATHER_API}?${base}&forecast_days=7` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,surface_pressure` +
    `&hourly=temperature_2m,precipitation_probability,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max`;

  const modelUrl = `${WEATHER_API}?${base}&forecast_days=3` +
    `&hourly=temperature_2m&models=${MODELS.map(m => m.key).join(",")}`;

  const [mainRes, modelRes] = await Promise.allSettled([fetchJson(mainUrl), fetchJson(modelUrl)]);

  if (mainRes.status === "rejected") {
    statusEl.classList.add("error");
    statusEl.textContent = "Terawangan buyar: " + mainRes.reason.message + ". Periksa koneksi, lalu coba lagi.";
    return;
  }

  render(mainRes.value, place);

  loadObservations(place, mainRes.value.current.temperature_2m);

  if (modelRes.status === "fulfilled") {
    $("model-card").hidden = false;
    renderModels(modelRes.value, mainRes.value.current.time);
  } else {
    $("model-card").hidden = true;
  }

  statusEl.hidden = true;
  $("app").hidden = false;
  $("updated-at").textContent = "Diperbarui " +
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function render(data, place) {
  const c = data.current;
  const daily = data.daily;
  const isDay = c.is_day === 1;

  document.body.className = glowClass(c.weather_code, isDay);

  $("place-line").textContent = placeLabel(place);
  $("local-time").textContent =
    `${HARI[dayOfWeek(c.time)]}, ${fmtDate(c.time)} · ${fmtClock(c.time)} waktu setempat (${data.timezone_abbreviation})`;

  $("cur-icon").innerHTML = iconSVG(c.weather_code, isDay);
  $("cur-temp").textContent = Math.round(c.temperature_2m);
  $("cur-desc").textContent = wmoText(c.weather_code);
  $("cur-feels").textContent = Math.round(c.apparent_temperature);

  $("cur-hum").textContent = c.relative_humidity_2m + "%";
  $("cur-wind").textContent = Math.round(c.wind_speed_10m) + " km/j " + windDir(c.wind_direction_10m);
  $("cur-gust").textContent = Math.round(c.wind_gusts_10m) + " km/j";
  $("cur-cloud").textContent = c.cloud_cover + "%";
  $("cur-precip").textContent = c.precipitation + " mm";
  $("cur-press").textContent = Math.round(c.surface_pressure) + " hPa";
  $("cur-uv").textContent = daily.uv_index_max[0] != null ? daily.uv_index_max[0].toFixed(1) : "—";
  $("cur-sun").textContent = fmtClock(daily.sunrise[0]) + " – " + fmtClock(daily.sunset[0]);

  $("wejangan").textContent = catatanMbah(data, place);

  renderHourly(data);
  renderDaily(data);
}

function renderHourly(data) {
  const h = data.hourly;
  let idx = h.time.indexOf(data.current.time.slice(0, 13) + ":00");
  if (idx < 0) idx = 0;

  hourlyData = [];
  const strip = $("hourly-strip");
  strip.innerHTML = "";

  for (let i = idx; i < Math.min(idx + 24, h.time.length); i++) {
    const iso = h.time[i];
    const prob = h.precipitation_probability[i] ?? 0;
    hourlyData.push({ label: fmtClock(iso), temp: h.temperature_2m[i], prob });

    const chip = document.createElement("div");
    chip.className = "hour-chip";
    chip.innerHTML =
      `<div class="h-time">${fmtClock(iso)}</div>` +
      `<div class="h-icon">${iconSVG(h.weather_code[i], isDayAt(iso, data.daily))}</div>` +
      `<div class="h-temp">${Math.round(h.temperature_2m[i])}°</div>` +
      `<div class="h-prob">${prob}%</div>`;
    strip.appendChild(chip);
  }
  drawHourlyChart();
}

function renderDaily(data) {
  const d = data.daily;
  const list = $("daily-list");
  list.innerHTML = "";

  const weekMin = Math.min(...d.temperature_2m_min);
  const weekMax = Math.max(...d.temperature_2m_max);
  const range = Math.max(weekMax - weekMin, 1);

  for (let i = 0; i < d.time.length; i++) {
    const lo = d.temperature_2m_min[i], hi = d.temperature_2m_max[i];
    const left = ((lo - weekMin) / range) * 100;
    const width = Math.max(((hi - lo) / range) * 100, 4);

    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML =
      `<div class="day-name">${i === 0 ? "Hari ini" : HARI[dayOfWeek(d.time[i])]}<span class="d-date">${fmtDate(d.time[i])}</span></div>` +
      `<div class="day-icon">${iconSVG(d.weather_code[i], true)}</div>` +
      `<div class="day-desc">${wmoText(d.weather_code[i])}</div>` +
      `<div class="day-rain">${d.precipitation_probability_max[i] ?? 0}%</div>` +
      `<div class="day-min">${Math.round(lo)}°</div>` +
      `<div class="day-track"><div class="day-fill" style="left:${left}%;width:${width}%"></div></div>` +
      `<div class="day-max">${Math.round(hi)}°</div>`;
    list.appendChild(row);
  }
}

function renderModels(data, curTime) {
  const h = data.hourly;
  let idx = h.time.indexOf(curTime.slice(0, 13) + ":00");
  if (idx < 0) idx = 0;
  const end = Math.min(idx + 48, h.time.length);

  modelData = {
    times: h.time.slice(idx, end),
    series: MODELS.map(m => ({
      name: m.name, color: m.color,
      values: (h["temperature_2m_" + m.key] || []).slice(idx, end)
    }))
  };
  drawModelChart();

  /* seberapa akur model-model dunia dalam 24 jam ke depan */
  let maxSpread = 0;
  for (let i = 0; i < Math.min(24, modelData.times.length); i++) {
    const vals = modelData.series.map(s => s.values[i]).filter(v => v != null);
    if (vals.length >= 2) maxSpread = Math.max(maxSpread, Math.max(...vals) - Math.min(...vals));
  }
  const s = maxSpread.toFixed(1);
  let verdict;
  if (maxSpread < 1.5) verdict = `Ketiga model sedang kompak — selisih maksimum ${s} °C dalam 24 jam ke depan. Prakiraan ini boleh dipegang.`;
  else if (maxSpread < 3) verdict = `Model-model besar cukup akur (selisih maksimum ${s} °C). Wajar, namanya juga meramal masa depan.`;
  else verdict = `Para model sedang berbeda pendapat, selisihnya sampai ${s} °C. Masa depan memang sulit; siapkan rencana cadangan.`;
  $("model-verdict").textContent = verdict;
}

/* ===================== grafik (canvas murni) ===================== */

function setupCanvas(canvas, H) {
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const W = wrap.clientWidth || 600;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  return { ctx, W, H };
}

function niceRange(vals) {
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi - lo < 4) { const mid = (hi + lo) / 2; lo = mid - 2; hi = mid + 2; }
  return [Math.floor(lo), Math.ceil(hi)];
}

function drawGrid(ctx, x0, x1, yFor, tMin, tMax, steps) {
  ctx.font = "10px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  for (let k = 0; k <= steps; k++) {
    const t = tMin + (tMax - tMin) * k / steps;
    const y = yFor(t);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = "#5c6678";
    ctx.fillText(Math.round(t) + "°", 2, y - 3);
  }
}

function drawHourlyChart() {
  if (!hourlyData || !hourlyData.length) return;
  const { ctx, W, H } = setupCanvas($("hourly-chart"), 190);

  const padL = 26, padR = 8, padT = 14, padB = 22;
  const iw = W - padL - padR, ih = H - padT - padB;
  const n = hourlyData.length;
  const xs = i => padL + iw * (i + 0.5) / n;

  const [tMin, tMax] = niceRange(hourlyData.map(p => p.temp));
  const ty = t => padT + ih * (1 - (t - tMin) / (tMax - tMin));

  drawGrid(ctx, padL, W - padR, ty, tMin, tMax, 3);

  // batang peluang hujan
  const bw = Math.max(3, (iw / n) * 0.5);
  ctx.fillStyle = "rgba(90,162,224,0.30)";
  hourlyData.forEach((p, i) => {
    const bh = ih * (p.prob || 0) / 100;
    if (bh > 0) ctx.fillRect(xs(i) - bw / 2, padT + ih - bh, bw, bh);
  });

  // isian di bawah garis suhu
  const grad = ctx.createLinearGradient(0, padT, 0, padT + ih);
  grad.addColorStop(0, "rgba(232,182,76,0.18)");
  grad.addColorStop(1, "rgba(232,182,76,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(xs(0), padT + ih);
  hourlyData.forEach((p, i) => ctx.lineTo(xs(i), ty(p.temp)));
  ctx.lineTo(xs(n - 1), padT + ih);
  ctx.closePath();
  ctx.fill();

  // garis suhu
  ctx.strokeStyle = "#e8b64c";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  hourlyData.forEach((p, i) => i ? ctx.lineTo(xs(i), ty(p.temp)) : ctx.moveTo(xs(i), ty(p.temp)));
  ctx.stroke();

  // label jam
  ctx.font = "10px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#8a94a6";
  hourlyData.forEach((p, i) => { if (i % 3 === 0) ctx.fillText(p.label, xs(i), H - 6); });
}

function drawModelChart() {
  if (!modelData || !modelData.times.length) return;
  const { ctx, W, H } = setupCanvas($("model-chart"), 220);

  const padL = 26, padR = 8, padT = 14, padB = 24;
  const iw = W - padL - padR, ih = H - padT - padB;
  const n = modelData.times.length;
  const xs = i => padL + iw * (i + 0.5) / n;

  const all = modelData.series.flatMap(s => s.values).filter(v => v != null);
  if (!all.length) return;
  const [tMin, tMax] = niceRange(all);
  const ty = t => padT + ih * (1 - (t - tMin) / (tMax - tMin));

  drawGrid(ctx, padL, W - padR, ty, tMin, tMax, 4);

  // penanda tengah malam
  ctx.textAlign = "center";
  ctx.font = "10px 'Segoe UI', sans-serif";
  modelData.times.forEach((iso, i) => {
    if (iso.slice(11, 16) === "00:00") {
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath(); ctx.moveTo(xs(i), padT); ctx.lineTo(xs(i), padT + ih); ctx.stroke();
      ctx.fillStyle = "#8a94a6";
      ctx.fillText(HARI[dayOfWeek(iso)].slice(0, 3) + " " + fmtDate(iso), xs(i), H - 6);
    } else if (i % 6 === 0 && i > 0) {
      ctx.fillStyle = "#5c6678";
      ctx.fillText(iso.slice(11, 13), xs(i), H - 6);
    }
  });

  // garis tiap model (lewati nilai kosong)
  modelData.series.forEach(s => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    let pen = false;
    s.values.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      pen ? ctx.lineTo(xs(i), ty(v)) : ctx.moveTo(xs(i), ty(v));
      pen = true;
    });
    ctx.stroke();
  });
}

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { drawHourlyChart(); drawModelChart(); }, 150);
});

/* ===================== pencarian kota ===================== */

function hideResults() {
  $("search-results").hidden = true;
  $("search-results").innerHTML = "";
  searchResults = [];
}

function showResults(list) {
  const box = $("search-results");
  box.innerHTML = "";
  searchResults = list;

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "Kota tidak ditemukan dalam terawangan. Coba ejaan lain?";
    box.appendChild(empty);
  } else {
    list.forEach(p => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-item";
      const main = document.createElement("span");
      main.textContent = `${flagEmoji(p.country_code)} ${p.name}`;
      const sub = document.createElement("span");
      sub.className = "s-sub";
      sub.textContent = [p.admin1, p.country].filter(Boolean).join(", ");
      btn.appendChild(main);
      btn.appendChild(sub);
      // mousedown supaya jalan sebelum blur menutup dropdown
      btn.addEventListener("mousedown", e => { e.preventDefault(); pickPlace(p); });
      box.appendChild(btn);
    });
  }
  box.hidden = false;
}

async function searchCity(query) {
  try {
    const data = await fetchJson(`${GEO_API}?name=${encodeURIComponent(query)}&count=8&language=id&format=json`);
    showResults(data.results || []);
  } catch (err) {
    showResults([]);
  }
}

function pickPlace(p) {
  currentPlace = {
    name: p.name, admin1: p.admin1 || "", country: p.country || "",
    country_code: p.country_code || "", latitude: p.latitude, longitude: p.longitude
  };
  savePlace(currentPlace);
  hideResults();
  $("search-input").value = "";
  $("search-input").blur();
  loadWeather(currentPlace);
}

/* ===================== event ===================== */

$("search-input").addEventListener("input", e => {
  const q = e.target.value.trim();
  clearTimeout(searchTimer);
  if (q.length < 2) { hideResults(); return; }
  searchTimer = setTimeout(() => searchCity(q), 350);
});

$("search-input").addEventListener("keydown", e => {
  if (e.key === "Enter" && searchResults.length) pickPlace(searchResults[0]);
  if (e.key === "Escape") hideResults();
});

$("search-input").addEventListener("blur", () => setTimeout(hideResults, 150));

document.querySelectorAll(".chip[data-quick]").forEach(btn => {
  btn.addEventListener("click", () => pickPlace(QUICK_PLACES[btn.dataset.quick]));
});

$("geo-btn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Browser ini tidak mendukung geolokasi. Silakan cari kota secara manual.");
    return;
  }
  $("status").hidden = false;
  $("status").classList.remove("error");
  $("status").textContent = "Mencari posisimu…";
  navigator.geolocation.getCurrentPosition(
    pos => pickPlace({
      name: "Lokasi kamu", admin1: "", country: "", country_code: "",
      latitude: +pos.coords.latitude.toFixed(4), longitude: +pos.coords.longitude.toFixed(4)
    }),
    () => {
      $("status").classList.add("error");
      $("status").textContent = "Akses lokasi ditolak atau tidak tersedia (file lokal kadang diblokir browser). Silakan cari kota manual.";
    },
    { timeout: 10000 }
  );
});

$("refresh-btn").addEventListener("click", () => loadWeather(currentPlace));

setInterval(() => loadWeather(currentPlace), REFRESH_MS);

/* ===================== mulai ===================== */
loadWeather(currentPlace);
