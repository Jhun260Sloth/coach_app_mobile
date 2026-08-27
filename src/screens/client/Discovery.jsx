import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, ArrowDown, ChevronDown, ChevronRight, Navigation, Star, MapPin, Heart, X, LocateFixed, Calendar, MessageCircle, Sparkles, BadgeCheck, CheckCircle2, Clock, Award, Map as MapIcon } from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";

import { COACHES, ALL_SUBURBS, SUBURB_COORDS, PROMO_BANNERS } from "../../data/mockData";
import { Card, Chip, Badge, SectionLabel, Avatar, Btn, BottomSheet, Spinner, ScrollFadeRow, HandleTag, Skeleton } from "../../components/ui/Primitives";
import { PromoBannerCarousel } from "../../components/ui/PromoBannerCarousel";
import { SportBadge, SportIcon, SportSearchMultiSelect, SportTile } from "../../components/ui/SportUI";
import { POPULAR_SPORTS, SPORT_NAMES } from "../../data/sports";
import { getPublicName } from "../../utils/name";


import { haptic } from "../../utils/haptics";
import { usePullToRefresh } from "../../utils/usePullToRefresh";
import { NotificationBellButton, useUserLocation } from "../../systems/StateSystem";
import { StatusBanner } from "../../components/ui/Banners";
import { LocationField } from "../../components/ui/LocationField";
import { CoachMapView } from "../../components/map/CoachMapView";
import { haversineKm, getCoachAreaPoint, FALLBACK_USER_LOCATION, injectMapStyles, CUSTOM_RADIUS_MIN_KM, CUSTOM_RADIUS_MAX_KM } from "../../lib/mapUtils";

// Only the current in-app coach (Josh Whitfield, c2) has a live availability
// toggle driven by app state — every other coach in the directory is static
// mock data, so this is the one card that can flip to "Busy" at runtime.
const LIVE_AVAILABILITY_COACH_ID = "c2";

// Dashboard silently defaults to the "Nearby" 0–5 km band; the actual radius
// control (with presets + custom slider, same as the map) lives in Filters.
const DEFAULT_FILTERS = { sports: [], areas: [], maxPrice: 150, minRating: 0, radiusKm: 5, favoritesOnly: false };
const NEARBY_RADIUS_PRESETS = [5, 10, 15, 25];
const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended", detail: "Best overall matches for you" },
  { value: "distance", label: "Distance", detail: "Closest coaches first" },
  { value: "rating", label: "Highest rated", detail: "Top client ratings first" },
  { value: "price", label: "Price: low to high", detail: "Lowest session price first" },
];

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const NOOP = () => {};
const PTR_THRESHOLD = 62;

const getApproxCoachDistance = (origin, coach) => {
  const areaPoint = getCoachAreaPoint(coach);
  return areaPoint ? haversineKm(origin, areaPoint) : Infinity;
};

const getCoachAvailabilityStatus = (coach, unavailable) => {
  const isBusy = unavailable || coach.bookingAvailability === "busy";
  return isBusy
    ? { label: "Busy", tone: "neutral", icon: Clock }
    : { label: "Available", tone: "success", icon: Calendar };
};

const getCoachExperienceLabel = (experience) => {
  const raw = String(experience || "").trim();
  const numMatch = raw.match(/\d+/);
  if (numMatch) {
    const n = parseInt(numMatch[0], 10);
    return `${n} ${n === 1 ? "year" : "years"}`;
  }
  const clean = raw.replace(/\s*(coaching|experience)$/i, "").trim();
  return clean ? clean.replace(/\byrs?\b/gi, "years") : "";
};

export function CoachListCard({ coach, onOpen, unavailable, style }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const pub = getPublicName(coach, "public");
  const availabilityStatus = getCoachAvailabilityStatus(coach, unavailable);
  const experienceLabel = getCoachExperienceLabel(coach.experience);
  return (
    <Card
      onClick={onOpen}
      ariaLabel={`View ${pub.name}'s coach profile`}
      style={{ marginBottom: 12, padding: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)", background: C.white, ...style }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", gap: 12, alignItems: "start" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar name={pub.name} src={coach.avatar} size={52} />
          {coach.verified.identity && (
            <span aria-label="Verified coach" title="Verified coach" style={{ position: "absolute", right: -3, bottom: -3, width: 20, height: 20, borderRadius: 99, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BadgeCheck size={19} color={C.white} fill={C.info} strokeWidth={2.5} />
            </span>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.title, color: C.jet, letterSpacing: "-0.1px", ...oneLine, ...fDisplay }}>{pub.name}</div>
          {pub.handle && <div style={{ marginTop: 1 }}><HandleTag handle={pub.handle} size={11.5} color={C.slateLight} /></div>}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, minWidth: 0, color: C.slate, fontSize: T.captionLg, ...fBody }}>
            <MapPin size={12} color={C.slateLight} style={{ flexShrink: 0 }} />
            <span style={{ minWidth: 0, ...oneLine }}>{coach.suburb}</span>
          </div>
        </div>

        <div style={{ minWidth: 72, whiteSpace: "nowrap", textAlign: "right" }}>
          <div style={{ fontSize: T.titleLg, fontWeight: 800, color: C.jet, lineHeight: 1, ...fDisplay }}>${coach.packages[0].price}</div>
          <div style={{ fontSize: T.micro, fontWeight: 500, color: C.slateLight, marginTop: 4, ...fBody }}>Starting from</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {(coach.sports || [coach.sport]).map((sport) => (
          <SportBadge key={sport} sport={sport} compact />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, color: C.jet, fontSize: T.captionLg, fontWeight: 600, whiteSpace: "nowrap", ...fBody }}>
          <div title={`${coach.rating.toFixed(1)} from ${coach.reviews} reviews`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={12} fill={C.brand} color={C.brand} aria-hidden="true" />
            <span>{coach.rating.toFixed(1)}</span>
            <span style={{ color: C.slateLight, fontWeight: 400 }}>({coach.reviews})</span>
          </div>
          <span aria-hidden="true" style={{ width: 3, height: 3, borderRadius: 99, background: C.border, flexShrink: 0 }} />
          <div title={experienceLabel} style={{ display: "flex", alignItems: "center", gap: 4, color: C.slate, minWidth: 0 }}>
            <Award size={12} color={C.brand} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span style={{ minWidth: 0, ...oneLine }}>{experienceLabel}</span>
          </div>
        </div>
        <Badge tone={availabilityStatus.tone} icon={availabilityStatus.icon} style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
          {availabilityStatus.label}
        </Badge>
      </div>
    </Card>
  );
}

function TopRecommendationCard({ coach, onOpen }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const pub = getPublicName(coach, "public");
  const availabilityStatus = getCoachAvailabilityStatus(coach, false);
  const experienceLabel = getCoachExperienceLabel(coach.experience);
  return (
    <Card
      onClick={onOpen}
      ariaLabel={`View ${pub.name}'s coach profile`}
      style={{
        width: 172,
        flexShrink: 0,
        padding: "14px 13px 12px",
        borderRadius: 18,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        background: C.white,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        animation: "clFadeUp .4s cubic-bezier(.22,1,.36,1) backwards",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Avatar name={pub.name} src={coach.avatar} size={44} />
            {coach.verified?.identity && (
              <span aria-label="Verified coach" style={{ position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: 99, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BadgeCheck size={15} color={C.white} fill={C.info} />
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 7px", borderRadius: 999, background: C.brandTint, color: C.brand, fontSize: T.caption, fontWeight: 700, ...fBody }}>
            <Star size={11} fill={C.brand} color={C.brand} />
            <span>{coach.rating.toFixed(1)}</span>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, letterSpacing: "-0.1px", ...oneLine, ...fDisplay }}>{pub.name}</div>
          <div style={{ marginTop: 6 }}>
            <SportBadge sport={coach.sport} compact />
          </div>
          <div title={experienceLabel} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: C.slateLight, fontSize: T.caption, ...fBody }}>
            <Award size={12} color={C.brand} aria-hidden="true" />
            <span style={{ minWidth: 0, ...oneLine }}>{experienceLabel}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        <div>
          <div style={{ fontSize: T.micro, color: C.slateLight, lineHeight: 1, ...fBody }}>Starting</div>
          <div style={{ marginTop: 3, fontSize: T.bodyLg, fontWeight: 800, color: C.jet, lineHeight: 1, ...fDisplay }}>${coach.packages[0]?.price}</div>
        </div>
        <Badge tone={availabilityStatus.tone} icon={availabilityStatus.icon} style={{ padding: "3px 6px", fontSize: T.micro, whiteSpace: "nowrap" }}>
          {availabilityStatus.label}
        </Badge>
      </div>
    </Card>
  );
}

function ListSkeleton({ rows = 4 }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ marginBottom: 12, padding: 14, borderRadius: LAYOUT.cardRadius, border: `1px solid ${C.border}`, background: C.white, opacity: 1 - i * 0.15 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Skeleton w={56} h={56} radius={99} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Skeleton w="58%" h={13} radius={7} />
              <Skeleton w="34%" h={10} radius={7} style={{ marginTop: 9 }} />
              <Skeleton w="46%" h={22} radius={8} style={{ marginTop: 12 }} />
            </div>
            <Skeleton w={44} h={13} radius={7} style={{ flexShrink: 0 }} />
          </div>
        </div>
      ))}
    </div>
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
      <SectionLabel required>Your Location</SectionLabel>
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
            <button onClick={applyCustomRadius} style={{ padding: "11px 16px", borderRadius: 12, border: "none", background: C.black, color: C.white, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}>Set</button>
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
        {POPULAR_SPORTS.slice(0, 10).map((s) => <SportBadge key={s} sport={s} selected={sports.includes(s)} onClick={() => toggleSport(s)} compact />)}
      </div>
      <div style={{ marginTop: -10, marginBottom: 22 }}>
        <SportSearchMultiSelect options={SPORT_NAMES} value={sports} onChange={setSports} placeholder="Search all sports…" />
      </div>

      <Btn full disabled={!canSubmit} loading={submitting} loadingText="Finding your matches…" onClick={handleSubmit}>Find My Coaches</Btn>
    </BottomSheet>
  );
}

export function ScreenClientHome({ nav, params = {}, favorites = [], toggleFav, filters, onFiltersChange, clientNotifications: notifications = [], coachAvailableNow, isFirstTimeClient, discoveryPrefs, setDiscoveryPrefs, showPostSignupGuide, setShowPostSignupGuide }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const heroText = darkMode ? C.jet : CL.white;
  const heroMuted = `color-mix(in srgb, ${heroText} 76%, transparent)`;
  const heroBackground = darkMode
    ? `linear-gradient(145deg, ${C.brandTint} 0%, color-mix(in srgb, ${C.brandTint} 72%, ${C.brand} 28%) 100%)`
    : `linear-gradient(145deg, ${C.brandColor} 0%, ${C.brand} 62%, color-mix(in srgb, ${C.secondary} 76%, ${C.accent} 24%) 100%)`;
  // A coach profile opened from the map returns here with this flag so the
  // user lands back on the map, not the underlying Discover list.
  const [mapOpen, setMapOpen] = useState(() => params.mapOpen === true);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [filterDraft, setFilterDraft] = useState(DEFAULT_FILTERS);
  const [locationQuery, setLocationQuery] = useState("");
  const [listLoading, setListLoading] = useState(false);

  // Pull-to-refresh replays the skeleton refresh for a tactile "checking for
  // new coaches" moment on real devices (no-op with a mouse).
  const handleRefresh = () => {
    haptic(12);
    setListLoading(true);
    setTimeout(() => setListLoading(false), 750);
  };
  const ptr = usePullToRefresh({ onRefresh: handleRefresh, threshold: PTR_THRESHOLD });
  const ptrReady = ptr.pull >= PTR_THRESHOLD;
  // Defaults to the tightest "Nearby" (0–5 km) band; the control for changing
  // it lives in Filters, same as sport/area/price/rating.
  const { userLocation, locating, permissionDenied, manualLabel, requestLocation, setManualLocation } = useUserLocation();

  // The pulse CSS the location pill reuses is normally injected by the map
  // view — bring it in here too so it still looks right before opening the map.
  // Re-runs on dark-mode flips so pulse/accent colors stay in sync.
  useEffect(() => { injectMapStyles(C); }, [C]);

  const appliedFilters = useMemo(() => ({
    ...DEFAULT_FILTERS,
    ...(filters || {}),
    sports: (filters && Array.isArray(filters.sports)) ? filters.sports : DEFAULT_FILTERS.sports,
    areas: (filters && Array.isArray(filters.areas)) ? filters.areas : DEFAULT_FILTERS.areas,
  }), [filters]);
  const setAppliedFilters = onFiltersChange || NOOP;
  const radiusKm = appliedFilters.radiusKm === null ? null : (appliedFilters.radiusKm ?? 5);
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const unreadCount = safeNotifications.filter(n => n?.unread).length;

  // First-time clients haven't told us what they're looking for yet, so the
  // Coach Listings section stays empty and prompts for preferences instead
  // of showing every coach in the directory.
  const showRecommendationPrompt = !discoveryPrefs;

  const handleBannerSelect = (banner) => {
    haptic(10);
    if (banner.coachId) {
      nav("coach-profile", { id: banner.coachId });
    } else if (banner.sport) {
      setAppliedFilters({ ...appliedFilters, sports: [banner.sport] });
    }
  };

  const handlePrefsSubmit = (prefs) => {
    haptic(12);
    setDiscoveryPrefs?.(prefs);
    setAppliedFilters({
      ...appliedFilters,
      sports: prefs.sports,
      radiusKm: prefs.radiusKm,
      areas: prefs.locationText ? [prefs.locationText] : appliedFilters.areas,
    });
    setPrefsModalOpen(false);
  };

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
    () => COACHES.map(c => ({ ...c, liveDistanceKm: Math.round(getApproxCoachDistance(origin, c) * 10) / 10 })),
    [origin.lat, origin.lng]
  );

  // Shared list/map filtering. Both discovery surfaces consume the same
  // applied sport, area, price, rating, distance, and saved-coach criteria.
  const searchAndAreaFiltered = useMemo(() => withDistance.filter(c => {
    const matchesAreas = !appliedFilters.areas.length || appliedFilters.areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase()));
    const matchesSport = !appliedFilters.sports?.length || appliedFilters.sports.includes(c.sport) || (c.sports && c.sports.some(s => appliedFilters.sports.includes(s)));
    const matchesPrice = c.packages && c.packages[0] ? c.packages[0].price <= (appliedFilters.maxPrice ?? DEFAULT_FILTERS.maxPrice) : true;
    const matchesRating = c.rating >= (appliedFilters.minRating ?? 0);
    const matchesFavorite = !appliedFilters.favoritesOnly || safeFavorites.includes(c.id);
    return matchesAreas && matchesSport && matchesPrice && matchesRating && matchesFavorite;
  }), [withDistance, appliedFilters, safeFavorites]);
  const filtered = useMemo(() => {
    const matches = searchAndAreaFiltered.filter(c => radiusKm == null || c.liveDistanceKm <= radiusKm);
    return [...matches].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating || a.liveDistanceKm - b.liveDistanceKm;
      if (sortBy === "price") return a.packages[0].price - b.packages[0].price || b.rating - a.rating;
      if (sortBy === "distance") return a.liveDistanceKm - b.liveDistanceKm;
      const score = coach => (coach.rating * 20) - coach.liveDistanceKm;
      return score(b) - score(a);
    });
  }, [searchAndAreaFiltered, radiusKm, sortBy]);
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
    const appliedRadius = appliedFilters.radiusKm;
    if (appliedRadius === null || (appliedRadius ?? 5) !== 5) count += 1;
    if (appliedFilters.favoritesOnly) count += 1;
    return count;
  }, [appliedFilters]);
  const hasActiveFilters = activeFilterCount > 0;
  const updateAppliedFilters = patch => setAppliedFilters({ ...appliedFilters, ...patch });
  const appliedFilterTokens = [
    ...(appliedFilters.sports || []).map(sport => ({
      key: `sport-${sport}`,
      label: sport,
      icon: <SportIcon sport={sport} size={13} color={C.brand} />,
      remove: () => updateAppliedFilters({ sports: appliedFilters.sports.filter(item => item !== sport) }),
    })),
    ...(appliedFilters.areas || []).map(area => ({
      key: `area-${area}`,
      label: area,
      icon: <MapPin size={13} color={C.brand} aria-hidden="true" />,
      remove: () => updateAppliedFilters({ areas: appliedFilters.areas.filter(item => item !== area) }),
    })),
    ...((appliedFilters.maxPrice ?? DEFAULT_FILTERS.maxPrice) !== DEFAULT_FILTERS.maxPrice ? [{
      key: "price",
      label: `Up to $${appliedFilters.maxPrice}`,
      remove: () => updateAppliedFilters({ maxPrice: DEFAULT_FILTERS.maxPrice }),
    }] : []),
    ...((appliedFilters.minRating ?? 0) > 0 ? [{
      key: "rating",
      label: `${appliedFilters.minRating}+ rating`,
      icon: <Star size={12} color={C.brand} fill={C.brand} aria-hidden="true" />,
      remove: () => updateAppliedFilters({ minRating: 0 }),
    }] : []),
    ...((appliedFilters.radiusKm === null || (appliedFilters.radiusKm ?? 5) !== 5) ? [{
      key: "distance",
      label: appliedFilters.radiusKm == null ? "Any distance" : `Within ${appliedFilters.radiusKm} km`,
      remove: () => updateAppliedFilters({ radiusKm: 5 }),
    }] : []),
    ...(appliedFilters.favoritesOnly ? [{
      key: "favorites",
      label: "Saved coaches",
      icon: <Heart size={12} color={C.brand} fill={C.brand} aria-hidden="true" />,
      remove: () => updateAppliedFilters({ favoritesOnly: false }),
    }] : []),
  ];

  // Filter and sort changes briefly show shimmer rows so list updates read as
  // a deliberate refresh rather than an abrupt swap.
  useEffect(() => {
    setListLoading(true);
    const timer = setTimeout(() => setListLoading(false), 520);
    return () => clearTimeout(timer);
  }, [appliedFilters, sortBy]);

  // "Recommended for you" rail — top-rated, high-match coaches based on the client's profile
  const recommendedCoaches = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => (b.rating * 20 + b.reviews) - (a.rating * 20 + a.reviews));
    return sorted.length > 0 ? sorted.slice(0, 8) : [];
  }, [filtered]);

  const toggleQuickSport = sport => {
    const current = appliedFilters.sports || [];
    const next = current.includes(sport) ? current.filter(s => s !== sport) : [...current, sport];
    haptic(8);
    setAppliedFilters({ ...appliedFilters, sports: next });
  };

  const openFilters = () => {
    setFilterDraft({ ...appliedFilters, sports: [...appliedFilters.sports], areas: [...appliedFilters.areas] });
    setActiveSheet("filters");
  };
  const updateDraft = patch => setFilterDraft(current => ({ ...current, ...patch }));
  const draftPreviewCount = useMemo(() => COACHES.filter(c => {
    const distance = getApproxCoachDistance(origin, c);
    return (!filterDraft.sports?.length || filterDraft.sports.includes(c.sport) || (c.sports && c.sports.some(s => filterDraft.sports.includes(s))))
      && (!filterDraft.areas?.length || filterDraft.areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase())))
      && c.packages[0].price <= (filterDraft.maxPrice ?? DEFAULT_FILTERS.maxPrice)
      && c.rating >= (filterDraft.minRating ?? 0)
      && (!filterDraft.favoritesOnly || safeFavorites.includes(c.id))
      && (filterDraft.radiusKm == null || distance <= filterDraft.radiusKm);
  }).length, [filterDraft, origin.lat, origin.lng, safeFavorites]);
  const locationSuggestions = locationQuery.trim()
    ? ALL_SUBURBS.filter(s => s.toLowerCase().includes(locationQuery.trim().toLowerCase())).slice(0, 5)
    : ALL_SUBURBS.slice(0, 4);
  const chooseLocation = suburb => {
    const coords = SUBURB_COORDS[suburb];
    if (coords) setManualLocation(coords, suburb);
    setLocationQuery("");
    setActiveSheet(null);
  };

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
      <div role="radiogroup" aria-label="Sort coaches">
      {SORT_OPTIONS.map(option => {
        const selected = sortBy === option.value;
        return (
          <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => { haptic(8); setSortBy(option.value); setActiveSheet(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "12px", marginBottom: 8, background: selected ? C.brandTint : C.fog, border: "none", borderRadius: 14, cursor: "pointer" }}>
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
      </div>
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
        <button key={suburb} type="button" onClick={() => chooseLocation(suburb)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "8px 10px", marginBottom: 6, border: "none", borderRadius: 14, background: C.fog, color: C.jet, cursor: "pointer", textAlign: "left" }}>
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
          <Btn variant="outline" onClick={() => setFilterDraft({ ...DEFAULT_FILTERS, sports: [], areas: [] })}>Reset</Btn>
          <div style={{ flex: 1 }}><Btn full onClick={() => { haptic(12); setAppliedFilters(filterDraft); setActiveSheet(null); }}>Show {draftPreviewCount} result{draftPreviewCount === 1 ? "" : "s"}</Btn></div>
        </div>
      )}
    >
      <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.5, marginBottom: 20, ...fBody }}>Refine results without leaving Discover.</div>

      <button
        type="button"
        aria-pressed={!!filterDraft.favoritesOnly}
        onClick={() => updateDraft({ favoritesOnly: !filterDraft.favoritesOnly })}
        style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", marginBottom: 24, border: "none", borderRadius: 16, background: filterDraft.favoritesOnly ? C.brandTint : C.fog, color: C.jet, cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: C.white, flexShrink: 0 }}>
          <Heart size={17} color={filterDraft.favoritesOnly ? C.brand : C.slate} fill={filterDraft.favoritesOnly ? C.brand : "none"} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fBody }}>Favorites only</span>
          <span style={{ display: "block", marginTop: 2, fontSize: T.captionLg, color: C.slate, ...fBody }}>Show coaches you have saved</span>
        </span>
        <span aria-hidden="true" style={{ width: 42, height: 24, padding: 3, boxSizing: "border-box", borderRadius: 999, background: filterDraft.favoritesOnly ? C.brand : C.border, display: "flex", justifyContent: filterDraft.favoritesOnly ? "flex-end" : "flex-start", transition: "background .18s ease" }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, background: C.white }} />
        </span>
      </button>

      <SectionLabel>Sport</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {POPULAR_SPORTS.slice(0, 10).map((sport) => {
          const selected = filterDraft.sports?.includes(sport);
          return (
            <SportTile key={sport} sport={sport} selected={selected} onClick={() => updateDraft({ sports: selected ? filterDraft.sports.filter(x => x !== sport) : [...(filterDraft.sports || []), sport] })} />
          );
        })}
      </div>
      <div style={{ marginBottom: 24 }}>
        <SportSearchMultiSelect options={SPORT_NAMES} value={filterDraft.sports || []} onChange={(sports) => updateDraft({ sports })} placeholder="Search all sports…" />
      </div>

      <SectionLabel>Distance</SectionLabel>
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {[...NEARBY_RADIUS_PRESETS.map(km => ({ value: km, label: `Within ${km} km` })), { value: null, label: "Any distance" }].map((option) => {
          const selected = filterDraft.radiusKm === option.value;
          return (
            <button key={option.label} type="button" role="radio" aria-checked={selected} onClick={() => updateDraft({ radiusKm: option.value })} style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", border: "none", borderRadius: 13, background: selected ? C.brandTint : C.fog, color: C.jet, cursor: "pointer", textAlign: "left", fontSize: T.bodyLg, fontWeight: selected ? 700 : 500, ...fBody }}>
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
          return <button key={rating} type="button" role="radio" aria-checked={selected} onClick={() => updateDraft({ minRating: rating })} style={{ minHeight: 44, padding: "0 6px", border: "none", borderRadius: 10, background: selected ? C.white : "transparent", color: selected ? C.jet : C.slate, boxShadow: "none", cursor: "pointer", fontSize: T.labelLg, fontWeight: selected ? 700 : 500, ...fBody }}>{rating ? `${rating}+` : "Any"}</button>;
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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", background: C.white }}>
      <div
        ref={ptr.scrollRef}
        className="cl-hide-scrollbar"
        style={{
          flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", paddingBottom: 116,
          transform: `translateY(${ptr.pull}px)`, transition: ptr.pull ? "none" : "transform .3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{ position: "relative", padding: "18px 18px 42px" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, background: `radial-gradient(circle at 92% 8%, color-mix(in srgb, ${heroText} 16%, transparent) 0%, transparent 34%), ${heroBackground}`, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => setActiveSheet("location")} aria-label={`Change location, currently ${nearestLocationLabel}`} style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, padding: 0, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ width: 42, height: 42, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${heroText} 15%, transparent)`, color: heroText, flexShrink: 0 }}>
                {locating ? <Spinner size={17} color={heroText} /> : <MapPin size={19} />}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                  <span style={{ fontSize: T.title, fontWeight: 600, color: heroText, ...oneLine, ...fDisplay }}>{locating ? "Finding your location…" : nearestLocationLabel}</span>
                  <ChevronDown size={16} color={heroMuted} style={{ flexShrink: 0 }} />
                </span>
                <span style={{ display: "block", fontSize: T.captionLg, color: heroMuted, marginTop: 2, ...fBody }}>{permissionDenied && !manualLabel ? "Approximate area · tap to change" : "Tap to change location"}</span>
              </span>
            </button>
            <NotificationBellButton count={unreadCount} color={heroText} onClick={() => nav("notifications")} />
          </div>

          <div style={{ marginTop: 20, fontSize: T.displayLg, lineHeight: 1.12, fontWeight: 500, letterSpacing: "-0.5px", color: heroText, textWrap: "balance", ...fDisplay }}>Discover your next coach</div>
          <div style={{ marginTop: 6, fontSize: T.body, color: heroMuted, ...fBody }}>Trusted local experts for your goals.</div>

          <button
            type="button"
            aria-label="Search coaches, packages and sports"
            onClick={() => nav("client-search")}
            style={{
              width: "100%", minHeight: 50, marginTop: 16, display: "flex", alignItems: "center", gap: 10,
              border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 14, padding: "0 14px",
              cursor: "pointer", textAlign: "left", boxShadow: "0 1px 2px rgba(22,24,29,.04)",
            }}
          >
            <Search size={16} color={C.slateLight} aria-hidden="true" />
            <span style={{ flex: 1, minWidth: 0, fontSize: T.bodyLg, color: C.slateLight, ...fBody }}>Search coaches, packages or sports…</span>
            <ChevronRight size={16} color={C.slateLight} aria-hidden="true" />
          </button>

          <div style={{ margin: "14px -18px 0", padding: "0 18px", overflowX: "auto" }} className="cl-hide-scrollbar">
            <div style={{ display: "flex", gap: 8, width: "max-content", paddingBottom: 2 }}>
              <Chip
                compact
                active={!appliedFilters.sports?.length}
                onClick={() => { if (appliedFilters.sports?.length) { haptic(8); setAppliedFilters({ ...appliedFilters, sports: [] }); } }}
              >
                All sports
              </Chip>
              {POPULAR_SPORTS.slice(0, 8).map(sport => {
                const active = appliedFilters.sports?.includes(sport);
                return (
                  <Chip key={sport} compact active={active} onClick={() => toggleQuickSport(sport)}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <SportIcon sport={sport} size={13} color={active ? (C.brandIcon || C.brandColor) : C.slate} />
                      {sport}
                    </span>
                  </Chip>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: 0, zIndex: 30, marginTop: -28, padding: "0 18px 10px", background: `linear-gradient(to bottom, transparent 0 28px, ${C.white} 28px 100%)` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 8, padding: 6, borderRadius: 18, border: `1px solid ${C.border}`, background: C.white, boxShadow: "none" }}>
          <button type="button" onClick={() => setActiveSheet("sort")} style={{ minWidth: 0, minHeight: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 12px", borderRadius: 12, border: "none", background: C.fog, color: C.jet, cursor: "pointer", textAlign: "left" }}>
            <ArrowUpDown size={15} color={C.slate} aria-hidden="true" />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: T.caption, color: C.slate, ...fBody }}>Sort</span>
              <span style={{ display: "block", fontSize: T.labelLg, fontWeight: 700, ...oneLine, ...fBody }}>{SORT_OPTIONS.find(option => option.value === sortBy)?.label || "Recommended"}</span>
            </span>
            <ChevronDown size={13} color={C.slateLight} aria-hidden="true" />
          </button>
          <button type="button" aria-pressed={hasActiveFilters} onClick={openFilters} style={{ minWidth: 0, minHeight: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 12px", borderRadius: 12, border: "none", background: hasActiveFilters ? C.brandTint : C.fog, color: hasActiveFilters ? C.brand : C.jet, cursor: "pointer", textAlign: "left" }}>
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span style={{ flex: 1, fontSize: T.body, fontWeight: 700, ...fBody }}>Filters</span>
            {hasActiveFilters && <span aria-label={`${activeFilterCount} active filter categories`} style={{ minWidth: 22, height: 22, padding: "0 6px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: C.brand, color: C.white, fontSize: T.caption, fontWeight: 800, ...fBody }}>{activeFilterCount}</span>}
          </button>
          </div>
        </div>

        <div style={{ padding: "16px 18px 0" }}>
          {hasActiveFilters && (
            <section aria-label="Applied filters" style={{ marginBottom: 18, animation: "clFadeUp .28s cubic-bezier(.22,1,.36,1)" }}>
              <div aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 58, padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 16, background: C.brandTint, boxShadow: "0 1px 2px rgba(22,24,29,.04)" }}>
                <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: C.white }}>
                  <CheckCircle2 size={18} color={C.brand} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>
                    {listLoading ? "Updating matches…" : `${filtered.length} coach${filtered.length === 1 ? "" : "es"} match`}
                  </span>
                  <span style={{ display: "block", marginTop: 2, fontSize: T.captionLg, color: C.slate, ...fBody }}>
                    {activeFilterCount} filter {activeFilterCount === 1 ? "is" : "categories are"} shaping these results
                  </span>
                </span>
                <button type="button" onClick={() => setAppliedFilters(DEFAULT_FILTERS)} style={{ minWidth: 64, minHeight: 44, padding: "0 8px", border: "none", borderRadius: 12, background: "transparent", color: C.brand, cursor: "pointer", fontSize: T.labelLg, fontWeight: 700, ...fBody }}>
                  Clear all
                </button>
              </div>

              <div className="cl-hide-scrollbar" style={{ display: "flex", gap: 7, margin: "6px -18px 0", padding: "0 18px", overflowX: "auto", scrollSnapType: "x proximity" }}>
                {appliedFilterTokens.map(token => (
                  <button
                    key={token.key}
                    type="button"
                    aria-label={`Remove ${token.label} filter`}
                    onClick={token.remove}
                    style={{ minHeight: 44, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 10px", border: `1px solid ${C.border}`, borderRadius: 999, background: C.white, color: C.jet, cursor: "pointer", scrollSnapAlign: "start", fontSize: T.labelLg, fontWeight: 600, ...fBody }}
                  >
                    {token.icon}
                    <span>{token.label}</span>
                    <X size={13} color={C.slateLight} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {!hasActiveFilters && (
            <PromoBannerCarousel
              banners={PROMO_BANNERS}
              onSelectBanner={handleBannerSelect}
            />
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>
                {appliedFilters.favoritesOnly ? <><Heart size={15} color={C.brand} fill={C.brand} /> Saved coaches</> : hasActiveFilters ? <><SlidersHorizontal size={15} color={C.brand} /> Filtered coaches</> : <><Navigation size={15} color={C.brand} /> Coaches near you</>}
              </div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...oneLine, ...fBody }}>
                <span key={filtered.length} style={{ display: "inline-block", fontWeight: 700, animation: "clScaleIn .28s cubic-bezier(.22,1,.36,1)" }}>{filtered.length}</span>
                {" "}match{filtered.length === 1 ? "" : "es"} near {nearestLocationLabel}
              </div>
            </div>
          </div>

          {listLoading ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <StatusBanner state="noResults" style={{ marginTop: 10 }} onPrimary={() => setAppliedFilters(DEFAULT_FILTERS)} onSecondary={() => setAppliedFilters({ ...appliedFilters, radiusKm: CUSTOM_RADIUS_MAX_KM })} secondaryLabel="Browse all coaches" />
          ) : (
            <div className="cl-stagger">{filtered.map((c, i) => (
              <CoachListCard
                key={c.id}
                coach={c}
                unavailable={c.id === LIVE_AVAILABILITY_COACH_ID && !coachAvailableNow}
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                onOpen={() => nav("coach-profile", { id: c.id })}
              />
            ))}</div>
          )}
        </div>
      </div>

      <div aria-live="polite" style={{ position: "absolute", top: 10, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 45 }}>
        <div
          style={{
            display: ptr.refreshing || ptr.pull > 8 ? "flex" : "none", alignItems: "center", gap: 7, padding: "7px 13px",
            borderRadius: 999, background: C.jet, color: C.white, fontSize: T.captionLg, fontWeight: 600, ...fBody,
            boxShadow: "0 8px 20px rgba(0,0,0,.18)",
            opacity: ptr.refreshing ? 1 : (ptr.pull / PTR_THRESHOLD) * 0.94,
            transform: `translateY(${ptr.refreshing ? 0 : -4 + Math.min(ptr.pull / PTR_THRESHOLD, 1) * 4}px)`,
            transition: "opacity .18s ease, transform .18s ease",
          }}
        >
          {ptr.refreshing
            ? <Spinner size={13} color={C.white} />
            : <ArrowDown size={13} style={{ transform: ptrReady ? "rotate(180deg)" : "none", transition: "transform .18s ease" }} />}
          {ptr.refreshing ? "Refreshing…" : ptrReady ? "Release to refresh" : "Pull to refresh"}
        </div>
      </div>

      {sortSheet}
      {locationSheet}
      {filterSheet}

      {!mapOpen && (
        <button
          type="button"
          aria-label="Open coach map"
          onClick={() => setMapOpen(true)}
          style={{ position: "absolute", right: 18, bottom: 92, zIndex: 34, width: 52, height: 52, borderRadius: 18, border: "none", background: C.jet, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "none" }}
        >
          <MapIcon size={21} aria-hidden="true" />
        </button>
      )}

      {mapOpen && (
        <CoachMapView
          coaches={filtered}
          radiusKm={radiusKm}
          activeFilterCount={activeFilterCount}
          onOpenFilters={openFilters}
          onOpen={id => nav("coach-profile", { id, returnToMap: true })}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
