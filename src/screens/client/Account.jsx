import React, { useState } from "react";
import {
  Edit3, Bell, CreditCard, Fingerprint, Lock, FileText, Shield, HelpCircle, LogOut, Users, ChevronRight,
  Mail, Phone, User, Plus, Trash2, Eye, EyeOff, AlertTriangle, Camera, MapPin, Target, Calendar, UserPlus, Download,
  CalendarDays, CreditCard as CardIcon, Stethoscope, UserCheck, History as HistoryIcon, MessageCircle, Star,
  Sparkles, Percent, ShieldCheck,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { Avatar, Btn, SectionLabel, Toggle, BottomSheet, Field, Chip, Card, Badge, EmptyState, TopBar, SegTabs } from "../../components/ui/Primitives";
import { SPORTS, CLIENT_NOTIFICATIONS } from "../../data/mockData";
import { ReceiptSheet } from "./Dashboard";
import { SKILL_LEVELS } from "./AboutYou";
import { useLiveNotifications } from "../../systems/StateSystem";

const emptyChildDraft = {
  name: "", age: "", sport: [], skillLevel: "", goals: "", postalCode: "", preferences: "", hasPhoto: false,
  medicalConditions: "", allergies: "", medicalNotes: "",
  emergencyName: "", emergencyRelationship: "", emergencyMobile: "",
  guardianName: "", guardianRelationship: "", guardianMobile: "",
};
const emptyCardDraft = { number: "", name: "", expiry: "", cvc: "" };

export function ScreenClientProfile({ nav, biometric, setBiometric, toast, addCoachRole, children = [], addChild, updateChild, removeChild, bookings = [], clientPrefs, onComplete }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [sheet, setSheet] = useState(null); // which bottom sheet is open
  const [editingChildId, setEditingChildId] = useState(null); // null = creating new
  const [childDraft, setChildDraft] = useState(emptyChildDraft);

  // Name & email aren't part of the onboarding "about you" data (they're collected at
  // sign-up instead), so they live here as their own bit of editable profile state.
  const [profile, setProfile] = useState({ name: "Sarah Lin", email: "sarah.lin@email.com" });
  const [editDraft, setEditDraft] = useState(null);

  const openNewChild = () => { setEditingChildId(null); setChildDraft(emptyChildDraft); setSheet("child"); };
  const openEditChild = (child) => { setEditingChildId(child.id); setChildDraft({ ...emptyChildDraft, ...child }); setSheet("child"); };
  const toggleDraftSport = (s) => setChildDraft((d) => ({ ...d, sport: d.sport.includes(s) ? d.sport.filter((x) => x !== s) : [...d.sport, s] }));
  const saveChild = () => {
    if (!childDraft.name.trim()) { toast("Give this profile a name first"); return; }
    if (editingChildId) { updateChild(editingChildId, childDraft); toast(`${childDraft.name}'s profile updated`); }
    else { addChild(childDraft); toast(`${childDraft.name}'s profile added`); }
    setSheet(null);
  };
  const deleteChild = () => {
    if (editingChildId) removeChild(editingChildId);
    toast("Profile removed");
    setSheet(null);
  };

  const [notifPrefs, setNotifPrefs] = useState({
    push: true, email: true, sms: false, bookingReminders: true, messages: true, promos: false,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const [cards, setCards] = useState([
    { id: 1, brand: "Visa", last4: "4242", exp: "08/28", isDefault: true },
    { id: 2, brand: "Mastercard", last4: "8891", exp: "02/27", isDefault: false },
  ]);
  const removeCard = (id) => setCards((c) => c.filter((card) => card.id !== id));
  const makeDefault = (id) => setCards((c) => c.map((card) => ({ ...card, isDefault: card.id === id })));

  const [cardDraft, setCardDraft] = useState(emptyCardDraft);
  const cardBrandFromNumber = (num) => (num.replace(/\s/g, "").startsWith("4") ? "Visa" : num.replace(/\s/g, "").startsWith("5") ? "Mastercard" : "Card");
  const canSaveCard = cardDraft.number.replace(/\s/g, "").length >= 12 && cardDraft.name.trim().length > 0 && /^\d{2}\/\d{2}$/.test(cardDraft.expiry) && cardDraft.cvc.length >= 3;
  const openAddCard = () => { setCardDraft(emptyCardDraft); setSheet("addCard"); };
  const saveCard = () => {
    if (!canSaveCard) { toast("Check your card details and try again"); return; }
    const digits = cardDraft.number.replace(/\s/g, "");
    setCards((c) => [
      ...c,
      { id: Date.now(), brand: cardBrandFromNumber(digits), last4: digits.slice(-4), exp: cardDraft.expiry, isDefault: c.length === 0 },
    ]);
    toast("Payment method added");
    setSheet("payment");
  };

  // Edit profile draft is seeded from whatever was collected during onboarding
  // (mobile, address, postal code, sports, goals) plus the account's name/email,
  // so editing the profile shows exactly what sign-up asked for.
  const openEditProfile = () => {
    setEditDraft({
      name: profile.name,
      email: profile.email,
      phone: clientPrefs?.mobile || "",
      address: clientPrefs?.address || "",
      postalCode: clientPrefs?.postalCode || "",
      sports: clientPrefs?.sports || [],
      skillLevel: clientPrefs?.skillLevel || "",
      goals: clientPrefs?.goals || "",
      medicalConditions: clientPrefs?.medicalConditions || "",
      allergies: clientPrefs?.allergies || "",
      medicalNotes: clientPrefs?.medicalNotes || "",
      emergencyName: clientPrefs?.emergencyName || "",
      emergencyRelationship: clientPrefs?.emergencyRelationship || "",
      emergencyMobile: clientPrefs?.emergencyMobile || "",
    });
    setSheet("edit");
  };
  const toggleEditSport = (s) => setEditDraft((d) => ({ ...d, sports: d.sports.includes(s) ? d.sports.filter((x) => x !== s) : [...d.sports, s] }));
  const saveProfile = () => {
    if (!editDraft.name.trim()) { toast("Add your name first"); return; }
    setProfile({ name: editDraft.name, email: editDraft.email });
    if (onComplete) {
      onComplete({
        ...clientPrefs,
        mobile: editDraft.phone,
        address: editDraft.address,
        postalCode: editDraft.postalCode,
        sports: editDraft.sports,
        skillLevel: editDraft.skillLevel,
        goals: editDraft.goals,
        medicalConditions: editDraft.medicalConditions,
        allergies: editDraft.allergies,
        medicalNotes: editDraft.medicalNotes,
        emergencyName: editDraft.emergencyName,
        emergencyRelationship: editDraft.emergencyRelationship,
        emergencyMobile: editDraft.emergencyMobile,
      });
    }
    toast("Profile updated");
    setSheet(null);
  };

  const [showPw, setShowPw] = useState(false);

  const closeSheet = () => setSheet(null);

  const Row2 = ({ icon: Icon, label, onClick, right }) => (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
      <Icon size={17} color={C.jet} />
      <span style={{ flex: 1, fontSize: T.bodyLg, color: C.jet, fontWeight: 500, ...fBody }}>{label}</span>
      {right || <ChevronRight size={16} color={C.slateLight} />}
    </button>
  );

  const NotifRow = ({ label, sub, prefKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>{sub}</div>}
      </div>
      <Toggle on={notifPrefs[prefKey]} onClick={() => toggleNotif(prefKey)} />
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, marginBottom: 18, ...fDisplay }}>Account</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <Avatar name={profile.name} size={58} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: T.title, fontWeight: 600, color: C.jet, ...fDisplay }}>{profile.name}</div>
              <Badge tone="neutral">Client account</Badge>
            </div>
            <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 2, ...fBody }}>{profile.email}</div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <SectionLabel>Family</SectionLabel>
          <div style={{ fontSize: T.label, color: C.slate, marginTop: -6, marginBottom: 12, lineHeight: 1.5, ...fBody }}>
            Separate profiles for each child.
          </div>
          {children.map((child) => {
            const ageLabel = child.age ? `Age ${child.age}` : "Age not set";
            const sportLabel = child.sport?.length ? child.sport.join(", ") : "Sport not set";
            return (
              <button
                key={child.id}
                onClick={() => openEditChild(child)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px 12px 12px", marginBottom: 10,
                  background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
                  boxShadow: "0 1px 2px rgba(22,24,29,.04)", cursor: "pointer", textAlign: "left",
                }}
              >
                <Avatar name={child.name || "Child"} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{child.name || "Unnamed profile"}</div>
                  <div style={{ fontSize: T.label, color: C.slate, marginTop: 1, ...fBody }}>
                    {ageLabel} · {sportLabel}
                  </div>
                </div>
                <ChevronRight size={16} color={C.slateLight} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
          <div style={{ marginTop: 12 }}>
            <Btn full variant="secondary" icon={UserPlus} onClick={openNewChild}>Add a child profile</Btn>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Profile</SectionLabel>
          <Row2 icon={Edit3} label="Edit profile" onClick={openEditProfile} />
          <Row2 icon={Bell} label="Notification preferences" onClick={() => setSheet("notif")} />
          <Row2 icon={CreditCard} label="Payment methods" onClick={() => setSheet("payment")} />
          <Row2 icon={HistoryIcon} label="History" onClick={() => nav("client-history")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Security</SectionLabel>
          <Row2 icon={Fingerprint} label="Biometric login" right={<Toggle on={biometric} onClick={() => setBiometric((v) => !v)} />} />
          <Row2 icon={Lock} label="Change password" onClick={() => setSheet("password")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Privacy</SectionLabel>
          <Row2 icon={FileText} label="Export my data" onClick={() => toast("We'll email your data export shortly")} />
          <Row2 icon={Shield} label="Privacy policy" onClick={() => setSheet("privacy")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Support</SectionLabel>
          <Row2 icon={HelpCircle} label="Help & FAQs" onClick={() => nav("support")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <Row2 icon={LogOut} label="Log out" onClick={() => setSheet("logout")} />
          <button onClick={() => setSheet("deactivate")} style={{ width: "100%", textAlign: "left", padding: "13px 4px", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: T.body, color: C.danger, fontWeight: 500, ...fBody }}>Deactivate account</span>
          </button>
        </div>
      </div>

      {/* Child / participant profile */}
      <BottomSheet open={sheet === "child"} onClose={() => setSheet(null)} title={editingChildId ? "Edit child profile" : "Add child profile"} heightPct={90}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <button
            onClick={() => setChildDraft((d) => ({ ...d, hasPhoto: !d.hasPhoto }))}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}
          >
            {childDraft.hasPhoto ? <Avatar name={childDraft.name || "Child"} size={72} /> : (
              <div style={{ width: 72, height: 72, borderRadius: 72, background: C.fog, border: `1.5px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={20} color={C.slateLight} />
              </div>
            )}
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 24, background: C.brand, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={11} color={C.white} />
            </div>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Child's name" placeholder="e.g. Ava" icon={User} value={childDraft.name} onChange={(e) => setChildDraft((d) => ({ ...d, name: e.target.value }))} />
          <Field label="Age" placeholder="e.g. 9" value={childDraft.age} onChange={(e) => setChildDraft((d) => ({ ...d, age: e.target.value }))} />
          <Field label="Location / postcode" placeholder="e.g. 2026" icon={MapPin} value={childDraft.postalCode} onChange={(e) => setChildDraft((d) => ({ ...d, postalCode: e.target.value }))} />
        </div>

        <div style={{ marginTop: 4 }}>
          <SectionLabel>Guardian information</SectionLabel>
          <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: -6, marginBottom: 12, lineHeight: 1.5, ...fBody }}>
            The parent or legal guardian responsible for this participant.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Guardian name" placeholder="e.g. Jamie Chen" icon={UserCheck} value={childDraft.guardianName} onChange={(e) => setChildDraft((d) => ({ ...d, guardianName: e.target.value }))} />
            <Field label="Relationship to participant" placeholder="e.g. Parent" value={childDraft.guardianRelationship} onChange={(e) => setChildDraft((d) => ({ ...d, guardianRelationship: e.target.value }))} />
            <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={childDraft.guardianMobile} onChange={(e) => setChildDraft((d) => ({ ...d, guardianMobile: e.target.value.replace(/[^0-9+\s]/g, "") }))} />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Sport / interests</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {SPORTS.map((s) => (
              <Chip key={s} active={childDraft.sport.includes(s)} onClick={() => toggleDraftSport(s)}>{s}</Chip>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Skill level</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {SKILL_LEVELS.map((lvl) => (
              <Chip key={lvl} active={childDraft.skillLevel === lvl} onClick={() => setChildDraft((d) => ({ ...d, skillLevel: lvl }))}>{lvl}</Chip>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Coaching goals</SectionLabel>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
            <Target size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <textarea
              value={childDraft.goals}
              onChange={(e) => setChildDraft((d) => ({ ...d, goals: e.target.value }))}
              placeholder="e.g. build confidence for club trials"
              rows={2}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, resize: "none", ...fBody }}
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Coaching preferences</SectionLabel>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
            <Users size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <textarea
              value={childDraft.preferences}
              onChange={(e) => setChildDraft((d) => ({ ...d, preferences: e.target.value }))}
              placeholder="e.g. prefers a female coach, mornings only"
              rows={2}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, resize: "none", ...fBody }}
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Medical information (optional)</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Medical conditions" placeholder="e.g. asthma" icon={Stethoscope} value={childDraft.medicalConditions} onChange={(e) => setChildDraft((d) => ({ ...d, medicalConditions: e.target.value }))} />
            <Field label="Allergies" placeholder="e.g. bee stings, peanuts" icon={AlertTriangle} value={childDraft.allergies} onChange={(e) => setChildDraft((d) => ({ ...d, allergies: e.target.value }))} />
            <div>
              <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Additional notes</div>
              <textarea
                value={childDraft.medicalNotes}
                onChange={(e) => setChildDraft((d) => ({ ...d, medicalNotes: e.target.value }))}
                placeholder="Anything else a coach should know"
                rows={2}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", resize: "none", ...fBody }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Emergency contact (optional)</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Contact name" placeholder="e.g. Mia Chen" icon={UserCheck} value={childDraft.emergencyName} onChange={(e) => setChildDraft((d) => ({ ...d, emergencyName: e.target.value }))} />
            <Field label="Relationship" placeholder="e.g. Mother" value={childDraft.emergencyRelationship} onChange={(e) => setChildDraft((d) => ({ ...d, emergencyRelationship: e.target.value }))} />
            <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={childDraft.emergencyMobile} onChange={(e) => setChildDraft((d) => ({ ...d, emergencyMobile: e.target.value.replace(/[^0-9+\s]/g, "") }))} />
          </div>
        </div>

        {editingChildId && (
          <div style={{ marginTop: 18 }}>
            <SectionLabel>Booking history</SectionLabel>
            {(() => {
              const history = bookings.filter((b) => b.participant === childDraft.name);
              if (history.length === 0) {
                return <div style={{ fontSize: T.labelLg, color: C.slateLight, ...fBody }}>No sessions booked yet for {childDraft.name || "this profile"}.</div>;
              }
              return history.map((b) => (
                <Card key={b.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
                      <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{b.coachName} · {b.date}</div>
                    </div>
                    <Badge tone={b.status === "completed" ? "success" : "orange"}>{b.status}</Badge>
                  </div>
                </Card>
              ));
            })()}
          </div>
        )}

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full onClick={saveChild}>{editingChildId ? "Save changes" : "Add profile"}</Btn>
          {editingChildId && (
            <Btn full variant="danger" icon={Trash2} onClick={deleteChild}>Remove profile</Btn>
          )}
        </div>
      </BottomSheet>

      {/* Edit profile — mirrors every field collected across sign-up (name, email) and the
          "About you" onboarding (phone, address, postal code, sports, goals), prefilled with
          whatever the person already gave us so nothing has to be re-entered from scratch. */}
      <BottomSheet open={sheet === "edit"} onClose={closeSheet} title="Edit profile" heightPct={88}>
        {editDraft && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <Avatar name={editDraft.name || "You"} size={64} />
            </div>
            <SectionLabel>Account</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <Field label="Full name" placeholder="Sarah Lin" icon={User} value={editDraft.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
              <Field label="Email" placeholder="you@email.com" icon={Mail} type="email" value={editDraft.email} onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))} />
              <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={editDraft.phone} onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))} />
            </div>

            <SectionLabel>Location</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <Field label="Address" placeholder="Enter your address" icon={MapPin} value={editDraft.address} onChange={(e) => setEditDraft((d) => ({ ...d, address: e.target.value }))} />
              <Field label="Postal code" placeholder="e.g. 2026" icon={MapPin} value={editDraft.postalCode} onChange={(e) => setEditDraft((d) => ({ ...d, postalCode: e.target.value }))} />
            </div>
            <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: -10, marginBottom: 20, lineHeight: 1.5, ...fBody }}>
              We only use this to find coaches nearby — it's never shown to coaches or other clients.
            </div>

            <SectionLabel>Sports you're into</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {SPORTS.map((s) => (
                <Chip key={s} active={editDraft.sports.includes(s)} onClick={() => toggleEditSport(s)}>{s}</Chip>
              ))}
            </div>

            <SectionLabel>Skill level</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {SKILL_LEVELS.map((lvl) => (
                <Chip key={lvl} active={editDraft.skillLevel === lvl} onClick={() => setEditDraft((d) => ({ ...d, skillLevel: lvl }))}>{lvl}</Chip>
              ))}
            </div>

            <SectionLabel>Coaching goals</SectionLabel>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px", marginBottom: 20 }}>
              <Target size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
              <textarea
                value={editDraft.goals}
                onChange={(e) => setEditDraft((d) => ({ ...d, goals: e.target.value }))}
                placeholder="e.g. build confidence for club trials, improve fitness, learn the basics..."
                rows={3}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, resize: "none", ...fBody }}
              />
            </div>

            <SectionLabel>Medical information (optional)</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <Field label="Medical conditions" placeholder="e.g. asthma" icon={Stethoscope} value={editDraft.medicalConditions} onChange={(e) => setEditDraft((d) => ({ ...d, medicalConditions: e.target.value }))} />
              <Field label="Allergies" placeholder="e.g. bee stings, peanuts" icon={AlertTriangle} value={editDraft.allergies} onChange={(e) => setEditDraft((d) => ({ ...d, allergies: e.target.value }))} />
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Additional notes</div>
                <textarea
                  value={editDraft.medicalNotes}
                  onChange={(e) => setEditDraft((d) => ({ ...d, medicalNotes: e.target.value }))}
                  placeholder="Anything else a coach should know"
                  rows={2}
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", resize: "none", ...fBody }}
                />
              </div>
            </div>

            <SectionLabel>Emergency contact (optional)</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
              <Field label="Contact name" placeholder="e.g. Mia Chen" icon={UserCheck} value={editDraft.emergencyName} onChange={(e) => setEditDraft((d) => ({ ...d, emergencyName: e.target.value }))} />
              <Field label="Relationship" placeholder="e.g. Partner" value={editDraft.emergencyRelationship} onChange={(e) => setEditDraft((d) => ({ ...d, emergencyRelationship: e.target.value }))} />
              <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={editDraft.emergencyMobile} onChange={(e) => setEditDraft((d) => ({ ...d, emergencyMobile: e.target.value.replace(/[^0-9+\s]/g, "") }))} />
            </div>

            <Btn full onClick={saveProfile}>Save changes</Btn>
          </>
        )}
      </BottomSheet>

      {/* Notification preferences */}
      <BottomSheet open={sheet === "notif"} onClose={closeSheet} title="Notification preferences" heightPct={70}>
        <NotifRow label="Push notifications" sub="Alerts on this device" prefKey="push" />
        <NotifRow label="Email notifications" sub="Updates sent to your inbox" prefKey="email" />
        <NotifRow label="SMS notifications" sub="Text messages for urgent updates" prefKey="sms" />
        <NotifRow label="Booking reminders" sub="Reminders before your sessions" prefKey="bookingReminders" />
        <NotifRow label="Messages" sub="New messages from coaches" prefKey="messages" />
        <NotifRow label="Promotions & offers" sub="Deals and product news" prefKey="promos" />
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Notification preferences saved"); closeSheet(); }}>Save preferences</Btn>
        </div>
      </BottomSheet>

      {/* Payment methods */}
      <BottomSheet open={sheet === "payment"} onClose={closeSheet} title="Payment methods" heightPct={70}>
        {cards.map((card) => (
          <div key={card.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 28, borderRadius: 6, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={15} color={C.jet} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{card.brand} •••• {card.last4}</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Expires {card.exp}{card.isDefault ? " · Default" : ""}</div>
            </div>
            {!card.isDefault && (
              <button onClick={() => makeDefault(card.id)} style={{ background: "none", border: "none", color: C.brand, fontSize: T.label, fontWeight: 600, cursor: "pointer", ...fBody }}>Set default</button>
            )}
            <button onClick={() => removeCard(card.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <Trash2 size={15} color={C.slateLight} />
            </button>
          </div>
        ))}
        <div style={{ marginTop: 18 }}>
          <Btn full variant="secondary" icon={Plus} onClick={openAddCard}>Add payment method</Btn>
        </div>
      </BottomSheet>

      {/* Add payment method */}
      <BottomSheet open={sheet === "addCard"} onClose={() => setSheet("payment")} title="Add payment method" heightPct={68}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field
            label="Card number"
            placeholder="1234 5678 9012 3456"
            icon={CardIcon}
            value={cardDraft.number}
            onChange={(e) => setCardDraft((d) => ({ ...d, number: e.target.value.replace(/[^\d\s]/g, "") }))}
          />
          <Field
            label="Name on card"
            placeholder="Sarah Lin"
            icon={User}
            value={cardDraft.name}
            onChange={(e) => setCardDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field
                label="Expiry"
                placeholder="MM/YY"
                icon={CalendarDays}
                value={cardDraft.expiry}
                onChange={(e) => setCardDraft((d) => ({ ...d, expiry: e.target.value.replace(/[^\d/]/g, "") }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Field
                label="CVC"
                placeholder="123"
                icon={Lock}
                value={cardDraft.cvc}
                onChange={(e) => setCardDraft((d) => ({ ...d, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              />
            </div>
          </div>
        </div>
        <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 14, lineHeight: 1.5, ...fBody }}>
          Payments are processed by our PCI-compliant payment partner — CoachLink never stores your full card number.
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full disabled={!canSaveCard} onClick={saveCard}>Save card</Btn>
        </div>
      </BottomSheet>

      {/* Change password */}
      <BottomSheet open={sheet === "password"} onClose={closeSheet} title="Change password" heightPct={62}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Current password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((v) => !v)} />
          <Field label="New password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
          <Field label="Confirm new password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Password updated"); closeSheet(); }}>Update password</Btn>
        </div>
      </BottomSheet>

      {/* Privacy policy */}
      <BottomSheet open={sheet === "privacy"} onClose={closeSheet} title="Privacy policy" heightPct={75}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody }}>
          <p style={{ marginBottom: 12 }}>CoachLink collects only the information needed to connect you with coaches and manage your bookings, such as your profile details, session history, and payment information.</p>
          <p style={{ marginBottom: 12 }}>We never sell your personal data. Information is shared with coaches only as needed to fulfil a booking, and with payment processors to complete transactions securely.</p>
          <p>You can request a copy of your data or ask us to delete your account at any time from this Account tab.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full variant="secondary" onClick={closeSheet}>Close</Btn>
        </div>
      </BottomSheet>

      {/* Log out confirmation */}
      <BottomSheet open={sheet === "logout"} onClose={closeSheet} title="Log out" heightPct={38}>
        <div style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
          Are you sure you want to log out of your account?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="dark" icon={LogOut} onClick={() => { closeSheet(); nav("splash"); }}>Log out</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>

      {/* Deactivate account confirmation */}
      <BottomSheet open={sheet === "deactivate"} onClose={closeSheet} title="Deactivate account" heightPct={46}>
        <div style={{ display: "flex", gap: 10, padding: 12, background: C.warnTint, borderRadius: 14, marginBottom: 16 }}>
          <AlertTriangle size={17} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: T.labelLg, color: C.jet, lineHeight: 1.5, ...fBody }}>
            Deactivating your account will hide your profile and cancel any upcoming bookings. This can be undone by logging back in within 30 days.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="danger" onClick={() => { closeSheet(); toast("Account deactivated"); nav("splash"); }}>Deactivate account</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>

    </div>
  );
}

/* =========================================================================
   HISTORY — full page covering both transaction history (Payments) and a
   timeline of other completed activity (Activity), so it's a single place
   to look back on the account rather than payments-only. Tapping a payment
   row still opens the receipt as a bottom sheet — a lightweight detail
   glance, not something worth its own page.
   ========================================================================= */
const CLIENT_ACTIVITY_ICON = { booking: Calendar, message: MessageCircle, review: Star, availability: Sparkles, promo: Percent, payment: CreditCard, verification: ShieldCheck };

export function ScreenClientHistory({ nav, bookings = [], clientNotifications = [] }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [tab, setTab] = useState("payments");
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [activity] = useLiveNotifications(clientNotifications, CLIENT_NOTIFICATIONS);
  const paidBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed" || b.status === "cancelled");

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="History" onBack={() => nav("client-profile")} />
      <div style={{ marginBottom: 16 }}>
        <SegTabs
          items={[{ value: "payments", label: "Payments" }, { value: "activity", label: "Activity" }]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {tab === "payments" && (
          <>
            {paidBookings.length === 0 && (
              <EmptyState icon={CreditCard} title="No payments yet" body="Your session receipts will show up here." />
            )}
            {paidBookings.map((b) => (
              <Card key={b.id} onClick={() => setReceiptTarget(b)} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={b.coachName} size={40} />
                  <div>
                    <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
                    <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {b.coachName}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: T.subtitle, fontWeight: 700, color: b.status === "cancelled" ? C.slateLight : C.jet, ...fDisplay }}>${b.price}</div>
                  <ChevronRight size={16} color={C.slateLight} />
                </div>
              </Card>
            ))}
          </>
        )}

        {tab === "activity" && (
          <>
            {activity.length === 0 && (
              <EmptyState icon={HistoryIcon} title="No activity yet" body="Booking updates, payments and other account activity will show up here." />
            )}
            {activity.map((n) => {
              const Icon = CLIENT_ACTIVITY_ICON[n.type] || HistoryIcon;
              return (
                <Card key={n.id} style={{ marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color={C.brandIcon || C.brandColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{n.title}</span>
                      <span style={{ fontSize: T.tiny, color: C.slateLight, flexShrink: 0, ...fBody }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 3, lineHeight: 1.45, ...fBody }}>{n.body}</div>
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>

      <ReceiptSheet booking={receiptTarget} onClose={() => setReceiptTarget(null)} />
    </div>
  );
}
