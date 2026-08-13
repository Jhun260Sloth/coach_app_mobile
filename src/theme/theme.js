import { useEffect } from "react";

/* =========================================================================
   COACHLINK THEME SYSTEM
   -------------------------------------------------------------------------
   Two complete color palettes (light / dark) using a green brand identity:
     brandColor     #1B5E20   — deep brand green (dark brand elements)
     secondaryColor #66BB6A   — primary brand (buttons, accents, links)
     accentColor    #A5D6A7   — brand tints / highlights
     surfaceColor   #E8F5E9   — page backgrounds / card surfaces

   IMPORTANT: text/neutral tokens (jet, jetSoft, slate, slateLight, border,
   onDark*) stay NEUTRAL (black/gray) in both modes — only the brand tokens
   (brand, brandTint, fog) carry green.

   Every token exists in both CL (light) and CD (dark) so components can
   switch at runtime:  const C = darkMode ? CD : CL;
   ========================================================================= */

export const CL = {
  // ── brand palette ───────────────────────────────────────────────
  brandColor: "#1B5E20",
  secondary: "#2E7D32",
  accent: "#A5D6A7",
  surface: "#E8F5E9",

  // ── neutral tokens (black / gray) ───────────────────────────────
  jet: "#16181D",
  jetSoft: "#2A2D35",
  slate: "#6B7280",
  slateLight: "#9CA3AF",
  border: "#E7E8EC",
  white: "#FFFFFF",
  black: "#000000",

  // ── brand semantic tokens (green) ───────────────────────────────
  brand: "#2E7D32",
  brandTint: "#E8F5E9",
  brandIcon: "#1B5E20",
  fog: "#F4F5F7",

  // ── functional tokens ───────────────────────────────────────────
  success: "#1E9E5A",
  successTint: "#E9F9EF",
  warnTint: "#FFF4E9",
  warnStrong: "#B8860B",
  strong: "#C2410C",
  strongTint: "#FFE8D1",
  error: "#DC2626",
  errorTint: "#FEE2E2",
  danger: "#D64545",
  dangerTint: "#FDECEC",
  dangerBorder: "#F3D2D2",
  dangerBorderSoft: "#E8A5A5",
  info: "#2563EB",
  live: "#22C55E",

  // ── text on dark backgrounds ────────────────────────────────────
  onDark: "#B9BCC4",
  onDarkMuted: "#9CA0AC",
  onDarkFaint: "#6F7280",
  onDarkDivider: "#2B2E38",
};

export const CD = {
  // ── brand palette ───────────────────────────────────────────────
  brandColor: "#81C784",
  secondary: "#81C784",
  accent: "#1B5E20",
  surface: "#0D1F0D",

  // ── neutral tokens (inverted for dark bg) ───────────────────────
  jet: "#E5E7EB",
  jetSoft: "#D1D5DB",
  slate: "#9CA3AF",
  slateLight: "#6B7280",
  border: "#2D2D3A",
  white: "#0D1117",
  black: "#FFFFFF",

  // ── brand semantic tokens (green, adjusted for dark bg) ────────
  brand: "#81C784",
  brandTint: "#143315",
  brandIcon: "#81C784",
  fog: "#1A1A1A",

  // ── functional tokens ───────────────────────────────────────────
  success: "#4CAF50",
  successTint: "#0D2B0D",
  warnTint: "#2B2000",
  warnStrong: "#FFC107",
  strong: "#FF6D00",
  strongTint: "#2B1A0A",
  error: "#EF4444",
  errorTint: "#2B0A0A",
  danger: "#EF4444",
  dangerTint: "#2B0A0A",
  dangerBorder: "#3B1515",
  dangerBorderSoft: "#4B2020",
  info: "#42A5F5",
  live: "#81C784",

  // ── text on dark backgrounds ────────────────────────────────────
  onDark: "#B9BCC4",
  onDarkMuted: "#9CA0AC",
  onDarkFaint: "#6F7280",
  onDarkDivider: "#2B2E38",
};

export const C = CL;

export function applyTheme(docElement, mode) {
  docElement.setAttribute("data-theme", mode);
}

/* =========================================================================
   TYPOGRAPHY
   ========================================================================= */

export const T = {
  micro: 10,
  tiny: 10.5,
  caption: 11,
  captionLg: 11.5,
  label: 12,
  labelLg: 12.5,
  body: 13,
  bodyLg: 13.5,
  subtitle: 14,
  subtitleLg: 15,
  title: 16,
  titleLg: 17,
  heading: 18,
  headingLg: 20,
  display: 22,
  displayLg: 24,
  hero: 26,
  heroLg: 32,
};

/* =========================================================================
   FONTS
   ========================================================================= */

const FONT_IMPORT_ID = "coachlink-fonts";
export function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_IMPORT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_IMPORT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

export const fDisplay = { fontFamily: "'Outfit', sans-serif" };
export const fBody = { fontFamily: "'Inter', sans-serif" };

/* =========================================================================
   ASSETS
   ========================================================================= */

export const LOGO_WHITE_SRC = "logo-green.png";

export const LOGO_SRCS = {
  green: "logo-green.png",
  iconGreen: "logo icon-green.png",
  iconWhite: "logo icon-white.png",
  white: "logo-white.png",
};

/* =========================================================================
   KEYFRAMES
   ========================================================================= */

export const KEYFRAMES = `
@keyframes clPulse { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes clFadeUp { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
@keyframes clSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes clBackdropIn { from{opacity:0} to{opacity:1} }
@keyframes clSpin { to { transform: rotate(360deg); } }
@keyframes clPopIn { from{opacity:0; transform:scale(.85)} to{opacity:1; transform:scale(1)} }
.cl-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.cl-hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
.cl-swipe-row { -webkit-overflow-scrolling: touch; touch-action: pan-x; scroll-snap-type: x proximity; overscroll-behavior-x: contain; }
.cl-swipe-row > * { scroll-snap-align: start; }
`;
