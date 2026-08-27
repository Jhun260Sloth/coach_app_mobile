import React, { useState, useMemo, useEffect } from "react";
import {
  WifiOff, Calendar, ClipboardList, Heart, Download, Clock, MessageCircle, Star, CheckCircle2,
  AlertTriangle, CreditCard, ShieldCheck, LifeBuoy, Hourglass, RefreshCcw, ChevronLeft, ChevronRight, CalendarX2, CalendarDays,
  Banknote, Scale, BadgeDollarSign, PlayCircle,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES } from "../../data/mockData";
import { CONFIG } from "../../config";
import {
  ADDITIONAL_CHARGE_KIND, ADDITIONAL_CHARGE_PHASE, ADDITIONAL_CHARGE_STATUS,
  BOOKING_STATUS, PAYMENT_STATUS,
} from "../../data/bookings";
import {
  Avatar, BottomActionBar, Card, Badge, SegTabs, ViewModeToggle, ScreenHeader, SectionLabel, Btn, TopBar, EmptyState, StatusPill, Chip, BottomSheet, Row, ScrollFadeRow, HandleTag, BookingCardSkeleton,
} from "../../components/ui/Primitives";
import { StatusBanner } from "../../systems/StateSystem";
import { getBookingCoachName } from "../../utils/name";
import { PaymentDeadlineCard, SessionJourneyTimeline } from "../../components/booking/SessionJourneyTimeline";
import { SportBadge } from "../../components/ui/SportUI";

/** Resolved name for a booking's coach — public name until the booking is
    confirmed, full name afterwards (partner reveal). */
function coachNameFor(booking) {
  const coach = booking ? COACHES.find((c) => c.id === booking.coachId) : null;
  return getBookingCoachName(booking, coach);
}

/* ---- date helpers for the calendar view (booking dates look like "Tue, 22 Jul") ---- */
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseBookingDate(str, year = 2026) {
  const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(str || "");
  if (!m) return null;
  const month = MONTH_ABBR.indexOf(m[2]);
  if (month < 0) return null;
  return new Date(year, month, parseInt(m[1], 10));
}
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
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

/* ---- cancellation policy math (used by the Cancellation Summary sheet below) ----
   CoachNivo uses one platform-wide cancellation policy for every coach: free
   cancellation up to 24h before the session, 50% refund inside 24h. We compare
   against how many hours remain until the session to pick the refund rule. */
function bookingDateTime(dateStr, timeStr) {
  const d = parseBookingDate(dateStr);
  if (!d) return null;
  const m = /(\d{1,2}):(\d{2})\s*([ap]m)/i.exec(timeStr || "");
  if (!m) return d;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toLowerCase();
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  const dt = new Date(d);
  dt.setHours(h, min, 0, 0);
  return dt;
}

function getCancellationOutcome(booking, coach) {
  const sessionAt = bookingDateTime(booking.date, booking.time);
  const hoursUntil = sessionAt ? (sessionAt.getTime() - Date.now()) / 36e5 : null;

  let refundPct = 1;
  let ruleLabel;
  if (hoursUntil == null || hoursUntil >= 24) {
    refundPct = 1;
    ruleLabel = "Cancelled 24h+ before the session - fully refundable under CoachNivo's cancellation policy.";
  } else {
    refundPct = 0.5;
    ruleLabel = "Cancelled inside 24h - CoachNivo's cancellation policy refunds 50% of the session fee.";
  }
  return { refundPct, ruleLabel, hoursUntil, tier: "standard" };
}

export function ScreenClientDashboard({ nav, bookings = [], additionalCharges = [], offline, toast, cancelBooking, isFirstTimeClient }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [tab, setTab] = useState("pending");
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  // First-time clients haven't booked anything yet — show a single, unified
  // empty state pointing them at Discover, instead of the tabbed/calendar UI.
  const showEmptyDashboard = isFirstTimeClient && safeBookings.length === 0;
  const [calMode, setCalMode] = useState("month");
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const pendingChargeBookingIds = new Set(
    additionalCharges
      .filter((charge) => charge.status === ADDITIONAL_CHARGE_STATUS.PENDING)
      .map((charge) => charge.bookingId),
  );
  const pendingPriority = (booking) => {
    if (booking.status === BOOKING_STATUS.AWAITING_PAYMENT && booking.paymentStatus === PAYMENT_STATUS.DUE) return 0;
    if (pendingChargeBookingIds.has(booking.id)) return 1;
    return 2;
  };
  const upcoming = safeBookings.filter((b) => (
    [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETION_PENDING].includes(b?.status)
    && !pendingChargeBookingIds.has(b.id)
  ));
  const pending = safeBookings
    .filter((b) => (
      [BOOKING_STATUS.PENDING, BOOKING_STATUS.AWAITING_PAYMENT].includes(b?.status)
      || pendingChargeBookingIds.has(b.id)
    ))
    .sort((a, b) => pendingPriority(a) - pendingPriority(b));
  const past = safeBookings.filter((b) => [
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.DECLINED,
    BOOKING_STATUS.EXPIRED,
  ].includes(b?.status) && !pendingChargeBookingIds.has(b.id));

  const dated = useMemo(() => safeBookings.map((b) => ({ ...b, _date: parseBookingDate(b.date) })), [safeBookings]);
  const initialDate = useMemo(() => (dated.find((b) => b._date)?._date) || new Date(), [dated]);
  const [cursor, setCursor] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const bookingsOnDate = (d) => dated.filter((b) => b._date && sameDay(b._date, d));

  const weeks = calMode === "month" ? buildMonthGrid(cursor) : [Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))];
  const headerLabel = calMode === "month"
    ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : `${weeks[0][0].toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${weeks[0][6].toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;

  const goPrev = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() - 1, 1) : addDays(c, -7));
  const goNext = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() + 1, 1) : addDays(c, 7));

  const handleCancel = (id) => {
    cancelBooking(id);
    toast(cancelTarget?.status === "pending" ? "Booking request withdrawn" : "Session cancelled");
    setCancelTarget(null);
  };

  const renderCard = (b, i) => {
    const pendingAdditionalCharge = additionalCharges.find((charge) => (
      charge.bookingId === b.id
      && charge.phase === ADDITIONAL_CHARGE_PHASE.COMPLETION
      && charge.status === ADDITIONAL_CHARGE_STATUS.PENDING
    ));
    return (
      <BookingCard
        key={b.id}
        b={b}
        nav={nav}
        past={[BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED].includes(b.status)}
        additionalCharge={pendingAdditionalCharge}
        onAdditionalCharge={() => nav("additional-charge-review", { chargeId: pendingAdditionalCharge?.id, role: "client", backTo: "client-dashboard" })}
        onCancel={() => setCancelTarget(b)}
        onPay={() => nav("payment", { bookingId: b.id })}
        style={{ animationDelay: `${Math.min(i || 0, 8) * 45}ms` }}
      />
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <ScreenHeader
          title="My sessions"
          subtitle="Requests, upcoming sessions and history."
          action={!showEmptyDashboard && <ViewModeToggle value={view} onChange={setView} ariaLabel="Session view" />}
        />
        {offline && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.jet, color: C.white, padding: "9px 12px", borderRadius: 12, marginTop: 12, fontSize: T.label, ...fBody }}>
            <WifiOff size={14} color={C.brand} /> You're offline - showing your last saved sessions.
          </div>
        )}
        {!showEmptyDashboard && view === "list" && (
          <div style={{ marginTop: 16 }}>
            <SegTabs strong value={tab} onChange={setTab} items={[
              { value: "pending", label: "Requests" }, { value: "upcoming", label: "Upcoming" }, { value: "past", label: "Completed" },
            ]} />
          </div>
        )}
        {!showEmptyDashboard && view === "calendar" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 10 }}>
              <button type="button" aria-label="Previous month" onClick={goPrev} style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronLeft size={16} color={C.jet} />
              </button>
              <span style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{headerLabel}</span>
              <button type="button" aria-label="Next month" onClick={goNext} style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronRight size={16} color={C.jet} />
              </button>
            </div>
            <SegTabs value={calMode} onChange={setCalMode} items={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }]} />
          </>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: view === "calendar" ? "14px 18px" : "16px 18px", paddingBottom: 116 }} className="cl-hide-scrollbar">
        {showEmptyDashboard && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <EmptyState
              large
              icon={Calendar}
              title="Your Bookings Will Appear Here"
              body="You haven't booked a coaching session yet. Find a coach that matches your sport, goals, and location to get started."
              ctaLabel="Find My Coaches"
              onCta={() => nav("client-home")}
            />
          </div>
        )}

        {!showEmptyDashboard && view === "list" && (
          <>
            {loading ? (
              <BookingCardSkeleton rows={4} />
            ) : (
              <>
                {tab === "pending" && (pending.length ? <div className="cl-stagger">{pending.map(renderCard)}</div> : <EmptyState icon={Hourglass} title="No active requests" body="Requests awaiting a coach or your payment will show up here." />)}
                {tab === "upcoming" && (upcoming.length ? <div className="cl-stagger">{upcoming.map(renderCard)}</div> : <EmptyState icon={Calendar} title="No upcoming sessions" body="Search for a coach to book your next session." />)}
                {tab === "past" && (past.length ? <div className="cl-stagger">{past.map(renderCard)}</div> : <EmptyState icon={ClipboardList} title="No booking history yet" body="Completed, cancelled, declined and expired bookings will show up here." />)}
              </>
            )}
          </>
        )}

        {!showEmptyDashboard && view === "calendar" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {WEEKDAY_HEADERS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: T.tiny, fontWeight: 700, color: C.slateLight, ...fBody }}>{d}</div>
              ))}
            </div>
            {weeks.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                {row.map((d, di) => {
                  const inRange = calMode === "week" || d.getMonth() === cursor.getMonth();
                  const count = bookingsOnDate(d).length;
                  const isSelected = sameDay(d, selectedDate);
                  return (
                    <button key={di} onClick={() => setSelectedDate(d)} style={{
                      aspectRatio: "1", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${isSelected ? C.brand : C.border}`,
                      background: isSelected ? C.brandTint : C.white,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                      opacity: inRange ? 1 : 0.35,
                    }}>
                      <span style={{ fontSize: T.label, fontWeight: isSelected ? 700 : 500, color: C.jet, ...fBody }}>{d.getDate()}</span>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: count > 0 ? C.brand : "transparent" }} />
                    </button>
                  );
                })}
              </div>
            ))}

            <div style={{ marginTop: 18 }}>
              <SectionLabel>{selectedDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</SectionLabel>
              {bookingsOnDate(selectedDate).length === 0 && (
                <EmptyState icon={CalendarX2} title="No sessions" body="Nothing scheduled for this day." />
              )}
              <div className="cl-stagger">
                {bookingsOnDate(selectedDate).map(renderCard)}
              </div>
            </div>
          </>
        )}
      </div>

      <CancelSheet
        booking={cancelTarget}
        pending={cancelTarget?.status === "pending"}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </div>
  );
}

/* Reschedule — lets the client pick a new day/time from the coach's live availability */
function RescheduleSheet({ booking, onClose, onConfirm }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const coach = booking ? COACHES.find((c) => c.id === booking.coachId) : null;
  const days = coach ? Object.keys(coach.availability) : [];
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Reset picker state whenever a new booking is opened
  React.useEffect(() => {
    if (booking) { setDay(days[0] || null); setTime(null); setConfirming(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  const confirmReschedule = () => {
    setConfirming(true);
    // Simulates re-checking the coach's live calendar before locking in the new time.
    setTimeout(() => { setConfirming(false); onConfirm(booking.id, { date: day, time }); }, 700);
  };

  return (
    <BottomSheet open={!!booking} onClose={onClose} title="Reschedule session" heightPct={78}>
      {booking && (
        <>
          <Card style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={coachNameFor(booking).name} size={40} />
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.service}</div>
              <div style={{ fontSize: T.label, color: C.slate, ...fBody }}>Currently {booking.date} · {booking.time}</div>
            </div>
          </Card>

          {coach ? (
            <>
              <SectionLabel>New day</SectionLabel>
              <ScrollFadeRow style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
                {days.map((d) => (
                  <Chip key={d} active={day === d} onClick={() => { setDay(d); setTime(null); }}>{d}</Chip>
                ))}
              </ScrollFadeRow>

              <SectionLabel>New time</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                {(coach.availability[day] || []).map((t) => (
                  <button key={t} onClick={() => setTime(t)} style={{
                    padding: "12px 0", borderRadius: 12, border: `1.5px solid ${time === t ? C.brand : C.border}`,
                    background: time === t ? C.brandTint : C.white, color: time === t ? C.brand : C.jet,
                    fontWeight: 600, fontSize: T.bodyLg, cursor: "pointer", ...fBody,
                  }}>{t}</button>
                ))}
              </div>

              <Btn full disabled={!day || !time} loading={confirming} loadingText="Confirming…" onClick={confirmReschedule}>
                Confirm new time
              </Btn>
            </>
          ) : (
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody, marginBottom: 16 }}>
              This coach's live availability isn't accessible right now. Message them directly to arrange a new time.
            </div>
          )}
        </>
      )}
    </BottomSheet>
  );
}

/* Cancel — for a confirmed session this now presents a full Cancellation Summary
   (policy-based refund math, payment breakdown, resulting status, explicit
   confirmation) before anything is cancelled. A still-pending request never had
   payment collected, so it keeps the lighter "withdraw" confirmation instead. */
function CancelSheet({ booking, onClose, onConfirm, pending }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const coach = booking ? COACHES.find((c) => c.id === booking.coachId) : null;
  const [understood, setUnderstood] = useState(false);
  useEffect(() => { if (booking) setUnderstood(false); }, [booking?.id]);

  if (pending) {
    return (
      <BottomSheet open={!!booking} onClose={onClose} title="Withdraw this request?" heightPct={58}>
        {booking && (
          <>
            <Card style={{ marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={coachNameFor(booking).name} size={40} />
              <div>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.service}</div>
                <div style={{ fontSize: T.label, color: C.slate, ...fBody }}>{booking.date} · {booking.time} with {coachNameFor(booking).name}</div>
              </div>
            </Card>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.warnTint, borderRadius: 12, padding: 12, marginBottom: 18 }}>
              <AlertTriangle size={14} color={C.brand} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: T.label, color: C.slate, lineHeight: 1.5, ...fBody }}>
                {coachNameFor(booking).name.split(" ")[0]} hasn't responded to this request yet - withdrawing it now won't incur any charge.
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn full variant="danger" onClick={() => onConfirm(booking.id)}>Yes, withdraw request</Btn>
              <Btn full variant="secondary" onClick={onClose}>Keep request</Btn>
            </div>
          </>
        )}
      </BottomSheet>
    );
  }

  const outcome = booking ? getCancellationOutcome(booking, coach) : null;
  const price = booking?.price || 0;
  const fee = Math.round(price * 0.06 * 100) / 100;
  const subtotal = Math.round((price - fee) * 100) / 100;
  const alreadyPaid = booking
    ? [PAYMENT_STATUS.HELD, PAYMENT_STATUS.RELEASED, PAYMENT_STATUS.REFUND_PROCESSING, PAYMENT_STATUS.REFUNDED].includes(booking.paymentStatus)
    : false;
  const refundAmount = alreadyPaid && outcome ? Math.round(subtotal * outcome.refundPct * 100) / 100 : 0;

  return (
    <BottomSheet open={!!booking} onClose={onClose} title="Review Cancellation" heightPct={92}>
      {booking && (
        <>
          <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
            Please review the cancellation outcome before confirming. Refunds and fees are calculated based on CoachNivo's standard cancellation policy.
          </div>

          <SectionLabel>Booking details</SectionLabel>
          <Card style={{ marginBottom: 16 }}>
            <Row label="Service" value={booking.service} />
            <Row label="Coach" value={coachNameFor(booking).name} />
            <Row label="Date" value={booking.date} />
            <Row label="Time" value={booking.time} last />
          </Card>

          <SectionLabel>Payment breakdown</SectionLabel>
          {alreadyPaid ? (
            <Card style={{ marginBottom: 16 }}>
              <Row label="Session Fee" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Platform Service Fee" value={`$${fee.toFixed(2)}`} />
              <Row label="Total Paid" value={`$${price.toFixed(2)}`} bold last />
            </Card>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <CreditCard size={14} color={C.slate} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: T.label, color: C.slate, lineHeight: 1.5, ...fBody }}>No payment has been collected for this booking yet - cancelling now won't incur any charge.</span>
            </div>
          )}

          <SectionLabel>Refund amount</SectionLabel>
          <Card style={{ marginBottom: 16, background: alreadyPaid && refundAmount > 0 ? C.successTint : C.warnTint }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{alreadyPaid ? "You'll be refunded" : "Amount owed"}</span>
              <span style={{ fontSize: T.heading, fontWeight: 700, color: C.jet, ...fDisplay }}>${(alreadyPaid ? refundAmount : 0).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 6, lineHeight: 1.5, ...fBody }}>
              {alreadyPaid ? outcome.ruleLabel : "No charge applies since payment hasn't been sent."}
            </div>
          </Card>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: T.label, color: C.slate, ...fBody }}>Resulting booking status:</span>
            <StatusPill status="cancelled" />
          </div>

          <button onClick={() => setUnderstood((v) => !v)} style={{ display: "flex", width: "100%", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginBottom: 18 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${understood ? C.brand : C.border}`, background: understood ? C.brand : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {understood && <CheckCircle2 size={12} color={C.white} />}
            </div>
            <span style={{ fontSize: T.label, color: C.jet, lineHeight: 1.5, ...fBody }}>I understand the cancellation policy and refund outcome.</span>
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn full variant="danger" disabled={!understood} onClick={() => onConfirm(booking.id)}>Confirm Cancellation</Btn>
            <Btn full variant="secondary" onClick={onClose}>Keep session</Btn>
          </div>
        </>
      )}
    </BottomSheet>
  );
}

/* Receipt — shown when a payments list item is tapped (also used in Account > Payment history) */
export function ReceiptSheet({ booking, onClose }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const total = Number(booking?.paidTotal || booking?.price || 0);
  return (
    <BottomSheet open={!!booking} onClose={onClose} title="Receipt" heightPct={72}>
      {booking && (
        <>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <CheckCircle2 size={24} color={C.success} />
            </div>
            <div style={{ fontSize: T.headingLg, fontWeight: 700, color: C.jet, ...fDisplay }}>${total.toFixed(2)}</div>
            <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>
              {booking.status === "cancelled" ? "Cancelled" : "Paid"} · {booking.date}
            </div>
          </div>

          <Card style={{ marginBottom: 14 }}>
            <Row label="Service" value={booking.service} />
            <Row label="Coach" value={coachNameFor(booking).name} />
            <Row label="Date" value={booking.date} />
            <Row label="Time" value={booking.time} />
            <Row label="Location" value={booking.mode} last />
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <Row label="Package" value={`$${Number(booking.price).toFixed(2)}`} />
            {Number(booking.acceptanceChargeTotal || 0) > 0 && <Row label="Booking extras" value={`$${Number(booking.acceptanceChargeTotal).toFixed(2)}`} />}
            {Number(booking.finalChargeTotal || 0) > 0 && <Row label="Final payment" value={`$${Number(booking.finalChargeTotal).toFixed(2)}`} />}
            <Row label="Total" value={`$${total.toFixed(2)}`} bold last />
          </Card>

          <Card style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 24, borderRadius: 5, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={13} color={C.white} />
            </div>
            <div style={{ fontSize: T.body, color: C.jet, fontWeight: 500, ...fBody }}>Visa •••• 4821</div>
          </Card>

          <Btn full variant="outline" icon={Download}>Download receipt</Btn>
        </>
      )}
    </BottomSheet>
  );
}

export function BookingCard({ b, nav, past, additionalCharge, onAdditionalCharge, onCancel, onPay, style }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const pending = b.status === BOOKING_STATUS.PENDING;
  const live = b.status === BOOKING_STATUS.IN_PROGRESS;
  const paymentDue = !past
    && b.status === BOOKING_STATUS.AWAITING_PAYMENT
    && b.paymentStatus === PAYMENT_STATUS.DUE;
  const additionalPaymentDue = additionalCharge?.status === ADDITIONAL_CHARGE_STATUS.PENDING;
  const needsAttention = paymentDue || additionalPaymentDue;
  const cn = coachNameFor(b);
  const coach = COACHES.find((c) => c.id === b.coachId);
  return (
    <Card
      onClick={() => nav("client-booking-detail", { id: b.id })}
      style={{
        marginBottom: 14,
        border: `1px solid ${C.border}`,
        boxShadow: needsAttention
          ? "0 8px 24px rgba(22,24,29,.06)"
          : "0 1px 2px rgba(22,24,29,.04)",
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: 10, minWidth: 0, marginBottom: 10 }}>
        <Avatar name={cn.name || b.clientName} size={42} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, letterSpacing: "-0.1px", ...fDisplay }}>{b.service}</div>
          <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 3, ...fBody }}>{cn.name || b.clientName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.label, color: C.slateLight, marginTop: 6, ...fBody }}>
            <Clock size={11} /> {b.date} · {b.time}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusPill status={b.status} />
        {past && b.status === BOOKING_STATUS.COMPLETED && b.reviewed && <Badge tone="success" icon={CheckCircle2}>Reviewed</Badge>}
      </div>
      {additionalPaymentDue && (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: 10, background: C.warnTint, borderRadius: 14, padding: "10px 12px", marginTop: 12 }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 11, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BadgeDollarSign size={17} color={C.warnStrong} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>Additional payment due · ${Number(additionalCharge.amount).toFixed(2)}</div>
            <div style={{ fontSize: T.caption, color: C.slate, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...fBody }}>{additionalCharge.reason}</div>
          </div>
        </div>
      )}
      {paymentDue && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.brandTint, borderRadius: 12, padding: "9px 12px", marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
          <CreditCard size={14} color={C.brand} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: T.label, color: C.jet, lineHeight: 1.4, ...fBody }}>{(cn.name || "Your coach").split(" ")[0]} accepted - send your payment to lock in the session.</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
        {/* Keep cards focused on quick actions. Rescheduling stays in booking
            details, where clients can review the session before choosing a slot. */}
        {!past && (
          <>
            {live ? (
              <Btn size="sm" variant="dark" full icon={CheckCircle2} onClick={() => nav("session-progress", { bookingId: b.id, role: "client" })}>Live session</Btn>
            ) : paymentDue ? (
              <Btn size="sm" variant="dark" full onClick={onPay}>Pay now</Btn>
            ) : additionalPaymentDue ? (
              <Btn size="sm" variant="dark" full onClick={onAdditionalCharge}>Review</Btn>
            ) : (
              <Btn size="sm" variant="secondary" full onClick={onCancel}>{pending ? "Withdraw request" : "Cancel booking"}</Btn>
            )}
            <Btn size="sm" variant="dark" icon={MessageCircle} ariaLabel={`Message ${cn.name}`} onClick={() => nav("chat-thread", { name: b.coachName || b.clientName, handle: coach?.handle, context: `${b.service} · ${b.date}`, bookingId: b.id })} />
          </>
        )}
        {/* Completed / cancelled: always offer a fast rebook path alongside whatever review state applies. */}
        {past && b.status === BOOKING_STATUS.COMPLETED && !b.reviewed && (
          <>
            <Btn size="sm" full onClick={() => nav("leave-review", { bookingId: b.id, name: cn.name || b.coachName })}>Leave a review</Btn>
            <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Book again</Btn>
          </>
        )}
        {past && b.status === BOOKING_STATUS.COMPLETED && b.reviewed && (
          <>
            <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Book again</Btn>
          </>
        )}
        {past && [BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED].includes(b.status) && (
          <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Find another time</Btn>
        )}
        {past && b.status === BOOKING_STATUS.CANCELLED && (
          <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Book again</Btn>
        )}
      </div>
    </Card>
  );
}

/* Booking details — the client-side counterpart to the coach's booking detail page.
   Surfaces the same categories of information (party info, session details, notes,
   booking policy) but never exposes the Accept/Decline workflow, which is coach-only. */
export function ScreenClientBookingDetail({ nav, goBack, params, bookings, toast, cancelBooking, rescheduleBooking, sessionDisputes = [], additionalCharges = [] }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const booking = bookings.find((b) => b.id === params.id);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Booking details" onBack={() => goBack("client-dashboard")} />
        <EmptyState icon={ClipboardList} title="Booking not found" body="This booking may have been removed." />
      </div>
    );
  }

  const coach = COACHES.find((c) => c.id === booking.coachId);
  const cn = coachNameFor(booking);
  const isPending = booking.status === BOOKING_STATUS.PENDING;
  const isAwaitingPayment = booking.status === BOOKING_STATUS.AWAITING_PAYMENT;
  const isUpcoming = booking.status === BOOKING_STATUS.CONFIRMED;
  const isLive = booking.status === BOOKING_STATUS.IN_PROGRESS;
  const isCompletionPending = booking.status === BOOKING_STATUS.COMPLETION_PENDING;
  const isPast = [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED].includes(booking.status);
  const priceLabel = typeof booking.price === "number" ? `$${booking.price.toFixed(2)}` : `$${booking.price}`;
  const relatedCase = sessionDisputes.find((item) => item.bookingId === booking.id);
  const acceptanceCharges = additionalCharges.filter((item) => (
    item.bookingId === booking.id
    && item.phase === ADDITIONAL_CHARGE_PHASE.ACCEPTANCE
    && ![ADDITIONAL_CHARGE_STATUS.CANCELLED, ADDITIONAL_CHARGE_STATUS.DECLINED].includes(item.status)
  ));
  const completionCharge = additionalCharges.find((item) => (
    item.bookingId === booking.id
    && item.phase === ADDITIONAL_CHARGE_PHASE.COMPLETION
    && item.status === ADDITIONAL_CHARGE_STATUS.PENDING
  )) || additionalCharges.find((item) => (
    item.bookingId === booking.id
    && item.phase === ADDITIONAL_CHARGE_PHASE.COMPLETION
    && item.status !== ADDITIONAL_CHARGE_STATUS.CANCELLED
  ));
  const requiredAcceptanceTotal = acceptanceCharges
    .filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.REQUIRED)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const requiredCheckoutTotal = Number(booking.price || 0) + requiredAcceptanceTotal;
  const pendingFinalCharge = completionCharge?.status === ADDITIONAL_CHARGE_STATUS.PENDING;

  const handleReschedule = (id, when) => {
    rescheduleBooking(id, when);
    toast(`Session rescheduled to ${when.date}, ${when.time}`);
    setRescheduleOpen(false);
  };

  const handleCancelConfirm = (id) => {
    cancelBooking(id);
    toast(isPending ? "Booking request withdrawn" : "Session cancelled");
    setCancelOpen(false);
    nav("client-dashboard");
  };

  const messageParams = {
    name: booking.coachName,
    handle: coach?.handle,
    context: `${booking.service} · ${booking.date}`,
    bookingId: booking.id,
    backTo: "client-booking-detail",
    backParams: { id: booking.id },
  };

  const goSupport = () => nav("support", {
    presetTab: "chat",
    bookingContext: `${booking.service} · ${booking.date}`,
    backTo: "client-booking-detail",
    backParams: { id: booking.id },
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Booking details" onBack={() => goBack("client-dashboard")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px" }} className="cl-hide-scrollbar">

        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={cn.name} size={50} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.subtitleLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{cn.name}</div>
              {cn.handle && <HandleTag handle={cn.handle} size={11.5} color={C.slateLight} />}
              {cn.revealed && <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Full name shared with your booking partner</div>}
              {coach && <div style={{ fontSize: T.label, color: C.slate, ...fBody }}>{coach.suburb}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            {coach?.verified?.identity && (
              <Badge tone="orange" icon={ShieldCheck}>Verified coach</Badge>
            )}
            <StatusPill status={booking.status} />
          </div>
        </Card>

        {booking.status === BOOKING_STATUS.DECLINED && (
          <div style={{ marginBottom: 14 }}>
            <StatusBanner state="bookingDeclined" compact />
          </div>
        )}
        {booking.status === BOOKING_STATUS.EXPIRED && (
          <div style={{ marginBottom: 14 }}>
            <StatusBanner state="bookingExpired" compact />
          </div>
        )}

        <SectionLabel>Booking details</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Mode" value={booking.mode} />
          {booking.participants && <Row label="For" value={booking.participants} />}
          {booking.paidTotal ? (
            <>
              <Row label="Package price" value={priceLabel} />
              {Number(booking.acceptanceChargeTotal || 0) > 0 && <Row label="Accepted extras" value={`$${Number(booking.acceptanceChargeTotal).toFixed(2)}`} />}
              <Row label="Total paid" value={`$${Number(booking.paidTotal).toFixed(2)}`} bold last />
            </>
          ) : <Row label="Price" value={priceLabel} bold last />}
        </Card>

        <div style={{ marginBottom: 14 }}>
          <SessionJourneyTimeline booking={booking} role="client" />
        </div>

        {relatedCase && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11, background: C.warnTint, border: "none" }} onClick={() => nav("dispute-status", { caseId: relatedCase.id, role: "client", backTo: "client-booking-detail", bookingId: booking.id })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scale size={18} color={C.brand} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{relatedCase.status === "resolved" ? "Case decision available" : "Session report under review"}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{relatedCase.categoryLabel} · View status and outcome</div></div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {isAwaitingPayment && acceptanceCharges.length > 0 && (
          <Card style={{ marginBottom: 14, padding: 16, background: C.brandTint, border: "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: T.title, fontWeight: 750, color: C.jet, ...fDisplay }}>Your final price is ready</div>
                <div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{acceptanceCharges.filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.REQUIRED).length} required cost{acceptanceCharges.filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.REQUIRED).length === 1 ? "" : "s"} included · {acceptanceCharges.filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.OPTIONAL).length} optional add-on{acceptanceCharges.filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.OPTIONAL).length === 1 ? "" : "s"}</div>
              </div>
              <div style={{ fontSize: T.titleLg, fontWeight: 800, color: C.jet, ...fDisplay }}>${requiredCheckoutTotal.toFixed(2)}</div>
            </div>
          </Card>
        )}

        {completionCharge && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11, background: pendingFinalCharge ? C.warnTint : C.white, border: pendingFinalCharge ? "none" : `1px solid ${C.border}` }} onClick={() => nav("additional-charge-review", { chargeId: completionCharge.id, role: "client", backTo: "client-booking-detail" })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BadgeDollarSign size={18} color={pendingFinalCharge ? C.warnStrong : C.brand} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{pendingFinalCharge ? "Final payment required" : "Final payment"} · ${Number(completionCharge.amount).toFixed(2)}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{completionCharge.reason} · {pendingFinalCharge ? "Pay before confirming completion" : completionCharge.status.replace("_", " ")}</div></div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {booking.notes && (
          <>
            <SectionLabel>Your notes to the coach</SectionLabel>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: T.body, color: C.slate, lineHeight: 1.6, whiteSpace: "pre-line", ...fBody }}>{booking.notes}</p>
            </Card>
          </>
        )}

        {booking.safetyNotes && (
          <>
            <SectionLabel>Health & safety information shared</SectionLabel>
            <Card style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10, background: C.warnTint, border: "none" }}>
              <ShieldCheck size={17} color={C.warnStrong} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: T.body, color: C.jet, lineHeight: 1.6, whiteSpace: "pre-line", ...fBody }}>{booking.safetyNotes}</p>
            </Card>
          </>
        )}

        <SectionLabel>Booking policy</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${C.border}` }}>
            <Calendar size={15} color={C.slate} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 2, ...fBody }}>Cancellation policy</div>
              <div style={{ fontSize: T.label, color: C.slate, lineHeight: 1.5, ...fBody }}>
                {CONFIG.cancellationPolicy}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={15} color={C.slate} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 2, ...fBody }}>No-show policy</div>
              <div style={{ fontSize: T.label, color: C.slate, lineHeight: 1.5, ...fBody }}>
                {coach?.noShowPolicy || "Failing to attend without notice may forfeit some or all of your session fee."}
              </div>
            </div>
          </div>
        </Card>

        {isUpcoming && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              onClick={() => nav("session-prep", { coachId: booking.coachId, packageId: coach?.packages?.[0]?.id, date: booking.date })}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.white,
                cursor: "pointer", ...fBody,
              }}
            >
              <CalendarDays size={14} color={C.jet} />
              <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet }}>Session prep</span>
            </button>
          </div>
        )}

        {isPast && booking.status === BOOKING_STATUS.CANCELLED && booking.refundStatus && (
          <div style={{ marginBottom: 14 }}>
            <button
              onClick={() => nav("refund-status", { booking })}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                borderRadius: 12, border: `1px solid ${C.border}`, background: C.white,
                cursor: "pointer", ...fBody,
              }}
            >
              <Clock size={15} color={C.brand} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>Refund status</div>
                <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>
                  {booking.refundStatus === "refunded" ? "Refund complete" : "Refund in progress"}
                </div>
              </div>
              <ChevronRight size={16} color={C.slateLight} />
            </button>
          </div>
        )}

        {isAwaitingPayment && booking.paymentStatus === PAYMENT_STATUS.DUE && (
          <div style={{ marginBottom: 14 }}>
            <PaymentDeadlineCard booking={booking} role="client" />
          </div>
        )}

        {isUpcoming && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 14 }}>
            <Btn size="sm" variant="secondary" full onClick={() => setRescheduleOpen(true)}>Reschedule</Btn>
            <Btn size="sm" variant="outline" full onClick={() => setCancelOpen(true)}>Cancel</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} ariaLabel={`Message ${cn.name}`} onClick={() => nav("chat-thread", messageParams)} />
          </div>
        )}

        {isLive && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 14 }}>
            <Btn size="sm" variant="dark" full icon={MessageCircle} ariaLabel={`Message ${cn.name}`} onClick={() => nav("chat-thread", messageParams)} />
          </div>
        )}

        {isPast && booking.status === BOOKING_STATUS.COMPLETED && !booking.reviewed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <Btn full variant="outline" icon={Banknote} onClick={() => nav("funds-release-status", { bookingId: booking.id, role: "client", backTo: "client-booking-detail" })}>View payment release</Btn>
            <Btn full onClick={() => nav("leave-review", { bookingId: booking.id, name: cn.name || booking.coachName })}>Leave a review</Btn>
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Book again</Btn>
            {!relatedCase && <Btn full variant="ghost" icon={Scale} onClick={() => nav("dispute-create", { bookingId: booking.id, role: "client", category: "session_not_delivered", backTo: "client-booking-detail" })}>Report a session issue</Btn>}
          </div>
        )}
        {isPast && booking.status === BOOKING_STATUS.COMPLETED && booking.reviewed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <Badge tone="success" icon={CheckCircle2} style={{ alignSelf: "flex-start" }}>Review submitted</Badge>
            <Btn full variant="outline" icon={Banknote} onClick={() => nav("funds-release-status", { bookingId: booking.id, role: "client", backTo: "client-booking-detail" })}>View payment release</Btn>
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Book again</Btn>
            {!relatedCase && <Btn full variant="ghost" icon={Scale} onClick={() => nav("dispute-create", { bookingId: booking.id, role: "client", category: "session_not_delivered", backTo: "client-booking-detail" })}>Report a session issue</Btn>}
          </div>
        )}
        {isPast && booking.status === BOOKING_STATUS.CANCELLED && (
          <div style={{ marginBottom: 14 }}>
            {booking.refundStatus === "processing" && <div style={{ marginBottom: 10 }}><StatusBanner state="refundProcessing" compact /></div>}
            {booking.refundStatus === "refunded" && <div style={{ marginBottom: 10 }}><StatusBanner state="paymentRefunded" message={`$${Number(booking.paidTotal || booking.price).toFixed(2)} was refunded to your original payment method.`} compact /></div>}
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Book again</Btn>
          </div>
        )}

        {isPast && [BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED].includes(booking.status) && (
          <div style={{ marginBottom: 14 }}>
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Find another time</Btn>
          </div>
        )}

        <Btn full variant="outline" icon={LifeBuoy} onClick={goSupport}>Contact support</Btn>
      </div>

      {isPending && (
        <BottomActionBar>
          <Btn variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", messageParams)} />
          <Btn full variant="danger" onClick={() => setCancelOpen(true)}>Withdraw</Btn>
        </BottomActionBar>
      )}

      {isAwaitingPayment && booking.paymentStatus === PAYMENT_STATUS.DUE && (
        <BottomActionBar>
          <Btn variant="secondary" icon={MessageCircle} ariaLabel={`Message ${cn.name}`} title={`Message ${cn.name}`} onClick={() => nav("chat-thread", messageParams)} />
          <Btn full onClick={() => nav("payment", { bookingId: booking.id })}>Review & pay ${requiredCheckoutTotal.toFixed(2)}</Btn>
        </BottomActionBar>
      )}

      {(isLive || isCompletionPending) && pendingFinalCharge && (
        <BottomActionBar>
          <Btn full icon={CreditCard} onClick={() => nav("additional-charge-payment", { chargeId: completionCharge.id, role: "client" })}>Pay final ${Number(completionCharge.amount).toFixed(2)}</Btn>
        </BottomActionBar>
      )}

      {isCompletionPending && !pendingFinalCharge && (
        <BottomActionBar>
          <div style={{ width: "100%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.fog, borderRadius: 12, padding: "10px 16px", color: C.slate, fontSize: T.body, fontWeight: 600, ...fBody }}>
            <Clock size={15} color={C.brand} />
            <span>Waiting for your coach to finish</span>
          </div>
        </BottomActionBar>
      )}

      {isUpcoming && (
        <BottomActionBar>
          <Btn full icon={PlayCircle} onClick={() => nav("client-session-start", { bookingId: booking.id })}>Start session</Btn>
        </BottomActionBar>
      )}

      {isLive && !pendingFinalCharge && (
        <BottomActionBar>
          <Btn full icon={CheckCircle2} onClick={() => nav("session-progress", { bookingId: booking.id, role: "client" })}>View live session</Btn>
        </BottomActionBar>
      )}

      <RescheduleSheet
        booking={rescheduleOpen ? booking : null}
        onClose={() => setRescheduleOpen(false)}
        onConfirm={handleReschedule}
      />
      <CancelSheet
        booking={cancelOpen ? booking : null}
        pending={isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}

export function ScreenLeaveReview({ nav, goBack, params, toast, bookings = [], setBookings }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const booking = params?.bookingId ? bookings.find((item) => item.id === params.bookingId) : null;
  const name = params?.name
    || booking?.coachName
    || COACHES[0].name;
  const coach = COACHES.find((item) => item.id === booking?.coachId)
    || COACHES.find((item) => item.name === name);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const options = ["Great communicator", "Punctual", "Well prepared", "Motivating", "Flexible"];
  const ratingLabels = ["", "Needs improvement", "Fair", "Good", "Great", "Excellent"];
  const maxReviewLength = 500;
  const toggle = (t) => setTags((arr) => arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);

  const submitReview = () => {
    if (!rating || submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      if (booking?.id) {
        setBookings?.((items) => items.map((item) => item.id === booking.id
          ? { ...item, reviewed: true, review: { rating, tags, comment: review.trim() } }
          : item));
      }
      toast("Review sent - thank you!");
      nav("client-dashboard");
    }, 450);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Leave a review" onBack={() => goBack ? goBack() : nav("client-dashboard")} />

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px 32px" }} className="cl-hide-scrollbar">
        <Card style={{ padding: 16, background: C.fog, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={name} src={coach?.avatar} size={52} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{name}</div>
              <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.45, marginTop: 2, ...fBody }}>
                {booking?.service || "Completed coaching session"}
              </div>
              {coach?.sport && <div style={{ marginTop: 6 }}><SportBadge sport={coach.sport} compact /></div>}
              {booking?.date && (
                <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 3, ...fBody }}>
                  {booking.date} · {booking.time}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card style={{ padding: "18px 14px", textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: T.heading, fontWeight: 700, color: C.jet, ...fDisplay }}>How was your session?</div>
          <div style={{ fontSize: T.body, color: C.slate, marginTop: 4, ...fBody }}>Tap a star to share your overall experience.</div>
          <div role="radiogroup" aria-label="Session rating" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 12 }}>
            {[1, 2, 3, 4, 5].map((value) => {
              const active = value <= rating;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}: ${ratingLabels[value]}`}
                  key={value}
                  onClick={() => setRating(value)}
                  style={{
                    width: LAYOUT.touchTarget, height: LAYOUT.touchTarget, padding: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none", borderRadius: LAYOUT.buttonRadius, cursor: "pointer",
                  }}
                >
                  <Star aria-hidden="true" size={30} strokeWidth={1.8} fill={active ? C.brand : "none"} color={active ? C.brand : C.border} />
                </button>
              );
            })}
          </div>
          <div aria-live="polite" style={{ minHeight: 18, fontSize: T.labelLg, fontWeight: 600, color: rating ? C.brand : C.slateLight, marginTop: 5, ...fBody }}>
            {rating ? ratingLabels[rating] : "No rating selected"}
          </div>
        </Card>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>What stood out?</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.45, marginTop: 3, marginBottom: 10, ...fBody }}>Choose any highlights that describe your session.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {options.map((tag) => <Chip key={tag} active={tags.includes(tag)} onClick={() => toggle(tag)}>{tag}</Chip>)}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 7 }}>
            <label htmlFor="client-review" style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Share more</label>
            <span style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>Optional</span>
          </div>
          <textarea
            id="client-review"
            name="client-review"
            value={review}
            maxLength={maxReviewLength}
            onChange={(event) => setReview(event.target.value)}
            placeholder="What did you enjoy, and what could help future clients?"
            rows={5}
            className="cl-input"
            style={{
              display: "block", width: "100%", minHeight: 112, boxSizing: "border-box",
              border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "12px 13px",
              fontSize: T.bodyLg, lineHeight: 1.5, resize: "none", outline: "none",
              color: C.jet, background: C.white, ...fBody,
            }}
          />
          <div style={{ textAlign: "right", fontSize: T.caption, color: C.slateLight, marginTop: 5, ...fBody }}>{review.length}/{maxReviewLength}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: 12, borderRadius: LAYOUT.inputRadius, background: C.fog, marginTop: 14 }}>
          <ShieldCheck aria-hidden="true" size={17} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>
            Reviews are available only after verified bookings and are checked before appearing publicly.
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 18px", paddingBottom: "max(28px, env(safe-area-inset-bottom))", borderTop: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
        <Btn full disabled={!rating} loading={submitting} loadingText="Sending review…" icon={Star} onClick={submitReview}>Send review</Btn>
      </div>
    </div>
  );
}
