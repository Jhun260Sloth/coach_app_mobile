import React, { useState } from "react";
import {
  MapPin, Phone, Camera, ShieldCheck, Plus, Users, User, CalendarDays,
  AlertTriangle, LocateFixed, Search, Stethoscope, UserCheck,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { AU_SUBURBS, GENDER_OPTIONS } from "../../data/mockData";
import { Chip, SectionLabel, Btn, TopBar, Field, Card, Avatar, Badge } from "../../components/ui/Primitives";

const TOTAL_STEPS = 1;
function StepDots({ step }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{ height: 4, borderRadius: 2, flex: 1, background: i <= step ? C.success : C.border, transition: "background .25s ease" }} />
      ))}
    </div>
  );
}

function StepHeader({ step, title, subtitle, onBack }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ padding: "20px 20px 0" }}>
      {onBack && <TopBar title="" onBack={onBack} />}
      <div style={{ marginTop: onBack ? 0 : 8 }}>
        <StepDots step={step} />
      </div>
      <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: T.body, color: C.slate, ...fBody, marginBottom: 20, lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  );
}

/* Step 1 of 3 — build your profile (mobile, age, postal code, profile pic) */
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
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [mobile, setMobile] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dob, setDob] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);

  const age = calcAge(dob);
  const isUnder18 = age !== null && age < 18;
  const ageVerified = age !== null && age >= 18;

  // Continue stays disabled — and the user can't advance — until the date of
  // birth entered confirms they're 18 or older.
  const canContinue = mobile.trim().length > 0 && postalCode.trim().length > 0 && ageVerified;
  // The "who are you booking for?" step has been removed from the flow —
  // finishing this step takes the client straight to the setup success screen.
  const goNext = () => { if (canContinue) nav("client-setup-complete", { mobile, postalCode, dob, age, hasPhoto }); };

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
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: 28, background: C.brand, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={13} color={C.white} />
            </div>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Mobile number</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
              <Phone size={16} color={C.slateLight} />
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="04XX XXX XXX"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Postal code</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
              <MapPin size={16} color={C.slateLight} />
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 2026"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: isUnder18 ? 14 : 20 }}>
          <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Date of birth</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 14, padding: "12px 14px", border: isUnder18 ? `1.5px solid ${C.danger}` : "1.5px solid transparent" }}>
            <CalendarDays size={16} color={C.slateLight} />
            <input
              type="date"
              value={dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDob(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }}
            />
          </div>
          <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 6, ...fBody }}>
            We verify your date of birth — a self-tick isn't enough. CoachLink accounts can only be held by someone 18 or older.
          </div>
        </div>

        {isUnder18 && (
          <Card style={{ marginBottom: 20, background: C.dangerTint, border: `1px solid ${C.dangerBorder}` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertTriangle size={16} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: T.label, color: C.jet, lineHeight: 1.6, ...fBody }}>
                <strong>You need to be 18+ to hold a CoachLink account.</strong> If you're under 18, ask a parent or guardian to sign up — once they're set up, they can add you as a participant profile and manage your bookings for you.
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 20, background: C.fog, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={16} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: T.label, color: C.slate, lineHeight: 1.6, ...fBody }}>
              <strong style={{ color: C.jet }}>Why we ask:</strong> your postal code helps us match you with coaches nearby, your date of birth confirms you're old enough to hold your own account, and your photo helps coaches recognise you at sessions. None of this is shown publicly without your permission.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full disabled={!canContinue} onClick={goNext}>
          Continue
        </Btn>
      </div>
    </div>
  );
}

/* Step 2 of 3 — account type: who is this booking for? */
export function ScreenAccountType({ nav, params }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [accountType, setAccountType] = useState(null); // "self" | "child"

  const goNext = () => {
    if (accountType === "child") nav("about-you-participants", { ...params });
    else if (accountType === "self") nav("about-you-self", { ...params });
  };

  const Option = ({ value, icon: Icon, title, body }) => {
    const active = accountType === value;
    return (
      <button
        onClick={() => setAccountType(value)}
        style={{ width: "100%", textAlign: "left", background: active ? C.brandTint : C.white, border: `1.5px solid ${active ? C.brand : C.border}`, borderRadius: 18, padding: 16, display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 13, background: active ? C.brand : C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={active ? C.white : C.slate} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: C.jet, fontSize: T.subtitleLg, marginBottom: 3, ...fDisplay }}>{title}</div>
          <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{body}</div>
        </div>
        <div style={{ width: 20, height: 20, borderRadius: 99, border: `1.5px solid ${active ? C.brand : C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          {active && <div style={{ width: 10, height: 10, borderRadius: 99, background: C.brand }} />}
        </div>
      </button>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader step={1} title="Who are you booking for?" subtitle="Parents and guardians can keep a separate profile for each child." onBack={() => nav("about-you-profile")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>Participants</SectionLabel>
        <Option value="self" icon={User} title="Myself" body="I'll be the one attending coaching sessions." />
        <Option value="child" icon={Users} title="My Child / Children" body="I'm booking sessions on behalf of one or more children." />

        <Card style={{ marginTop: 8, marginBottom: 20, background: C.fog, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <ShieldCheck size={16} color={C.brand} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: T.label, color: C.slate, lineHeight: 1.6, ...fBody }}>
              Keeping each child on their own participant profile means coaches see only that child's age and needs — bookings, history and messages stay separate per child.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full disabled={!accountType} onClick={goNext}>Continue</Btn>
      </div>
    </div>
  );
}

/* Shared field set used by both the participant (child) setup flow and the
   "tell us about yourself" individual setup flow. */
const PARTICIPANT_SPORT_EXAMPLES = ["Football", "Basketball", "Tennis", "Swimming", "Gymnastics"];
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];
export const emptyParticipantDraft = {
  name: "", dob: "", gender: "", postalCode: "",
  sport: [], skillLevel: "", goals: "",
  medicalConditions: "", allergies: "", medicalNotes: "",
  emergencyName: "", emergencyRelationship: "", emergencyMobile: "",
  guardianName: "", guardianRelationship: "", guardianMobile: "",
};

// showGuardianInfo renders the Guardian information block — only relevant when
// this field set is being used to create/edit a CHILD's participant profile,
// since an adult booking for themselves doesn't need a guardian on file.
export function ParticipantFields({ draft, setDraft, showGuardianInfo = false }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const inputStyle = {
    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
    fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", ...fBody,
  };
  const labelStyle = { fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody };
  const [addingSport, setAddingSport] = useState(false);
  const [customSport, setCustomSport] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));
  const age = calcAge(draft.dob);
  const toggleSport = (s) => patch({ sport: draft.sport.includes(s) ? draft.sport.filter((x) => x !== s) : [...draft.sport, s] });
  const extraSports = draft.sport.filter((s) => !PARTICIPANT_SPORT_EXAMPLES.includes(s));

  const addCustomSport = () => {
    const trimmed = customSport.trim();
    if (!trimmed) return;
    if (!draft.sport.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      patch({ sport: [...draft.sport, trimmed] });
    }
    setCustomSport("");
  };

  const filteredSuburbs = AU_SUBURBS.filter((s) =>
    locationQuery.length > 0 && (s.suburb.toLowerCase().includes(locationQuery.toLowerCase()) || s.postcode.includes(locationQuery))
  ).slice(0, 6);
  const pickLocation = (s) => { patch({ postalCode: `${s.suburb}, ${s.state} ${s.postcode}` }); setLocationQuery(""); setLocationOpen(false); };
  const useCurrentLocation = () => patch({ postalCode: "Sydney, NSW 2000" });

  return (
    <>
      <SectionLabel>Basic information</SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <Field label="Participant name" placeholder="e.g. Ava Chen" icon={Users} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />

        <div>
          <div style={labelStyle}>Date of birth</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
            <CalendarDays size={16} color={C.slateLight} />
            <input
              type="date"
              value={draft.dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => patch({ dob: e.target.value })}
              style={{ flex: 1, border: "none", outline: "none", fontSize: T.bodyLg, color: C.jet, ...fBody }}
            />
          </div>
        </div>

        <div>
          <div style={labelStyle}>Age</div>
          <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", background: C.fog }}>
            <span style={{ fontSize: T.bodyLg, color: age !== null ? C.jet : C.slateLight, ...fBody }}>
              {age !== null ? `${age} years old` : "Auto-calculated from date of birth"}
            </span>
          </div>
        </div>

        <div>
          <div style={labelStyle}>Gender (optional)</div>
          <select
            value={draft.gender}
            onChange={(e) => patch({ gender: e.target.value })}
            style={{ ...inputStyle, appearance: "auto", background: C.white, color: draft.gender ? C.jet : C.slateLight }}
          >
            <option value="">Prefer not to say</option>
            {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{ position: "relative" }}>
          <div style={labelStyle}>Location / postcode</div>
          {draft.postalCode ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <MapPin size={16} color={C.brand} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: T.bodyLg, color: C.jet, fontWeight: 500, ...fBody }}>{draft.postalCode}</span>
              <button onClick={() => patch({ postalCode: "" })} style={{ background: "none", border: "none", color: C.brand, fontSize: T.label, fontWeight: 600, cursor: "pointer", ...fBody }}>Change</button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
                <Search size={15} color={C.slateLight} />
                <input
                  value={locationQuery}
                  onChange={(e) => { setLocationQuery(e.target.value); setLocationOpen(true); }}
                  onFocus={() => setLocationOpen(true)}
                  onBlur={() => setTimeout(() => setLocationOpen(false), 150)}
                  placeholder="Search suburb or postcode…"
                  style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }}
                />
              </div>
              {locationOpen && filteredSuburbs.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto" }}>
                  {filteredSuburbs.map((s) => (
                    <button key={`${s.suburb}-${s.postcode}`} onMouseDown={(e) => e.preventDefault()} onClick={() => pickLocation(s)} style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: T.body, color: C.jet, ...fBody }}>
                      <span>{s.suburb}, {s.state}</span>
                      <span style={{ color: C.slateLight }}>{s.postcode}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={useCurrentLocation} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.brand, fontSize: T.labelLg, fontWeight: 600, marginTop: 8, padding: 0, ...fBody }}>
                <LocateFixed size={14} /> Use current location
              </button>
            </>
          )}
        </div>
      </div>

      {showGuardianInfo && (
        <>
          <SectionLabel>Guardian information</SectionLabel>
          <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: -6, marginBottom: 12, lineHeight: 1.5, ...fBody }}>
            The parent or legal guardian responsible for this participant. This is who coaches and CoachLink will contact about the booking.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <Field label="Guardian name" placeholder="e.g. Jamie Chen" icon={UserCheck} value={draft.guardianName} onChange={(e) => patch({ guardianName: e.target.value })} />
            <Field label="Relationship to participant" placeholder="e.g. Parent" value={draft.guardianRelationship} onChange={(e) => patch({ guardianRelationship: e.target.value })} />
            <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={draft.guardianMobile} onChange={(e) => patch({ guardianMobile: e.target.value.replace(/[^0-9+\s]/g, "") })} />
          </div>
        </>
      )}

      <SectionLabel>Sport interests</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: extraSports.length ? 10 : 8 }}>
        {PARTICIPANT_SPORT_EXAMPLES.map((s) => (
          <Chip key={s} active={draft.sport.includes(s)} onClick={() => toggleSport(s)}>{s}</Chip>
        ))}
      </div>
      {extraSports.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {extraSports.map((s) => (
            <Chip key={s} active onClick={() => toggleSport(s)}>{s}</Chip>
          ))}
        </div>
      )}
      {addingSport ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            value={customSport}
            onChange={(e) => setCustomSport(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSport(); } }}
            placeholder="Type a sport…"
            autoFocus
            style={{ ...inputStyle, flex: 1 }}
          />
          <Btn size="sm" onClick={addCustomSport}>Add</Btn>
        </div>
      ) : (
        <button onClick={() => setAddingSport(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.brand, fontSize: T.labelLg, fontWeight: 600, marginBottom: 20, padding: 0, ...fBody }}>
          <Plus size={14} /> Add another sport
        </button>
      )}

      <SectionLabel>Skill level</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {SKILL_LEVELS.map((lvl) => (
          <Chip key={lvl} active={draft.skillLevel === lvl} onClick={() => patch({ skillLevel: lvl })}>{lvl}</Chip>
        ))}
      </div>

      <SectionLabel>Coaching goals</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <textarea
          value={draft.goals}
          onChange={(e) => patch({ goals: e.target.value })}
          placeholder="e.g. build confidence for club trials, improve fitness, learn the basics…"
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>

      <SectionLabel>Medical information (optional)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <Field label="Medical conditions" placeholder="e.g. asthma" icon={Stethoscope} value={draft.medicalConditions} onChange={(e) => patch({ medicalConditions: e.target.value })} />
        <Field label="Allergies" placeholder="e.g. bee stings, peanuts" icon={AlertTriangle} value={draft.allergies} onChange={(e) => patch({ allergies: e.target.value })} />
        <div>
          <div style={labelStyle}>Additional notes</div>
          <textarea
            value={draft.medicalNotes}
            onChange={(e) => patch({ medicalNotes: e.target.value })}
            placeholder="Anything else a coach should know"
            rows={2}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>
      </div>

      <SectionLabel>Emergency contact (optional)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
        <Field label="Contact name" placeholder="e.g. Mia Chen" icon={UserCheck} value={draft.emergencyName} onChange={(e) => patch({ emergencyName: e.target.value })} />
        <Field label="Relationship" placeholder="e.g. Mother" value={draft.emergencyRelationship} onChange={(e) => patch({ emergencyRelationship: e.target.value })} />
        <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} value={draft.emergencyMobile} onChange={(e) => patch({ emergencyMobile: e.target.value.replace(/[^0-9+\s]/g, "") })} />
      </div>
    </>
  );
}

/* Step 3 of 3 (child path) — add one or more participant profiles. Each save
   persists immediately via addChild; there is no limit on how many can be added. */
export function ScreenAboutYouParticipants({ nav, params, addChild, toast }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [draft, setDraft] = useState(emptyParticipantDraft);
  const [savedCount, setSavedCount] = useState(0);

  const canSave = draft.name.trim().length > 0 && !!draft.dob
    && draft.guardianName.trim().length > 0 && draft.guardianRelationship.trim().length > 0 && draft.guardianMobile.trim().length > 0;

  const persist = () => {
    const age = calcAge(draft.dob);
    addChild({ ...draft, age: age !== null ? age : "" });
    setSavedCount((n) => n + 1);
  };

  const saveAndFinish = () => {
    if (!canSave) return;
    persist();
    nav("client-setup-complete");
  };

  const saveAndAddAnother = () => {
    if (!canSave) return;
    const name = draft.name.trim();
    persist();
    setDraft(emptyParticipantDraft);
    if (toast) toast(`${name}'s profile saved — add the next participant below`);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader
        step={2}
        title="Add a participant"
        subtitle="Create a profile for each child you would like to book coaching sessions for. You can add and manage multiple participant profiles at any time."
        onBack={() => nav("account-type", params)}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        {savedCount > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Badge tone="success">{savedCount} participant{savedCount === 1 ? "" : "s"} added so far</Badge>
          </div>
        )}
        <ParticipantFields draft={draft} setDraft={setDraft} showGuardianInfo />
      </div>
      <div style={{ padding: "14px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn full disabled={!canSave} onClick={saveAndFinish}>Save participant</Btn>
        <Btn full variant="outline" icon={Plus} disabled={!canSave} onClick={saveAndAddAnother}>Add another participant</Btn>
      </div>
    </div>
  );
}

/* Step 3 of 3 (self path) — same field set as the participant flow, for the
   account holder's own profile. */
export function ScreenAboutYouSelf({ nav, params, onComplete }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [draft, setDraft] = useState(emptyParticipantDraft);
  const canContinue = draft.name.trim().length > 0 && !!draft.dob;

  const finish = () => {
    if (!canContinue) return;
    const age = calcAge(draft.dob);
    const prefs = { ...params, ...draft, age: age !== null ? age : "" };
    if (onComplete) onComplete(prefs);
    nav("client-setup-complete", { name: draft.name });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StepHeader
        step={2}
        title="Tell us about yourself"
        subtitle="Help us recommend suitable coaches and personalise your coaching experience."
        onBack={() => nav("account-type", params)}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <ParticipantFields draft={draft} setDraft={setDraft} />
      </div>
      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full disabled={!canContinue} onClick={finish}>Continue</Btn>
      </div>
    </div>
  );
}
