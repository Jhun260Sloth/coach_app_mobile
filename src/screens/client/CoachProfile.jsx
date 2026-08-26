import React, { useState, useEffect, useMemo } from "react";
import { haptic } from "../../utils/haptics";
import {
  ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock,
  Heart, MapPin, MessageCircle, Play, Share2, ShieldCheck,
  Sparkles, Users, Wrench, CheckCircle2, Star,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES, REVIEWS } from "../../data/mockData";
import { getCoachMedia } from "../../data/media";
import {
  Avatar, BackButton, Badge, BottomSheet, SegTabs, SectionLabel, Card, Btn,
  HandleTag, FullscreenImageViewer, StepProgress,
} from "../../components/ui/Primitives";
import { CoachProfileHero, CoachProfileAbout } from "../../components/ui/CoachProfileSections";
import { SportIcon } from "../../components/ui/SportUI";
import { getPublicName } from "../../utils/name";
import { availabilityBlocksToWeekly } from "../../utils/coachProfile";
import { StatusBanner } from "../../systems/StateSystem";
import { useReviewActions } from "../../systems/ReviewsSystem";
import {
  buildMonthGrid, sameDay, dayAvailability, slotsForDate, groupSlotsByPeriod, formatTimeRange12, formatFullDateFromDate,
} from "./Booking";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_PERIODS = ["Morning", "Afternoon", "Evening"];

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

function packageLocation(pkg, coach) {
  if ((pkg.mode || pkg.locationType) === "Online") return "Online";
  if ((pkg.mode || pkg.locationType) === "Come to You") return pkg.location || "Your preferred location";
  return pkg.venue || pkg.location || coach.venue || "Venue confirmed after booking";
}

function PackageMetric({ icon: Icon, label, value, C }) {
  return (
    <div style={{ minWidth: 0, padding: "12px 10px", borderRadius: 14, background: C.fog, border: `1px solid ${C.border}` }}>
      <Icon size={15} color={C.brand} aria-hidden="true" />
      <div style={{ fontSize: T.tiny, color: C.slateLight, marginTop: 8, ...fBody }}>{label}</div>
      <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginTop: 2, lineHeight: 1.35, ...fBody }}>{value}</div>
    </div>
  );
}

function PackageBookingSheet({
  open, onClose, onComplete, pkg, coach, liveAvailability, coachPackages,
  initialStep = 1, initialDate, initialTime,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [step, setStep] = useState(initialStep);
  const [cursor, setCursor] = useState(() => {
    const date = initialDate ? new Date(initialDate) : new Date();
    date.setDate(1);
    return date;
  });
  const [selectedDate, setSelectedDate] = useState(() => initialDate ? new Date(initialDate) : null);
  const [selectedTime, setSelectedTime] = useState(initialTime || null);
  const [timesOpen, setTimesOpen] = useState(true);

  const isCurrentCoach = coach.id === COACHES[1].id;
  const availability = useMemo(() => (
    isCurrentCoach && liveAvailability?.length
      ? availabilityBlocksToWeekly(liveAvailability, pkg, coachPackages)
      : derivePackageAvailability(coach, pkg)
  ), [coach, coachPackages, isCurrentCoach, liveAvailability, pkg]);
  const weeks = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = new Date();
  const isCurrentMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
  const daySlots = selectedDate ? slotsForDate(selectedDate, coach, availability) : [];
  const groupedSlots = groupSlotsByPeriod(daySlots);
  const duration = pkg.durationMinutes || pkg.duration || 60;
  const typeLabel = pkg.packageTypes?.length ? pkg.packageTypes.join(" + ") : (pkg.packageType || pkg.type || "Coaching session");
  const locationLabel = packageLocation(pkg, coach);
  const participantLabel = pkg.maxParticipants > 1 ? `Up to ${pkg.maxParticipants}` : "Private";
  const prepCopy = pkg.equipment
    ? pkg.equipment
    : "Wear comfortable sports clothing and bring water. Your coach will confirm anything else before the session.";

  const chooseDate = (date, availabilityState) => {
    if (availabilityState === "unavailable") return;
    setSelectedDate(date);
    setSelectedTime(null);
    setTimesOpen(true);
  };

  const footer = step === 1 ? (
    <Btn full icon={CalendarDays} onClick={() => setStep(2)}>Choose date & time</Btn>
  ) : (
    <div style={{ display: "grid", gridTemplateColumns: "108px 1fr", gap: 10 }}>
      <Btn full variant="outline" onClick={() => setStep(1)}>Back</Btn>
      <Btn
        full
        icon={ArrowRight}
        disabled={!selectedDate || !selectedTime}
        onClick={() => onComplete(selectedDate.toISOString(), selectedTime)}
      >
        Review package
      </Btn>
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={step === 1 ? "Package overview" : "Choose your session"}
      heightPct={92}
      footer={footer}
    >
      <StepProgress step={step} total={2} label={step === 1 ? "Review what’s included" : "Pick a date and start time"} />

      {step === 1 ? (
        <div key="overview" style={{ animation: "clFadeUp .24s ease" }}>
          <div style={{ padding: 16, borderRadius: 18, background: C.brandTint, border: `1px solid ${C.border}`, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <Badge tone="success" icon={ShieldCheck}>Coach verified</Badge>
                <h2 style={{ margin: "10px 0 0", fontSize: T.headingLg, lineHeight: 1.2, fontWeight: 800, color: C.jet, ...fDisplay }}>{pkg.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: T.labelLg, color: C.slate, ...fBody }}>
                  <SportIcon sport={pkg.sport || coach.sport} size={13} color={C.brand} />
                  {pkg.sport || coach.sport} · {typeLabel}
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: T.display, fontWeight: 800, color: C.brand, ...fDisplay }}>${pkg.price}</div>
                <div style={{ fontSize: T.caption, color: C.slate, marginTop: 2, ...fBody }}>package price</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 20 }}>
            <PackageMetric icon={Clock} label="Duration" value={`${duration} min`} C={C} />
            <PackageMetric icon={Users} label="Group size" value={participantLabel} C={C} />
            <PackageMetric icon={MapPin} label="Format" value={pkg.mode || pkg.locationType || "In-person"} C={C} />
          </div>

          <SectionLabel>What to expect</SectionLabel>
          <p style={{ margin: "6px 0 18px", fontSize: T.bodyLg, color: C.slate, lineHeight: 1.65, ...fBody }}>
            {pkg.description || `A focused ${pkg.sport || coach.sport} session shaped around your goals, experience, and pace.`}
          </p>

          <Card style={{ marginBottom: 18, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 38, height: 38, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: C.brandTint }}>
                <Wrench size={17} color={C.brand} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Prepare for your session</div>
                <div style={{ marginTop: 4, fontSize: T.labelLg, color: C.slate, lineHeight: 1.55, ...fBody }}>{prepCopy}</div>
              </div>
            </div>
          </Card>

          <SectionLabel>Session location</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, paddingBottom: 4 }}>
            <MapPin size={16} color={C.brand} aria-hidden="true" />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 650, color: C.jet, ...fBody }}>{locationLabel}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>Full joining details are shared after booking.</div>
            </div>
          </div>
        </div>
      ) : (
        <div key="schedule" style={{ animation: "clFadeUp .24s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, marginBottom: 16, borderRadius: 16, background: C.fog, border: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: C.brandTint }}>
              <SportIcon sport={pkg.sport || coach.sport} size={18} color={C.brand} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fDisplay }}>{pkg.name}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{duration} min · ${pkg.price} · {pkg.mode || pkg.locationType || "In-person"}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => !isCurrentMonth && setCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              disabled={isCurrentMonth}
              style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: isCurrentMonth ? "default" : "pointer", opacity: isCurrentMonth ? 0.45 : 1 }}
            >
              <ChevronLeft size={16} color={C.jet} />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: T.caption, fontWeight: 700, color: C.brand, textTransform: "uppercase", letterSpacing: ".7px", ...fBody }}>Select a date</div>
              <div style={{ marginTop: 2, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{monthLabel}</div>
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronRight size={16} color={C.jet} />
            </button>
          </div>

          <Card style={{ padding: 10, marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {WEEKDAY_HEADERS.map((day) => (
                <div key={day} style={{ textAlign: "center", fontSize: T.micro, fontWeight: 700, color: C.slateLight, ...fBody }}>{day.slice(0, 1)}</div>
              ))}
            </div>

            {weeks.map((row) => (
              <div key={row[0].toISOString()} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                {row.map((date) => {
                  const inMonth = date.getMonth() === cursor.getMonth();
                  const availabilityState = dayAvailability(date, coach, availability);
                  const isSelected = selectedDate && sameDay(date, selectedDate);
                  const isToday = sameDay(date, today);
                  const disabled = !inMonth || availabilityState === "unavailable";
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      aria-label={date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                      aria-pressed={Boolean(isSelected)}
                      disabled={disabled}
                      onClick={() => chooseDate(date, availabilityState)}
                      style={{
                        minWidth: 0, height: 44, borderRadius: 11,
                        border: `1.5px solid ${isSelected ? C.brand : (isToday ? C.success : C.border)}`,
                        background: isSelected ? C.brand : C.white,
                        color: isSelected ? C.white : (disabled ? C.slateLight : C.jet),
                        opacity: inMonth ? (disabled ? 0.45 : 1) : 0.2,
                        fontSize: T.label, fontWeight: isSelected || isToday ? 700 : 500,
                        cursor: disabled ? "default" : "pointer", ...fBody,
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </Card>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.tiny, color: C.slate, ...fBody }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.brand }} />Available</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.tiny, color: C.slate, ...fBody }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.border }} />Unavailable</span>
          </div>

          {selectedDate ? (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", animation: "clFadeUp .28s ease" }}>
              <button
                type="button"
                onClick={() => setTimesOpen((value) => !value)}
                aria-expanded={timesOpen}
                style={{ width: "100%", minHeight: 58, padding: "10px 14px", border: "none", background: C.fog, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left", cursor: "pointer" }}
              >
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Available start times</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{formatFullDateFromDate(selectedDate)}</div>
                </div>
                <ChevronDown size={18} color={C.slate} style={{ transform: timesOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s ease" }} />
              </button>

              {timesOpen ? (
                <div style={{ padding: "14px 14px 4px", animation: "clFadeUp .2s ease" }}>
                  {daySlots.length ? TIME_PERIODS.filter((period) => groupedSlots[period].length).map((period) => (
                    <div key={period} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: T.caption, fontWeight: 700, color: C.slateLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".6px", ...fBody }}>{period}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                        {groupedSlots[period].map((time) => {
                          const active = selectedTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setSelectedTime(time)}
                              style={{ minWidth: 0, minHeight: 44, padding: "9px 8px", borderRadius: 12, border: `1.5px solid ${active ? C.brand : C.border}`, background: active ? C.brandTint : C.white, color: active ? C.brand : C.jet, fontSize: T.labelLg, fontWeight: 650, cursor: "pointer", ...fBody }}
                            >
                              {formatTimeRange12(time, duration)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: "4px 0 14px", fontSize: T.labelLg, color: C.slate, textAlign: "center", ...fBody }}>No start times are available on this date.</div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 16, background: C.fog, border: `1px solid ${C.border}` }}>
              <Sparkles size={17} color={C.brand} aria-hidden="true" />
              <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>Choose an available date to reveal start times.</div>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

export function ScreenCoachProfile({ nav, goBack, params = {}, favorites = [], toggleFav, coachAvailableNow }) {
  const { darkMode, coachMedia, coachProfile, coachPackages, availabilityBlocks, toast } = useApp();
  const C = darkMode ? CD : CL;
  const listedCoach = COACHES.find((c) => c.id === (params?.id)) || COACHES[0];
  const coach = listedCoach.id === COACHES[1].id ? coachProfile : listedCoach;
  const media = coach.id === COACHES[1].id ? coachMedia : getCoachMedia(coach.id);
  const pub = getPublicName(coach, "public");
  const { getReply } = useReviewActions();
  const [tab, setTab] = useState(params.tab || "packages");
  const [selectedPkgId, setSelectedPkgId] = useState(params.openSchedule ? params.packageId : null);
  const [packageSheetStep, setPackageSheetStep] = useState(params.openSchedule ? 2 : 1);
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
    haptic(8);
    toggleFav?.(coach.id);
    toast?.(fav ? "Removed from saved coaches" : "Coach saved to favourites");
  };
  const handleShare = () => toast?.("Profile link ready to share");
  const handleBack = () => {
    if (params.returnToMap) {
      nav("client-home", { mapOpen: true });
      return;
    }
    goBack("client-home");
  };

  const activePackages = coach.packages.filter((pkg) => pkg.active !== false);
  const startingPrice = activePackages.length ? Math.min(...activePackages.map((pkg) => pkg.price)) : null;

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
                  <BackButton floating onClick={handleBack} />
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
            { value: "packages", label: "Packages" }, { value: "about", label: "About" },
            { value: "reels", label: "Reels" }, { value: "reviews", label: "Reviews" },
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Badge tone="success" icon={ShieldCheck}>{activePackages.length} available</Badge>
              <span style={{ fontSize: T.captionLg, color: C.slateLight, ...fBody }}>Tap a package to see everything included</span>
            </div>

            <div className="cl-stagger">
              {coach.packages.map((p, i) => {
                const isInactive = p.active === false;
                const duration = p.durationMinutes || p.duration || 60;
                const format = p.mode || p.locationType || "In-person";
                const groupSize = p.maxParticipants > 1 ? `Up to ${p.maxParticipants} people` : "Private session";
                return (
                  <Card
                    key={p.id}
                    ariaLabel={isInactive ? `${p.name}, currently unavailable` : `View ${p.name}`}
                    onClick={isInactive ? undefined : () => {
                      setPackageSheetStep(1);
                      setSelectedPkgId(p.id);
                    }}
                    style={{
                      marginBottom: 12,
                      padding: 15,
                      background: isInactive ? C.fog : C.white,
                      opacity: isInactive ? 0.58 : 1,
                      cursor: isInactive ? "default" : "pointer",
                      animationDelay: `${Math.min(i, 8) * 45}ms`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: isInactive ? C.white : C.brandTint, border: `1px solid ${C.border}` }}>
                        <SportIcon sport={p.sport || coach.sport} size={19} color={isInactive ? C.slateLight : C.brand} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: T.subtitleLg, fontWeight: 750, color: C.jet, lineHeight: 1.25, ...fDisplay }}>{p.name}</div>
                        <div style={{ fontSize: T.label, color: C.slate, marginTop: 4, ...fBody }}>{p.sport || coach.sport} · {p.packageType || p.type || "Coaching session"}</div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontSize: T.titleLg, fontWeight: 800, color: C.jet, ...fDisplay }}>${p.price}</div>
                        <div style={{ fontSize: T.tiny, color: C.slateLight, marginTop: 1, ...fBody }}>package</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 12px", marginTop: 13, padding: "10px 11px", borderRadius: 13, background: C.fog }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.captionLg, color: C.slate, ...fBody }}><Clock size={13} color={C.brand} />{duration} min</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.captionLg, color: C.slate, ...fBody }}><Users size={13} color={C.brand} />{groupSize}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.captionLg, color: C.slate, ...fBody }}><MapPin size={13} color={C.brand} />{format}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
                      {isInactive ? <Badge tone="neutral">Currently unavailable</Badge> : coach.instantBook ? <Badge tone="success">Instant book</Badge> : <Badge tone="neutral">Request to book</Badge>}
                      {!isInactive ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: T.captionLg, fontWeight: 650, color: C.brand, ...fBody }}>
                          Details & availability <ChevronRight size={14} />
                        </span>
                      ) : null}
                    </div>
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
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>
                      <Star size={12} fill={C.brand} color={C.brand} />
                      {r.rating.toFixed(1)}
                    </span>
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
        ) : tab === "packages" ? (
          <div style={{ flex: 1 }}>
            <Btn full variant="outline" icon={MessageCircle} onClick={() => nav("chat-thread", { name: coach.name, handle: coach.handle })}>Help me choose</Btn>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <Btn full onClick={() => setTab("packages")}>View packages</Btn>
          </div>
        )}
        {tab !== "packages" ? (
          <button type="button" aria-label={`Message ${pub.name}`} onClick={() => nav("chat-thread", { name: coach.name, handle: coach.handle })} style={{ width: 46, height: 46, borderRadius: 14, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <MessageCircle size={18} color={C.jet} />
          </button>
        ) : null}
      </div>

      <FullscreenImageViewer open={avatarOpen} onClose={() => setAvatarOpen(false)} src={coach.avatar} alt={`${pub.name} profile photo`} />
      {selectedPkg ? (
        <PackageBookingSheet
          key={selectedPkg.id}
          open
          pkg={selectedPkg}
          coach={coach}
          liveAvailability={availabilityBlocks}
          coachPackages={coachPackages}
          initialStep={packageSheetStep}
          initialDate={params.openSchedule ? params.presetDate : undefined}
          initialTime={params.openSchedule ? params.presetTime : undefined}
          onClose={() => setSelectedPkgId(null)}
          onComplete={(presetDate, presetTime) => nav("package-detail", {
            coachId: coach.id,
            packageId: selectedPkg.id,
            presetDate,
            presetTime,
          })}
        />
      ) : null}
    </div>
  );
}
