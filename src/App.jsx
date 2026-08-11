import React, { useState } from "react";


import {
  ScreenAboutYouProfile,
} from "./screens/client/AboutYou";


import {
  Home, Calendar, MessageCircle, User, ClipboardList, ShieldCheck, AlertCircle, Flag, Settings,
  WifiOff, RefreshCcw,
} from "lucide-react";

import { C, fBody, fDisplay, useFonts, KEYFRAMES, T } from "./theme/theme";
import {
  INITIAL_BOOKINGS, COACH_BOOKINGS, ADMIN_VERIFICATION_QUEUE, ADMIN_DISPUTES,
  COACHES, INITIAL_AVAILABILITY_BLOCKS, CLIENT_NOTIFICATIONS, COACH_NOTIFICATIONS,
} from "./data/mockData";
import { LogoMark, Toast, BottomTabs, StatusBar } from "./components/ui/Primitives";
import { useUserLocation } from "./systems/StateSystem";

// Onboarding / auth
import {
  ScreenSplash, ScreenGetStarted, ScreenRoleSelect, ScreenAuth, ScreenCoachRegister, ScreenCoachInfo,
  ScreenCoachExpertise, ScreenEnableBiometric, ScreenVerification,
  ScreenVerificationPending, ScreenAdminLogin,
  ScreenForgotPassword, ScreenResetCode, ScreenResetPassword,
} from "./screens/onboarding/OnboardingScreens";

// Client
import { ScreenClientHome, ScreenSearchFilters } from "./screens/client/Discovery";
import { ScreenNotifications } from "./screens/client/Notifications";
import { ScreenCoachProfile } from "./screens/client/CoachProfile";
import { ScreenPackageDetail } from "./screens/client/PackageDetail";
import {
  ScreenBookingParticipants, ScreenBookingDateTime, ScreenBookingReview, ScreenPayment,
  ScreenBookingConfirmation, ScreenBookingRequestSent,
} from "./screens/client/Booking";
import { ScreenClientDashboard, ScreenLeaveReview, ScreenClientBookingDetail } from "./screens/client/Dashboard";
import { ScreenClientProfile, ScreenClientHistory } from "./screens/client/Account";
import { ScreenClientSetupComplete } from "./screens/client/SetupComplete";

// Coach
import { ScreenCoachDashboard } from "./screens/coach/CoachDashboard";
import { ScreenCoachCalendar } from "./screens/coach/Calendar";
import { ScreenCoachBookings, ScreenCoachBookingDetail } from "./screens/coach/Bookings";
import { ScreenCoachProfileEdit } from "./screens/coach/ProfileEdit";
import { ScreenCoachReels } from "./screens/coach/Reels";
import { ScreenCoachPackageForm } from "./screens/coach/PackageForm";
import { ScreenCoachEarnings } from "./screens/coach/Earnings";
import { ScreenCoachHistory } from "./screens/coach/History";
import { ScreenCoachServicesSetup } from "./screens/coach/ServicesSetup";
import { ScreenCoachAvailabilitySetup } from "./screens/coach/AvailabilitySetup";
import { ScreenCoachPayoutSetup } from "./screens/coach/PayoutSetup";
import { ScreenCoachSetupComplete } from "./screens/coach/SetupComplete";

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
  const [biometric, setBiometric] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("none"); // none | pending | approved | rejected
  const [reachedDashboardAfterVerification, setReachedDashboardAfterVerification] = useState(false);
  const [offline, setOffline] = useState(false);
  const [hasCoachRole, setHasCoachRole] = useState(false);
  const [draft, setDraft] = useState(null);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [coachBookings, setCoachBookings] = useState(COACH_BOOKINGS);
  const [coachPackages, setCoachPackages] = useState(COACHES[1].packages);
  const [coachMedia, setCoachMedia] = useState(
    Array.from({ length: COACHES[1].reelsCount }, (_, i) => ({
      id: `m${i + 1}`,
      type: i % 4 === 3 ? "photo" : "reel",
      caption: i % 4 === 3 ? "Training photo" : "Session highlight",
      sport: COACHES[1].sport,
      url: null,
    }))
  );
  const [availabilityBlocks, setAvailabilityBlocks] = useState(INITIAL_AVAILABILITY_BLOCKS);
  const [verificationQueue, setVerificationQueue] = useState(ADMIN_VERIFICATION_QUEUE);
  const [disputes, setDisputes] = useState(ADMIN_DISPUTES);
  const [clientPrefs, setClientPrefs] = useState(null);
  const [clientFilters, setClientFilters] = useState(null);
  // Shared across every client screen so a GPS fix (or a manually entered
  // location) made in one place — Dashboard, Filters, the map — is what
  // every other place sees too, instead of each re-requesting its own.
  const userLocationState = useUserLocation();
  const [children, setChildren] = useState([]);
  const [coachOnboarding, setCoachOnboarding] = useState({});
  const updateCoachOnboarding = (patch) => setCoachOnboarding((c) => ({ ...c, ...patch }));

  // Whether the current coach (Josh Whitfield) is open to new bookings right now.
  // Drives the "Coach available / unavailable" state on his profile, Discover
  // card and dashboard toggle.
  const [coachAvailableNow, setCoachAvailableNow] = useState(true);

  // Global notification log — a single source of truth that real in-app actions
  // (booking accepted/declined, payment received, verification decided...) push
  // into, tagged with who it's for. Screens merge this on top of their seed/mock
  // notification lists via useLiveNotifications() so the bell badge and sheet
  // reflect what's actually happening in the prototype, not just static mock data.
  const [notifications, setNotifications] = useState([]);
  const pushNotification = ({ audience, type = "booking", title, body }) => {
    setNotifications((n) => [
      { id: `rt${Date.now()}${Math.random().toString(36).slice(2, 6)}`, audience, type, title, body, time: "Just now", unread: true },
      ...n,
    ]);
  };
  const clientNotifications = notifications.filter((n) => n.audience === "client");
  const coachNotifications = notifications.filter((n) => n.audience === "coach");
  // Scoped updater for the client notification list — updates only
  // client-audience items in the shared `notifications` array, leaving
  // coach-audience ones untouched.
  const setClientNotifications = (updater) => {
    setNotifications((all) => {
      const clientItems = all.filter((n) => n.audience === "client");
      const nextClientItems = typeof updater === "function" ? updater(clientItems) : updater;
      const nextById = new Map(nextClientItems.map((n) => [n.id, n]));
      return all.map((n) => (n.audience === "client" ? nextById.get(n.id) || n : n));
    });
  };

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2200); };
  const nav = (s, p = {}) => { setHistory((h) => [...h, screen]); setScreen(s); setParams(p); };
  const goBack = () => { setHistory((h) => { const n = [...h]; const last = n.pop(); if (last) setScreen(last); return n; }); };
  const toggleFav = (id) => setFavorites((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);

  // Every booking now starts life as a pending request — no payment is collected
  // until the coach has reviewed it and accepted. `d.id`, when supplied, keeps
  // the id the client was already shown on the "Booking Request Sent" screen
  // in sync with the record actually added here.
  const addBooking = (d) => {
    const id = d.id || ("b" + (bookings.length + 1));
    const coachId = d.coach.id;
    setBookings((b) => [{ id, coachId, coachName: d.coach.name, clientName: "Sarah Lin", service: d.pkg.name, date: d.day, time: d.time, mode: d.mode, status: "pending", price: d.total, paid: false, reviewed: false, participants: d.participants || "You", notes: d.conditions || "" }, ...b]);
    // The prototype's Coach role is always Josh Whitfield (c2) — mirror the
    // request into their Bookings pending queue so it's reviewable, and let
    // them chat with the client about it, from the coach side too.
    if (coachId === "c2") {
      setCoachBookings((cb) => [{ id, clientName: "Sarah Lin", service: d.pkg.name, date: d.day, time: d.time, mode: d.mode, status: "pending", price: d.total, notes: d.conditions || "" }, ...cb]);
    }
    pushNotification({ audience: "coach", type: "booking", title: "New booking request", body: `Sarah Lin requested a ${d.pkg.name} for ${d.day}, ${d.time}.` });
  };

  // Client cancels (or withdraws a pending request). Looks the booking up first
  // so we can notify the coach with real details, and — if it had already been
  // paid for — kicks off a simulated refund: cancelled now, refunded a moment
  // later, matching the Payment processing -> success pattern used elsewhere.
  const cancelBooking = (id) => {
    setBookings((bs) => {
      const target = bs.find((b) => b.id === id);
      if (target) {
        pushNotification({
          audience: "coach", type: "booking",
          title: target.status === "pending" ? "Request withdrawn" : "Booking cancelled",
          body: `${target.clientName || "A client"} ${target.status === "pending" ? "withdrew their request for" : "cancelled"} ${target.service}${target.date ? ` on ${target.date}` : ""}.`,
        });
        setCoachBookings((cb) => cb.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
        if (target.status === "confirmed" && target.paid) {
          setTimeout(() => {
            setBookings((later) => later.map((b) => (b.id === id ? { ...b, refundStatus: "refunded" } : b)));
            toast(`$${Number(target.price).toFixed(2)} refunded`);
          }, 1400);
          return bs.map((b) => (b.id === id ? { ...b, status: "cancelled", refundStatus: "processing" } : b));
        }
      }
      return bs.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b));
    });
  };

  const rescheduleBooking = (id, { date, time }) => setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, date, time } : b)));

  // Marks a confirmed booking as paid once ScreenPayment succeeds, and lets the
  // coach know a charge actually landed (distinct from just "confirmed").
  const markBookingPaid = (id) => setBookings((bs) => {
    const target = bs.find((b) => b.id === id);
    if (target) {
      pushNotification({ audience: "coach", type: "booking", title: "Payment received", body: `Payment of $${Number(target.price).toFixed(2)} received for ${target.service}.` });
    }
    return bs.map((b) => (b.id === id ? { ...b, paid: true, paymentDue: false } : b));
  });

  // Shared accept/decline handler for a coach's booking request — called from
  // both the Bookings tab and the coach dashboard's quick-action cards. Keeps
  // the coach's own record and the client's mirrored booking in sync, and
  // notifies the client (payment prompt on accept, a heads-up on decline).
  const respondBooking = (id, status) => {
    setCoachBookings((arr) => arr.map((b) => (b.id === id ? { ...b, status } : b)));
    const cb = coachBookings.find((b) => b.id === id);
    setBookings((arr) => arr.map((b) => (b.id === id ? { ...b, status, paymentDue: status === "confirmed" ? true : b.paymentDue } : b)));
    if (cb) {
      if (status === "confirmed") {
        pushNotification({ audience: "client", type: "payment", title: "Send your payment", body: `${COACHES[1].name} accepted your ${cb.service} request — send payment to confirm your session on ${cb.date}.`, bookingId: id });
      } else if (status === "cancelled") {
        pushNotification({ audience: "client", type: "booking", title: "Booking declined", body: `${COACHES[1].name} declined your ${cb.service} request for ${cb.date}.`, bookingId: id });
      }
    }
  };

  const handleClientPrefs = (prefs) => {
    setClientPrefs(prefs);
    // Participant profiles created during onboarding become managed child profiles.
    if (prefs?.children?.length) {
      setChildren((c) => [
        ...c,
        ...prefs.children
          .filter((nc) => nc.name && nc.name.trim().length > 0)
          .filter((nc) => !c.some((ec) => ec.id === nc.id))
          .map((nc) => ({ sport: [], goals: "", postalCode: prefs.postalCode || "", preferences: "", hasPhoto: false, ...nc })),
      ]);
    }
  };
  const addChild = (child) => setChildren((c) => [...c, { id: Date.now(), name: "", age: "", sport: [], goals: "", postalCode: "", preferences: "", hasPhoto: false, ...child }]);
  const updateChild = (id, patch) => setChildren((c) => c.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch)));
  const removeChild = (id) => setChildren((c) => c.filter((ch) => ch.id !== id));

  // Called when the current (Josh Whitfield) coach profile submits verification documents.
  // Adds a live entry to the admin verification queue and marks the submission as pending.
  const submitVerification = ({ documents, worksWithMinors }) => {
    setVerificationStatus("pending");
    setVerificationQueue((q) => [
      {
        id: "v" + (q.length + 1),
        name: coachOnboarding.displayName || "New Coach",
        sport: (coachOnboarding.primarySports && coachOnboarding.primarySports[0]) || "Coaching",
        type: documents.map((d) => d.label).join(" + "),
        suburb: coachOnboarding.location ? `${coachOnboarding.location.suburb}, ${coachOnboarding.location.state}` : "",
        experience: coachOnboarding.yearsExperience || "",
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
      pushNotification({
        audience: "coach", type: "verification",
        title: approve ? "You're verified!" : "Verification rejected",
        body: approve ? "Your verification was approved. You can now accept bookings." : "One or more documents couldn't be confirmed — please resubmit.",
      });
    }
    toast(approve ? `${applicant ? applicant.name : "Coach"} approved` : `${applicant ? applicant.name : "Coach"} rejected`);
    nav("admin-verify");
  };

  const resolveDispute = (id) => setDisputes((d) => d.filter((x) => x.id !== id));

  // Create-or-update a coach package. Used by the Create/Edit Package flow.
  const savePackage = (record) => setCoachPackages((pkgs) => {
    const exists = pkgs.some((p) => p.id === record.id);
    return exists ? pkgs.map((p) => (p.id === record.id ? record : p)) : [...pkgs, record];
  });
  const removePackage = (id) => {
    setCoachPackages((pkgs) => pkgs.filter((p) => p.id !== id));
    // Availability blocks referencing the removed package should drop it too.
    setAvailabilityBlocks((blocks) => blocks.map((b) => ({ ...b, packageIds: b.packageIds.filter((pid) => pid !== id) })));
  };

  // Reels & photos — coach's own media library shown on their public profile.
  const addMedia = (item) => setCoachMedia((m) => [{ id: Date.now(), ...item }, ...m]);
  const removeMedia = (id) => setCoachMedia((m) => m.filter((x) => x.id !== id));

  const isDarkScreen = screen === "splash" || screen === "admin-login";
  const tabsForRole = role === "coach" ? COACH_TABS : role === "admin" ? ADMIN_TABS : CLIENT_TABS;
  // Some screens render outside the tab bar entirely (e.g. the post-verification
  // setup wizard) — they simply won't match any entry in tabsForRole, so the
  // bottom nav stays hidden while the coach steps through them.
  const TAB_ALIASES = {};
  const activeTabScreen = TAB_ALIASES[screen] || screen;
  const showTabs = tabsForRole.some((t) => t.value === activeTabScreen);

  const screenProps = { nav, params, toast, role, favorites, toggleFav, biometric, setBiometric, verified, verificationStatus, reachedDashboardAfterVerification, setReachedDashboardAfterVerification, offline, draft, setDraft, addBooking, cancelBooking, rescheduleBooking, respondBooking, markBookingPaid, bookings, setBookings, coachBookings, setCoachBookings, setRole, addCoachRole: () => setHasCoachRole(true), submitVerification, verificationQueue, decideVerification, disputes, resolveDispute, clientPrefs, onComplete: handleClientPrefs, children, addChild, updateChild, removeChild, coachOnboarding, updateCoachOnboarding, coachPackages, savePackage, removePackage, availabilityBlocks, setAvailabilityBlocks, coachMedia, addMedia, removeMedia, coachAvailableNow, setCoachAvailableNow, pushNotification, clientNotifications, coachNotifications, setClientNotifications, filters: clientFilters, onFiltersChange: setClientFilters, ...userLocationState };


  function renderScreen() {
    switch (screen) {
      case "splash": return <ScreenSplash nav={nav} />;
      case "get-started": return <ScreenGetStarted nav={nav} />;
      case "role-select": return <ScreenRoleSelect nav={nav} setRole={setRole} />;
      case "auth": return <ScreenAuth {...screenProps} />;
      case "forgot-password": return <ScreenForgotPassword {...screenProps} />;
      case "reset-code": return <ScreenResetCode {...screenProps} />;
      case "reset-password": return <ScreenResetPassword {...screenProps} />;
      case "enable-biometric": return <ScreenEnableBiometric {...screenProps} />;
      case "coach-register": return <ScreenCoachRegister {...screenProps} />;
      case "coach-info": return <ScreenCoachInfo {...screenProps} />;
      case "coach-expertise": return <ScreenCoachExpertise {...screenProps} />;
      case "about-you-profile": return <ScreenAboutYouProfile {...screenProps} />;
      // "account-type" / "about-you-participants" / "about-you-self" removed from the
      // flow — "Let's learn about you" now goes straight to client-setup-complete.
      case "client-setup-complete": return <ScreenClientSetupComplete {...screenProps} />;
      case "verification": return <ScreenVerification {...screenProps} />;
      case "verification-pending": return <ScreenVerificationPending {...screenProps} />;
      case "admin-login": return <ScreenAdminLogin {...screenProps} />;

      case "client-home": return <ScreenClientHome {...screenProps} />;
      case "notifications": return <ScreenNotifications {...screenProps} />;
      case "search-filters": return <ScreenSearchFilters {...screenProps} />;
      case "coach-profile": return <ScreenCoachProfile {...screenProps} />;
      case "package-detail": return <ScreenPackageDetail {...screenProps} />;
      case "booking-participants": return <ScreenBookingParticipants {...screenProps} />;
      case "booking-datetime": return <ScreenBookingDateTime {...screenProps} />;
      case "booking-review": return <ScreenBookingReview {...screenProps} />;
      case "payment": return <ScreenPayment {...screenProps} />;
      case "booking-confirmation": return <ScreenBookingConfirmation {...screenProps} />;
      case "booking-request-sent": return <ScreenBookingRequestSent {...screenProps} />;
      case "client-dashboard": return <ScreenClientDashboard {...screenProps} />;
      case "client-booking-detail": return <ScreenClientBookingDetail {...screenProps} />;
      case "leave-review": return <ScreenLeaveReview {...screenProps} />;
      case "client-messages": return <ScreenMessages {...screenProps} />;
      case "client-profile": return <ScreenClientProfile {...screenProps} />;
      case "client-history": return <ScreenClientHistory {...screenProps} />;

      case "coach-dashboard": return <ScreenCoachDashboard {...screenProps} />;
      case "coach-services-setup": return <ScreenCoachServicesSetup {...screenProps} />;
      case "coach-availability-setup": return <ScreenCoachAvailabilitySetup {...screenProps} />;
      case "coach-payout-setup": return <ScreenCoachPayoutSetup {...screenProps} />;
      case "coach-setup-complete": return <ScreenCoachSetupComplete {...screenProps} />;
      case "coach-calendar": return <ScreenCoachCalendar {...screenProps} />;
      case "coach-bookings": return <ScreenCoachBookings {...screenProps} />;
      case "coach-booking-detail": return <ScreenCoachBookingDetail {...screenProps} />;
      case "coach-profile-edit": return <ScreenCoachProfileEdit {...screenProps} />;
      case "coach-reels": return <ScreenCoachReels {...screenProps} />;
      case "coach-create-package":
      case "coach-edit-package":
        return <ScreenCoachPackageForm {...screenProps} />;
      case "coach-earnings": return <ScreenCoachEarnings {...screenProps} />;
      case "coach-history": return <ScreenCoachHistory {...screenProps} />;
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
          <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fDisplay }}>CoachLink — interactive prototype</span>
        </div>
      </div>
      <div style={{ width: 393, maxWidth: "100%", background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 10, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: T.caption, color: C.slateLight, fontWeight: 600, ...fBody }}>VIEW AS</span>
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
            style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${role === r ? C.orange : C.border}`, background: role === r ? C.orangeTint : C.white, color: role === r ? C.orange : C.jet, fontSize: T.label, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", ...fBody }}>
            {r}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setOffline((v) => !v)} title="Simulate offline"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, border: `1px solid ${offline ? C.orange : C.border}`, background: offline ? C.orangeTint : C.white, color: offline ? C.orange : C.slate, fontSize: T.captionLg, fontWeight: 600, cursor: "pointer", ...fBody }}>
          <WifiOff size={12} /> Offline
        </button>
        <button onClick={() => { setScreen(role === "admin" ? "admin-login" : "splash"); setHistory([]); setBookings(INITIAL_BOOKINGS); setCoachBookings(COACH_BOOKINGS); setNotifications([]); setVerified(false); setVerificationStatus("none"); setReachedDashboardAfterVerification(false); setVerificationQueue(ADMIN_VERIFICATION_QUEUE); setDisputes(ADMIN_DISPUTES); setClientPrefs(null); setChildren([]); setCoachOnboarding({}); setBiometric(false); setCoachPackages(COACHES[1].packages); setAvailabilityBlocks(INITIAL_AVAILABILITY_BLOCKS); setCoachMedia(Array.from({ length: COACHES[1].reelsCount }, (_, i) => ({ id: `m${i + 1}`, type: i % 4 === 3 ? "photo" : "reel", caption: i % 4 === 3 ? "Training photo" : "Session highlight", sport: COACHES[1].sport, url: null }))); }}

          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.white, color: C.slate, fontSize: T.captionLg, fontWeight: 600, cursor: "pointer", ...fBody }}>
          <RefreshCcw size={12} /> Reset
        </button>
      </div>

      {/* Device frame — iPhone 15 */}
      <div style={{ width: 393, maxWidth: "100%", height: 852, maxHeight: "88vh", background: "linear-gradient(160deg,#3a3d45,#101114)", borderRadius: 58, padding: 14, boxShadow: "0 30px 60px -20px rgba(22,24,29,.4)", position: "relative" }}>
        <div style={{ width: "100%", height: "100%", background: isDarkScreen ? C.jet : C.white, borderRadius: 46, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,.08)" }}>
          {/* Dynamic Island */}
          <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, background: C.black, borderRadius: 20, zIndex: 100 }} />
          <StatusBar dark={isDarkScreen} />
          <div style={{ height: "calc(100% - 34px)", position: "relative" }}>
            {renderScreen()}
            <Toast toast={toastMsg} />
          </div>
          {showTabs && <BottomTabs items={tabsForRole} value={activeTabScreen} onChange={(v) => { setHistory([]); setScreen(v); }} />}
        </div>
      </div>

      <div style={{ width: 393, maxWidth: "100%", marginTop: 14, fontSize: T.captionLg, color: C.slateLight, textAlign: "center", lineHeight: 1.6, ...fBody }}>
        High-fidelity front-end prototype with mock data — booking, payments and verification flows are simulated for demonstration.
      </div>
    </div>
  );
}
