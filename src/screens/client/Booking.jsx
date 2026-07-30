import React, { useState } from "react";
import {
  Info, Fingerprint, CreditCard, CheckCircle2, Plus, Lock, Calendar, Navigation, MessageCircle,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, CONFIG } from "../../data/mockData";
import {
  Avatar, Card, Chip, SectionLabel, Btn, TopBar, Toggle, Field, Row,
} from "../../components/ui/Primitives";

export function ScreenBookingDateTime({ nav, params, setDraft }) {
  const coach = COACHES.find((c) => c.id === params.coachId);
  const pkg = coach.packages.find((p) => p.id === params.packageId);
  const days = Object.keys(coach.availability);
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState(null);
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Choose a time" onBack={() => nav("coach-profile", { id: coach.id })} />
      <Card style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar name={coach.name} size={42} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.jet, ...fDisplay }}>{pkg.name}</div>
          <div style={{ fontSize: 12, color: C.slate, ...fBody }}>with {coach.name} · {pkg.duration} min · ${pkg.price}</div>
        </div>
      </Card>

      <SectionLabel>Day</SectionLabel>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>
        {days.map((d) => <Chip key={d} active={day === d} onClick={() => { setDay(d); setTime(null); }}>{d}</Chip>)}
      </div>

      <SectionLabel>Available times · real-time</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {coach.availability[day].map((t) => (
          <button key={t} onClick={() => setTime(t)} style={{
            padding: "12px 0", borderRadius: 12, border: `1.5px solid ${time === t ? C.orange : C.border}`,
            background: time === t ? C.orangeTint : C.white, color: time === t ? C.orange : C.jet,
            fontWeight: 600, fontSize: 13.5, cursor: "pointer", ...fBody,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <Info size={14} color={C.slate} style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>Only real-time open slots are shown — {coach.name.split(" ")[0]}'s calendar updates automatically once you book.</span>
      </div>

      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full disabled={!time} onClick={() => { setDraft({ coach, pkg, day, time, mode: pkg.mode }); nav("booking-review"); }}>Continue</Btn>
      </div>
    </div>
  );
}

export function ScreenBookingReview({ nav, draft, setDraft, toast }) {
  const [under18, setUnder18] = useState(false);
  const [consent, setConsent] = useState(false);
  const fee = Math.round(draft.pkg.price * CONFIG.serviceFeeRate * 100) / 100;
  const total = draft.pkg.price + fee;
  const canContinue = !under18 || consent;
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Review booking" onBack={() => nav("booking-datetime", { coachId: draft.coach.id, packageId: draft.pkg.id })} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Coach" value={draft.coach.name} />
          <Row label="Service" value={draft.pkg.name} />
          <Row label="When" value={`${draft.day}, ${draft.time}`} />
          <Row label="Location" value={draft.mode} last />
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, marginBottom: 6, ...fDisplay }}>Cancellation policy</div>
          <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.55, ...fBody }}>{draft.coach.cancellationPolicy}</div>
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>This session is for someone under 18</div>
            <Toggle on={under18} onClick={() => setUnder18((v) => !v)} />
          </div>
          {under18 && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 8, ...fDisplay }}>Guardian consent</div>
              <Field label="Guardian full name" placeholder="Jamie Chen" />
              <div style={{ height: 10 }} />
              <Field label="Relationship to participant" placeholder="Parent" />
              <button onClick={() => setConsent(!consent)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginTop: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${consent ? C.orange : C.border}`, background: consent ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {consent && <CheckCircle2 size={12} color={C.white} />}
                </div>
                <span style={{ fontSize: 12, color: C.jet, lineHeight: 1.5, ...fBody }}>I confirm I am the parent or legal guardian and consent to this booking, including CoachLink's handling of the participant's data.</span>
              </button>
            </div>
          )}
        </Card>

        <Card>
          <Row label="Session" value={`$${draft.pkg.price.toFixed(2)}`} />
          <Row label="Service fee" value={`$${fee.toFixed(2)}`} />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold last />
        </Card>
      </div>
      <div style={{ padding: "14px 0" }}>
        <Btn full disabled={!canContinue} onClick={() => { setDraft({ ...draft, total, under18 }); nav("payment"); }}>Continue to payment</Btn>
      </div>
    </div>
  );
}

export function ScreenPayment({ nav, draft, toast, addBooking, biometric }) {
  const [confirming, setConfirming] = useState(false);
  const pay = () => {
    if (biometric) { setConfirming(true); setTimeout(() => { setConfirming(false); finish(); }, 1100); }
    else finish();
  };
  const finish = () => {
    addBooking(draft);
    toast("Payment confirmed");
    nav("booking-confirmation");
  };
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopBar title="Payment" onBack={() => nav("booking-review")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Btn full variant="dark" onClick={pay}>Pay ${draft.total.toFixed(2)} with  Pay</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 11.5, color: C.slateLight, ...fBody }}>or pay by card</span><div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
        <SectionLabel>Saved payment methods</SectionLabel>
        <Card style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 24, borderRadius: 5, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={13} color={C.white} />
          </div>
          <div style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Visa •••• 4821</div>
          <CheckCircle2 size={16} color={C.orange} style={{ marginLeft: "auto" }} />
        </Card>
        <Btn variant="outline" size="sm" icon={Plus}>Add new card</Btn>

        <div style={{ marginTop: 20 }}>
          <Field label="Promo code" placeholder="Enter code" />
        </div>

        <Card style={{ marginTop: 20 }}>
          <Row label="Total due today" value={`$${draft.total.toFixed(2)}`} bold last />
        </Card>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14 }}>
          <Lock size={13} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: C.slateLight, lineHeight: 1.5, ...fBody }}>Funds are held securely and only released to {draft.coach.name.split(" ")[0]} once you confirm the session is complete.</span>
        </div>
      </div>
      <div style={{ padding: "14px 0" }}>
        <Btn full onClick={pay}>Pay & confirm booking</Btn>
      </div>

      {confirming && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 70, borderRadius: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Fingerprint size={30} color={C.white} />
          </div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 600, ...fBody }}>Confirm with Face ID</div>
        </div>
      )}
    </div>
  );
}

export function ScreenBookingConfirmation({ nav, draft, toast }) {
  const [synced, setSynced] = useState(false);
  const [locShare, setLocShare] = useState(false);
  return (
    <div style={{ padding: "28px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <CheckCircle2 size={28} color={C.success} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.jet, ...fDisplay }}>
          {draft.coach.instantBook ? "Booking confirmed" : "Request sent"}
        </div>
        <div style={{ fontSize: 13, color: C.slate, marginTop: 4, ...fBody }}>
          {draft.coach.instantBook ? `You're all set with ${draft.coach.name}.` : `${draft.coach.name} will respond within 24 hours.`}
        </div>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <Row label="Service" value={draft.pkg.name} />
        <Row label="When" value={`${draft.day}, ${draft.time}`} />
        <Row label="Location" value={draft.mode} last />
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} color={C.jet} />
            <span style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Sync to device calendar</span>
          </div>
          <Toggle on={synced} onClick={() => { setSynced((v) => !v); toast(!synced ? "Added to your calendar" : "Removed from calendar"); }} />
        </div>
      </Card>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Navigation size={16} color={C.jet} />
            <span style={{ fontSize: 13, color: C.jet, fontWeight: 500, ...fBody }}>Share live location during session</span>
          </div>
          <Toggle on={locShare} onClick={() => setLocShare((v) => !v)} />
        </div>
      </Card>

      <div style={{ marginTop: "auto", padding: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn full variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: draft.coach.name })}>Message {draft.coach.name.split(" ")[0]}</Btn>
        <Btn full onClick={() => nav("client-dashboard")}>Go to dashboard</Btn>
      </div>
    </div>
  );
}
