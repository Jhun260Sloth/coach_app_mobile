import React, { useState, useMemo } from "react";
import {
  User, ClipboardList, ShieldCheck, Info, MessagesSquare, MessageCircle,
  ChevronLeft, ChevronRight, CalendarX2,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { CLIENT_PROFILES, BOOKING_ENQUIRY_MESSAGES, CONFIG } from "../../data/mockData";
import {
  Avatar, Card, SegTabs, EmptyState, StatusPill, Btn, TopBar, Row, SectionLabel, Badge,
} from "../../components/ui/Primitives";
import { useApp } from "../../context/AppContext";

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

  const list = coachBookings.filter((b) => tab === "pending" ? b.status === "pending" : tab === "upcoming" ? b.status === "confirmed" : ["completed", "declined", "expired"].includes(b.status));
  const bookingsOnDate = (d) => dated.filter((b) => b._date && sameDay(b._date, d));

  const weeks = calMode === "month" ? buildMonthGrid(cursor) : [Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))];
  const headerLabel = calMode === "month"
    ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : `${weeks[0][0].toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${weeks[0][6].toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;

  const goPrev = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() - 1, 1) : addDays(c, -7));
  const goNext = () => setCursor((c) => calMode === "month" ? new Date(c.getFullYear(), c.getMonth() + 1, 1) : addDays(c, 7));

  const renderBookingCard = (b, i) => (
    <Card key={b.id} style={{ marginBottom: 10, ...(i !== undefined ? { animationDelay: `${Math.min(i, 8) * 45}ms` } : {}) }} onClick={() => nav("coach-booking-detail", { id: b.id })}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Avatar name={b.clientName} size={40} />
          <div>
            <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{b.clientName}</div>
            <div style={{ fontSize: T.label, color: C.slate, ...fBody }}>{b.service}</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {b.time} · {b.mode}</div>
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Btn size="sm" variant="primary" full icon={User} onClick={(e) => { e.stopPropagation(); nav("coach-booking-detail", { id: b.id }); }}>View details</Btn>
      </div>
      {b.status === "completed" && (
        <div style={{ marginTop: 8, fontSize: T.label, color: C.success, fontWeight: 600, ...fBody }}>
          Payout released: ${Math.round(b.price * (1 - CONFIG.commissionRate))}
        </div>
      )}
    </Card>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, marginBottom: 14, ...fDisplay }}>Bookings</div>
        <div style={{ marginBottom: 10 }}>
          <SegTabs value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "calendar", label: "Calendar" }]} />
        </div>
        {view === "list" && (
          <SegTabs value={tab} onChange={setTab} items={[{ value: "pending", label: "Pending" }, { value: "upcoming", label: "Upcoming" }, { value: "completed", label: "Completed" }]} />
        )}
        {view === "calendar" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={goPrev} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronLeft size={16} color={C.jet} />
              </button>
              <span style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{headerLabel}</span>
              <button onClick={goNext} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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

export function ScreenCoachBookingDetail({ nav, params, coachBookings, respondBooking, toast }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const booking = coachBookings.find((b) => b.id === params.id);
  const [responding, setResponding] = useState(null);
  const respond = (status) => {
    // Guard against double-submits (e.g. a stale screen re-fired after the
    // request was already handled elsewhere) — surface it as an invalid-action
    // state instead of silently overwriting a decision that already happened.
    if (!booking || booking.status !== "pending") {
      toast("This request has already been handled");
      nav("coach-bookings");
      return;
    }
    setResponding(status);
    setTimeout(() => {
      respondBooking(booking.id, status);
      toast(status === "confirmed" ? "Booking accepted" : "Booking declined");
      pushNotification?.({
        audience: "client", type: "booking",
        title: status === "confirmed" ? "Booking confirmed" : "Booking declined",
        body: status === "confirmed"
          ? `Your session with ${booking.coachName || "your coach"} is confirmed for ${booking.date}, ${booking.time}.`
          : `Your request for ${booking.service} on ${booking.date} was declined.`,
      });
      nav("coach-bookings");
    }, 600);
  };
  if (!booking) return <EmptyState icon={ClipboardList} title="Booking not found" body="This booking may have been removed." />;
  const profile = CLIENT_PROFILES[booking.clientName] || { memberSince: "—", totalSessions: 0, homeSuburb: "—", notes: "", verifiedPayment: true };
  const hasThread = !!BOOKING_ENQUIRY_MESSAGES[booking.id];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Booking request" onBack={() => nav("coach-bookings")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px" }} className="cl-hide-scrollbar">

        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={booking.clientName} size={50} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.subtitleLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.clientName}</div>
              <div style={{ fontSize: T.label, color: C.slate, ...fBody }}>{profile.homeSuburb}</div>
            </div>
            {profile.verifiedPayment && <Badge tone="success" icon={ShieldCheck}>Payment verified</Badge>}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
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

        <SectionLabel>Booking details</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Mode" value={booking.mode} />
          <Row label="Price" value={`$${booking.price}`} bold last />
        </Card>

        {booking.notes && (
          <>
            <SectionLabel>Client notes</SectionLabel>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody }}>{booking.notes}</p>
            </Card>
          </>
        )}

        <SectionLabel>Questions before you decide?</SectionLabel>
        <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessagesSquare size={17} color={C.brandIcon || C.brandColor} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Message {booking.clientName.split(" ")[0]}</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{hasThread ? "You have an existing conversation" : "Clarify details before responding"}</div>
          </div>
          <Btn size="sm" variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.clientName, context: `${booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "coach-booking-detail", backParams: { id: booking.id } })}>Chat</Btn>
        </Card>

        {booking.status === "pending" && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
            <Btn variant="ghost" loading={responding === "declined"} loadingText="Declining…" disabled={responding === "confirmed"} onClick={() => respond("declined")}>Decline</Btn>
            <div style={{ flex: 1 }}>
              <Btn full loading={responding === "confirmed"} loadingText="Accepting…" disabled={responding === "declined"} onClick={() => respond("confirmed")}>Accept</Btn>
            </div>
          </div>
        )}
        {booking.status !== "pending" && <StatusPill status={booking.status} />}
      </div>
    </div>
  );
}
