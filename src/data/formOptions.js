import { SPORT_NAMES } from "./sports";

/* =========================================================================
   FORM OPTION LISTS
   -------------------------------------------------------------------------
   Dropdown / select / multi-select options used by onboarding, profile
   edit, and filter screens. Separated from entity data so form screens
   can import these without pulling in the full coach/booking datasets.
   ========================================================================= */

export const LANGUAGE_OPTIONS = [
  "English", "Mandarin", "Cantonese", "Vietnamese", "Arabic", "Hindi", "Punjabi",
  "Spanish", "Italian", "Greek", "Korean", "Japanese", "French", "German",
  "Tagalog", "Thai", "Indonesian", "Portuguese", "Turkish", "Auslan",
];

export const GENDER_OPTIONS = ["Male", "Female", "Non-binary"];

export const AU_SUBURBS = [
  { suburb: "Fitzroy", state: "VIC", postcode: "3065", lat: -37.8015, lng: 144.978 },
  { suburb: "Richmond", state: "VIC", postcode: "3121", lat: -37.823, lng: 144.9985 },
  { suburb: "St Kilda", state: "VIC", postcode: "3182", lat: -37.8675, lng: 144.978 },
  { suburb: "Carlton", state: "VIC", postcode: "3053", lat: -37.8, lng: 144.965 },
  { suburb: "Brunswick", state: "VIC", postcode: "3056", lat: -37.767, lng: 144.962 },
  { suburb: "South Yarra", state: "VIC", postcode: "3141", lat: -37.838, lng: 144.991 },
  { suburb: "Bondi", state: "NSW", postcode: "2026", lat: -33.8915, lng: 151.2765 },
  { suburb: "Surry Hills", state: "NSW", postcode: "2010", lat: -33.8865, lng: 151.2095 },
  { suburb: "Newtown", state: "NSW", postcode: "2042", lat: -33.898, lng: 151.1795 },
  { suburb: "Manly", state: "NSW", postcode: "2095", lat: -33.798, lng: 151.2885 },
  { suburb: "Parramatta", state: "NSW", postcode: "2150", lat: -33.815, lng: 151.001 },
  { suburb: "Sydney", state: "NSW", postcode: "2000", lat: -33.8688, lng: 151.2093 },
  { suburb: "South Brisbane", state: "QLD", postcode: "4101", lat: -27.4825, lng: 153.016 },
  { suburb: "Fortitude Valley", state: "QLD", postcode: "4006", lat: -27.456, lng: 153.035 },
  { suburb: "New Farm", state: "QLD", postcode: "4005", lat: -27.466, lng: 153.047 },
  { suburb: "Surfers Paradise", state: "QLD", postcode: "4217", lat: -28.002, lng: 153.429 },
  { suburb: "North Adelaide", state: "SA", postcode: "5006", lat: -34.906, lng: 138.593 },
  { suburb: "Glenelg", state: "SA", postcode: "5045", lat: -34.981, lng: 138.516 },
  { suburb: "Fremantle", state: "WA", postcode: "6160", lat: -32.056, lng: 115.748 },
  { suburb: "Subiaco", state: "WA", postcode: "6008", lat: -31.949, lng: 115.826 },
  { suburb: "Perth", state: "WA", postcode: "6000", lat: -31.9523, lng: 115.8613 },
  { suburb: "Hobart", state: "TAS", postcode: "7000", lat: -42.8821, lng: 147.3272 },
  { suburb: "North Hobart", state: "TAS", postcode: "7000", lat: -42.875, lng: 147.315 },
  { suburb: "Canberra", state: "ACT", postcode: "2600", lat: -35.2809, lng: 149.13 },
  { suburb: "Braddon", state: "ACT", postcode: "2612", lat: -35.271, lng: 149.134 },
  { suburb: "Darwin", state: "NT", postcode: "0800", lat: -12.4634, lng: 130.8456 },
];

export const SPORT_OPTIONS_FULL = SPORT_NAMES;

export const COACHING_CATEGORY_OPTIONS = [
  "1-on-1 private coaching", "Small group sessions", "Team coaching",
  "Squad / program training", "Online coaching", "Corporate / school programs",
];

export const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Elite / competitive"];

export const AGE_GROUP_OPTIONS = ["Under 12", "13–17", "18–24", "25–40", "40+"];

export const COACHING_EXPERIENCE_LEVELS = [
  "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years",
];

export const COACHING_FORMAT_OPTIONS = ["In person", "Online / virtual", "Hybrid"];

export const ID_TYPE_OPTIONS = ["Driver licence", "Passport", "Proof of age card"];

export const CERTIFICATION_TYPE_OPTIONS = [
  "Coaching accreditation", "First Aid", "CPR", "Sport-specific certification", "Other",
];
