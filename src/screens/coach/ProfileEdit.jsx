import React, { useEffect, useState, useRef } from "react";
import {
  Camera, Edit3, Eye, EyeOff, Fingerprint, Lock, Shield, HelpCircle,
  LogOut, ChevronRight, Trash2, Plus, User,
  Banknote, CalendarClock, Zap, Hand, Bell, MapPin, Film, Play, Image as ImageIcon,
  Share2, Award, X, Navigation, Star, Mail, AlertTriangle,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { COACHES, LANGUAGE_OPTIONS, GENDER_OPTIONS, AU_SUBURBS, SPORTS, SPORT_ICON, REVIEWS } from "../../data/mockData";
import {
  Avatar, SectionLabel, Chip, Card, Toggle, Btn, BottomSheet, ConfirmDialog, Field,
  SearchMultiSelect, SearchSelect, ScrollFadeRow, SegTabs, StarRow, FullscreenImageViewer,
} from "../../components/ui/Primitives";
import { CoachProfileHero, CoachProfileAbout } from "../../components/ui/CoachProfileSections";
import { HandleField } from "../../components/ui/PublicIdentityFields";
import { isValidHandle, getPublicName } from "../../utils/name";
import { formatCoachLocation } from "../../utils/coachProfile";
import { useApp } from "../../context/AppContext";
import { CONFIG } from "../../config";

const LOCATION_OPTIONS = AU_SUBURBS.map((s) => `${s.suburb}, ${s.state}`);

function Row2({ icon: Icon, label, sub, onClick, right, danger }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        width: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 12, padding: "13px 4px",
        background: "none", border: "none", borderBottom: `1px solid ${C.border}`,
        cursor: onClick ? "pointer" : "default", textAlign: "left",
      }}
    >
      <Icon size={17} color={danger ? C.danger : C.jet} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: T.bodyLg, color: danger ? C.danger : C.jet, fontWeight: 500, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>{sub}</div>}
      </div>
      {right !== undefined ? right : (onClick ? <ChevronRight size={16} color={C.slateLight} /> : null)}
    </Component>
  );
}

function OptionCard({ icon: Icon, title, desc, selected, onClick }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
        padding: 14, borderRadius: 16, marginBottom: 10, cursor: "pointer",
        border: `1.5px solid ${selected ? C.brand : C.border}`,
        background: selected ? C.brandTint : C.white,
        transition: "border-color .15s ease, background .15s ease",
      }}
    >
      {Icon && (
        <div style={{ width: 36, height: 36, borderRadius: 12, background: selected ? C.white : C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={selected ? C.brand : C.slate} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{title}</div>
        {desc && <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, lineHeight: 1.45, ...fBody }}>{desc}</div>}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 99, flexShrink: 0,
        border: `1.5px solid ${selected ? C.brand : C.border}`, background: C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: 99, background: C.brand }} />}
      </div>
    </button>
  );
}

export function ScreenCoachProfileEdit({ nav, resetNav, toast, coachPackages, savePackage, removePackage, biometric, setBiometric, coachMedia = [], coachAvailableNow, setCoachAvailableNow }) {
  const { darkMode, coachOnboarding, coachProfile, coachBookingType, setCoachBookingType, updateCoachOnboarding, isHandleTaken } = useApp();
  const C = darkMode ? CD : CL;
  const coach = coachProfile;

  // Specialties — surface onboarding expertise (categories, skill levels,
  // age groups, formats) when the coach filled it in, otherwise the
  // directory tags seeded for this coach.
  const expertiseBits = [
    ...(coachOnboarding.coachingCategories || []),
    ...(coachOnboarding.skillLevels || []),
    ...(coachOnboarding.ageGroups || []),
    ...(coachOnboarding.coachingFormats || []),
    ...(coachOnboarding.secondarySports || []),
  ];
  const specialties = expertiseBits.length > 0 ? [...new Set(expertiseBits)].slice(0, 8) : coach.tags;

  const [profile, setProfile] = useState({
    photo: coachOnboarding.photo || coach.avatar,
    coverPhoto: coachOnboarding.coverPhoto || coachMedia.find((item) => item.type === "photo")?.url || "",
    name: coachOnboarding.name || coach.name,
    handle: coachOnboarding.handle || coach.handle,
    namePrivacy: coachOnboarding.namePrivacy || coach.namePrivacy,
    bio: coachOnboarding.bio ?? coach.bio,
    yearsExperience: coachOnboarding.yearsExperience ?? (coach.experience.match(/\d+/) || [""])[0],
    gender: coachOnboarding.gender || "",
    languages: Array.isArray(coachOnboarding.languages) ? coachOnboarding.languages : ["English"],
    sports: Array.isArray(coachOnboarding.sports) && coachOnboarding.sports.length
      ? coachOnboarding.sports
      : (Array.isArray(coachOnboarding.primarySports) && coachOnboarding.primarySports.length
        ? [...coachOnboarding.primarySports, ...(coachOnboarding.secondarySports || [])]
        : [coach.sport]),
    location: formatCoachLocation(coachOnboarding.location, coach.suburb),
    venue: coachOnboarding.venue ?? coach.venue,
    travelRadiusKm: coachOnboarding.travelRadiusKm ?? coach.travelRadiusKm,
    willingToTravel: coachOnboarding.willingToTravel ?? coach.willingToTravel,
    accreditations: Array.isArray(coachOnboarding.accreditations) ? [...coachOnboarding.accreditations] : [...coach.accreditations],
  });
  const [draft, setDraft] = useState(null);
  const [handleEdited, setHandleEdited] = useState(false);
  const [draftAccreditation, setDraftAccreditation] = useState("");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const openEditProfile = () => { setHandleEdited(false); setDraftAccreditation(""); setDraft({ ...profile, accreditations: [...(profile.accreditations || [])] }); setSheet("edit"); };
  const setDraftField = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setDraftField({ photo: URL.createObjectURL(file) });
    e.target.value = "";
  };
  const onCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setDraftField({ coverPhoto: URL.createObjectURL(file) });
    e.target.value = "";
  };
  const addDraftAccreditation = () => {
    const v = draftAccreditation.trim();
    if (!v) return;
    setDraftField({ accreditations: [...(draft.accreditations || []), v] });
    setDraftAccreditation("");
  };
  const removeDraftAccreditation = (i) => setDraftField({ accreditations: draft.accreditations.filter((_, idx) => idx !== i) });
  const saveProfile = () => {
    if (!draft.name.trim()) { toast("Add your name first"); return; }
    if (!isValidHandle(draft.handle)) { toast("Pick a valid username — 3–24 characters"); return; }
    if (isHandleTaken(draft.handle, [coach.handle, profile.handle])) { toast("That username's taken — try another"); return; }
    if (!draft.sports || draft.sports.length === 0) { toast("Pick at least one sport you coach"); return; }
    setProfile(draft);
    updateCoachOnboarding?.({
      name: draft.name,
      handle: draft.handle,
      namePrivacy: draft.namePrivacy,
      photo: draft.photo,
      coverPhoto: draft.coverPhoto,
      bio: draft.bio,
      yearsExperience: draft.yearsExperience,
      gender: draft.gender,
      languages: draft.languages,
      sports: draft.sports,
      primarySports: draft.sports.slice(0, 1),
      secondarySports: draft.sports.slice(1),
      location: draft.location,
      venue: draft.venue,
      travelRadiusKm: draft.travelRadiusKm,
      willingToTravel: draft.willingToTravel,
      accreditations: draft.accreditations,
    });
    toast("Profile changes saved and published");
    setDraft(null);
    setSheet(null);
  };

  const bookingType = coachBookingType || (coach.instantBook ? "instant" : "request");
  const setBookingType = (value) => {
    setCoachBookingType(value);
    updateCoachOnboarding?.({ bookingType: value, instantBook: value === "instant" });
  };
  const toggleActive = (pkg) => {
    const nowActive = !(pkg.active !== false);
    savePackage({ ...pkg, active: nowActive });
    toast(nowActive ? `${pkg.name} enabled` : `${pkg.name} paused — hidden from clients`);
  };

  const [notifPrefs, setNotifPrefs] = useState({
    push: true, email: true, sms: false, whatsapp: false,
    bookingRequests: true, bookingConfirmations: true, messages: true, paymentUpdates: true,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  const NotifRow = ({ label, sub, prefKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>{sub}</div>}
      </div>
      <Toggle label={label} on={notifPrefs[prefKey]} onClick={() => toggleNotif(prefKey)} />
    </div>
  );

  const [sheet, setSheet] = useState(null);
  const closeSheet = () => setSheet(null);
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState("profile");
  const [deleteStep, setDeleteStep] = useState("confirm");
  const [deleteCode, setDeleteCode] = useState(["", "", "", "", "", ""]);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteResendSeconds, setDeleteResendSeconds] = useState(0);
  const deleteInputsRef = useRef([]);
  const coachEmail = coachOnboarding.email || "noah.kelly@email.com";

  useEffect(() => {
    if (deleteResendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setDeleteResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [deleteResendSeconds]);

  const resetDeleteFlow = () => {
    setDeleteStep("confirm");
    setDeleteCode(["", "", "", "", "", ""]);
    setDeleteError(false);
    setDeleteResendSeconds(0);
  };
  const openDeleteFlow = () => {
    resetDeleteFlow();
    setSheet("delete");
  };
  const closeDeleteFlow = () => {
    setSheet(null);
    resetDeleteFlow();
  };
  const sendDeleteCode = () => {
    if (!coachEmail) {
      toast("Add an email before deleting your account");
      return;
    }
    setDeleteStep("verify");
    setDeleteCode(["", "", "", "", "", ""]);
    setDeleteError(false);
    setDeleteResendSeconds(30);
    toast("Verification code sent");
    window.setTimeout(() => deleteInputsRef.current[0]?.focus(), 120);
  };
  const setDeleteDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDeleteCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    setDeleteError(false);
    if (digit && index < 5) deleteInputsRef.current[index + 1]?.focus();
  };
  const onDeleteKeyDown = (index, event) => {
    if (event.key === "Backspace" && !deleteCode[index] && index > 0) deleteInputsRef.current[index - 1]?.focus();
  };
  const onDeletePaste = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    event.preventDefault();
    setDeleteCode(Array.from({ length: 6 }, (_, index) => digits[index] || ""));
    setDeleteError(false);
    deleteInputsRef.current[Math.min(digits.length, 6) - 1]?.focus();
  };
  const verifyAndDelete = () => {
    const code = deleteCode.join("");
    if (code.length !== 6 || code === "000000") {
      setDeleteError(true);
      return;
    }
    closeDeleteFlow();
    toast("Coach account deleted securely");
    resetNav("splash", {}, "client");
  };
  const resendDeleteCode = () => {
    setDeleteCode(["", "", "", "", "", ""]);
    setDeleteError(false);
    setDeleteResendSeconds(30);
    toast("New verification code sent");
    deleteInputsRef.current[0]?.focus();
  };

  const pubMe = getPublicName({ name: profile.name, handle: profile.handle, namePrivacy: profile.namePrivacy }, "public");
  const heroPhoto = profile.coverPhoto || coachMedia.find((m) => m.type === "photo")?.url;
  const aboutData = {
    bio: profile.bio,
    experience: profile.yearsExperience ? `${profile.yearsExperience} yrs coaching` : coach.experience,
    languages: profile.languages,
    specialties,
    suburb: profile.location,
    venue: profile.venue,
    travelRadiusKm: profile.travelRadiusKm,
    willingToTravel: profile.willingToTravel,
    accreditations: profile.accreditations,
  };
  const handleShare = () => toast("Profile link ready to share");
  const reviewAvg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, marginBottom: 18, ...fDisplay }}>My coaching profile</div>

        <div style={{ marginBottom: 6 }}>
          <SegTabs
            items={[
              { value: "profile", label: "Profile" },
              { value: "business", label: "Business" },
              { value: "settings", label: "Settings" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 0", paddingBottom: 116 }} className="cl-hide-scrollbar">
        {tab === "profile" && (
        <>
        <CoachProfileHero
          coach={coach}
          pub={pubMe}
          heroImage={heroPhoto}
          avatarSrc={profile.photo}
          sport={profile.sports[0]}
          sports={profile.sports}
          suburb={profile.location}
          instantBook={bookingType === "instant"}
          coverHeight={188}
          inset={0}
          onAvatarClick={() => setAvatarOpen(true)}
          overlay={
            <button type="button" aria-label="Share coach profile" onClick={handleShare} style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", width: 44, height: 44, borderRadius: 99, background: CL.jetSoft, opacity: 0.94, border: `1px solid ${CL.onDarkDivider}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,.18)" }}>
              <Share2 size={18} color={CL.white} />
            </button>
          }
        />

        {/* Available for bookings toggle */}
        <Card style={{
          margin: "16px 0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: coachAvailableNow ? C.white : C.dangerTint,
          border: `1.5px solid ${coachAvailableNow ? C.border : C.dangerBorder}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: coachAvailableNow ? C.successTint : C.dangerTint,
              border: coachAvailableNow ? "none" : `1px solid ${C.dangerBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: coachAvailableNow ? C.success : C.danger }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>
                {coachAvailableNow ? "Available for bookings" : "Unavailable for bookings"}
              </div>
              <div style={{ fontSize: T.caption, color: coachAvailableNow ? C.slateLight : C.danger, ...fBody }}>
                {coachAvailableNow ? "Clients can send new requests" : "Your profile shows as unavailable — clients can't book you"}
              </div>
            </div>
          </div>
          <Toggle
            label="Available for bookings"
            on={coachAvailableNow}
            onClick={() => {
              const next = !coachAvailableNow;
              setCoachAvailableNow(next);
              toast(next ? "You're now available for bookings" : "You're now marked unavailable");
            }}
          />
        </Card>

        <div style={{ display: "flex", gap: 8, margin: "16px 0 22px" }}>
          <div style={{ flex: 1 }}>
            <Btn full variant="secondary" size="sm" icon={Edit3} onClick={openEditProfile}>Edit profile</Btn>
          </div>
        </div>

        <CoachProfileAbout coach={coach} data={aboutData} showCancellationPolicy={false} />

        <SectionLabel>Reels & photos</SectionLabel>
        {coachMedia.length === 0 ? (
          <div style={{ fontSize: T.labelLg, color: C.slateLight, marginBottom: 22, ...fBody }}>
            No reels or photos yet — add some so athletes can see you coach.
          </div>
        ) : (
          <div className="cl-hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
            {coachMedia.slice(0, 6).map((item) => {
              const isReel = item.type === "reel";
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Manage ${item.caption || "media"}`}
                  onClick={() => nav("coach-reels")}
                  style={{ width: 76, minWidth: 76, minHeight: 0, aspectRatio: "3 / 4", padding: 0, overflow: "hidden", borderRadius: 14, flexShrink: 0, cursor: "pointer", background: C.fog, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
                >
                  {item.url ? (
                    isReel
                      ? <video src={item.url} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: 99, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isReel ? <Play size={11} color={C.white} fill={C.white} /> : <ImageIcon size={12} color={C.white} />}
                    </div>
                  )}
                  {item.url && isReel && (
                    <div style={{ position: "absolute", bottom: 6, left: 6, width: 22, height: 22, borderRadius: 99, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Play size={9} color={C.white} fill={C.white} />
                    </div>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => nav("coach-reels")}
              style={{
                width: 76, aspectRatio: "3/4", borderRadius: 14, flexShrink: 0, cursor: "pointer",
                background: C.fog, border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4,
              }}
            >
              <ChevronRight size={14} color={C.slate} />
              <span style={{ fontSize: T.tiny, fontWeight: 600, color: C.slate, ...fBody }}>See all {coachMedia.length}</span>
            </button>
          </div>
        )}
        <div style={{ marginBottom: 4 }}>
          <Btn full variant="outline" size="sm" icon={Film} onClick={() => nav("coach-reels")}>Manage reels & photos</Btn>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Reviews</SectionLabel>
          <Card style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: T.hero, fontWeight: 700, color: C.jet, ...fDisplay }}>{reviewAvg}</div>
              <StarRow value={parseFloat(reviewAvg)} size={11} />
              <div style={{ fontSize: T.micro, color: C.slateLight, marginTop: 3, ...fBody }}>{REVIEWS.length} reviews</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Athletes rate you {reviewAvg} / 5</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 3, lineHeight: 1.5, ...fBody }}>
                Every review comes from a verified booking. Replying publicly helps build trust.
              </div>
            </div>
          </Card>
          <Btn full variant="outline" size="sm" icon={Star} onClick={() => nav("coach-reviews")}>Manage reviews</Btn>
        </div>
        </>
        )}

        {tab === "business" && (
        <>
        <SectionLabel>Service packages</SectionLabel>
        {coachPackages.length === 0 && (
          <div style={{ fontSize: T.labelLg, color: C.slateLight, marginBottom: 10, ...fBody }}>No packages yet — add your first service below.</div>
        )}
        {coachPackages.map((p) => {
          const isActive = p.active !== false;
          return (
            <Card
              key={p.id}
              onClick={() => nav("coach-edit-package", { id: p.id })}
              style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>${p.price}</span>
                  <span style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{p.sport || coach.sport}</span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                <Toggle label={`${p.name} active`} on={isActive} onClick={() => toggleActive(p)} />
              </div>
            </Card>
          );
        })}
        <div style={{ marginBottom: 22 }}>
          <Btn variant="outline" size="sm" icon={Plus} full onClick={() => nav("coach-create-package")}>Add service package</Btn>
        </div>

        <Row2 icon={Banknote} label="Earnings & payouts" sub="Transactions and payout method" onClick={() => nav("coach-earnings")} />

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Booking preferences</SectionLabel>
          <div style={{ fontSize: T.label, color: C.slate, marginTop: -6, marginBottom: 12, lineHeight: 1.5, ...fBody }}>
            Choose how athletes are able to book your services.
          </div>
          <div role="radiogroup" aria-label="Booking preference">
            <OptionCard
              icon={Zap}
              title="Instant book"
              desc="Sessions are auto-confirmed the moment an athlete books — no approval needed."
              selected={bookingType === "instant"}
              onClick={() => { setBookingType("instant"); toast("Instant book enabled"); }}
            />
            <OptionCard
              icon={Hand}
              title="Request to book"
              desc="Athletes send a request first; you review and approve each one."
              selected={bookingType === "request"}
              onClick={() => { setBookingType("request"); toast("Request to book enabled"); }}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <SectionLabel>Cancellation policy</SectionLabel>
            <Card style={{ marginBottom: 12, background: C.brandTint }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Shield size={16} color={C.brand} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>One policy for every coach</div>
                  <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 3, lineHeight: 1.5, ...fBody }}>{CONFIG.cancellationPolicy}</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 4, ...fBody }}>This standard CoachLink policy applies to all bookings and can't be changed per coach.</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </>
        )}

        {tab === "settings" && (
        <>
        <SectionLabel>Notifications</SectionLabel>
        <Row2 icon={Bell} label="Notification preferences" sub="Bookings, messages & payment alerts" onClick={() => setSheet("notif")} />

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Security</SectionLabel>
          <Row2 icon={Fingerprint} label="Biometric login" right={<Toggle label="Biometric login" on={biometric} onClick={() => setBiometric((v) => !v)} />} />
          <Row2 icon={Lock} label="Change password" onClick={() => setSheet("password")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Privacy & support</SectionLabel>
          <Row2 icon={Shield} label="Privacy policy" onClick={() => setSheet("privacy")} />
          <Row2 icon={HelpCircle} label="Support centre" onClick={() => nav("support")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Account management</SectionLabel>
          <Row2 icon={LogOut} label="Sign out" onClick={() => setSheet("signout")} />
          <Row2 icon={Trash2} label="Delete account" danger onClick={openDeleteFlow} />
        </div>
        </>
        )}
      </div>

      <BottomSheet open={sheet === "edit"} onClose={() => { setSheet(null); setDraft(null); }} title="Edit profile" heightPct={90}>
        {draft && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 7, ...fBody }}>Cover photo</div>
              <button
                type="button"
                aria-label="Change cover photo"
                onClick={() => coverInputRef.current?.click()}
                style={{ width: "100%", height: 132, padding: 0, position: "relative", overflow: "hidden", borderRadius: 18, border: `1px solid ${C.border}`, background: C.fog, cursor: "pointer", display: "block" }}
              >
                {draft.coverPhoto ? (
                  <img src={draft.coverPhoto} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon size={24} color={C.slateLight} />
                  </span>
                )}
                <span style={{ position: "absolute", right: 10, bottom: 10, minHeight: 36, padding: "0 12px", borderRadius: 12, background: C.jet, color: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: T.labelLg, fontWeight: 600, boxShadow: "0 4px 12px rgba(22,24,29,.18)", ...fBody }}>
                  <Camera size={14} /> Change cover
                </span>
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={onCoverChange} style={{ display: "none" }} />
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.45, marginTop: 7, ...fBody }}>Use a wide coaching or training photo for the best profile preview.</div>
              {coachMedia.some((item) => item.type === "photo") && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }} className="cl-hide-scrollbar">
                  {coachMedia.filter((item) => item.type === "photo").map((item) => {
                    const selected = draft.coverPhoto === item.url;
                    return (
                      <button key={item.id} type="button" aria-label={`Use ${item.caption || "media photo"} as cover`} aria-pressed={selected} onClick={() => setDraftField({ coverPhoto: item.url })} style={{ width: 64, height: 48, padding: 2, borderRadius: 12, border: `1.5px solid ${selected ? C.brand : C.border}`, background: selected ? C.brandTint : C.white, flexShrink: 0, cursor: "pointer" }}>
                        <img src={item.url} alt="" style={{ width: "100%", height: "100%", borderRadius: 9, objectFit: "cover", display: "block" }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
              <div style={{ position: "relative", width: 76, height: 76 }}>
                {draft.photo ? (
                  <img src={draft.photo} alt="Profile" style={{ width: 76, height: 76, borderRadius: 76, objectFit: "cover", display: "block" }} />
                ) : (
                  <Avatar name={draft.name || "You"} src={coach.avatar} size={76} />
                )}
                <button type="button" aria-label="Change profile photo" onClick={() => photoInputRef.current?.click()} style={{ position: "absolute", bottom: -10, right: -10, width: 44, height: 44, padding: 0, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: C.brand, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(22,24,29,.16)" }}><Camera size={13} color={C.white} /></span>
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
              <button type="button" onClick={() => photoInputRef.current?.click()} style={{ minHeight: 44, marginTop: 5, padding: "0 10px", border: "none", background: "transparent", color: C.brand, cursor: "pointer", fontSize: T.labelLg, fontWeight: 600, ...fBody }}>Change photo</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionLabel>Basics</SectionLabel>
              <Field label="Full name" placeholder="How athletes will see you" icon={User} value={draft.name} onChange={(e) => setDraftField({ name: e.target.value })} />
              <HandleField value={draft.handle} onChange={(v) => { setHandleEdited(true); setDraftField({ handle: v }); }} isTaken={isHandleTaken(draft.handle, [coach.handle, profile.handle])} showStatus={handleEdited && draft.handle.trim() !== String(profile.handle || "").trim()} />

              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Bio</div>
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraftField({ bio: e.target.value })}
                  rows={4}
                  placeholder="Tell athletes about your coaching background, philosophy and what to expect"
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, resize: "none", outline: "none", boxSizing: "border-box", background: C.white, color: C.jet, ...fBody }}
                />
              </div>

              <Field label="Years of coaching experience" placeholder="e.g. 6" icon={CalendarClock} value={draft.yearsExperience} onChange={(e) => setDraftField({ yearsExperience: e.target.value.replace(/[^0-9]/g, "") })} />

              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Gender (optional)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[...GENDER_OPTIONS, "Prefer not to say"].map((g) => (
                    <Chip key={g} active={draft.gender === g} onClick={() => setDraftField({ gender: draft.gender === g ? "" : g })}>{g}</Chip>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
              <SectionLabel>Profile details</SectionLabel>
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Sports</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SPORTS.map((s) => {
                    const active = draft.sports.includes(s);
                    return (
                      <Chip
                        key={s}
                        active={active}
                        icon={SPORT_ICON[s]}
                        onClick={() => setDraftField({ sports: active ? draft.sports.filter((x) => x !== s) : [...draft.sports, s] })}
                      >
                        {s}
                      </Chip>
                    );
                  })}
                </div>
                {draft.sports.length === 0 && (
                  <div style={{ fontSize: T.captionLg, color: C.danger, marginTop: 6, ...fBody }}>Pick at least one sport so athletes can find you.</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Languages</div>
                <SearchMultiSelect options={LANGUAGE_OPTIONS} value={draft.languages} onChange={(v) => setDraftField({ languages: v })} placeholder="Search languages…" />
              </div>

              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Location</div>
                <SearchSelect options={LOCATION_OPTIONS} value={draft.location} onChange={(v) => setDraftField({ location: v })} placeholder="Search suburb or city…" />
              </div>

              <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
              <SectionLabel>Venue & travel</SectionLabel>
              <Field label="Session venue" placeholder="e.g. Fremantle Fitness Box" icon={MapPin} value={draft.venue} onChange={(e) => setDraftField({ venue: e.target.value })} />
              <Field label="Travel radius (km)" placeholder="e.g. 5" icon={Navigation} value={String(draft.travelRadiusKm ?? "")} onChange={(e) => setDraftField({ travelRadiusKm: e.target.value.replace(/[^0-9]/g, "") })} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>Willing to travel to athletes</div>
                  <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Offer sessions at your athletes' location</div>
                </div>
                <Toggle label="Willing to travel to athletes" on={!!draft.willingToTravel} onClick={() => setDraftField({ willingToTravel: !draft.willingToTravel })} />
              </div>

              <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
              <SectionLabel>Accreditations</SectionLabel>
              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Certifications & accreditations</div>
                {(draft.accreditations || []).map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px", borderBottom: `1px solid ${C.border}` }}>
                    <Award size={15} color={C.success} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: T.bodyLg, color: C.jet, ...fBody }}>{a}</span>
                    <button type="button" aria-label={`Remove ${a}`} onClick={() => removeDraftAccreditation(i)} style={{ width: 32, height: 32, borderRadius: 10, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <X size={15} color={C.slateLight} />
                    </button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={draftAccreditation}
                    onChange={(e) => setDraftAccreditation(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDraftAccreditation(); } }}
                    placeholder="e.g. CrossFit Level 2 Trainer"
                    style={{ flex: 1, minWidth: 0, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "10px 13px", fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", background: C.white, color: C.jet, ...fBody }}
                  />
                  <Btn size="sm" variant="outline" icon={Plus} onClick={addDraftAccreditation}>Add</Btn>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Btn full onClick={saveProfile}>Save changes</Btn>
              </div>
            </div>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === "notif"} onClose={closeSheet} title="Notification preferences" heightPct={84}>
        <SectionLabel>Channels</SectionLabel>
        <NotifRow label="Push notifications" sub="Alerts on this device" prefKey="push" />
        <NotifRow label="Email notifications" sub="Receipts, confirmations & digests" prefKey="email" />
        <NotifRow label="SMS notifications" sub="Urgent day-of updates" prefKey="sms" />
        <NotifRow label="WhatsApp notifications" sub="Urgent day-of updates" prefKey="whatsapp" />
        <div style={{ fontSize: T.captionLg, color: C.slateLight, margin: "8px 0 16px", lineHeight: 1.5, ...fBody }}>
          Payment receipts and booking confirmations are always sent by email.
        </div>
        <SectionLabel>Updates</SectionLabel>
        <NotifRow label="Booking requests" sub="New requests waiting on your response" prefKey="bookingRequests" />
        <NotifRow label="Booking confirmations" sub="When a session is confirmed" prefKey="bookingConfirmations" />
        <NotifRow label="Messages" sub="New messages from athletes" prefKey="messages" />
        <NotifRow label="Payment updates" sub="Payouts, receipts and earnings" prefKey="paymentUpdates" />
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Notification preferences saved"); closeSheet(); }}>Save preferences</Btn>
        </div>
      </BottomSheet>

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

      <BottomSheet open={sheet === "privacy"} onClose={closeSheet} title="Privacy policy" heightPct={75}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody }}>
          <p style={{ marginBottom: 12 }}>CoachLink collects the information needed to run your coaching business on the platform, including your profile details, service packages, booking history and payout information.</p>
          <p style={{ marginBottom: 12 }}>We never sell your personal data. Your public profile is shown to prospective clients; payout and identity details are only shared with our payment and verification partners.</p>
          <p>You can request a copy of your data or ask us to delete your account at any time from this Profile tab.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full variant="secondary" onClick={closeSheet}>Close</Btn>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "signout"} onClose={closeSheet} title="Sign out" heightPct={38}>
        <div style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
          Are you sure you want to sign out of your coach account?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="dark" icon={LogOut} onClick={() => { closeSheet(); resetNav("splash", {}, "client"); }}>Sign out</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "delete"} onClose={closeDeleteFlow} title={deleteStep === "confirm" ? "Delete account" : "Verify deletion"} heightPct={deleteStep === "confirm" ? 58 : 68}>
        {deleteStep === "confirm" ? (
          <>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.dangerTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <AlertTriangle size={23} color={C.danger} />
            </div>
            <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginBottom: 7, ...fDisplay }}>Delete your coach account?</div>
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>
              Your public profile, packages and coaching history will be permanently removed. Upcoming bookings will be cancelled and clients notified. This can’t be undone.
            </div>
            <Card style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18, background: C.fog }}>
              <Mail size={17} color={C.slate} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Email verification required</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>We’ll send a six-digit code to {coachEmail} before deleting your account.</div>
              </div>
            </Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn full variant="danger" icon={Mail} onClick={sendDeleteCode}>Send verification code</Btn>
              <Btn full variant="secondary" onClick={closeDeleteFlow}>Keep my account</Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Mail size={22} color={C.brand} />
            </div>
            <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Check your email</div>
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 6, marginBottom: 18, ...fBody }}>
              Enter the six-digit code sent to <span style={{ color: C.jet, fontWeight: 600 }}>{coachEmail}</span>.
            </div>

            {deleteError && (
              <div role="alert" style={{ display: "flex", gap: 8, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.dangerBorder}`, background: C.dangerTint, marginBottom: 14 }}>
                <AlertTriangle size={15} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: T.labelLg, color: C.danger, lineHeight: 1.45, ...fBody }}>That code is invalid or incomplete. Check your email or request a new code.</span>
              </div>
            )}

            <div onPaste={onDeletePaste} style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7 }}>
              {deleteCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { deleteInputsRef.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Account deletion code digit ${index + 1} of 6`}
                  value={digit}
                  maxLength={1}
                  onChange={(event) => setDeleteDigit(index, event.target.value)}
                  onKeyDown={(event) => onDeleteKeyDown(index, event)}
                  style={{ width: "100%", height: 52, minWidth: 0, boxSizing: "border-box", borderRadius: 13, border: `1.5px solid ${deleteError ? C.dangerBorderSoft : digit ? C.brand : C.border}`, background: C.white, color: C.jet, textAlign: "center", outline: "none", fontSize: T.heading, fontWeight: 700, ...fDisplay }}
                />
              ))}
            </div>

            <div style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
              {deleteResendSeconds > 0 ? (
                <span style={{ fontSize: T.body, color: C.slateLight, ...fBody }}>Resend code in 0:{String(deleteResendSeconds).padStart(2, "0")}</span>
              ) : (
                <button type="button" onClick={resendDeleteCode} style={{ minHeight: 44, padding: "0 10px", border: "none", background: "transparent", color: C.brand, cursor: "pointer", fontSize: T.body, fontWeight: 600, ...fBody }}>Resend code</button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <Btn full variant="danger" disabled={deleteCode.join("").length !== 6} onClick={verifyAndDelete}>Verify & delete account</Btn>
              <Btn full variant="secondary" onClick={() => { setDeleteStep("confirm"); setDeleteError(false); }}>Back</Btn>
            </div>
          </>
        )}
      </BottomSheet>

      <FullscreenImageViewer open={avatarOpen} onClose={() => setAvatarOpen(false)} src={profile.photo} alt="Profile photo" />
    </div>
  );
}
