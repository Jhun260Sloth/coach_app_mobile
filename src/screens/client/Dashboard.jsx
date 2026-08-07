import React, { useState, useMemo, useEffect } from "react";
import {
  WifiOff, Calendar, ClipboardList, Heart, Download, Clock, MessageCircle, Star, CheckCircle2,
  AlertTriangle, CreditCard, ShieldCheck, LifeBuoy, Hourglass, RefreshCcw, ChevronLeft, ChevronRight, CalendarX2,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES } from "../../data/mockData";
import {
  Avatar, Card, Badge, SegTabs, SectionLabel, Btn, TopBar, EmptyState, StatusPill, Chip, BottomSheet, Row, ScrollFadeRow,
} from "../../components/ui/Primitives";
import { StatusBanner } from "../../systems/StateSystem";

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
   Coach policy strings follow a "Tier — rule" format, e.g. "Moderate — free reschedule
   up to 24h before session, 50% refund inside 24h." We read the tier keyword to pick
   a refund rule, then compare against how many hours remain until the session. */
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
  const policyText = coach?.cancellationPolicy || "";
  const tier = /strict/i.test(policyText) ? "strict" : /moderate/i.test(policyText) ? "moderate" : /flexible/i.test(policyText) ? "flexible" : "standard";
  const sessionAt = bookingDateTime(booking.date, booking.time);
  const hoursUntil = sessionAt ? (sessionAt.getTime() - Date.now()) / 36e5 : null;

  let refundPct = 1;
  let ruleLabel;
  if (tier === "flexible") {
    if (hoursUntil == null || hoursUntil >= 12) { refundPct = 1; ruleLabel = "Cancelled 12h+ before the session — fully refundable under this coach's flexible policy."; }
    else { refundPct = 0; ruleLabel = "Cancelled inside the 12-hour free-cancellation window — this coach's policy makes it non-refundable."; }
  } else if (tier === "moderate") {
    if (hoursUntil == null || hoursUntil >= 24) { refundPct = 1; ruleLabel = "Cancelled 24h+ before the session — fully refundable under this coach's moderate policy."; }
    else { refundPct = 0.5; ruleLabel = "Cancelled inside 24h — this coach's moderate policy refunds 50% of the session fee."; }
  } else if (tier === "strict") {
    if (hoursUntil == null || hoursUntil >= 48) { refundPct = 0.5; ruleLabel = "Cancelled 48h+ before the session — this coach's strict policy refunds 50% of the session fee."; }
    else { refundPct = 0; ruleLabel = "Cancelled inside 48h — this coach's strict policy is non-refundable."; }
  } else {
    refundPct = 1; ruleLabel = "Standard policy — fully refundable.";
  }
  return { refundPct, ruleLabel, hoursUntil, tier };
}

export function ScreenClientDashboard({ nav, bookings, offline, toast, cancelBooking, rescheduleBooking, payBooking }) {
  const [tab, setTab] = useState("pending");
  const [view, setView] = useState("list");
  const [calMode, setCalMode] = useState("month");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const dated = useMemo(() => bookings.map((b) => ({ ...b, _date: parseBookingDate(b.date) })), [bookings]);
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

  const handleReschedule = (id, when) => {
    rescheduleBooking(id, when);
    toast(`Session rescheduled to ${when.date}, ${when.time}`);
    setRescheduleTarget(null);
  };

  const handleCancel = (id) => {
    cancelBooking(id);
    toast(cancelTarget?.status === "pending" ? "Booking request withdrawn" : "Session cancelled");
    setCancelTarget(null);
  };

  const renderCard = (b) => (
    <BookingCard
      key={b.id}
      b={b}
      nav={nav}
      past={b.status === "completed" || b.status === "cancelled"}
      onReschedule={() => setRescheduleTarget(b)}
      onCancel={() => setCancelTarget(b)}
      onPay={() => { payBooking(b.id); toast("Payment sent — your booking is fully confirmed."); }}
    />
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>My sessions</div>
        {offline && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.jet, color: C.white, padding: "9px 12px", borderRadius: 12, marginTop: 12, fontSize: 12, ...fBody }}>
            <WifiOff size={14} color={C.orange} /> You're offline — showing your last saved sessions.
          </div>
        )}
        <div style={{ marginTop: 14, marginBottom: 10 }}>
          <SegTabs value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "calendar", label: "Calendar" }]} />
        </div>
        {view === "list" && (
          <SegTabs value={tab} onChange={setTab} items={[
            { value: "pending", label: "Pending" }, { value: "upcoming", label: "Upcoming" }, { value: "past", label: "Completed" },
          ]} />
        )}
        {view === "calendar" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={goPrev} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronLeft size={16} color={C.jet} />
              </button>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.jet, ...fDisplay }}>{headerLabel}</span>
              <button onClick={goNext} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronRight size={16} color={C.jet} />
              </button>
            </div>
            <SegTabs value={calMode} onChange={setCalMode} items={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }]} />
          </>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: view === "calendar" ? "14px 20px 100px" : "16px 20px 100px" }}>
        {view === "list" && (
          <>
            {tab === "pending" && (pending.length ? pending.map(renderCard) : <EmptyState icon={Hourglass} title="No pending requests" body="Requests waiting on a coach's response will show up here." />)}
            {tab === "upcoming" && (upcoming.length ? upcoming.map(renderCard) : <EmptyState icon={Calendar} title="No upcoming sessions" body="Search for a coach to book your next session." />)}
            {tab === "past" && (past.length ? past.map(renderCard) : <EmptyState icon={ClipboardList} title="No past sessions yet" body="Completed sessions will show up here." />)}
          </>
        )}

        {view === "calendar" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {WEEKDAY_HEADERS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: C.slateLight, ...fBody }}>{d}</div>
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
                      border: `1px solid ${isSelected ? C.orange : C.border}`,
                      background: isSelected ? C.orangeTint : C.white,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                      opacity: inRange ? 1 : 0.35,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: C.jet, ...fBody }}>{d.getDate()}</span>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: count > 0 ? C.orange : "transparent" }} />
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
              {bookingsOnDate(selectedDate).map(renderCard)}
            </div>
          </>
        )}
      </div>

      <RescheduleSheet
        booking={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={handleReschedule}
      />
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
            <Avatar name={booking.coachName} size={40} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.service}</div>
              <div style={{ fontSize: 12, color: C.slate, ...fBody }}>Currently {booking.date} · {booking.time}</div>
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
                    padding: "12px 0", borderRadius: 12, border: `1.5px solid ${time === t ? C.orange : C.border}`,
                    background: time === t ? C.orangeTint : C.white, color: time === t ? C.orange : C.jet,
                    fontWeight: 600, fontSize: 13.5, cursor: "pointer", ...fBody,
                  }}>{t}</button>
                ))}
              </div>

              <Btn full disabled={!day || !time} loading={confirming} loadingText="Confirming…" onClick={confirmReschedule}>
                Confirm new time
              </Btn>
            </>
          ) : (
            <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody, marginBottom: 16 }}>
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
  const coach = booking ? COACHES.find((c) => c.id === booking.coachId) : null;
  const [understood, setUnderstood] = useState(false);
  useEffect(() => { if (booking) setUnderstood(false); }, [booking?.id]);

  if (pending) {
    return (
      <BottomSheet open={!!booking} onClose={onClose} title="Withdraw this request?" heightPct={58}>
        {booking && (
          <>
            <Card style={{ marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={booking.coachName} size={40} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.service}</div>
                <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{booking.date} · {booking.time} with {booking.coachName}</div>
              </div>
            </Card>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.warnTint, borderRadius: 12, padding: 12, marginBottom: 18 }}>
              <AlertTriangle size={14} color={C.orange} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>
                {booking.coachName.split(" ")[0]} hasn't responded to this request yet — withdrawing it now won't incur any charge.
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
  const alreadyPaid = booking ? !booking.paymentDue : false;
  const refundAmount = alreadyPaid && outcome ? Math.round(subtotal * outcome.refundPct * 100) / 100 : 0;

  return (
    <BottomSheet open={!!booking} onClose={onClose} title="Review Cancellation" heightPct={92}>
      {booking && (
        <>
          <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
            Please review the cancellation outcome before confirming. Refunds and fees are calculated based on the coach's cancellation policy.
          </div>

          <SectionLabel>Booking details</SectionLabel>
          <Card style={{ marginBottom: 16 }}>
            <Row label="Service" value={booking.service} />
            <Row label="Coach" value={booking.coachName} />
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
              <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>No payment has been collected for this booking yet — cancelling now won't incur any charge.</span>
            </div>
          )}

          <SectionLabel>Refund amount</SectionLabel>
          <Card style={{ marginBottom: 16, background: alreadyPaid && refundAmount > 0 ? C.successTint : C.warnTint }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{alreadyPaid ? "You'll be refunded" : "Amount owed"}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.jet, ...fDisplay }}>${(alreadyPaid ? refundAmount : 0).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 11.5, color: C.slate, marginTop: 6, lineHeight: 1.5, ...fBody }}>
              {alreadyPaid ? outcome.ruleLabel : "No charge applies since payment hasn't been sent."}
            </div>
          </Card>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 12, color: C.slate, ...fBody }}>Resulting booking status:</span>
            <StatusPill status="cancelled" />
          </div>

          <button onClick={() => setUnderstood((v) => !v)} style={{ display: "flex", width: "100%", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginBottom: 18 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${understood ? C.orange : C.border}`, background: understood ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {understood && <CheckCircle2 size={12} color={C.white} />}
            </div>
            <span style={{ fontSize: 12, color: C.jet, lineHeight: 1.5, ...fBody }}>I understand the cancellation policy and refund outcome.</span>
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
  const fee = booking ? Math.round(booking.price * 0.06 * 100) / 100 : 0;
  const subtotal = booking ? Math.round((booking.price - fee) * 100) / 100 : 0;
  return (
    <BottomSheet open={!!booking} onClose={onClose} title="Receipt" heightPct={72}>
      {booking && (
        <>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <CheckCircle2 size={24} color={C.success} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.jet, ...fDisplay }}>${booking.price.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>
              {booking.status === "cancelled" ? "Cancelled" : "Paid"} · {booking.date}
            </div>
          </div>

          <Card style={{ marginBottom: 14 }}>
            <Row label="Service" value={booking.service} />
            <Row label="Coach" value={booking.coachName} />
            <Row label="Date" value={booking.date} />
            <Row label="Time" value={booking.time} />
            <Row label="Location" value={booking.mode} last />
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <Row label="Session fee" value={`$${subtotal.toFixed(2)}`} />
            <Row label="Service fee" value={`$${fee.toFixed(2)}`} />
            <Row label="Total" value={`$${booking.price.toFixed(2)}`} bold last />
          </Card>

          <Card style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 24, borderRadius: 5, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={13} color={C.white} />
            </div>
            <div style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Visa •••• 4821</div>
          </Card>

          <Btn full variant="outline" icon={Download}>Download receipt</Btn>
        </>
      )}
    </BottomSheet>
  );
}

export function BookingCard({ b, nav, past, onReschedule, onCancel, onPay }) {
  const pending = b.status === "pending";
  const paymentDue = !past && b.status === "confirmed" && b.paymentDue;
  return (
    <Card
      onClick={() => nav("client-booking-detail", { id: b.id })}
      style={{ marginBottom: 14, border: `1px solid ${paymentDue ? C.orange : C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
          <Avatar name={b.coachName || b.clientName} size={42} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.jet, letterSpacing: "-0.1px", ...fDisplay }}>{b.service}</div>
            <div style={{ fontSize: 12.5, color: C.slate, marginTop: 3, ...fBody }}>{b.coachName || b.clientName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.slateLight, marginTop: 6, ...fBody }}>
              <Clock size={11} /> {b.date} · {b.time}
            </div>
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>
      {paymentDue && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.orangeTint, borderRadius: 12, padding: "9px 12px", marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
          <CreditCard size={14} color={C.orange} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12, color: C.jet, lineHeight: 1.4, ...fBody }}>{(b.coachName || "Your coach").split(" ")[0]} accepted — send your payment to lock in the session.</span>
          <Btn size="sm" variant="dark" onClick={onPay}>Pay now</Btn>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
        {/* Upcoming (confirmed): reschedule / cancel are the two decisions a client needs to make; message is a quick escape hatch, not a primary action, so it stays icon-only. */}
        {!past && !pending && (
          <>
            <Btn size="sm" variant="secondary" full onClick={onReschedule}>Reschedule</Btn>
            <Btn size="sm" variant="outline" onClick={onCancel}>Cancel</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", { name: b.coachName || b.clientName, context: `${b.service} · ${b.date}`, bookingId: b.id })} />
          </>
        )}
        {/* Pending: tapping the card already opens details, so a duplicate "View details" button is dead weight.
            The two things a client actually wants here are to nudge the coach or pull out of the request. */}
        {!past && pending && (
          <>
            <Btn size="sm" variant="outline" full onClick={onCancel}>Withdraw</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", { name: b.coachName || b.clientName, context: `${b.service} · ${b.date}`, bookingId: b.id })} />
          </>
        )}
        {/* Completed / cancelled: always offer a fast rebook path alongside whatever review state applies. */}
        {past && b.status === "completed" && !b.reviewed && (
          <>
            <Btn size="sm" full onClick={() => nav("leave-review", { bookingId: b.id, name: b.coachName })}>Leave a review</Btn>
            <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Book again</Btn>
          </>
        )}
        {past && b.status === "completed" && b.reviewed && (
          <>
            <Badge tone="success" icon={CheckCircle2}>Review submitted</Badge>
            <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Book again</Btn>
          </>
        )}
        {past && b.status === "cancelled" && (
          <Btn size="sm" variant="outline" full icon={RefreshCcw} onClick={() => nav("coach-profile", { id: b.coachId })}>Book again</Btn>
        )}
      </div>
    </Card>
  );
}

/* Booking details — the client-side counterpart to the coach's booking detail page.
   Surfaces the same categories of information (party info, session details, notes,
   booking policy) but never exposes the Accept/Decline workflow, which is coach-only. */
export function ScreenClientBookingDetail({ nav, params, bookings, toast, cancelBooking, rescheduleBooking, setDraft }) {
=======
export function ScreenClientBookingDetail({ nav, params, bookings, toast, cancelBooking, rescheduleBooking, payBooking }) {
>>>>>>> main
  const booking = bookings.find((b) => b.id === params.id);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!booking) {
    return (
      <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Booking details" onBack={() => nav("client-dashboard")} />
        <EmptyState icon={ClipboardList} title="Booking not found" body="This booking may have been removed." />
      </div>
    );
  }

  const coach = COACHES.find((c) => c.id === booking.coachId);
  const isPending = booking.status === "pending";
  const isUpcoming = booking.status === "confirmed";
  const isPast = booking.status === "completed" || booking.status === "cancelled";
  const priceLabel = typeof booking.price === "number" ? `$${booking.price.toFixed(2)}` : `$${booking.price}`;

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
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Booking details" onBack={() => nav("client-dashboard")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={booking.coachName} size={50} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.coachName}</div>
              {coach && <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{coach.suburb}</div>}
            </div>
            <StatusPill status={booking.status} />
          </div>
          {coach?.verified?.identity && (
            <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <Badge tone="success" icon={ShieldCheck}>Verified coach</Badge>
            </div>
          )}
        </Card>

        <SectionLabel>Booking details</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Mode" value={booking.mode} />
          {booking.participants && <Row label="For" value={booking.participants} />}
          <Row label="Price" value={priceLabel} bold last />
        </Card>

        {booking.notes && (
          <>
            <SectionLabel>Your notes to the coach</SectionLabel>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody }}>{booking.notes}</p>
            </Card>
          </>
        )}

        <SectionLabel>Booking policy</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${C.border}` }}>
            <Calendar size={15} color={C.slate} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 2, ...fBody }}>Cancellation policy</div>
              <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>
                {coach?.cancellationPolicy || "Cancellation terms will be confirmed with your coach."}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={15} color={C.slate} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 2, ...fBody }}>No-show policy</div>
              <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>
                {coach?.noShowPolicy || "Failing to attend without notice may forfeit some or all of your session fee."}
              </div>
            </div>
          </div>
        </Card>

        {isPending && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 14 }}>
            <Btn full variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", messageParams)}>Message coach</Btn>
            <Btn full variant="outline" onClick={() => setCancelOpen(true)}>Withdraw</Btn>
          </div>
        )}

        {isUpcoming && booking.paymentDue && (
          <Card style={{ marginBottom: 14, background: C.orangeTint, border: "none" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <CreditCard size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{booking.coachName.split(" ")[0]} accepted your request</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2, lineHeight: 1.5, ...fBody }}>Send your payment to lock in the session — funds are held securely until it's complete.</div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Btn full size="sm" variant="dark" onClick={() => { payBooking(booking.id); toast("Payment sent — your booking is fully confirmed."); }}>Pay ${typeof booking.price === "number" ? booking.price.toFixed(2) : booking.price} now</Btn>
            </div>
          </Card>
        )}

        {isUpcoming && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 14 }}>
            <Btn size="sm" variant="secondary" full onClick={() => setRescheduleOpen(true)}>Reschedule</Btn>
            <Btn size="sm" variant="outline" full onClick={() => setCancelOpen(true)}>Cancel</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", messageParams)} />
          </div>
        )}

        {isPast && booking.status === "completed" && !booking.reviewed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <Btn full onClick={() => nav("leave-review", { bookingId: booking.id, name: booking.coachName })}>Leave a review</Btn>
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Book again</Btn>
          </div>
        )}
        {isPast && booking.reviewed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <Badge tone="success" icon={CheckCircle2} style={{ alignSelf: "flex-start" }}>Review submitted</Badge>
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Book again</Btn>
          </div>
        )}
        {isPast && booking.status === "cancelled" && (
          <div style={{ marginBottom: 14 }}>
            {booking.refundStatus === "processing" && <div style={{ marginBottom: 10 }}><StatusBanner state="refundProcessing" compact /></div>}
            {booking.refundStatus === "refunded" && <div style={{ marginBottom: 10 }}><StatusBanner state="paymentRefunded" message={`$${Number(booking.price).toFixed(2)} was refunded to your original payment method.`} compact /></div>}
            <Btn full variant="secondary" icon={RefreshCcw} onClick={() => nav("coach-profile", { id: booking.coachId })}>Book again</Btn>
          </div>
        )}

        <Btn full variant="outline" icon={LifeBuoy} onClick={goSupport}>Contact support</Btn>
      </div>

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

export function ScreenLeaveReview({ nav, params, toast }) {
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const options = ["Great communicator", "Punctual", "Well prepared", "Motivating", "Flexible"];
  const toggle = (t) => setTags((arr) => arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Leave a review" onBack={() => nav("client-dashboard")} />
      <div style={{ textAlign: "center", marginTop: 6, marginBottom: 20 }}>
        <Avatar name={params.name} size={54} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.jet, marginTop: 10, ...fDisplay }}>{params.name}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Star size={30} fill={i <= rating ? C.orange : "none"} color={i <= rating ? C.orange : C.slateLight} />
            </button>
          ))}
        </div>
      </div>
      <SectionLabel>What stood out?</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {options.map((t) => <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}
      </div>
      <textarea placeholder="Tell other clients about your session..." rows={4}
        style={{ border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 13, fontSize: 13.5, resize: "none", outline: "none", ...fBody }} />
      <div style={{ fontSize: 11, color: C.slateLight, marginTop: 10, ...fBody }}>Only clients with a verified booking can leave a review. Your review is moderated before it appears publicly.</div>
      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full onClick={() => { toast("Review submitted for moderation"); nav("client-dashboard"); }}>Submit review</Btn>
      </div>
    </div>
  );
}
