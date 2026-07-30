import React, { useState } from "react";
import {
  Home, Calendar, MessageCircle, User, ClipboardList, ShieldCheck, AlertCircle, Flag, Settings,
  WifiOff, RefreshCcw,
} from "lucide-react";

import { C, fBody, fDisplay, useFonts, KEYFRAMES } from "./theme/theme";
import {
  INITIAL_BOOKINGS, COACH_BOOKINGS, ADMIN_VERIFICATION_QUEUE, ADMIN_DISPUTES,
} from "./data/mockData";
import { LogoMark, Toast, BottomTabs, StatusBar } from "./components/ui/Primitives";

// Onboarding / auth
import {
  ScreenSplash, ScreenRoleSelect, ScreenAuth, ScreenTnc, ScreenVerification,
  ScreenVerificationPending, ScreenAdminLogin,
} from "./screens/onboarding/OnboardingScreens";

// Client
import { ScreenClientHome, ScreenSearchFilters } from "./screens/client/Discovery";
import { ScreenCoachProfile } from "./screens/client/CoachProfile";
import {
  ScreenBookingDateTime, ScreenBookingReview, ScreenPayment, ScreenBookingConfirmation,
} from "./screens/client/Booking";
import { ScreenClientDashboard, ScreenLeaveReview } from "./screens/client/Dashboard";
import { ScreenClientProfile } from "./screens/client/Account";

// Coach
import { ScreenCoachDashboard } from "./screens/coach/CoachDashboard";
import { ScreenCoachCalendar } from "./screens/coach/Calendar";
import { ScreenCoachBookings, ScreenCoachBookingDetail } from "./screens/coach/Bookings";
import { ScreenCoachProfileEdit } from "./screens/coach/ProfileEdit";
import { ScreenCoachEarnings } from "./screens/coach/Earnings";

// Shared: messaging & support
import { ScreenMessages, ScreenChatThread } from "./screens/messaging/Messaging";
import { ScreenSupport } from "./screens/support/Support";

// Admin
import { ScreenAdminHome } from "./screens/admin/Home";
import { ScreenAdminVerify, ScreenAdminVerifyDetail } from "./screens/admin/Verify";
import { ScreenAdminDisputes, ScreenAdminDisputeDetail } from "./screens/admin/Disputes";
import { ScreenAdminMod } from "./screens/admin/Moderation";
import { ScreenAdminSettings } from "./screens/admin/Settings";

/* =========================================================================
   APP SHELL — navigation, role switching, top-level state
   ========================================================================= */
const CLIENT_TABS = [
  { value: "client-home", label: "Discover", icon: Home },
  { value: "client-dashboard", label: "Bookings", icon: Calendar },
  { value: "client-messages", label: "Messages", icon: MessageCircle },
  { value: "client-profile", label: "Account", icon: User },
];
const COACH_TABS = [
  { value: "coach-dashboard", label: "Dashboard", icon: Home },
  { value: "coach-calendar", label: "Calendar", icon: Calendar },
  { value: "coach-bookings", label: "Bookings", icon: ClipboardList },
  { value: "coach-messages", label: "Messages", icon: MessageCircle },
  { value: "coach-profile-edit", label: "Profile", icon: User },
];
const ADMIN_TABS = [
  { value: "admin-home", label: "Home", icon: Home },
  { value: "admin-verify", label: "Verify", icon: ShieldCheck },
  { value: "admin-disputes", label: "Disputes", icon: AlertCircle },
  { value: "admin-mod", label: "Moderate", icon: Flag },
  { value: "admin-settings", label: "Settings", icon: Settings },
];

export default function App() {
  useFonts();
  const [role, setRole] = useState("client");
  const [screen, setScreen] = useState("splash");
  const [params, setParams] = useState({});
  const [history, setHistory] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [favorites, setFavorites] = useState(["c1"]);
  const [biometric, setBiometric] = useState(true);
  const [verified, setVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("none"); // none | pending | approved | rejected
  const [reachedDashboardAfterVerification, setReachedDashboardAfterVerification] = useState(false);
  const [offline, setOffline] = useState(false);
  const [hasCoachRole, setHasCoachRole] = useState(false);
  const [draft, setDraft] = useState(null);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [coachBookings, setCoachBookings] = useState(COACH_BOOKINGS);
  const [verificationQueue, setVerificationQueue] = useState(ADMIN_VERIFICATION_QUEUE);
  const [disputes, setDisputes] = useState(ADMIN_DISPUTES);

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2200); };
  const nav = (s, p = {}) => { setHistory((h) => [...h, screen]); setScreen(s); setParams(p); };
  const goBack = () => { setHistory((h) => { const n = [...h]; const last = n.pop(); if (last) setScreen(last); return n; }); };
  const toggleFav = (id) => setFavorites((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
  const addBooking = (d) => setBookings((b) => [{ id: "b" + (b.length + 1), coachId: d.coach.id, coachName: d.coach.name, clientName: "Sarah Lin", service: d.pkg.name, date: d.day, time: d.time, mode: d.mode, status: d.coach.instantBook ? "confirmed" : "pending", price: d.total, reviewed: false }, ...b]);

  // Called when the current (Josh Whitfield) coach profile submits verification documents.
  // Adds a live entry to the admin verification queue and marks the submission as pending.
  const submitVerification = ({ documents, worksWithMinors }) => {
    setVerificationStatus("pending");
    setVerificationQueue((q) => [
      {
        id: "v" + (q.length + 1),
        name: "Josh Whitfield",
        sport: "Strength & Conditioning",
        type: documents.map((d) => d.label).join(" + "),
        suburb: "Fitzroy, Melbourne",
        experience: "6 yrs coaching",
        documents,
        submittedByUser: true,
      },
      ...q,
    ]);
  };

  // Admin approves or rejects an applicant. If the applicant is the current user's
  // own submission, this unlocks full Coach UI access (clears the "verification
  // pending" banner and grants a verified badge on the dashboard).
  const decideVerification = (id, approve) => {
    const applicant = verificationQueue.find((v) => v.id === id);
    setVerificationQueue((q) => q.filter((v) => v.id !== id));
    if (applicant && applicant.submittedByUser) {
      setVerificationStatus(approve ? "approved" : "rejected");
      if (approve) setVerified(true);
    }
    toast(approve ? `${applicant ? applicant.name : "Coach"} approved` : `${applicant ? applicant.name : "Coach"} rejected`);
    nav("admin-verify");
  };

  const resolveDispute = (id) => setDisputes((d) => d.filter((x) => x.id !== id));

  const isDarkScreen = screen === "splash" || screen === "admin-login";
  const tabsForRole = role === "coach" ? COACH_TABS : role === "admin" ? ADMIN_TABS : CLIENT_TABS;
  const showTabs = tabsForRole.some((t) => t.value === screen);

  const screenProps = { nav, params, toast, role, favorites, toggleFav, biometric, setBiometric, verified, verificationStatus, reachedDashboardAfterVerification, setReachedDashboardAfterVerification, offline, draft, setDraft, addBooking, bookings, coachBookings, setCoachBookings, setRole, addCoachRole: () => setHasCoachRole(true), submitVerification, verificationQueue, decideVerification, disputes, resolveDispute };

  function renderScreen() {
    switch (screen) {
      case "splash": return <ScreenSplash nav={nav} />;
      case "role-select": return <ScreenRoleSelect nav={nav} setRole={setRole} />;
      case "auth": return <ScreenAuth {...screenProps} />;
      case "tnc": return <ScreenTnc {...screenProps} />;
      case "verification": return <ScreenVerification {...screenProps} />;
      case "verification-pending": return <ScreenVerificationPending {...screenProps} />;
      case "admin-login": return <ScreenAdminLogin {...screenProps} />;

      case "client-home": return <ScreenClientHome {...screenProps} />;
      case "search-filters": return <ScreenSearchFilters {...screenProps} />;
      case "coach-profile": return <ScreenCoachProfile {...screenProps} />;
      case "booking-datetime": return <ScreenBookingDateTime {...screenProps} />;
      case "booking-review": return <ScreenBookingReview {...screenProps} />;
      case "payment": return <ScreenPayment {...screenProps} />;
      case "booking-confirmation": return <ScreenBookingConfirmation {...screenProps} />;
      case "client-dashboard": return <ScreenClientDashboard {...screenProps} />;
      case "leave-review": return <ScreenLeaveReview {...screenProps} />;
      case "client-messages": return <ScreenMessages {...screenProps} />;
      case "client-profile": return <ScreenClientProfile {...screenProps} />;

      case "coach-dashboard": return <ScreenCoachDashboard {...screenProps} />;
      case "coach-calendar": return <ScreenCoachCalendar {...screenProps} />;
      case "coach-bookings": return <ScreenCoachBookings {...screenProps} />;
      case "coach-booking-detail": return <ScreenCoachBookingDetail {...screenProps} />;
      case "coach-profile-edit": return <ScreenCoachProfileEdit {...screenProps} />;
      case "coach-earnings": return <ScreenCoachEarnings {...screenProps} />;
      case "coach-messages": return <ScreenMessages {...screenProps} />;

      case "chat-thread": return <ScreenChatThread {...screenProps} />;
      case "support": return <ScreenSupport {...screenProps} />;

      case "admin-home": return <ScreenAdminHome {...screenProps} />;
      case "admin-verify": return <ScreenAdminVerify {...screenProps} />;
      case "admin-verify-detail": return <ScreenAdminVerifyDetail {...screenProps} />;
      case "admin-disputes": return <ScreenAdminDisputes {...screenProps} />;
      case "admin-dispute-detail": return <ScreenAdminDisputeDetail {...screenProps} />;
      case "admin-mod": return <ScreenAdminMod {...screenProps} />;
      case "admin-settings": return <ScreenAdminSettings {...screenProps} />;
      default: return <ScreenSplash nav={nav} />;
    }
  }

  return (
    <div style={{ minHeight: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 12px 40px", background: `radial-gradient(circle at 50% 0%, #EEEFF3 0%, ${C.fog} 60%)`, ...fBody }}>
      <style>{KEYFRAMES}</style>

      {/* Prototype controls — outside the device frame */}
      <div style={{ width: 393, maxWidth: "100%", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark size={20} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, ...fDisplay }}>CoachLink — interactive prototype</span>
        </div>
      </div>
      <div style={{ width: 393, maxWidth: "100%", background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 10, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.slateLight, fontWeight: 600, ...fBody }}>VIEW AS</span>
        {["client", "coach", "admin"].map((r) => (
          <button key={r} onClick={() => {
            setRole(r); setHistory([]);
            if (r === "coach") {
              const stillOnVerification = (verificationStatus === "pending" || verificationStatus === "approved") && !reachedDashboardAfterVerification;
              setScreen(stillOnVerification ? "verification-pending" : "coach-dashboard");
            } else {
              setScreen(r === "admin" ? "admin-login" : "client-home");
            }
          }}
            style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${role === r ? C.orange : C.border}`, background: role === r ? C.orangeTint : C.white, color: role === r ? C.orange : C.jet, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", ...fBody }}>
            {r}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setOffline((v) => !v)} title="Simulate offline"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, border: `1px solid ${offline ? C.orange : C.border}`, background: offline ? C.orangeTint : C.white, color: offline ? C.orange : C.slate, fontSize: 11.5, fontWeight: 600, cursor: "pointer", ...fBody }}>
          <WifiOff size={12} /> Offline
        </button>
        <button onClick={() => { setScreen(role === "admin" ? "admin-login" : "splash"); setHistory([]); setBookings(INITIAL_BOOKINGS); setCoachBookings(COACH_BOOKINGS); setVerified(false); setVerificationStatus("none"); setReachedDashboardAfterVerification(false); setVerificationQueue(ADMIN_VERIFICATION_QUEUE); setDisputes(ADMIN_DISPUTES); }}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.white, color: C.slate, fontSize: 11.5, fontWeight: 600, cursor: "pointer", ...fBody }}>
          <RefreshCcw size={12} /> Reset
        </button>
      </div>

      {/* Device frame — iPhone 15 */}
      <div style={{ width: 393, maxWidth: "100%", height: 852, maxHeight: "88vh", background: "linear-gradient(160deg,#3a3d45,#101114)", borderRadius: 58, padding: 14, boxShadow: "0 30px 60px -20px rgba(22,24,29,.4)", position: "relative" }}>
        <div style={{ width: "100%", height: "100%", background: isDarkScreen ? C.jet : C.white, borderRadius: 46, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,.08)" }}>
          {/* Dynamic Island */}
          <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, background: "#000", borderRadius: 20, zIndex: 100 }} />
          <StatusBar dark={isDarkScreen} />
          <div style={{ height: "calc(100% - 34px)", position: "relative" }}>
            {renderScreen()}
            <Toast toast={toastMsg} />
          </div>
          {showTabs && <BottomTabs items={tabsForRole} value={screen} onChange={(v) => { setHistory([]); setScreen(v); }} />}
        </div>
      </div>

      <div style={{ width: 393, maxWidth: "100%", marginTop: 14, fontSize: 11.5, color: C.slateLight, textAlign: "center", lineHeight: 1.6, ...fBody }}>
        High-fidelity front-end prototype with mock data — booking, payments and verification flows are simulated for demonstration.
      </div>
    </div>
  );
}
