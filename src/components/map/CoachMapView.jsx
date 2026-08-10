import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { LocateFixed } from "lucide-react";
import { C } from "../../theme/theme";
import {
  loadLeaflet, injectMapStyles, coachPinIcon, userLocationIcon, fetchRoute, haversineKm,
  AUSTRALIA_CENTER, AUSTRALIA_ZOOM, FALLBACK_USER_LOCATION, LOCATE_ZOOM,
  MAP_STYLES, DEFAULT_MAP_STYLE_ID,
} from "../../lib/mapUtils";
import { MapSearchBar } from "./MapSearchBar";
import { RadiusFilter } from "./RadiusFilter";
import { LocationStatus } from "./LocationStatus";
import { SelectedCoachCard } from "./SelectedCoachCard";
import { MapStyleSwitcher } from "./MapStyleSwitcher";

/**
 * CoachMapView — real Leaflet + OpenStreetMap coach map.
 *
 * Split into this orchestrator (owns the Leaflet instance + all map state)
 * plus small, independently-memoised presentational components
 * (MapSearchBar, RadiusFilter, LocationStatus, MapStyleSwitcher, SelectedCoachCard).
 * None of those re-render the Leaflet map itself, and the map's own effects
 * only touch the specific Leaflet layers they own — so typing in the search
 * box, dragging the radius slider, or a route fetch resolving never forces
 * Leaflet to redraw tiles or every marker, only what actually changed.
 */
export function CoachMapView({ coaches = [], onOpen, onClose }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const tileLayerRef = useRef(null);
  const overlayLayerRef = useRef(null);
  const userLocationRef = useRef(null);
  const selectHandlerRef = useRef(() => {});
  const routeReqRef = useRef(0);
  const watchIdRef = useRef(null);
  const hasAutoCenteredRef = useRef(false);
  const skipNextStyleSwapRef = useRef(true); // the init effect already lays down the initial style's tiles

  const [ready, setReady] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [locationFixed, setLocationFixed] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routing, setRouting] = useState(false);
  const [radiusKm, setRadiusKm] = useState(null);
  const [mapStyleId, setMapStyleId] = useState(DEFAULT_MAP_STYLE_ID);

  // Only coaches with real coordinates can be plotted on the live map.
  const geoCoaches = useMemo(() => coaches.filter(c => typeof c.lat === "number" && typeof c.lng === "number"), [coaches]);

  const searchFiltered = useMemo(() => {
    if (!searchText.trim()) return geoCoaches;
    const q = searchText.trim().toLowerCase();
    return geoCoaches.filter(c => c.suburb.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q));
  }, [geoCoaches, searchText]);

  // Radius filter is applied on top of the search filter, measured from the
  // user's live location (falls back to the default point until located).
  const visibleCoaches = useMemo(() => {
    if (radiusKm == null) return searchFiltered;
    const origin = userLocation || FALLBACK_USER_LOCATION;
    return searchFiltered.filter(c => haversineKm(origin, { lat: c.lat, lng: c.lng }) <= radiusKm);
  }, [searchFiltered, radiusKm, userLocation]);
  const visibleIds = visibleCoaches.map(c => c.id).join(",");

  const suggestions = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.trim().toLowerCase();
    return [...new Set([...coaches.map(c => c.suburb), ...coaches.map(c => c.name), ...coaches.map(c => c.sport)])]
      .filter(s => s.toLowerCase().includes(q)).slice(0, 5);
  }, [coaches, searchText]);

  const clearRoute = useCallback(() => {
    if (routeLayerRef.current && mapRef.current) { mapRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }
    setRouteInfo(null);
  }, []);

  const deselectCoach = useCallback(() => { setSelectedCoach(null); clearRoute(); }, [clearRoute]);

  // Kept in a ref (refreshed every render) so marker click handlers — bound
  // once at marker creation — always see the current coach/route logic
  // instead of a stale closure from whenever the marker was first added.
  selectHandlerRef.current = async (coach) => {
    const map = mapRef.current, L = leafletRef.current;
    if (!map || !L) return;
    setSelectedCoach(coach);
    setRouteInfo(null);
    const origin = userLocationRef.current || FALLBACK_USER_LOCATION;
    const dest = { lat: coach.lat, lng: coach.lng };
    map.flyToBounds(L.latLngBounds([[origin.lat, origin.lng], [dest.lat, dest.lng]]), {
      paddingTopLeft: [30, 170], paddingBottomRight: [30, 210], maxZoom: 14, duration: 0.9, easeLinearity: 0.2,
    });
    const reqId = ++routeReqRef.current;
    setRouting(true);
    const route = await fetchRoute(origin, dest);
    if (reqId !== routeReqRef.current) return; // a newer selection superseded this fetch
    setRouting(false);
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
    routeLayerRef.current = L.polyline(route.points, {
      color: C.info, weight: 5, opacity: 0.92, lineCap: "round", lineJoin: "round", className: "cl-route-glow",
    }).addTo(map);
    setRouteInfo(route.fallback ? null : { distanceKm: route.distanceKm, durationMin: route.durationMin });
  };

  // --- Init map once, tear down on unmount. No artificial loading delay —
  // the map appears the moment Leaflet is ready; Locate Me and coach taps
  // handle their own smooth flyTo/flyToBounds animations instead. ---
  useEffect(() => {
    let cancelled = false;
    injectMapStyles();
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true })
        .setView(AUSTRALIA_CENTER, AUSTRALIA_ZOOM);
      const style = MAP_STYLES.find(s => s.id === mapStyleId) || MAP_STYLES[0];
      tileLayerRef.current = L.tileLayer(style.url, { maxZoom: style.maxZoom, attribution: style.attribution }).addTo(map);
      if (style.overlayUrl) {
        overlayLayerRef.current = L.tileLayer(style.overlayUrl, { maxZoom: style.maxZoom }).addTo(map);
      }
      L.control.zoom({ position: "topright" }).addTo(map);
      map.attributionControl.setPosition("bottomleft");
      mapRef.current = map;
      setReady(true);
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markersRef.current = {};
      userMarkerRef.current = null;
      routeLayerRef.current = null;
      radiusCircleRef.current = null;
      tileLayerRef.current = null;
      overlayLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Swap the base tile layer (and hybrid's label overlay) when the user
  // picks a different map style, without tearing down the whole map. ---
  useEffect(() => {
    if (!ready) return;
    if (skipNextStyleSwapRef.current) { skipNextStyleSwapRef.current = false; return; }
    const L = leafletRef.current, map = mapRef.current;
    const style = MAP_STYLES.find(s => s.id === mapStyleId) || MAP_STYLES[0];
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (overlayLayerRef.current) { map.removeLayer(overlayLayerRef.current); overlayLayerRef.current = null; }
    tileLayerRef.current = L.tileLayer(style.url, { maxZoom: style.maxZoom, attribution: style.attribution }).addTo(map);
    tileLayerRef.current.setZIndex(0);
    if (style.overlayUrl) {
      overlayLayerRef.current = L.tileLayer(style.overlayUrl, { maxZoom: style.maxZoom }).addTo(map);
      overlayLayerRef.current.setZIndex(1);
    }
  }, [ready, mapStyleId]);

  // --- Location tracking: auto-enabled on mount, stays "fixed" (live) via
  // watchPosition rather than a single one-off read, so the blue dot and any
  // active radius filter keep following the user without any manual toggle. ---
  useEffect(() => {
    if (!navigator.geolocation) { setUserLocation(FALLBACK_USER_LOCATION); setLocating(false); return; }
    let gotFirstFix = false;
    const fallbackTimer = setTimeout(() => {
      if (!gotFirstFix) { setUserLocation(FALLBACK_USER_LOCATION); setLocating(false); }
    }, 6000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        gotFirstFix = true;
        clearTimeout(fallbackTimer);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setLocationFixed(true);
      },
      () => {
        if (!gotFirstFix) { clearTimeout(fallbackTimer); setUserLocation(FALLBACK_USER_LOCATION); setLocating(false); }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );

    return () => {
      clearTimeout(fallbackTimer);
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);
  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

  // --- Default view: as soon as we have a real fix (or the fallback kicks
  // in) auto-zoom straight to it instead of sitting on the whole-Australia
  // view. Only happens once — later location updates just move the dot. ---
  useEffect(() => {
    if (!ready || !userLocation || hasAutoCenteredRef.current) return;
    hasAutoCenteredRef.current = true;
    mapRef.current.setView([userLocation.lat, userLocation.lng], LOCATE_ZOOM, { animate: true });
  }, [ready, userLocation]);

  // --- "You are here" blue dot ---
  useEffect(() => {
    if (!ready || !userLocation) return;
    const L = leafletRef.current, map = mapRef.current;
    if (userMarkerRef.current) userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    else userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userLocationIcon(L), zIndexOffset: 500, interactive: false, keyboard: false }).addTo(map);
  }, [ready, userLocation]);

  // --- Radius circle overlay, redrawn whenever the radius or user location changes ---
  useEffect(() => {
    if (!ready) return;
    const L = leafletRef.current, map = mapRef.current;
    if (radiusCircleRef.current) { map.removeLayer(radiusCircleRef.current); radiusCircleRef.current = null; }
    if (radiusKm == null) return;
    const origin = userLocationRef.current || FALLBACK_USER_LOCATION;
    radiusCircleRef.current = L.circle([origin.lat, origin.lng], {
      radius: radiusKm * 1000, color: C.info, weight: 1.5, opacity: 0.4, fillColor: C.info, fillOpacity: 0.07,
    }).addTo(map);
    map.flyToBounds(radiusCircleRef.current.getBounds(), { padding: [40, 40], duration: 0.6 });
  }, [ready, radiusKm]);

  // --- Coach pins: add/remove/re-style as the visible set or selection changes ---
  useEffect(() => {
    if (!ready) return;
    const L = leafletRef.current, map = mapRef.current;
    const nextIds = new Set(visibleCoaches.map(c => c.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!nextIds.has(id)) { map.removeLayer(markersRef.current[id]); delete markersRef.current[id]; }
    });
    visibleCoaches.forEach(c => {
      const isSelected = selectedCoach?.id === c.id;
      const icon = coachPinIcon(L, c.name, isSelected);
      if (markersRef.current[c.id]) {
        markersRef.current[c.id].setIcon(icon);
      } else {
        const marker = L.marker([c.lat, c.lng], { icon, zIndexOffset: 300 });
        marker.on("click", () => selectHandlerRef.current(c));
        marker.addTo(map);
        markersRef.current[c.id] = marker;
      }
    });
  }, [ready, visibleIds, selectedCoach?.id]);

  // --- Zoom/pan to search matches ---
  useEffect(() => {
    if (!ready || !mapRef.current || !searchText.trim()) return;
    const L = leafletRef.current, map = mapRef.current;
    if (!searchFiltered.length) return;
    const bounds = L.latLngBounds(searchFiltered.map(c => [c.lat, c.lng]));
    map.flyToBounds(bounds, { padding: [70, 120], maxZoom: 12, duration: 0.6 });
  }, [ready, searchText]);

  const selectSuggestion = useCallback(s => { setSearchText(s); setShowSuggestions(false); }, []);
  const clearSearch = useCallback(() => setSearchText(""), []);
  const recenter = useCallback(() => {
    if (!mapRef.current) return;
    const loc = userLocationRef.current || FALLBACK_USER_LOCATION;
    mapRef.current.flyTo([loc.lat, loc.lng], LOCATE_ZOOM, { duration: 0.9, easeLinearity: 0.2 });
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 999, background: C.fog }}>
      {/* MAP — real Leaflet + OpenStreetMap tiles, panning/zooming handled by Leaflet itself */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      <MapSearchBar
        value={searchText}
        onChange={val => { setSearchText(val); setShowSuggestions(true); }}
        onClear={clearSearch}
        onClose={onClose}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        onSelectSuggestion={selectSuggestion}
      />

      {ready && <RadiusFilter radiusKm={radiusKm} onChange={setRadiusKm} resultCount={visibleCoaches.length} />}
      {ready && <LocationStatus locating={locating} fixed={locationFixed} />}

      {/* MAP STYLE — sits directly above the Locate Me button, bottom-right */}
      {ready && <MapStyleSwitcher styleId={mapStyleId} onChange={setMapStyleId} bottom={selectedCoach ? 210 : 76} />}

      {/* RECENTER — bottom-right, flies back to the user's live location */}
      <button onClick={recenter} style={{ position: "absolute", bottom: selectedCoach ? 158 : 24, right: 16, zIndex: 401, width: 44, height: 44, borderRadius: 12, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "bottom .2s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <LocateFixed size={19} color={C.jet} />
      </button>

      <SelectedCoachCard coach={selectedCoach} routing={routing} routeInfo={routeInfo} onOpen={onOpen} onClose={deselectCoach} />
    </div>
  );
}
