import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_BOOKINGS, COACH_BOOKINGS, ADMIN_VERIFICATION_QUEUE, ADMIN_DISPUTES,
  INITIAL_AVAILABILITY_BLOCKS, BOOKING_STATUS, PAYMENT_STATUS,
} from "../data/bookings";
import { COACHES } from "../data/coaches";
import { CURRENT_CLIENT, isHandleTaken as isHandleTakenBase } from "../data/users";
import { getPublicName, fullNameOf } from "../utils/name";
import { useUserLocation } from "../utils/useUserLocation";
import { applyTheme } from "../theme/theme";

/* =========================================================================
   APP CONTEXT
   -------------------------------------------------------------------------
   Single source of truth for all prototype state — bookings, notifications,
   verification, coach media, availability, dark mode, etc.
   ========================================================================= */

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({ children }) {
  // ---- Navigation ----
  const [role, setRole] = useState("client");
  const [screen, setScreen] = useState("splash");
  const [params, setParams] = useState({});
  const [history, setHistory] = useState([]);

  // ---- UI ----
  const [toastMsg, setToastMsg] = useState(null);
  const [offline, setOffline] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ---- Client state ----
  const [favorites, setFavorites] = useState(["c1"]);
  const [biometric, setBiometric] = useState(false);
  const [clientPrefs, setClientPrefs] = useState(null);
  const [clientFilters, setClientFilters] = useState(null);
  const [childrenState, setChildren] = useState([]);
  const [isFirstTimeClient, setIsFirstTimeClient] = useState(false);
  const [discoveryPrefs, setDiscoveryPrefs] = useState({ seeded: true });
  const [showPostSignupGuide, setShowPostSignupGuide] = useState(false);
  const [clientIdentity, setClientIdentity] = useState(CURRENT_CLIENT);

  // ---- Booking state ----
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [coachBookings, setCoachBookings] = useState(COACH_BOOKINGS);
  const [draft, setDraft] = useState(null);

  // ---- Coach state ----
  const [verified, setVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("none");
  const [reachedDashboardAfterVerification, setReachedDashboardAfterVerification] = useState(false);
  const [hasCoachRole, setHasCoachRole] = useState(false);
  const [coachOnboarding, setCoachOnboarding] = useState({});
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
  const [coachAvailableNow, setCoachAvailableNow] = useState(true);

  // ---- Admin state ----
  const [verificationQueue, setVerificationQueue] = useState(ADMIN_VERIFICATION_QUEUE);
  const [disputes, setDisputes] = useState(ADMIN_DISPUTES);

  // ---- Notifications ----
  const [notifications, setNotifications] = useState([]);

  // ---- Shared location ----
  const userLocationState = useUserLocation();

  // ======== Dark mode effect ========
  useEffect(() => {
    applyTheme(document.documentElement, darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  // ======== Derived state ========
  const clientNotifications = notifications.filter((n) => n.audience === "client");
  const coachNotifications = notifications.filter((n) => n.audience === "coach");

  // Public identity of the current coach (onboarding data over directory seed).
  const coachIdentity = {
    name: coachOnboarding.name || COACHES[1].name,
    handle: coachOnboarding.handle || COACHES[1].handle,
    namePrivacy: coachOnboarding.namePrivacy || COACHES[1].namePrivacy,
  };

  const setClientNotifications = (updater) => {
    setNotifications((all) => {
      const clientItems = all.filter((n) => n.audience === "client");
      const nextClientItems = typeof updater === "function" ? updater(clientItems) : updater;
      const nextById = new Map(nextClientItems.map((n) => [n.id, n]));
      return all.map((n) => (n.audience === "client" ? nextById.get(n.id) || n : n));
    });
  };

  // ======== Actions ========
  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const nav = (s, p = {}) => {
    setHistory((h) => [...h, screen]);
    setScreen(s);
    setParams(p);
  };

  const goBack = () => {
    setHistory((h) => {
      const n = [...h];
      const last = n.pop();
      if (last) setScreen(last);
      return n;
    });
  };

  const toggleFav = (id) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const pushNotification = ({ audience, type = "booking", title, body, bookingId }) => {
    setNotifications((n) => [
      {
        id: `rt${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        audience, type, title, body, bookingId, time: "Just now", unread: true,
      },
      ...n,
    ]);
  };

  const updateCoachOnboarding = (patch) => setCoachOnboarding((c) => ({ ...c, ...patch }));

  // ---- Identity / handles ----
  const updateClientIdentity = (patch) => setClientIdentity((c) => ({ ...c, ...patch }));
  const isHandleTaken = (handle) => isHandleTakenBase(handle, [clientIdentity.handle, coachOnboarding.handle]);

  // ---- Booking actions ----
  const addBooking = (d) => {
    const id = d.id || ("b" + (bookings.length + 1));
    const coachId = d.coach.id;
    const clientFull = fullNameOf(clientIdentity);
    const clientPub = getPublicName(clientIdentity, "public");
    const who = clientPub.handle ? `${clientPub.name} (${clientPub.handle})` : clientPub.name;
    setBookings((b) => [
      {
        id, coachId, coachName: d.coach.name, clientName: clientFull,
        clientHandle: clientIdentity.handle, clientPrivacy: clientIdentity.namePrivacy,
        service: d.pkg.name, date: d.day, time: d.time, mode: d.mode,
        status: BOOKING_STATUS.PENDING, paymentStatus: PAYMENT_STATUS.NOT_REQUESTED,
        price: d.total, reviewed: false,
        participants: d.participants || "You", notes: d.conditions || "",
      },
      ...b,
    ]);
    if (coachId === "c2") {
      setCoachBookings((cb) => [
        {
          id, clientName: clientFull,
          clientHandle: clientIdentity.handle, clientPrivacy: clientIdentity.namePrivacy,
          service: d.pkg.name, date: d.day,
          time: d.time, mode: d.mode, status: BOOKING_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.NOT_REQUESTED, price: d.total,
          notes: d.conditions || "",
        },
        ...cb,
      ]);
    }
    pushNotification({
      audience: "coach", type: "booking", title: "New booking request",
      body: `${who} requested a ${d.pkg.name} for ${d.day}, ${d.time}.`,
      bookingId: id,
    });
  };

  const cancelBooking = (id) => {
    const target = bookings.find((booking) => booking.id === id)
      || coachBookings.find((booking) => booking.id === id);
    if (!target || [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.EXPIRED].includes(target.status)) return;

    const wasPaid = [PAYMENT_STATUS.HELD, PAYMENT_STATUS.RELEASED].includes(target.paymentStatus);
    const cancellationPatch = {
      status: BOOKING_STATUS.CANCELLED,
      ...(wasPaid
        ? { paymentStatus: PAYMENT_STATUS.REFUND_PROCESSING, refundStatus: "processing" }
        : { paymentStatus: PAYMENT_STATUS.NOT_REQUESTED }),
    };

    setBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...cancellationPatch } : booking)));
    setCoachBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...cancellationPatch } : booking)));

    const wasPending = target.status === BOOKING_STATUS.PENDING;
    pushNotification({
      audience: "coach",
      type: "booking",
      title: wasPending ? "Request withdrawn" : "Booking cancelled",
      body: `${target.clientName || "A client"} ${wasPending ? "withdrew their request for" : "cancelled"} ${target.service}${target.date ? ` on ${target.date}` : ""}.`,
      bookingId: id,
    });

    if (wasPaid) {
      pushNotification({
        audience: "client",
        type: "payment",
        title: "Refund started",
        body: `Your refund for ${target.service} is being returned to your original payment method.`,
        bookingId: id,
      });
      setTimeout(() => {
        const refundPatch = { paymentStatus: PAYMENT_STATUS.REFUNDED, refundStatus: "refunded" };
        setBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...refundPatch } : booking)));
        setCoachBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...refundPatch } : booking)));
        pushNotification({
          audience: "client",
          type: "payment",
          title: "Refund complete",
          body: `$${Number(target.price).toFixed(2)} was returned to your original payment method.`,
          bookingId: id,
        });
        toast(`$${Number(target.price).toFixed(2)} refunded`);
      }, 1400);
    }
  };

  const rescheduleBooking = (id, { date, time }) => {
    const target = bookings.find((booking) => booking.id === id)
      || coachBookings.find((booking) => booking.id === id);
    if (!target) return;

    const schedulePatch = { date, time };
    setBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...schedulePatch } : booking)));
    setCoachBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...schedulePatch } : booking)));
    pushNotification({
      audience: "coach",
      type: "booking",
      title: "Session rescheduled",
      body: `${target.clientName || "Your client"} moved ${target.service} to ${date}, ${time}.`,
      bookingId: id,
    });
  };

  const markBookingPaid = (id) => {
    const target = bookings.find((booking) => booking.id === id)
      || coachBookings.find((booking) => booking.id === id);
    if (!target || target.status !== BOOKING_STATUS.AWAITING_PAYMENT) return false;

    const paymentPatch = { status: BOOKING_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.HELD };
    setBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...paymentPatch } : booking)));
    setCoachBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...paymentPatch } : booking)));
    pushNotification({
      audience: "coach",
      type: "payment",
      title: "Payment received",
      body: `Payment of $${Number(target.price).toFixed(2)} received for ${target.service}. The session is now confirmed.`,
      bookingId: id,
    });
    return true;
  };

  const respondBooking = (id, status) => {
    const target = coachBookings.find((booking) => booking.id === id)
      || bookings.find((booking) => booking.id === id);
    if (!target || target.status !== BOOKING_STATUS.PENDING) return false;

    const nextStatus = status === BOOKING_STATUS.CONFIRMED ? BOOKING_STATUS.AWAITING_PAYMENT : status;
    if (![BOOKING_STATUS.AWAITING_PAYMENT, BOOKING_STATUS.DECLINED].includes(nextStatus)) return false;

    const responsePatch = {
      status: nextStatus,
      paymentStatus: nextStatus === BOOKING_STATUS.AWAITING_PAYMENT
        ? PAYMENT_STATUS.DUE
        : PAYMENT_STATUS.NOT_REQUESTED,
    };
    setCoachBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...responsePatch } : booking)));
    setBookings((items) => items.map((booking) => (booking.id === id ? { ...booking, ...responsePatch } : booking)));
    const coachPub = getPublicName(coachIdentity, "public");
    if (nextStatus === BOOKING_STATUS.AWAITING_PAYMENT) {
      pushNotification({
        audience: "client", type: "payment", title: "Send your payment",
        body: `${coachPub.name} accepted your ${target.service} request — send payment to confirm your session on ${target.date}.`,
        bookingId: id,
      });
    } else if (nextStatus === BOOKING_STATUS.DECLINED) {
      pushNotification({
        audience: "client", type: "booking", title: "Booking declined",
        body: `${coachPub.name} declined your ${target.service} request for ${target.date}.`,
        bookingId: id,
      });
    }
    return true;
  };

  // ---- Client prefs / children ----
  const handleClientPrefs = (prefs) => {
    setClientPrefs(prefs);
    if (prefs?.children?.length) {
      setChildren((c) => [
        ...c,
        ...prefs.children
          .filter((nc) => nc.name && nc.name.trim().length > 0)
          .filter((nc) => !c.some((ec) => ec.id === nc.id))
          .map((nc) => ({ sport: [], goals: "", location: prefs.location || null, preferences: "", hasPhoto: false, ...nc })),
      ]);
    }
  };

  const addChild = (child) =>
    setChildren((c) => [...c, { id: Date.now(), name: "", age: "", sport: [], goals: "", location: null, preferences: "", hasPhoto: false, ...child }]);
  const updateChild = (id, patch) =>
    setChildren((c) => c.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch)));
  const removeChild = (id) =>
    setChildren((c) => c.filter((ch) => ch.id !== id));

  // ---- Verification ----
  const submitVerification = ({ documents, worksWithMinors }) => {
    setVerificationStatus("pending");
    setVerificationQueue((q) => [
      {
        id: "v" + (q.length + 1),
        name: coachOnboarding.name || "New Coach",
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
  };

  const resolveDispute = (id) => setDisputes((d) => d.filter((x) => x.id !== id));

  // ---- Coach packages ----
  const savePackage = (record) =>
    setCoachPackages((pkgs) => {
      const exists = pkgs.some((p) => p.id === record.id);
      return exists ? pkgs.map((p) => (p.id === record.id ? record : p)) : [...pkgs, record];
    });

  const removePackage = (id) => {
    setCoachPackages((pkgs) => pkgs.filter((p) => p.id !== id));
    setAvailabilityBlocks((blocks) => blocks.map((b) => ({ ...b, packageIds: b.packageIds.filter((pid) => pid !== id) })));
  };

  // ---- Media ----
  const addMedia = (item) => setCoachMedia((m) => [{ id: Date.now(), ...item }, ...m]);
  const removeMedia = (id) => setCoachMedia((m) => m.filter((x) => x.id !== id));

  // ---- Reset (for prototype controls) ----
  const resetAll = () => {
    setScreen("splash");
    setHistory([]);
    setBookings(INITIAL_BOOKINGS);
    setCoachBookings(COACH_BOOKINGS);
    setNotifications([]);
    setVerified(false);
    setVerificationStatus("none");
    setReachedDashboardAfterVerification(false);
    setVerificationQueue(ADMIN_VERIFICATION_QUEUE);
    setDisputes(ADMIN_DISPUTES);
    setClientPrefs(null);
    setChildren([]);
    setCoachOnboarding({});
    setClientIdentity(CURRENT_CLIENT);
    setBiometric(false);
    setCoachPackages(COACHES[1].packages);
    setAvailabilityBlocks(INITIAL_AVAILABILITY_BLOCKS);
    setCoachMedia(
      Array.from({ length: COACHES[1].reelsCount }, (_, i) => ({
        id: `m${i + 1}`,
        type: i % 4 === 3 ? "photo" : "reel",
        caption: i % 4 === 3 ? "Training photo" : "Session highlight",
        sport: COACHES[1].sport,
        url: null,
      }))
    );
    setIsFirstTimeClient(false);
    setDiscoveryPrefs({ seeded: true });
  };

  // ======== Context value ========
  const value = {
    // Navigation
    nav, goBack, screen, setScreen, params, setParams, history, setHistory, role, setRole,
    // UI
    toast, toastMsg, offline, setOffline, darkMode, toggleDarkMode,
    // Client
    favorites, toggleFav, biometric, setBiometric, clientPrefs, onComplete: handleClientPrefs,
    children: childrenState, addChild, updateChild, removeChild,
    isFirstTimeClient, setIsFirstTimeClient, discoveryPrefs, setDiscoveryPrefs,
    showPostSignupGuide, setShowPostSignupGuide,
    clientIdentity, updateClientIdentity, isHandleTaken, coachIdentity,
    filters: clientFilters, onFiltersChange: setClientFilters,
    // Bookings
    bookings, setBookings, coachBookings, setCoachBookings,
    addBooking, cancelBooking, rescheduleBooking, markBookingPaid, respondBooking,
    draft, setDraft,
    // Coach
    verified, verificationStatus, reachedDashboardAfterVerification, setReachedDashboardAfterVerification,
    coachOnboarding, updateCoachOnboarding,
    coachPackages, savePackage, removePackage,
    coachMedia, addMedia, removeMedia,
    availabilityBlocks, setAvailabilityBlocks,
    coachAvailableNow, setCoachAvailableNow,
    addCoachRole: () => setHasCoachRole(true),
    // Verification & admin
    submitVerification, verificationQueue, decideVerification, disputes, resolveDispute,
    // Notifications
    pushNotification, notifications, clientNotifications, coachNotifications, setClientNotifications,
    // Location
    ...userLocationState,
    // Reset
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
