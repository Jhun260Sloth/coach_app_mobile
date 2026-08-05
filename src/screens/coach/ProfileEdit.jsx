import React, { useState } from "react";
import {
  Camera, Plus, Edit3, Trash2, Eye, ChevronRight, CreditCard, Fingerprint, Lock,
  FileText, HelpCircle, LogOut, AlertTriangle, User, Landmark, Hash, EyeOff, Search, MapPin, LocateFixed,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, LANGUAGE_OPTIONS, GENDER_OPTIONS, AU_SUBURBS } from "../../data/mockData";
import {
  Avatar, SectionLabel, Card, Toggle, Btn, Badge, BottomSheet, Field, RadioRow, SearchMultiSelect,
} from "../../components/ui/Primitives";
import { ServicePackageForm, packageSummary } from "../../components/ui/ServicePackageForm";

let pkgIdCounter = 1;

const inputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
  fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody,
};
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody };

function SelectField({ label, value, onChange, options, placeholder = "Select…" }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, appearance: "auto", background: C.white, color: value ? C.jet : C.slateLight }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const EXPERIENCE_OPTIONS = [...Array.from({ length: 29 }, (_, i) => `${i + 1} year${i === 0 ? "" : "s"}`), "30+ years"];

// Compact read-only rendering of the profile fields, used both for the
// collapsed (view) state and as the live inline preview while editing.
function ProfilePreviewCard({ avatar, displayName, bio, yearsExperience, languages, location }) {
  const locationLabel = location ? `${location.suburb}, ${location.state}` : "Your location";
  return (
    <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 16, padding: 14, background: C.fog }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {avatar ? (
          <img src={avatar} alt="Profile" style={{ width: 48, height: 48, borderRadius: 48, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <Avatar name={displayName || "Coach"} size={48} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.jet, ...fDisplay }}>{displayName || "Your name"}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 1, ...fBody }}>
            {locationLabel}{yearsExperience ? ` · ${yearsExperience} coaching` : ""}
          </div>
        </div>
      </div>
      {bio && (
        <div style={{ fontSize: 12.5, color: C.slate, marginTop: 10, lineHeight: 1.5, ...fBody }}>{bio}</div>
      )}
      {languages.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {languages.map((l) => (
            <span key={l} style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 500, background: C.orangeTint, color: C.orange, ...fBody }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// Map the coach's seed packages (from mockData) into the richer service shape
// used by the Service Packages section, so existing packages render consistently.
function seedPackages(coach) {
  const groupMaxMatch = (name) => {
    const m = /max\s*(\d+)/i.exec(name);
    return m ? m[1] : "";
  };
  return coach.packages.map((p) => ({
    id: p.id,
    name: p.name,
    packageType: p.type === "1:1" ? "1:1 Coaching" : p.type === "Group" ? "Group Training" : "Skills Clinic",
    sport: coach.sport,
    description: "",
    sessionDuration: p.duration,
    sessionDurationCustom: "",
    useCustomDuration: false,
    price: p.price,
    maxParticipants: p.type === "Group" ? (groupMaxMatch(p.name) || "4") : "1",
    deliveryMode: p.mode === "Virtual" ? "Online" : "In-person",
    venue: p.mode === "Virtual" ? "" : coach.suburb,
    equipment: "",
    enabled: true,
  }));
}

export function ScreenCoachProfileEdit({ nav, toast, biometric, setBiometric }) {
  const coach = COACHES[1];

  /* ---------------------------- Profile Information ---------------------------- */
  const [profileEditing, setProfileEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [displayName, setDisplayName] = useState(coach.name);
  const [bio, setBio] = useState(coach.bio || "");
  const initialExperience = (() => {
    const m = /^(\d+)/.exec(coach.experience || "");
    if (!m) return "";
    const n = parseInt(m[1], 10);
    return n >= 30 ? "30+ years" : `${n} year${n === 1 ? "" : "s"}`;
  })();
  const [yearsExperience, setYearsExperience] = useState(initialExperience);
  const [gender, setGender] = useState("");
  const [languages, setLanguages] = useState(["English"]);
  const initialLocation = (() => {
    const suburbName = (coach.suburb || "").split(",")[0].trim();
    return AU_SUBURBS.find((s) => s.suburb === suburbName) || null;
  })();
  const [location, setLocation] = useState(initialLocation);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  const avatarInputRef = React.useRef(null);
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
    e.target.value = "";
  };

  const filteredSuburbs = AU_SUBURBS.filter((s) =>
    locationQuery.length > 0 && (
      s.suburb.toLowerCase().includes(locationQuery.toLowerCase()) ||
      s.postcode.includes(locationQuery)
    )
  ).slice(0, 6);
  const pickLocation = (s) => { setLocation(s); setLocationQuery(""); setLocationOpen(false); };
  const useCurrentLocation = () => {
    setLocation({ suburb: "Sydney", state: "NSW", postcode: "2000" });
    toast("Location detected");
  };

  const saveProfile = () => { setProfileEditing(false); toast("Profile changes saved"); };

  /* ------------------------------ Service Packages ------------------------------ */
  const [instantBook, setInstantBook] = useState(coach.instantBook);
  const [packages, setPackages] = useState(() => seedPackages(coach));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editingPkg = editingId ? packages.find((p) => p.id === editingId) : null;

  const openAdd = () => { setEditingId(null); setSheetOpen(true); };
  const openEdit = (id) => { setEditingId(id); setSheetOpen(true); };
  const closeSheet = () => { setSheetOpen(false); setEditingId(null); };

  const savePackage = (pkg) => {
    if (editingId) {
      setPackages((arr) => arr.map((p) => (p.id === editingId ? { ...pkg, id: editingId, enabled: p.enabled } : p)));
      toast("Package updated");
    } else {
      setPackages((arr) => [...arr, { ...pkg, id: "pkg" + pkgIdCounter++, enabled: true }]);
      toast("Package added");
    }
    closeSheet();
  };
  const removePackage = (id) => { setPackages((arr) => arr.filter((p) => p.id !== id)); toast("Package removed"); };
  const togglePackageEnabled = (id) => setPackages((arr) => arr.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));

  /* -------------------------------- Payment method ------------------------------- */
  const [paySheet, setPaySheet] = useState(false);
  const [accountHolder, setAccountHolder] = useState("Josh Whitfield");
  const [bankName, setBankName] = useState("Commonwealth Bank");
  const [accountNumber, setAccountNumber] = useState("12345678");
  const [routingNumber, setRoutingNumber] = useState("062000");
  const [taxInfo, setTaxInfo] = useState("");
  const savePayment = () => { setPaySheet(false); toast("Payment details saved"); };

  /* --------------------------- Notification preferences -------------------------- */
  const [notifPrefs, setNotifPrefs] = useState({
    bookingRequests: true, bookingConfirmations: true, messages: true, paymentUpdates: true,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  /* -------------------------------------- Security -------------------------------------- */
  const [pwSheet, setPwSheet] = useState(false);
  const [showPw, setShowPw] = useState(false);

  /* --------------------------------- Privacy & support --------------------------------- */
  const [privacySheet, setPrivacySheet] = useState(false);

  /* -------------------------------- Account management -------------------------------- */
  const [deleteSheet, setDeleteSheet] = useState(false);
  const [signOutSheet, setSignOutSheet] = useState(false);

  const Row2 = ({ icon: Icon, label, sub, onClick, right, danger }) => (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
      <Icon size={17} color={danger ? "#D64545" : C.jet} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: danger ? "#D64545" : C.jet, fontWeight: 500, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{sub}</div>}
      </div>
      {right || <ChevronRight size={16} color={C.slateLight} />}
    </button>
  );

  const NotifRow = ({ label, sub, prefKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>{sub}</div>}
      </div>
      <Toggle on={notifPrefs[prefKey]} onClick={() => toggleNotif(prefKey)} />
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 18, ...fDisplay }}>My profile</div>

        {/* =========================== 1. Profile Information =========================== */}
        <SectionLabel>Profile Information</SectionLabel>
        <Card style={{ marginBottom: 22 }}>
          {!profileEditing ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <ProfilePreviewCard
                  avatar={avatar}
                  displayName={displayName}
                  bio={bio}
                  yearsExperience={yearsExperience}
                  languages={languages}
                  location={location}
                />
              </div>
              <Btn variant="outline" size="sm" icon={Edit3} full onClick={() => setProfileEditing(true)}>Edit Profile</Btn>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  {avatar ? (
                    <img src={avatar} alt="Profile" style={{ width: 72, height: 72, borderRadius: 72, objectFit: "cover", display: "block" }} />
                  ) : (
                    <Avatar name={displayName} size={72} />
                  )}
                  <button onClick={() => avatarInputRef.current?.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: 99, background: C.orange, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Camera size={12} color={C.white} />
                  </button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarChange} style={{ display: "none" }} />
                <div style={{ fontSize: 11, color: C.slateLight, marginTop: 8, ...fBody }}>Tap the camera icon to update your profile photo</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <div>
                  <div style={labelStyle}>Display name</div>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
                </div>

                <div>
                  <div style={labelStyle}>Bio</div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell athletes about your coaching background, philosophy and what they can expect from your sessions"
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>

                <SelectField label="Years of coaching experience" value={yearsExperience} onChange={setYearsExperience} options={EXPERIENCE_OPTIONS} placeholder="Select years of experience" />

                <SelectField label="Gender (optional)" value={gender} onChange={setGender} options={GENDER_OPTIONS} placeholder="Prefer not to say" />

                <div>
                  <div style={labelStyle}>Languages spoken</div>
                  <SearchMultiSelect options={LANGUAGE_OPTIONS} value={languages} onChange={setLanguages} placeholder="Search languages…" />
                </div>

                <div>
                  <div style={labelStyle}>Current location</div>
                  {location ? (
                    <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10 }}>
                      <MapPin size={16} color={C.orange} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{location.suburb}, {location.state}</div>
                        <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>Postcode {location.postcode}</div>
                      </div>
                      <button onClick={() => setLocation(null)} style={{ background: "none", border: "none", color: C.orange, fontSize: 12, fontWeight: 600, cursor: "pointer", ...fBody }}>Change</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: "relative" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
                          <Search size={15} color={C.slateLight} />
                          <input
                            value={locationQuery}
                            onChange={(e) => { setLocationQuery(e.target.value); setLocationOpen(true); }}
                            onFocus={() => setLocationOpen(true)}
                            onBlur={() => setTimeout(() => setLocationOpen(false), 150)}
                            placeholder="Search suburb, city or postcode…"
                            style={{ border: "none", outline: "none", flex: 1, fontSize: 13.5, minWidth: 0, ...fBody }}
                          />
                        </div>
                        {locationOpen && filteredSuburbs.length > 0 && (
                          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto" }}>
                            {filteredSuburbs.map((s) => (
                              <button
                                key={`${s.suburb}-${s.postcode}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => pickLocation(s)}
                                style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.jet, ...fBody }}
                              >
                                <span>{s.suburb}, {s.state}</span>
                                <span style={{ color: C.slateLight }}>{s.postcode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={useCurrentLocation} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.orange, fontSize: 12.5, fontWeight: 600, marginTop: 8, padding: 0, ...fBody }}>
                        <LocateFixed size={14} /> Use current location
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <SectionLabel>Preview</SectionLabel>
                <ProfilePreviewCard
                  avatar={avatar}
                  displayName={displayName}
                  bio={bio}
                  yearsExperience={yearsExperience}
                  languages={languages}
                  location={location}
                />
                <div style={{ fontSize: 11, color: C.slateLight, marginTop: 6, ...fBody }}>
                  This is how your profile will look to athletes. Nothing is published until you tap Save Changes.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="outline" full onClick={() => setProfileEditing(false)}>Cancel</Btn>
                <Btn full onClick={saveProfile}>Save Changes</Btn>
              </div>
            </>
          )}
        </Card>

        {/* ============================== 2. Service Packages ============================== */}
        <SectionLabel>Service Packages</SectionLabel>
        {packages.map((p) => (
          <Card key={p.id} style={{ marginBottom: 10, opacity: p.enabled ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{p.name}</div>
                  <Badge tone={p.enabled ? "success" : "neutral"}>{p.enabled ? "Active" : "Paused"}</Badge>
                </div>
                <div style={{ fontSize: 11.5, color: C.slate, marginTop: 4, ...fBody }}>{packageSummary(p)}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge tone="orange">{instantBook ? "Instant Book" : "Request to Book"}</Badge>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 8 }}>
                <button onClick={() => openEdit(p.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <Edit3 size={15} color={C.slateLight} />
                </button>
                <button onClick={() => removePackage(p.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <Trash2 size={15} color={C.slateLight} />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.slate, ...fBody }}>{p.enabled ? "Bookable by athletes" : "Hidden from athletes"}</span>
              <Toggle on={p.enabled} onClick={() => togglePackageEnabled(p.id)} />
            </div>
          </Card>
        ))}
        <Btn variant="outline" size="sm" icon={Plus} full onClick={openAdd}>Add service package</Btn>

        {/* ================================ 3. Payment method ================================ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Payment Method</SectionLabel>
          <Row2
            icon={CreditCard}
            label={bankName}
            sub={`Account ending ${accountNumber.slice(-4)}`}
            onClick={() => setPaySheet(true)}
          />
        </div>

        {/* ========================= 4. Notification Preferences ========================= */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Notification Preferences</SectionLabel>
          <Card>
            <NotifRow label="Booking requests" sub="New booking requests from athletes" prefKey="bookingRequests" />
            <NotifRow label="Booking confirmations" sub="When a booking is confirmed" prefKey="bookingConfirmations" />
            <NotifRow label="Messages" sub="New messages from athletes" prefKey="messages" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>Payment updates</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>Payouts and transaction updates</div>
              </div>
              <Toggle on={notifPrefs.paymentUpdates} onClick={() => toggleNotif("paymentUpdates")} />
            </div>
          </Card>
        </div>

        {/* ============================ 5. Booking Preferences ============================ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Booking Preferences</SectionLabel>
          <Card>
            <div style={{ fontSize: 12, color: C.slate, marginBottom: 8, ...fBody }}>Choose how athletes book your services.</div>
            <RadioRow
              label="Instant Book"
              sublabel="Requests are auto-confirmed"
              selected={instantBook}
              onClick={() => setInstantBook(true)}
            />
            <RadioRow
              label="Request to Book"
              sublabel="Coach approval required for every booking"
              selected={!instantBook}
              onClick={() => setInstantBook(false)}
            />
          </Card>
        </div>

        {/* ===================================== Security ===================================== */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Security</SectionLabel>
          <Row2 icon={Fingerprint} label="Biometric login" right={<Toggle on={biometric} onClick={() => setBiometric((v) => !v)} />} />
          <Row2 icon={Lock} label="Change password" onClick={() => setPwSheet(true)} />
        </div>

        {/* =============================== Privacy & Support =============================== */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Privacy & Support</SectionLabel>
          <Row2 icon={FileText} label="Privacy Policy" onClick={() => setPrivacySheet(true)} />
          <Row2 icon={HelpCircle} label="Support Centre" onClick={() => nav("support")} />
        </div>

        {/* ================================ Account Management ================================ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Account Management</SectionLabel>
          <Row2 icon={LogOut} label="Sign Out" onClick={() => setSignOutSheet(true)} />
          <Row2 icon={Trash2} label="Delete Account" onClick={() => setDeleteSheet(true)} danger />
        </div>
      </div>

      {/* Add / edit service package */}
      <BottomSheet open={sheetOpen} onClose={closeSheet} title={editingId ? "Edit service package" : "Add service package"} heightPct={88}>
        <ServicePackageForm
          key={editingId || "new"}
          initial={editingPkg}
          onSave={savePackage}
          onCancel={closeSheet}
          saveLabel={editingId ? "Save changes" : "Add package"}
        />
      </BottomSheet>

      {/* Payment method */}
      <BottomSheet open={paySheet} onClose={() => setPaySheet(false)} title="Payment method" heightPct={80}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={labelStyle}>Account holder name</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <User size={16} color={C.slateLight} />
              <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: 14, minWidth: 0, ...fBody }} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Bank name</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <Landmark size={16} color={C.slateLight} />
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: 14, minWidth: 0, ...fBody }} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Account number</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <Hash size={16} color={C.slateLight} />
              <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" style={{ border: "none", outline: "none", flex: 1, fontSize: 14, minWidth: 0, ...fBody }} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>BSB / Routing number</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <Hash size={16} color={C.slateLight} />
              <input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" style={{ border: "none", outline: "none", flex: 1, fontSize: 14, minWidth: 0, ...fBody }} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Tax information (if required)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <FileText size={16} color={C.slateLight} />
              <input value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} placeholder="e.g. ABN or Tax File Number" style={{ border: "none", outline: "none", flex: 1, fontSize: 14, minWidth: 0, ...fBody }} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={savePayment}>Save changes</Btn>
        </div>
      </BottomSheet>

      {/* Change password */}
      <BottomSheet open={pwSheet} onClose={() => setPwSheet(false)} title="Change password" heightPct={62}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Current password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((v) => !v)} />
          <Field label="New password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
          <Field label="Confirm new password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Password updated"); setPwSheet(false); }}>Update password</Btn>
        </div>
      </BottomSheet>

      {/* Privacy policy */}
      <BottomSheet open={privacySheet} onClose={() => setPrivacySheet(false)} title="Privacy policy" heightPct={75}>
        <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody }}>
          <p style={{ marginBottom: 12 }}>CoachLink collects only the information needed to run your coaching business, such as your profile details, service packages, booking history and payout information.</p>
          <p style={{ marginBottom: 12 }}>We never sell your personal data. Information is shared with athletes only as needed to fulfil a booking, and with payment processors to complete payouts securely.</p>
          <p>You can update or delete your account at any time from this Profile tab.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full variant="secondary" onClick={() => setPrivacySheet(false)}>Close</Btn>
        </div>
      </BottomSheet>

      {/* Sign out confirmation */}
      <BottomSheet open={signOutSheet} onClose={() => setSignOutSheet(false)} title="Sign out" heightPct={38}>
        <div style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
          Are you sure you want to sign out of your coaching account?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="dark" icon={LogOut} onClick={() => { setSignOutSheet(false); nav("splash"); }}>Sign out</Btn>
          <Btn full variant="secondary" onClick={() => setSignOutSheet(false)}>Cancel</Btn>
        </div>
      </BottomSheet>

      {/* Delete account confirmation */}
      <BottomSheet open={deleteSheet} onClose={() => setDeleteSheet(false)} title="Delete account" heightPct={48}>
        <div style={{ display: "flex", gap: 10, padding: 12, background: C.warnTint, borderRadius: 14, marginBottom: 16 }}>
          <AlertTriangle size={17} color="#D64545" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: C.jet, lineHeight: 1.5, ...fBody }}>
            Deleting your account permanently removes your coach profile, service packages and booking history. Upcoming bookings will be cancelled and athletes notified. This can't be undone.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="danger" onClick={() => { setDeleteSheet(false); toast("Account deleted"); nav("splash"); }}>Delete account</Btn>
          <Btn full variant="secondary" onClick={() => setDeleteSheet(false)}>Cancel</Btn>
        </div>
      </BottomSheet>
    </div>
  );
}
