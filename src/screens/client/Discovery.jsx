import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, Filter, Navigation, Star, MapPin, Heart, X, LocateFixed } from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";

import { COACHES, SPORTS, ALL_SUBURBS, SUBURB_COORDS } from "../../data/mockData";
import { Card, Chip, Badge, SegTabs, SectionLabel, Avatar, Btn, TopBar, BottomSheet, EmptyState, Spinner, ScrollFadeRow } from "../../components/ui/Primitives";


import { useLiveNotifications, NotificationBellButton, StatusBanner } from "../../systems/StateSystem";
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

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export function CoachListCard({ coach, onOpen, unavailable }) {
  return (
    <Card
      onClick={onOpen}
      style={{ marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)", opacity: unavailable ? 0.8 : 1 }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar name={coach.name} size={54} />
          {unavailable && (
            <span style={{ position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: 99, background: C.slateLight, border: `2px solid ${C.white}` }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Identity + price: price sits top-right, same visual weight as the name, so it's
              one of the first two things scanned — not something buried at the bottom of the card. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: T.title, color: C.jet, letterSpacing: "-0.1px", ...oneLine, ...fDisplay }}>{coach.name}</div>
              {/* Sport category — bumped up in size/weight and given the brand colour so a
                  client's eye lands on "what this coach does" as fast as on their name. */}
              <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.orange, marginTop: 2, ...oneLine, ...fDisplay }}>{coach.sport}</div>
            </div>
            <div style={{ fontSize: T.titleLg, fontWeight: 800, color: C.jet, whiteSpace: "nowrap", flexShrink: 0, ...fDisplay }}>
              ${coach.packages[0].price}<span style={{ fontSize: T.caption, fontWeight: 500, color: C.slateLight }}>/session</span>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: T.labelLg, color: C.jet, fontWeight: 600, ...fBody }}>
              <Star size={12} fill={C.orange} color={C.orange} /> {coach.rating}
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
                    <span style={{ fontSize: T.caption, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.orangeTint, color: C.orange, ...fBody }}>Instant book</span>
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
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.55)", animation: "clBackdropIn .18s ease" }} />
      <div
        role="dialog"
        style={{
          position: "relative", width: 340, height: 600, maxWidth: "100%", maxHeight: "100%", background: C.white, borderRadius: 30,
          padding: "34px 28px 28px", boxSizing: "border-box", display: "flex", flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,.28)", animation: "clPopIn .22s cubic-bezier(.32,.72,0,1)",
        }}
      >
        <button onClick={onClose} aria-label="Skip for now" style={{
          position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: 99,
          background: C.fog, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={14} color={C.slate} />
        </button>

        {/* Progress indicator — one dot per step, filled = current, plus "x of n" */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10, flexShrink: 0 }}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: 99, flexShrink: 0,
              background: i === step ? C.orange : C.border, transition: "background .15s ease",
            }} />
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: T.body, fontWeight: 600, color: C.slateLight, marginBottom: 26, flexShrink: 0, ...fBody }}>
          {step + 1} of {total}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", flexShrink: 0 }}>
            <Icon size={36} color={C.orange} />
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
export function PersonalisedRecommendationModal({ open, onClose, onSubmit, userLocation, locating, requestLocation }) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationText, setLocationText] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const isPresetRadius = NEARBY_RADIUS_PRESETS.includes(radiusKm);
  const [showCustomRadius, setShowCustomRadius] = useState(false);
  const [customRadius, setCustomRadius] = useState("");
  const [sports, setSports] = useState([]);
  const [goals, setGoals] = useState("");
  // Brief "processing" delay after submit so the platform visibly appears to
  // crunch the client's preferences before handing back curated matches,
  // rather than snapping straight to results.
  const [submitting, setSubmitting] = useState(false);

  // Reset the form every time the sheet is (re)opened so a previous session's
  // input doesn't linger if the client closes it and comes back later.
  useEffect(() => {
    if (open) {
      setUseCurrentLocation(true);
      setLocationText("");
      setRadiusKm(10);
      setShowCustomRadius(false);
      setCustomRadius("");
      setSports([]);
      setGoals("");
      setSubmitting(false);
    }
  }, [open]);

  const toggleSport = (s) => setSports((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));

  const handleUseLocation = () => { setUseCurrentLocation(true); setLocationText(""); requestLocation?.(); };

  const applyCustomRadius = () => {
    const val = Number(customRadius);
    if (val >= CUSTOM_RADIUS_MIN_KM && val <= CUSTOM_RADIUS_MAX_KM) { setRadiusKm(val); setShowCustomRadius(false); }
  };

  const canSubmit = useCurrentLocation || locationText.trim().length > 0;

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulated processing delay — gives the "generating recommendations"
    // state a moment to register before the sheet closes into results.
    setTimeout(() => {
      onSubmit({
        useCurrentLocation,
        locationText: useCurrentLocation ? "" : locationText.trim(),
        radiusKm,
        sports,
        goals: goals.trim(),
      });
    }, 1400);
  };

  return (
    <BottomSheet open={open} onClose={submitting ? () => {} : onClose} title="Personalise Your Recommendations" heightPct={92}>
      <SectionLabel>Current Location</SectionLabel>
      <button onClick={handleUseLocation} style={{
        display: "flex", width: "100%", boxSizing: "border-box", alignItems: "center", gap: 8,
        padding: "11px 14px", borderRadius: 12, border: `1px solid ${useCurrentLocation ? C.orange : C.border}`,
        background: useCurrentLocation ? C.orangeTint : C.white, color: useCurrentLocation ? C.orange : C.jet,
        fontWeight: 600, fontSize: T.bodyLg, cursor: "pointer", marginBottom: 10, ...fBody,
      }}>
        {locating && useCurrentLocation ? <Spinner size={13} color={C.orange} /> : <LocateFixed size={14} />}
        {useCurrentLocation ? (locating ? "Locating you…" : "Using your current location") : "Use my current location"}
      </button>
      <div style={{ textAlign: "center", fontSize: T.captionLg, color: C.slateLight, margin: "4px 0 10px", ...fBody }}>or enter it manually</div>
      <input
        value={locationText}
        onChange={(e) => { setLocationText(e.target.value); setUseCurrentLocation(false); }}
        placeholder="Suburb, city or postcode"
        style={{ width: "100%", boxSizing: "border-box", background: C.fog, border: "none", borderRadius: 12, padding: "11px 14px", fontSize: T.bodyLg, color: C.jet, outline: "none", marginBottom: 22, ...fBody }}
      />

      <SectionLabel>Search Radius</SectionLabel>
      <div style={{ marginBottom: 22 }}>
        {showCustomRadius ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number" min={CUSTOM_RADIUS_MIN_KM} max={CUSTOM_RADIUS_MAX_KM} value={customRadius}
              onChange={(e) => setCustomRadius(e.target.value)}
              placeholder={`${CUSTOM_RADIUS_MIN_KM}–${CUSTOM_RADIUS_MAX_KM}`}
              style={{ flex: 1, boxSizing: "border-box", background: C.fog, border: "none", borderRadius: 12, padding: "11px 14px", fontSize: T.bodyLg, color: C.jet, outline: "none", ...fBody }}
            />
            <span style={{ fontSize: T.bodyLg, color: C.slate, ...fBody }}>km</span>
            <button onClick={applyCustomRadius} style={{ padding: "11px 16px", borderRadius: 12, border: "none", background: C.orange, color: C.white, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}>Set</button>
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

      <SectionLabel>Coaching Goals <span style={{ fontWeight: 400, color: C.slateLight }}>(optional)</span></SectionLabel>
      <textarea
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        placeholder="e.g. Improve my technique, train for a competition, build confidence…"
        rows={3}
        style={{ width: "100%", boxSizing: "border-box", background: C.fog, border: "none", borderRadius: 12, padding: "11px 14px", fontSize: T.bodyLg, color: C.jet, outline: "none", resize: "none", marginBottom: 24, ...fBody }}
      />

      <Btn full disabled={!canSubmit} loading={submitting} loadingText="Finding your matches…" onClick={handleSubmit}>Find My Coaches</Btn>
    </BottomSheet>
  );
}

export function ScreenClientHome({ nav, favorites, toggleFav, filters, onFiltersChange, clientNotifications: notifications, setClientNotifications: setNotifications, coachAvailableNow, isFirstTimeClient, discoveryPrefs, setDiscoveryPrefs, showPostSignupGuide, setShowPostSignupGuide }) {
  const [view, setView] = useState("list");
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  // Defaults to the tightest "Nearby" (0–5 km) band; the control for changing
  // it lives in Filters, same as sport/area/price/rating.
  const { userLocation, locating, requestLocation } = useUserLocation();

  // The pulse CSS the location pill reuses is normally injected by the map
  // view — bring it in here too so it still looks right if you land on
  // List/Favorites without ever opening the map.
  useEffect(() => { injectMapStyles(); }, []);

  const appliedFilters = filters || DEFAULT_FILTERS;
  const setAppliedFilters = onFiltersChange || (() => {});
  const radiusKm = appliedFilters.radiusKm ?? 5;
  const unreadCount = notifications.filter(n => n.unread).length;

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
    ? [...new Set([...ALL_SUBURBS, ...COACHES.map(c => c.name)])].filter(s => s.toLowerCase().includes(searchText.trim().toLowerCase())).slice(0, 5)
    : [];

  // Live distance from wherever the user actually is right now, falling back
  // to the same default point the map uses until a real fix comes in.
  const origin = userLocation || FALLBACK_USER_LOCATION;
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
    const matchesQuery = !q || c.suburb.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q);
    const matchesAreas = !appliedFilters.areas.length || appliedFilters.areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase()));
    const matchesSport = !appliedFilters.sports?.length || appliedFilters.sports.includes(c.sport);
    const matchesPrice = c.packages[0].price <= (appliedFilters.maxPrice ?? DEFAULT_FILTERS.maxPrice);
    const matchesRating = c.rating >= (appliedFilters.minRating ?? 0);
    return matchesQuery && matchesAreas && matchesSport && matchesPrice && matchesRating;
  });
  const filtered = searchAndAreaFiltered
    .filter(c => radiusKm == null || c.liveDistanceKm <= radiusKm)
    .sort((a, b) => a.liveDistanceKm - b.liveDistanceKm);
  const favCoaches = COACHES.filter(c => favorites.includes(c.id));

  // Every filter currently applied, each individually removable — feeds both
  // the "active filters" row on the dashboard and the badge on the Filter icon.
  const activeFilterChips = useMemo(() => {
    const chips = [];
    appliedFilters.areas.forEach(a => chips.push({
      key: `area-${a}`, label: a,
      onRemove: () => setAppliedFilters({ ...appliedFilters, areas: appliedFilters.areas.filter(x => x !== a) }),
    }));
    (appliedFilters.sports || []).forEach(s => chips.push({
      key: `sport-${s}`, label: s,
      onRemove: () => setAppliedFilters({ ...appliedFilters, sports: appliedFilters.sports.filter(x => x !== s) }),
    }));
    const maxPrice = appliedFilters.maxPrice ?? DEFAULT_FILTERS.maxPrice;
    if (maxPrice !== DEFAULT_FILTERS.maxPrice) chips.push({
      key: "price", label: `Up to $${maxPrice}`,
      onRemove: () => setAppliedFilters({ ...appliedFilters, maxPrice: DEFAULT_FILTERS.maxPrice }),
    });
    const minRating = appliedFilters.minRating ?? 0;
    if (minRating > 0) chips.push({
      key: "rating", label: `${minRating}+ rating`,
      onRemove: () => setAppliedFilters({ ...appliedFilters, minRating: 0 }),
    });
    const appliedRadius = appliedFilters.radiusKm ?? 5;
    if (appliedRadius !== 5) chips.push({
      key: "radius", label: appliedRadius == null ? "Any distance" : `${appliedRadius} km`,
      onRemove: () => setAppliedFilters({ ...appliedFilters, radiusKm: 5 }),
    });
    return chips;
  }, [appliedFilters]);
  const hasActiveFilters = activeFilterChips.length > 0;

  const selectSuggestion = s => { setSearchText(s); setShowSuggestions(false); };

  const notifSheet = (
    <BottomSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications" heightPct={72}>
      {unreadCount > 0 && (
        <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: C.orange, fontSize: T.labelLg, fontWeight: 600, cursor: "pointer", marginBottom: 10, padding: "2px 0", ...fBody }}>
          <Check size={13} /> Mark all as read
        </button>
      )}
      {notifications.map(n => {
        const Icon = NOTIF_ICON[n.type] || Bell;
        return (
          <button key={n.id} onClick={() => openNotification(n)} style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color={C.orange} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{n.title}</span>
                <span style={{ fontSize: T.tiny, color: C.slateLight, flexShrink: 0, ...fBody }}>{n.time}</span>
              </div>
              <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 3, lineHeight: 1.45, ...fBody }}>{n.body}</div>
            </div>
            {n.unread && <span style={{ width: 8, height: 8, borderRadius: 99, background: C.orange, flexShrink: 0, marginTop: 5 }} />}
          </button>
        );
      })}
    </BottomSheet>
  );

  const prefsModal = (
    <PersonalisedRecommendationModal
      open={prefsModalOpen}
      onClose={() => setPrefsModalOpen(false)}
      onSubmit={handlePrefsSubmit}
      userLocation={userLocation}
      locating={locating}
      requestLocation={requestLocation}
    />
  );

  const guideModal = (
    <PostSignupGuideModal
      open={!!showPostSignupGuide}
      onClose={() => setShowPostSignupGuide?.(false)}
      onFindCoaches={() => { setShowPostSignupGuide?.(false); setPrefsModalOpen(true); }}
    />
  );

  // First-time client, no preferences submitted yet — the Coach Listings
  // section stays empty and prompts for preferences instead of showing
  // every coach in the directory.
  if (showRecommendationPrompt) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ padding: "18px 20px 0", display: "flex", justifyContent: "flex-end" }}>
          <NotificationBellButton count={unreadCount} onClick={() => setNotifOpen(true)} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 28px 40px" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <Sparkles size={30} color={C.orange} />
          </div>
          <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Let's Find Your Perfect Coach</div>
          <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 10, lineHeight: 1.6, maxWidth: 300, ...fBody }}>
            Answer a few quick questions about what you're looking for, and we'll curate coach recommendations based on your interests, goals, and location.
          </div>
          <div style={{ marginTop: 26, width: "100%" }}>
            <Btn full onClick={() => setPrefsModalOpen(true)}>Find My Coaches</Btn>
          </div>
        </div>
        {notifSheet}
        {prefsModal}
        {guideModal}
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: T.labelLg, color: C.slate, ...fBody }}>Good morning</div>
            <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Find your coach</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>
              {locating ? (
                <><Spinner size={10} color={C.orange} /> Locating you…</>
              ) : (
                <>
                  <span style={{ position: "relative", width: 7, height: 7, flexShrink: 0 }}>
                    <span style={{ position: "absolute", inset: 0, borderRadius: 99, background: C.live }} />
                    <span style={{ position: "absolute", inset: -3, borderRadius: 99, border: `1.5px solid ${C.live}`, animation: "clFixedBlink 1.8s ease-in-out infinite" }} />
                  </span>
                  <LocateFixed size={11} color={C.slate} /> {manualLabel ? `Using ${manualLabel}` : "Using your current location"}
                </>
              )}
            </div>
          </div>
          <NotificationBellButton count={unreadCount} onClick={() => nav("notifications")} />
        </div>

        <div style={{ position: "relative", marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 14, padding: "13px 14px" }}>
            <Search size={16} color={C.slateLight} />
            <input value={searchText} onChange={e => { setSearchText(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Sport, coach name or suburb" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }} />
            {searchText && <button onClick={() => setSearchText("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={14} color={C.slateLight} /></button>}
            <button onClick={() => nav("search-filters", { initialFilters: appliedFilters, onApply: setAppliedFilters })} style={{
              position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 8, cursor: "pointer",
              background: hasActiveFilters ? C.orangeTint : "none", border: "none",
            }}>
              <Filter size={15} color={hasActiveFilters ? C.orange : C.slate} />
              {hasActiveFilters && (
                <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 99, background: C.orange, border: `1.5px solid ${C.white}` }} />
              )}
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {suggestions.map(s => (
                <button key={s} onMouseDown={() => selectSuggestion(s)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: T.body, color: C.jet, ...fBody }}>
                  <MapPin size={13} color={C.slateLight} /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sport category filter bar — horizontally scrollable/swipable (native touch
            drag + momentum via cl-swipe-row) so users can browse every sport without
            it wrapping or crowding the screen. Selecting a sport re-filters `filtered`
            below, which drives the Coach Listings list, so listings update immediately. */}
        <ScrollFadeRow className="cl-swipe-row" style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 2 }}>
          <Chip active={!appliedFilters.sports?.length} onClick={() => setAppliedFilters({ ...appliedFilters, sports: [] })}>All sports</Chip>
          {SPORTS.map(s => (
            <Chip
              key={s}
              active={!!appliedFilters.sports?.includes(s)}
              onClick={() => {
                const has = appliedFilters.sports?.includes(s);
                setAppliedFilters({ ...appliedFilters, sports: has ? appliedFilters.sports.filter(x => x !== s) : [...(appliedFilters.sports || []), s] });
              }}
            >{s}</Chip>
          ))}
        </ScrollFadeRow>

        {hasActiveFilters && (
          <div className="cl-hide-scrollbar" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", overflowX: "auto", marginTop: 12, paddingBottom: 2 }}>
            {activeFilterChips.map(chip => (
              <span key={chip.key} style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap", background: C.orangeTint, color: C.orange, borderRadius: 99, padding: "4px 6px 4px 10px", fontSize: T.captionLg, fontWeight: 600, ...fBody }}>
                {chip.label}
                <button onClick={chip.onRemove} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: 99, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                  <X size={11} color={C.orange} />
                </button>
              </span>
            ))}
            {activeFilterChips.length > 1 && (
              <button onClick={() => setAppliedFilters(DEFAULT_FILTERS)} style={{ flexShrink: 0, whiteSpace: "nowrap", background: "none", border: "none", cursor: "pointer", fontSize: T.captionLg, color: C.slateLight, textDecoration: "underline", ...fBody }}>Clear all</button>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.body, fontWeight: 600, color: C.jet, ...fDisplay }}>
            {view === "favorites" ? <><Heart size={13} color={C.orange} /> Your favorites</> : <><Navigation size={13} color={C.orange} /> Coaches near you</>}
          </div>
          <SegTabs strong value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "map", label: "Map" }, { value: "favorites", label: "Favorites" }]} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px" }}>
        {view === "favorites" ? (
          favCoaches.length === 0
            ? <EmptyState icon={Heart} title="No favorites yet" body="Tap the heart on a coach's card or profile to save them here." />
            : favCoaches.map(c => <CoachListCard key={c.id} coach={c} onOpen={() => nav("coach-profile", { id: c.id })} />)
        ) : filtered.length === 0
          ? (
            <StatusBanner
              state="noResults"
              style={{ marginTop: 10 }}
              onPrimary={() => { setSearchText(""); setAppliedFilters(DEFAULT_FILTERS); }}
              onSecondary={() => setAppliedFilters({ ...appliedFilters, radiusKm: CUSTOM_RADIUS_MAX_KM })}
              secondaryLabel="Browse all coaches"
            />
          )
          : filtered.map(c => <CoachListCard key={c.id} coach={c} unavailable={c.id === LIVE_AVAILABILITY_COACH_ID && !coachAvailableNow} onOpen={() => nav("coach-profile", { id: c.id })} />)
        }
      </div>

      {notifSheet}

      {view === "map" && <CoachMapView coaches={searchAndAreaFiltered} onOpen={id => nav("coach-profile", { id })} onClose={() => setView("list")} />}
    </div>
  );
}

export function ScreenSearchFilters({ nav, params, userLocation, locating, permissionDenied, manualLabel, requestLocation, setManualLocation }) {
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
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <TopBar title="Filters" onBack={() => nav("client-home")} />
      {/* Single vertical scroll region for every filter section; Reset and
          Show results stay fixed below it, outside the scroll area. */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
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
            padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.orange}`,
            background: C.orangeTint, color: C.orange, fontWeight: 600, fontSize: T.bodyLg,
            cursor: "pointer", marginBottom: 10, ...fBody,
          }}>
            {locating ? <Spinner size={13} color={C.orange} /> : <MapPin size={14} />}
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
                  style={{ width: "100%", boxSizing: "border-box", background: C.fog, border: "none", borderRadius: 12, padding: "11px 14px", fontSize: T.bodyLg, color: C.jet, outline: "none", ...fBody }} />
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
                  style={{ flex: 1, boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: T.bodyLg, color: C.jet, outline: "none", background: C.white, ...fBody }}
                />
                <span style={{ fontSize: T.labelLg, fontWeight: 700, color: C.slate, ...fBody }}>km</span>
              </div>
              <button onClick={() => { setRadiusKm(customRadius); setShowCustomRadius(false); }} style={{ marginTop: 10, width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: C.orange, color: C.white, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}>Apply</button>
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
        <input type="range" min="20" max="150" step="5" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", accentColor: C.orange, marginBottom: 20 }} />

        <SectionLabel>Minimum rating</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {[0, 3, 4, 4.5].map(r => <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>{r === 0 ? "Any" : `${r}+`}</Chip>)}
        </div>
      </div>

      {/* Fixed footer, outside the scroll area — result feedback lives here
          rather than as its own filter-like control up in Distance. */}
      <div style={{ padding: "12px 0 14px", flexShrink: 0 }}>
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