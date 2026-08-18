import React, { useState } from "react";
import {
  AlertTriangle, ArrowRight, Banknote, CalendarDays, CheckCircle2,
  Clock3, Landmark, LifeBuoy, ShieldCheck, Star, WalletCards,
} from "lucide-react";
import { CL, CD, T, fBody, fDisplay, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { CONFIG } from "../../config";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYOUT_STATUS } from "../../data/bookings";
import { Avatar, Badge, Btn, Card, EmptyState, Row, StatusPill, TopBar } from "../../components/ui/Primitives";
import { SessionJourneyTimeline } from "../../components/booking/SessionJourneyTimeline";

function findBooking(id, role, bookings, coachBookings) {
  const preferred = role === "coach" ? coachBookings : bookings;
  const fallback = role === "coach" ? bookings : coachBookings;
  return preferred.find((item) => item.id === id) || fallback.find((item) => item.id === id);
}

function SessionSummary({ booking, role }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const person = role === "coach" ? booking.clientName : booking.coachName;
  return (
    <Card style={{ padding: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
        <Avatar name={person} size={42} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{booking.service}</div>
          <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>with {person}</div>
        </div>
        <StatusPill status={booking.status} />
      </div>
      <Row label="Date" value={booking.date} />
      <Row label="Time" value={booking.time} />
      <Row label="Format" value={booking.mode} last />
    </Card>
  );
}

export function ScreenSessionCompletion({
  nav, params, role: appRole, bookings = [], coachBookings = [], confirmSessionCompletion, toast,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const booking = findBooking(params?.bookingId, role, bookings, coachBookings);
  const [submitting, setSubmitting] = useState(false);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Confirm session" onBack={() => nav(role === "coach" ? "coach-bookings" : "client-dashboard")} />
        <EmptyState icon={CalendarDays} title="Session not found" body="This session may no longer be available." />
      </div>
    );
  }

  const backTo = params?.backTo || (role === "coach" ? "coach-session-detail" : "client-booking-detail");
  const canConfirm = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status);
  const handleComplete = () => {
    if (submitting || !canConfirm) return;
    setSubmitting(true);
    const accepted = confirmSessionCompletion?.(booking.id, role);
    if (!accepted) {
      setSubmitting(false);
      toast?.("This session cannot be completed yet");
      return;
    }
    toast?.("Session confirmed complete");
    window.setTimeout(() => nav("funds-release-status", { bookingId: booking.id, role, backTo }), 1150);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Confirm session" onBack={() => nav(backTo, role === "coach" ? { id: booking.id } : { id: booking.id })} />
      <div style={{ flex: 1, overflowY: "auto", padding: `14px ${LAYOUT.pagePadX}px 26px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "5px 12px 22px" }}>
          <div style={{
            width: 66, height: 66, borderRadius: 22, background: C.brandTint, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 24px -18px ${C.brand}`,
          }}>
            <CheckCircle2 size={31} color={C.brand} strokeWidth={2} />
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, letterSpacing: "-0.35px", ...fDisplay }}>
            Did this session take place?
          </div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 7, ...fBody }}>
            Confirm only after the session has finished and you’re happy the service was delivered.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SessionSummary booking={booking} role={role} />
          <SessionJourneyTimeline booking={booking} role={role} compact />
          <Card style={{ background: C.successTint, borderColor: C.success }}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>What happens next</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>
                  {role === "coach"
                    ? "CoachLink will release your net payout and notify the client. Bank processing usually takes 2–3 business days."
                    : `CoachLink will release the secure $${Number(booking.price).toFixed(2)} payment to your coach and save this session to your history.`}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        <Btn full loading={submitting} loadingText="Releasing funds…" disabled={!canConfirm} icon={CheckCircle2} onClick={handleComplete}>
          Yes, session completed
        </Btn>
        <Btn full variant="outline" icon={AlertTriangle} onClick={() => nav("dispute-create", {
          bookingId: booking.id,
          role,
          category: role === "coach" ? "client_no_show" : "session_not_delivered",
          backTo: "session-completion",
        })}>
          No, report an issue
        </Btn>
      </div>
    </div>
  );
}

export function ScreenFundsReleaseStatus({ nav, params, role: appRole, bookings = [], coachBookings = [] }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const booking = findBooking(params?.bookingId, role, bookings, coachBookings);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Funds status" onBack={() => nav(role === "coach" ? "coach-earnings" : "client-history")} />
        <EmptyState icon={WalletCards} title="Payment record not found" body="We couldn’t find this session’s payment details." />
      </div>
    );
  }

  const released = booking.payoutStatus === PAYOUT_STATUS.RELEASED || booking.paymentStatus === PAYMENT_STATUS.RELEASED;
  const processing = booking.payoutStatus === PAYOUT_STATUS.PROCESSING;
  const gross = Number(booking.price || 0);
  const commission = gross * CONFIG.commissionRate;
  const net = gross - commission;
  const person = role === "coach" ? booking.clientName : booking.coachName;
  const backTo = params?.backTo || (role === "coach" ? "coach-earnings" : "client-history");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title={role === "coach" ? "Payout status" : "Payment status"} onBack={() => nav(backTo, { id: booking.id })} />
      <div style={{ flex: 1, overflowY: "auto", padding: `10px ${LAYOUT.pagePadX}px 30px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "8px 10px 22px" }}>
          <div style={{
            width: 70, height: 70, borderRadius: 24, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: released ? C.successTint : C.brandTint,
          }}>
            {released ? <Banknote size={32} color={C.success} /> : <Clock3 size={30} color={C.brand} />}
          </div>
          <Badge tone={released ? "success" : "orange"}>{released ? "Released" : processing ? "Processing" : "Pending completion"}</Badge>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, marginTop: 11, ...fDisplay }}>
            {released
              ? role === "coach" ? "Your payout is on the way" : "Payment released securely"
              : role === "coach" ? "Payout release pending" : "Your payment is still protected"}
          </div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 7, ...fBody }}>
            {released
              ? role === "coach" ? "CoachLink has sent the net amount to your connected bank account." : `Your payment for the session with ${person} has been released.`
              : "Funds stay securely held until session completion is confirmed."}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <Landmark size={17} color={C.brand} />
              <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>
                {role === "coach" ? "Payout breakdown" : "Payment details"}
              </div>
            </div>
            {role === "coach" ? (
              <>
                <Row label="Session total" value={`$${gross.toFixed(2)}`} />
                <Row label={`CoachLink commission (${Math.round(CONFIG.commissionRate * 100)}%)`} value={`−$${commission.toFixed(2)}`} />
                <Row label="Net payout" value={`$${net.toFixed(2)}`} bold />
                <Row label="Destination" value="Bank •••• 8042" last />
              </>
            ) : (
              <>
                <Row label="Session" value={booking.service} />
                <Row label="Coach" value={person} />
                <Row label="Amount released" value={`$${gross.toFixed(2)}`} bold />
                <Row label="Payment method" value="Visa •••• 4821" last />
              </>
            )}
          </Card>

          <SessionJourneyTimeline booking={booking} role={role} />

          <Card style={{ display: "flex", gap: 11, alignItems: "flex-start", background: C.fog }}>
            <Clock3 size={18} color={C.brand} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>
                {role === "coach" ? "Expected in 2–3 business days" : "Protected from request to release"}
              </div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>
                {role === "coach" ? "Your bank may take a little longer on weekends or public holidays." : "CoachLink held the funds securely and released them only after completion was confirmed."}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        {role === "coach" ? (
          <Btn full icon={ArrowRight} onClick={() => nav("coach-earnings")}>View all earnings</Btn>
        ) : !booking.reviewed && released ? (
          <Btn full icon={Star} onClick={() => nav("leave-review", { bookingId: booking.id, name: booking.coachName })}>Leave a review</Btn>
        ) : (
          <Btn full icon={CalendarDays} onClick={() => nav("client-history")}>View session history</Btn>
        )}
        <Btn full variant="outline" icon={LifeBuoy} onClick={() => nav("support", { presetTab: "faq", faqTopic: role, backTo: "funds-release-status", bookingId: booking.id })}>Get payment help</Btn>
      </div>
    </div>
  );
}
