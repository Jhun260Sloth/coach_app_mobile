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
  { suburb: "Fitzroy", state: "VIC", postcode: "3065" },
  { suburb: "Richmond", state: "VIC", postcode: "3121" },
  { suburb: "St Kilda", state: "VIC", postcode: "3182" },
  { suburb: "Carlton", state: "VIC", postcode: "3053" },
  { suburb: "Brunswick", state: "VIC", postcode: "3056" },
  { suburb: "South Yarra", state: "VIC", postcode: "3141" },
  { suburb: "Bondi", state: "NSW", postcode: "2026" },
  { suburb: "Surry Hills", state: "NSW", postcode: "2010" },
  { suburb: "Newtown", state: "NSW", postcode: "2042" },
  { suburb: "Manly", state: "NSW", postcode: "2095" },
  { suburb: "Parramatta", state: "NSW", postcode: "2150" },
  { suburb: "Sydney", state: "NSW", postcode: "2000" },
  { suburb: "South Brisbane", state: "QLD", postcode: "4101" },
  { suburb: "Fortitude Valley", state: "QLD", postcode: "4006" },
  { suburb: "New Farm", state: "QLD", postcode: "4005" },
  { suburb: "Surfers Paradise", state: "QLD", postcode: "4217" },
  { suburb: "North Adelaide", state: "SA", postcode: "5006" },
  { suburb: "Glenelg", state: "SA", postcode: "5045" },
  { suburb: "Fremantle", state: "WA", postcode: "6160" },
  { suburb: "Subiaco", state: "WA", postcode: "6008" },
  { suburb: "Perth", state: "WA", postcode: "6000" },
  { suburb: "Hobart", state: "TAS", postcode: "7000" },
  { suburb: "North Hobart", state: "TAS", postcode: "7000" },
  { suburb: "Canberra", state: "ACT", postcode: "2600" },
  { suburb: "Braddon", state: "ACT", postcode: "2612" },
  { suburb: "Darwin", state: "NT", postcode: "0800" },
];

export const SPORT_OPTIONS_FULL = [
  "Tennis", "Swimming", "Basketball", "Strength & Conditioning", "Football",
  "Yoga", "Rock Climbing", "Athletics", "Netball", "AFL", "Rugby League",
  "Rugby Union", "Cricket", "Golf", "Boxing", "Cycling", "Running",
  "Pilates", "Triathlon", "Surfing", "Volleyball", "Table Tennis",
  "Badminton", "Martial Arts", "CrossFit", "Gymnastics", "Hockey", "Squash",
];

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
