import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronRight, Navigation, Star, MapPin, Heart, X, LocateFixed, Calendar, MessageCircle, Sparkles, Check, LayoutList, Map as MapIcon } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";

import { COACHES, SPORTS, ALL_SUBURBS, SUBURB_COORDS } from "../../data/mockData";
import { Card, Chip, Badge, SegTabs, SectionLabel, Avatar, Btn, TopBar, BottomSheet, EmptyState, Spinner, ScrollFadeRow, HandleTag } from "../../components/ui/Primitives";
import { getPublicName } from "../../utils/name";


import { NotificationBellButton, StatusBanner, useUserLocation } from "../../systems/StateSystem";
import { LocationField } from "../../components/ui/LocationField";
import { CoachMapView } from "../../components/map/CoachMapView";
import { haversineKm, FALLBACK_USER_LOCATION, injectMapStyles, CUSTOM_RADIUS_MIN_KM, CUSTOM_RADIUS_MAX_KM } from "../../lib/mapUtils";

// Only the current in-app coach (Josh Whitfield, c2) has a live "available now"
// toggle driven by app state — every other coach in the directory is static
// mock data, so this is the one card that can actually flip to "unavailable".
const LIVE_AVAILABILITY_COACH_ID = "c2";

// Dashboard silently defaults to the "Nearby" 0–5 km band; the actual radius
// control (with presets + custom slider, same as the map) lives in Filters.
const DEFAULT_FILTERS = { sports: [], areas: [], maxPrice: 150, minRating: 0, radiusKm: 5 };
const NEARBY_RADIUS_PRESETS = [5, 10, 15, 25];
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended", detail: "Best overall matches for you" },
  { value: "distance", label: "Distance", detail: "Closest coaches first" },
  { value: "rating", label: "Highest rated", detail: "Top client ratings first" },
  { value: "price", label: "Price: low to high", detail: "Lowest session price first" },
];

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export function CoachListCard({ coach, onOpen, unavailable, style }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const pub = getPublicName(coach, "public");
  return (
    <Card
      onClick={onOpen}
      style={{ marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)", opacity: unavailable ? 0.8 : 1, ...style }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar name={pub.name} size={54} />
          {unavailable && (
            <span style={{ position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: 99, background: C.slateLight, border: `2px solid ${C.white}` }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Identity + price: price sits top-right, same visual weight as the name, so it's
              one of the first two things scanned — not something buried at the bottom of the card. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: T.title, color: C.jet, letterSpacing: "-0.1px", ...oneLine, ...fDisplay }}>{pub.name}</div>
              {pub.handle && <HandleTag handle={pub.handle} size={11.5} color={C.slateLight} />}
              {/* Sport category — bumped up in size/weight and given the brand colour so a
                  client's eye lands on "what this coach does" as fast as on their name. */}
              <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.brand, marginTop: 2, ...oneLine, ...fDisplay }}>{coach.sport}</div>
            </div>
            <div style={{ fontSize: T.titleLg, fontWeight: 800, color: C.jet, whiteSpace: "nowrap", flexShrink: 0, ...fDisplay }}>
              ${coach.packages[0].price}<span style={{ fontSize: T.caption, fontWeight: 500, color: C.slateLight }}>/session</span>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: T.labelLg, color: C.jet, fontWeight: 600, ...fBody }}>
              <Star size={12} fill={C.brand} color={C.brand} /> {coach.rating}
              <span style={{ color: C.slateLight, fontWeight: 400 }}>({coach.reviews})</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 4, fontSize: T.labelLg, color: C.slate, marginTop: 4, ...fBody }}>
              <MapPin size={12} style={{ flexShrink: 0, marginTop: 1 }} /> <span style={{ minWidth: 0 }}>{coach.suburb} · {coach.liveDistanceKm ?? coach.distanceKm} km</span>
            </div>
          </div>

          {(coach.instantBook || unavailable) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {unavailable ? (
                <span style={{ fontSize: T.caption, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.fog, color: C.slate, ...fBody }}>Currently unavailable</span>
              ) : (
                <>
                  {coach.verified.identity && (
                    <span style={{ fontSize: T.caption, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.successTint, color: C.success, ...fBody }}>Verified</span>
                  )}
                  {coach.instantBook && (
                    <span style={{ fontSize: T.caption, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.brandTint, color: C.brand, ...fBody }}>Instant book</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   Post-sign-up guided tour — a 5-step centered modal shown the moment a
   client lands on Discover right after finishing onboarding. Steps 1–4 are
   pure orientation (Continue advances); step 5 hands off straight into the
   Personalised Coach Recommendation modal via its own "Find My Coaches" CTA,
   with "Skip for Now" as the escape hatch at every step.
   ------------------------------------------------------------------------- */
const GUIDE_STEPS = [
  {
    icon: Search,
    header: "Find Coaches That Match You",
    description: "Search for coaches based on your sport, location, price range, availability, and ratings to find options that fit your needs.",
    cta: "Continue",
  },
  {
    icon: Star,
    header: "Find the Right Fit",
    description: "Explore coach profiles, watch their reels, view their rates, and read reviews to help you choose a coach with confidence.",
    cta: "Continue",
  },
  {
    icon: Calendar,
    header: "Book When You're Ready",
    description: "Choose a session that works for you and book with confidence. Depending on the coach, you can either book instantly or send a booking request for approval.",
    cta: "Continue",
  },
  {
    icon: MessageCircle,
    header: "Chat With Your Coach",
    description: "Have a question before or after your session? Message your coach directly through CoachLink to discuss your booking and coaching needs.",
    cta: "Continue",
  },
  {
    icon: Sparkles,
    header: "Let's Find Your Perfect Coach",
    description: "Answer a few quick questions about what you're looking for, and we'll curate coach recommendations based on your interests, goals, and location.",
    cta: "Find My Coaches",
    secondaryCta: "Skip for Now",
  },
];

export function PostSignupGuideModal({ open, onClose, onFindCoaches }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [step, setStep] = useState(0);

  // Always start from step 1 whenever the guide (re)opens.
  useEffect(() => { if (open) setStep(0); }, [open]);

  if (!open) return null;

  const total = GUIDE_STEPS.length;
  const isLast = step === total - 1;
  const current = GUIDE_STEPS[step];
  const Icon = current.icon;

  const handlePrimary = () => {
    if (isLast) onFindCoaches();
    else setStep(s => s + 1);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <button type="button" aria-label="Skip CoachLink introduction" onClick={onClose} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: 0, background: "rgba(22,24,29,.55)", animation: "clBackdropIn .18s ease" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to CoachLink"
        style={{
          position: "relative", width: 340, height: 600, maxWidth: "100%", maxHeight: "100%", background: C.white, borderRadius: 30,
          padding: "34px 28px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,.28)", animation: "clPopIn .22s cubic-bezier(.32,.72,0,1)",
        }}
      >
        <button type="button" onClick={onClose} aria-label="Skip for now" style={{
          position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: 999,
          background: C.fog, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={14} color={C.slate} />
        </button>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", flexShrink: 0 }}>
            <Icon size={36} color={C.brand} />
          </div>

          <div style={{ textAlign: "center", fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{current.header}</div>
          <div style={{ textAlign: "center", fontSize: T.subtitleLg, color: C.slate, marginTop: 14, lineHeight: 1.65, ...fBody }}>{current.description}</div>
        </div>

        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <Btn full onClick={handlePrimary}>{current.cta}</Btn>
          {current.secondaryCta && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: T.bodyLg, fontWeight: 600, color: C.slate, ...fBody }}>
              {current.secondaryCta}
            </button>
          )}
        </div>

        {/* Progress indicator — one dot per step, filled = current, plus "x of n" */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18, flexShrink: 0 }}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: 99, flexShrink: 0,
              background: i === step ? C.brand : C.border, transition: "background .15s ease",
            }} />
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: T.body, fontWeight: 600, color: C.slateLight, marginTop: 8, flexShrink: 0, ...fBody }}>
          {step + 1} of {total}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Personalised Coach Recommendation modal — shown when a first-time client
   taps "Find My Coaches" on the empty Discover screen. Collects location,
   search radius, sport interests and (optional) goals, then hands the
   preferences back so the caller can populate the Coach Listings section.
   ------------------------------------------------------------------------- */
export function PersonalisedRecommendationModal({ open, onClose, onSubmit }) {
  const { darkMode, clientPrefs } = useApp();
  const C = darkMode ? CD : CL;
  const [location, setLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const isPresetRadius = NEARBY_RADIUS_PRESETS.includes(radiusKm);
  const [showCustomRadius, setShowCustomRadius] = useState(false);
  const [customRadius, setCustomRadius] = useState("");
  const [sports, setSports] = useState([]);
  // Brief "processing" delay after submit so the platform visibly appears to
  // crunch the client's preferences before handing back curated matches,
  // rather than snapping straight to results.
  const [submitting, setSubmitting] = useState(false);

  // The location saved during account creation is reused here so the client
  // isn't asked for it twice; the same structured suburb picker as account
  // setup lets them detect their position or search for a different suburb.
  const savedLocation = clientPrefs?.location || null;

  // Reset the form every time the sheet is (re)opened so a previous session's
  // input doesn't linger if the client closes it and comes back later.
  useEffect(() => {
    if (open) {
      setLocation(savedLocation);
      setRadiusKm(10);
      setShowCustomRadius(false);
      setCustomRadius("");
      setSports([]);
      setSubmitting(false);
    }
  }, [open]);

  const toggleSport = (s) => setSports((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));

  const applyCustomRadius = () => {
    const val = Number(customRadius);
    if (val >= CUSTOM_RADIUS_MIN_KM && val <= CUSTOM_RADIUS_MAX_KM) { setRadiusKm(val); setShowCustomRadius(false); }
  };

  const canSubmit = !!location;

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulated processing delay — gives the "generating recommendations"
    // state a moment to register before the sheet closes into results.
    setTimeout(() => {
      onSubmit({
        locationText: location.suburb,
        radiusKm,
        sports,
      });
    }, 1400);
  };

  return (
    <BottomSheet open={open} onClose={submitting ? () => {} : onClose} title="Personalise Your Recommendations" heightPct={92}>
      <SectionLabel>Your Location</SectionLabel>
      <div style={{ marginBottom: 22 }}>
        <LocationField
          value={location}
          onChange={setLocation}
          label=""
          placeholder="Search suburb or postcode…"
          helper="We'll use this to find coaches near you."
        />
      </div>
      <div style={{ marginBottom: 22 }}>
        {showCustomRadius ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number" min={CUSTOM_RADIUS_MIN_KM} max={CUSTOM_RADIUS_MAX_KM} value={customRadius}
              onChange={(e) => setCustomRadius(e.target.value)}
              placeholder={`${CUSTOM_RADIUS_MIN_KM}–${CUSTOM_RADIUS_MAX_KM}`}
              style={{ flex: 1, boxSizing: "border-box", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, color: C.jet, outline: "none", ...fBody }}
            />
            <span style={{ fontSize: T.bodyLg, color: C.slate, ...fBody }}>km</span>
            <button onClick={applyCustomRadius} style={{ padding: "11px 16px", borderRadius: 12, border: "none", background: C.brand, color: C.white, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}>Set</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {NEARBY_RADIUS_PRESETS.map((km) => (
              <Chip key={km} active={radiusKm === km} onClick={() => setRadiusKm(km)}>{km} km</Chip>
            ))}
            <Chip active={!isPresetRadius} onClick={() => { setCustomRadius(String(radiusKm)); setShowCustomRadius(true); }}>
              {!isPresetRadius ? `Custom · ${radiusKm} km` : "Custom"}
            </Chip>
          </div>
        )}
      </div>

      <SectionLabel>Sports Interests</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {SPORTS.map((s) => <Chip key={s} active={sports.includes(s)} onClick={() => toggleSport(s)}>{s}</Chip>)}
      </div>

      <Btn full disabled={!canSubmit} loading={submitting} loadingText="Finding your matches…" onClick={handleSubmit}>Find My Coaches</Btn>
    </BottomSheet>
  );
}

export function ScreenClientHome({ nav, favorites = [], toggleFav, filters, onFiltersChange, clientNotifications: notifications = [], coachAvailableNow, isFirstTimeClient, discoveryPrefs, setDiscoveryPrefs, showPostSignupGuide, setShowPostSignupGuide }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [view, setView] = useState("list");
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [filterDraft, setFilterDraft] = useState(DEFAULT_FILTERS);
  const [locationQuery, setLocationQuery] = useState("");
  // Defaults to the tightest "Nearby" (0–5 km) band; the control for changing
  // it lives in Filters, same as sport/area/price/rating.
  const { userLocation, locating, permissionDenied, manualLabel, requestLocation, setManualLocation } = useUserLocation();

  // The pulse CSS the location pill reuses is normally injected by the map
  // view — bring it in here too so it still looks right if you land on
  // List/Favorites without ever opening the map.
  useEffect(() => { injectMapStyles(C); }, []);

  const appliedFilters = useMemo(() => ({
    ...DEFAULT_FILTERS,
    ...(filters || {}),
    sports: (filters && Array.isArray(filters.sports)) ? filters.sports : DEFAULT_FILTERS.sports,
    areas: (filters && Array.isArray(filters.areas)) ? filters.areas : DEFAULT_FILTERS.areas,
  }), [filters]);
  const setAppliedFilters = onFiltersChange || (() => {});
  const radiusKm = appliedFilters.radiusKm ?? 5;
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const unreadCount = safeNotifications.filter(n => n?.unread).length;

  // First-time clients haven't told us what they're looking for yet, so the
  // Coach Listings section stays empty and prompts for preferences instead
  // of showing every coach in the directory.
  const showRecommendationPrompt = !discoveryPrefs;

  const handlePrefsSubmit = (prefs) => {
    setDiscoveryPrefs?.(prefs);
    setAppliedFilters({
      ...appliedFilters,
      sports: prefs.sports,
      radiusKm: prefs.radiusKm,
      areas: prefs.locationText ? [prefs.locationText] : appliedFilters.areas,
    });
    setPrefsModalOpen(false);
  };

  const suggestions = searchText.trim().length > 0
    ? [...new Set([...ALL_SUBURBS, ...COACHES.flatMap(c => [c.name, c.handle ? `@${c.handle}` : null].filter(Boolean))])].filter(s => s.toLowerCase().includes(searchText.trim().toLowerCase())).slice(0, 5)
    : [];

  // Live distance from wherever the user actually is right now, falling back
  // to the same default point the map uses until a real fix comes in.
  const origin = userLocation || FALLBACK_USER_LOCATION;
  const nearestLocationLabel = useMemo(() => {
    if (manualLabel) return manualLabel;
    const nearest = Object.entries(SUBURB_COORDS).reduce((best, [label, coords]) => {
      const distance = haversineKm(origin, coords);
      return !best || distance < best.distance ? { label, distance } : best;
    }, null);
    return nearest?.label || "Current location";
  }, [manualLabel, permissionDenied, origin.lat, origin.lng]);
  const withDistance = useMemo(
    () => COACHES.map(c => ({ ...c, liveDistanceKm: Math.round(haversineKm(origin, { lat: c.lat, lng: c.lng }) * 10) / 10 })),
    [origin.lat, origin.lng]
  );

  // Text/area/sport/price/rating filtering — this is what's handed to the
  // map view too (which has its own independent radius control), so every
  // filter from the Filters screen actually narrows what's shown, not just
  // the ones that happened to be wired up before.
  const searchAndAreaFiltered = withDistance.filter(c => {
    const q = searchText.trim().toLowerCase();
    const matchesQuery = !q || c.suburb.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q) || (c.handle && c.handle.toLowerCase().includes(q.replace(/^@/, "")));
    const matchesAreas = !appliedFilters.areas.length || appliedFilters.areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase()));
    const matchesSport = !appliedFilters.sports?.length || appliedFilters.sports.includes(c.sport);
    const matchesPrice = c.packages && c.packages[0] ? c.packages[0].price <= (appliedFilters.maxPrice ?? DEFAULT_FILTERS.maxPrice) : true;
    const matchesRating = c.rating >= (appliedFilters.minRating ?? 0);
    return matchesQuery && matchesAreas && matchesSport && matchesPrice && matchesRating;
  });
  const filtered = useMemo(() => {
    const matches = searchAndAreaFiltered.filter(c => radiusKm == null || c.liveDistanceKm <= radiusKm);
    return [...matches].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating || a.liveDistanceKm - b.liveDistanceKm;
      if (sortBy === "price") return a.packages[0].price - b.packages[0].price || b.rating - a.rating;
      if (sortBy === "distance") return a.liveDistanceKm - b.liveDistanceKm;
      const score = coach => (coach.rating * 20) + (coach.instantBook ? 4 : 0) - coach.liveDistanceKm;
      return score(b) - score(a);
    });
  }, [searchAndAreaFiltered, radiusKm, sortBy]);
  const favCoaches = COACHES.filter(c => safeFavorites.includes(c.id));

  // Count filter categories rather than every selected value, keeping the
  // sticky control compact even when several sports or areas are selected.
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.areas.length) count += 1;
    if (appliedFilters.sports?.length) count += 1;
    const maxPrice = appliedFilters.maxPrice ?? DEFAULT_FILTERS.maxPrice;
    if (maxPrice !== DEFAULT_FILTERS.maxPrice) count += 1;
    const minRating = appliedFilters.minRating ?? 0;
    if (minRating > 0) count += 1;
    const appliedRadius = appliedFilters.radiusKm ?? 5;
    if (appliedRadius !== 5) count += 1;
    return count;
  }, [appliedFilters]);
  const hasActiveFilters = activeFilterCount > 0;

  const openFilters = () => {
    setFilterDraft({ ...appliedFilters, sports: [...appliedFilters.sports], areas: [...appliedFilters.areas] });
    setActiveSheet("filters");
  };
  const updateDraft = patch => setFilterDraft(current => ({ ...current, ...patch }));
  const draftPreviewCount = useMemo(() => COACHES.filter(c => {
    const distance = haversineKm(origin, { lat: c.lat, lng: c.lng });
    return (!filterDraft.sports?.length || filterDraft.sports.includes(c.sport))
      && (!filterDraft.areas?.length || filterDraft.areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase())))
      && c.packages[0].price <= (filterDraft.maxPrice ?? DEFAULT_FILTERS.maxPrice)
      && c.rating >= (filterDraft.minRating ?? 0)
      && (filterDraft.radiusKm == null || distance <= filterDraft.radiusKm);
  }).length, [filterDraft, origin.lat, origin.lng]);
  const locationSuggestions = locationQuery.trim()
    ? ALL_SUBURBS.filter(s => s.toLowerCase().includes(locationQuery.trim().toLowerCase())).slice(0, 5)
    : ALL_SUBURBS.slice(0, 4);
  const chooseLocation = suburb => {
    const coords = SUBURB_COORDS[suburb];
    if (coords) setManualLocation(coords, suburb);
    setLocationQuery("");
    setActiveSheet(null);
  };

  const selectSuggestion = s => { setSearchText(s); setShowSuggestions(false); };

  const prefsModal = (
    <PersonalisedRecommendationModal
      open={prefsModalOpen}
      onClose={() => setPrefsModalOpen(false)}
      onSubmit={handlePrefsSubmit}
    />
  );

  const guideModal = (
    <PostSignupGuideModal
      open={!!showPostSignupGuide}
      onClose={() => setShowPostSignupGuide?.(false)}
      onFindCoaches={() => { setShowPostSignupGuide?.(false); setPrefsModalOpen(true); }}
    />
  );

  const sortSheet = (
    <BottomSheet open={activeSheet === "sort"} onClose={() => setActiveSheet(null)} title="Sort coaches" heightPct={54}>
      <div style={{ fontSize: T.body, color: C.slate, marginBottom: 8, ...fBody }}>Choose how results are ordered.</div>
      {SORT_OPTIONS.map(option => {
        const selected = sortBy === option.value;
        return (
          <button key={option.value} type="button" onClick={() => { setSortBy(option.value); setActiveSheet(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "13px 2px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
            <span aria-hidden="true" style={{ width: 21, height: 21, borderRadius: 999, border: `2px solid ${selected ? C.brand : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {selected && <span style={{ width: 11, height: 11, borderRadius: 999, background: C.brand }} />}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fBody }}>{option.label}</span>
              <span style={{ display: "block", fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{option.detail}</span>
            </span>
          </button>
        );
      })}
    </BottomSheet>
  );

  const locationSheet = (
    <BottomSheet open={activeSheet === "location"} onClose={() => setActiveSheet(null)} title="Choose your location" heightPct={68}>
      <button type="button" onClick={() => { requestLocation(); setActiveSheet(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 14, border: `1px solid ${C.brand}`, background: C.brandTint, color: C.brand, cursor: "pointer", textAlign: "left" }}>
        <span style={{ width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: C.white, flexShrink: 0 }}>
          {locating ? <Spinner size={16} color={C.brand} /> : <LocateFixed size={18} />}
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: T.bodyLg, fontWeight: 700, ...fBody }}>{locating ? "Locating you…" : "Use current location"}</span>
          <span style={{ display: "block", fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>Update nearby coach distances</span>
        </span>
        <ChevronRight size={17} />
      </button>

      <div style={{ position: "relative", marginTop: 16 }}>
        <div className="cl-input" style={{ minHeight: 48, display: "flex", alignItems: "center", gap: 9, padding: "0 13px", borderRadius: 13, border: `1.5px solid ${C.border}`, background: C.white }}>
          <Search size={16} color={C.slateLight} />
          <input name="location-search" type="search" autoComplete="off" aria-label="Search suburb or area" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} placeholder="Search suburb or area" style={{ flex: 1, minWidth: 0, minHeight: 44, padding: 0, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }} />
        </div>
      </div>

      <div style={{ marginTop: 18, marginBottom: 4, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{locationQuery ? "Matching locations" : "Popular nearby"}</div>
      {locationSuggestions.map(suburb => (
        <button key={suburb} type="button" onClick={() => chooseLocation(suburb)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "11px 2px", border: "none", borderBottom: `1px solid ${C.border}`, background: "none", color: C.jet, cursor: "pointer", textAlign: "left" }}>
          <span style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: C.fog, flexShrink: 0 }}><MapPin size={16} color={C.brand} /></span>
          <span style={{ flex: 1, fontSize: T.bodyLg, fontWeight: 600, ...fBody }}>{suburb}</span>
          <ChevronRight size={16} color={C.slateLight} />
        </button>
      ))}
    </BottomSheet>
  );

  const filterSheet = (
    <BottomSheet
      open={activeSheet === "filters"}
      onClose={() => setActiveSheet(null)}
      title="Filters"
      heightPct={88}
      footer={(
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="outline" onClick={() => setFilterDraft(DEFAULT_FILTERS)}>Reset</Btn>
          <div style={{ flex: 1 }}><Btn full onClick={() => { setAppliedFilters(filterDraft); setActiveSheet(null); }}>Show {draftPreviewCount} result{draftPreviewCount === 1 ? "" : "s"}</Btn></div>
        </div>
      )}
    >
      <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.5, marginBottom: 20, ...fBody }}>Refine results without leaving Discover.</div>

      <SectionLabel>Sport</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        {SPORTS.map((sport, index) => {
          const selected = filterDraft.sports?.includes(sport);
          return (
            <button key={sport} type="button" aria-pressed={selected} onClick={() => updateDraft({ sports: selected ? filterDraft.sports.filter(x => x !== sport) : [...(filterDraft.sports || []), sport] })} style={{ minHeight: 48, display: "flex", alignItems: "center", gap: 9, padding: "0 12px", border: "none", borderRight: index % 2 === 0 ? `1px solid ${C.border}` : "none", borderBottom: index < SPORTS.length - 2 ? `1px solid ${C.border}` : "none", background: selected ? C.brandTint : C.white, color: selected ? C.brand : C.jet, cursor: "pointer", textAlign: "left", fontSize: T.body, fontWeight: selected ? 700 : 500, ...fBody }}>
              <span aria-hidden="true" style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${selected ? C.brand : C.border}`, background: selected ? C.brand : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{selected && <Check size={12} color={C.white} />}</span>
              {sport}
            </button>
          );
        })}
      </div>

      <SectionLabel>Distance</SectionLabel>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        {[...NEARBY_RADIUS_PRESETS.map(km => ({ value: km, label: `Within ${km} km` })), { value: null, label: "Any distance" }].map((option, index, options) => {
          const selected = filterDraft.radiusKm === option.value;
          return (
            <button key={option.label} type="button" role="radio" aria-checked={selected} onClick={() => updateDraft({ radiusKm: option.value })} style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", border: "none", borderBottom: index < options.length - 1 ? `1px solid ${C.border}` : "none", background: selected ? C.brandTint : C.white, color: C.jet, cursor: "pointer", textAlign: "left", fontSize: T.bodyLg, fontWeight: selected ? 700 : 500, ...fBody }}>
              {option.label}
              <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 999, border: `2px solid ${selected ? C.brand : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{selected && <span style={{ width: 10, height: 10, borderRadius: 999, background: C.brand }} />}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SectionLabel>Maximum price</SectionLabel>
        <span style={{ fontSize: T.body, fontWeight: 700, color: C.brand, ...fBody }}>${filterDraft.maxPrice ?? DEFAULT_FILTERS.maxPrice}/session</span>
      </div>
      <input type="range" name="filter-maximum-price" aria-label={`Maximum price per session, $${filterDraft.maxPrice ?? DEFAULT_FILTERS.maxPrice}`} min="20" max="150" step="5" value={filterDraft.maxPrice ?? DEFAULT_FILTERS.maxPrice} onChange={e => updateDraft({ maxPrice: Number(e.target.value) })} style={{ width: "100%", accentColor: C.brand, margin: "0 0 26px" }} />

      <SectionLabel>Minimum rating</SectionLabel>
      <div role="radiogroup" aria-label="Minimum rating" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", padding: 3, background: C.fog, borderRadius: 13, marginBottom: 8 }}>
        {[0, 3, 4, 4.5].map(rating => {
          const selected = (filterDraft.minRating ?? 0) === rating;
          return <button key={rating} type="button" role="radio" aria-checked={selected} onClick={() => updateDraft({ minRating: rating })} style={{ minHeight: 44, padding: "0 6px", border: "none", borderRadius: 10, background: selected ? C.white : "transparent", color: selected ? C.jet : C.slate, boxShadow: selected ? "0 1px 3px rgba(22,24,29,.08)" : "none", cursor: "pointer", fontSize: T.labelLg, fontWeight: selected ? 700 : 500, ...fBody }}>{rating ? `${rating}+` : "Any"}</button>;
        })}
      </div>
    </BottomSheet>
  );

  // First-time client, no preferences submitted yet — the Coach Listings
  // section stays empty and prompts for preferences instead of showing
  // every coach in the directory.
  if (showRecommendationPrompt) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ padding: "18px 18px 0", display: "flex", justifyContent: "flex-end" }}>
          <NotificationBellButton count={unreadCount} onClick={() => nav("notifications")} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 28px 40px" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <Sparkles size={30} color={C.brand} />
          </div>
          <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Let's Find Your Perfect Coach</div>
          <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 10, lineHeight: 1.6, maxWidth: 300, ...fBody }}>
            Answer a few quick questions about what you're looking for, and we'll curate coach recommendations based on your interests, goals, and location.
          </div>
          <div style={{ marginTop: 26, width: "100%" }}>
            <Btn full onClick={() => setPrefsModalOpen(true)}>Find My Coaches</Btn>
          </div>
        </div>
        {prefsModal}
        {guideModal}
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", paddingBottom: 116 }} className="cl-hide-scrollbar">
        <div style={{ padding: "18px 18px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => setActiveSheet("location")} aria-label={`Change location, currently ${nearestLocationLabel}`} style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, padding: 0, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ width: 42, height: 42, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: C.brandTint, color: C.brand, flexShrink: 0 }}>
                {locating ? <Spinner size={17} color={C.brand} /> : <MapPin size={19} />}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                  <span style={{ fontSize: T.title, fontWeight: 800, color: C.jet, ...oneLine, ...fDisplay }}>{locating ? "Finding your location…" : nearestLocationLabel}</span>
                  <ChevronDown size={16} color={C.slate} style={{ flexShrink: 0 }} />
                </span>
                <span style={{ display: "block", fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{permissionDenied && !manualLabel ? "Approximate area · tap to change" : "Tap to change location"}</span>
              </span>
            </button>
            <NotificationBellButton count={unreadCount} onClick={() => nav("notifications")} />
          </div>

          <div style={{ marginTop: 20, fontSize: T.displayLg, lineHeight: 1.12, fontWeight: 700, letterSpacing: "-0.5px", color: C.jet, textWrap: "balance", ...fDisplay }}>Discover your next coach</div>
          <div style={{ marginTop: 6, fontSize: T.body, color: C.slate, ...fBody }}>Trusted local experts for your goals.</div>

          <div style={{ position: "relative", marginTop: 16 }}>
            <div className="cl-input" style={{ minHeight: 50, display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 14, padding: "0 5px 0 14px", boxShadow: "0 4px 16px rgba(22,24,29,.04)" }}>
              <Search size={16} color={C.slateLight} aria-hidden="true" />
              <input name="coach-search" type="search" autoComplete="off" aria-label="Search by sport, coach name, or suburb" value={searchText} onChange={e => { setSearchText(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder="Search sport, coach or suburb…" style={{ flex: 1, minWidth: 0, minHeight: 46, padding: 0, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }} />
              {searchText && <button type="button" aria-label="Clear coach search" onClick={() => setSearchText("")} style={{ width: 44, height: 44, padding: 0, background: "none", border: "none", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} color={C.slateLight} aria-hidden="true" /></button>}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 40, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {suggestions.map(s => (
                  <button key={s} type="button" onMouseDown={() => selectSuggestion(s)} style={{ width: "100%", minHeight: 44, textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: T.body, color: C.jet, ...fBody }}>
                    <MapPin size={13} color={C.slateLight} aria-hidden="true" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "sticky", top: 0, zIndex: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 18px", background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, boxShadow: "0 6px 16px rgba(22,24,29,.05)" }}>
          <button type="button" onClick={() => setActiveSheet("sort")} style={{ minWidth: 0, minHeight: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.jet, cursor: "pointer", textAlign: "left" }}>
            <ArrowUpDown size={15} color={C.slate} aria-hidden="true" />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: T.caption, color: C.slate, ...fBody }}>Sort</span>
              <span style={{ display: "block", fontSize: T.labelLg, fontWeight: 700, ...oneLine, ...fBody }}>{SORT_OPTIONS.find(option => option.value === sortBy)?.label || "Recommended"}</span>
            </span>
            <ChevronDown size={13} color={C.slateLight} aria-hidden="true" />
          </button>
          <button type="button" aria-pressed={hasActiveFilters} onClick={openFilters} style={{ minWidth: 0, minHeight: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 12px", borderRadius: 12, border: `1px solid ${hasActiveFilters ? C.brand : C.border}`, background: hasActiveFilters ? C.brandTint : C.white, color: hasActiveFilters ? C.brand : C.jet, cursor: "pointer", textAlign: "left" }}>
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span style={{ flex: 1, fontSize: T.body, fontWeight: 700, ...fBody }}>Filters</span>
            {hasActiveFilters && <span aria-label={`${activeFilterCount} active filter categories`} style={{ minWidth: 22, height: 22, padding: "0 6px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: C.brand, color: C.white, fontSize: T.caption, fontWeight: 800, ...fBody }}>{activeFilterCount}</span>}
          </button>
        </div>

        <div style={{ padding: "16px 18px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>
                {view === "favorites" ? <><Heart size={15} color={C.brand} /> Your favorites</> : <><Navigation size={15} color={C.brand} /> Coaches near you</>}
              </div>
              {view !== "favorites" && <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...oneLine, ...fBody }}>{filtered.length} match{filtered.length === 1 ? "" : "es"} near {nearestLocationLabel}</div>}
            </div>
            <SegTabs strong value={view} onChange={setView} items={[
              { value: "list", icon: LayoutList, ariaLabel: "List view" },
              { value: "map", icon: MapIcon, ariaLabel: "Map view" },
              { value: "favorites", icon: Heart, ariaLabel: "Favorites", fillActive: true },
            ]} />
          </div>

          {view === "favorites" ? (
            favCoaches.length === 0
              ? <EmptyState icon={Heart} title="No favorites yet" body="Tap the heart on a coach's card or profile to save them here." />
              : <div className="cl-stagger">{favCoaches.map((c, i) => <CoachListCard key={c.id} coach={c} style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }} onOpen={() => nav("coach-profile", { id: c.id })} />)}</div>
          ) : filtered.length === 0 ? (
            <StatusBanner state="noResults" style={{ marginTop: 10 }} onPrimary={() => { setSearchText(""); setAppliedFilters(DEFAULT_FILTERS); }} onSecondary={() => setAppliedFilters({ ...appliedFilters, radiusKm: CUSTOM_RADIUS_MAX_KM })} secondaryLabel="Browse all coaches" />
          ) : (
            <div className="cl-stagger">{filtered.map((c, i) => <CoachListCard key={c.id} coach={c} unavailable={c.id === LIVE_AVAILABILITY_COACH_ID && !coachAvailableNow} style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }} onOpen={() => nav("coach-profile", { id: c.id })} />)}</div>
          )}
        </div>
      </div>

      {sortSheet}
      {locationSheet}
      {filterSheet}

      {view === "map" && <CoachMapView coaches={searchAndAreaFiltered} onOpen={id => nav("coach-profile", { id })} onClose={() => setView("list")} />}
    </div>
  );
}

export function ScreenSearchFilters({ nav, params, userLocation, locating, permissionDenied, manualLabel, requestLocation, setManualLocation }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  // Nav params arrive nested under `params` (same as every other screen,
  // e.g. CoachProfile's `params.id`) — not as top-level props.
  const { initialFilters, onApply } = params || {};
  const base = initialFilters || DEFAULT_FILTERS;
  const [sports, setSports] = useState(base.sports || []);
  const [areas, setAreas] = useState(base.areas || []);
  const [price, setPrice] = useState(base.maxPrice || 100);
  const [minRating, setMinRating] = useState(base.minRating || 0);
  const [radiusKm, setRadiusKm] = useState(base.radiusKm ?? 5);
  const isPresetRadius = radiusKm != null && NEARBY_RADIUS_PRESETS.includes(radiusKm);
  const [showCustomRadius, setShowCustomRadius] = useState(radiusKm != null && !isPresetRadius);
  const [customRadius, setCustomRadius] = useState(radiusKm != null && !isPresetRadius ? radiusKm : 20);

  // "Use my current location" is the same live GPS read the dashboard and
  // map already rely on for distance — surfaced here explicitly so it's an
  // obvious, tappable part of the Distance filter instead of implicit.
  const origin = userLocation || FALLBACK_USER_LOCATION;

  // Manual location entry — shown when GPS access is off, so there's always
  // a way to get relevant "near me" results even without location permission.
  const [locationInput, setLocationInput] = useState("");
  const locationSuggestions = locationInput.trim().length > 0
    ? ALL_SUBURBS.filter(s => s.toLowerCase().includes(locationInput.trim().toLowerCase())).slice(0, 5)
    : [];
  const chooseManualLocation = suburb => {
    const coords = SUBURB_COORDS[suburb];
    if (coords) setManualLocation?.(coords, suburb);
    setLocationInput("");
  };

  // Live preview of how many coaches match everything currently selected —
  // this is what actually applies when "Show results" is tapped, so the
  // count (and the button itself) reflect the real outcome, not a guess.
  const previewCount = useMemo(() => COACHES.filter(c => {
    const matchesSport = !sports.length || sports.includes(c.sport);
    const matchesAreas = !areas.length || areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase()));
    const matchesPrice = c.packages[0].price <= price;
    const matchesRating = c.rating >= minRating;
    const matchesRadius = radiusKm == null || haversineKm(origin, { lat: c.lat, lng: c.lng }) <= radiusKm;
    return matchesSport && matchesAreas && matchesPrice && matchesRating && matchesRadius;
  }).length, [sports, areas, price, minRating, radiusKm, origin.lat, origin.lng]);

  const reset = () => { setSports([]); setAreas([]); setPrice(100); setMinRating(0); setRadiusKm(5); setShowCustomRadius(false); };
  const applyAndShow = () => { onApply?.({ sports, areas, maxPrice: price, minRating, radiusKm }); nav("client-home"); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <TopBar title="Filters" onBack={() => nav("client-home")} />
      {/* Single vertical scroll region for every filter section; Reset and
          Show results stay fixed below it, outside the scroll area. */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 18px 24px" }} className="cl-hide-scrollbar">
        <SectionLabel>Sport</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {SPORTS.map(s => <Chip key={s} active={sports.includes(s)} onClick={() => setSports(arr => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s])}>{s}</Chip>)}
        </div>


<SectionLabel>Location</SectionLabel>
        <div style={{ marginBottom: 20 }}>
          {/* Explicit control for the GPS read the Distance filter already runs on,
              instead of that behaviour being implicit/hidden. */}
          <button onClick={requestLocation} style={{
            display: "flex", width: "100%", boxSizing: "border-box", alignItems: "center", gap: 8,
            padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.brand}`,
            background: C.brandTint, color: C.brand, fontWeight: 600, fontSize: T.bodyLg,
            cursor: "pointer", marginBottom: 10, ...fBody,
          }}>
            {locating ? <Spinner size={13} color={C.brand} /> : <MapPin size={14} />}
            {locating ? "Locating you…" : permissionDenied ? "Enable location access" : "Use my current location"}
          </button>

          {manualLabel && !locating && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.captionLg, color: C.slate, marginBottom: 10, ...fBody }}>
              <LocateFixed size={11} /> Using {manualLabel} as your location
            </div>
          )}

          {/* Location access is off (or unavailable) — offer manual entry so
              distance-based results still work without GPS permission. */}
          {permissionDenied && !locating && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 8, ...fBody }}>
                Location access is off. Enable it above, or enter your location manually:
              </div>
              <div style={{ position: "relative" }}>
                <input value={locationInput} onChange={e => setLocationInput(e.target.value)} placeholder="Enter your suburb or area"
                  style={{ width: "100%", boxSizing: "border-box", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, color: C.jet, outline: "none", ...fBody }} />
                {locationSuggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                    {locationSuggestions.map(s => (
                      <button key={s} onClick={() => chooseManualLocation(s)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: T.body, color: C.jet, ...fBody }}>
                        <MapPin size={13} color={C.slateLight} /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <SectionLabel>Distance</SectionLabel>
        <div style={{ marginBottom: 20 }}>
          {showCustomRadius ? (
            <div style={{ background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: T.label, fontWeight: 700, color: C.jet, ...fBody }}>Custom radius</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number" min={CUSTOM_RADIUS_MIN_KM} max={CUSTOM_RADIUS_MAX_KM} value={customRadius}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setCustomRadius(Number.isNaN(v) ? CUSTOM_RADIUS_MIN_KM : Math.min(CUSTOM_RADIUS_MAX_KM, Math.max(CUSTOM_RADIUS_MIN_KM, v)));
                  }}
                  style={{ flex: 1, boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, color: C.jet, outline: "none", background: C.white, ...fBody }}
                />
                <span style={{ fontSize: T.labelLg, fontWeight: 700, color: C.slate, ...fBody }}>km</span>
              </div>
              <button onClick={() => { setRadiusKm(customRadius); setShowCustomRadius(false); }} style={{ marginTop: 10, width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: C.brand, color: C.white, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}>Apply</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Chip active={radiusKm === 5} onClick={() => setRadiusKm(5)}>5 km</Chip>
              <Chip active={radiusKm === 10} onClick={() => setRadiusKm(10)}>10 km</Chip>
              <Chip active={radiusKm === 15} onClick={() => setRadiusKm(15)}>15 km</Chip>
              <Chip active={radiusKm === 25} onClick={() => setRadiusKm(25)}>25 km</Chip>
              <Chip active={radiusKm != null && !isPresetRadius} onClick={() => setShowCustomRadius(true)}>
                {radiusKm != null && !isPresetRadius ? `Custom · ${radiusKm} km` : "Custom"}
              </Chip>
            </div>
          )}
        </div>

        <SectionLabel>Max price per session — ${price}</SectionLabel>
        <input type="range" name="maximum-session-price" aria-label={`Maximum price per session, $${price}`} min="20" max="150" step="5" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", accentColor: C.brand, marginBottom: 20 }} />

        <SectionLabel>Minimum rating</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {[0, 3, 4, 4.5].map(r => <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>{r === 0 ? "Any" : `${r}+`}</Chip>)}
        </div>
      </div>

      {/* Fixed footer, outside the scroll area — result feedback lives here
          rather than as its own filter-like control up in Distance. */}
      <div style={{ padding: "14px 18px", paddingBottom: "max(28px, env(safe-area-inset-bottom))", borderTop: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
        <div style={{ textAlign: "center", fontSize: T.captionLg, color: C.slate, marginBottom: 10, ...fBody }}>
          {previewCount} coach{previewCount === 1 ? "" : "es"} match{previewCount === 1 ? "es" : ""} these filters
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="outline" onClick={reset}>Reset</Btn>
          <div style={{ flex: 1 }}><Btn full onClick={applyAndShow}>Show {previewCount} results</Btn></div>
        </div>
      </div>
    </div>
  );
}
