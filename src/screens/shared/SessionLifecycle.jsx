import React, { useState } from "react";
import { haptic } from "../../utils/haptics";
import {
  AlertTriangle, ArrowRight, BadgeDollarSign, Banknote, CalendarDays, CheckCircle2,
  Clock3, Landmark, LifeBuoy, LockKeyhole, Plus, ShieldCheck, Star, WalletCards,
} from "lucide-react";
import { CL, CD, T, fBody, fDisplay, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { CONFIG } from "../../config";
import {
  ADDITIONAL_CHARGE_KIND, ADDITIONAL_CHARGE_PHASE, ADDITIONAL_CHARGE_STATUS,
  BOOKING_STATUS, PAYMENT_STATUS, PAYOUT_STATUS,
} from "../../data/bookings";
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
  nav, params, role: appRole, bookings = [], coachBookings = [], additionalCharges = [], confirmSessionCompletion, toast,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const booking = findBooking(params?.bookingId, role, bookings, coachBookings);
  const [submitting, setSubmitting] = useState(false);
  const [coachChoice, setCoachChoice] = useState(null);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Confirm session" onBack={() => nav(role === "coach" ? "coach-bookings" : "client-dashboard")} />
        <EmptyState icon={CalendarDays} title="Session not found" body="This session may no longer be available." />
      </div>
    );
  }

  const backTo = params?.backTo || (role === "coach" ? "coach-session-detail" : "client-booking-detail");
  const finalCharge = additionalCharges.find((charge) => (
    charge.bookingId === booking.id
    && charge.phase === ADDITIONAL_CHARGE_PHASE.COMPLETION
    && charge.kind === ADDITIONAL_CHARGE_KIND.REQUIRED
    && charge.status !== ADDITIONAL_CHARGE_STATUS.CANCELLED
  ));
  const finalPaymentDue = finalCharge?.status === ADDITIONAL_CHARGE_STATUS.PENDING;
  const completionConfirmations = booking.completionConfirmations || (booking.completionConfirmedBy ? [booking.completionConfirmedBy] : []);
  const otherRole = role === "coach" ? "client" : "coach";
  const otherConfirmed = completionConfirmations.includes(otherRole);
  const currentRoleConfirmed = completionConfirmations.includes(role);
  const canConfirm = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status)
    && !currentRoleConfirmed
    && !(role === "client" && (finalPaymentDue || !completionConfirmations.includes("coach")));
  const handleComplete = () => {
    if (submitting || !canConfirm) return;
    haptic(12);
    setSubmitting(true);
    const accepted = confirmSessionCompletion?.(booking.id, role);
    if (!accepted) {
      setSubmitting(false);
      toast?.("This session cannot be completed yet");
      return;
    }
    if (otherConfirmed) {
      toast?.("Both sides confirmed - releasing funds");
      window.setTimeout(() => nav("funds-release-status", { bookingId: booking.id, role, backTo }), 1150);
    } else {
      toast?.(`${role === "coach" ? "Coach" : "Client"} confirmation saved`);
      window.setTimeout(() => nav(backTo, { id: booking.id }), 550);
    }
  };

  const chooseCard = (value, icon, title, detail) => {
    const Icon = icon;
    const selected = coachChoice === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => setCoachChoice(value)}
        style={{
          width: "100%", minHeight: 82, padding: 14, borderRadius: 16,
          border: `1.5px solid ${selected ? C.brand : C.border}`,
          background: selected ? C.brandTint : C.white, cursor: "pointer",
          display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left",
        }}
      >
        <span style={{ width: 40, height: 40, borderRadius: 13, background: selected ? C.brand : C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={19} color={selected ? C.white : C.brand} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{title}</span>
          <span style={{ display: "block", marginTop: 3, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{detail}</span>
        </span>
        <span style={{ width: 20, height: 20, borderRadius: 99, border: `1.5px solid ${selected ? C.brand : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 }}>
          {selected && <span style={{ width: 10, height: 10, borderRadius: 99, background: C.brand }} />}
        </span>
      </button>
    );
  };

  const coachAddCharge = () => nav("additional-charge-create", {
    bookingId: booking.id,
    role: "coach",
    phase: ADDITIONAL_CHARGE_PHASE.COMPLETION,
    backTo,
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title={role === "coach" ? "Finish session" : "Confirm session"} onBack={() => nav(backTo, { id: booking.id })} />
      <div style={{ flex: 1, overflowY: "auto", padding: `14px ${LAYOUT.pagePadX}px 26px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "5px 12px 22px" }}>
          <div style={{
            width: 66, height: 66, borderRadius: 22, background: C.brandTint, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {role === "coach" ? <BadgeDollarSign size={30} color={C.brand} strokeWidth={2} /> : finalPaymentDue ? <LockKeyhole size={29} color={C.brand} strokeWidth={2} /> : <CheckCircle2 size={31} color={C.brand} strokeWidth={2} />}
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, letterSpacing: "-0.35px", ...fDisplay }}>
            {role === "coach"
              ? finalPaymentDue ? "Waiting for final payment" : "Any final charges?"
              : finalPaymentDue ? "One final payment is due" : !completionConfirmations.includes("coach") ? "Waiting for your coach" : "Did this session take place?"}
          </div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 7, ...fBody }}>
            {role === "coach"
              ? finalPaymentDue
                ? "The client must pay the agreed final amount before they can confirm the session."
                : "Confirm there are no extra agreed costs, or add one before you mark your side complete."
              : finalPaymentDue
                ? "Review and pay the coach’s final request. Completion stays locked until payment succeeds."
                : !completionConfirmations.includes("coach")
                  ? "Your coach needs to finish their session review before your completion control unlocks."
                  : "Confirm only after the session has finished and you’re happy the service was delivered."}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SessionSummary booking={booking} role={role} />

          {finalCharge && (
            <Card style={{ background: finalPaymentDue ? C.warnTint : C.successTint, border: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BadgeDollarSign size={18} color={finalPaymentDue ? C.warnStrong : C.success} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{finalCharge.reason}</div>
                    <div style={{ fontSize: T.body, fontWeight: 800, color: C.jet, ...fDisplay }}>${Number(finalCharge.amount).toFixed(2)}</div>
                  </div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 4, ...fBody }}>{finalPaymentDue ? "Payment required before client confirmation" : "Paid securely and linked to this session"}</div>
                </div>
              </div>
            </Card>
          )}

          {role === "coach" && !finalPaymentDue && !currentRoleConfirmed && (
            <div role="radiogroup" aria-label="Final payment choice" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {chooseCard("none", CheckCircle2, "No final charge", "Mark your side complete now. The client will receive a confirmation prompt.")}
              {chooseCard("charge", Plus, "Add a final charge", "For an agreed extension, equipment, venue cost, or another documented extra.")}
            </div>
          )}

          <SessionJourneyTimeline booking={booking} role={role} compact />
          <Card style={{ background: C.successTint, border: "none" }}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Protected until both confirm</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>CoachNivo releases the secured payment only after final charges are paid and both coach and client confirm completion.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        {role === "coach" && finalPaymentDue && <Btn full disabled icon={LockKeyhole}>Waiting for client payment</Btn>}
        {role === "coach" && finalPaymentDue && <Btn full variant="outline" icon={BadgeDollarSign} onClick={() => nav("additional-charge-review", { chargeId: finalCharge.id, role: "coach", backTo })}>View final payment</Btn>}
        {role === "coach" && !finalPaymentDue && !currentRoleConfirmed && coachChoice === "charge" && <Btn full icon={Plus} onClick={coachAddCharge}>Add final charge</Btn>}
        {role === "coach" && !finalPaymentDue && !currentRoleConfirmed && coachChoice !== "charge" && <Btn full loading={submitting} loadingText="Saving confirmation…" disabled={!canConfirm || coachChoice !== "none"} icon={CheckCircle2} onClick={handleComplete}>{coachChoice === "none" ? "No final charge - confirm" : "Choose an option to continue"}</Btn>}
        {role === "coach" && currentRoleConfirmed && <Btn full disabled icon={Clock3}>Waiting for client confirmation</Btn>}
        {role === "client" && finalPaymentDue && <Btn full icon={WalletCards} onClick={() => nav("additional-charge-payment", { chargeId: finalCharge.id, role: "client" })}>Pay final ${Number(finalCharge.amount).toFixed(2)}</Btn>}
        {role === "client" && !finalPaymentDue && <Btn full loading={submitting} loadingText="Saving confirmation…" disabled={!canConfirm} icon={CheckCircle2} onClick={handleComplete}>{currentRoleConfirmed ? "Confirmation saved" : completionConfirmations.includes("coach") ? "Yes, session completed" : "Waiting for coach to finish"}</Btn>}
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

export function ScreenFundsReleaseStatus({ nav, params, role: appRole, bookings = [], coachBookings = [], additionalCharges = [] }) {
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
  const paidFinalTotal = additionalCharges
    .filter((charge) => charge.bookingId === booking.id && charge.phase === ADDITIONAL_CHARGE_PHASE.COMPLETION && charge.status === ADDITIONAL_CHARGE_STATUS.PAID)
    .reduce((sum, charge) => sum + Number(charge.amount || 0), 0);
  const gross = booking.paidTotal != null
    ? Number(booking.paidTotal)
    : Number(booking.price || 0) + paidFinalTotal;
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
              ? role === "coach" ? "CoachNivo has sent the net amount to your connected bank account." : `Your payment for the session with ${person} has been released.`
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
                <Row label={`CoachNivo commission (${Math.round(CONFIG.commissionRate * 100)}%)`} value={`−$${commission.toFixed(2)}`} />
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
                {role === "coach" ? "Your bank may take a little longer on weekends or public holidays." : "CoachNivo held the funds securely and released them only after completion was confirmed."}
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
