export const APP_ROLES = ["client", "coach", "business"];

export const ROLE_CONFIG = {
  client: { label: "Client", home: "client-home", supportTopic: "client", onboarding: "about-you-profile" },
  coach: { label: "Coach", home: "coach-dashboard", supportTopic: "coach", onboarding: "coach-info" },
  business: { label: "Business", home: "business-dashboard", supportTopic: "business", onboarding: "business-eligibility" },
};

export const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.client;
export const getRoleHome = (role) => getRoleConfig(role).home;
export const getRoleOnboarding = (role) => getRoleConfig(role).onboarding;

