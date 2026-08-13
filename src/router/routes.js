/* =========================================================================
   ROUTE REGISTRY & METADATA
   -------------------------------------------------------------------------
   Central lookup mapping screen names to their component, role, and tab
   group. Replaces the 70-case switch in App.jsx's renderScreen().
   ========================================================================= */

// Onboarding / auth
import {
  ScreenSplash, ScreenGetStarted, ScreenRoleSelect, ScreenAuth, ScreenCoachRegister, ScreenCoachInfo,
  ScreenCoachExpertise, ScreenEnableBiometric, ScreenVerification,
  ScreenVerificationPending,
  ScreenForgotPassword, ScreenResetCode, ScreenResetPassword,
} from "../screens/onboarding/OnboardingScreens";

import { ScreenAboutYouProfile } from "../screens/client/AboutYou";

// Client
import { ScreenClientHome, ScreenSearchFilters } from "../screens/client/Discovery";
import { ScreenNotifications } from "../screens/client/Notifications";
import { ScreenCoachProfile } from "../screens/client/CoachProfile";
import { ScreenPackageDetail } from "../screens/client/PackageDetail";
import {
  ScreenBookingParticipants, ScreenBookingDateTime, ScreenBookingReview, ScreenPayment,
  ScreenBookingConfirmation, ScreenBookingRequestSent,
} from "../screens/client/Booking";
import { ScreenClientDashboard, ScreenLeaveReview, ScreenClientBookingDetail } from "../screens/client/Dashboard";
import { ScreenClientProfile, ScreenClientHistory } from "../screens/client/Account";
import { ScreenClientSetupComplete } from "../screens/client/SetupComplete";

// Coach
import { ScreenCoachDashboard } from "../screens/coach/CoachDashboard";
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
  "enable-biometric": ScreenEnableBiometric,
  "coach-register": ScreenCoachRegister,
  "coach-info": ScreenCoachInfo,
  "coach-expertise": ScreenCoachExpertise,
  "about-you-profile": ScreenAboutYouProfile,
  "client-setup-complete": ScreenClientSetupComplete,
  "verification": ScreenVerification,
  "verification-pending": ScreenVerificationPending,

  // Client
  "client-home": ScreenClientHome,
  "notifications": ScreenNotifications,
  "search-filters": ScreenSearchFilters,
  "coach-profile": ScreenCoachProfile,
  "package-detail": ScreenPackageDetail,
  "booking-participants": ScreenBookingParticipants,
  "booking-datetime": ScreenBookingDateTime,
  "booking-review": ScreenBookingReview,
  "payment": ScreenPayment,
  "booking-confirmation": ScreenBookingConfirmation,
  "booking-request-sent": ScreenBookingRequestSent,
  "client-dashboard": ScreenClientDashboard,
  "client-booking-detail": ScreenClientBookingDetail,
  "leave-review": ScreenLeaveReview,
  "client-messages": ScreenMessages,
  "client-profile": ScreenClientProfile,
  "client-history": ScreenClientHistory,

  // Coach
  "coach-dashboard": ScreenCoachDashboard,
  "coach-services-setup": ScreenCoachServicesSetup,
  "coach-availability-setup": ScreenCoachAvailabilitySetup,
  "coach-payout-setup": ScreenCoachPayoutSetup,
  "coach-setup-complete": ScreenCoachSetupComplete,
  "coach-calendar": ScreenCoachCalendar,
  "coach-bookings": ScreenCoachBookings,
  "coach-booking-detail": ScreenCoachBookingDetail,
  "coach-profile-edit": ScreenCoachProfileEdit,
  "coach-reels": ScreenCoachReels,
  "coach-create-package": ScreenCoachPackageForm,
  "coach-edit-package": ScreenCoachPackageForm,
  "coach-earnings": ScreenCoachEarnings,
  "coach-history": ScreenCoachHistory,
  "coach-messages": ScreenMessages,

  // Shared
  "chat-thread": ScreenChatThread,
  "support": ScreenSupport,
};

/** Metadata for developer inspect / quick directory jump */
export const ROUTE_METADATA = {
  // Onboarding
  "splash": { title: "Splash Screen", category: "Onboarding", role: "client" },
  "get-started": { title: "Get Started", category: "Onboarding", role: "client" },
  "role-select": { title: "Role Selection", category: "Onboarding", role: "client" },
  "auth": { title: "Auth / Login / Register", category: "Onboarding", role: "client" },
  "forgot-password": { title: "Forgot Password", category: "Onboarding", role: "client" },
  "reset-code": { title: "Reset Code Verification", category: "Onboarding", role: "client" },
  "reset-password": { title: "Reset Password", category: "Onboarding", role: "client" },
  "enable-biometric": { title: "Enable Biometrics", category: "Onboarding", role: "client" },
  "coach-register": { title: "Coach Register Step 1", category: "Onboarding", role: "coach" },
  "coach-info": { title: "Coach Info Step 2", category: "Onboarding", role: "coach" },
  "coach-expertise": { title: "Coach Expertise Step 3", category: "Onboarding", role: "coach" },
  "about-you-profile": { title: "Client Setup: Profile", category: "Onboarding", role: "client" },
  "client-setup-complete": { title: "Client Setup Complete", category: "Onboarding", role: "client" },
  "verification": { title: "Submit Verification Docs", category: "Onboarding", role: "coach" },
  "verification-pending": { title: "Verification Pending Banner", category: "Onboarding", role: "coach" },

  // Client Flow
  "client-home": { title: "Client Discover Home", category: "Client", role: "client" },
  "notifications": { title: "Notifications Log", category: "Client", role: "client" },
  "search-filters": { title: "Search & Filters", category: "Client", role: "client" },
  "coach-profile": { title: "Coach Profile Detail", category: "Client", role: "client" },
  "package-detail": { title: "Package Detail", category: "Client", role: "client" },
  "booking-participants": { title: "Booking Step 1: Participants", category: "Client", role: "client" },
  "booking-datetime": { title: "Booking Step 2: Date & Time", category: "Client", role: "client" },
  "booking-review": { title: "Booking Step 3: Review", category: "Client", role: "client" },
  "payment": { title: "Booking Step 4: Payment", category: "Client", role: "client" },
  "booking-confirmation": { title: "Booking Confirmation", category: "Client", role: "client" },
  "booking-request-sent": { title: "Booking Request Sent", category: "Client", role: "client" },
  "client-dashboard": { title: "Client Dashboard / Bookings", category: "Client", role: "client" },
  "client-booking-detail": { title: "Client Booking Detail", category: "Client", role: "client" },
  "leave-review": { title: "Leave Review & Rating", category: "Client", role: "client" },
  "client-messages": { title: "Client Messages Inbox", category: "Client", role: "client" },
  "client-profile": { title: "Client Account Profile", category: "Client", role: "client" },
  "client-history": { title: "Client Payment & Session History", category: "Client", role: "client" },

  // Coach Flow
  "coach-dashboard": { title: "Coach Dashboard", category: "Coach", role: "coach" },
  "coach-services-setup": { title: "Coach Setup: Services", category: "Coach", role: "coach" },
  "coach-availability-setup": { title: "Coach Setup: Availability", category: "Coach", role: "coach" },
  "coach-payout-setup": { title: "Coach Setup: Payouts", category: "Coach", role: "coach" },
  "coach-setup-complete": { title: "Coach Setup Complete", category: "Coach", role: "coach" },
  "coach-calendar": { title: "Coach Calendar & Slot Manager", category: "Coach", role: "coach" },
  "coach-bookings": { title: "Coach Bookings Queue", category: "Coach", role: "coach" },
  "coach-booking-detail": { title: "Coach Booking Request Detail", category: "Coach", role: "coach" },
  "coach-profile-edit": { title: "Edit Coach Public Profile", category: "Coach", role: "coach" },
  "coach-reels": { title: "Manage Video Reels & Photos", category: "Coach", role: "coach" },
  "coach-create-package": { title: "Create Service Package", category: "Coach", role: "coach" },
  "coach-edit-package": { title: "Edit Service Package", category: "Coach", role: "coach" },
  "coach-earnings": { title: "Earnings & Payout Analytics", category: "Coach", role: "coach" },
  "coach-history": { title: "Completed Sessions History", category: "Coach", role: "coach" },
  "coach-messages": { title: "Coach Messages Inbox", category: "Coach", role: "coach" },

  // Shared
  "chat-thread": { title: "Interactive Chat Thread", category: "Shared", role: "client" },
  "support": { title: "Help & Support Center", category: "Shared", role: "client" },
};
