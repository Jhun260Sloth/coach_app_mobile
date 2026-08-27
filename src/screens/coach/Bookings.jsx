import React, { useState, useMemo, useEffect } from "react";
import {
  ClipboardList, Info, MessagesSquare, MessageCircle,
  ChevronLeft, ChevronRight, CalendarX2, BellRing, CalendarClock,
  CheckCircle2, Banknote, LifeBuoy, LockKeyhole, Scale, BadgeDollarSign, Clock, PlayCircle,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { CLIENT_PROFILES, BOOKING_ENQUIRY_MESSAGES, CONFIG } from "../../data/mockData";
import {
  Avatar, BottomActionBar, Card, SegTabs, ViewModeToggle, ScreenHeader, EmptyState, StatusPill, Btn, TopBar, Row, SectionLabel, Badge, HandleTag, BottomSheet, BookingCardSkeleton,
} from "../../components/ui/Primitives";
import { useApp } from "../../context/AppContext";
import { getBookingClientName } from "../../utils/name";
import { withClientMeta } from "../../data/users";
import {
  ADDITIONAL_CHARGE_KIND, ADDITIONAL_CHARGE_PHASE, ADDITIONAL_CHARGE_STATUS, BOOKING_STATUS,
} from "../../data/bookings";
import { PaymentDeadlineCard, SessionJourneyTimeline } from "../../components/booking/SessionJourneyTimeline";

/** Name the coach should see for a booking's client — privacy-safe until the
    booking is confirmed, full name afterwards (partner reveal). */
function clientNameFor(booking) {
  return getBookingClientName(withClientMeta(booking));
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

export function ScreenCoachBookings({ nav, coachBookings }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [tab, setTab] = useState("pending");
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [calMode, setCalMode] = useState("month");

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const dated = useMemo(() => coachBookings.map((b) => ({ ...b, _date: parseBookingDate(b.date) })), [coachBookings]);
  const initialDate = useMemo(() => (dated.find((b) => b._date)?._date) || new Date(), [dated]);
  const [cursor, setCursor] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const list = coachBookings.filter((b) => tab === "pending"
    ? [BOOKING_STATUS.PENDING, BOOKING_STATUS.AWAITING_PAYMENT].includes(b.status)
    : tab === "upcoming"
      ? [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETION_PENDING].includes(b.status)
      : [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED, BOOKING_STATUS.CANCELLED].includes(b.status));
  const emptyState = {
    pending: { title: "No booking requests", body: "New requests and payments awaiting action will appear here." },
    upcoming: { title: "No upcoming sessions", body: "Confirmed sessions will appear here once they are booked." },
    completed: { title: "No completed bookings", body: "Finished and closed bookings will appear here." },
  }[tab];
  const bookingsOnDate = (d) => dated.filter((b) => b._date && sameDay(b._date, d));

  const weeks = calMode === "month" ? buildMonthGrid(cursor) : [Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))];
  const headerLabel = calMode === "month"
    ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : `${weeks[0][0].toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${weeks[0][6].toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;

  const goPrev = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() - 1, 1) : addDays(c, -7));
  const goNext = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() + 1, 1) : addDays(c, 7));

  const renderBookingCard = (b, i) => {
    const cn = clientNameFor(b);
    const detailScreen = b.status === BOOKING_STATUS.PENDING
      ? "coach-booking-detail"
      : b.status === BOOKING_STATUS.AWAITING_PAYMENT
        ? "booking-awaiting-payment"
        : "coach-session-detail";
    return (
    <Card
      key={b.id}
      ariaLabel={`Open ${b.service} booking with ${cn.name}`}
      onClick={() => nav(detailScreen, { id: b.id })}
      style={{ marginBottom: 12, padding: 14, boxShadow: "0 4px 16px rgba(22,24,29,.05)", ...(i !== undefined ? { animationDelay: `${Math.min(i, 8) * 45}ms` } : {}) }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={cn.name} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
            <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{cn.name}</div>
            {cn.handle && <HandleTag handle={cn.handle} size={11.5} color={C.slateLight} />}
          </div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: T.body, fontWeight: 600, color: C.brand, marginTop: 2, ...fBody }}>{b.service}</div>
          <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 4, lineHeight: 1.35, ...fBody }}>{b.date} · {b.time}</div>
          <div style={{ fontSize: T.caption, color: C.slateLight, marginTop: 2, ...fBody }}>{b.mode}</div>
        </div>
        <ChevronRight size={17} color={C.slateLight} style={{ flexShrink: 0 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <StatusPill status={b.status} />
        {b.status === BOOKING_STATUS.COMPLETED && (
          <span style={{ fontSize: T.label, color: C.success, fontWeight: 600, textAlign: "right", ...fBody }}>
            ${Math.round(b.price * (1 - CONFIG.commissionRate))} payout released
          </span>
        )}
      </div>
    </Card>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <ScreenHeader
          title="Bookings"
          subtitle={view === "list" ? "Manage requests and sessions." : "View your booking schedule."}
          action={<ViewModeToggle value={view} onChange={setView} ariaLabel="Booking view" />}
          style={{ marginBottom: 14 }}
        />
        {view === "list" && (
          <SegTabs value={tab} onChange={setTab} items={[{ value: "pending", label: "Requests" }, { value: "upcoming", label: "Upcoming" }, { value: "completed", label: "Completed" }]} />
        )}
        {view === "calendar" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
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
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 0", paddingBottom: 116 }} className="cl-hide-scrollbar">
        {view === "list" && (
          <>
            {loading ? (
              <BookingCardSkeleton rows={4} />
            ) : (
              <>
                {list.length === 0 && <EmptyState icon={ClipboardList} title={emptyState.title} body={emptyState.body} />}
                <div className="cl-stagger">
                  {list.map((b, i) => renderBookingCard(b, i))}
                </div>
              </>
            )}
          </>
        )}

        {view === "calendar" && (
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
                <EmptyState icon={CalendarX2} title="No bookings" body="Nothing scheduled for this day." />
              )}
              {bookingsOnDate(selectedDate).map(renderBookingCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ScreenCoachBookingDetail({
  nav, goBack, params, coachBookings = [], respondBooking, sendPaymentReminder,
  expireAwaitingPayment, rescheduleBooking, toast, sessionDisputes = [], additionalCharges = [],
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const booking = coachBookings.find((b) => b.id === params?.id);
  const [responding, setResponding] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!booking) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Session details" onBack={() => goBack("coach-bookings")} />
      <EmptyState icon={ClipboardList} title="Booking not found" body="This booking may have been removed." />
    </div>
  );

  const relatedCase = sessionDisputes.find((item) => item.bookingId === booking.id);
  const acceptanceCharges = additionalCharges.filter((item) => (
    item.bookingId === booking.id
    && item.phase === ADDITIONAL_CHARGE_PHASE.ACCEPTANCE
    && ![ADDITIONAL_CHARGE_STATUS.CANCELLED, ADDITIONAL_CHARGE_STATUS.DECLINED].includes(item.status)
  ));
  const completionCharge = additionalCharges.find((item) => (
    item.bookingId === booking.id
    && item.phase === ADDITIONAL_CHARGE_PHASE.COMPLETION
    && item.status !== ADDITIONAL_CHARGE_STATUS.CANCELLED
  ));
  const requiredAcceptanceTotal = acceptanceCharges
    .filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.REQUIRED)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const completionConfirmations = booking.completionConfirmations || (booking.completionConfirmedBy ? [booking.completionConfirmedBy] : []);
  const coachConfirmedCompletion = completionConfirmations.includes("coach");

  const titleByStatus = {
    [BOOKING_STATUS.PENDING]: "Booking request",
    [BOOKING_STATUS.AWAITING_PAYMENT]: "Waiting for payment",
    [BOOKING_STATUS.CONFIRMED]: "Upcoming session",
    [BOOKING_STATUS.IN_PROGRESS]: "Live session",
    [BOOKING_STATUS.COMPLETION_PENDING]: "Finishing up",
    [BOOKING_STATUS.COMPLETED]: "Completed session",
    [BOOKING_STATUS.DECLINED]: "Declined request",
    [BOOKING_STATUS.EXPIRED]: "Expired request",
    [BOOKING_STATUS.CANCELLED]: "Cancelled session",
  };
  const profile = CLIENT_PROFILES[booking.clientName] || { memberSince: "-", totalSessions: 0, homeSuburb: "-", notes: "", verifiedPayment: true };
  const cn = clientNameFor(booking);
  const hasThread = !!BOOKING_ENQUIRY_MESSAGES[booking.id];
  const detailRoute = booking.status === BOOKING_STATUS.PENDING
    ? "coach-booking-detail"
    : booking.status === BOOKING_STATUS.AWAITING_PAYMENT
      ? "booking-awaiting-payment"
      : "coach-session-detail";

  const respond = (status) => {
    if (booking.status !== BOOKING_STATUS.PENDING) {
      toast("This request has already been handled");
      nav("coach-bookings");
      return;
    }
    setResponding(status);
    setTimeout(() => {
      respondBooking(booking.id, status);
      toast(status === BOOKING_STATUS.AWAITING_PAYMENT ? "Accepted - payment requested" : "Booking declined");
      nav("coach-bookings");
    }, 600);
  };

  const remindClient = () => {
    if (sendPaymentReminder?.(booking.id)) toast("Payment reminder sent");
  };

  const releaseSlot = () => {
    if (expireAwaitingPayment?.(booking.id)) {
      toast("Acceptance withdrawn and slot released");
      nav("coach-bookings");
    }
  };

  const saveReschedule = (when) => {
    rescheduleBooking?.(booking.id, when, "coach");
    setRescheduleOpen(false);
    toast(`Session moved to ${when.date}, ${when.time}`);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopBar title={titleByStatus[booking.status] || "Session details"} onBack={() => goBack("coach-bookings")} right={<StatusPill status={booking.status} />} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 28px" }} className="cl-hide-scrollbar">
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={cn.name} size={50} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: T.subtitleLg, fontWeight: 650, color: C.jet, ...fDisplay }}>{cn.name}</div>
              {cn.handle && <HandleTag handle={cn.handle} size={11.5} color={C.slateLight} />}
              {profile.homeSuburb && profile.homeSuburb !== "-" && (
                <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>{profile.homeSuburb}</div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{profile.totalSessions}</div>
              <div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>Sessions with you</div>
            </div>
            <div>
              <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{profile.memberSince}</div>
              <div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>Client since</div>
            </div>
          </div>
          {profile.notes && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, background: C.fog, borderRadius: 12, padding: 10 }}>
              <Info size={13} color={C.slate} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: T.label, color: C.slate, lineHeight: 1.5, ...fBody }}>{profile.notes}</span>
            </div>
          )}
        </Card>

        {booking.status === BOOKING_STATUS.AWAITING_PAYMENT && (
          <div style={{ marginBottom: 14 }}>
            <PaymentDeadlineCard booking={booking} role="coach">
              <div style={{ display: "flex", gap: 8 }}>
                <Btn full size="sm" icon={BellRing} disabled={booking.paymentReminderSent} onClick={remindClient}>
                  {booking.paymentReminderSent ? "Reminder sent" : "Send reminder"}
                </Btn>
                <Btn size="sm" variant="outline" icon={MessageCircle} ariaLabel={`Message ${cn.name}`} title={`Message ${cn.name}`} onClick={() => nav("chat-thread", { name: booking.clientName, bookingId: booking.id, backTo: detailRoute, backParams: { id: booking.id } })} />
              </div>
            </PaymentDeadlineCard>
            {acceptanceCharges.length > 0 && (
              <Card style={{ marginTop: 10, padding: 14, background: C.brandTint, border: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Payment sent for review</div>
                    <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>{acceptanceCharges.filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.REQUIRED).length} required · {acceptanceCharges.filter((item) => item.kind === ADDITIONAL_CHARGE_KIND.OPTIONAL).length} optional</div>
                  </div>
                  <div style={{ fontSize: T.title, fontWeight: 780, color: C.jet, ...fDisplay }}>${(Number(booking.price) + requiredAcceptanceTotal).toFixed(2)}</div>
                </div>
                <div style={{ fontSize: T.caption, color: C.slateLight, lineHeight: 1.45, ...fBody }}>Optional add-ons are added only if the client selects them.</div>
              </Card>
            )}
          </div>
        )}

        {[BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status) && (
          <Card style={{ marginBottom: 14, display: "flex", gap: 11, alignItems: "flex-start", background: C.successTint, border: "none" }}>
            <LockKeyhole size={18} color={C.success} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>${Number(booking.paidTotal || booking.price).toFixed(2)} secured</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>Payment is held by CoachNivo and releases after the session is complete.</div>
            </div>
          </Card>
        )}

        <SectionLabel>Session details</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Mode" value={booking.mode} />
          {booking.paidTotal ? (
            <>
              <Row label="Package price" value={`$${Number(booking.price).toFixed(2)}`} />
              {Number(booking.acceptanceChargeTotal || 0) > 0 && <Row label="Accepted extras" value={`$${Number(booking.acceptanceChargeTotal).toFixed(2)}`} />}
              <Row label="Session value" value={`$${Number(booking.paidTotal).toFixed(2)}`} bold last />
            </>
          ) : <Row label="Session value" value={`$${Number(booking.price).toFixed(2)}`} bold last />}
        </Card>

        <div style={{ marginBottom: 14 }}>
          <SessionJourneyTimeline booking={booking} role="coach" />
        </div>

        {relatedCase && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11, background: C.warnTint, border: "none" }} onClick={() => nav("dispute-status", { caseId: relatedCase.id, role: "coach", backTo: detailRoute, bookingId: booking.id })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scale size={18} color={C.brand} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{relatedCase.status === "resolved" ? "Case decision available" : "Session report under review"}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{relatedCase.categoryLabel} · View financial outcome</div></div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {completionCharge && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11 }} onClick={() => nav("additional-charge-review", { chargeId: completionCharge.id, role: "coach", backTo: detailRoute })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BadgeDollarSign size={18} color={C.brand} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Final payment · ${Number(completionCharge.amount).toFixed(2)}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{completionCharge.reason} · {completionCharge.status === ADDITIONAL_CHARGE_STATUS.PENDING ? "Waiting for client" : completionCharge.status.replace("_", " ")}</div></div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {booking.notes && (
          <>
            <SectionLabel>Message from client</SectionLabel>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: T.body, color: C.slate, lineHeight: 1.6, whiteSpace: "pre-line", ...fBody }}>{booking.notes}</p>
            </Card>
          </>
        )}

        {booking.safetyNotes && (
          <>
            <SectionLabel>Health & safety information</SectionLabel>
            <Card style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10, background: C.warnTint }}>
              <ShieldCheck size={17} color={C.warnStrong} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: T.body, color: C.jet, lineHeight: 1.6, whiteSpace: "pre-line", ...fBody }}>{booking.safetyNotes}</p>
            </Card>
          </>
        )}

        <SectionLabel>{booking.status === BOOKING_STATUS.PENDING ? "Questions before you decide?" : "Stay connected"}</SectionLabel>
        <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessagesSquare size={17} color={C.brandIcon || C.brandColor} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Message {cn.name.split(" ")[0]}</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{hasThread ? "Continue your conversation" : "Coordinate session details safely"}</div>
          </div>
          <Btn size="sm" variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.clientName, context: `${booking.service} · ${booking.date}`, bookingId: booking.id, backTo: detailRoute, backParams: { id: booking.id } })}>Chat</Btn>
        </Card>

        {booking.status === BOOKING_STATUS.COMPLETED && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <Btn full icon={Banknote} onClick={() => nav("funds-release-status", { bookingId: booking.id, role: "coach", backTo: "coach-session-detail" })}>View payout release</Btn>
            {!relatedCase && <Btn full variant="ghost" icon={Scale} onClick={() => nav("dispute-create", { bookingId: booking.id, role: "coach", category: "client_no_show", backTo: "coach-session-detail" })}>Report a session issue</Btn>}
          </div>
        )}

        {![BOOKING_STATUS.PENDING, BOOKING_STATUS.COMPLETED].includes(booking.status) && (
          <button onClick={() => nav("support", { presetTab: "faq", faqTopic: "coach", bookingId: booking.id, backTo: detailRoute })} style={{ width: "100%", minHeight: 44, marginTop: 10, border: "none", background: "transparent", display: "flex", gap: 7, alignItems: "center", justifyContent: "center", color: C.slate, cursor: "pointer", fontSize: T.body, fontWeight: 600, ...fBody }}>
            <LifeBuoy size={15} /> Get help with this booking
          </button>
        )}
      </div>

      {booking.status === BOOKING_STATUS.PENDING && (
        <BottomActionBar>
          <Btn variant="ghost" loading={responding === BOOKING_STATUS.DECLINED} loadingText="Declining…" disabled={responding === BOOKING_STATUS.AWAITING_PAYMENT} onClick={() => respond(BOOKING_STATUS.DECLINED)}>Decline</Btn>
          <div style={{ flex: 1 }}>
            <Btn full disabled={responding === BOOKING_STATUS.DECLINED} onClick={() => nav("coach-accept-booking", { id: booking.id })}>Review & accept</Btn>
          </div>
        </BottomActionBar>
      )}

      {booking.status === BOOKING_STATUS.AWAITING_PAYMENT && (
        <BottomActionBar>
          <Btn full variant="danger" onClick={releaseSlot}>Withdraw acceptance</Btn>
        </BottomActionBar>
      )}

      {[BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status) && (
        <BottomActionBar>
          {coachConfirmedCompletion ? (
            <div
              style={{
                width: "100%",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: C.fog,
                borderRadius: 12,
                padding: "10px 16px",
                color: C.slate,
                fontSize: T.body,
                fontWeight: 600,
                ...fBody,
              }}
            >
              <Clock size={15} color={C.brand} />
              <span>Waiting for client payment</span>
            </div>
          ) : (
            <>
              {booking.status === BOOKING_STATUS.CONFIRMED && (
                <Btn variant="outline" icon={CalendarClock} ariaLabel="Reschedule session" title="Reschedule session" onClick={() => setRescheduleOpen(true)} />
              )}
              {booking.status === BOOKING_STATUS.CONFIRMED && (
                <Btn full icon={PlayCircle} onClick={() => nav("coach-session-start", { bookingId: booking.id })}>Start session</Btn>
              )}
              {booking.status === BOOKING_STATUS.IN_PROGRESS && (
                <Btn full icon={CheckCircle2} onClick={() => nav("session-progress", { bookingId: booking.id, role: "coach" })}>View live session</Btn>
              )}
              {booking.status === BOOKING_STATUS.COMPLETION_PENDING && (
                <Btn full icon={CheckCircle2} onClick={() => nav("coach-session-completion", { bookingId: booking.id, role: "coach", backTo: "coach-session-detail" })}>Finish session</Btn>
              )}
            </>
          )}
        </BottomActionBar>
      )}

      <BottomSheet open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule session" heightPct={58}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginBottom: 14, ...fBody }}>Choose a new available time. The client will be notified immediately.</div>
        {[
          { date: "Fri, 21 Aug", time: "6:30am" },
          { date: "Sat, 22 Aug", time: "8:00am" },
          { date: "Tue, 25 Aug", time: "6:00am" },
        ].map((when) => (
          <button key={`${when.date}-${when.time}`} onClick={() => saveReschedule(when)} style={{ width: "100%", minHeight: 58, marginBottom: 9, padding: "11px 13px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", gap: 11, cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}><CalendarClock size={17} color={C.brand} /></div>
            <div>
              <div style={{ fontSize: T.body, color: C.jet, fontWeight: 700, ...fBody }}>{when.date}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{when.time} · Available</div>
            </div>
            <ChevronRight size={16} color={C.slateLight} style={{ marginLeft: "auto" }} />
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}
