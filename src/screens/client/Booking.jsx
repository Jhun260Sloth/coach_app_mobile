import React, { useState } from "react";
import {
  Info, Fingerprint, CreditCard, CheckCircle2, Plus, Lock, Calendar, Navigation, MessageCircle,
  Users, User, ShieldCheck, Phone, Stethoscope, AlertTriangle, UserPlus,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, CONFIG } from "../../data/mockData";
import {
  Avatar, Card, Chip, SectionLabel, Btn, TopBar, Toggle, Field, Row, Spinner, ScrollFadeRow,
} from "../../components/ui/Primitives";

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function nextDateForWeekday(abbrev) {
  const target = WEEKDAY_INDEX[abbrev];
  const now = new Date();
  const diff = (target - now.getDay() + 7) % 7;
  const result = new Date(now);
  result.setDate(now.getDate() + diff);
  return result;
}

function formatFullDate(abbrev) {
  return nextDateForWeekday(abbrev).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

function formatTime12(t) {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${period}`;
}

export function ScreenBookingDateTime({ nav, params, setDraft }) {
  const coach = COACHES.find((c) => c.id === params.coachId);
  const pkg = coach.packages.find((p) => p.id === params.packageId);
  const days = Object.keys(coach.availability);
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState(null);
  const [checking, setChecking] = useState(false);

  const selectTime = (t) => {
    if (checking) return;
    setTime(t);
    setChecking(true);
    // Simulates a real-time availability check against the coach's calendar before locking the slot in.
    setTimeout(() => setChecking(false), 550);
  };
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Choose a time" onBack={() => nav("coach-profile", { id: coach.id })} />

      <Card style={{ marginBottom: 22, display: "flex", gap: 12, alignItems: "center", border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)" }}>
        <Avatar name={coach.name} size={44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.jet, letterSpacing: "-0.1px", ...fDisplay }}>{pkg.name}</div>
          <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2, ...fBody }}>
            with {coach.name} · {pkg.duration} min
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 16, fontWeight: 800, color: C.jet, whiteSpace: "nowrap", ...fDisplay }}>
          ${pkg.price}
        </div>
      </Card>

      <SectionLabel>Day</SectionLabel>
      <ScrollFadeRow
        style={{
          display: "flex", gap: 8, overflowX: "auto", marginBottom: 24, paddingBottom: 4,
          WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity",
        }}
      >
        {days.map((d) => {
          const active = day === d;
          return (
            <button
              key={d}
              onClick={() => { setDay(d); setTime(null); setChecking(false); }}
              style={{
                flexShrink: 0, scrollSnapAlign: "start", padding: "10px 16px", borderRadius: 14,
                border: `1.5px solid ${active ? C.jet : C.border}`,
                background: active ? C.jet : C.white,
                color: active ? C.white : C.jet,
                fontWeight: active ? 700 : 600, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer",
                boxShadow: active ? "0 4px 10px rgba(22,24,29,.18)" : "none",
                transition: "background .15s ease, box-shadow .15s ease", ...fBody,
              }}
            >
              {formatFullDate(d)}
            </button>
          );
        })}
      </ScrollFadeRow>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.jet, ...fDisplay }}>Available times</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.success, ...fBody }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: C.success, animation: "clPulse 1.4s infinite" }} />
          Real-time
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 22 }}>
        {coach.availability[day].map((t) => {
          const active = time === t;
          const isChecking = active && checking;
          return (
            <button
              key={t}
              onClick={() => selectTime(t)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "12px 0", borderRadius: 12, border: `1.5px solid ${active ? C.jet : C.border}`,
                background: active ? C.jet : C.white, color: active ? C.white : C.jet,
                fontWeight: active ? 700 : 600, fontSize: 13.5, cursor: checking ? "default" : "pointer",
                boxShadow: active ? "0 4px 10px rgba(22,24,29,.18)" : "none",
                transition: "background .15s ease, box-shadow .15s ease", ...fBody,
              }}
            >
              {isChecking ? <Spinner size={13} /> : (active && <CheckCircle2 size={13} color={C.white} />)}
              {formatTime12(t)}
            </button>
          );
        })}
      </div>

      {time && (
        <Card style={{ marginBottom: 18, background: checking ? C.fog : C.orangeTint, border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {checking ? <Spinner size={16} color={C.slate} /> : <Calendar size={16} color={C.orange} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>
              {checking
                ? `Checking availability for ${formatFullDate(day)} at ${formatTime12(time)}…`
                : `${formatFullDate(day)} at ${formatTime12(time)} — confirmed available`}
            </span>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <Info size={14} color={C.slate} style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>Only real-time open slots are shown — {coach.name.split(" ")[0]}'s calendar updates automatically once you book.</span>
      </div>

      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full disabled={!time || checking} onClick={() => { setDraft({ coach, pkg, day: formatFullDate(day), time: formatTime12(time), mode: pkg.mode }); nav("booking-review"); }}>Continue</Btn>
      </div>
    </div>
  );
}

export function ScreenBookingReview({ nav, draft, setDraft, toast, children = [] }) {
  const [participants, setParticipants] = useState(["self"]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [conditions, setConditions] = useState("");
  const [consent, setConsent] = useState(false);

  const toggleParticipant = (key) => setParticipants((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  const selectedChildren = children.filter((c) => participants.includes(c.id));
  const includesMinor = selectedChildren.length > 0;
  const participantLabel = participants.length === 0
    ? "Not selected"
    : [
      ...(participants.includes("self") ? ["You"] : []),
      ...selectedChildren.map((c) => c.name || "Unnamed profile"),
    ].join(", ");

  const fee = Math.round(draft.pkg.price * CONFIG.serviceFeeRate * 100) / 100;
  const total = draft.pkg.price + fee;
  const guardianDetailsComplete = guardianName.trim() && guardianRelationship.trim() && emergencyName.trim() && emergencyPhone.trim();
  const canContinue = participants.length > 0 && (!includesMinor || (consent && guardianDetailsComplete));

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Review booking" onBack={() => nav("booking-datetime", { coachId: draft.coach.id, packageId: draft.pkg.id })} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Coach" value={draft.coach.name} />
          <Row label="Service" value={draft.pkg.name} />
          <Row label="When" value={`${draft.day} at ${draft.time}`} />
          <Row label="Location" value={draft.mode} />
          <Row label="For" value={participantLabel} last />
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, marginBottom: 4, ...fBody }}>Who is this session for?</div>
          <div style={{ fontSize: 12, color: C.slate, marginBottom: 12, lineHeight: 1.5, ...fBody }}>Select yourself, one child, or several — each participant keeps their own booking history.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Chip active={participants.includes("self")} icon={User} onClick={() => toggleParticipant("self")}>Myself</Chip>
            {children.map((c) => (
              <Chip key={c.id} active={participants.includes(c.id)} icon={Users} onClick={() => toggleParticipant(c.id)}>{c.name || "Unnamed profile"}</Chip>
            ))}
          </div>
          {children.length === 0 && (
            <button onClick={() => nav("client-profile")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", marginTop: 12, padding: 0 }}>
              <UserPlus size={13} color={C.orange} />
              <span style={{ fontSize: 12, color: C.orange, fontWeight: 600, ...fBody }}>Add a child profile from Account to book for them</span>
            </button>
          )}
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, marginBottom: 6, ...fDisplay }}>Cancellation policy</div>
          <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.55, ...fBody }}>{draft.coach.cancellationPolicy}</div>
        </Card>

        {includesMinor && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12 }}>
              <ShieldCheck size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>Child safety details</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2, lineHeight: 1.55, ...fBody }}>
                  This booking includes a participant under 18, so we collect a few extra details to keep sessions safe. {draft.coach.name.split(" ")[0]} holds the required Working with Children Check, and this information is shared with them only as needed for the session.
                </div>
              </div>
            </div>

            {selectedChildren.map((c) => (
              <div key={c.id} style={{ background: C.fog, borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>
                <Row label="Participant" value={c.name || "Unnamed profile"} />
                <Row label="Age" value={c.age || "Not set"} last />
              </div>
            ))}

            <div style={{ marginTop: 4 }}>
              <SectionLabel>Guardian details</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Field label="Guardian full name" placeholder="Jamie Chen" icon={User} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
                <Field label="Relationship to participant" placeholder="Parent" value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <SectionLabel>Emergency contact</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Field label="Emergency contact name" placeholder="Alex Chen" icon={User} value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                <Field label="Emergency contact phone" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <SectionLabel>Relevant medical conditions or allergies</SectionLabel>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
                <Stethoscope size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
                <textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. asthma (carries inhaler), peanut allergy — leave blank if none"
                  rows={2}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, resize: "none", ...fBody }}
                />
              </div>
            </div>

            <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10, background: C.warnTint, borderRadius: 12, padding: 10 }}>
                <AlertTriangle size={14} color="#B8860B" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11.5, color: C.jet, lineHeight: 1.5, ...fBody }}>Safeguarding: sessions involving minors require a checked-in guardian or approved drop-off arrangement, and any concerns can be reported to CoachLink support at any time.</span>
              </div>
              <button onClick={() => setConsent(!consent)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${consent ? C.orange : C.border}`, background: consent ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {consent && <CheckCircle2 size={12} color={C.white} />}
                </div>
                <span style={{ fontSize: 12, color: C.jet, lineHeight: 1.5, ...fBody }}>I confirm I am the parent or legal guardian and consent to this booking, including CoachLink's handling of the participant's data.</span>
              </button>
            </div>
          </Card>
        )}

        <Card>
          <Row label="Session" value={`$${draft.pkg.price.toFixed(2)}`} />
          <Row label="Service fee" value={`$${fee.toFixed(2)}`} />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold last />
        </Card>
      </div>
      <div style={{ padding: "14px 0" }}>
        <Btn full disabled={!canContinue} onClick={() => { setDraft({ ...draft, total, participants: participantLabel, includesMinor, guardianName, guardianRelationship, emergencyName, emergencyPhone, conditions }); nav("payment"); }}>Continue to payment</Btn>
      </div>
    </div>
  );
}

export function ScreenPayment({ nav, draft, toast, addBooking, biometric }) {
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const busy = confirming || processing || success;

  const pay = () => {
    if (busy) return;
    if (biometric) { setConfirming(true); setTimeout(() => { setConfirming(false); processAndFinish(); }, 1100); }
    else processAndFinish();
  };
  // Simulates submitting the charge to the payment processor before we show success —
  // without this, tapping Pay looked identical whether the charge went through or not.
  const processAndFinish = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      addBooking(draft);
      toast("Payment confirmed");
      setSuccess(true);
      setTimeout(() => nav("booking-confirmation"), 700);
    }, 900);
  };
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopBar title="Payment" onBack={() => nav("booking-review")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Btn full variant="dark" disabled={busy} onClick={pay}>Pay ${draft.total.toFixed(2)} with  Pay</Btn>
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
        <Btn full loading={processing} loadingText="Processing payment…" disabled={busy && !processing} onClick={pay}>Pay & confirm booking</Btn>
      </div>

      {confirming && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 70, borderRadius: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Fingerprint size={30} color={C.white} />
          </div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 600, ...fBody }}>Confirm with Face ID</div>
        </div>
      )}

      {success && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 70, borderRadius: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, animation: "clPopIn .25s ease" }}>
            <CheckCircle2 size={30} color={C.success} />
          </div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 600, ...fBody }}>Payment confirmed</div>
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
        <Row label="When" value={`${draft.day} at ${draft.time}`} />
        <Row label="Location" value={draft.mode} />
        {draft.participants && <Row label="For" value={draft.participants} last />}
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
