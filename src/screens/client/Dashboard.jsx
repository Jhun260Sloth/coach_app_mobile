import React, { useState } from "react";
import {
  WifiOff, Calendar, ClipboardList, Heart, Download, Clock, MessageCircle, Star, CheckCircle2,
  AlertTriangle, CreditCard, ShieldCheck, LifeBuoy, Hourglass,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES } from "../../data/mockData";
import {
  Avatar, Card, Badge, SegTabs, SectionLabel, Btn, TopBar, EmptyState, StatusPill, Chip, BottomSheet, Row,
} from "../../components/ui/Primitives";
import { CoachListCard } from "./Discovery";

export function ScreenClientDashboard({ nav, bookings, favorites, offline, toast, cancelBooking, rescheduleBooking }) {
  const [tab, setTab] = useState("upcoming");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);

  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const favCoaches = COACHES.filter((c) => favorites.includes(c.id));

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

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>My sessions</div>
        {offline && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.jet, color: C.white, padding: "9px 12px", borderRadius: 12, marginTop: 12, fontSize: 12, ...fBody }}>
            <WifiOff size={14} color={C.orange} /> You're offline — showing your last saved sessions.
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <SegTabs value={tab} onChange={setTab} items={[
            { value: "upcoming", label: "Upcoming" }, { value: "pending", label: "Pending" }, { value: "past", label: "Past" },
            { value: "favorites", label: "Favorites" }, { value: "payments", label: "Payments" },
          ]} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {tab === "upcoming" && (upcoming.length ? upcoming.map((b) => (
          <BookingCard
            key={b.id}
            b={b}
            nav={nav}
            onReschedule={() => setRescheduleTarget(b)}
            onCancel={() => setCancelTarget(b)}
          />
        )) : <EmptyState icon={Calendar} title="No upcoming sessions" body="Search for a coach to book your next session." />)}

        {tab === "pending" && (pending.length ? pending.map((b) => (
          <BookingCard
            key={b.id}
            b={b}
            nav={nav}
            onCancel={() => setCancelTarget(b)}
          />
        )) : <EmptyState icon={Hourglass} title="No pending requests" body="Requests waiting on a coach's response will show up here." />)}

        {tab === "past" && (past.length ? past.map((b) => <BookingCard key={b.id} b={b} nav={nav} past />) :
          <EmptyState icon={ClipboardList} title="No past sessions yet" body="Completed sessions will show up here." />)}

        {tab === "favorites" && (favCoaches.length ? favCoaches.map((c) => (
          <CoachListCard key={c.id} coach={c} fav onFav={() => {}} onOpen={() => nav("coach-profile", { id: c.id })} />
        )) : <EmptyState icon={Heart} title="No favorites yet" body="Tap the heart on a coach's profile to save them here." />)}

        {tab === "payments" && (
          <>
            {[...upcoming, ...past].length === 0 && (
              <EmptyState icon={CreditCard} title="No payments yet" body="Your session receipts will show up here." />
            )}
            {[...upcoming, ...past].map((b) => (
              <Card key={b.id} onClick={() => setReceiptTarget(b)} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {b.coachName}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.jet, ...fDisplay }}>${b.price}</div>
                  <Download size={15} color={C.slateLight} />
                </div>
              </Card>
            ))}
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
      <ReceiptSheet
        booking={receiptTarget}
        onClose={() => setReceiptTarget(null)}
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

  // Reset picker state whenever a new booking is opened
  React.useEffect(() => {
    if (booking) { setDay(days[0] || null); setTime(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

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
              <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
                {days.map((d) => (
                  <Chip key={d} active={day === d} onClick={() => { setDay(d); setTime(null); }}>{d}</Chip>
                ))}
              </div>

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

              <Btn full disabled={!day || !time} onClick={() => onConfirm(booking.id, { date: day, time })}>
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

/* Cancel — requires explicit confirmation before the session is actually cancelled.
   Also doubles as the "withdraw request" flow for bookings still pending coach acceptance. */
function CancelSheet({ booking, onClose, onConfirm, pending }) {
  const coach = booking ? COACHES.find((c) => c.id === booking.coachId) : null;
  return (
    <BottomSheet open={!!booking} onClose={onClose} title={pending ? "Withdraw this request?" : "Cancel this session?"} heightPct={58}>
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
              {pending
                ? `${booking.coachName.split(" ")[0]} hasn't responded to this request yet — withdrawing it now won't incur any charge.`
                : (coach?.cancellationPolicy || "Cancelling may not be fully refundable depending on how close this is to your session time.")}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn full variant="danger" onClick={() => onConfirm(booking.id)}>{pending ? "Yes, withdraw request" : "Yes, cancel session"}</Btn>
            <Btn full variant="secondary" onClick={onClose}>{pending ? "Keep request" : "Keep session"}</Btn>
          </div>
        </>
      )}
    </BottomSheet>
  );
}

/* Receipt — shown when a payments list item is tapped */
function ReceiptSheet({ booking, onClose }) {
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

export function BookingCard({ b, nav, past, onReschedule, onCancel }) {
  const pending = b.status === "pending";
  return (
    <Card style={{ marginBottom: 12 }} onClick={() => nav("client-booking-detail", { id: b.id })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Avatar name={b.coachName || b.clientName} size={42} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.jet, ...fDisplay }}>{b.service}</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>{b.coachName || b.clientName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.slate, marginTop: 4, ...fBody }}>
              <Clock size={11} /> {b.date} · {b.time}
            </div>
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
        {!past && !pending && (
          <>
            <Btn size="sm" variant="secondary" full onClick={onReschedule}>Reschedule</Btn>
            <Btn size="sm" variant="outline" full onClick={onCancel}>Cancel</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", { name: b.coachName || b.clientName })} />
          </>
        )}
        {!past && pending && (
          <>
            <Btn size="sm" variant="primary" full onClick={() => nav("client-booking-detail", { id: b.id })}>View details</Btn>
            <Btn size="sm" variant="outline" full onClick={onCancel}>Withdraw</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", { name: b.coachName || b.clientName })} />
          </>
        )}
        {past && (
          b.status === "completed" && !b.reviewed ? (
            <Btn size="sm" full onClick={() => nav("leave-review", { bookingId: b.id, name: b.coachName })}>Leave a review</Btn>
          ) : b.reviewed ? (
            <Badge tone="success" icon={CheckCircle2}>Review submitted</Badge>
          ) : null
        )}
      </div>
    </Card>
  );
}

/* Booking details — the client-side counterpart to the coach's booking detail page.
   Surfaces the same categories of information (party info, session details, notes,
   booking policy) but never exposes the Accept/Decline workflow, which is coach-only. */
export function ScreenClientBookingDetail({ nav, params, bookings, toast, cancelBooking, rescheduleBooking }) {
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

        {isUpcoming && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 14 }}>
            <Btn size="sm" variant="secondary" full onClick={() => setRescheduleOpen(true)}>Reschedule</Btn>
            <Btn size="sm" variant="outline" full onClick={() => setCancelOpen(true)}>Cancel</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", messageParams)} />
          </div>
        )}

        {isPast && booking.status === "completed" && !booking.reviewed && (
          <div style={{ marginBottom: 14 }}>
            <Btn full onClick={() => nav("leave-review", { bookingId: booking.id, name: booking.coachName })}>Leave a review</Btn>
          </div>
        )}
        {isPast && booking.reviewed && (
          <div style={{ marginBottom: 14 }}>
            <Badge tone="success" icon={CheckCircle2}>Review submitted</Badge>
          </div>
        )}

        <Btn full variant="outline" icon={LifeBuoy} onClick={goSupport}>Contact Support</Btn>
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
