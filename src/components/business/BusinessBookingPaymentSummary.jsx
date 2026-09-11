import React from "react";
import { CreditCard, LockKeyhole, ReceiptText, RotateCcw } from "lucide-react";
import { fBody, fDisplay, T } from "../../theme/theme";
import { Badge, Card, Row } from "../ui/Primitives";

const STATUS = {
  not_requested: { label: "Not requested", tone: "neutral", detail: "No payment has been collected." },
  due: { label: "Payment due", tone: "orange", detail: "The place confirms after the client pays." },
  held: { label: "Protected", tone: "orange", detail: "Payment is secured until the session is completed." },
  released: { label: "Settled", tone: "success", detail: "The completed booking payment has been released to the business." },
  refund_processing: { label: "Refund processing", tone: "orange", detail: "The refund is returning to the original payment method." },
  refunded: { label: "Refunded", tone: "success", detail: "The payment was returned to the original payment method." },
};

export function BusinessBookingPaymentSummary({ booking, C, perspective = "client" }) {
  const state = STATUS[booking.paymentStatus] || STATUS.not_requested;
  const Icon = booking.paymentStatus?.startsWith("refund") ? RotateCcw : booking.paymentStatus === "held" ? LockKeyhole : CreditCard;
  const amount = Number(booking.paidTotal || booking.total || booking.price || 0);
  return <Card style={{ padding: 15 }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}><span style={{ width: 40, height: 40, borderRadius: 12, background: state.tone === "success" ? C.successTint : C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={state.tone === "success" ? C.success : C.brand} /></span><div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{perspective === "business" ? "Customer payment" : "Payment status"}</div><Badge tone={state.tone}>{state.label}</Badge></div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>{state.detail}</div></div></div>
    <div style={{ marginTop: 12, paddingTop: 9, borderTop: `1px solid ${C.border}` }}><Row label="Total" value={`$${amount.toFixed(2)} AUD`} bold />{booking.paymentMethod ? <Row label="Payment method" value={booking.paymentMethod} /> : null}{booking.transactionId ? <Row label="Transaction" value={booking.transactionId} last /> : <Row label="Receipt" value={booking.paymentStatus === "not_requested" || booking.paymentStatus === "due" ? "Available after payment" : "Recorded"} last />}</div>
    {["held", "released", "refunded"].includes(booking.paymentStatus) ? <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, fontSize: T.caption, color: C.slate, ...fBody }}><ReceiptText size={14} color={C.brand} />Receipt linked to this booking</div> : null}
  </Card>;
}
