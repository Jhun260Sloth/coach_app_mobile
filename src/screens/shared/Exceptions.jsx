import React, { useState } from "react";
import {
  ArrowRight, BadgeDollarSign, CalendarDays, Check, CheckCircle2,
  CircleDot, CreditCard, FileCheck2, LifeBuoy, LockKeyhole, MessageCircle,
  Paperclip, Plus, ReceiptText, Scale, ShieldCheck, UploadCloud, WalletCards, XCircle,
} from "lucide-react";
import { CL, CD, fBody, fDisplay, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import {
  ADDITIONAL_CHARGE_STATUS, DISPUTE_OUTCOME, DISPUTE_STATUS,
} from "../../data/bookings";
import {
  Badge, Btn, Card, Chip, EmptyState, SectionLabel, StepProgress, Toggle, TopBar,
} from "../../components/ui/Primitives";

const CLIENT_ISSUES = [
  { value: "session_not_delivered", label: "Session didn’t happen" },
  { value: "coach_late", label: "Coach was late" },
  { value: "service_different", label: "Service was different" },
  { value: "payment_refund", label: "Payment or refund" },
  { value: "additional_charge", label: "Additional charge" },
  { value: "other", label: "Something else" },
];

const COACH_ISSUES = [
  { value: "client_no_show", label: "Client no-show" },
  { value: "client_late", label: "Client was late" },
  { value: "safety", label: "Safety concern" },
  { value: "payment_charge", label: "Payment or charge" },
  { value: "service_disagreement", label: "Service disagreement" },
  { value: "other", label: "Something else" },
];

const CHARGE_REASONS = ["Extra session time", "Equipment or materials", "Venue fee", "Travel adjustment", "Other agreed cost"];

const STATUS_COPY = {
  [DISPUTE_STATUS.SUBMITTED]: { label: "Submitted", tone: "orange", title: "Your report is safely recorded" },
  [DISPUTE_STATUS.REVIEWING]: { label: "Under review", tone: "orange", title: "We’re reviewing the full session record" },
  [DISPUTE_STATUS.RESOLVED]: { label: "Decision made", tone: "success", title: "Your case has been resolved" },
};

function findBooking(id, bookings, coachBookings) {
  return bookings.find((item) => item.id === id) || coachBookings.find((item) => item.id === id);
}

function SectionHeading({ children, hint }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{children}</div>
      {hint && <div style={{ fontSize: T.captionLg, lineHeight: 1.45, color: C.slate, marginTop: 3, ...fBody }}>{hint}</div>}
    </div>
  );
}

function DetailRow({ label, value, bold, last }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ minHeight: 38, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <span style={{ fontSize: T.body, color: C.slate, ...fBody }}>{label}</span>
      <span style={{ fontSize: T.body, color: C.jet, fontWeight: bold ? 700 : 600, textAlign: "right", ...fBody }}>{value}</span>
    </div>
  );
}

function SessionContext({ booking, role }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const person = role === "coach" ? booking.clientName : booking.coachName;
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 12, background: C.fog, borderColor: "transparent" }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <CalendarDays size={19} color={C.brand} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...fDisplay }}>{booking.service}</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{booking.date} · {booking.time} · {person}</div>
      </div>
      <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>${Number(booking.price).toFixed(2)}</div>
    </Card>
  );
}

function IssueGrid({ items, value, onChange }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button key={item.value} onClick={() => onChange(item.value)} style={{ minHeight: 54, padding: "10px 11px", borderRadius: 14, border: `1.5px solid ${active ? C.brand : C.border}`, background: active ? C.brandTint : C.white, color: active ? C.brand : C.jet, display: "flex", alignItems: "center", gap: 8, textAlign: "left", cursor: "pointer", fontSize: T.body, fontWeight: active ? 700 : 600, lineHeight: 1.35, ...fBody }}>
            <span style={{ width: 18, height: 18, borderRadius: 99, border: `1.5px solid ${active ? C.brand : C.border}`, background: active ? C.brand : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {active && <Check size={11} color={C.white} strokeWidth={3} />}
            </span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function TextArea({ value, onChange, placeholder, minHeight = 108 }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={{ width: "100%", minHeight, resize: "none", boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "12px 13px", background: C.white, color: C.jet, outline: "none", lineHeight: 1.55, fontSize: T.bodyLg, ...fBody }} />
  );
}

function MoneyField({ value, onChange, disabled, label = "Amount in Australian dollars" }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ height: 48, border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, background: C.white, display: "flex", alignItems: "center", padding: "0 13px", gap: 8 }}>
      <span style={{ fontSize: T.title, fontWeight: 700, color: C.slate, ...fDisplay }}>$</span>
      <input type="number" name="amount" aria-label={label} inputMode="decimal" min="0" step="1" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} style={{ border: "none", outline: "none", background: "transparent", color: C.jet, opacity: disabled ? 0.72 : 1, width: "100%", fontSize: T.title, fontWeight: 700, ...fDisplay }} />
      <span style={{ fontSize: T.captionLg, color: C.slateLight, ...fBody }}>AUD</span>
    </div>
  );
}

function EvidenceUploader({ evidence, setEvidence, compact }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const addEvidence = () => {
    const next = evidence.length === 0 ? "Arrival photo · image" : "Session receipt · PDF";
    if (!evidence.includes(next)) setEvidence((items) => [...items, next]);
  };
  return (
    <div>
      <button onClick={addEvidence} style={{ width: "100%", minHeight: compact ? 66 : 82, border: `1.5px dashed ${evidence.length ? C.success : C.border}`, borderRadius: 16, background: evidence.length ? C.successTint : C.fog, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: evidence.length ? C.success : C.slate, cursor: "pointer", padding: 12 }}>
        {evidence.length ? <FileCheck2 size={20} /> : <UploadCloud size={21} />}
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: T.body, fontWeight: 700, color: evidence.length ? C.success : C.jet, ...fBody }}>{evidence.length ? `${evidence.length} item${evidence.length > 1 ? "s" : ""} attached` : "Add photo, receipt or document"}</div>
          <div style={{ fontSize: T.caption, color: C.slate, marginTop: 2, ...fBody }}>{evidence.length ? "Tap to attach another item" : "JPG, PNG or PDF · up to 10 MB"}</div>
        </div>
      </button>
      {evidence.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {evidence.map((item) => <Chip key={item} active icon={Paperclip}>{item}</Chip>)}
        </div>
      )}
    </div>
  );
}

function ReviewNotice({ children }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <Card style={{ display: "flex", gap: 10, alignItems: "flex-start", background: C.brandTint, borderColor: "transparent" }}>
      <LockKeyhole size={17} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>{children}</div>
    </Card>
  );
}

export function ScreenDisputeCreate({
  nav, params, role: appRole, bookings = [], coachBookings = [],
  additionalCharges = [], createSessionDispute, disputeAdditionalCharge, toast,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const booking = findBooking(params?.bookingId, bookings, coachBookings);
  const relatedCharge = additionalCharges.find((item) => item.id === params?.chargeId);
  const issues = role === "coach" ? COACH_ISSUES : CLIENT_ISSUES;
  const initialCategory = params?.category || issues[0].value;
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState(params?.description || "");
  const [amount, setAmount] = useState(relatedCharge?.amount != null ? String(relatedCharge.amount) : booking?.price ? String(booking.price) : "");
  const [evidence, setEvidence] = useState([]);
  const [includeChat, setIncludeChat] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!booking) {
    return <EmptyState icon={Scale} title="Session not found" body="Open a session first, then choose Report an issue." ctaLabel="View sessions" onCta={() => nav(role === "coach" ? "coach-bookings" : "client-dashboard")} />;
  }

  const selectedIssue = issues.find((item) => item.value === category) || issues[0];
  const canReview = description.trim().length >= 12 && Number(amount) >= 0;
  const backTo = params?.backTo || (role === "coach" ? "coach-session-detail" : "client-booking-detail");
  const submit = () => {
    if (submitting) return;
    setSubmitting(true);
    const detail = { description: description.trim(), evidence };
    const caseId = params?.chargeId
      ? disputeAdditionalCharge?.(params.chargeId, detail)
      : createSessionDispute?.({
        bookingId: booking.id, filedByRole: role, category,
        categoryLabel: selectedIssue.label, description: description.trim(),
        amountRequested: amount, evidence, includeChat,
      });
    if (!caseId) {
      setSubmitting(false);
      toast?.("We couldn’t submit this report");
      return;
    }
    toast?.("Report submitted securely");
    window.setTimeout(() => nav("dispute-status", { caseId, role, backTo }), 650);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={step === 1 ? "Report a session issue" : "Review your report"} onBack={() => step === 2 ? setStep(1) : nav(backTo, { id: booking.id })} />
      <div style={{ flex: 1, overflowY: "auto", padding: `${LAYOUT.pagePadTop}px ${LAYOUT.pagePadX}px 24px` }} className="cl-hide-scrollbar">
        <StepProgress step={step} total={2} label={step === 1 ? "Tell us what happened" : "Check before sending"} />
        <div style={{ marginBottom: 18 }}><SessionContext booking={booking} role={role} /></div>

        {step === 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
            <div>
              <SectionHeading hint="Choose the closest match. You can explain the details below.">What went wrong?</SectionHeading>
              <IssueGrid items={issues} value={category} onChange={setCategory} />
            </div>
            <div>
              <SectionHeading hint="Include what happened, when, and how you tried to resolve it.">Describe the issue</SectionHeading>
              <TextArea value={description} onChange={setDescription} placeholder={role === "coach" ? "For example: I arrived on time, waited through the arrival window, and messaged the client…" : "For example: I arrived before the session, waited 25 minutes, and messaged the coach…"} />
              <div style={{ fontSize: T.caption, color: description.length >= 12 ? C.success : C.slateLight, textAlign: "right", marginTop: 5, ...fBody }}>{description.length < 12 ? `${12 - description.length} more characters` : "Enough detail to continue"}</div>
            </div>
            <div>
              <SectionHeading hint={role === "coach" ? "The amount you’re asking CoachLink to protect or compensate." : "The refund amount you’re requesting. The final decision may differ."}>Requested amount</SectionHeading>
              <MoneyField value={amount} onChange={setAmount} disabled={!!relatedCharge} />
            </div>
            <div>
              <SectionHeading hint="Evidence is optional, but it can help us resolve the case faster.">Add evidence</SectionHeading>
              <EvidenceUploader evidence={evidence} setEvidence={setEvidence} />
            </div>
            <Card style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <MessageCircle size={18} color={C.brand} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Include session chat</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>Only the relevant booking conversation is shared with support.</div>
              </div>
              <Toggle label="Include relevant chat messages" on={includeChat} onClick={() => setIncludeChat((value) => !value)} />
            </Card>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Card>
              <DetailRow label="Issue" value={selectedIssue.label} />
              <DetailRow label="Requested" value={`$${Number(amount || 0).toFixed(2)}`} />
              <DetailRow label="Evidence" value={`${evidence.length} attachment${evidence.length === 1 ? "" : "s"}`} />
              <DetailRow label="Session chat" value={includeChat ? "Included" : "Not included"} last />
            </Card>
            <Card>
              <SectionHeading>Your statement</SectionHeading>
              <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.65, ...fBody }}>{description}</div>
            </Card>
            <ReviewNotice>Submitting pauses any unresolved payout while our team reviews the booking, relevant messages and your evidence. The other party can respond, and both sides will see the same decision.</ReviewNotice>
          </div>
        )}
      </div>
      <div style={{ padding: `12px ${LAYOUT.pagePadX}px 28px`, borderTop: `1px solid ${C.border}`, background: C.white }}>
        {step === 1
          ? <Btn full disabled={!canReview} icon={ArrowRight} onClick={() => setStep(2)}>Review report</Btn>
          : <Btn full loading={submitting} loadingText="Submitting securely…" icon={ShieldCheck} onClick={submit}>Submit for review</Btn>}
      </div>
    </div>
  );
}

function CaseTimeline({ dispute }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const activeIndex = dispute.status === DISPUTE_STATUS.RESOLVED ? 2 : dispute.status === DISPUTE_STATUS.REVIEWING ? 1 : 0;
  const steps = [
    { title: "Report submitted", body: dispute.submittedAt || "Just now" },
    { title: "Evidence review", body: activeIndex >= 1 ? dispute.updatedAt || "In progress" : "Next" },
    { title: "Decision & payment", body: activeIndex >= 2 ? dispute.updatedAt || "Complete" : "Usually within 2 business days" },
  ];
  return (
    <Card>
      {steps.map((item, index) => {
        const done = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <div key={item.title} style={{ display: "flex", gap: 11, minHeight: index === steps.length - 1 ? 44 : 62 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, border: `1.5px solid ${done ? C.brand : C.border}`, background: done ? (current ? C.brand : C.brandTint) : C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {index < activeIndex ? <Check size={12} color={C.brand} strokeWidth={3} /> : <CircleDot size={12} color={done ? C.white : C.slateLight} />}
              </div>
              {index < steps.length - 1 && <div style={{ width: 1.5, flex: 1, background: index < activeIndex ? C.brand : C.border }} />}
            </div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: T.body, fontWeight: current ? 700 : 600, color: done ? C.jet : C.slateLight, ...fBody }}>{item.title}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>{item.body}</div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function OutcomeCard({ dispute, role, booking }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const refunded = dispute.outcome === DISPUTE_OUTCOME.CLIENT_REFUNDED;
  const compensated = dispute.outcome === DISPUTE_OUTCOME.COACH_COMPENSATED;
  const amount = Number(dispute.amountRequested || booking.price || 0);
  const favourable = (refunded && role === "client") || (compensated && role === "coach");
  const title = refunded ? "Full refund approved" : compensated ? "No-show compensation approved" : "No payment adjustment";
  const body = refunded
    ? role === "client" ? "Your refund is returning to the original payment method." : "The client received a refund and no payout will be released."
    : compensated
      ? role === "coach" ? "Your protected payout has been released under your no-show policy." : "The coach’s no-show protection applies to this booking."
      : "The original session payment remains unchanged.";
  return (
    <Card style={{ padding: 17, background: favourable ? C.successTint : C.fog, borderColor: favourable ? C.success : C.border }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: favourable ? C.successTint : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {favourable ? <CheckCircle2 size={21} color={C.success} /> : <Scale size={20} color={C.slate} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: T.title, fontWeight: 750, color: C.jet, ...fDisplay }}>{title}</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 5, ...fBody }}>{body}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${favourable ? C.success : C.border}` }}>
        <DetailRow label={refunded ? "Refund amount" : compensated ? "Protected session amount" : "Adjustment"} value={refunded || compensated ? `$${amount.toFixed(2)}` : "$0.00"} bold />
        <DetailRow label="Decision" value={favourable ? "In your favour" : "Case closed"} last />
      </div>
    </Card>
  );
}

export function ScreenDisputeStatus({ nav, params, role: appRole, bookings = [], coachBookings = [], sessionDisputes = [] }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const dispute = sessionDisputes.find((item) => item.id === (params?.caseId || params?.id))
    || sessionDisputes.find((item) => item.filedByRole === role)
    || sessionDisputes[0];
  const booking = dispute ? findBooking(dispute.bookingId, bookings, coachBookings) : null;

  if (!dispute || !booking) {
    return <EmptyState icon={Scale} title="Case not found" body="This case may have been archived. Contact support if you still need help." />;
  }

  const status = STATUS_COPY[dispute.status] || STATUS_COPY[DISPUTE_STATUS.SUBMITTED];
  const resolved = dispute.status === DISPUTE_STATUS.RESOLVED;
  const refunded = dispute.outcome === DISPUTE_OUTCOME.CLIENT_REFUNDED;
  const backTo = params?.backTo || (role === "coach" ? "coach-bookings" : "client-dashboard");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={`Case ${dispute.id.replace("case-", "#")}`} onBack={() => nav(backTo, params?.bookingId ? { id: params.bookingId } : {})} right={<Badge tone={status.tone}>{status.label}</Badge>} />
      <div style={{ flex: 1, overflowY: "auto", padding: `${LAYOUT.pagePadTop}px ${LAYOUT.pagePadX}px 24px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "8px 10px 20px" }}>
          <div style={{ width: 66, height: 66, borderRadius: 22, margin: "0 auto 14px", background: resolved ? C.successTint : C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {resolved ? <CheckCircle2 size={30} color={C.success} /> : <Scale size={28} color={C.brand} />}
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, ...fDisplay }}>{status.title}</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, margin: "7px auto 0", maxWidth: 320, ...fBody }}>
            {resolved ? dispute.decisionNote : dispute.supportNote}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {resolved && <OutcomeCard dispute={dispute} role={role} booking={booking} />}
          <SessionContext booking={booking} role={role} />
          <CaseTimeline dispute={dispute} />
          <Card>
            <SectionHeading>Report summary</SectionHeading>
            <DetailRow label="Issue" value={dispute.categoryLabel} />
            <DetailRow label="Requested" value={`$${Number(dispute.amountRequested || 0).toFixed(2)}`} />
            <DetailRow label="Evidence" value={`${dispute.evidence?.length || 0} item${dispute.evidence?.length === 1 ? "" : "s"}`} />
            <DetailRow label="Session chat" value={dispute.includeChat ? "Included" : "Not included"} last />
          </Card>
          <Card style={{ display: "flex", alignItems: "flex-start", gap: 11, background: C.fog }}>
            <ShieldCheck size={18} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{resolved ? "Decision record protected" : "Funds remain protected"}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>{resolved ? "Both parties can revisit this case summary and payment outcome at any time." : "No disputed funds move until the review is complete. Both parties receive the same status updates."}</div>
            </div>
          </Card>
        </div>
      </div>
      <div style={{ padding: `12px ${LAYOUT.pagePadX}px 28px`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        <Btn full icon={resolved ? ReceiptText : MessageCircle} onClick={() => {
          if (!resolved) nav("support", { presetTab: "contact", faqTopic: role, bookingId: booking.id, backTo: "dispute-status" });
          else if (refunded && role === "client") nav("refund-status", { booking: { ...booking, paymentStatus: "refunded", refundStatus: "refunded" } });
          else if (refunded) nav("coach-session-detail", { id: booking.id });
          else nav("funds-release-status", { bookingId: booking.id, role, backTo: "dispute-status" });
        }}>{!resolved ? "Message resolution support" : refunded && role === "client" ? "View refund status" : refunded ? "View session record" : "View payment outcome"}</Btn>
        <Btn full variant="outline" onClick={() => nav(role === "coach" ? "coach-bookings" : "client-dashboard")}>Back to sessions</Btn>
      </div>
    </div>
  );
}

export function ScreenAdditionalChargeCreate({ nav, params, coachBookings = [], bookings = [], createAdditionalCharge, toast }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const booking = findBooking(params?.bookingId || params?.id, bookings, coachBookings);
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState(CHARGE_REASONS[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return <EmptyState icon={BadgeDollarSign} title="Session not found" body="Choose a completed session before requesting an additional payment." />;
  const canReview = Number(amount) > 0 && note.trim().length >= 12;
  const submit = () => {
    setSubmitting(true);
    const chargeId = createAdditionalCharge?.({ bookingId: booking.id, reason, note: note.trim(), amount, evidence: evidence[0] || "No attachment" });
    if (!chargeId) {
      setSubmitting(false);
      toast?.("We couldn’t send this request");
      return;
    }
    toast?.("Payment request sent to the client");
    window.setTimeout(() => nav("additional-charge-review", { chargeId, role: "coach", backTo: "coach-session-detail" }), 650);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={step === 1 ? "Additional payment" : "Client preview"} onBack={() => step === 2 ? setStep(1) : nav("coach-session-detail", { id: booking.id })} />
      <div style={{ flex: 1, overflowY: "auto", padding: `${LAYOUT.pagePadTop}px ${LAYOUT.pagePadX}px 24px` }} className="cl-hide-scrollbar">
        <StepProgress step={step} total={2} label={step === 1 ? "Add the agreed cost" : "Review before sending"} />
        <div style={{ marginBottom: 18 }}><SessionContext booking={booking} role="coach" /></div>
        {step === 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
            <div>
              <SectionHeading hint="Only request costs the client agreed to during the session.">What is this for?</SectionHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {CHARGE_REASONS.map((item) => <Chip key={item} active={reason === item} onClick={() => setReason(item)}>{item}</Chip>)}
              </div>
            </div>
            <div><SectionHeading>Amount</SectionHeading><MoneyField value={amount} onChange={setAmount} /></div>
            <div>
              <SectionHeading hint="Explain the agreed change clearly so the client can decide confidently.">Message to the client</SectionHeading>
              <TextArea value={note} onChange={setNote} placeholder="For example: We agreed to extend the session by 20 minutes to finish the training plan…" minHeight={116} />
            </div>
            <div><SectionHeading hint="A receipt or session note makes the request easier to verify.">Receipt or evidence</SectionHeading><EvidenceUploader evidence={evidence} setEvidence={setEvidence} compact /></div>
            <ReviewNotice>The client can approve and pay, ask you a question, or open a dispute. CoachLink never charges them automatically.</ReviewNotice>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Card style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <Badge tone="orange">Payment request</Badge>
                  <div style={{ fontSize: T.titleLg, fontWeight: 750, color: C.jet, marginTop: 10, ...fDisplay }}>{reason}</div>
                </div>
                <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, ...fDisplay }}>${Number(amount).toFixed(2)}</div>
              </div>
              <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.65, marginTop: 13, ...fBody }}>{note}</div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <DetailRow label="Session" value={booking.service} />
                <DetailRow label="Attachment" value={evidence.length ? "Included" : "None"} last />
              </div>
            </Card>
            <ReviewNotice>This is exactly what the client will see. They must actively approve the payment before any funds move.</ReviewNotice>
          </div>
        )}
      </div>
      <div style={{ padding: `12px ${LAYOUT.pagePadX}px 28px`, borderTop: `1px solid ${C.border}`, background: C.white }}>
        {step === 1 ? <Btn full disabled={!canReview} icon={ArrowRight} onClick={() => setStep(2)}>Preview for client</Btn> : <Btn full loading={submitting} loadingText="Sending request…" icon={BadgeDollarSign} onClick={submit}>Send payment request</Btn>}
      </div>
    </div>
  );
}

export function ScreenAdditionalChargeReview({
  nav, params, role: appRole, bookings = [], coachBookings = [], additionalCharges = [],
  cancelAdditionalCharge, toast,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const charge = additionalCharges.find((item) => item.id === (params?.chargeId || params?.id)) || additionalCharges[0];
  const booking = charge ? findBooking(charge.bookingId, bookings, coachBookings) : null;

  if (!charge || !booking) return <EmptyState icon={ReceiptText} title="Request not found" body="This payment request may have been withdrawn." />;
  const pending = charge.status === ADDITIONAL_CHARGE_STATUS.PENDING;
  const paid = charge.status === ADDITIONAL_CHARGE_STATUS.PAID;
  const disputed = charge.status === ADDITIONAL_CHARGE_STATUS.DISPUTED;
  const person = role === "coach" ? booking.clientName : booking.coachName;
  const withdraw = () => {
    if (cancelAdditionalCharge?.(charge.id)) toast?.("Payment request withdrawn");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={role === "coach" ? "Payment request" : "Review request"} onBack={() => nav(role === "coach" ? "coach-session-detail" : "client-booking-detail", { id: booking.id })} right={<Badge tone={paid ? "success" : pending ? "orange" : "neutral"}>{paid ? "Paid" : disputed ? "Disputed" : charge.status === ADDITIONAL_CHARGE_STATUS.CANCELLED ? "Withdrawn" : "Awaiting response"}</Badge>} />
      <div style={{ flex: 1, overflowY: "auto", padding: `${LAYOUT.pagePadTop}px ${LAYOUT.pagePadX}px 24px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "7px 8px 20px" }}>
          <div style={{ width: 66, height: 66, borderRadius: 22, margin: "0 auto 14px", background: paid ? C.successTint : C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {paid ? <CheckCircle2 size={30} color={C.success} /> : <BadgeDollarSign size={29} color={C.brand} />}
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, ...fDisplay }}>{paid ? "Payment complete" : role === "coach" ? "Request sent to the client" : `${person} requested an additional payment`}</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, marginTop: 7, ...fBody }}>{paid ? "The updated receipt is ready and both sides have been notified." : role === "coach" ? "They can pay, ask a question, or dispute the request. No automatic charge will occur." : "Review the explanation and evidence before you decide. You won’t be charged automatically."}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontSize: T.captionLg, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: ".04em", ...fBody }}>Additional cost</div>
                <div style={{ fontSize: T.titleLg, fontWeight: 750, color: C.jet, marginTop: 5, ...fDisplay }}>{charge.reason}</div>
              </div>
              <div style={{ fontSize: T.hero, fontWeight: 750, color: C.jet, ...fDisplay }}>${Number(charge.amount).toFixed(2)}</div>
            </div>
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.65, marginTop: 13, ...fBody }}>{charge.note}</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <DetailRow label="Session" value={booking.service} />
              <DetailRow label="Requested by" value={role === "coach" ? "You" : person} />
              <DetailRow label="Evidence" value={charge.evidence || "None"} />
              <DetailRow label={paid ? "Paid" : "Response window"} value={paid ? charge.paidAt : charge.dueAt} last />
            </div>
          </Card>
          {!paid && !disputed && (
            <ReviewNotice>Approval creates a separate receipt tied to this session. If anything looks wrong, question the request before paying or send it to CoachLink for review.</ReviewNotice>
          )}
          {disputed && (
            <Card style={{ background: C.warnTint, borderColor: C.brand }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><Scale size={18} color={C.brand} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Sent to resolution support</div><div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>Payment is paused while CoachLink reviews the session and this request.</div></div></div>
            </Card>
          )}
          {paid && <SessionContext booking={booking} role={role} />}
        </div>
      </div>
      <div style={{ padding: `12px ${LAYOUT.pagePadX}px 28px`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        {role === "client" && pending && <Btn full icon={WalletCards} onClick={() => nav("additional-charge-payment", { chargeId: charge.id, role: "client" })}>Continue to payment · ${Number(charge.amount).toFixed(2)}</Btn>}
        {role === "client" && pending && <Btn full variant="outline" icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.coachName, bookingId: booking.id, context: `Additional payment · ${booking.service}`, backTo: "additional-charge-review", backParams: { chargeId: charge.id, role } })}>Ask the coach a question</Btn>}
        {role === "client" && pending && <Btn full variant="ghost" icon={Scale} onClick={() => nav("dispute-create", { bookingId: booking.id, role: "client", category: "additional_charge", chargeId: charge.id, description: `I don’t recognise or agree with the ${charge.reason.toLowerCase()} request.`, backTo: "additional-charge-review" })}>Dispute this request</Btn>}
        {role === "coach" && pending && <Btn full icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.clientName, bookingId: booking.id, context: `Additional payment · ${booking.service}`, backTo: "additional-charge-review", backParams: { chargeId: charge.id, role } })}>Message the client</Btn>}
        {role === "coach" && pending && <Btn full variant="danger" icon={XCircle} onClick={withdraw}>Withdraw request</Btn>}
        {(paid || disputed || charge.status === ADDITIONAL_CHARGE_STATUS.CANCELLED) && <Btn full icon={paid ? CheckCircle2 : LifeBuoy} onClick={() => paid ? nav(role === "coach" ? "coach-session-detail" : "client-booking-detail", { id: booking.id }) : nav("support", { presetTab: "contact", faqTopic: role, bookingId: booking.id, backTo: "additional-charge-review" })}>{paid ? "Done" : "Get help with this request"}</Btn>}
      </div>
    </div>
  );
}

export function ScreenAdditionalChargePayment({
  nav, params, bookings = [], coachBookings = [], additionalCharges = [],
  payAdditionalCharge, toast, offline,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const charge = additionalCharges.find((item) => item.id === params?.chargeId);
  const booking = charge ? findBooking(charge.bookingId, bookings, coachBookings) : null;
  const [method, setMethod] = useState("visa");
  const [processing, setProcessing] = useState(false);

  if (!charge || !booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
        <TopBar title="Secure payment" onBack={() => nav("client-dashboard")} />
        <EmptyState icon={ReceiptText} title="Payment request unavailable" body="This request may already have been paid or withdrawn." />
      </div>
    );
  }

  const pending = charge.status === ADDITIONAL_CHARGE_STATUS.PENDING;
  const amount = Number(charge.amount || 0);
  const confirmPayment = () => {
    if (!pending || processing) return;
    if (offline) {
      toast?.("Reconnect to complete payment");
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      const paid = payAdditionalCharge?.(charge.id);
      setProcessing(false);
      if (!paid) {
        toast?.("Payment request is no longer available");
        nav("additional-charge-review", { chargeId: charge.id, role: "client" });
        return;
      }
      toast?.("Additional payment completed");
      nav("additional-charge-review", { chargeId: charge.id, role: "client" });
    }, 900);
  };

  const methodOption = (value, icon, title, detail) => {
    const Icon = icon;
    const selected = method === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => setMethod(value)}
        style={{
          width: "100%", minHeight: 60, padding: "10px 12px", borderRadius: 14,
          border: `1.5px solid ${selected ? C.brand : C.border}`,
          background: selected ? C.brandTint : C.white, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 11, textAlign: "left",
        }}
      >
        <div style={{ width: 38, height: 30, borderRadius: 9, background: selected ? C.brand : C.jet, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={C.white} />
        </div>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{title}</span>
          <span style={{ display: "block", fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{detail}</span>
        </span>
        <span style={{ width: 20, height: 20, borderRadius: 99, border: `1.5px solid ${selected ? C.brand : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {selected && <span style={{ width: 10, height: 10, borderRadius: 99, background: C.brand }} />}
        </span>
      </button>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Secure payment" onBack={() => nav("additional-charge-review", { chargeId: charge.id, role: "client" })} right={<Badge tone="success" icon={ShieldCheck}>Protected</Badge>} />

      <div style={{ flex: 1, overflowY: "auto", padding: `${LAYOUT.pagePadTop}px ${LAYOUT.pagePadX}px 24px` }} className="cl-hide-scrollbar">
        <Card style={{ padding: 18, marginBottom: 20, background: C.warnTint, borderColor: C.warnStrong }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: T.captionLg, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: ".04em", ...fBody }}>Additional payment</div>
              <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginTop: 5, ...fDisplay }}>{charge.reason}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 4, lineHeight: 1.45, ...fBody }}>{booking.coachName} · {booking.service}</div>
            </div>
            <div style={{ fontSize: T.headingLg, fontWeight: 800, color: C.jet, ...fDisplay }}>${amount.toFixed(2)}</div>
          </div>
        </Card>

        <SectionLabel>Payment method</SectionLabel>
        <div role="radiogroup" aria-label="Payment method" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {methodOption("visa", CreditCard, "Visa •••• 4821", "Saved card · Expires 08/28")}
          {methodOption("wallet", WalletCards, "CoachLink Pay", "Use your saved mobile wallet")}
        </div>

        <div style={{ marginTop: 12 }}>
          <Btn
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => nav("payment-add-card", {
              returnTo: "additional-charge-payment",
              returnParams: { chargeId: charge.id, role: "client" },
            })}
          >
            Add another card
          </Btn>
        </div>

        <div style={{ marginTop: 22 }}><SectionLabel>Payment summary</SectionLabel></div>
        <Card>
          <DetailRow label="Additional charge" value={`$${amount.toFixed(2)}`} />
          <DetailRow label="Processing fee" value="$0.00" />
          <DetailRow label="Total due today" value={`$${amount.toFixed(2)}`} last />
        </Card>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, padding: 12, borderRadius: 13, background: C.fog }}>
          <LockKeyhole size={15} color={C.brand} style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>Your payment details are encrypted. This creates a separate receipt linked to the original booking.</div>
        </div>
        {offline && <div style={{ marginTop: 12 }}><ReviewNotice>You’re offline. Reconnect before confirming this payment.</ReviewNotice></div>}
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px 28px`, borderTop: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: T.labelLg, color: C.slate, ...fBody }}>Total</span>
          <span style={{ fontSize: T.titleLg, fontWeight: 800, color: C.jet, ...fDisplay }}>${amount.toFixed(2)}</span>
        </div>
        <Btn full loading={processing} loadingText="Processing securely…" disabled={!pending || offline} icon={LockKeyhole} onClick={confirmPayment}>Pay ${amount.toFixed(2)}</Btn>
      </div>
    </div>
  );
}
