import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Heart, Share2, Star, ShieldCheck, BadgeCheck, Play, MessageCircle, CheckCircle2, Check, Trophy,
  Clock, TrendingUp, Repeat, MapPin, Navigation, Award, Users, XCircle, Sunrise, Sun, Moon,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES, REVIEWS, SPORT_ICON } from "../../data/mockData";
import { Avatar, BackButton, Badge, SegTabs, SectionLabel, Card, Btn, StarRow, HandleTag } from "../../components/ui/Primitives";
import { getPublicName } from "../../utils/name";
import { StatusBanner } from "../../systems/StateSystem";
import { useReviewActions } from "../../systems/ReviewsSystem";
import {
  buildMonthGrid, sameDay, dayAvailability, slotsForDate, groupSlotsByPeriod, formatTimeRange12, formatFullDateFromDate,
} from "./Booking";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PERIOD_ICONS = { Morning: Sunrise, Afternoon: Sun, Evening: Moon };

// Packages don't carry their own schedule in the mock data model — only the
// coach does. To let the calendar genuinely narrow when a package is picked,
// derive a deterministic (stable, package-specific) subset of the coach's
// weekly availability from the package id, instead of just reusing the same
// coach-wide schedule for every package.
function derivePackageAvailability(coach, pkg) {
  const base = coach.availability || {};
  if (!pkg) return base;
  const seed = pkg.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const out = {};
  Object.entries(base).forEach(([day, slots], di) => {
    const kept = slots.filter((_, i) => (seed + di * 3 + i) % 2 === 0);
    if (kept.length) out[day] = kept;
  });
  return out;
}

const LIVE_AVAILABILITY_COACH_ID = "c2";

export function CoverBanner({ sport, height = 150 }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const Icon = SPORT_ICON[sport] || Trophy;
  return (
    <div style={{ height, position: "relative", flexShrink: 0, overflow: "hidden", background: `linear-gradient(145deg, ${CL.jet} 0%, ${CL.jetSoft} 55%, ${CL.slate} 100%)` }}>
      {/* soft light wash for photographic depth */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,.10), transparent 55%)" }} />
      {/* signature angled accent, echoing the logo flag */}
      <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 100, background: C.brand, opacity: 0.9, transform: "rotate(-18deg)", clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)" }} />
      <div style={{ position: "absolute", top: -30, right: 40, width: 90, height: 100, background: CL.jet, opacity: 0.55, transform: "rotate(-18deg)", clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)" }} />
      {/* oversized watermark icon for a sport-specific "stock photo" feel */}
      <Icon size={140} color={CL.white} strokeWidth={1.1} style={{ position: "absolute", bottom: -30, left: -20, opacity: 0.14, transform: "rotate(-8deg)" }} />
    </div>
  );
}

export function ScreenCoachProfile({ nav, goBack, params = {}, favorites = [], toggleFav, coachAvailableNow }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const coach = COACHES.find((c) => c.id === (params?.id)) || COACHES[0];
  const pub = getPublicName(coach, "public");
  const { getReply } = useReviewActions();
  const [tab, setTab] = useState("about");
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [pkgCursor, setPkgCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [pkgSelectedDate, setPkgSelectedDate] = useState(null);
  const [pkgSelectedTime, setPkgSelectedTime] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;
  const reviewPageCount = Math.max(1, Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE));
  const pagedReviews = REVIEWS.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);
  useEffect(() => { setReviewPage(1); }, [tab, coach.id]);
  const selectedPkg = coach.packages.find((p) => p.id === selectedPkgId) || null;
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const fav = safeFavorites.includes(coach.id);
  const unavailable = coach.id === LIVE_AVAILABILITY_COACH_ID && coachAvailableNow === false;

  // Calendar + slots reflect the selected package's derived availability, or
  // the coach's overall (all-packages) availability when none is picked yet
  // — package-led (pick a package, see when it's on) and date-led (pick a
  // date, then see which packages are running) both work off this same state.
  const pkgAvailability = useMemo(() => derivePackageAvailability(coach, selectedPkg), [coach, selectedPkg]);
  const pkgWeeks = useMemo(() => buildMonthGrid(pkgCursor), [pkgCursor]);
  const pkgMonthLabel = pkgCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const pkgToday = new Date();
  const pkgIsCurrentMonth = pkgCursor.getFullYear() === pkgToday.getFullYear() && pkgCursor.getMonth() === pkgToday.getMonth();
  const pkgGoPrevMonth = () => { if (!pkgIsCurrentMonth) setPkgCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1)); };
  const pkgGoNextMonth = () => setPkgCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const pkgPickDate = (d, state) => {
    if (state === "unavailable") return;
    setPkgSelectedDate((prev) => (prev && sameDay(prev, d) ? null : d));
    setPkgSelectedTime(null);
  };
  const pkgDaySlots = pkgSelectedDate ? slotsForDate(pkgSelectedDate, coach, pkgAvailability) : [];
  const pkgGrouped = groupSlotsByPeriod(pkgDaySlots);
  const pkgSlotDuration = (selectedPkg && selectedPkg.duration) || (coach.packages[0] && coach.packages[0].duration);

  // Keep all packages visible so user can see all options; incompatible packages are shown in disabled state
  const packagesToShow = coach.packages;

  // Auto-select compatible package if date + time selection leaves exactly 1 compatible option
  useEffect(() => {
    if (pkgSelectedDate && pkgSelectedTime) {
      const compatible = coach.packages.filter((p) => (
        p.active !== false && slotsForDate(pkgSelectedDate, coach, derivePackageAvailability(coach, p)).includes(pkgSelectedTime)
      ));
      if (compatible.length === 1 && selectedPkgId !== compatible[0].id) {
        setSelectedPkgId(compatible[0].id);
      } else if (selectedPkgId && !compatible.some((p) => p.id === selectedPkgId)) {
        setSelectedPkgId(null);
      }
    }
  }, [pkgSelectedDate, pkgSelectedTime, coach]);

  // If picking a package makes the currently-selected date/time invalid for
  // it, clear them rather than silently showing a stale selection.
  useEffect(() => {
    if (!pkgSelectedDate) return;
    if (dayAvailability(pkgSelectedDate, coach, pkgAvailability) === "unavailable") {
      setPkgSelectedDate(null); setPkgSelectedTime(null);
    } else if (pkgSelectedTime && !pkgDaySlots.includes(pkgSelectedTime)) {
      setPkgSelectedTime(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPkgId]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Banner + avatar now scroll away with the rest of the profile instead
          of staying pinned at the top — they live inside the same scroll
          container as everything below them. */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }} className="cl-hide-scrollbar">
        <CoverBanner sport={coach.sport} height={150} />
        <div style={{ height: 150, position: "relative", marginTop: -150, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 16, left: 16, pointerEvents: "auto" }}>
            <BackButton floating onClick={() => goBack("client-home")} />
          </div>
          <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8, pointerEvents: "auto" }}>
            <button type="button" aria-label={fav ? "Remove coach from favourites" : "Add coach to favourites"} onClick={() => toggleFav(coach.id)} style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.18)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Heart size={16} color={CL.white} fill={fav ? C.brand : "none"} />
            </button>
            <button type="button" aria-label="Share coach profile" style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.18)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Share2 size={15} color={CL.white} />
            </button>
          </div>
          <div style={{ position: "absolute", bottom: -34, left: 20, zIndex: 5, pointerEvents: "auto" }}>
            <Avatar name={pub.name} size={68} ring />
          </div>
        </div>

        <div style={{ padding: "0 18px" }}>
        <div style={{ height: 40 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: T.headingLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{pub.name}</div>
            <HandleTag handle={pub.handle} size={12.5} color={C.slateLight} />
            <div style={{ fontSize: T.body, color: C.slate, ...fBody }}>{coach.sport} · {coach.suburb}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: C.jet, ...fBody }}>
              <Star size={14} fill={C.brand} color={C.brand} /> {coach.rating}
            </div>
            <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{coach.reviews} reviews</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {coach.verified.identity && <Badge tone="success" icon={ShieldCheck}>ID verified</Badge>}
          {coach.verified.wwcc && <Badge tone="success" icon={ShieldCheck}>WWCC verified</Badge>}
          {coach.verified.quals && <Badge tone="success" icon={BadgeCheck}>Qualifications checked</Badge>}
        </div>

        {unavailable && (
          <div style={{ marginTop: 14 }}>
            <StatusBanner
              state="coachUnavailable"
              onPrimary={() => nav("chat-thread", { name: coach.name, handle: coach.handle })}
              primaryLabel="Notify me when available"
              onSecondary={() => nav("chat-thread", { name: coach.name, handle: coach.handle })}
              secondaryLabel="Message coach"
            />
          </div>
        )}

        {/* Compact stats strip — label sits below the value in each tile (not
            beside it) so nothing truncates, while three equal-width tiles
            keep the whole strip short and secondary to the tabs below. */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[
            { icon: Clock, label: "Response", value: coach.responseTime.replace("Usually replies within ", "") },
            { icon: TrendingUp, label: "Acceptance", value: `${coach.acceptanceRate}%` },
            { icon: Repeat, label: "Repeat clients", value: `${coach.repeatClientRate}%` },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0, background: C.fog, borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <s.icon size={11} color={C.brand} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: T.caption, fontWeight: 700, color: C.jet, ...fBody }}>{s.value}</span>
              </div>
              <div style={{ fontSize: T.tiny, color: C.slate, marginTop: 3, lineHeight: 1.25, ...fBody }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <SegTabs value={tab} onChange={setTab} items={[
            { value: "about", label: "About" }, { value: "reels", label: "Reels" },
            { value: "packages", label: "Packages" }, { value: "reviews", label: "Reviews" },
          ]} />
        </div>

        {tab === "about" && (
          <div style={{ marginTop: 16 }}>
            <SectionLabel>Bio</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>{coach.bio}</p>
            <SectionLabel>Coaching style</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>{coach.style}</p>
            <SectionLabel>Experience</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, marginBottom: 16, ...fBody }}>{coach.experience}</p>

            <SectionLabel>Location & travel</SectionLabel>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <MapPin size={15} color={C.brand} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{coach.venue}</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>{coach.suburb}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Navigation size={15} color={C.brand} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Travels up to {coach.travelRadiusKm}km</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>
                    {coach.willingToTravel ? "Willing to travel to your location" : "In-venue sessions only — travel not offered"}
                  </div>
                </div>
              </div>
            </Card>

            <SectionLabel>Qualifications</SectionLabel>
            <Card style={{ marginBottom: 16 }}>
              {coach.qualifications.map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i === coach.qualifications.length - 1 ? "none" : `1px solid ${C.border}` }}>
                  <Award size={14} color={C.success} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: T.body, color: C.jet, ...fBody }}>{q}</span>
                </div>
              ))}
            </Card>

            <SectionLabel>Cancellation policy</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, marginBottom: 6, ...fBody }}>{coach.cancellationPolicy}</p>
          </div>
        )}

        {tab === "reels" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
            {Array.from({ length: coach.reelsCount }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "3/4", borderRadius: 14, background: `linear-gradient(160deg, ${C.jetSoft}, ${C.jet})`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={14} color={C.white} fill={C.white} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "packages" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, marginBottom: 14, ...fBody }}>
              {selectedPkg
                ? `Showing availability for ${selectedPkg.name}. Clear it below to see everything this coach offers.`
                : "Browse the calendar to see this coach's overall availability, or pick a package below to narrow it down."}
            </div>

            {/* Calendar — overall availability by default, narrows to the
                selected package's availability once one is chosen. */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <button type="button" aria-label="Previous month" onClick={pkgGoPrevMonth} disabled={pkgIsCurrentMonth} style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: pkgIsCurrentMonth ? "default" : "pointer", opacity: pkgIsCurrentMonth ? 0.4 : 1 }}>
                  <ChevronLeft size={15} color={C.jet} />
                </button>
                <span style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{pkgMonthLabel}</span>
                <button type="button" aria-label="Next month" onClick={pkgGoNextMonth} style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronRight size={15} color={C.jet} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
                {WEEKDAY_HEADERS.map((d) => (
                  <div key={d} style={{ textAlign: "center", fontSize: T.micro, fontWeight: 700, color: C.slateLight, ...fBody }}>{d}</div>
                ))}
              </div>

              {pkgWeeks.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                  {row.map((d, di) => {
                    const inRange = d.getMonth() === pkgCursor.getMonth();
                    const state = dayAvailability(d, coach, pkgAvailability);
                    const isSelected = sameDay(d, pkgSelectedDate);
                    const isToday = sameDay(d, pkgToday);
                    const disabled = !inRange || state === "unavailable";

                    let background = C.white;
                    let border = C.border;
                    let color = C.jet;
                    if ((state === "available" || state === "limited") && inRange) { border = C.brand; }
                    if (disabled) { color = C.slateLight; }
                    // Today gets its own green border so it stands out from the
                    // regular available/unavailable states on the calendar.
                    if (isToday && inRange && !isSelected) { border = C.success; }
                    if (isSelected) { background = C.brand; border = C.brand; color = C.white; }

                    return (
                      <button
                        key={di}
                        onClick={() => pkgPickDate(d, state)}
                        disabled={disabled}
                        style={{
                          aspectRatio: "1", borderRadius: 10, position: "relative",
                          border: `1.5px solid ${border}`, background,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: inRange ? 1 : 0.3,
                          cursor: disabled ? "not-allowed" : "pointer",
                          boxSizing: "border-box",
                        }}
                      >
                        <span style={{ fontSize: T.label, fontWeight: isSelected || isToday ? 700 : 500, color, ...fBody }}>{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              ))}

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.tiny, color: C.slate, ...fBody }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, border: `1.5px solid ${C.brand}` }} /> Available
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.tiny, color: C.slate, ...fBody }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: C.fog, border: `1.5px solid ${C.border}` }} /> Unavailable
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.tiny, color: C.slate, ...fBody }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: C.brand }} /> Selected
                </span>
              </div>
            </Card>

            {pkgSelectedDate && (
              <div style={{ marginBottom: 16 }}>
                <SectionLabel>Available times</SectionLabel>
                <div style={{ fontSize: T.label, color: C.slate, marginBottom: 12, ...fBody }}>
                  {formatFullDateFromDate(pkgSelectedDate)} · {selectedPkg ? selectedPkg.name : "All packages"}
                </div>
                {pkgDaySlots.length === 0 ? (
                  <Card style={{ textAlign: "center" }}>
                    <span style={{ fontSize: T.labelLg, color: C.slate, ...fBody }}>No time slots available on this day.</span>
                  </Card>
                ) : (
                  ["Morning", "Afternoon", "Evening"].filter((p) => pkgGrouped[p].length > 0).map((period) => {
                    const PeriodIcon = PERIOD_ICONS[period];
                    return (
                      <div key={period} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <PeriodIcon size={13} color={C.slateLight} />
                          <span style={{ fontSize: T.captionLg, fontWeight: 700, color: C.slate, ...fBody }}>{period}</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {pkgGrouped[period].map((t) => {
                            const active = pkgSelectedTime === t;
                            return (
                              <button
                                key={t}
                                onClick={() => setPkgSelectedTime((prev) => (prev === t ? null : t))}
                                style={{
                                  padding: "9px 14px", borderRadius: 999, border: `1.5px solid ${active ? (C.brandIcon || C.brandColor || C.brand) : C.border}`,
                                  background: active ? (C.brandIcon || C.brandColor || C.brand) : C.white, color: active ? C.white : C.jet,
                                  fontSize: T.labelLg, fontWeight: 600, cursor: "pointer", ...fBody,
                                  boxShadow: active ? "0 2px 8px rgba(27, 94, 32, 0.2)" : "none",
                                  transition: "background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease",
                                }}
                              >
                                {formatTimeRange12(t, pkgSlotDuration)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <SectionLabel>Packages</SectionLabel>

            <div className="cl-stagger">
            {coach.packages.map((p, i) => {
              const selected = selectedPkgId === p.id;
              const isInactive = p.active === false;
              const isTimeIncompatible = Boolean(
                pkgSelectedDate && pkgSelectedTime &&
                !slotsForDate(pkgSelectedDate, coach, derivePackageAvailability(coach, p)).includes(pkgSelectedTime)
              );
              const pkgDisabled = isInactive || isTimeIncompatible;

              return (
                <Card
                  key={p.id}
                  onClick={pkgDisabled ? undefined : () => setSelectedPkgId((id) => (id === p.id ? null : p.id))}
                  style={{
                    marginBottom: 12,
                    border: selected
                      ? `2px solid ${C.brandIcon || C.brandColor || C.brand}`
                      : `1.5px solid ${C.border}`,
                    background: selected
                      ? C.brandTint
                      : pkgDisabled
                      ? C.fog
                      : C.white,
                    opacity: pkgDisabled ? 0.55 : 1,
                    cursor: pkgDisabled ? "not-allowed" : "pointer",
                    boxShadow: selected ? "0 4px 14px rgba(27, 94, 32, 0.12)" : "none",
                    position: "relative",
                    transition: "background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease",
                    padding: 16,
                    animationDelay: `${Math.min(i, 8) * 45}ms`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: T.subtitle, color: selected ? (C.brandIcon || C.brandColor || C.brand) : C.jet, ...fDisplay }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: T.label, color: C.slate, marginTop: 3, ...fBody }}>
                        {p.type} · {p.duration} min · {p.mode}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                        <Users size={11.5} color={C.slateLight} />
                        <span style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>
                          {p.maxParticipants ? `Up to ${p.maxParticipants} participant${p.maxParticipants > 1 ? "s" : ""}` : "1 participant"}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <div style={{ fontSize: T.title, fontWeight: 700, color: selected ? (C.brandIcon || C.brandColor || C.brand) : C.jet, ...fDisplay }}>
                        ${p.price}
                      </div>
                      {selected && (
                        <div
                          style={{
                            marginTop: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: 99,
                            background: C.brandIcon || C.brandColor || C.brand,
                          }}
                        >
                          <Check size={13} color={C.white} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>

                  {pkgDisabled && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                      <XCircle size={13} color={C.slateLight} />
                      <span style={{ fontSize: T.label, fontWeight: 600, color: C.slateLight, ...fBody }}>
                        {isInactive ? "Currently unavailable" : "Not available at selected time"}
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ marginTop: 16 }}>
            <div className="cl-stagger">
            {pagedReviews.map((r, i) => {
              const reply = getReply(r.id);
              return (
                <Card key={r.id} style={{ marginBottom: 10, animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={r.name} size={30} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{r.name}</span>
                          {r.handle && <HandleTag handle={r.handle} size={10.5} color={C.slateLight} />}
                        </div>
                        <div style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{r.date}</div>
                      </div>
                    </div>
                    <StarRow value={r.rating} />
                  </div>
                  <p style={{ fontSize: T.body, color: C.slate, marginTop: 8, lineHeight: 1.55, ...fBody }}>{r.text}</p>
                  {r.verified && <Badge tone="neutral" icon={CheckCircle2}>Verified booking</Badge>}
                  {reply && (
                    <div style={{ marginTop: 10, background: C.fog, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: T.caption, fontWeight: 700, color: C.brand, ...fBody }}>Reply from {pub.name}</div>
                      <p style={{ fontSize: T.labelLg, color: C.jet, marginTop: 3, lineHeight: 1.5, ...fBody }}>{reply.text}</p>
                    </div>
                  )}
                </Card>
              );
            })}
            </div>

            {reviewPageCount > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 8 }}>
                <button
                  type="button"
                  aria-label="Previous reviews page"
                  onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                  disabled={reviewPage === 1}
                  style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: reviewPage === 1 ? "default" : "pointer", opacity: reviewPage === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={15} color={C.jet} />
                </button>
                <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.slate, ...fBody }}>
                  Page {reviewPage} of {reviewPageCount}
                </span>
                <button
                  type="button"
                  aria-label="Next reviews page"
                  onClick={() => setReviewPage((p) => Math.min(reviewPageCount, p + 1))}
                  disabled={reviewPage === reviewPageCount}
                  style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: reviewPage === reviewPageCount ? "default" : "pointer", opacity: reviewPage === reviewPageCount ? 0.4 : 1 }}
                >
                  <ChevronRight size={15} color={C.jet} />
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "14px 18px", paddingBottom: "max(28px, env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
        {unavailable ? (
          <div style={{ flex: 1 }}>
            <Btn full disabled variant="secondary">Unavailable for new bookings</Btn>
          </div>
        ) : selectedPkg ? (
          <>
            <div>
              <div style={{ fontSize: T.titleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>${selectedPkg.price}</div>
              <div style={{ fontSize: T.caption, color: C.slate, maxWidth: 120, ...fBody }}>
                {pkgSelectedDate && pkgSelectedTime
                  ? `${selectedPkg.name} · ${formatTimeRange12(pkgSelectedTime, selectedPkg.duration)}`
                  : selectedPkg.name}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Btn
                full
                onClick={() => nav("package-detail", {
                  coachId: coach.id,
                  packageId: selectedPkg.id,
                  presetDate: pkgSelectedDate && pkgSelectedTime ? pkgSelectedDate.toISOString() : undefined,
                  presetTime: pkgSelectedDate && pkgSelectedTime ? pkgSelectedTime : undefined,
                })}
              >
                {pkgSelectedDate && pkgSelectedTime ? "Continue" : "View package"}
              </Btn>
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <Btn full onClick={() => setTab("packages")}>Select a service</Btn>
          </div>
        )}
        <button type="button" aria-label={`Message ${pub.name}`} onClick={() => nav("chat-thread", { name: coach.name, handle: coach.handle })} style={{ width: 46, height: 46, borderRadius: 14, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <MessageCircle size={18} color={C.jet} />
        </button>
      </div>
    </div>
  );
}
