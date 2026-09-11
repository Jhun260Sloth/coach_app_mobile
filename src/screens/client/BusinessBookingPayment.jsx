import React, { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { EMPTY_PAYMENT_CARD, isPaymentCardValid, PaymentCardForm, paymentCardBrand } from "../../components/ui/PaymentCardForm";
import { Avatar, Btn, Card, Row, TopBar } from "../../components/ui/Primitives";

const page = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });

export function ScreenBusinessBookingPayment() {
  const {
    darkMode, nav, params, businesses, businessPrograms, businessRoster,
    businessBookings, clientIdentity, clientPaymentMethods = [], saveClientPaymentMethod,
    addBusinessBooking, updateBusinessBooking, pushNotification, toast,
  } = useApp();
  const C = darkMode ? CD : CL;
  const existingBooking = businessBookings.find((item) => item.id === params?.bookingId);
  const businessId = existingBooking?.businessId || params?.businessId;
  const programId = existingBooking?.programId || params?.programId;
  const coachId = existingBooking?.assignedCoachId || params?.assignedCoachId;
  const business = businesses.find((item) => item.id === businessId);
  const program = businessPrograms.find((item) => item.id === programId);
  const coach = businessRoster.find((item) => item.id === coachId);
  const savedMethod = clientPaymentMethods.find((item) => item.isDefault) || clientPaymentMethods[0];
  const [useSaved, setUseSaved] = useState(!!savedMethod);
  const [card, setCard] = useState(() => ({ ...EMPTY_PAYMENT_CARD, name: `${clientIdentity.firstName || ""} ${clientIdentity.lastName || ""}`.trim() }));
  const [processing, setProcessing] = useState(false);

  if (!business || !program) {
    return <div style={page(C)}><TopBar title="Secure payment" onBack={() => nav("client-dashboard")} /><div style={{ padding: "24px 18px", color: C.slate, fontSize: T.body, ...fBody }}>This booking is no longer available. Return to your bookings and choose another session.</div></div>;
  }

  const price = Number(existingBooking?.price ?? program.price ?? 0);
  const total = Number(existingBooking?.total ?? (price + Math.round(price * 0.06 * 100) / 100));
  const valid = useSaved ? !!savedMethod : isPaymentCardValid(card);
  const participant = existingBooking?.participants || params?.participant || "You";
  const date = existingBooking?.date || params?.date;
  const time = existingBooking?.time || params?.time;
  const back = () => existingBooking
    ? nav("client-booking-detail", { id: existingBooking.id })
    : nav("business-booking-review", params);

  const pay = () => {
    if (!valid || processing) return;
    setProcessing(true);
    window.setTimeout(() => {
      const digits = card.number.replace(/\D/g, "");
      const method = useSaved ? savedMethod : saveClientPaymentMethod({ brand: paymentCardBrand(card.number), last4: digits.slice(-4), exp: card.expiry });
      let bookingId = existingBooking?.id;
      if (existingBooking) {
        updateBusinessBooking(existingBooking.id, { status: "confirmed", paymentStatus: "held", paymentMethod: `${method.brand} •••• ${method.last4}`, transactionId: `CN-${String(existingBooking.id).toUpperCase()}-2026` });
        pushNotification({ audience: "business", businessId: business.id, type: "payment", title: "Program payment received", body: `${existingBooking.clientName || "A client"} paid for ${program.title}. The booking is confirmed.`, bookingId: existingBooking.id });
      } else {
        bookingId = addBusinessBooking({
          providerId: business.id, providerName: business.tradingName, businessId: business.id,
          programId: program.id, programTitle: program.title, service: program.title,
          assignedCoachId: coach?.id || null, coachId: coach?.id || null, coachName: coach?.name || "Assigned coach",
          clientName: `${clientIdentity.firstName || "Sarah"} ${clientIdentity.lastName || "Lin"}`.trim(),
          participantId: params.participantId, participants: participant,
          includesMinor: !!params.includesMinor, guardianName: params.guardianName || "", guardianPhone: params.guardianPhone || "",
          date, time, mode: program.deliveryMode || program.mode || "In-person",
          status: "confirmed", paymentStatus: "held", price, total,
          paymentMethod: `${method.brand} •••• ${method.last4}`,
          transactionId: `CN-${String(Date.now()).slice(-6)}-2026`,
        });
      }
      if (coachId) pushNotification({ audience: "businessCoach", businessId: business.id, coachId, type: "payment", title: "Assigned session confirmed", body: `${program.title} with ${participant} is confirmed for ${date} at ${time}.`, bookingId });
      toast("Payment secured — booking confirmed");
      nav("business-booking-confirmation", { bookingId });
    }, 750);
  };

  return <div style={page(C)}>
    <TopBar title="Secure payment" onBack={back} />
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 32px" }} className="cl-hide-scrollbar">
      <Card style={{ padding: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Avatar name={business.tradingName} src={business.profile?.logo} size={46} />
          <div style={{ minWidth: 0 }}><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{program.title}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{business.tradingName} · {coach?.name || existingBooking?.coachName}</div></div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}><Row label="Date & time" value={`${date} · ${time}`} /><Row label="Participant" value={participant} /><Row label="Program" value={`$${price.toFixed(2)}`} /><Row label="Service fee" value={`$${(total - price).toFixed(2)}`} /><Row label="Total" value={`$${total.toFixed(2)} AUD`} bold last /></div>
      </Card>

      <div style={{ marginTop: 22, marginBottom: 10, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Payment method</div>
      {useSaved && savedMethod ? <Card style={{ padding: 14, display: "flex", alignItems: "center", gap: 11 }}><div style={{ width: 40, height: 40, borderRadius: 12, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center" }}><CreditCard size={18} color={C.brand} /></div><div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{savedMethod.brand} •••• {savedMethod.last4}</div><div style={{ marginTop: 2, fontSize: T.caption, color: C.slate, ...fBody }}>Saved payment method</div></div><Btn size="sm" variant="ghost" onClick={() => setUseSaved(false)}>Change</Btn></Card> : <Card style={{ padding: 16 }}><PaymentCardForm value={card} onChange={setCard} />{savedMethod ? <div style={{ marginTop: 12 }}><Btn full size="sm" variant="ghost" onClick={() => setUseSaved(true)}>Use saved card ending {savedMethod.last4}</Btn></div> : null}</Card>}
      <Card style={{ padding: 14, marginTop: 12, background: C.fog, display: "flex", gap: 10 }}><ShieldCheck size={19} color={C.success} /><div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>Your payment is protected until the session is completed. Only the card brand and last four digits are saved.</div></Card>
    </div>
    <div style={{ padding: "14px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white }}><Btn full disabled={!valid} loading={processing} loadingText="Securing your booking…" onClick={pay}>Pay & confirm · ${total.toFixed(2)}</Btn></div>
  </div>;
}
