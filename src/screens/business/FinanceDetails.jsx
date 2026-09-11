import React, { useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Download, Landmark, ReceiptText, Users, WalletCards } from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { Avatar, Badge, Btn, Card, ConfirmDialog, EmptyState, SectionLabel, SegTabs, TopBar } from "../../components/ui/Primitives";

const page = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });
const scroll = { flex: 1, overflowY: "auto", padding: "12px 18px 32px" };
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function FinanceStat({ icon: Icon, label, value, tone = "brand", C }) {
  const color = tone === "success" ? C.success : tone === "warning" ? C.warnStrong : C.brand;
  const background = tone === "success" ? C.successTint : tone === "warning" ? C.warnTint : C.brandTint;
  return <Card style={{ padding: 13, minWidth: 0 }}><div style={{ width: 32, height: 32, borderRadius: 10, background, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color={color} /></div><div style={{ marginTop: 9, fontSize: T.title, fontWeight: 800, color: C.jet, ...fDisplay }}>{value}</div><div style={{ marginTop: 2, fontSize: T.caption, color: C.slate, ...fBody }}>{label}</div></Card>;
}

export function ScreenBusinessEarnings() {
  const { darkMode, nav, business, businessBookings = [], businessCoachPayouts = [] } = useApp();
  const C = darkMode ? CD : CL;
  const paidBookings = businessBookings.filter((item) => item.businessId === business.id && ["held", "released"].includes(item.paymentStatus));
  const recordedGross = paidBookings.reduce((sum, item) => sum + Number(item.total || item.price || 0), 0);
  const gross = Math.max(recordedGross, Number(business.metrics?.revenueMonth || 0));
  const platformFees = gross * 0.06;
  const coachCosts = businessCoachPayouts.filter((item) => item.businessId === business.id).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const net = Math.max(0, gross - platformFees - coachCosts);

  return <div style={page(C)}>
    <TopBar title="Earnings" onBack={() => nav("business-finance")} />
    <div style={scroll} className="cl-hide-scrollbar">
      <Card style={{ padding: 16, background: C.black, border: `1px solid ${C.black}` }}><div style={{ fontSize: T.caption, fontWeight: 700, color: C.onDark, opacity: .72, textTransform: "uppercase", ...fBody }}>Net business earnings</div><div style={{ marginTop: 6, fontSize: T.hero, fontWeight: 800, color: C.onDark, ...fDisplay }}>{money(net)}</div><div style={{ marginTop: 5, fontSize: T.captionLg, color: C.onDark, opacity: .72, ...fBody }}>After platform fees and coach payouts</div></Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}><FinanceStat icon={CreditCard} label="Client revenue" value={money(gross)} C={C} /><FinanceStat icon={ReceiptText} label="Platform fees" value={money(platformFees)} tone="warning" C={C} /><FinanceStat icon={Users} label="Coach costs" value={money(coachCosts)} C={C} /></div>

      <SectionLabel style={{ marginTop: 24 }}>Client transactions</SectionLabel>
      <div style={{ marginTop: 10 }}>{paidBookings.length ? paidBookings.map((booking) => <Card key={booking.id} onClick={() => nav("business-booking-detail", { id: booking.id })} ariaLabel={`View payment for ${booking.service}`} style={{ padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div style={{ minWidth: 0 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...fBody }}>{booking.service}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{booking.clientName} · {booking.date}</div></div><div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{money(booking.total || booking.price)}</div><Badge tone={booking.paymentStatus === "released" ? "success" : "orange"}>{booking.paymentStatus === "released" ? "Settled" : "Protected"}</Badge></div></div></Card>) : <EmptyState icon={Banknote} title="No earnings yet" body="Paid client bookings will appear here." />}</div>
    </div>
  </div>;
}

export function ScreenBusinessCoachPayouts() {
  const { darkMode, nav, business, businessCoachPayouts = [], markBusinessCoachPayoutPaid, toast } = useApp();
  const C = darkMode ? CD : CL;
  const [tab, setTab] = useState("open");
  const [payTarget, setPayTarget] = useState(null);
  const payouts = businessCoachPayouts.filter((item) => item.businessId === business.id);
  const visible = payouts.filter((item) => tab === "open" ? item.status !== "paid" : item.status === "paid");
  const dueTotal = payouts.filter((item) => item.status === "due").reduce((sum, item) => sum + item.amount, 0);
  const processingTotal = payouts.filter((item) => item.status === "processing").reduce((sum, item) => sum + item.amount, 0);
  const confirmPay = () => { markBusinessCoachPayoutPaid(payTarget.id); toast(`Paid ${payTarget.coachName}`); setPayTarget(null); };

  return <div style={page(C)}>
    <TopBar title="Coach payouts" onBack={() => nav("business-finance")} />
    <div style={{ padding: "10px 18px 0" }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><FinanceStat icon={WalletCards} label="Ready to pay" value={money(dueTotal)} tone="warning" C={C} /><FinanceStat icon={Banknote} label="Processing" value={money(processingTotal)} C={C} /></div><div style={{ marginTop: 14 }}><SegTabs value={tab} onChange={setTab} items={[{ value: "open", label: "Open" }, { value: "history", label: "History" }]} /></div></div>
    <div style={scroll} className="cl-hide-scrollbar">
      {!business.payoutMethod ? <Card style={{ padding: 14, marginBottom: 12, background: C.warnTint }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Connect your business bank account</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>Required for complete payment records and payout reconciliation.</div><div style={{ marginTop: 12 }}><Btn full size="sm" icon={Landmark} onClick={() => nav("business-payout-setup")}>Connect account</Btn></div></Card> : null}
      {visible.length ? visible.map((payout) => <Card key={payout.id} style={{ padding: 14, marginBottom: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 11 }}><Avatar name={payout.coachName} size={42} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{payout.coachName}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{payout.period} · {payout.sessions} sessions</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: T.body, fontWeight: 800, color: C.jet, ...fBody }}>{money(payout.amount)}</div><Badge tone={payout.status === "paid" ? "success" : "orange"}>{payout.status}</Badge></div></div>{payout.status === "due" ? <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}><Btn full size="sm" disabled={!business.payoutMethod} onClick={() => setPayTarget(payout)}>Pay coach</Btn></div> : payout.status === "processing" ? <div style={{ marginTop: 10, fontSize: T.caption, color: C.slateLight, ...fBody }}>Expected by {payout.dueDate}</div> : <div style={{ marginTop: 10, fontSize: T.caption, color: C.success, ...fBody }}>Paid {payout.paidAt}</div>}</Card>) : <EmptyState icon={CheckCircle2} title={tab === "open" ? "All payouts are clear" : "No payout history"} body={tab === "open" ? "New coach amounts will appear after completed sessions." : "Completed coach payouts will appear here."} />}
    </div>
    <ConfirmDialog open={!!payTarget} onClose={() => setPayTarget(null)} onConfirm={confirmPay} title={`Pay ${payTarget?.coachName || "coach"}?`} description={`${money(payTarget?.amount)} will be recorded as paid for ${payTarget?.period || "this period"}.`} confirmLabel={`Pay ${money(payTarget?.amount)}`} destructive={false} />
  </div>;
}

export function ScreenBusinessInvoices() {
  const { darkMode, nav, business, toast } = useApp();
  const C = darkMode ? CD : CL;
  const latest = business.lastSubscriptionInvoice;
  const invoices = [latest, { id: "inv-aug-2026", label: "Growth monthly subscription", date: "2 Aug 2026", amount: 129, status: "Paid" }, { id: "inv-jul-2026", label: "Growth monthly subscription", date: "2 Jul 2026", amount: 129, status: "Paid" }].filter(Boolean);
  return <div style={page(C)}>
    <TopBar title="Invoices" onBack={() => nav("business-finance")} />
    <div style={scroll} className="cl-hide-scrollbar">
      <Card style={{ padding: 14, display: "flex", gap: 10, background: C.fog }}><ReceiptText size={19} color={C.brand} /><div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>Subscription invoices are issued to {business.legalName}. Client booking receipts remain available under Earnings.</div></Card>
      <SectionLabel style={{ marginTop: 24 }}>Subscription invoices</SectionLabel>
      <div style={{ marginTop: 10 }}>{invoices.map((invoice) => <Card key={invoice.id} style={{ padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{invoice.label}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{invoice.date}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: T.body, fontWeight: 800, color: C.jet, ...fBody }}>{money(invoice.amount)}</div><Badge tone="success">{invoice.status}</Badge></div></div><div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }}><Btn size="sm" variant="ghost" icon={Download} onClick={() => toast("Invoice download started")}>Download</Btn></div></Card>)}</div>
    </div>
  </div>;
}
