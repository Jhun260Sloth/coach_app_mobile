import { CL, CD } from "../theme/theme";

/* =========================================================================
   MAP UTILITIES — framework-agnostic helpers shared by the map components.
   Kept out of the component tree so none of this re-runs on re-render, and
   so the CDN script/style tags are only ever injected once per page.
   ========================================================================= */

export function getMapColors(darkMode) {
  return darkMode ? CD : CL;
}

export const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
export const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

export const AUSTRALIA_CENTER = [-25.2744, 133.7751];
export const AUSTRALIA_ZOOM = 4;
// Fallback "you are here" point (Sydney CBD) used whenever the browser denies
// or lacks geolocation, so the blue dot + routing + radius filter always have
// somewhere to sit.
export const FALLBACK_USER_LOCATION = { lat: -33.8688, lng: 151.2093 };
// Zoom level used the first time we auto-centre on the user's real location.
export const LOCATE_ZOOM = 13;
// Preset quick-filter distances shown as chips; anything above 10km lives in
// the custom slider instead (which tops out at CUSTOM_RADIUS_MAX_KM).
export const RADIUS_PRESETS_KM = [5, 10];
export const CUSTOM_RADIUS_MIN_KM = 1;
export const CUSTOM_RADIUS_MAX_KM = 50;

/* =========================================================================
   MAP STYLES — base tile layers the user can switch between. All are free,
   keyless tile sources. "hybrid" additionally layers boundary/label tiles
   on top of the satellite imagery.
   ========================================================================= */
export const MAP_STYLES = [
  {
    id: "street",
    label: "Street",
    description: "Roads, buildings & parks — best for everyday use",
    swatch: "#CFE3D6",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
  {
    id: "satellite",
    label: "Satellite",
    description: "Real aerial imagery",
    swatch: "#3A4A2E",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
  },
  {
    id: "terrain",
    label: "Terrain",
    description: "Elevation, hills & mountains — great for running/cycling",
    swatch: "#D9C9A3",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 13,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Dark UI — premium, night-friendly interface",
    swatch: "#1B1E24",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    maxZoom: 20,
  },
  {
    id: "light",
    label: "Light / Minimal",
    description: "Simplified roads & labels — clean modern look",
    swatch: "#F1F1EE",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    maxZoom: 20,
  },
  {
    id: "topo",
    label: "Topographic",
    description: "Contour lines & elevation detail",
    swatch: "#E4D9B8",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors, SRTM &copy; OpenTopoMap",
    maxZoom: 17,
  },
  {
    id: "outdoor",
    label: "Outdoor",
    description: "Trails, parks & cycling routes highlighted",
    swatch: "#CFE0B8",
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CyclOSM",
    maxZoom: 20,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    description: "Satellite imagery with roads & labels overlaid",
    swatch: "#5B6B4A",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    overlayUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
  },
];
export const DEFAULT_MAP_STYLE_ID = "street";

const MAP_STYLE_ID = "cl-leaflet-style";

/* --- CDN loading, memoised on window so remounting the map view (e.g.
   toggling List/Map) never re-fetches or double-initialises Leaflet. --- */
export function loadLeaflet() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);
  if (window.__clLeafletPromise) return window.__clLeafletPromise;
  window.__clLeafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("cl-leaflet-css")) {
      const link = document.createElement("link");
      link.id = "cl-leaflet-css";
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }
    const existing = document.getElementById("cl-leaflet-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "cl-leaflet-js";
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.__clLeafletPromise;
}

export function injectMapStyles(C = CL) {
  if (document.getElementById(MAP_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MAP_STYLE_ID;
  style.textContent = `
    @keyframes clLocatePulse { 0% { transform: scale(.6); opacity: .45; } 70% { transform: scale(2.4); opacity: 0; } 100% { transform: scale(2.4); opacity: 0; } }
    @keyframes clFixedBlink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
    .cl-user-dot-wrap { width: 20px; height: 20px; position: relative; }
    .cl-user-dot-wrap::before { content: ""; position: absolute; inset: -16px; border-radius: 50%; background: rgba(59,130,246,.38); animation: clLocatePulse 2.2s ease-out infinite; }
    .cl-user-dot-wrap::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: #3B82F6; border: 3px solid ${C.white}; box-shadow: 0 1px 5px rgba(0,0,0,.35); }
    .cl-coach-pin { position: relative; width: 30px; height: 38px; cursor: pointer; }
    .cl-coach-pin .cl-pin-tag { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 4px; background: ${C.jet}; color: ${C.white}; font-size: 11px; font-weight: 700; padding: 5px 9px; border-radius: 10px; white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; font-family: 'Inter', sans-serif; box-shadow: 0 2px 6px rgba(0,0,0,.18); }
    .cl-coach-pin.selected .cl-pin-tag { background: ${C.brand}; color: ${C.jet}; }
    .cl-coach-pin .cl-pin-svg { filter: drop-shadow(0 2px 3px rgba(0,0,0,.28)); transition: transform .12s ease; }
    .cl-coach-pin.selected .cl-pin-svg { transform: scale(1.12); }
    .leaflet-top.leaflet-right { top: 132px !important; }
    .cl-hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .cl-hide-scrollbar::-webkit-scrollbar { display: none; }
    .leaflet-control-zoom { border: none !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.1) !important; margin-right: 16px !important; }
    .leaflet-control-zoom a { width: 34px !important; height: 34px !important; line-height: 34px !important; color: ${C.jet} !important; }
    .leaflet-control-zoom a:first-child { border-bottom: 1px solid ${C.border} !important; }
    .leaflet-touch .leaflet-bar { border: none; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { display: none; }
    .cl-route-glow { filter: drop-shadow(0 1px 3px rgba(37,99,235,.35)); }
    .leaflet-container { font-family: 'Inter', sans-serif; background: #F4F5F7; }
  `;
  document.head.appendChild(style);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

export function coachPinIcon(C, L, name, selected) {
  const fill = selected ? C.jet : C.brand;
  const html = `
    <div class="cl-coach-pin${selected ? " selected" : ""}">
      <div class="cl-pin-tag">${escapeHtml(name)}</div>
      <svg class="cl-pin-svg" width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 37C15 37 27 23.5 27 14C27 6.8 21.2 1 15 1C8.8 1 3 6.8 3 14C3 23.5 15 37 15 37Z"
          fill="${fill}" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="15" cy="14" r="5" fill="#FFFFFF"/>
      </svg>
    </div>`;
  return L.divIcon({ className: "", html, iconSize: [30, 38], iconAnchor: [15, 36] });
}

export function userLocationIcon(L) {
  return L.divIcon({
    className: "",
    html: `<div class="cl-user-dot-wrap"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Real road-following route via OSRM's free public routing API (no key needed).
// Falls back to a straight line if the request fails, so selection still works offline.
export async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("routing failed");
    const data = await res.json();
    const route = data.routes && data.routes[0];
    if (!route) throw new Error("no route");
    return {
      points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return { points: [[from.lat, from.lng], [to.lat, to.lng]], distanceKm: null, durationMin: null, fallback: true };
  }
}

// Great-circle distance in km — used for the radius filter (fast, no network call).
export function haversineKm(a, b) {
  const R = 6371;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
