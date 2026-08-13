import React, { useState, useEffect, useCallback } from "react";
import { FALLBACK_USER_LOCATION } from "../lib/mapUtils";

/* =========================================================================
   USER LOCATION HOOK — Extracted to avoid circular dependencies between
   AppContext and StateSystem.
   ========================================================================= */
export function useUserLocation() {
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [manualLabel, setManualLabel] = useState(null);

  const requestLocation = useCallback(() => {
    setLocating(true);
    setPermissionDenied(false);
    setManualLabel(null);
    if (!navigator.geolocation) {
      setUserLocation(FALLBACK_USER_LOCATION);
      setLocating(false);
      setPermissionDenied(true);
      return;
    }
    const fallbackTimer = setTimeout(() => {
      setUserLocation(FALLBACK_USER_LOCATION);
      setLocating(false);
    }, 6000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallbackTimer);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        clearTimeout(fallbackTimer);
        setUserLocation(FALLBACK_USER_LOCATION);
        setLocating(false);
        setPermissionDenied(err?.code === 1);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = useCallback((loc, label) => {
    setUserLocation(loc);
    setManualLabel(label);
    setLocating(false);
    setPermissionDenied(false);
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { userLocation, locating, permissionDenied, manualLabel, requestLocation, setManualLocation };
}
