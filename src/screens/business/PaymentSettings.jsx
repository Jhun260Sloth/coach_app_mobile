import React, { useState } from "react";
import { Building2, CreditCard, Landmark, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { EMPTY_PAYMENT_CARD, isPaymentCardValid, PaymentCardForm, paymentCardBrand } from "../../components/ui/PaymentCardForm";
import { Badge, BottomSheet, Btn, Card, ConfirmDialog, Field, SectionLabel, TopBar } from "../../components/ui/Primitives";

const page = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });
const scroll = { flex: 1, overflowY: "auto", padding: "12px 18px 32px" };

export function ScreenBusinessPaymentMethods() {
  const { darkMode, nav, business, saveBusinessBillingMethod, setDefaultBusinessBillingMethod, removeBusinessBillingMethod, toast } = useApp();
  const C = darkMode ? CD : CL;
  const methods = business.billingMethods?.length
    ? business.billingMethods
    : business.billingMethod ? [{ ...business.billingMethod, id: business.billingMethod.id || "bpm-primary", isDefault: true }] : [];
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [draft, setDraft] = useState(() => ({ ...EMPTY_PAYMENT_CARD, name: business.ownerName || "" }));

  const openAdd = () => { setDraft({ ...EMPTY_PAYMENT_CARD, name: business.ownerName || "" }); setAddOpen(true); };
  const save = () => {
    if (!isPaymentCardValid(draft)) { toast("Complete your card details"); return; }
    const digits = draft.number.replace(/\D/g, "");
    saveBusinessBillingMethod({ brand: paymentCardBrand(draft.number), last4: digits.slice(-4), exp: draft.expiry });
    setAddOpen(false);
    toast("Billing card added");
  };
  const makeDefault = (method) => { setDefaultBusinessBillingMethod(method.id); toast("Default billing card updated"); };
  const confirmRemove = () => { removeBusinessBillingMethod(removeTarget.id); setRemoveTarget(null); toast("Billing card removed"); };

  return <div style={page(C)}>
    <TopBar title="Payment methods" onBack={() => nav("business-finance")} />
    <div style={scroll} className="cl-hide-scrollbar">
      <Card style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 10, background: C.brandTint }}><ShieldCheck size={19} color={C.brand} style={{ flexShrink: 0 }} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Subscription billing cards</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>These cards pay for your business plan. Client booking payments are deposited into your payout account separately.</div></div></Card>

      <SectionLabel style={{ marginTop: 24 }}>Saved cards</SectionLabel>
      <div style={{ marginTop: 10 }}>
        {methods.length ? methods.map((method) => <Card key={method.id} style={{ padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CreditCard size={19} color={C.brand} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}><span style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{method.brand} •••• {method.last4}</span>{method.isDefault ? <Badge tone="success">Default</Badge> : null}</div>
              <div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{method.exp ? `Expires ${method.exp}` : `Added ${method.addedAt || "recently"}`}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            {!method.isDefault ? <Btn size="sm" variant="ghost" onClick={() => makeDefault(method)}>Set as default</Btn> : null}
            <Btn size="sm" variant="ghost" icon={Trash2} disabled={methods.length === 1} onClick={() => setRemoveTarget(method)}>{methods.length === 1 ? "Required" : "Remove"}</Btn>
          </div>
        </Card>) : <Card style={{ padding: 16, textAlign: "center", background: C.fog }}><CreditCard size={24} color={C.slateLight} /><div style={{ marginTop: 8, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>No billing cards yet</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>Add a card to keep your subscription active.</div></Card>}
      </div>
      <Btn full variant="secondary" icon={Plus} onClick={openAdd}>Add billing card</Btn>

      <Card style={{ marginTop: 18, padding: 14, display: "flex", gap: 10, background: C.fog }}><ShieldCheck size={18} color={C.success} style={{ flexShrink: 0 }} /><div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>CoachNivo never stores full card numbers. Changes apply to future subscription charges.</div></Card>
    </div>

    <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Add billing card" heightPct={82}>
      <PaymentCardForm value={draft} onChange={setDraft} />
      <div style={{ marginTop: 20 }}><Btn full disabled={!isPaymentCardValid(draft)} onClick={save}>Save billing card</Btn></div>
    </BottomSheet>
    <ConfirmDialog open={!!removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={confirmRemove} title="Remove this billing card?" description={`Future subscription charges will no longer use ${removeTarget?.brand || "this card"} ending ${removeTarget?.last4 || ""}.`} confirmLabel="Remove card" />
  </div>;
}

export function ScreenBusinessPayoutSetup() {
  const { darkMode, nav, business, saveBusinessPayoutMethod, toast } = useApp();
  const C = darkMode ? CD : CL;
  const existing = business.payoutMethod || {};
  const [form, setForm] = useState({ holder: existing.holder || business.legalName || "", bank: existing.bank || "", bsb: "", account: "" });
  const [saving, setSaving] = useState(false);
  const set = (key, digitsOnly = false) => (event) => setForm((current) => ({ ...current, [key]: digitsOnly ? event.target.value.replace(/\D/g, "") : event.target.value }));
  const valid = form.holder.trim() && form.bank.trim() && form.bsb.length >= 6 && form.account.length >= 6;
  const save = () => {
    if (!valid || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      saveBusinessPayoutMethod({ holder: form.holder.trim(), bank: form.bank.trim(), bsbLast3: form.bsb.slice(-3), accountLast4: form.account.slice(-4) });
      toast("Payout account connected");
      nav("business-finance");
    }, 600);
  };

  return <div style={page(C)}>
    <TopBar title={existing.accountLast4 ? "Payout account" : "Connect payouts"} onBack={() => nav("business-finance")} />
    <div style={scroll} className="cl-hide-scrollbar">
      <div style={{ fontSize: T.display, fontWeight: 700, color: C.jet, ...fDisplay }}>{existing.accountLast4 ? "Update where earnings arrive" : "Receive your booking earnings"}</div>
      <div style={{ marginTop: 6, fontSize: T.bodyLg, color: C.slate, lineHeight: 1.55, ...fBody }}>Add the business bank account that should receive payouts from completed client bookings.</div>

      {existing.accountLast4 ? <Card style={{ marginTop: 18, padding: 14, display: "flex", alignItems: "center", gap: 11, background: C.successTint }}><Landmark size={20} color={C.success} /><div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{existing.bank} · •••• {existing.accountLast4}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>Currently receiving payouts</div></div><Badge tone="success">Verified</Badge></Card> : null}

      <SectionLabel style={{ marginTop: 24 }}>Business bank details</SectionLabel>
      <Card style={{ padding: 16, marginTop: 10 }}><div style={{ display: "grid", gap: 14 }}>
        <Field label="Account holder" placeholder="Registered business name" icon={Building2} value={form.holder} onChange={set("holder")} required />
        <Field label="Bank name" placeholder="e.g., Commonwealth Bank" icon={Landmark} value={form.bank} onChange={set("bank")} required />
        <Field label="BSB" placeholder="062000" inputMode="numeric" value={form.bsb} onChange={set("bsb", true)} required />
        <Field label="Account number" placeholder="12345678" inputMode="numeric" value={form.account} onChange={set("account", true)} required />
      </div></Card>

      <Card style={{ marginTop: 12, padding: 14, display: "flex", gap: 10, background: C.fog }}><ShieldCheck size={18} color={C.success} style={{ flexShrink: 0 }} /><div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>The account holder should match your verified business entity. Payouts usually arrive within 2–3 business days.</div></Card>
    </div>
    <div style={{ padding: "14px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white }}><Btn full loading={saving} loadingText="Connecting account…" disabled={!valid} icon={Landmark} onClick={save}>{existing.accountLast4 ? "Save payout account" : "Connect payout account"}</Btn></div>
  </div>;
}
