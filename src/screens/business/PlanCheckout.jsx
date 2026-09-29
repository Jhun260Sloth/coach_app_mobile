import React, { useState } from "react";
import { CheckCircle2, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { EMPTY_PAYMENT_CARD, isPaymentCardValid, PaymentCardForm, paymentCardBrand } from "../../components/ui/PaymentCardForm";
import { Btn, Card, Row, StepProgress, TopBar } from "../../components/ui/Primitives";

const page = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });

export function ScreenBusinessPlanCheckout() {
  const { darkMode, nav, params, business, changeBusinessPlan, updateBusinessOnboarding, submitBusinessApplication, toast } = useApp();
  const C = darkMode ? CD : CL;
  const source = params?.source === "upgrade" ? "upgrade" : "onboarding";
  const savedBillingMethod = source === "upgrade" ? business.billingMethod : null;
  const [useSavedMethod, setUseSavedMethod] = useState(!!savedBillingMethod);
  const [form, setForm] = useState(() => ({ ...EMPTY_PAYMENT_CARD, name: business.ownerName || "" }));
  const [paying, setPaying] = useState(false);
  const digits = form.number.replace(/\D/g, "");
  const newCardValid = isPaymentCardValid(form);
  const valid = useSavedMethod || newCardValid;
  const back = () => nav(source === "upgrade" ? "business-finance" : "business-identity");

  const confirmPayment = () => {
    if (!valid || paying) { if (!valid) toast("Complete your payment details"); return; }
    setPaying(true);
    window.setTimeout(() => {
      const billingMethod = useSavedMethod ? savedBillingMethod : { brand: paymentCardBrand(form.number), last4: digits.slice(-4), exp: form.expiry, isDefault: true, addedAt: "Just now" };
      if (source === "onboarding") {
        updateBusinessOnboarding({ agreementAccepted: true, billingMethod });
        submitBusinessApplication({ billingMethod });
        toast("Payment method secured");
        nav("business-application-submitted");
        return;
      }
      changeBusinessPlan({ billingMethod });
      toast("Billing method updated");
      nav("business-finance");
    }, 650);
  };

  return (
    <div style={page(C)}>
      <TopBar title="Payment method" onBack={back} />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 32px" }} className="cl-hide-scrollbar">
        {source === "onboarding" ? <StepProgress step={3} total={3} label="Payment method" /> : null}

        <div style={{ marginTop: 14, marginBottom: 10, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Billing details</div>
        {useSavedMethod ? <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CreditCard size={19} color={C.brand} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{savedBillingMethod.brand} •••• {savedBillingMethod.last4}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>Saved billing card</div></div>
            <Btn size="sm" variant="ghost" onClick={() => setUseSavedMethod(false)}>Change</Btn>
          </div>
        </Card> : <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CreditCard size={18} color={C.brand} /></div>
            <div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Add a billing card</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, lineHeight: 1.45, ...fBody }}>Used for your CoachNivo business account billing.</div></div>
          </div>
          <PaymentCardForm value={form} onChange={setForm} />
          {savedBillingMethod ? <div style={{ marginTop: 12 }}><Btn full size="sm" variant="ghost" onClick={() => setUseSavedMethod(true)}>Use saved card ending {savedBillingMethod.last4}</Btn></div> : null}
        </Card>}

        <Card style={{ marginTop: 12, padding: 14, display: "flex", gap: 10, background: C.fog }}>
          <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>Your card details are encrypted. You can manage your billing method from Finance & billing.</div>
        </Card>
      </div>
      <div style={{ padding: "14px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white }}>
        <Btn full icon={LockKeyhole} disabled={!valid} loading={paying} loadingText="Securing payment…" onClick={confirmPayment}>{source === "onboarding" ? "Confirm payment method" : "Save payment method"}</Btn>
        <div style={{ marginTop: 8, textAlign: "center", fontSize: T.micro, color: C.slateLight, ...fBody }}>Secure 256-bit encryption · Manage from Finance & billing</div>
      </div>
    </div>
  );
}

export function ScreenBusinessPlanConfirmation() {
  const { darkMode, nav, params } = useApp();
  const C = darkMode ? CD : CL;
  const plan = BUSINESS_PLANS.find((item) => item.id === params?.planId) || BUSINESS_PLANS[0];
  const previous = BUSINESS_PLANS.find((item) => item.id === params?.previousPlanId);
  return (
    <div style={{ ...page(C), justifyContent: "center", padding: "28px 22px", boxSizing: "border-box" }}>
      <div style={{ width: 76, height: 76, margin: "0 auto 20px", borderRadius: 24, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={38} color={C.success} /></div>
      <div style={{ textAlign: "center", fontSize: T.displayLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Your {plan.name} plan is active</div>
      <div style={{ marginTop: 9, textAlign: "center", fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, ...fBody }}>Your new plan benefits are ready now. Your billing details have been updated securely.</div>
      <Card style={{ marginTop: 22, padding: 16 }}>
        <Row label="Previous plan" value={previous?.name || "—"} />
        <Row label="New plan" value={plan.name} />
        <Row label="Monthly total" value={`$${plan.monthlyPrice} AUD`} bold last />
      </Card>
      <div style={{ display: "grid", gap: 9, marginTop: 20 }}>
        <Btn full onClick={() => nav("business-finance")}>View billing</Btn>
        <Btn full variant="outline" onClick={() => nav("business-dashboard")}>Back to dashboard</Btn>
      </div>
    </div>
  );
}
