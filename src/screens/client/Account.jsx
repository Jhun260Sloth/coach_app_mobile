import React, { useEffect, useRef, useState } from "react";
import {
  Edit3, Bell, CreditCard, Fingerprint, Lock, FileText, Shield, HelpCircle, LogOut, Users, ChevronRight,
  Mail, Phone, User, Plus, Trash2, Eye, EyeOff, AlertTriangle, Camera, MapPin, Target, Calendar, UserPlus, Download,
  CalendarDays, CreditCard as CardIcon, Stethoscope, UserCheck, History as HistoryIcon, MessageCircle, Star,
  Sparkles, Percent, ShieldCheck,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { Avatar, Btn, ScreenHeader, SectionLabel, FormSection, Toggle, BottomSheet, ConfirmDialog, Field, Chip, Card, Badge, EmptyState, TopBar, SegTabs, HandleTag, RequiredMark, SettingsRow, SettingsGroup, PasswordRequirements, passwordValid, FullscreenImageViewer } from "../../components/ui/Primitives";
import { HandleField } from "../../components/ui/PublicIdentityFields";
import { isValidHandle } from "../../utils/name";
import { getBookingCoachName } from "../../utils/name";
import { CLIENT_NOTIFICATIONS, COACHES } from "../../data/mockData";
import { POPULAR_SPORTS, SPORT_NAMES } from "../../data/sports";
import { SportBadge, SportSearchMultiSelect } from "../../components/ui/SportUI";
import { SportSkillLevelPicker } from "../../components/ui/SportSkillLevelPicker";
import { PAYMENT_STATUS } from "../../data/bookings";
import { ReceiptSheet } from "./Dashboard";
import { hasCompleteSportLevels, normaliseSportLevels } from "../../data/sportSkillLevels";
import { useLiveNotifications } from "../../systems/StateSystem";
import { LocationField } from "../../components/ui/LocationField";
import { AccountDetailsSheet } from "../../components/ui/AccountDetailsSheet";

const emptyChildDraft = {
  name: "", age: "", sport: [], sportLevels: {}, goals: "", location: null, preferences: "", hasPhoto: false,
  medicalConditions: "", allergies: "", medicalNotes: "",
  emergencyName: "", emergencyRelationship: "", emergencyMobile: "",
  guardianName: "", guardianRelationship: "", guardianMobile: "",
};
const emptyCardDraft = { number: "", name: "", expiry: "", cvc: "" };

export function ScreenClientProfile({ nav, resetNav, biometric, setBiometric, toast, addCoachRole, children = [], addChild, updateChild, removeChild, bookings = [], clientPrefs, onComplete }) {
  const { darkMode, clientIdentity, updateClientIdentity, isHandleTaken, pushNotification } = useApp();
  const C = darkMode ? CD : CL;
  const [sheet, setSheet] = useState(null); // which bottom sheet is open
  const [removalTarget, setRemovalTarget] = useState(null);
  const [editingChildId, setEditingChildId] = useState(null); // null = creating new
  const [childDraft, setChildDraft] = useState(emptyChildDraft);

  // Name & email live in app identity state (collected at sign-up), not in
  // the "about you" onboarding data — so they're editable here too.
  const profile = {
    name: `${clientIdentity.firstName || ""} ${clientIdentity.lastName || ""}`.trim() || "You",
    email: clientIdentity.email || "",
    phone: clientIdentity.phone || clientPrefs?.mobile || "",
  };
  const [editDraft, setEditDraft] = useState(null);
  const [handleEdited, setHandleEdited] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const profilePhotoInputRef = useRef(null);
  const profilePhoto = clientIdentity.photo || clientIdentity.avatar || null;

  const openNewChild = () => { setEditingChildId(null); setChildDraft(emptyChildDraft); setSheet("child"); };
  const openEditChild = (child) => {
    const sport = Array.isArray(child.sport) ? child.sport : [];
    setEditingChildId(child.id);
    setChildDraft({
      ...emptyChildDraft,
      ...child,
      sport,
      sportLevels: normaliseSportLevels(sport, child.sportLevels, child.skillLevel),
    });
    setSheet("child");
  };
  const setDraftSports = (sport) => setChildDraft((draft) => ({
    ...draft,
    sport,
    sportLevels: normaliseSportLevels(sport, draft.sportLevels, draft.skillLevel),
  }));
  const toggleDraftSport = (sport) => setDraftSports(childDraft.sport.includes(sport)
    ? childDraft.sport.filter((item) => item !== sport)
    : [...childDraft.sport, sport]);
  const saveChild = () => {
    if (!childDraft.name.trim()) { toast("Give this profile a name first"); return; }
    if (childDraft.sport.length > 0 && !hasCompleteSportLevels(childDraft.sport, childDraft.sportLevels)) {
      toast("Add an experience level for every selected sport");
      return;
    }
    if (editingChildId) { updateChild(editingChildId, childDraft); toast(`${childDraft.name}'s profile updated`); }
    else { addChild(childDraft); toast(`${childDraft.name}'s profile added`); }
    setSheet(null);
  };
  const deleteChild = () => {
    if (editingChildId) removeChild(editingChildId);
    toast("Profile removed");
    setRemovalTarget(null);
    setSheet(null);
  };

  const [notifPrefs, setNotifPrefs] = useState({
    push: true, email: true, sms: false, whatsapp: false, bookingReminders: true, messages: true, promos: false,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const [cards, setCards] = useState([
    { id: 1, brand: "Visa", last4: "4242", exp: "08/28", isDefault: true },
    { id: 2, brand: "Mastercard", last4: "8891", exp: "02/27", isDefault: false },
  ]);
  const removeCard = (id) => setCards((c) => c.filter((card) => card.id !== id));
  const confirmCardRemoval = () => {
    removeCard(removalTarget.id);
    toast("Payment method removed");
    setRemovalTarget(null);
  };
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

  // Edit profile is for public and coaching-preference data. Login email and
  // phone are intentionally handled by the verified account-details flow.
  const openEditProfile = () => {
    const sports = Array.isArray(clientPrefs?.sports) && clientPrefs.sports.length
      ? clientPrefs.sports
      : Array.isArray(clientPrefs?.sport) ? clientPrefs.sport : [];
    setHandleEdited(false);
    setEditDraft({
      name: profile.name,
      handle: clientIdentity.handle || "",
      photo: clientIdentity.photo || clientIdentity.avatar || null,
      address: clientPrefs?.address || "",
      location: clientPrefs?.location || null,
      sports,
      sportLevels: normaliseSportLevels(sports, clientPrefs?.sportLevels, clientPrefs?.skillLevel),
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
  const onProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setEditDraft((draft) => ({ ...draft, photo: URL.createObjectURL(file) }));
    event.target.value = "";
  };
  const setEditSports = (sports) => setEditDraft((draft) => ({
    ...draft,
    sports,
    sportLevels: normaliseSportLevels(sports, draft.sportLevels, draft.skillLevel),
  }));
  const toggleEditSport = (sport) => setEditSports(editDraft.sports.includes(sport)
    ? editDraft.sports.filter((item) => item !== sport)
    : [...editDraft.sports, sport]);
  const saveProfile = () => {
    if (!editDraft.name.trim()) { toast("Add your name first"); return; }
    if (!isValidHandle(editDraft.handle)) { toast("Pick a valid username - 3–24 characters"); return; }
    if (isHandleTaken(editDraft.handle)) { toast("That username's taken - try another"); return; }
    if (editDraft.sports.length > 0 && !hasCompleteSportLevels(editDraft.sports, editDraft.sportLevels)) {
      toast("Add an experience level for every selected sport");
      return;
    }
    const parts = editDraft.name.trim().split(/\s+/);
    updateClientIdentity({
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      handle: editDraft.handle.trim(),
      photo: editDraft.photo,
    });
    if (onComplete) {
      onComplete({
        ...clientPrefs,
        address: editDraft.address,
        location: editDraft.location,
        sport: editDraft.sports,
        sports: editDraft.sports,
        sportLevels: editDraft.sportLevels,
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

  const saveAccountDetails = ({ name, username, email, phone }) => {
    const contactChanged = email.trim().toLowerCase() !== profile.email.trim().toLowerCase()
      || phone.replace(/\D/g, "") !== profile.phone.replace(/\D/g, "");
    const parts = name.trim().split(/\s+/);
    updateClientIdentity({
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      handle: username,
      email,
      phone,
      phoneVerified: !!phone,
    });
    onComplete?.({ ...clientPrefs, mobile: phone });
    if (contactChanged) {
      pushNotification?.({
        audience: "client",
        type: "verification",
        title: "Contact details changed",
        body: "Your verified email or phone number was updated. If this wasn't you, contact support now.",
      });
    }
  };

  const [showPw, setShowPw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const pwdOk = passwordValid(newPw) && newPw === confirmPw;

  const [deactivateStep, setDeactivateStep] = useState("confirm");
  const [deactivationCode, setDeactivationCode] = useState(["", "", "", "", "", ""]);
  const [deactivationError, setDeactivationError] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const deactivationInputsRef = useRef([]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const resetDeactivation = () => {
    setDeactivateStep("confirm");
    setDeactivationCode(["", "", "", "", "", ""]);
    setDeactivationError(false);
    setResendSeconds(0);
  };
  const openDeactivate = () => {
    resetDeactivation();
    setSheet("deactivate");
  };
  const closeDeactivate = () => {
    setSheet(null);
    resetDeactivation();
  };
  const sendDeactivationCode = () => {
    if (!profile.email) {
      toast("Add an email before deactivating");
      return;
    }
    setDeactivateStep("verify");
    setDeactivationCode(["", "", "", "", "", ""]);
    setDeactivationError(false);
    setResendSeconds(30);
    toast("Verification code sent");
    window.setTimeout(() => deactivationInputsRef.current[0]?.focus(), 120);
  };
  const setDeactivationDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDeactivationCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    setDeactivationError(false);
    if (digit && index < 5) deactivationInputsRef.current[index + 1]?.focus();
  };
  const onDeactivationKeyDown = (index, event) => {
    if (event.key === "Backspace" && !deactivationCode[index] && index > 0) deactivationInputsRef.current[index - 1]?.focus();
  };
  const onDeactivationPaste = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    event.preventDefault();
    setDeactivationCode(Array.from({ length: 6 }, (_, index) => digits[index] || ""));
    setDeactivationError(false);
    deactivationInputsRef.current[Math.min(digits.length, 6) - 1]?.focus();
  };
  const verifyAndDeactivate = () => {
    const code = deactivationCode.join("");
    if (code.length !== 6 || code === "000000") {
      setDeactivationError(true);
      return;
    }
    closeDeactivate();
    toast("Account deactivated securely");
    resetNav("splash", {}, "client");
  };
  const resendDeactivationCode = () => {
    setDeactivationCode(["", "", "", "", "", ""]);
    setDeactivationError(false);
    setResendSeconds(30);
    toast("New verification code sent");
    deactivationInputsRef.current[0]?.focus();
  };

const closeSheet = () => setSheet(null);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <ScreenHeader title="Account" subtitle="Profile, family and account preferences." style={{ marginBottom: 18 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", paddingBottom: 116 }} className="cl-hide-scrollbar">

        {/* Profile summary — scrolls with the page */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 0 26px" }}>
          <button
            type="button"
            aria-label={`Open ${profile.name}'s profile photo`}
            disabled={!profilePhoto}
            onClick={() => setAvatarOpen(true)}
            style={{ width: 58, height: 58, padding: 0, border: "none", borderRadius: 99, background: "transparent", cursor: profilePhoto ? "zoom-in" : "default", flexShrink: 0 }}
          >
            <Avatar name={profile.name} src={profilePhoto} size={58} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: T.title, fontWeight: 600, color: C.jet, ...fDisplay }}>{profile.name}</div>
            <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 2, ...fBody }}>{profile.email}</div>
            <div style={{ marginTop: 3 }}><HandleTag handle={clientIdentity.handle} size={12} color={C.brand} /></div>
          </div>
        </div>

        {/* Family */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Family</SectionLabel>
          <div className="cl-stagger">
          {children.map((child, i) => {
            const ageLabel = child.age ? `Age ${child.age}` : "Age not set";
            return (
              <button
                key={child.id}
                onClick={() => openEditChild(child)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px 12px 12px", marginBottom: 10,
                  background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
                  boxShadow: "0 1px 2px rgba(22,24,29,.04)", cursor: "pointer", textAlign: "left",
                  animationDelay: `${Math.min(i, 8) * 45}ms`,
                }}
              >
                <Avatar name={child.name || "Child"} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{child.name || "Unnamed profile"}</div>
                  <div style={{ fontSize: T.label, color: C.slate, marginTop: 1, ...fBody }}>{ageLabel}</div>
                  {child.sport?.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                      {child.sport.slice(0, 2).map((sport) => <SportBadge key={sport} sport={sport} compact />)}
                      {child.sport.length > 2 && <Badge tone="neutral">+{child.sport.length - 2}</Badge>}
                    </div>
                  ) : <div style={{ fontSize: T.caption, color: C.slateLight, marginTop: 3, ...fBody }}>Sport not set</div>}
                </div>
                <ChevronRight size={16} color={C.slateLight} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
          </div>
          <div style={{ marginTop: 10 }}>
            <Btn full variant="secondary" icon={UserPlus} onClick={openNewChild}>Add a child profile</Btn>
          </div>
        </div>

        <SettingsGroup title="Profile">
          <SettingsRow icon={Edit3} label="Edit profile" onClick={openEditProfile} />
          <SettingsRow icon={Bell} label="Notification preferences" onClick={() => setSheet("notif")} />
          <SettingsRow icon={CreditCard} label="Payment methods" onClick={() => setSheet("payment")} />
          <SettingsRow icon={HistoryIcon} label="History" onClick={() => nav("client-history")} />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsRow icon={ShieldCheck} label="Login & contact details" onClick={() => setSheet("accountDetails")} />
          <SettingsRow icon={Fingerprint} label="Biometric login" right={<Toggle label="Biometric login" on={biometric} onClick={() => setBiometric((v) => !v)} />} />
          <SettingsRow icon={Lock} label="Change password" onClick={() => setSheet("password")} />
        </SettingsGroup>

        <SettingsGroup title="Privacy">
          <SettingsRow icon={FileText} label="Export my data" onClick={() => toast("We'll email your data export shortly")} />
          <SettingsRow icon={Shield} label="Privacy policy" onClick={() => setSheet("privacy")} />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsRow icon={HelpCircle} label="Help & FAQs" onClick={() => nav("support")} />
        </SettingsGroup>

        <SettingsGroup title="Session">
          <SettingsRow icon={LogOut} label="Log out" onClick={() => setSheet("logout")} />
          <SettingsRow icon={AlertTriangle} label="Deactivate account" danger onClick={openDeactivate} />
        </SettingsGroup>
      </div>

      {/* Child / participant profile */}
      <BottomSheet open={sheet === "child"} onClose={() => setSheet(null)} title={editingChildId ? "Edit child profile" : "Add child profile"} heightPct={90}>
        <FormSection icon={Camera} label="Profile photo" hint="A photo helps coaches recognise your child at sessions.">
          <div style={{ display: "flex", justifyContent: "center" }}>
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
        </FormSection>

        <FormSection icon={User} label="About them" hint="Basic details for this participant.">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Child's name" placeholder="e.g. Ava" icon={User} value={childDraft.name} onChange={(e) => setChildDraft((d) => ({ ...d, name: e.target.value }))} required />
            <Field label="Age" placeholder="e.g. 9" value={childDraft.age} onChange={(e) => setChildDraft((d) => ({ ...d, age: e.target.value }))} />
            <LocationField
              value={childDraft.location}
              onChange={(loc) => setChildDraft((d) => ({ ...d, location: loc }))}
              label="Location"
              placeholder="Search suburb or postcode…"
            />
          </div>
        </FormSection>

        <FormSection icon={UserCheck} label="Guardian information" hint="The parent or legal guardian responsible for this participant.">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Guardian name" placeholder="e.g. Jamie Chen" icon={UserCheck} value={childDraft.guardianName} onChange={(e) => setChildDraft((d) => ({ ...d, guardianName: e.target.value }))} />
            <Field label="Relationship to participant" placeholder="e.g. Parent" value={childDraft.guardianRelationship} onChange={(e) => setChildDraft((d) => ({ ...d, guardianRelationship: e.target.value }))} />
            <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={childDraft.guardianMobile} onChange={(e) => setChildDraft((d) => ({ ...d, guardianMobile: e.target.value.replace(/[^0-9+\s]/g, "") }))} />
          </div>
        </FormSection>

        <FormSection icon={Sparkles} label="Sport & interests" hint="Sports they love - helps coaches match the right sessions.">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {POPULAR_SPORTS.slice(0, 10).map((s) => (
              <SportBadge key={s} sport={s} selected={childDraft.sport.includes(s)} onClick={() => toggleDraftSport(s)} compact />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <SportSearchMultiSelect options={SPORT_NAMES} value={childDraft.sport} onChange={setDraftSports} placeholder="Search all sports…" />
          </div>
        </FormSection>

        <FormSection icon={Target} label="Experience by sport" hint="Choose the closest current level for every selected sport.">
          <SportSkillLevelPicker
            sports={childDraft.sport}
            value={childDraft.sportLevels}
            onChange={(sportLevels) => setChildDraft((draft) => ({ ...draft, sportLevels }))}
          />
        </FormSection>

        <FormSection icon={Target} label="Coaching goals" hint="What they'd like to get out of coaching.">
          <div className="cl-input" style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
            <Target size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <textarea
              value={childDraft.goals}
              onChange={(e) => setChildDraft((d) => ({ ...d, goals: e.target.value }))}
              placeholder="e.g. build confidence for club trials"
              rows={2}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, resize: "none", ...fBody }}
            />
          </div>
        </FormSection>

        <FormSection icon={Users} label="Coaching preferences" hint="Any preferences that help coaches prepare for sessions.">
          <div className="cl-input" style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
            <Users size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <textarea
              value={childDraft.preferences}
              onChange={(e) => setChildDraft((d) => ({ ...d, preferences: e.target.value }))}
              placeholder="e.g. prefers a female coach, mornings only"
              rows={2}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, resize: "none", ...fBody }}
            />
          </div>
        </FormSection>

        <FormSection icon={Stethoscope} label="Medical information (optional)" hint="Anything a coach should know to keep sessions safe.">
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
        </FormSection>

        <FormSection icon={Phone} label="Emergency contact (optional)" hint="Who coaches can reach if they can't get hold of you.">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Contact name" placeholder="e.g. Mia Chen" icon={UserCheck} value={childDraft.emergencyName} onChange={(e) => setChildDraft((d) => ({ ...d, emergencyName: e.target.value }))} />
            <Field label="Relationship" placeholder="e.g. Mother" value={childDraft.emergencyRelationship} onChange={(e) => setChildDraft((d) => ({ ...d, emergencyRelationship: e.target.value }))} />
            <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={childDraft.emergencyMobile} onChange={(e) => setChildDraft((d) => ({ ...d, emergencyMobile: e.target.value.replace(/[^0-9+\s]/g, "") }))} />
          </div>
        </FormSection>

        {editingChildId && (
          <FormSection icon={HistoryIcon} label="Booking history" hint="Sessions booked for this profile.">
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
                      <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{(() => { const cn = getBookingCoachName(b, COACHES.find((c) => c.id === b.coachId)); return cn.name; })()} · {b.date}</div>
                    </div>
                    <Badge tone={b.status === "completed" ? "success" : "orange"}>{b.status}</Badge>
                  </div>
                </Card>
              ));
            })()}
          </FormSection>
        )}

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full onClick={saveChild}>{editingChildId ? "Save changes" : "Add profile"}</Btn>
          {editingChildId && (
            <Btn full variant="danger" icon={Trash2} onClick={() => setRemovalTarget({ type: "child", id: editingChildId, name: childDraft.name })}>Remove profile</Btn>
          )}
        </div>
      </BottomSheet>

      {/* Edit profile — mirrors the public profile and the "About you"
          onboarding (address, postal code, sports, goals), prefilled with
          whatever the person already gave us so nothing has to be re-entered from scratch. */}
      <BottomSheet open={sheet === "edit"} onClose={closeSheet} title="Edit profile" heightPct={88}>
        {editDraft && (
          <>
<FormSection icon={Camera} label="Profile photo" hint="A friendly photo helps coaches recognise you at sessions.">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button type="button" aria-label="Change profile photo" onClick={() => profilePhotoInputRef.current?.click()} style={{ position: "relative", width: 76, height: 76, padding: 0, background: "none", border: "none", cursor: "pointer" }}>
                {editDraft.photo ? (
                  <img src={editDraft.photo} alt="Profile" style={{ width: 76, height: 76, borderRadius: 76, objectFit: "cover", display: "block" }} />
                ) : (
                  <Avatar name={editDraft.name || "You"} src={clientIdentity.avatar} size={76} />
                )}
                <span aria-hidden="true" style={{ position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 999, background: C.brand, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(22,24,29,.16)" }}><Camera size={13} color={C.white} /></span>
              </button>
              <input ref={profilePhotoInputRef} type="file" accept="image/*" onChange={onProfilePhotoChange} style={{ display: "none" }} />
              <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 8, ...fBody }}>Tap to change your profile photo</div>
            </div>
          </FormSection>

          <FormSection icon={User} label="Identity" hint="Your legal name stays private until a booking is confirmed.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Full name" placeholder="Sarah Lin" icon={User} value={editDraft.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} required />
              <HandleField
                value={editDraft.handle}
                onChange={(v) => { setHandleEdited(true); setEditDraft((d) => ({ ...d, handle: v })); }}
                isTaken={isHandleTaken(editDraft.handle)}
                showStatus={handleEdited && editDraft.handle.trim() !== String(clientIdentity.handle || "").trim()}
                required
              />
            </div>
          </FormSection>

          <FormSection icon={MapPin} label="Location" hint="Only used to find coaches nearby - never shown to them.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Address" placeholder="Enter your address" icon={MapPin} value={editDraft.address} onChange={(e) => setEditDraft((d) => ({ ...d, address: e.target.value }))} />
              <LocationField
                value={editDraft.location}
                onChange={(loc) => setEditDraft((d) => ({ ...d, location: loc }))}
                label="Suburb & postcode"
                placeholder="Search suburb or postcode…"
              />
            </div>
          </FormSection>

          <FormSection icon={Sparkles} label="Your sport" hint="What you're into and what you'd like to work on.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Sports you're into</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {POPULAR_SPORTS.slice(0, 10).map((s) => (
                    <SportBadge key={s} sport={s} selected={editDraft.sports.includes(s)} onClick={() => toggleEditSport(s)} compact />
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <SportSearchMultiSelect options={SPORT_NAMES} value={editDraft.sports} onChange={setEditSports} placeholder="Search all sports…" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 7, ...fBody }}>Experience by sport</div>
                <SportSkillLevelPicker
                  sports={editDraft.sports}
                  value={editDraft.sportLevels}
                  onChange={(sportLevels) => setEditDraft((draft) => ({ ...draft, sportLevels }))}
                />
              </div>
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Coaching goals</div>
                <div className="cl-input" style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
                  <Target size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
                  <textarea
                    value={editDraft.goals}
                    onChange={(e) => setEditDraft((d) => ({ ...d, goals: e.target.value }))}
                    placeholder="e.g. build confidence for club trials, improve fitness, learn the basics…"
                    rows={3}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, resize: "none", ...fBody }}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection icon={Stethoscope} label="Medical information (optional)" hint="Anything a coach should know to keep sessions safe.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Medical conditions" placeholder="e.g. asthma" icon={Stethoscope} value={editDraft.medicalConditions} onChange={(e) => setEditDraft((d) => ({ ...d, medicalConditions: e.target.value }))} />
              <Field label="Allergies" placeholder="e.g. bee stings, peanuts" icon={AlertTriangle} value={editDraft.allergies} onChange={(e) => setEditDraft((d) => ({ ...d, allergies: e.target.value }))} />
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Additional notes</div>
                <textarea
                  value={editDraft.medicalNotes}
                  onChange={(e) => setEditDraft((d) => ({ ...d, medicalNotes: e.target.value }))}
                  placeholder="Anything else a coach should know"
                  rows={2}
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", resize: "none", background: C.white, color: C.jet, ...fBody }}
                />
              </div>
            </div>
          </FormSection>

          <FormSection icon={Phone} label="Emergency contact (optional)" hint="Who coaches can reach if they can't get hold of you.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Contact name" placeholder="e.g. Mia Chen" icon={UserCheck} value={editDraft.emergencyName} onChange={(e) => setEditDraft((d) => ({ ...d, emergencyName: e.target.value }))} />
              <Field label="Relationship" placeholder="e.g. Partner" value={editDraft.emergencyRelationship} onChange={(e) => setEditDraft((d) => ({ ...d, emergencyRelationship: e.target.value }))} />
              <Field label="Mobile number" placeholder="04XX XXX XXX" icon={Phone} type="tel" value={editDraft.emergencyMobile} onChange={(e) => setEditDraft((d) => ({ ...d, emergencyMobile: e.target.value.replace(/[^0-9+\s]/g, "") }))} />
            </div>
          </FormSection>

            <Btn full onClick={saveProfile}>Save changes</Btn>
          </>
        )}
      </BottomSheet>

      <AccountDetailsSheet
        open={sheet === "accountDetails"}
        onClose={closeSheet}
        details={{ name: profile.name, username: clientIdentity.handle || "", email: profile.email, phone: profile.phone }}
        onSave={saveAccountDetails}
        isHandleTaken={isHandleTaken}
        toast={toast}
        accountLabel="client account"
      />

{/* Notification preferences */}
      <BottomSheet open={sheet === "notif"} onClose={closeSheet} title="Notification preferences" heightPct={84}>
        <SettingsGroup title="Channels">
          <SettingsRow icon={Bell} label="Push notifications" sub="Alerts on this device" right={<Toggle label="Push notifications" on={notifPrefs.push} onClick={() => toggleNotif("push")} />} />
          <SettingsRow icon={Mail} label="Email notifications" sub="Receipts, confirmations & digests" right={<Toggle label="Email notifications" on={notifPrefs.email} onClick={() => toggleNotif("email")} />} />
          <SettingsRow icon={Phone} label="SMS notifications" sub="Urgent day-of updates" right={<Toggle label="SMS notifications" on={notifPrefs.sms} onClick={() => toggleNotif("sms")} />} />
          <SettingsRow icon={MessageCircle} label="WhatsApp notifications" sub="Urgent day-of updates" right={<Toggle label="WhatsApp notifications" on={notifPrefs.whatsapp} onClick={() => toggleNotif("whatsapp")} />} />
        </SettingsGroup>
        <div style={{ fontSize: T.captionLg, color: C.slateLight, margin: "-14px 0 24px", lineHeight: 1.5, ...fBody }}>
          Payment receipts and booking confirmations are always sent by email.
        </div>
        <SettingsGroup title="Updates">
          <SettingsRow icon={CalendarDays} label="Booking reminders" sub="Reminders before your sessions" right={<Toggle label="Booking reminders" on={notifPrefs.bookingReminders} onClick={() => toggleNotif("bookingReminders")} />} />
          <SettingsRow icon={MessageCircle} label="Messages" sub="New messages from coaches" right={<Toggle label="Messages" on={notifPrefs.messages} onClick={() => toggleNotif("messages")} />} />
          <SettingsRow icon={Sparkles} label="Promotions & offers" sub="Deals and product news" right={<Toggle label="Promotions & offers" on={notifPrefs.promos} onClick={() => toggleNotif("promos")} />} />
        </SettingsGroup>
        <div style={{ marginTop: 8 }}>
          <Btn full onClick={() => { toast("Notification preferences saved"); closeSheet(); }}>Save preferences</Btn>
        </div>
      </BottomSheet>

      {/* Payment methods */}
      <BottomSheet open={sheet === "payment"} onClose={closeSheet} title="Payment methods" heightPct={70}>
        <SettingsGroup>
          {cards.map((card) => (
            <SettingsRow
              key={card.id}
              icon={CardIcon}
              label={`${card.brand} •••• ${card.last4}`}
              sub={`Expires ${card.exp}${card.isDefault ? " · Default" : ""}`}
              right={(
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {!card.isDefault && (
                    <button onClick={() => makeDefault(card.id)} style={{ background: "none", border: "none", color: C.brand, fontSize: T.label, fontWeight: 600, cursor: "pointer", flexShrink: 0, ...fBody }}>Set default</button>
                  )}
                  <button onClick={() => setRemovalTarget({ type: "card", id: card.id, name: `${card.brand} ending in ${card.last4}` })} aria-label={`Remove ${card.brand} ending in ${card.last4}`} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4, flexShrink: 0 }}>
                    <Trash2 size={15} color={C.slateLight} />
                  </button>
                </div>
              )}
            />
          ))}
        </SettingsGroup>
        <div style={{ marginTop: 16 }}>
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
            required
          />
          <Field
            label="Name on card"
            placeholder="Sarah Lin"
            icon={User}
            value={cardDraft.name}
            onChange={(e) => setCardDraft((d) => ({ ...d, name: e.target.value }))}
            required
          />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field
                label="Expiry"
                placeholder="MM/YY"
                icon={CalendarDays}
                value={cardDraft.expiry}
                onChange={(e) => setCardDraft((d) => ({ ...d, expiry: e.target.value.replace(/[^\d/]/g, "") }))}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Field
                label="CVC"
                placeholder="123"
                icon={Lock}
                value={cardDraft.cvc}
                onChange={(e) => setCardDraft((d) => ({ ...d, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                required
              />
            </div>
          </div>
        </div>
        <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 14, lineHeight: 1.5, ...fBody }}>
          Payments are processed by our PCI-compliant payment partner - CoachNivo never stores your full card number.
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full disabled={!canSaveCard} onClick={saveCard}>Save card</Btn>
        </div>
      </BottomSheet>

      {/* Change password */}
      <BottomSheet open={sheet === "password"} onClose={closeSheet} title="Change password" heightPct={62}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Current password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((v) => !v)} required />
          <div>
            <Field label="New password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
            <PasswordRequirements password={newPw} style={{ marginTop: 8 }} />
          </div>
          <Field label="Confirm new password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full disabled={!pwdOk} onClick={() => { toast("Password updated"); setNewPw(""); setConfirmPw(""); closeSheet(); }}>Update password</Btn>
        </div>
      </BottomSheet>

      {/* Privacy policy */}
      <BottomSheet open={sheet === "privacy"} onClose={closeSheet} title="Privacy policy" heightPct={75}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody }}>
          <p style={{ marginBottom: 12 }}>CoachNivo collects only the information needed to connect you with coaches and manage your bookings, such as your profile details, session history, and payment information.</p>
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
          <Btn full variant="dark" icon={LogOut} onClick={() => { closeSheet(); resetNav("splash", {}, "client"); }}>Log out</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>

      {/* Secure account deactivation */}
      <BottomSheet open={sheet === "deactivate"} onClose={closeDeactivate} title={deactivateStep === "confirm" ? "Deactivate account" : "Verify deactivation"} heightPct={deactivateStep === "confirm" ? 52 : 68}>
        {deactivateStep === "confirm" ? (
          <>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.dangerTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <AlertTriangle size={23} color={C.danger} />
            </div>
            <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginBottom: 7, ...fDisplay }}>Take a break from CoachNivo?</div>
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>
              Your profile will be hidden and upcoming bookings will be cancelled. You can restore your account by signing in again within 30 days.
            </div>
            <Card style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18, background: C.fog }}>
              <Mail size={17} color={C.slate} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Email verification required</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>We’ll send a six-digit code to {profile.email || "your registered email"} before deactivating.</div>
              </div>
            </Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn full variant="danger" icon={Mail} onClick={sendDeactivationCode}>Send verification code</Btn>
              <Btn full variant="secondary" onClick={closeDeactivate}>Keep my account</Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Mail size={22} color={C.brand} />
            </div>
            <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Check your email</div>
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 6, marginBottom: 18, ...fBody }}>
              Enter the six-digit code sent to <span style={{ color: C.jet, fontWeight: 600 }}>{profile.email}</span>.
            </div>

            {deactivationError && (
              <div role="alert" style={{ display: "flex", gap: 8, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.dangerBorder}`, background: C.dangerTint, marginBottom: 14 }}>
                <AlertTriangle size={15} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: T.labelLg, color: C.danger, lineHeight: 1.45, ...fBody }}>That code is invalid or incomplete. Check the email or request a new code.</span>
              </div>
            )}

            <div onPaste={onDeactivationPaste} style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7 }}>
              {deactivationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { deactivationInputsRef.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Deactivation code digit ${index + 1} of 6`}
                  value={digit}
                  maxLength={1}
                  onChange={(event) => setDeactivationDigit(index, event.target.value)}
                  onKeyDown={(event) => onDeactivationKeyDown(index, event)}
                  style={{ width: "100%", height: 52, minWidth: 0, boxSizing: "border-box", borderRadius: 13, border: `1.5px solid ${deactivationError ? C.dangerBorderSoft : digit ? C.brand : C.border}`, background: C.white, color: C.jet, textAlign: "center", outline: "none", fontSize: T.heading, fontWeight: 700, ...fDisplay }}
                />
              ))}
            </div>

            <div style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
              {resendSeconds > 0 ? (
                <span style={{ fontSize: T.body, color: C.slateLight, ...fBody }}>Resend code in 0:{String(resendSeconds).padStart(2, "0")}</span>
              ) : (
                <button type="button" onClick={resendDeactivationCode} style={{ minHeight: 44, padding: "0 10px", border: "none", background: "transparent", color: C.brand, cursor: "pointer", fontSize: T.body, fontWeight: 600, ...fBody }}>Resend code</button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <Btn full variant="danger" disabled={deactivationCode.join("").length !== 6} onClick={verifyAndDeactivate}>Verify & deactivate</Btn>
              <Btn full variant="secondary" onClick={() => { setDeactivateStep("confirm"); setDeactivationError(false); }}>Back</Btn>
            </div>
          </>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!removalTarget}
        onClose={() => setRemovalTarget(null)}
        onConfirm={removalTarget?.type === "child" ? deleteChild : confirmCardRemoval}
        title={removalTarget?.type === "child" ? "Remove this child profile?" : "Remove this payment method?"}
        description={removalTarget?.type === "child"
          ? `${removalTarget?.name || "This profile"} and their saved safety details will be removed. Existing booking records will remain in your history.`
          : `${removalTarget?.name || "This card"} will no longer be available for future bookings.`}
        confirmLabel={removalTarget?.type === "child" ? "Remove profile" : "Remove card"}
        icon={Trash2}
      />

      <FullscreenImageViewer
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        src={profilePhoto}
        alt={`${profile.name} profile photo`}
      />

    </div>
  );
}

/* =========================================================================
   HISTORY — full page covering both transaction history (Payments) and a
   timeline of other completed activity (Activity), so it's a single place
   to look back on the account rather than payments-only. Tapping a payment
   row opens the lifecycle-aware release status for completed payments and
   keeps a lightweight receipt sheet for refunds or still-held funds.
   ========================================================================= */
const CLIENT_ACTIVITY_ICON = { booking: Calendar, message: MessageCircle, review: Star, availability: Sparkles, promo: Percent, payment: CreditCard, verification: ShieldCheck };

export function ScreenClientHistory({ nav, bookings = [], clientNotifications = [] }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [tab, setTab] = useState("payments");
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [activity] = useLiveNotifications(clientNotifications, CLIENT_NOTIFICATIONS);
  const paidBookings = bookings.filter((b) => [
    PAYMENT_STATUS.HELD,
    PAYMENT_STATUS.RELEASED,
    PAYMENT_STATUS.REFUND_PROCESSING,
    PAYMENT_STATUS.REFUNDED,
  ].includes(b.paymentStatus));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="History" onBack={() => nav("client-profile")} />
      <div style={{ padding: "16px 18px 0", marginBottom: 16 }}>
        <SegTabs
          items={[{ value: "payments", label: "Payments" }, { value: "activity", label: "Activity" }]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", paddingBottom: "max(28px, env(safe-area-inset-bottom))" }} className="cl-hide-scrollbar">
        {tab === "payments" && (
          <>
            {paidBookings.length === 0 && (
              <EmptyState icon={CreditCard} title="No payments yet" body="Your session receipts will show up here." />
            )}
            <div className="cl-stagger">
              {paidBookings.map((b, i) => (
                <Card key={b.id} onClick={() => b.paymentStatus === PAYMENT_STATUS.RELEASED
                  ? nav("funds-release-status", { bookingId: b.id, role: "client", backTo: "client-history" })
                  : setReceiptTarget(b)} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={(() => { const cn = getBookingCoachName(b, COACHES.find((c) => c.id === b.coachId)); return cn.name; })()} size={40} />
                  <div>
                    <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
                    <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {(() => { const cn = getBookingCoachName(b, COACHES.find((c) => c.id === b.coachId)); return cn.name; })()}</div>
                    <div style={{ marginTop: 5 }}><Badge tone={b.paymentStatus === PAYMENT_STATUS.RELEASED ? "success" : "orange"}>{b.paymentStatus === PAYMENT_STATUS.RELEASED ? "Payment released" : b.paymentStatus === PAYMENT_STATUS.HELD ? "Securely held" : "Refund update"}</Badge></div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: T.subtitle, fontWeight: 700, color: b.status === "cancelled" ? C.slateLight : C.jet, ...fDisplay }}>${Number(b.paidTotal || b.price || 0).toFixed(2)}</div>
                  <ChevronRight size={16} color={C.slateLight} />
                </div>
              </Card>
            ))}
            </div>
          </>
        )}

        {tab === "activity" && (
          <>
            {activity.length === 0 && (
              <EmptyState icon={HistoryIcon} title="No activity yet" body="Booking updates, payments and other account activity will show up here." />
            )}
            <div className="cl-stagger">
            {activity.map((n, i) => {
              const Icon = CLIENT_ACTIVITY_ICON[n.type] || HistoryIcon;
              return (
                <Card key={n.id} style={{ marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start", animationDelay: `${Math.min(i, 8) * 45}ms` }}>
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
            </div>
          </>
        )}
      </div>

      <ReceiptSheet booking={receiptTarget} onClose={() => setReceiptTarget(null)} />
    </div>
  );
}
