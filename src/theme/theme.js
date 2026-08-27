import { useEffect } from "react";

/* =========================================================================
   COACHNIVO THEME SYSTEM
   -------------------------------------------------------------------------
   Two complete color palettes (light / dark) using an orange brand identity:
     brandColor     #F15A29   — main brand orange (status bars, gradients)
     secondaryColor #F8A579   — brand shade 1 (highlights, accents)
     accentColor    #F8A579   — brand shade 1 / tints
     surfaceColor   #FDF1E8   — page backgrounds / card surfaces
     brandTint      #FDEBDD   — light soft orange fills (icon tiles, chips)

   brandIcon (#D94A17 light / #F8A579 dark) is a derived darker orange used
   for small text and icons on light backgrounds for contrast.

   IMPORTANT: text/neutral tokens (jet, jetSoft, slate, slateLight, border,
   onDark*) stay NEUTRAL (black/gray) in both modes — only the brand tokens
   (brand, brandTint, fog) carry orange. Primary CTA buttons are neutral:
   black background in light mode, white background in dark mode.

   Every token exists in both CL (light) and CD (dark) so components can
   switch at runtime:  const C = darkMode ? CD : CL;
   ========================================================================= */

export const CL = {
  // ── brand palette ───────────────────────────────────────────────
  brandColor: "#F15A29",
  secondary: "#F15A29",
  accent: "#F8A579",
  surface: "#FDF1E8",

  // ── neutral tokens (black / gray) ───────────────────────────────
  jet: "#16181D",
  jetSoft: "#2A2D35",
  slate: "#6B7280",
  slateLight: "#9CA3AF",
  border: "#E7E8EC",
  white: "#FFFFFF",
  black: "#000000",

  // ── brand semantic tokens (orange) ──────────────────────────────
  brand: "#F15A29",
  brandTint: "#FDEBDD",
  brandIcon: "#D94A17",
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
  brandColor: "#F15A29",
  secondary: "#F8A579",
  accent: "#F15A29",
  surface: "#201209",

  // ── neutral tokens (inverted for dark bg) ───────────────────────
  jet: "#E5E7EB",
  jetSoft: "#D1D5DB",
  slate: "#9CA3AF",
  slateLight: "#6B7280",
  border: "#2D2D3A",
  white: "#0D1117",
  black: "#FFFFFF",

  // ── brand semantic tokens (orange, adjusted for dark bg) ───────
  brand: "#F15A29",
  brandTint: "#3B2012",
  brandIcon: "#F8A579",
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

export function applyTheme(docElement, mode, themeColorOverride) {
  docElement.setAttribute("data-theme", mode);
  docElement.style.colorScheme = mode;
  const themeColor = themeColorOverride || (mode === "dark" ? CD.white : CL.white);
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = themeColor;
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

const FONT_IMPORT_ID = "coachnivo-fonts";
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

export const LOGO_WHITE_SRC = "/logo.png";

export const LOGO_SRCS = {
  green: "/logo.png",
  iconGreen: "/logo.png",
  iconWhite: "/logo.png",
  white: "/logo.png",
  logo: "/logo.png",
};

/* =========================================================================
   LAYOUT RHYTHM — shared sizes so every screen and shared component agrees
   on the same header heights, side gutters, bottom safe areas and corner
   radii. Reference these instead of hardcoding per screen.
   ========================================================================= */

export const LAYOUT = {
  statusBarH: 48,
  topBarH: 56,
  pagePadX: 18,
  pagePadTop: 16,
  headerPadTop: 6,
  tabClearance: 116,       // scroll padding on tab screens so content clears the floating tab island
  ctaPadBottom: 28,        // minimum safe-area padding for bottom-fixed action bars
  touchTarget: 44,
  cardRadius: 18,
  inputRadius: 13,
  buttonRadius: 14,
  sheetRadius: 26,
  pillRadius: 999,
};

/* =========================================================================
   KEYFRAMES
   ========================================================================= */

export const KEYFRAMES = `
@keyframes clPulse { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes clFadeUp { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
@keyframes clFadeIn { from{opacity:0} to{opacity:1} }
@keyframes clSlideUp { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:translateY(0)} }
@keyframes clScaleIn { from{opacity:0; transform:scale(.94)} to{opacity:1; transform:scale(1)} }
@keyframes clSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes clBackdropIn { from{opacity:0} to{opacity:1} }
@keyframes clSpin { to { transform: rotate(360deg); } }
@keyframes clPopIn { from{opacity:0; transform:scale(.85)} to{opacity:1; transform:scale(1)} }
@keyframes clScreenIn { from{opacity:0; transform:translateY(10px) scale(.995)} to{opacity:1; transform:translateY(0) scale(1)} }
@keyframes clToastIn { from{opacity:0; transform:translateY(10px) scale(.97)} to{opacity:1; transform:translateY(0) scale(1)} }
@keyframes clTabBounce { 0%{transform:translateY(0)} 40%{transform:translateY(-3px)} 100%{transform:translateY(0)} }
@keyframes clTouchFade { 0%{opacity:.85; transform:translate(-50%,-50%) scale(.55)} 55%{opacity:.35} 100%{opacity:0; transform:translate(-50%,-50%) scale(1.2)} }
@keyframes clSkeleton { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes clHeroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.cl-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.cl-hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
.cl-swipe-row { -webkit-overflow-scrolling: touch; touch-action: pan-x; scroll-snap-type: x proximity; overscroll-behavior-x: contain; }
.cl-swipe-row > * { scroll-snap-align: start; }
.cl-pressable { transition: transform .14s cubic-bezier(.2,.7,.3,1), opacity .18s ease; }
.cl-pressable:active { transform: scale(.97); }
.cl-stagger > * { animation: clSlideUp .4s cubic-bezier(.22,1,.36,1) backwards; }
`;
