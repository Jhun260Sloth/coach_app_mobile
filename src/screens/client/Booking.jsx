import React, { useState, useEffect, useMemo } from "react";
import {
  Info, Fingerprint, CreditCard, CheckCircle2, Plus, Lock, Calendar, Navigation, MessageCircle,
  Users, User, ShieldCheck, Phone, Stethoscope, AlertTriangle, UserPlus, MapPin, Send, ClipboardCheck,
  ChevronLeft, ChevronRight, Sunrise, Sun, Moon, Repeat as RepeatIcon,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, CONFIG } from "../../data/mockData";
import {
  Avatar, Card, Chip, SectionLabel, Btn, TopBar, Toggle, Field, Row, RadioRow, Spinner,
} from "../../components/ui/Primitives";
import { StatusBanner, ResultOverlay } from "../../systems/StateSystem";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function parseShortDate(str, year = 2026) {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(str || "");
  if (!m) return null;
  const month = MONTH_ABBR.indexOf(m[2]);
  if (month < 0) return null;
  return new Date(year, month, parseInt(m[1], 10));
}
function sameCalendarDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function normTime(t) { return (t || "").replace(/\s+/g, "").toLowerCase(); }

/* ---- calendar helpers for the "Select Date & Time" screen ---- */
function addDays(d, n) { const r = new Date(d); r.setDate(d.getDate() + n); return r; }
function startOfWeek(d) { const dow = (d.getDay() + 6) % 7; return addDays(d, -dow); } // Monday-start
function buildMonthGrid(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const weeks = [];
  let cur = gridStart;
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) { row.push(cur); cur = addDays(cur, 1); }
    weeks.push(row);
  }
  return weeks;
}
function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isPastDay(d) { const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0); return x < t; }
const DOW_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Availability state for a calendar cell, based on how many slots the coach
// has open that day: none -> unavailable, 1-2 -> limited, 3+ -> available.
function dayAvailability(date, coach) {
  if (isPastDay(date)) return "unavailable";
  const abbrev = DOW_ABBR[date.getDay()];
  const slots = coach.availability[abbrev];
  if (!slots || slots.length === 0) return "unavailable";
  if (slots.length <= 2) return "limited";
  return "available";
}

function slotsForDate(date, coach) {
  const abbrev = DOW_ABBR[date.getDay()];
  return coach.availability[abbrev] || [];
}

// Buckets a coach's raw "HH:MM" slots into Morning / Afternoon / Evening.
function groupSlotsByPeriod(slots) {
  const groups = { Morning: [], Afternoon: [], Evening: [] };
  slots.forEach((t) => {
    const h = parseInt(t.split(":")[0], 10);
    if (h < 12) groups.Morning.push(t);
    else if (h < 17) groups.Afternoon.push(t);
    else groups.Evening.push(t);
  });
  return groups;
}

function formatFullDateFromDate(d) {
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

const REPEAT_OPTIONS = [
  { value: "once", label: "One-time Session (Default)" },
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
];
const END_AFTER_OPTIONS = [
  { value: "4", label: "4 sessions" },
  { value: "8", label: "8 sessions" },
  { value: "date", label: "End date" },
];

function repeatSummaryText(repeat) {
  if (!repeat || repeat.freq === "once") return "One-time session";
  const freqLabel = repeat.freq === "weekly"
    ? `Every ${repeat.every || 1} week${(repeat.every || 1) > 1 ? "s" : ""}`
    : repeat.freq === "fortnightly" ? "Every 2 weeks" : "Every month";
  if (repeat.freq !== "weekly") return freqLabel;
  if (repeat.endType === "date") return `${freqLabel}, until ${repeat.endDate || "a selected date"}`;
  return `${freqLabel}, ends after ${repeat.endType} sessions`;
}

// A coach's package tells us whether more than one person can join the same
// booking. "1:1" / "1:1 Coaching" (and one-on-one term blocks) only ever have
// room for one participant. "Group", "Group Training" and "Family Sessions"
// packages can hold several.
function packageAllowsMultipleParticipants(pkg) {
  const text = `${pkg.type || pkg.packageType || ""} ${pkg.name || ""}`;
  return /group|family/i.test(text);
}

// "Mode of Delivery" — how the session is conducted.
function deliveryModeLabel(pkg) {
  return pkg.deliveryMode || pkg.mode || "In-person";
}

// The exact venue/address a client should show up to (or an explanation why
// there isn't one, for online / "come to you" sessions).
function venueLabel(pkg, coach) {
  const mode = deliveryModeLabel(pkg);
  if (/online|virtual/i.test(mode)) return "Online — link shared once the coach accepts";
  if (/come to you/i.test(mode)) return pkg.travelArea ? `Coach travels to you — ${pkg.travelArea}` : "Coach travels to your location";
  return pkg.venue || (coach && coach.venue) || "Venue to be confirmed by coach";
}

function formatTime12(t) {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${period}`;
}

/**
 * First step of the booking flow: "Who's attending?" — asked before date and
 * time are chosen, so the coach's availability check and the review page
 * both already know who the session is for.
 */
export function ScreenBookingParticipants({ nav, params, children = [] }) {
  const coach = COACHES.find((c) => c.id === params.coachId);
  const pkg = coach.packages.find((p) => p.id === params.packageId);
  const allowsMultiple = packageAllowsMultipleParticipants(pkg);
  // The package's "Maximum participants" (set by the coach) caps how many
  // people the client can add to a single booking of this package.
  const maxParticipants = pkg.maxParticipants || (allowsMultiple ? 99 : 1);

  const [participants, setParticipants] = useState(["self"]);
  const toggleParticipant = (key) => setParticipants((p) => {
    if (!allowsMultiple) return p.includes(key) ? p : [key]; // 1:1 — single selection acts like a radio button
    if (p.includes(key)) return p.filter((x) => x !== key);
    if (p.length >= maxParticipants) return p; // package is at capacity — ignore further taps
    return [...p, key];
  });

  const atCapacity = allowsMultiple && participants.length >= maxParticipants;
  const canContinue = participants.length > 0;

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Who's attending?" onBack={() => nav("package-detail", { coachId: coach.id, packageId: pkg.id })} />

      <Card style={{ marginBottom: 22, display: "flex", gap: 12, alignItems: "center", border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)" }}>
        <Avatar name={coach.name} size={44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.jet, letterSpacing: "-0.1px", ...fDisplay }}>{pkg.name}</div>
          <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2, ...fBody }}>with {coach.name}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 16, fontWeight: 800, color: C.jet, whiteSpace: "nowrap", ...fDisplay }}>
          ${pkg.price}
        </div>
      </Card>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <SectionLabel>Select who's coming</SectionLabel>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.slateLight, ...fBody }}>
            {participants.length}/{maxParticipants} max
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: C.slate, marginBottom: 14, lineHeight: 1.5, ...fBody }}>
          {allowsMultiple
            ? `This is a group session — up to ${maxParticipants} participant${maxParticipants > 1 ? "s" : ""} can join. Select yourself, one child, or several. Each participant keeps their own booking history.`
            : "This is a 1:1 session, so pick a single participant — yourself or one child profile."}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <div style={{ opacity: atCapacity && !participants.includes("self") ? 0.45 : 1 }}>
            <Chip active={participants.includes("self")} icon={User} onClick={(atCapacity && !participants.includes("self")) ? undefined : () => toggleParticipant("self")}>Myself</Chip>
          </div>
          {children.map((c) => {
            const disabled = atCapacity && !participants.includes(c.id);
            return (
              <div key={c.id} style={{ opacity: disabled ? 0.45 : 1 }}>
                <Chip active={participants.includes(c.id)} icon={Users} onClick={disabled ? undefined : () => toggleParticipant(c.id)}>{c.name || "Unnamed profile"}</Chip>
              </div>
            );
          })}
        </div>
        {children.length === 0 && (
          <button onClick={() => nav("client-profile")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", marginTop: 14, padding: 0 }}>
            <UserPlus size={13} color={C.orange} />
            <span style={{ fontSize: 12, color: C.orange, fontWeight: 600, ...fBody }}>Add a child profile from Account to book for them</span>
          </button>
        )}
      </div>

      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full disabled={!canContinue} onClick={() => nav("booking-datetime", { coachId: coach.id, packageId: pkg.id, participants })}>Continue</Btn>
      </div>
    </div>
  );
}

export function ScreenBookingDateTime({ nav, params, setDraft, bookings = [] }) {
  const coach = COACHES.find((c) => c.id === params.coachId);
  const pkg = coach.packages.find((p) => p.id === params.packageId);

  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState(null);
  const [time, setTime] = useState(null);
  const [checking, setChecking] = useState(false);

  // Repeat booking (optional)
  const [repeatFreq, setRepeatFreq] = useState("once");
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [endAfterType, setEndAfterType] = useState("4");
  const [endDate, setEndDate] = useState("");

  const weeks = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = new Date();
  const isCurrentMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
  const goPrevMonth = () => { if (!isCurrentMonth) setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1)); };
  const goNextMonth = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  const pickDate = (d, state) => {
    if (state === "unavailable") return;
    setSelectedDate(d);
    setTime(null);
  };

  // Simulate a short "checking availability" pause whenever a new time is picked.
  useEffect(() => {
    if (!time) { setChecking(false); return; }
    setChecking(true);
    const t = setTimeout(() => setChecking(false), 600);
    return () => clearTimeout(t);
  }, [time, selectedDate]);

  // Schedule conflict — does the client already have a pending/confirmed session
  // at this exact day & time (with any coach)?
  const conflictBooking = time && !checking
    ? bookings.find((b) => {
        if (!["pending", "confirmed"].includes(b.status)) return false;
        const bd = parseShortDate(b.date);
        return sameCalendarDay(bd, selectedDate) && normTime(b.time) === normTime(formatTime12(time));
      })
    : null;

  const daySlots = selectedDate ? slotsForDate(selectedDate, coach) : [];
  const grouped = groupSlotsByPeriod(daySlots);
  const periodIcons = { Morning: Sunrise, Afternoon: Sun, Evening: Moon };

  const repeat = { freq: repeatFreq, every: repeatEvery, endType: endAfterType, endDate };

  const canContinue = !!selectedDate && !!time;

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Select Date & Time" onBack={() => nav("booking-participants", { coachId: coach.id, packageId: pkg.id, participants: params.participants })} />

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.5, marginBottom: 18, ...fBody }}>
          Choose your preferred session date and time. Only available dates and time slots are shown.
        </div>

        <Card style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center", border: `1px solid ${C.border}` }}>
          <Avatar name={coach.name} size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.jet, ...fDisplay }}>{pkg.name}</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>with {coach.name} · {pkg.duration} min</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 15, fontWeight: 800, color: C.jet, whiteSpace: "nowrap", ...fDisplay }}>${pkg.price}</div>
        </Card>

        {/* 1. Choose the day */}
        <SectionLabel>1. Choose the day</SectionLabel>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={goPrevMonth} disabled={isCurrentMonth} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isCurrentMonth ? "default" : "pointer", opacity: isCurrentMonth ? 0.4 : 1 }}>
              <ChevronLeft size={16} color={C.jet} />
            </button>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.jet, ...fDisplay }}>{monthLabel}</span>
            <button onClick={goNextMonth} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight size={16} color={C.jet} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {WEEKDAY_HEADERS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.slateLight, ...fBody }}>{d}</div>
            ))}
          </div>

          {weeks.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
              {row.map((d, di) => {
                const inRange = d.getMonth() === cursor.getMonth();
                const state = dayAvailability(d, coach);
                const isSelected = sameDay(d, selectedDate);
                const isToday = sameDay(d, today);
                const disabled = !inRange || state === "unavailable";

                let background = C.white;
                let border = C.border;
                let color = C.jet;
                if (state === "available" && inRange) { border = C.orange; }
                if (state === "limited" && inRange) { border = C.strong; }
                if (disabled) { color = C.slateLight; }
                if (isSelected) { background = C.orange; border = C.orange; color = C.white; }

                return (
                  <button
                    key={di}
                    onClick={() => pickDate(d, state)}
                    disabled={disabled}
                    style={{
                      aspectRatio: "1", borderRadius: 10, position: "relative",
                      border: `1.5px solid ${border}`, background,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                      opacity: inRange ? 1 : 0.3,
                      cursor: disabled ? "not-allowed" : "pointer",
                      outline: isToday && !isSelected ? `1.5px solid ${C.slate}` : "none",
                      outlineOffset: isToday && !isSelected ? -1.5 : 0,
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: isSelected || isToday ? 700 : 500, color, ...fBody }}>{d.getDate()}</span>
                    {inRange && state === "limited" && !isSelected && (
                      <span style={{ width: 4, height: 4, borderRadius: 99, background: C.strong }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.slate, ...fBody }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, border: `1.5px solid ${C.orange}` }} /> Available
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.slate, ...fBody }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, border: `1.5px solid ${C.strong}` }} /> Limited
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.slate, ...fBody }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: C.fog, border: `1.5px solid ${C.border}` }} /> Unavailable
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.slate, ...fBody }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: C.orange }} /> Selected
            </span>
          </div>
        </Card>

        {time && conflictBooking && (
          <div style={{ marginBottom: 18 }}>
            <StatusBanner
              state="scheduleConflict"
              message={`You already have ${conflictBooking.service} with ${conflictBooking.coachName} at this time.`}
              onPrimary={() => { setTime(null); }}
              onSecondary={() => nav("client-booking-detail", { id: conflictBooking.id })}
            />
          </div>
        )}
        {time && !conflictBooking && (
          <Card style={{ marginBottom: 18, background: checking ? C.fog : C.orangeTint, border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {checking ? <Spinner size={16} color={C.slate} /> : <Calendar size={16} color={C.orange} />}
              <span style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>
                {checking
                  ? `Checking availability for ${formatFullDateFromDate(selectedDate)} at ${formatTime12(time)}…`
                  : `${formatFullDateFromDate(selectedDate)} at ${formatTime12(time)} — confirmed available`}
              </span>
            </div>
          </Card>
        )}

        {/* 2. Available Time Slots */}
        {selectedDate && (
          <>
            <SectionLabel>2. Available Time Slots</SectionLabel>
            <div style={{ fontSize: 12, color: C.slate, marginBottom: 12, ...fBody }}>{formatFullDateFromDate(selectedDate)}</div>
            {daySlots.length === 0 ? (
              <Card style={{ marginBottom: 18, textAlign: "center" }}>
                <span style={{ fontSize: 12.5, color: C.slate, ...fBody }}>No time slots available on this day.</span>
              </Card>
            ) : (
              <div style={{ marginBottom: 18 }}>
                {["Morning", "Afternoon", "Evening"].filter((p) => grouped[p].length > 0).map((period) => {
                  const PeriodIcon = periodIcons[period];
                  return (
                    <div key={period} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <PeriodIcon size={13} color={C.slateLight} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: C.slate, ...fBody }}>{period}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {grouped[period].map((t) => {
                          const active = time === t;
                          return (
                            <button
                              key={t}
                              onClick={() => setTime(t)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "10px 16px", borderRadius: 999, border: `1.5px solid ${active ? C.jet : C.border}`,
                                background: active ? C.jet : C.white, color: active ? C.white : C.jet,
                                fontWeight: active ? 700 : 600, fontSize: 13, cursor: "pointer",
                                transition: "background .15s ease", ...fBody,
                              }}
                            >
                              {active && <CheckCircle2 size={12} color={C.white} />}
                              {formatTime12(t)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Repeat Booking (Optional) */}
        {selectedDate && time && (
          <>
            <SectionLabel>Repeat Booking (Optional)</SectionLabel>
            <Card style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: C.slate, marginBottom: 10, ...fBody }}>How often would you like to repeat this session?</div>
              {REPEAT_OPTIONS.map((o) => (
                <RadioRow key={o.value} label={o.label} selected={repeatFreq === o.value} onClick={() => setRepeatFreq(o.value)} />
              ))}

              {repeatFreq === "weekly" && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Repeat every</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "9px 13px", marginBottom: 14 }}>
                    <RepeatIcon size={14} color={C.slateLight} />
                    <input
                      type="number" min={1} value={repeatEvery}
                      onChange={(e) => setRepeatEvery(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ border: "none", outline: "none", width: 40, fontSize: 13, ...fBody }}
                    />
                    <span style={{ fontSize: 12.5, color: C.slate, ...fBody }}>week{repeatEvery > 1 ? "s" : ""}</span>
                  </div>

                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>End after</div>
                  {END_AFTER_OPTIONS.map((o) => (
                    <RadioRow key={o.value} label={o.label} selected={endAfterType === o.value} onClick={() => setEndAfterType(o.value)} />
                  ))}
                  {endAfterType === "date" && (
                    <input
                      type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "10px 13px", fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 6, ...fBody }}
                    />
                  )}
                </div>
              )}
            </Card>

            {/* 3. Session Summary */}
            <SectionLabel>3. Session Summary</SectionLabel>
            <Card style={{ marginBottom: 18, background: C.orangeTint, border: "none" }}>
              <Row label="Package" value={pkg.name} />
              <Row label="Coach" value={coach.name} />
              <Row label="Date" value={formatFullDateFromDate(selectedDate)} />
              <Row label="Time" value={formatTime12(time)} />
              <Row label="Repeats" value={repeatSummaryText(repeat)} />
              <Row label="Price" value={`$${pkg.price} / session`} bold last />
            </Card>
          </>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Info size={14} color={C.slate} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>Only real-time open slots are shown — {coach.name.split(" ")[0]}'s calendar updates automatically once you book.</span>
        </div>
      </div>

      <div style={{ padding: "14px 0" }}>
        <Btn
          full
          disabled={!canContinue}
          onClick={() => {
            setDraft({
              coach, pkg,
              day: formatFullDateFromDate(selectedDate),
              time: formatTime12(time),
              mode: pkg.mode,
              participants: params.participants || ["self"],
              repeat,
            });
            nav("booking-review");
          }}
        >
          Continue
        </Btn>
      </div>
    </div>
  );
}

export function ScreenBookingReview({ nav, draft, setDraft, toast, children = [], bookings = [], addBooking }) {
  // Who's attending was already chosen on the previous step (ScreenBookingParticipants).
  const participants = draft.participants || ["self"];
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [conditions, setConditions] = useState("");
  const [consent, setConsent] = useState(false);

  const selectedChildren = children.filter((c) => participants.includes(c.id));
  // Child safety details are only relevant for participants who are actually
  // under 18 — an unset age is treated as a minor too, since these are child
  // profiles and simply haven't had an age filled in yet.
  const isMinor = (c) => {
    const age = Number(c.age);
    return c.age === "" || c.age === undefined || c.age === null || Number.isNaN(age) || age < 18;
  };
  const minorParticipants = selectedChildren.filter(isMinor);
  const includesMinor = minorParticipants.length > 0;

  // If a selected child already has guardian details on their profile (collected
  // when the profile was set up), pull them in automatically so the guardian
  // doesn't have to retype them here — but never clobber something they've
  // already typed into these fields for this booking.
  useEffect(() => {
    const savedGuardian = minorParticipants.find((c) => c.guardianName);
    if (savedGuardian) {
      setGuardianName((v) => v || savedGuardian.guardianName || "");
      setGuardianRelationship((v) => v || savedGuardian.guardianRelationship || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.join(",")]);
  // Children added with full safety details (e.g. via onboarding) already carry emergency
  // contact and medical info on their profile — only chase fresh input for the ones that don't.
  const childrenMissingSafetyInfo = minorParticipants.filter((c) => !(c.emergencyName || c.emergencyMobile || c.medicalConditions || c.allergies || c.medicalNotes));
  const participantLabel = participants.length === 0
    ? "Not selected"
    : [
      ...(participants.includes("self") ? ["You"] : []),
      ...selectedChildren.map((c) => c.name || "Unnamed profile"),
    ].join(", ");

  const fee = Math.round(draft.pkg.price * CONFIG.serviceFeeRate * 100) / 100;
  const total = draft.pkg.price + fee;
  const guardianDetailsComplete = guardianName.trim() && guardianRelationship.trim()
    && (childrenMissingSafetyInfo.length === 0 || (emergencyName.trim() && emergencyPhone.trim()));
  const canContinue = participants.length > 0 && (!includesMinor || (consent && guardianDetailsComplete));

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Review booking" onBack={() => nav("booking-datetime", { coachId: draft.coach.id, packageId: draft.pkg.id, participants })} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Coach" value={draft.coach.name} />
          <Row label="Service" value={draft.pkg.name} />
          <Row label="When" value={`${draft.day} at ${draft.time}`} />
          <Row label="Venue" value={venueLabel(draft.pkg, draft.coach)} />
          <Row label="Mode of Delivery" value={deliveryModeLabel(draft.pkg)} />
          <Row label="For" value={participantLabel} last={!draft.repeat || draft.repeat.freq === "once"} />
          {draft.repeat && draft.repeat.freq !== "once" && (
            <Row label="Repeats" value={repeatSummaryText(draft.repeat)} last />
          )}
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, marginBottom: 6, ...fDisplay }}>Cancellation policy</div>
          <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.55, ...fBody }}>{draft.coach.cancellationPolicy}</div>
        </Card>

        {includesMinor && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12 }}>
              <ShieldCheck size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>Child safety details</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2, lineHeight: 1.55, ...fBody }}>
                  This booking includes a participant under 18, so we share a few extra details with your coach to keep sessions safe. {draft.coach.name.split(" ")[0]} holds the required Working with Children Check, and this information is shared with them only as needed for the session.
                </div>
              </div>
            </div>

            {minorParticipants.map((c) => {
              const hasSavedSafetyInfo = !!(c.emergencyName || c.emergencyMobile || c.medicalConditions || c.allergies || c.medicalNotes);
              const hasSavedGuardian = !!c.guardianName;
              return (
                <div key={c.id} style={{ background: C.fog, borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>
                  <Row label="Participant" value={c.name || "Unnamed profile"} />
                  <Row label="Age" value={c.age || "Not set"} last={!hasSavedSafetyInfo && !hasSavedGuardian} />
                  {hasSavedGuardian && (
                    <Row label="Guardian on file" value={`${c.guardianName}${c.guardianRelationship ? ` (${c.guardianRelationship})` : ""}`} last={!hasSavedSafetyInfo} />
                  )}
                  {hasSavedSafetyInfo && (
                    <>
                      <Row label="Medical conditions" value={c.medicalConditions || "None declared"} />
                      <Row label="Allergies" value={c.allergies || "None declared"} />
                      {c.medicalNotes && <Row label="Medical notes" value={c.medicalNotes} />}
                      <Row label="Emergency contact" value={c.emergencyName ? `${c.emergencyName}${c.emergencyRelationship ? ` (${c.emergencyRelationship})` : ""}` : "Not set"} />
                      <Row label="Emergency phone" value={c.emergencyMobile || "Not set"} last />
                    </>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
                    {hasSavedSafetyInfo ? (
                      <span style={{ fontSize: 11, color: C.success, fontWeight: 600, ...fBody }}>Pulled from {c.name || "this"}'s profile</span>
                    ) : (
                      <button onClick={() => nav("client-profile")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={12} color={C.orange} />
                        <span style={{ fontSize: 11, color: C.orange, fontWeight: 600, ...fBody }}>No safety details saved on this profile yet — add them below or from Account</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 4 }}>
              <SectionLabel>Guardian details</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Field label="Guardian full name" placeholder="Jamie Chen" icon={User} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
                <Field label="Relationship to participant" placeholder="Parent" value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} />
              </div>
            </div>

            {childrenMissingSafetyInfo.length > 0 && (
              <>
                <div style={{ marginTop: 14 }}>
                  <SectionLabel>Emergency contact</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Field label="Emergency contact name" placeholder="Alex Chen" icon={User} value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                    <Field label="Emergency contact phone" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <SectionLabel>Relevant medical conditions or allergies</SectionLabel>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
                    <Stethoscope size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
                    <textarea
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="e.g. asthma (carries inhaler), peanut allergy — leave blank if none"
                      rows={2}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, resize: "none", ...fBody }}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10, background: C.warnTint, borderRadius: 12, padding: 10 }}>
                <AlertTriangle size={14} color="#B8860B" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11.5, color: C.jet, lineHeight: 1.5, ...fBody }}>Safeguarding: sessions involving minors require a checked-in guardian or approved drop-off arrangement, and any concerns can be reported to CoachLink support at any time.</span>
              </div>
              <button onClick={() => setConsent(!consent)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${consent ? C.orange : C.border}`, background: consent ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {consent && <CheckCircle2 size={12} color={C.white} />}
                </div>
                <span style={{ fontSize: 12, color: C.jet, lineHeight: 1.5, ...fBody }}>I confirm I am the parent or legal guardian and consent to this booking, including CoachLink's handling of the participant's data.</span>
              </button>
            </div>
          </Card>
        )}

        <Card>
          <Row label="Session" value={`$${draft.pkg.price.toFixed(2)}`} />
          <Row label="Service fee" value={`$${fee.toFixed(2)}`} />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold last />
        </Card>
      </div>
      <div style={{ padding: "14px 0" }}>
        <Btn full disabled={!canContinue} onClick={() => {
          // Fold any safety details already saved on a child's profile into the notes
          // that travel with the booking, alongside anything freshly typed above.
          const profileSafetyNotes = minorParticipants
            .filter((c) => c.emergencyName || c.emergencyMobile || c.medicalConditions || c.allergies || c.medicalNotes)
            .map((c) => {
              const bits = [];
              if (c.medicalConditions) bits.push(`Medical: ${c.medicalConditions}`);
              if (c.allergies) bits.push(`Allergies: ${c.allergies}`);
              if (c.medicalNotes) bits.push(c.medicalNotes);
              if (c.emergencyName || c.emergencyMobile) {
                bits.push(`Emergency contact: ${c.emergencyName || "—"}${c.emergencyRelationship ? ` (${c.emergencyRelationship})` : ""}${c.emergencyMobile ? ` – ${c.emergencyMobile}` : ""}`);
              }
              return `${c.name || "Participant"} — ${bits.join("; ")}`;
            }).join("\n");
          const combinedConditions = [conditions.trim(), profileSafetyNotes].filter(Boolean).join("\n");
          const newId = "b" + (bookings.length + 1);
          const finalDraft = { ...draft, id: newId, total, participants: participantLabel, includesMinor, guardianName, guardianRelationship, emergencyName, emergencyPhone, conditions: combinedConditions };
          setDraft(finalDraft);
          addBooking(finalDraft);
          toast("Booking request sent");
          nav("booking-request-sent", { id: newId, coachName: draft.coach.name });
        }}>Submit request</Btn>
      </div>
    </div>
  );
}

export function ScreenPayment({ nav, params, draft, toast, addBooking, markBookingPaid, pushNotification, biometric, offline }) {
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // null | "success" | "failed" | "cancelled"
  const busy = confirming || processing || result === "success";

  const pay = (forceFail = false) => {
    if (busy) return;
    if (offline) { toast("You're offline — reconnect to pay"); return; }
    setResult(null);
    if (biometric) { setConfirming(true); setTimeout(() => { setConfirming(false); processAndFinish(forceFail); }, 1100); }
    else processAndFinish(forceFail);
  };
  // Simulates submitting the charge to the payment processor before we show success/failure —
  // without this, tapping Pay looked identical whether the charge went through or not.
  const processAndFinish = (forceFail) => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (forceFail) {
        setResult("failed");
        return;
      }
      if (params?.bookingId) {
        markBookingPaid?.(params.bookingId);
      } else {
        addBooking(draft);
        pushNotification?.({ audience: "coach", type: "booking", title: "Payment received", body: `Payment of $${draft.total.toFixed(2)} received for ${draft.pkg.name}.` });
      }
      toast("Payment confirmed");
      setResult("success");
      setTimeout(() => nav(params?.bookingId ? "client-booking-detail" : "booking-confirmation", params?.bookingId ? { id: params.bookingId } : {}), 700);
    }, 900);
  };

  const cancelPayment = () => {
    if (busy) return;
    setResult("cancelled");
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopBar title="Payment" onBack={() => nav("booking-review")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {offline && (
          <div style={{ marginBottom: 16 }}>
            <StatusBanner state="actionBlockedOffline" compact />
          </div>
        )}
        {result === "failed" && (
          <div style={{ marginBottom: 16 }}>
            <StatusBanner
              state="paymentFailed"
              onPrimary={() => pay(false)}
              onSecondary={cancelPayment}
              primaryLabel="Try again"
              secondaryLabel="Cancel payment"
            />
          </div>
        )}
        {result === "cancelled" && (
          <div style={{ marginBottom: 16 }}>
            <StatusBanner state="paymentCancelled" onPrimary={() => setResult(null)} primaryLabel="Resume payment" />
          </div>
        )}
        <Btn full variant="dark" disabled={busy || offline} onClick={() => pay(false)}>Pay ${draft.total.toFixed(2)} with  Pay</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 11.5, color: C.slateLight, ...fBody }}>or pay by card</span><div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
        <SectionLabel>Saved payment methods</SectionLabel>
        <Card style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 24, borderRadius: 5, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={13} color={C.white} />
          </div>
          <div style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Visa •••• 4821</div>
          <CheckCircle2 size={16} color={C.orange} style={{ marginLeft: "auto" }} />
        </Card>
        <Btn variant="outline" size="sm" icon={Plus}>Add new card</Btn>

        <div style={{ marginTop: 20 }}>
          <Field label="Promo code" placeholder="Enter code" />
        </div>

        <Card style={{ marginTop: 20 }}>
          <Row label="Total due today" value={`$${draft.total.toFixed(2)}`} bold last />
        </Card>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14 }}>
          <Lock size={13} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: C.slateLight, lineHeight: 1.5, ...fBody }}>Funds are held securely and only released to {draft.coach.name.split(" ")[0]} once you confirm the session is complete.</span>
        </div>

        <button
          onClick={() => pay(true)}
          disabled={busy || offline}
          style={{ display: "block", margin: "18px auto 0", background: "none", border: "none", cursor: busy || offline ? "default" : "pointer", fontSize: 11, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Use a test card that declines (simulate failure)
        </button>
      </div>
      <div style={{ padding: "14px 0", display: "flex", gap: 10 }}>
        {result !== "failed" && result !== "cancelled" && (
          <button onClick={cancelPayment} disabled={busy} style={{ background: "none", border: "none", cursor: busy ? "default" : "pointer", fontSize: 12.5, color: C.slate, fontWeight: 600, padding: "0 4px", ...fBody }}>
            Cancel
          </button>
        )}
        <div style={{ flex: 1 }}>
          <Btn full loading={processing} loadingText="Processing payment…" disabled={(busy && !processing) || offline} onClick={() => pay(false)}>Pay & confirm booking</Btn>
        </div>
      </div>

      {confirming && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 70, borderRadius: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Fingerprint size={30} color={C.white} />
          </div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 600, ...fBody }}>Confirm with Face ID</div>
        </div>
      )}
      <ResultOverlay open={processing} state="paymentProcessing" />
      <ResultOverlay open={result === "success"} state="paymentSuccess" title="Payment confirmed" message="Funds are held securely until the session is complete." />
    </div>
  );
}

export function ScreenBookingConfirmation({ nav, draft, toast }) {
  const [synced, setSynced] = useState(false);
  const [locShare, setLocShare] = useState(false);
  return (
    <div style={{ padding: "28px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <CheckCircle2 size={28} color={C.success} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.jet, ...fDisplay }}>
          {draft.coach.instantBook ? "Booking confirmed" : "Request sent"}
        </div>
        <div style={{ fontSize: 13, color: C.slate, marginTop: 4, ...fBody }}>
          {draft.coach.instantBook ? `You're all set with ${draft.coach.name}.` : `${draft.coach.name} will respond within 24 hours.`}
        </div>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <Row label="Service" value={draft.pkg.name} />
        <Row label="When" value={`${draft.day} at ${draft.time}`} />
        <Row label="Location" value={draft.mode} />
        {draft.participants && <Row label="For" value={draft.participants} last />}
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} color={C.jet} />
            <span style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Sync to device calendar</span>
          </div>
          <Toggle on={synced} onClick={() => { setSynced((v) => !v); toast(!synced ? "Added to your calendar" : "Removed from calendar"); }} />
        </div>
      </Card>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Navigation size={16} color={C.jet} />
            <span style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Share live location during session</span>
          </div>
          <Toggle on={locShare} onClick={() => setLocShare((v) => !v)} />
        </div>
      </Card>

      <div style={{ marginTop: "auto", padding: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn full variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: draft.coach.name })}>Message {draft.coach.name.split(" ")[0]}</Btn>
        <Btn full onClick={() => nav("client-dashboard")}>Go to dashboard</Btn>
      </div>
    </div>
  );
}

/**
 * Shown right after a client submits a booking request (replacing the old
 * immediate-payment confirmation). No payment has been collected yet — the
 * coach still needs to review, and possibly message the client, before
 * accepting or declining.
 */
export function ScreenBookingRequestSent({ nav, params }) {
  return (
    <div style={{ padding: "28px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Send size={26} color={C.orange} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.jet, ...fDisplay }}>Booking Request Sent</div>
        <div style={{ fontSize: 13, color: C.slate, marginTop: 8, lineHeight: 1.6, maxWidth: 300, marginLeft: "auto", marginRight: "auto", ...fBody }}>
          Your booking request has been sent to the coach for review. You'll receive a notification once the coach accepts, requests more information, or declines your request.
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn full icon={ClipboardCheck} onClick={() => nav("client-booking-detail", { id: params.id })}>View Booking</Btn>
        <Btn full variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: params.coachName })}>Message Coach</Btn>
      </div>
    </div>
  );
}