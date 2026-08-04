import React, { useState } from "react";
import { MapPin, Check, Phone, Camera, ShieldCheck, Plus, X, Users, Target, CalendarDays, AlertTriangle } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { SPORTS, ALL_SUBURBS } from "../../data/mockData";
import { Chip, SectionLabel, Btn, TopBar, Field, Card, Avatar } from "../../components/ui/Primitives";

const TOTAL_STEPS = 4;
function StepDots({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{ height: 4, borderRadius: 2, flex: 1, background: i <= step ? C.success : C.border, transition: "background .25s ease" }} />
      ))}
    </div>
  );
}

function StepHeader({ step, title, subtitle, onBack }) {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      {onBack && <TopBar title="" onBack={onBack} />}
      <div style={{ marginTop: onBack ? 0 : 8 }}>
        <StepDots step={step} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.slate, ...fBody, marginBottom: 20, lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  );
}

/* Step 1 of 4 — build your profile (mobile, age, postal code, profile pic) */
function calcAge(dobStr) {
  if (!dobStr) return null;
  const birth = new Date(dobStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function ScreenAboutYouProfile({ nav }) {
  const [mobile, setMobile] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dob, setDob] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);

  const age = calcAge(dob);
  const isUnder18 = age !== null && age < 18;
  const ageVerified = age !== null && age >= 18;

  const canContinue = mobile.trim().length > 0 && postalCode.trim().length > 0 && ageVerified;
  const goNext = () => nav("about-you-participants", { mobile, postalCode, dob, age, hasPhoto });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader step={0} title="Let's learn about you" subtitle="Collecting a few essentials helps keep CoachLink safe for everyone." />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>Build your profile</SectionLabel>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <button
            onClick={() => setHasPhoto((v) => !v)}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}
          >
            {hasPhoto ? <Avatar name="Sarah Lin" size={84} /> : (
              <div style={{ width: 84, height: 84, borderRadius: 84, background: C.fog, border: `1.5px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={22} color={C.slateLight} />
              </div>
            )}
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: 28, background: C.orange, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={13} color={C.white} />
            </div>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Mobile number</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
              <Phone size={16} color={C.slateLight} />
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="04XX XXX XXX"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Postal code</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
              <MapPin size={16} color={C.slateLight} />
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 2026"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: isUnder18 ? 14 : 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Date of birth</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 14, padding: "12px 14px", border: isUnder18 ? "1.5px solid #D64545" : "1.5px solid transparent" }}>
            <CalendarDays size={16} color={C.slateLight} />
            <input
              type="date"
              value={dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDob(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }}
            />
          </div>
          <div style={{ fontSize: 11.5, color: C.slateLight, marginTop: 6, ...fBody }}>
            We verify your date of birth — a self-tick isn't enough. CoachLink accounts can only be held by someone 18 or older.
          </div>
        </div>

        {isUnder18 && (
          <Card style={{ marginBottom: 20, background: "#FDECEC", border: "1px solid #F3D2D2" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertTriangle size={16} color="#D64545" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: C.jet, lineHeight: 1.6, ...fBody }}>
                <strong>You need to be 18+ to hold a CoachLink account.</strong> If you're under 18, ask a parent or guardian to sign up — once they're set up, they can add you as a participant profile and manage your bookings for you.
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 20, background: C.fog, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6, ...fBody }}>
              <strong style={{ color: C.jet }}>Why we ask:</strong> your postal code helps us match you with coaches nearby, your date of birth confirms you're old enough to hold your own account, and your photo helps coaches recognise you at sessions. None of this is shown publicly without your permission.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={goNext} style={!canContinue ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          Continue
        </Btn>
      </div>
    </div>
  );
}

/* Step 2 of 4 — participant profiles (parents/guardians can add children) */
export function ScreenAboutYouParticipants({ nav, params }) {
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [children, setChildren] = useState([]);

  const addChild = () => setChildren((c) => [...c, { id: Date.now(), name: "", age: "" }]);
  const updateChild = (id, key, value) => setChildren((c) => c.map((ch) => (ch.id === id ? { ...ch, [key]: value } : ch)));
  const removeChild = (id) => setChildren((c) => c.filter((ch) => ch.id !== id));

  const goNext = () => nav("about-you", { ...params, bookingForSelf, children });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader step={1} title="Who are you booking for?" subtitle="Parents and guardians can keep a separate profile for each child." onBack={() => nav("about-you-profile")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>Participants</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <Chip active={bookingForSelf} onClick={() => setBookingForSelf(true)}>Just me</Chip>
          <Chip active={!bookingForSelf} onClick={() => setBookingForSelf(false)}>My child / dependent</Chip>
        </div>

        {!bookingForSelf && (
          <div>
            {children.map((child) => (
              <Card key={child.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Users size={14} color={C.orange} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.jet, ...fDisplay }}>Participant profile</span>
                  </div>
                  <button onClick={() => removeChild(child.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                    <X size={15} color={C.slateLight} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 2 }}>
                    <input
                      value={child.name}
                      onChange={(e) => updateChild(child.id, "name", e.target.value)}
                      placeholder="Child's name"
                      style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13, outline: "none", ...fBody }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      value={child.age}
                      onChange={(e) => updateChild(child.id, "age", e.target.value)}
                      placeholder="Age"
                      style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13, outline: "none", ...fBody }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <button onClick={addChild} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 14, border: `1.5px dashed ${C.border}`, background: "none", cursor: "pointer", fontSize: 13, color: C.orange, fontWeight: 600, marginBottom: 16, ...fBody }}>
              <Plus size={15} /> Add another child
            </button>
          </div>
        )}

        <Card style={{ marginBottom: 20, background: C.fog, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6, ...fBody }}>
              Keeping each child on their own participant profile means coaches see only that child's age and needs — bookings, history and messages stay separate per child.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={goNext}>Continue</Btn>
        <button
          onClick={goNext}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 10, fontSize: 12.5, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* Step 3 of 4 — address (skippable) */
export function ScreenAboutYouLocation({ nav, params }) {
  const [address, setAddress] = useState(params?.address || "");

  const suggestions = address.trim()
    ? ALL_SUBURBS.filter((l) => l.toLowerCase().includes(address.trim().toLowerCase()))
    : ALL_SUBURBS;

  const canContinue = address.trim().length > 0;

  const goToSports = (addr) => nav("about-you-sports", { ...params, address: addr });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader step={2} title="Let's learn about you" subtitle="This helps us match you with the right coaches nearby." onBack={() => nav("about-you-participants", params)} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>What's your address?</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
          <MapPin size={16} color={C.slateLight} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }}
          />
        </div>

        <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 12.5, color: C.slateLight, ...fBody }}>
              No matching suburbs.
            </div>
          ) : (
            suggestions.map((loc, i) => (
              <button
                key={loc}
                onClick={() => setAddress(loc)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", background: address === loc ? C.orangeTint : C.white, border: "none",
                  borderBottom: i === suggestions.length - 1 ? "none" : `1px solid ${C.border}`,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.jet, ...fBody }}>
                  <MapPin size={14} color={address === loc ? C.orange : C.slateLight} /> {loc}
                </span>
                {address === loc && <Check size={16} color={C.orange} />}
              </button>
            ))
          )}
        </div>

        <Card style={{ marginBottom: 20, background: C.fog, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6, ...fBody }}>
              We only use your address to find coaches nearby and calculate distance — your exact address is never shown to coaches or other clients.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={() => goToSports(address)} style={!canContinue ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          Continue
        </Btn>
        <button
          onClick={() => goToSports("")}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 10, fontSize: 12.5, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* Step 4 of 4 — sports & coaching goals (skippable) */
export function ScreenAboutYouSports({ nav, params, onComplete }) {
  const address = params?.address || "";
  const [sports, setSports] = useState([]);
  const [goals, setGoals] = useState("");

  const toggleSport = (s) => setSports((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]);

  const canContinue = sports.length > 0;

  const finish = (selectedSports) => {
    const prefs = { ...params, address, sports: selectedSports, goals };
    if (onComplete) onComplete(prefs);
    nav("client-home");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader step={3} title="Let's learn about you" subtitle="This helps us match you with the right coaches nearby." onBack={() => nav("about-you", params)} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>What sports are you into?</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {SPORTS.map((s) => (
            <Chip key={s} active={sports.includes(s)} onClick={() => toggleSport(s)}>{s}</Chip>
          ))}
        </div>

        <SectionLabel>What are your coaching goals?</SectionLabel>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px", marginBottom: 20 }}>
          <Target size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. build confidence for club trials, improve fitness, learn the basics..."
            rows={3}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, resize: "none", ...fBody }}
          />
        </div>

        <Card style={{ marginBottom: 20, background: C.fog, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={16} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6, ...fBody }}>
              Sharing your goals helps coaches tailor sessions before you even book — you can update or remove this anytime from Account Settings.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={() => finish(sports)} style={!canContinue ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          Continue
        </Btn>
        <button
          onClick={() => finish([])}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 10, fontSize: 12.5, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
