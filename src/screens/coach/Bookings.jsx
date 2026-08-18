import React, { useState, useMemo } from "react";
import {
  User, ClipboardList, ShieldCheck, Info, MessagesSquare, MessageCircle,
  ChevronLeft, ChevronRight, CalendarX2, BellRing, CalendarClock,
  CheckCircle2, Banknote, LifeBuoy, LockKeyhole, Scale, BadgeDollarSign,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { CLIENT_PROFILES, BOOKING_ENQUIRY_MESSAGES, CONFIG } from "../../data/mockData";
import {
  Avatar, BottomActionBar, Card, SegTabs, EmptyState, StatusPill, Btn, TopBar, Row, SectionLabel, Badge, HandleTag, BottomSheet,
} from "../../components/ui/Primitives";
import { useApp } from "../../context/AppContext";
import { getBookingClientName } from "../../utils/name";
import { withClientMeta } from "../../data/users";
import { BOOKING_STATUS } from "../../data/bookings";
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
  const [calMode, setCalMode] = useState("month");

  const dated = useMemo(() => coachBookings.map((b) => ({ ...b, _date: parseBookingDate(b.date) })), [coachBookings]);
  const initialDate = useMemo(() => (dated.find((b) => b._date)?._date) || new Date(), [dated]);
  const [cursor, setCursor] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const list = coachBookings.filter((b) => tab === "pending"
    ? [BOOKING_STATUS.PENDING, BOOKING_STATUS.AWAITING_PAYMENT].includes(b.status)
    : tab === "upcoming"
      ? [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(b.status)
      : [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED, BOOKING_STATUS.CANCELLED].includes(b.status));
  const bookingsOnDate = (d) => dated.filter((b) => b._date && sameDay(b._date, d));

  const weeks = calMode === "month" ? buildMonthGrid(cursor) : [Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))];
  const headerLabel = calMode === "month"
    ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : `${weeks[0][0].toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${weeks[0][6].toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;

  const goPrev = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() - 1, 1) : addDays(c, -7));
  const goNext = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() + 1, 1) : addDays(c, 7));

  const renderBookingCard = (b, i) => {
    const cn = clientNameFor(b);
    return (
    <Card key={b.id} style={{ marginBottom: 10, ...(i !== undefined ? { animationDelay: `${Math.min(i, 8) * 45}ms` } : {}) }} onClick={() => nav(b.status === BOOKING_STATUS.PENDING ? "coach-booking-detail" : b.status === BOOKING_STATUS.AWAITING_PAYMENT ? "booking-awaiting-payment" : "coach-session-detail", { id: b.id })}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Avatar name={cn.name} size={40} />
          <div>
            <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fDisplay }}>
              {cn.name}
              {cn.handle && <span style={{ fontWeight: 500, color: C.slateLight, marginLeft: 6, fontSize: T.label, ...fBody }}>{cn.handle}</span>}
            </div>
            <div style={{ fontSize: T.label, color: C.slate, ...fBody }}>{b.service}</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {b.time} · {b.mode}</div>
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Btn size="sm" variant="primary" full icon={User} onClick={(e) => { e.stopPropagation(); nav(b.status === BOOKING_STATUS.PENDING ? "coach-booking-detail" : b.status === BOOKING_STATUS.AWAITING_PAYMENT ? "booking-awaiting-payment" : "coach-session-detail", { id: b.id }); }}>View details</Btn>
      </div>
      {b.status === BOOKING_STATUS.COMPLETED && (
        <div style={{ marginTop: 8, fontSize: T.label, color: C.success, fontWeight: 600, ...fBody }}>
          Payout released: ${Math.round(b.price * (1 - CONFIG.commissionRate))}
        </div>
      )}
    </Card>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, marginBottom: 14, ...fDisplay }}>Bookings</div>
        <div style={{ marginBottom: 10 }}>
          <SegTabs value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "calendar", label: "Calendar" }]} />
        </div>
        {view === "list" && (
          <SegTabs value={tab} onChange={setTab} items={[{ value: "pending", label: "Requests" }, { value: "upcoming", label: "Upcoming" }, { value: "completed", label: "History" }]} />
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
      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", paddingBottom: 116 }} className="cl-hide-scrollbar">
        {view === "list" && (
          <>
            {list.length === 0 && <EmptyState icon={ClipboardList} title="Nothing here" body="Bookings in this stage will appear here." />}
            <div className="cl-stagger">
              {list.map((b, i) => renderBookingCard(b, i))}
            </div>
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
  const relatedCharge = additionalCharges.find((item) => item.bookingId === booking.id && item.status !== "cancelled");

  const titleByStatus = {
    [BOOKING_STATUS.PENDING]: "Booking request",
    [BOOKING_STATUS.AWAITING_PAYMENT]: "Waiting for payment",
    [BOOKING_STATUS.CONFIRMED]: "Upcoming session",
    [BOOKING_STATUS.COMPLETION_PENDING]: "Confirm completion",
    [BOOKING_STATUS.COMPLETED]: "Completed session",
    [BOOKING_STATUS.DECLINED]: "Declined request",
    [BOOKING_STATUS.EXPIRED]: "Expired request",
    [BOOKING_STATUS.CANCELLED]: "Cancelled session",
  };
  const profile = CLIENT_PROFILES[booking.clientName] || { memberSince: "—", totalSessions: 0, homeSuburb: "—", notes: "", verifiedPayment: true };
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
      toast(status === BOOKING_STATUS.AWAITING_PAYMENT ? "Accepted — payment requested" : "Booking declined");
      nav("coach-bookings");
    }, 600);
  };

  const remindClient = () => {
    if (sendPaymentReminder?.(booking.id)) toast("Payment reminder sent");
  };

  const releaseSlot = () => {
    if (expireAwaitingPayment?.(booking.id)) {
      toast("Payment window closed and slot released");
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
              {cn.revealed && <div style={{ fontSize: T.captionLg, color: C.success, marginTop: 2, ...fBody }}>Identity shared for confirmed booking</div>}
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>{profile.homeSuburb}</div>
            </div>
            {profile.verifiedPayment && <Badge tone="success" icon={ShieldCheck}>Verified</Badge>}
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
          </div>
        )}

        {[BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status) && (
          <Card style={{ marginBottom: 14, display: "flex", gap: 11, alignItems: "flex-start", background: C.successTint, borderColor: C.success }}>
            <LockKeyhole size={18} color={C.success} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>${Number(booking.price).toFixed(2)} secured</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>Payment is held by CoachLink and releases after the session is confirmed complete.</div>
            </div>
          </Card>
        )}

        <SectionLabel>Session details</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Mode" value={booking.mode} />
          <Row label="Session value" value={`$${Number(booking.price).toFixed(2)}`} bold last />
        </Card>

        <div style={{ marginBottom: 14 }}>
          <SessionJourneyTimeline booking={booking} role="coach" />
        </div>

        {relatedCase && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11, background: C.warnTint, borderColor: C.brand }} onClick={() => nav("dispute-status", { caseId: relatedCase.id, role: "coach", backTo: detailRoute, bookingId: booking.id })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Scale size={18} color={C.brand} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{relatedCase.status === "resolved" ? "Case decision available" : "Session report under review"}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{relatedCase.categoryLabel} · View financial outcome</div></div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {relatedCharge && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11 }} onClick={() => nav("additional-charge-review", { chargeId: relatedCharge.id, role: "coach", backTo: detailRoute })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BadgeDollarSign size={18} color={C.brand} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Additional payment · ${Number(relatedCharge.amount).toFixed(2)}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{relatedCharge.reason} · {relatedCharge.status.replace("_", " ")}</div></div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {booking.notes && (
          <>
            <SectionLabel>Client notes</SectionLabel>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: T.body, color: C.slate, lineHeight: 1.6, whiteSpace: "pre-line", ...fBody }}>{booking.notes}</p>
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
            <Btn full variant="outline" icon={BadgeDollarSign} onClick={() => nav("additional-charge-create", { bookingId: booking.id, role: "coach" })}>Request additional payment</Btn>
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
            <Btn full loading={responding === BOOKING_STATUS.AWAITING_PAYMENT} loadingText="Accepting…" disabled={responding === BOOKING_STATUS.DECLINED} onClick={() => respond(BOOKING_STATUS.AWAITING_PAYMENT)}>Accept & request payment</Btn>
          </div>
        </BottomActionBar>
      )}

      {booking.status === BOOKING_STATUS.AWAITING_PAYMENT && (
        <BottomActionBar>
          <Btn full variant="danger" onClick={releaseSlot}>Close payment window</Btn>
        </BottomActionBar>
      )}

      {[BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status) && (
        <BottomActionBar>
          <Btn variant="outline" icon={CalendarClock} ariaLabel="Reschedule session" title="Reschedule session" onClick={() => setRescheduleOpen(true)} />
          <Btn full icon={CheckCircle2} onClick={() => nav("session-completion", { bookingId: booking.id, role: "coach", backTo: "coach-session-detail" })}>Confirm session completed</Btn>
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
