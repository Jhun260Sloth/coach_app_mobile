import React, { useState } from "react";
import { Building2, CheckCircle2, CreditCard, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { BUSINESS_PLANS, BUSINESS_STATUS, BUSINESS_TYPES } from "../../data/businesses";
import { SPORT_NAMES } from "../../data/sports";
import { Badge, Btn, Card, CheckboxRow, Chip, Field, RadioRow, StepProgress, TopBar } from "../../components/ui/Primitives";
import { BusinessPlanCard } from "../../components/business/BusinessPlanUI";

const shell = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });
const content = { flex: 1, overflowY: "auto", padding: "8px 18px 32px" };
const footer = (C) => ({ padding: "14px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white });
const heading = (C) => ({ margin: "4px 0 6px", fontSize: T.display, fontWeight: 700, color: C.jet, ...fDisplay });
const body = (C) => ({ margin: "0 0 18px", fontSize: T.bodyLg, lineHeight: 1.55, color: C.slate, ...fBody });

export function ScreenBusinessEligibility() {
  const { darkMode, nav, businessOnboarding, updateBusinessOnboarding, toast } = useApp();
  const C = darkMode ? CD : CL;
  const [type, setType] = useState(businessOnboarding.type || "Academy");
  const [tradingName, setTradingName] = useState(businessOnboarding.tradingName || "");
  const [sports, setSports] = useState(businessOnboarding.sports || []);
  const [coachCount, setCoachCount] = useState(businessOnboarding.coachCount || "1–3");
  const [locationCount, setLocationCount] = useState(businessOnboarding.locationCount || "1");
  const [volume, setVolume] = useState(businessOnboarding.expectedBookings || "1–25 per month");
  const [servesMinors, setServesMinors] = useState(businessOnboarding.servesMinors ?? true);
  const toggleSport = (sport) => setSports((items) => items.includes(sport) ? items.filter((item) => item !== sport) : [...items, sport]);
  const continueFlow = () => {
    if (!tradingName.trim() || !sports.length) { toast("Add your business name and sport"); return; }
    updateBusinessOnboarding({ type, tradingName: tradingName.trim(), sports, coachCount, locationCount, expectedBookings: volume, servesMinors });
    nav("business-identity");
  };

  return <div style={shell(C)}>
    <TopBar title="Register your business" onBack={() => nav("auth", { mode: "signup", backTo: "role-select" }, "business")} />
    <div style={content} className="cl-hide-scrollbar">
      <StepProgress step={1} total={3} label="Eligibility" />
      <h1 style={heading(C)}>Tell us about your organisation</h1>
      <p style={body(C)}>This creates a separate business account for your locations, programs and coaching team.</p>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 6, ...fBody }}>What best describes you?</div>
        <Card style={{ padding: "4px 14px" }}>{BUSINESS_TYPES.map((item) => <RadioRow key={item} label={item} selected={type === item} onClick={() => setType(item)} />)}</Card>
      </div>
      <Field label="Trading name" placeholder="e.g., Apex Tennis Academy" value={tradingName} onChange={(event) => setTradingName(event.target.value)} required />
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 8, ...fBody }}>Sports offered</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{SPORT_NAMES.slice(0, 16).map((sport) => <Chip key={sport} active={sports.includes(sport)} onClick={() => toggleSport(sport)}>{sport}</Chip>)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
        <label style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>Coaches<select value={coachCount} onChange={(e) => setCoachCount(e.target.value)} style={{ width: "100%", minHeight: 48, marginTop: 6, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "0 10px", background: C.white, color: C.jet, ...fBody }}><option>1–3</option><option>4–10</option><option>11+</option></select></label>
        <label style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>Locations<select value={locationCount} onChange={(e) => setLocationCount(e.target.value)} style={{ width: "100%", minHeight: 48, marginTop: 6, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "0 10px", background: C.white, color: C.jet, ...fBody }}><option>1</option><option>2–3</option><option>4+</option><option>Mobile only</option></select></label>
      </div>
      <label style={{ display: "block", marginTop: 18, fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>Expected bookings<select value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: "100%", minHeight: 48, marginTop: 6, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "0 10px", background: C.white, color: C.jet, ...fBody }}><option>1–25 per month</option><option>26–50 per month</option><option>51–100 per month</option><option>100+ per month</option></select></label>
      <Card style={{ marginTop: 18, padding: "4px 14px" }}><CheckboxRow label="We run programs for participants under 18" checked={servesMinors} onClick={() => setServesMinors((value) => !value)} /></Card>
    </div>
    <div style={footer(C)}><Btn full onClick={continueFlow}>Continue</Btn></div>
  </div>;
}

export function ScreenBusinessIdentity() {
  const { darkMode, nav, businessOnboarding, updateBusinessOnboarding, toast } = useApp();
  const C = darkMode ? CD : CL;
  const [form, setForm] = useState({
    legalName: businessOnboarding.legalName || "", abn: businessOnboarding.abn || "", entityType: businessOnboarding.entityType || "Australian proprietary company",
    registeredAddress: businessOnboarding.registeredAddress || "", website: businessOnboarding.website || "", representativeName: businessOnboarding.representativeName || "",
    representativeRole: businessOnboarding.representativeRole || "Director", gstRegistered: businessOnboarding.gstRegistered ?? true,
  });
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const valid = form.legalName.trim() && form.abn.replace(/\D/g, "").length === 11 && form.registeredAddress.trim() && form.representativeName.trim();
  const continueFlow = () => {
    if (!valid) { toast("Complete the required business details"); return; }
    updateBusinessOnboarding({ ...form, abnVerified: true }); nav("business-plan");
  };
  return <div style={shell(C)}>
    <TopBar title="Business identity" onBack={() => nav("business-eligibility")} />
    <div style={content} className="cl-hide-scrollbar">
      <StepProgress step={2} total={3} label="Business details" />
      <h1 style={heading(C)}>Confirm who operates the business</h1>
      <p style={body(C)}>We use these details for verification. Your legal name and address stay private.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Legal entity name" placeholder="e.g., Apex Tennis Academy Pty Ltd" value={form.legalName} onChange={set("legalName")} required />
        <Field label="ABN" placeholder="11-digit Australian Business Number" value={form.abn} onChange={set("abn")} required />
        {form.abn.replace(/\D/g, "").length === 11 ? <div style={{ marginTop: -8, color: C.success, fontSize: T.captionLg, fontWeight: 700, ...fBody }}>Lookup matched — demo verification</div> : null}
        <label style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>Entity type<select value={form.entityType} onChange={set("entityType")} style={{ width: "100%", minHeight: 48, marginTop: 6, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "0 10px", background: C.white, color: C.jet, ...fBody }}><option>Australian proprietary company</option><option>Incorporated association</option><option>Sole trader</option><option>Partnership</option><option>Other</option></select></label>
        <Field label="Registered address" placeholder="Street, suburb, state and postcode" value={form.registeredAddress} onChange={set("registeredAddress")} required />
        <Field label="Website" placeholder="yourbusiness.com.au" value={form.website} onChange={set("website")} />
        <Field label="Authorised representative" placeholder="Full legal name" value={form.representativeName} onChange={set("representativeName")} required />
        <Field label="Representative role" placeholder="e.g., Director" value={form.representativeRole} onChange={set("representativeRole")} required />
        <Card style={{ padding: "4px 14px" }}><CheckboxRow label="The business is registered for GST" checked={form.gstRegistered} onClick={() => setForm((current) => ({ ...current, gstRegistered: !current.gstRegistered }))} /></Card>
      </div>
    </div>
    <div style={footer(C)}><Btn full onClick={continueFlow}>Continue</Btn></div>
  </div>;
}

export function ScreenBusinessPlan() {
  const { darkMode, nav, businessOnboarding, updateBusinessOnboarding, toast } = useApp();
  const C = darkMode ? CD : CL;
  const [planId, setPlanId] = useState(businessOnboarding.planId || "starter");
  const [agreement, setAgreement] = useState(false);
  const submit = () => {
    if (!agreement) { toast("Accept the provider agreement first"); return; }
    updateBusinessOnboarding({ planId, agreementAccepted: true });
    nav("business-plan-checkout", { planId, source: "onboarding" });
  };
  return <div style={shell(C)}>
    <TopBar title="Plan & commercial terms" onBack={() => nav("business-identity")} />
    <div style={content} className="cl-hide-scrollbar">
      <StepProgress step={3} total={4} label="Choose a plan" />
      <h1 style={heading(C)}>Choose what fits today</h1>
      <p style={body(C)}>Plans are billed monthly in AUD. You can change plans as your roster grows.</p>
      {BUSINESS_PLANS.map((plan) => <BusinessPlanCard key={plan.id} plan={plan} selected={planId === plan.id} onSelect={() => setPlanId(plan.id)} C={C} />)}
      <Card style={{ padding: "6px 14px", marginTop: 4 }}><CheckboxRow label="I am authorised to accept the Provider Agreement, privacy obligations, marketplace rules and cancellation responsibilities." checked={agreement} onClick={() => setAgreement((value) => !value)} /></Card>
    </div>
    <div style={footer(C)}><Btn full icon={CreditCard} onClick={submit}>Continue to payment</Btn></div>
  </div>;
}

export function ScreenBusinessApplicationSubmitted() {
  const { darkMode, resetNav, business, getBusinessProgress, simulateBusinessDecision } = useApp();
  const C = darkMode ? CD : CL;
  const progress = getBusinessProgress();
  const plan = BUSINESS_PLANS.find((item) => item.id === business.planId) || BUSINESS_PLANS[0];
  const verified = [BUSINESS_STATUS.APPROVED, BUSINESS_STATUS.CONDITIONAL, BUSINESS_STATUS.LIVE].includes(business.status);
  const changesRequired = business.status === BUSINESS_STATUS.CHANGES_REQUIRED;
  return <div style={{ ...shell(C), justifyContent: "center", padding: "28px 22px", boxSizing: "border-box" }}>
    <div style={{ width: 76, height: 76, margin: "0 auto 20px", borderRadius: 24, background: verified ? C.successTint : changesRequired ? C.warnTint : C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}>{verified ? <CheckCircle2 size={38} color={C.success} /> : <ShieldCheck size={38} color={changesRequired ? C.warnStrong : C.brand} />}</div>
    <div style={{ textAlign: "center", fontSize: T.displayLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{verified ? "Your business is verified" : changesRequired ? "One update is needed" : "Verification is in progress"}</div>
    <p style={{ ...body(C), textAlign: "center", marginTop: 10 }}>{verified ? "You can enter your workspace and complete the remaining launch steps. Your public profile stays hidden until every gate is ready." : changesRequired ? "We could not confirm one of the submitted details. In production, the requested change would appear here before resubmission." : "Your application was submitted successfully. This prototype lets you simulate the verification decision before entering the business workspace."}</p>
    <Card style={{ padding: 16, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: T.body, color: C.slate, ...fBody }}><span>Selected plan</span><strong style={{ color: C.jet }}>{plan.name} · ${plan.monthlyPrice}/month</strong></div>
      {plan.trialMonths ? <div style={{ marginTop: 8, color: C.success, fontSize: T.captionLg, fontWeight: 700, ...fBody }}>Your first month is free</div> : null}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><span style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Business verification</span><Badge tone={verified ? "success" : changesRequired ? "orange" : "neutral"}>{verified ? "Verified" : changesRequired ? "Changes required" : "Under review"}</Badge></div>
      {verified ? <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: T.captionLg, color: C.slate, ...fBody }}><span>Launch checklist</span><strong style={{ color: C.jet }}>{progress.complete} of {progress.total}</strong></div><div style={{ height: 7, marginTop: 8, borderRadius: 999, overflow: "hidden", background: C.border }}><div style={{ width: `${progress.percent}%`, height: "100%", background: C.brand }} /></div></div> : null}
    </Card>
    {verified ? <div style={{ marginTop: 20 }}><Btn full icon={Sparkles} onClick={() => resetNav("business-dashboard", {}, "business")}>Enter business workspace</Btn></div> : <div style={{ display: "grid", gap: 9, marginTop: 20 }}><Btn full icon={ShieldCheck} onClick={() => simulateBusinessDecision(BUSINESS_STATUS.APPROVED)}>Simulate verification approved</Btn><Btn full variant="outline" onClick={() => simulateBusinessDecision(BUSINESS_STATUS.CHANGES_REQUIRED)}>Simulate changes required</Btn></div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 18 }}>{[{ icon: FileCheck2, label: "Identity review" }, { icon: CreditCard, label: "Payment setup" }, { icon: ShieldCheck, label: "Coach checks" }].map(({ icon: Icon, label }) => <div key={label} style={{ textAlign: "center", padding: 10, borderRadius: 14, background: C.fog }}><Icon size={18} color={C.brand} /><div style={{ marginTop: 5, fontSize: T.micro, color: C.slate, ...fBody }}>{label}</div></div>)}</div>
  </div>;
}
