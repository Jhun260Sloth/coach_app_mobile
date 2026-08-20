import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Heart, Share2, Play, MessageCircle, Check, CheckCircle2,
  Users, XCircle, Sunrise, Sun, Moon,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES, REVIEWS } from "../../data/mockData";
import { getCoachMedia } from "../../data/media";
import { Avatar, BackButton, Badge, SegTabs, SectionLabel, Card, Btn, StarRow, HandleTag, FullscreenImageViewer } from "../../components/ui/Primitives";
import { CoachProfileHero, CoachProfileAbout } from "../../components/ui/CoachProfileSections";
import { getPublicName } from "../../utils/name";
import { availabilityBlocksToWeekly } from "../../utils/coachProfile";
import { StatusBanner } from "../../systems/StateSystem";
import { useReviewActions } from "../../systems/ReviewsSystem";
import {
  buildMonthGrid, sameDay, dayAvailability, slotsForDate, groupSlotsByPeriod, formatTimeRange12, formatFullDateFromDate,
} from "./Booking";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PERIOD_ICONS = { Morning: Sunrise, Afternoon: Sun, Evening: Moon };

const LIVE_AVAILABILITY_COACH_ID = "c2";

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

export function ScreenCoachProfile({ nav, goBack, params = {}, favorites = [], toggleFav, coachAvailableNow }) {
  const { darkMode, coachMedia, coachProfile, coachPackages, availabilityBlocks, toast } = useApp();
  const C = darkMode ? CD : CL;
  const listedCoach = COACHES.find((c) => c.id === (params?.id)) || COACHES[0];
  const coach = listedCoach.id === COACHES[1].id ? coachProfile : listedCoach;
  const media = coach.id === COACHES[1].id ? coachMedia : getCoachMedia(coach.id);
  const pub = getPublicName(coach, "public");
  const { getReply } = useReviewActions();
  const [tab, setTab] = useState("about");
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [pkgCursor, setPkgCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [pkgSelectedDate, setPkgSelectedDate] = useState(null);
  const [pkgSelectedTime, setPkgSelectedTime] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const REVIEWS_PER_PAGE = 5;
  const reviewPageCount = Math.max(1, Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE));
  const pagedReviews = REVIEWS.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);
  useEffect(() => { setReviewPage(1); }, [tab, coach.id]);
  const selectedPkg = coach.packages.find((p) => p.id === selectedPkgId) || null;
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const fav = safeFavorites.includes(coach.id);
  const heroImage = coach.coverPhoto || media.find((item) => item.type === "photo")?.url;
  const unavailable = coach.id === LIVE_AVAILABILITY_COACH_ID && coachAvailableNow === false;
  const handleFavourite = () => {
    toggleFav?.(coach.id);
    toast?.(fav ? "Removed from saved coaches" : "Coach saved to favourites");
  };
  const handleShare = () => toast?.("Profile link ready to share");

  // Calendar + slots reflect the selected package's derived availability, or
  // the coach's overall (all-packages) availability when none is picked yet
  // — package-led (pick a package, see when it's on) and date-led (pick a
  // date, then see which packages are running) both work off this same state.
  const isCurrentCoach = coach.id === COACHES[1].id;
  const pkgAvailability = useMemo(() => (
    isCurrentCoach && availabilityBlocks?.length
      ? availabilityBlocksToWeekly(availabilityBlocks, selectedPkg, coachPackages)
      : derivePackageAvailability(coach, selectedPkg)
  ), [availabilityBlocks, coachPackages, coach, isCurrentCoach, selectedPkg]);
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
        p.active !== false && slotsForDate(pkgSelectedDate, coach, isCurrentCoach && availabilityBlocks?.length
          ? availabilityBlocksToWeekly(availabilityBlocks, p, coachPackages)
          : derivePackageAvailability(coach, p)).includes(pkgSelectedTime)
      ));
      if (compatible.length === 1 && selectedPkgId !== compatible[0].id) {
        setSelectedPkgId(compatible[0].id);
      } else if (selectedPkgId && !compatible.some((p) => p.id === selectedPkgId)) {
        setSelectedPkgId(null);
      }
    }
  }, [pkgSelectedDate, pkgSelectedTime, coach, isCurrentCoach, availabilityBlocks, coachPackages]);

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
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }} className="cl-hide-scrollbar">
        <div style={{ position: "relative" }}>
          <CoachProfileHero
            coach={coach}
            pub={pub}
            heroImage={heroImage}
            avatarSrc={coach.avatar}
            instantBook={coach.instantBook}
            coverHeight={188}
            onAvatarClick={() => setAvatarOpen(true)}
            overlay={
              <>
                <div style={{ position: "absolute", top: 12, left: 12, pointerEvents: "auto" }}>
                  <BackButton floating onClick={() => goBack("client-home")} />
                </div>
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, pointerEvents: "auto" }}>
                  <button type="button" aria-label={fav ? "Remove coach from favourites" : "Add coach to favourites"} aria-pressed={fav} onClick={handleFavourite} style={{ width: 44, height: 44, borderRadius: 99, background: fav ? C.brand : CL.jetSoft, opacity: 0.94, border: `1px solid ${CL.onDarkDivider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,.18)" }}>
                    <Heart size={18} color={CL.white} fill={fav ? CL.white : "none"} />
                  </button>
                  <button type="button" aria-label="Share coach profile" onClick={handleShare} style={{ width: 44, height: 44, borderRadius: 99, background: CL.jetSoft, opacity: 0.94, border: `1px solid ${CL.onDarkDivider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,.18)" }}>
                    <Share2 size={18} color={CL.white} />
                  </button>
                </div>
              </>
            }
          />
        </div>

        <div style={{ padding: "0 18px" }}>

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

        <div style={{ marginTop: 14 }}>
          <SegTabs value={tab} onChange={setTab} items={[
            { value: "about", label: "About" }, { value: "reels", label: "Reels" },
            { value: "packages", label: "Packages" }, { value: "reviews", label: "Reviews" },
          ]} />
        </div>

        {tab === "about" && (
          <div style={{ marginTop: 16 }}>
            <CoachProfileAbout coach={coach} />
          </div>
        )}

        {tab === "reels" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, marginBottom: 12, ...fBody }}>A look inside {pub.name}'s coaching sessions.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {media.map((item) => (
                <button key={item.id} type="button" aria-label={`Open ${item.caption}`} onClick={() => nav("coach-media", { coachId: coach.id, mediaId: item.id })} style={{ aspectRatio: "3/4", padding: 0, overflow: "hidden", borderRadius: 14, border: `1px solid ${C.border}`, background: C.fog, position: "relative", cursor: "pointer" }}>
                  {item.type === "reel" ? (
                    <video src={item.url} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <img src={item.url} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,.56))" }} />
                  {item.type === "reel" && <span style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 99, background: "rgba(22,24,29,.60)", display: "flex", alignItems: "center", justifyContent: "center" }}><Play size={13} color={C.white} fill={C.white} /></span>}
                  <span style={{ position: "absolute", left: 9, right: 9, bottom: 9, textAlign: "left", color: C.white, fontSize: T.caption, fontWeight: 600, lineHeight: 1.25, ...fBody }}>{item.caption}</span>
                </button>
              ))}
            </div>
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
                !slotsForDate(pkgSelectedDate, coach, isCurrentCoach && availabilityBlocks?.length
                  ? availabilityBlocksToWeekly(availabilityBlocks, p, coachPackages)
                  : derivePackageAvailability(coach, p)).includes(pkgSelectedTime)
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
                        {p.packageType || p.type} · {p.duration || p.durationMinutes} min · {p.mode || p.locationType || "In-person"}
                      </div>
                      {p.description && (
                        <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.45, marginTop: 6, ...fBody }}>
                          {p.description}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                        <Users size={11.5} color={C.slateLight} />
                        <span style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>
                          {p.maxParticipants ? `Up to ${p.maxParticipants} participant${p.maxParticipants > 1 ? "s" : ""}` : "1 participant"}
                        </span>
                      </div>
                      {p.equipment && (
                        <div style={{ fontSize: T.caption, color: C.slateLight, marginTop: 5, ...fBody }}>Bring: {p.equipment}</div>
                      )}
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

      <FullscreenImageViewer open={avatarOpen} onClose={() => setAvatarOpen(false)} src={coach.avatar} alt={`${pub.name} profile photo`} />
    </div>
  );
}
