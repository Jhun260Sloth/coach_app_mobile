/* =========================================================================
   ROUTE REGISTRY & METADATA
   -------------------------------------------------------------------------
   Central lookup mapping screen names to their component, role, and tab
   group. Replaces the 70-case switch in App.jsx's renderScreen().
   ========================================================================= */

// Onboarding / auth
import {
  ScreenSplash, ScreenGetStarted, ScreenRoleSelect, ScreenAuth, ScreenCoachInfo,
  ScreenCoachExpertise, ScreenEnableBiometric, ScreenVerification,
  ScreenVerificationPending,
  ScreenForgotPassword, ScreenResetCode, ScreenResetPassword, ScreenVerifyEmail,
} from "../screens/onboarding/OnboardingScreens";

import {
  ScreenAboutYouProfile, ScreenAccountType,
  ScreenAboutYouParticipants, ScreenAboutYouSelf,
} from "../screens/client/AboutYou";

// Client
import { ScreenClientHome, ScreenSearchFilters } from "../screens/client/Discovery";
import { ScreenNotifications } from "../screens/client/Notifications";
import { ScreenCoachProfile } from "../screens/client/CoachProfile";
import { ScreenCoachMedia } from "../screens/client/Reels";
import { ScreenPackageDetail } from "../screens/client/PackageDetail";
import {
  ScreenBookingParticipants, ScreenBookingDateTime, ScreenBookingReview, ScreenPayment,
  ScreenBookingConfirmation, ScreenBookingRequestSent,
} from "../screens/client/Booking";
import {
  ScreenBookingSelectDateTime, ScreenPaymentAddCard, ScreenPackageListing,
  ScreenPackageInquiry, ScreenPackageWaitlist, ScreenSessionPrep,
  ScreenRefundStatus, ScreenBookingMessage, ScreenAvailabilityCalendar,
  ScreenBookingParticipantDetails,
} from "../screens/client/BookingExtra";
import { ScreenClientDashboard, ScreenLeaveReview, ScreenClientBookingDetail } from "../screens/client/Dashboard";
import { ScreenClientProfile, ScreenClientHistory } from "../screens/client/Account";
import { ScreenClientSetupComplete } from "../screens/client/SetupComplete";

// Coach
import { ScreenCoachDashboard } from "../screens/coach/CoachDashboard";
import { ScreenCoachNotifications } from "../screens/coach/Notifications";
import { ScreenCoachCalendar } from "../screens/coach/Calendar";
import { ScreenCoachBookings, ScreenCoachBookingDetail } from "../screens/coach/Bookings";
import { ScreenCoachProfileEdit } from "../screens/coach/ProfileEdit";
import { ScreenCoachReels } from "../screens/coach/Reels";
import { ScreenCoachPackageForm } from "../screens/coach/PackageForm";
import { ScreenCoachEarnings } from "../screens/coach/Earnings";
import { ScreenCoachHistory } from "../screens/coach/History";
import { ScreenCoachServicesSetup } from "../screens/coach/ServicesSetup";
import { ScreenCoachAvailabilitySetup } from "../screens/coach/AvailabilitySetup";
import { ScreenCoachPayoutSetup } from "../screens/coach/PayoutSetup";
import { ScreenCoachSetupComplete } from "../screens/coach/SetupComplete";

// Shared: messaging & support
import { ScreenMessages, ScreenChatThread } from "../screens/messaging/Messaging";
import { ScreenSupport } from "../screens/support/Support";
import { ScreenSessionCompletion, ScreenFundsReleaseStatus } from "../screens/shared/SessionLifecycle";
import {
  ScreenAdditionalChargeCreate, ScreenAdditionalChargePayment, ScreenAdditionalChargeReview,
  ScreenDisputeCreate, ScreenDisputeStatus,
} from "../screens/shared/Exceptions";

/**
 * Route registry — each key is a screen name (the string passed to `nav()`),
 * and its value is the React component to render for that screen.
 */
export const ROUTES = {
  // Onboarding / auth
  "splash": ScreenSplash,
  "get-started": ScreenGetStarted,
  "role-select": ScreenRoleSelect,
  "auth": ScreenAuth,
  "forgot-password": ScreenForgotPassword,
  "reset-code": ScreenResetCode,
  "reset-password": ScreenResetPassword,
  "verify-email": ScreenVerifyEmail,
  "enable-biometric": ScreenEnableBiometric,
  "coach-info": ScreenCoachInfo,
  "coach-expertise": ScreenCoachExpertise,
  "about-you-profile": ScreenAboutYouProfile,
  "account-type": ScreenAccountType,
  "about-you-participants": ScreenAboutYouParticipants,
  "about-you-self": ScreenAboutYouSelf,
  "client-setup-complete": ScreenClientSetupComplete,
  "verification": ScreenVerification,
  "verification-pending": ScreenVerificationPending,
  "verification-rejected": ScreenVerificationPending,

  // Client
  "client-home": ScreenClientHome,
  "notifications": ScreenNotifications,
  "search-filters": ScreenSearchFilters,
  "coach-profile": ScreenCoachProfile,
  "coach-media": ScreenCoachMedia,
  "package-detail": ScreenPackageDetail,
  "booking-participants": ScreenBookingParticipants,
  "booking-select-datetime": ScreenBookingSelectDateTime,
  "booking-participant-details": ScreenBookingParticipantDetails,
  "booking-datetime": ScreenBookingDateTime,
  "booking-review": ScreenBookingReview,
  "payment": ScreenPayment,
  "payment-add-card": ScreenPaymentAddCard,
  "booking-confirmation": ScreenBookingConfirmation,
  "booking-request-sent": ScreenBookingRequestSent,
  "package-listing": ScreenPackageListing,
  "package-inquiry": ScreenPackageInquiry,
  "package-waitlist": ScreenPackageWaitlist,
  "session-prep": ScreenSessionPrep,
  "refund-status": ScreenRefundStatus,
  "booking-message": ScreenBookingMessage,
  "availability-calendar": ScreenAvailabilityCalendar,
  "client-dashboard": ScreenClientDashboard,
  "client-booking-detail": ScreenClientBookingDetail,
  "leave-review": ScreenLeaveReview,
  "client-messages": ScreenMessages,
  "client-profile": ScreenClientProfile,
  "client-history": ScreenClientHistory,

  // Coach
  "coach-dashboard": ScreenCoachDashboard,
  "coach-notifications": ScreenCoachNotifications,
  "coach-services-setup": ScreenCoachServicesSetup,
  "coach-availability-setup": ScreenCoachAvailabilitySetup,
  "coach-payout-setup": ScreenCoachPayoutSetup,
  "coach-setup-complete": ScreenCoachSetupComplete,
  "coach-calendar": ScreenCoachCalendar,
  "coach-bookings": ScreenCoachBookings,
  "coach-booking-detail": ScreenCoachBookingDetail,
  "booking-awaiting-payment": ScreenCoachBookingDetail,
  "coach-session-detail": ScreenCoachBookingDetail,
  "coach-profile-edit": ScreenCoachProfileEdit,
  "coach-reels": ScreenCoachReels,
  "coach-create-package": ScreenCoachPackageForm,
  "coach-edit-package": ScreenCoachPackageForm,
  "coach-earnings": ScreenCoachEarnings,
  "coach-history": ScreenCoachHistory,
  "coach-messages": ScreenMessages,

  // Shared
  "chat-thread": ScreenChatThread,
  "session-completion": ScreenSessionCompletion,
  "funds-release-status": ScreenFundsReleaseStatus,
  "dispute-create": ScreenDisputeCreate,
  "dispute-status": ScreenDisputeStatus,
  "additional-charge-create": ScreenAdditionalChargeCreate,
  "additional-charge-payment": ScreenAdditionalChargePayment,
  "additional-charge-review": ScreenAdditionalChargeReview,
  "support": ScreenSupport,
};

/** Base metadata for developer inspect / quick directory jump. */
const ROUTE_METADATA_BASE = {
  // Onboarding
  "splash": { title: "Splash Screen", category: "Onboarding", role: "client" },
  "get-started": { title: "Get Started", category: "Onboarding", role: "client" },
  "role-select": { title: "Role Selection", category: "Onboarding", role: "client" },
  "auth": { title: "Auth / Login / Register", category: "Onboarding", role: "client" },
  "forgot-password": { title: "Forgot Password", category: "Onboarding", role: "client" },
  "reset-code": { title: "Reset Code Verification", category: "Onboarding", role: "client" },
  "reset-password": { title: "Reset Password", category: "Onboarding", role: "client" },
  "verify-email": { title: "Verify Your Email", category: "Onboarding", role: "client" },
  "enable-biometric": { title: "Enable Biometrics", category: "Onboarding", role: "client" },
  "coach-info": { title: "Coach Info Step 2", category: "Onboarding", role: "coach" },
  "coach-expertise": { title: "Coach Expertise Step 3", category: "Onboarding", role: "coach" },
  "about-you-profile": { title: "Client Setup: Profile", category: "Onboarding", role: "client" },
  "account-type": { title: "Choose Participant Type", category: "Onboarding", role: "client" },
  "about-you-participants": { title: "Add Child Participants", category: "Onboarding", role: "client" },
  "about-you-self": { title: "Client Coaching Preferences", category: "Onboarding", role: "client" },
  "client-setup-complete": { title: "Client Setup Complete", category: "Onboarding", role: "client" },
  "verification": { title: "Submit Verification Docs", category: "Onboarding", role: "coach" },
  "verification-pending": { title: "Verification Pending Banner", category: "Onboarding", role: "coach" },
  "verification-rejected": { title: "Verification Rejected & Resubmit", category: "Onboarding", role: "coach" },

  // Client Flow
  "client-home": { title: "Client Discover Home", category: "Client", role: "client" },
  "notifications": { title: "Notifications Log", category: "Client", role: "client" },
  "search-filters": { title: "Search & Filters", category: "Client", role: "client" },
  "coach-profile": { title: "Coach Profile Detail", category: "Client", role: "client" },
  "coach-media": { title: "Coach Reels & Media", category: "Client", role: "client" },
  "package-detail": { title: "Package Detail", category: "Client", role: "client" },
  "booking-participants": { title: "Booking Step 1: Participants", category: "Client", role: "client" },
  "booking-select-datetime": { title: "Booking: Select Date & Time", category: "Client", role: "client" },
  "booking-participant-details": { title: "Booking: Participant Details", category: "Client", role: "client" },
  "booking-datetime": { title: "Booking Step 2: Date & Time", category: "Client", role: "client" },
  "booking-review": { title: "Booking Step 3: Review", category: "Client", role: "client" },
  "payment": { title: "Booking Step 4: Payment", category: "Client", role: "client" },
  "payment-add-card": { title: "Add Payment Method", category: "Client", role: "client" },
  "booking-confirmation": { title: "Booking Confirmation", category: "Client", role: "client" },
  "booking-request-sent": { title: "Booking Request Sent", category: "Client", role: "client" },
  "package-listing": { title: "Browse All Packages", category: "Client", role: "client" },
  "package-inquiry": { title: "Ask Coach a Question", category: "Client", role: "client" },
  "package-waitlist": { title: "Join Package Waitlist", category: "Client", role: "client" },
  "session-prep": { title: "Session Preparation", category: "Client", role: "client" },
  "refund-status": { title: "Refund Status", category: "Client", role: "client" },
  "booking-message": { title: "Coach Response Thread", category: "Client", role: "client" },
  "availability-calendar": { title: "Full Availability Calendar", category: "Client", role: "client" },
  "client-dashboard": { title: "Client Dashboard / Bookings", category: "Client", role: "client" },
  "client-booking-detail": { title: "Client Booking Detail", category: "Client", role: "client" },
  "leave-review": { title: "Leave Review & Rating", category: "Client", role: "client" },
  "client-messages": { title: "Client Messages Inbox", category: "Client", role: "client" },
  "client-profile": { title: "Client Account Profile", category: "Client", role: "client" },
  "client-history": { title: "Client Payment & Session History", category: "Client", role: "client" },

  // Coach Flow
  "coach-dashboard": { title: "Coach Dashboard", category: "Coach", role: "coach" },
  "coach-notifications": { title: "Coach Notifications", category: "Coach", role: "coach" },
  "coach-services-setup": { title: "Coach Setup: Services", category: "Coach", role: "coach" },
  "coach-availability-setup": { title: "Coach Setup: Availability", category: "Coach", role: "coach" },
  "coach-payout-setup": { title: "Coach Setup: Payouts", category: "Coach", role: "coach" },
  "coach-setup-complete": { title: "Coach Setup Complete", category: "Coach", role: "coach" },
  "coach-calendar": { title: "Coach Calendar & Slot Manager", category: "Coach", role: "coach" },
  "coach-bookings": { title: "Coach Bookings Queue", category: "Coach", role: "coach" },
  "coach-booking-detail": { title: "Coach Booking Request Detail", category: "Coach", role: "coach" },
  "booking-awaiting-payment": { title: "Coach: Waiting for Payment", category: "Coach", role: "coach" },
  "coach-session-detail": { title: "Coach Confirmed Session Detail", category: "Coach", role: "coach" },
  "coach-profile-edit": { title: "Edit Coach Public Profile", category: "Coach", role: "coach" },
  "coach-reels": { title: "Manage Video Reels & Photos", category: "Coach", role: "coach" },
  "coach-create-package": { title: "Create Service Package", category: "Coach", role: "coach" },
  "coach-edit-package": { title: "Edit Service Package", category: "Coach", role: "coach" },
  "coach-earnings": { title: "Earnings & Payout Analytics", category: "Coach", role: "coach" },
  "coach-history": { title: "Completed Sessions History", category: "Coach", role: "coach" },
  "coach-messages": { title: "Coach Messages Inbox", category: "Coach", role: "coach" },

  // Shared
  "chat-thread": { title: "Interactive Chat Thread", category: "Shared", role: "client" },
  "session-completion": { title: "Shared Session Completion", category: "Shared", role: "client" },
  "funds-release-status": { title: "Shared Funds Release Status", category: "Shared", role: "client" },
  "dispute-create": { title: "Report a Session Issue", category: "Shared", role: "client" },
  "dispute-status": { title: "Case Tracking & No-show Outcome", category: "Shared", role: "client" },
  "additional-charge-create": { title: "Coach: Request Additional Payment", category: "Coach", role: "coach" },
  "additional-charge-payment": { title: "Client: Pay Additional Charge", category: "Client", role: "client" },
  "additional-charge-review": { title: "Client: Review Additional Payment", category: "Client", role: "client" },
  "support": { title: "Help & Support Center", category: "Shared", role: "client" },
};

/**
 * Stable preview inputs for routes that normally receive navigation state.
 * The exported metadata adds an empty object to every other route so opening
 * any item from the screen directory also clears stale parameters.
 */
const ROUTE_DEMO_PARAMS = {
  "auth": { mode: "login", backTo: "role-select" },
  "forgot-password": { role: "client", backTo: "role-select" },
  "reset-code": { email: "sarah@example.com", role: "client", backTo: "role-select" },
  "reset-password": { email: "sarah@example.com", role: "client", backTo: "role-select" },
  "verify-email": { email: "sarah@example.com", next: "about-you-profile" },
  "enable-biometric": { next: "about-you-profile" },
  "client-setup-complete": { name: "Sarah Lin" },
  "coach-profile": { id: "c1" },
  "coach-media": { coachId: "c1", mediaId: "c1-r1" },
  "package-detail": { coachId: "c1", packageId: "p1", presetDate: "2026-08-19", presetTime: "16:00" },
  "booking-participants": { coachId: "c1", packageId: "p1", presetDate: "2026-08-19", presetTime: "16:00" },
  "booking-select-datetime": { coachId: "c1", packageId: "p1" },
  "booking-participant-details": { coachId: "c1", packageId: "p1", participants: ["self"] },
  "booking-datetime": { coachId: "c1", packageId: "p1", participants: ["self"], presetDate: "2026-08-19", presetTime: "16:00" },
  "booking-review": { coachId: "c1", packageId: "p1", participants: ["self"], presetDate: "2026-08-19", presetTime: "16:00" },
  "payment": { bookingId: "b5" },
  "payment-add-card": { bookingId: "b5" },
  "booking-confirmation": { bookingId: "s1" },
  "booking-request-sent": { id: "b2", coachName: "Noah Kelly" },
  "package-listing": { sport: "Netball" },
  "package-inquiry": { coachId: "c1", packageId: "p1" },
  "package-waitlist": { coachId: "c1", packageId: "p1" },
  "session-prep": { coachId: "c1", packageId: "p1", date: "Wed, 19 Aug" },
  "refund-status": {
    booking: {
      id: "b17",
      coachId: "c3",
      coachName: "Ruby Hendricks",
      service: "1:1 Beach Session",
      date: "Wed, 29 Jul",
      time: "6:45am",
      price: 65,
      status: "cancelled",
      paymentStatus: "refunded",
      refundStatus: "refunded",
    },
  },
  "booking-message": {
    coachId: "c2",
    type: "decline",
    booking: { id: "b15", service: "1:1 Programming Session", date: "Mon, 27 Jul", time: "6:00am" },
  },
  "availability-calendar": { coachId: "c1", packageId: "p1" },
  "client-booking-detail": { id: "b5" },
  "leave-review": { bookingId: "b3", name: "Ruby Hendricks" },
  "coach-booking-detail": { id: "cb2" },
  "booking-awaiting-payment": { id: "cb5" },
  "coach-session-detail": { id: "s1" },
  "coach-edit-package": { id: "p1" },
  "chat-thread": { threadId: "t1", name: "Isla Ferguson", handle: "isla.netball", context: "Booking · Wed, 19 Aug", bookingId: "b1" },
  "session-completion": { bookingId: "s1", role: "client", backTo: "client-booking-detail" },
  "funds-release-status": { bookingId: "b3", role: "client", backTo: "client-history" },
  "verification-rejected": { variant: "rejected" },
  "dispute-create": { bookingId: "s1", role: "client", category: "session_not_delivered", backTo: "client-booking-detail" },
  "dispute-status": { caseId: "case-102", role: "client", backTo: "client-history" },
  "additional-charge-create": { bookingId: "cb10", role: "coach" },
  "additional-charge-payment": { chargeId: "charge-101", role: "client" },
  "additional-charge-review": { chargeId: "charge-101", role: "client" },
  "support": { presetTab: "faq", faqTopic: "client", backTo: "client-home" },
};

export const ROUTE_METADATA = Object.fromEntries(
  Object.entries(ROUTE_METADATA_BASE).map(([key, metadata]) => [
    key,
    { ...metadata, demoParams: ROUTE_DEMO_PARAMS[key] || {} },
  ])
);
