import { useEffect } from "react";

export const C = {
  jet: "#16181D",
  jetSoft: "#2A2D35",
  orange: "#84cc15",
  orangeTint: "#e6f5d0",
  fog: "#F4F5F7",
  white: "#FFFFFF",
  black: "#000000",
  slate: "#6B7280",
  slateLight: "#9CA3AF",
  border: "#E7E8EC",
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
  onDark: "#B9BCC4",
  onDarkMuted: "#9CA0AC",
  onDarkFaint: "#6F7280",
  onDarkDivider: "#2B2E38",
};

export const T = {
  micro: 10,       // inline counters, file sizes, tiny meta
  tiny: 10.5,       // compact badges, pill labels
  caption: 11,      // secondary meta text (timestamps, helper copy)
  captionLg: 11.5,  // the default secondary/meta size used most often
  label: 12,        // form field labels, small icons' adjacent text
  labelLg: 12.5,    // section labels, card body copy — most common size
  body: 13,         // standard body copy
  bodyLg: 13.5,     // emphasized body copy, primary row labels
  subtitle: 14,     // list item titles, input text
  subtitleLg: 15,   // small headings, modal prompts
  title: 16,        // card/section titles
  titleLg: 17,      // prominent row titles
  heading: 18,      // sheet/dialog headings
  headingLg: 20,    // step headers
  display: 22,      // page titles
  displayLg: 24,    // large stat numbers, emphasized headers
  hero: 26,         // splash/onboarding headlines
  heroLg: 32,        // largest hero numerals
};

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

export const LOGO_WHITE_SRC = "logo-green.png";

export const KEYFRAMES = `
@keyframes clPulse { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes clFadeUp { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
@keyframes clSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes clBackdropIn { from{opacity:0} to{opacity:1} }
@keyframes clSpin { to { transform: rotate(360deg); } }
@keyframes clPopIn { from{opacity:0; transform:scale(.85)} to{opacity:1; transform:scale(1)} }
.cl-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.cl-hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
`;
