import React, { useState } from "react";
import { User, ClipboardList, ShieldCheck, Info, MessagesSquare, MessageCircle, CalendarClock, XCircle } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { CLIENT_PROFILES, BOOKING_ENQUIRY_MESSAGES, CONFIG, fmtTimeRange } from "../../data/mockData";
import {
  Avatar, Card, SegTabs, EmptyState, StatusPill, Btn, TopBar, Row, SectionLabel, Badge,
} from "../../components/ui/Primitives";

export function ScreenCoachBookings({ nav, coachBookings }) {
  const [tab, setTab] = useState("pending");
  const list = coachBookings.filter((b) => tab === "pending" ? b.status === "pending" : tab === "upcoming" ? b.status === "confirmed" : b.status === "completed");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 14, ...fDisplay }}>Bookings</div>
        <SegTabs value={tab} onChange={setTab} items={[{ value: "pending", label: "Pending" }, { value: "upcoming", label: "Upcoming" }, { value: "completed", label: "Completed" }]} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {list.length === 0 && <EmptyState icon={ClipboardList} title="Nothing here" body="Bookings in this stage will appear here." />}
        {list.map((b) => (
          <Card key={b.id} style={{ marginBottom: 10 }} onClick={() => nav("coach-booking-detail", { id: b.id })}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <Avatar name={b.clientName} size={40} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{b.clientName}</div>
                  <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{b.service}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {b.time} · {b.mode}</div>
                </div>
              </div>
              <StatusPill status={b.status} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn size="sm" variant="primary" full icon={User} onClick={(e) => { e.stopPropagation(); nav("coach-booking-detail", { id: b.id }); }}>View details</Btn>
            </div>
            {tab === "completed" && (
              <div style={{ marginTop: 8, fontSize: 12, color: C.success, fontWeight: 600, ...fBody }}>
                Payout released: ${Math.round(b.price * (1 - CONFIG.commissionRate))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ScreenCoachBookingDetail({ nav, params, coachBookings, setCoachBookings, toast }) {
  const booking = coachBookings.find((b) => b.id === params.id);
  const [rescheduling, setRescheduling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [newDate, setNewDate] = useState(booking?.dateISO || "");
  const [newStart, setNewStart] = useState(booking?.startTime || "");
  const [newEnd, setNewEnd] = useState(booking?.endTime || "");

  const respond = (status) => { setCoachBookings((arr) => arr.map((b) => b.id === booking.id ? { ...b, status } : b)); toast(status === "confirmed" ? "Booking accepted" : "Booking declined"); nav("coach-bookings"); };
  if (!booking) return <EmptyState icon={ClipboardList} title="Booking not found" body="This booking may have been removed." />;
  const profile = CLIENT_PROFILES[booking.clientName] || { memberSince: "—", totalSessions: 0, homeSuburb: "—", notes: "", verifiedPayment: true };
  const hasThread = !!BOOKING_ENQUIRY_MESSAGES[booking.id];
  const canManage = booking.status === "confirmed";

  const saveReschedule = () => {
    if (!newDate || !newStart || !newEnd || newStart >= newEnd) { toast("Check the new date and times"); return; }
    const d = new Date(newDate + "T00:00:00");
    const dateLabel = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    setCoachBookings((arr) => arr.map((b) => b.id === booking.id ? { ...b, dateISO: newDate, date: dateLabel, startTime: newStart, endTime: newEnd, time: newStart } : b));
    toast("Session rescheduled — client has been notified");
    setRescheduling(false);
  };
  const confirmCancel = () => {
    setCoachBookings((arr) => arr.map((b) => b.id === booking.id ? { ...b, status: "cancelled" } : b));
    toast("Booking cancelled");
    nav("coach-bookings");
  };
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Booking request" onBack={() => nav("coach-bookings")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={booking.clientName} size={50} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{booking.clientName}</div>
              <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{profile.homeSuburb}</div>
            </div>
            {profile.verifiedPayment && <Badge tone="success" icon={ShieldCheck}>Payment verified</Badge>}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.jet, ...fDisplay }}>{profile.totalSessions}</div>
              <div style={{ fontSize: 11, color: C.slate, ...fBody }}>Sessions with you</div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.jet, ...fDisplay }}>{profile.memberSince}</div>
              <div style={{ fontSize: 11, color: C.slate, ...fBody }}>Client since</div>
            </div>
          </div>
          {profile.notes && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, background: C.fog, borderRadius: 12, padding: 10 }}>
              <Info size={13} color={C.slate} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>{profile.notes}</span>
            </div>
          )}
        </Card>

        <SectionLabel>Booking details</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Service" value={booking.service} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.startTime && booking.endTime ? fmtTimeRange(booking.startTime, booking.endTime) : booking.time} />
          <Row label="Mode" value={booking.mode} />
          <Row label="Price" value={`$${booking.price}`} bold last />
        </Card>

        {booking.notes && (
          <>
            <SectionLabel>Client notes</SectionLabel>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody }}>{booking.notes}</p>
            </Card>
          </>
        )}

        <SectionLabel>Questions before you decide?</SectionLabel>
        <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessagesSquare size={17} color={C.orange} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>Message {booking.clientName.split(" ")[0]}</div>
            <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{hasThread ? "You have an existing conversation" : "Clarify details before responding"}</div>
          </div>
          <Btn size="sm" variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.clientName, context: `${booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "coach-booking-detail", backParams: { id: booking.id } })}>Chat</Btn>
        </Card>

        {booking.status === "pending" && !rescheduling && !confirmingCancel && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 12 }}>
            <Btn full variant="outline" onClick={() => respond("cancelled")}>Decline</Btn>
            <Btn full onClick={() => respond("confirmed")}>Accept</Btn>
          </div>
        )}
        {booking.status !== "pending" && !rescheduling && !confirmingCancel && (
          <div style={{ marginBottom: 12 }}><StatusPill status={booking.status} /></div>
        )}

        {rescheduling && (
          <Card style={{ marginBottom: 14 }}>
            <SectionLabel>Reschedule session</SectionLabel>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>New date</div>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Start</div>
                <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>End</div>
                <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full variant="outline" onClick={() => setRescheduling(false)}>Cancel</Btn>
              <Btn full onClick={saveReschedule}>Save new time</Btn>
            </div>
          </Card>
        )}

        {confirmingCancel && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, marginBottom: 4, ...fBody }}>Cancel this booking?</div>
            <div style={{ fontSize: 12, color: C.slate, marginBottom: 14, lineHeight: 1.5, ...fBody }}>
              {booking.clientName.split(" ")[0]} will be notified and, depending on your cancellation policy, may be entitled to a refund.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full variant="outline" onClick={() => setConfirmingCancel(false)}>Keep booking</Btn>
              <Btn full variant="danger" onClick={confirmCancel}>Confirm cancel</Btn>
            </div>
          </Card>
        )}

        {canManage && !rescheduling && !confirmingCancel && (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn full variant="outline" icon={CalendarClock} onClick={() => { setNewDate(booking.dateISO || ""); setNewStart(booking.startTime || ""); setNewEnd(booking.endTime || ""); setRescheduling(true); }}>Reschedule</Btn>
            <Btn full variant="danger" icon={XCircle} onClick={() => setConfirmingCancel(true)}>Cancel booking</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
