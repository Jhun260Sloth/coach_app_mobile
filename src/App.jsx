import React, { useState, useRef, useEffect } from "react";
import {
  Home, Calendar, MessageCircle, User, ClipboardList, ShieldCheck, AlertCircle, Flag, Settings,
  WifiOff, RefreshCcw, Sparkles, ChevronRight, ChevronDown, ChevronUp, Layers, ArrowLeft, Search, Compass, ExternalLink, Activity,
  Smartphone, Tablet, Sun, Moon, Maximize2, RotateCw, Sliders, Eye, EyeOff, Monitor, ZoomIn, ZoomOut,
  Camera, Download, Loader2
} from "lucide-react";

import { CL, CD, fBody, fDisplay, useFonts, KEYFRAMES, T } from "./theme/theme";
import { INITIAL_BOOKINGS } from "./data/bookings";
import { COACHES } from "./data/coaches";
import { LogoMark, Toast, BottomTabs, StatusBar } from "./components/ui/Primitives";
import { AppProvider, useApp } from "./context/AppContext";
import { ROUTES, ROUTE_METADATA } from "./router/routes";
import { downloadElementAsPng } from "./utils/screenshot";

/* =========================================================================
   ERROR BOUNDARY — Catches any screen-level exceptions gracefully
   ========================================================================= */
class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Screen Error caught:", error, errorInfo);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.screen !== this.props.screen) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", background: "#FFFFFF" }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <AlertCircle size={24} color="#EF4444" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Screen Display Error</div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 20, maxWidth: 280 }}>
            {this.state.error?.message || "An unexpected error occurred while rendering this screen."}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset?.();
            }}
            style={{ padding: "10px 20px", borderRadius: 12, background: "#111827", color: "#FFFFFF", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Reset to Discover Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================================================================
   TAB DEFINITIONS
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

/* =========================================================================
   SIDEBAR & CANVAS DESKTOP SHELL — Vercel / Notion Style System UI
   ========================================================================= */
function AppShell() {
  useFonts();
  const app = useApp();
  const {
    screen, role, history, goBack, resetNav, goToHistory, toastMsg, offline, setOffline,
    darkMode, toggleDarkMode,
    isFirstTimeClient, setIsFirstTimeClient, setDiscoveryPrefs, setBookings,
    setShowPostSignupGuide, verificationStatus, reachedDashboardAfterVerification,
    resetAll,
  } = app;

  const [dirFilter, setDirFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toolbar & Canvas Customization States
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [devicePreset, setDevicePreset] = useState("iphone-15");
  const [canvasTheme, setCanvasTheme] = useState("light");
  const [zoomScale, setZoomScale] = useState(100);
  const [showFrame, setShowFrame] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [customWidth, setCustomWidth] = useState(393);
  const [customHeight, setCustomHeight] = useState(852);
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);

  // Screenshot Capture States & Refs
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isScreenshotMenuOpen, setIsScreenshotMenuOpen] = useState(false);
  const deviceFrameRef = useRef(null);
  const screenDisplayRef = useRef(null);

  const C = darkMode ? CD : CL;
  const isDarkScreen = screen === "splash";
  const tabsForRole = role === "coach" ? COACH_TABS : CLIENT_TABS;
  const activeTabScreen = screen;
  const showTabs = tabsForRole.some((t) => t.value === activeTabScreen);

  // Take screenshot and export as PNG
  const handleTakeScreenshot = async (captureMode = "current") => {
    if (isCapturing) return;
    setIsCapturing(true);
    setIsScreenshotMenuOpen(false);

    try {
      let targetEl = null;
      if (captureMode === "screen") {
        targetEl = screenDisplayRef.current;
      } else if (captureMode === "frame") {
        targetEl = deviceFrameRef.current;
      } else {
        targetEl = showFrame ? deviceFrameRef.current : screenDisplayRef.current;
      }

      if (!targetEl) {
        targetEl = screenDisplayRef.current || deviceFrameRef.current;
      }

      // Shutter flash animation
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 260);

      const timeStamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const modeTag = captureMode === "screen" ? "screen" : (showFrame ? "mockup" : "screen");
      const fileName = `coachlink-${screen}-${modeTag}-${timeStamp}`;

      await downloadElementAsPng(targetEl, {
        fileName,
        pixelRatio: 2,
      });

      if (app.toast) {
        app.toast("Prototype screenshot downloaded as PNG!");
      }
    } catch (err) {
      console.error("Screenshot capture error:", err);
      if (app.toast) {
        app.toast("Could not take screenshot. Please try again.");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Native (non-passive) wheel listener on the phone screen area: translates
  // vertical mouse-wheel deltas into horizontal scrolling for the swipeable
  // chip/filter rows, so mouse users can scroll them just like vertical lists.
  const screenWrapRef = useRef(null);
  useEffect(() => {
    const el = screenWrapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!e.deltaY) return;
      let node = e.target;
      while (node && node !== el) {
        const style = window.getComputedStyle(node);
        const scrollsX = style.overflowX === "auto" || style.overflowX === "scroll";
        if (scrollsX && node.scrollWidth > node.clientWidth + 1) {
          const before = node.scrollLeft;
          node.scrollLeft += e.deltaY;
          if (node.scrollLeft !== before) e.preventDefault();
          return;
        }
        node = node.parentElement;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Resolve current screen component
  const ScreenComponent = ROUTES[screen] || ROUTES["splash"];
  const currentMeta = ROUTE_METADATA[screen] || { title: screen, category: "App Screen", role };

  const screenProps = { ...app };

  // Filtered route list for directory
  const routeKeys = Object.keys(ROUTES);
  const filteredRoutes = routeKeys.filter((key) => {
    const meta = ROUTE_METADATA[key] || { title: key, category: "Other" };
    const matchesFilter = dirFilter === "all" || meta.category === dirFilter;
    const matchesSearch = !searchQuery.trim() ||
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meta.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Device Presets definitions
  const PRESETS = {
    "iphone-15": { name: "iPhone 15", icon: Smartphone, width: 393, height: 852, radius: 54, innerRadius: 44, hasIsland: true },
    "iphone-se": { name: "iPhone SE", icon: Smartphone, width: 375, height: 667, radius: 40, innerRadius: 30, hasIsland: false },
    "android": { name: "Android Pro", icon: Smartphone, width: 412, height: 915, radius: 48, innerRadius: 38, hasIsland: false },
    "pixel": { name: "Google Pixel", icon: Smartphone, width: 412, height: 760, radius: 48, innerRadius: 38, hasIsland: false },
    "tablet": { name: "iPad / Tablet", icon: Tablet, width: 768, height: 1024, radius: 36, innerRadius: 26, hasIsland: false },
    "custom": { name: "Custom Size", icon: Sliders, width: customWidth, height: customHeight, radius: 24, innerRadius: 16, hasIsland: false },
  };

  const activePreset = PRESETS[devicePreset] || PRESETS["iphone-15"];
  const targetWidth = isLandscape ? activePreset.height : activePreset.width;
  const targetHeight = isLandscape ? activePreset.width : activePreset.height;

  const studioTheme = canvasTheme;
  const studioBg = studioTheme === "dark" ? "#0A0B0E" : "#FAFAFA";
  const studioCanvasBg = studioTheme === "dark"
    ? "radial-gradient(circle at 50% 0%, #171717 0%, #0A0A0A 100%)"
    : "radial-gradient(circle at 50% 0%, #F5F5F5 0%, #E5E5E5 100%)";

  // Vercel / Notion Style tokens for SYSTEM UI (outer wrapper only)
  const vSystem = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    bgSidebar: studioTheme === "dark" ? "#0D1117" : "#FFFFFF",
    border: studioTheme === "dark" ? "#21262D" : "#E5E7EB",
    textPrimary: studioTheme === "dark" ? "#E8F5E9" : "#111827",
    textSecondary: studioTheme === "dark" ? "#81A881" : "#6B7280",
    textMuted: studioTheme === "dark" ? "#5C8A5C" : "#9CA3AF",
    bgHover: studioTheme === "dark" ? "#21262D" : "#F3F4F6",
    bgActive: studioTheme === "dark" ? "#161B22" : "#F9FAFB",
  };

  // Auto-scroll active screen item in directory into view
  const activeItemRef = useRef(null);
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [screen, dirFilter, searchQuery]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", background: studioBg, fontFamily: vSystem.fontFamily }}>
      <style>{KEYFRAMES}</style>

      {/* =========================================================================
          LEFT SIDEBAR — Notion / Vercel Style Controls & Screen Directory
          ========================================================================= */}
      <aside style={{
        width: 340, minWidth: 300, maxWidth: 360, height: "100vh", background: vSystem.bgSidebar,
        borderRight: `1px solid ${vSystem.border}`, display: "flex", flexDirection: "column",
        zIndex: 20, flexShrink: 0, fontFamily: vSystem.fontFamily,
      }}>
        {/* Header */}
        <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${vSystem.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={22} system />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: vSystem.textPrimary, letterSpacing: "-0.3px", fontFamily: vSystem.fontFamily }}>
                CoachLink Studio
              </div>
              <div style={{ fontSize: 11, color: vSystem.textSecondary, fontWeight: 500, marginTop: -1 }}>
                App Navigation
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Control Body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 18px", overflow: "hidden", minHeight: 0 }} className="cl-hide-scrollbar">
          
          {/* SECTION 1: ROLE SWITCHER (Vercel Segmented Control) */}
          <div style={{ marginBottom: 14, flexShrink: 0 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: vSystem.textMuted, fontWeight: 700, marginBottom: 7 }}>
              Roles
            </div>
            <div style={{ display: "flex", background: vSystem.bgHover, borderRadius: 8, padding: 2, border: `1px solid ${vSystem.border}` }}>
              {["client", "coach"].map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      if (r === "coach") {
                        const stillOnVerification = (verificationStatus === "pending" || verificationStatus === "approved") && !reachedDashboardAfterVerification;
                        resetNav(verificationStatus === "rejected" ? "verification-rejected" : stillOnVerification ? "verification-pending" : "coach-dashboard", {}, r);
                      } else {
                        resetNav("client-home", {}, r);
                      }
                    }}
                    style={{
                      flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer",
                      background: active ? vSystem.bgSidebar : "transparent",
                      color: active ? vSystem.textPrimary : vSystem.textSecondary,
                      fontWeight: active ? 600 : 500, fontSize: 12,
                      boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                      textTransform: "capitalize", transition: "all 0.12s ease", fontFamily: vSystem.fontFamily,
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Action Toggles */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {role === "client" && (
                <button
                  onClick={() => {
                    setIsFirstTimeClient((v) => !v);
                    if (!isFirstTimeClient) { setDiscoveryPrefs(null); setBookings([]); setShowPostSignupGuide(true); }
                    else { setDiscoveryPrefs({ seeded: true }); setBookings(INITIAL_BOOKINGS); setShowPostSignupGuide(false); }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6,
                    border: `1px solid ${isFirstTimeClient ? "#10B981" : vSystem.border}`,
                    background: isFirstTimeClient ? "#ECFDF5" : vSystem.bgSidebar,
                    color: isFirstTimeClient ? "#047857" : vSystem.textPrimary, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: vSystem.fontFamily,
                  }}
                >
                  <Sparkles size={11} /> New Client
                </button>
              )}
              <button
                onClick={() => setOffline((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6,
                  border: `1px solid ${offline ? "#EF4444" : vSystem.border}`,
                  background: offline ? "#FEF2F2" : vSystem.bgSidebar,
                  color: offline ? "#B91C1C" : vSystem.textPrimary, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: vSystem.fontFamily,
                }}
              >
                <WifiOff size={11} /> {offline ? "Offline" : "Online"}
              </button>
              <button
                onClick={resetAll}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6,
                  border: `1px solid ${vSystem.border}`, background: vSystem.bgSidebar, color: vSystem.textPrimary,
                  fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: vSystem.fontFamily,
                }}
              >
                <RefreshCcw size={11} /> Reset State
              </button>
            </div>
          </div>

          {/* SECTION 2: ACTIVE FLOW & INSPECTOR */}
          <div style={{ background: vSystem.bgActive, borderRadius: 10, padding: 12, marginBottom: 14, border: `1px solid ${vSystem.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: vSystem.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Activity size={11} color={vSystem.textPrimary} /> Active Screen Flow
              </div>
              {history.length > 0 && (
                <button
                  onClick={goBack}
                  style={{ display: "flex", alignItems: "center", gap: 3, background: vSystem.bgSidebar, border: `1px solid ${vSystem.border}`, borderRadius: 5, padding: "2px 6px", fontSize: 10, fontWeight: 600, color: vSystem.textPrimary, cursor: "pointer" }}
                >
                  <ArrowLeft size={9} /> Back
                </button>
              )}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: vSystem.textPrimary, letterSpacing: "-0.2px", fontFamily: vSystem.fontFamily }}>
              {currentMeta.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", background: vSystem.bgSidebar, border: `1px solid ${vSystem.border}`, borderRadius: 4, padding: "1px 5px", color: vSystem.textSecondary }}>
                {screen}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: vSystem.textPrimary, background: vSystem.bgHover, borderRadius: 4, padding: "1px 5px", border: `1px solid ${vSystem.border}` }}>
                {currentMeta.category}
              </span>
            </div>

            {/* Breadcrumb Flow Stack */}
            {history.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${vSystem.border}` }}>
                <div style={{ fontSize: 10, color: vSystem.textMuted, fontWeight: 500, marginBottom: 3 }}>
                  Navigation Stack ({history.length}):
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                  {history.slice(-4).map((hStep, idx) => {
                    const historyIndex = Math.max(0, history.length - 4) + idx;
                    const historyScreen = typeof hStep === "string" ? hStep : hStep.screen;
                    return (
                    <React.Fragment key={`${historyScreen}-${historyIndex}`}>
                      <span
                        onClick={() => goToHistory(historyIndex)}
                        style={{ fontSize: 10, color: vSystem.textSecondary, cursor: "pointer", textDecoration: "underline" }}
                      >
                        {historyScreen}
                      </span>
                      <ChevronRight size={9} color={vSystem.textMuted} />
                    </React.Fragment>
                    );
                  })}
                  <span style={{ fontSize: 10, fontWeight: 700, color: vSystem.textPrimary }}>{screen}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SCREEN DIRECTORY (Full Height Flex Container) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexShrink: 0 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: vSystem.textMuted, fontWeight: 700 }}>
                Screen Directory ({filteredRoutes.length})
              </div>
              <Compass size={13} color={vSystem.textMuted} />
            </div>

            {/* Search Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: vSystem.bgActive, border: `1px solid ${vSystem.border}`, borderRadius: 8, padding: "5px 9px", marginBottom: 8, flexShrink: 0 }}>
              <Search size={13} color={vSystem.textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search screens..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, flex: 1, color: vSystem.textPrimary, fontFamily: vSystem.fontFamily }}
              />
            </div>

            {/* Category Chips */}
            <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 8, flexShrink: 0 }} className="cl-hide-scrollbar">
              {["all", "Client", "Coach", "Onboarding", "Shared"].map((cat) => {
                const active = dirFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setDirFilter(cat)}
                    style={{
                      padding: "2px 8px", borderRadius: 6, border: `1px solid ${active ? vSystem.textPrimary : vSystem.border}`,
                      background: active ? vSystem.textPrimary : vSystem.bgSidebar, color: active ? vSystem.bgSidebar : vSystem.textSecondary,
                      fontSize: 11, fontWeight: active ? 600 : 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: vSystem.fontFamily,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Screen List (Full height with smooth auto-scroll to highlighted screen) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", minHeight: 0 }} className="cl-hide-scrollbar">
              {filteredRoutes.map((key) => {
                const meta = ROUTE_METADATA[key] || { title: key, category: "App" };
                const isSelected = screen === key;
                return (
                  <button
                    key={key}
                    ref={isSelected ? activeItemRef : null}
                    onClick={() => {
                      resetNav(key, meta.demoParams || {}, meta.role || role);
                    }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                      padding: "6px 8px", borderRadius: 6, border: `1px solid ${isSelected ? vSystem.textPrimary : "transparent"}`,
                      background: isSelected ? vSystem.bgHover : "transparent", textAlign: "left", cursor: "pointer",
                      transition: "all 0.1s ease", flexShrink: 0,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? vSystem.textPrimary : vSystem.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: vSystem.fontFamily }}>
                        {meta.title}
                      </div>
                      <div style={{ fontSize: 10, color: vSystem.textMuted, fontFamily: "monospace" }}>
                        {key}
                      </div>
                    </div>
                    <ChevronRight size={12} color={isSelected ? vSystem.textPrimary : vSystem.border} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN VIEWPORT — CANVAS WORKSPACE + COLLAPSIBLE TOP PREVIEW TOOLBAR
          ========================================================================= */}
      <main style={{
        flex: 1, height: "100vh", display: "flex", flexDirection: "column",
        background: studioCanvasBg,
        position: "relative", overflow: "hidden", transition: "background 0.2s ease",
      }}>

        {/* COLLAPSIBLE TOP PREVIEW TOOLBAR */}
        {isToolbarOpen ? (
          <header style={{
            padding: "8px 16px", borderBottom: `1px solid ${studioTheme === "dark" ? "#262626" : "#E5E7EB"}`,
            background: studioTheme === "dark" ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: 8,
            zIndex: 15, flexShrink: 0, transition: "all 0.2s ease",
          }}>
            {/* Main Row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              
              {/* Left Controls: Responsive Device Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: studioTheme === "dark" ? "#A3A3A3" : "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Device:
                </span>
                
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setIsDeviceMenuOpen((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6,
                      border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                      background: studioTheme === "dark" ? "#171717" : "#FFFFFF",
                      color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: vSystem.fontFamily,
                    }}
                  >
                    {activePreset.icon && React.createElement(activePreset.icon, { size: 13 })}
                    <span>{activePreset.name}</span>
                    <ChevronDown size={12} color={studioTheme === "dark" ? "#A3A3A3" : "#6B7280"} />
                  </button>

                  {isDeviceMenuOpen && (
                    <div
                      onMouseLeave={() => setIsDeviceMenuOpen(false)}
                      style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: 210,
                        background: studioTheme === "dark" ? "#171717" : "#FFFFFF",
                        border: `1px solid ${studioTheme === "dark" ? "#333333" : "#E5E7EB"}`,
                        borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 50,
                        padding: 4, display: "flex", flexDirection: "column", gap: 2,
                      }}
                    >
                      {Object.keys(PRESETS).map((pKey) => {
                        const preset = PRESETS[pKey];
                        const Icon = preset.icon;
                        const isSelected = devicePreset === pKey;
                        return (
                          <button
                            key={pKey}
                            onClick={() => {
                              setDevicePreset(pKey);
                              setIsDeviceMenuOpen(false);
                            }}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                              padding: "6px 9px", borderRadius: 6, border: "none",
                              background: isSelected ? (studioTheme === "dark" ? "#262626" : "#F3F4F6") : "transparent",
                              color: isSelected ? (studioTheme === "dark" ? "#FFFFFF" : "#000000") : (studioTheme === "dark" ? "#A3A3A3" : "#374151"),
                              fontWeight: isSelected ? 600 : 500, fontSize: 12, textAlign: "left", cursor: "pointer",
                              fontFamily: vSystem.fontFamily, transition: "all 0.1s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <Icon size={13} />
                              <span>{preset.name}</span>
                            </div>
                            <span style={{ fontSize: 10, fontFamily: "monospace", color: vSystem.textMuted }}>
                              {preset.width}×{preset.height}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Dimension Badge */}
                <span style={{
                  fontSize: 11, fontWeight: 600, fontFamily: "monospace", padding: "3px 8px", borderRadius: 5,
                  background: studioTheme === "dark" ? "#262626" : "#F3F4F6",
                  color: studioTheme === "dark" ? "#D4D4D4" : "#4B5563", border: `1px solid ${studioTheme === "dark" ? "#333" : "#E5E7EB"}`,
                }}>
                  {targetWidth} × {targetHeight} px
                </span>
              </div>

              {/* Right Controls: Rotate, Frame Toggle, Zoom, Screenshot & Canvas Theme */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                
                {/* Rotate Portrait / Landscape */}
                <button
                  onClick={() => setIsLandscape((v) => !v)}
                  title="Rotate Screen (Portrait / Landscape)"
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6,
                    border: `1px solid ${isLandscape ? "#000000" : studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                    background: isLandscape ? "#000000" : studioTheme === "dark" ? "#171717" : "#FFFFFF",
                    color: isLandscape ? "#FFFFFF" : studioTheme === "dark" ? "#FFFFFF" : "#111827",
                    fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: vSystem.fontFamily,
                  }}
                >
                  <RotateCw size={12} />
                  <span>{isLandscape ? "Landscape" : "Portrait"}</span>
                </button>

                {/* Frame On/Off Toggle */}
                <button
                  onClick={() => setShowFrame((v) => !v)}
                  title="Toggle Device Frame Border & Chassis"
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6,
                    border: `1px solid ${!showFrame ? "#000000" : studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                    background: !showFrame ? "#000000" : studioTheme === "dark" ? "#171717" : "#FFFFFF",
                    color: !showFrame ? "#FFFFFF" : studioTheme === "dark" ? "#FFFFFF" : "#111827",
                    fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: vSystem.fontFamily,
                  }}
                >
                  {!showFrame ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showFrame ? "Frame On" : "Screen Only"}</span>
                </button>

                {/* Screenshot / Download PNG Button with Dropdown Option */}
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <button
                    onClick={() => handleTakeScreenshot("current")}
                    disabled={isCapturing}
                    title="Take Screenshot of App Prototype & Download as PNG"
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: "6px 0 0 6px",
                      border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                      borderRight: "none",
                      background: isCapturing
                        ? (studioTheme === "dark" ? "#262626" : "#E5E7EB")
                        : (studioTheme === "dark" ? "#171717" : "#FFFFFF"),
                      color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                      fontSize: 11, fontWeight: 600, cursor: isCapturing ? "wait" : "pointer", fontFamily: vSystem.fontFamily,
                      transition: "all 0.12s ease",
                    }}
                  >
                    {isCapturing ? (
                      <Loader2 size={12} style={{ animation: "clSpin 0.8s linear infinite" }} />
                    ) : (
                      <Camera size={12} color={studioTheme === "dark" ? "#A5D6A7" : "#2E7D32"} />
                    )}
                    <span>{isCapturing ? "Capturing..." : "Screenshot"}</span>
                    <Download size={10} style={{ opacity: 0.6, marginLeft: 1 }} />
                  </button>

                  <button
                    onClick={() => setIsScreenshotMenuOpen((v) => !v)}
                    disabled={isCapturing}
                    title="Screenshot Options"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 6px", borderRadius: "0 6px 6px 0",
                      border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                      background: studioTheme === "dark" ? "#171717" : "#FFFFFF",
                      color: studioTheme === "dark" ? "#A3A3A3" : "#6B7280",
                      cursor: isCapturing ? "wait" : "pointer",
                    }}
                  >
                    <ChevronDown size={11} />
                  </button>

                  {/* Screenshot Options Dropdown */}
                  {isScreenshotMenuOpen && (
                    <div
                      onMouseLeave={() => setIsScreenshotMenuOpen(false)}
                      style={{
                        position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 220,
                        background: studioTheme === "dark" ? "#171717" : "#FFFFFF",
                        border: `1px solid ${studioTheme === "dark" ? "#333333" : "#E5E7EB"}`,
                        borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 50,
                        padding: 4, display: "flex", flexDirection: "column", gap: 2,
                      }}
                    >
                      <div style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: vSystem.textMuted, letterSpacing: "0.05em" }}>
                        Download PNG
                      </div>
                      
                      <button
                        onClick={() => handleTakeScreenshot("current")}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 5,
                          border: "none", background: "transparent", color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                          fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: vSystem.fontFamily,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = studioTheme === "dark" ? "#262626" : "#F3F4F6"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Camera size={13} color="#2E7D32" />
                        <div style={{ flex: 1 }}>
                          <div>Current View (PNG)</div>
                          <div style={{ fontSize: 10, color: vSystem.textMuted }}>{showFrame ? "With device mockup" : "Clean screen only"}</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTakeScreenshot("screen")}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 5,
                          border: "none", background: "transparent", color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                          fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: vSystem.fontFamily,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = studioTheme === "dark" ? "#262626" : "#F3F4F6"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Smartphone size={13} color="#2563EB" />
                        <div style={{ flex: 1 }}>
                          <div>App Screen Only</div>
                          <div style={{ fontSize: 10, color: vSystem.textMuted }}>Pure mobile UI without chassis</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTakeScreenshot("frame")}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: 5,
                          border: "none", background: "transparent", color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                          fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: vSystem.fontFamily,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = studioTheme === "dark" ? "#262626" : "#F3F4F6"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Monitor size={13} color="#7C3AED" />
                        <div style={{ flex: 1 }}>
                          <div>Device Mockup Frame</div>
                          <div style={{ fontSize: 10, color: vSystem.textMuted }}>Includes hardware frame & island</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Zoom Levels */}
                <div style={{ display: "flex", background: studioTheme === "dark" ? "#262626" : "#F3F4F6", borderRadius: 6, padding: 2, border: `1px solid ${studioTheme === "dark" ? "#333" : "#E5E7EB"}` }}>
                  {[80, 90, 100, 110].map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoomScale(z)}
                      style={{
                        padding: "2px 7px", borderRadius: 4, border: "none", cursor: "pointer",
                        background: zoomScale === z ? (studioTheme === "dark" ? "#404040" : "#FFFFFF") : "transparent",
                        color: zoomScale === z ? (studioTheme === "dark" ? "#FFFFFF" : "#000000") : (studioTheme === "dark" ? "#A3A3A3" : "#6B7280"),
                        fontWeight: zoomScale === z ? 600 : 500, fontSize: 11, fontFamily: vSystem.fontFamily,
                      }}
                    >
                      {z}%
                    </button>
                  ))}
                </div>

                {/* Dark Mode Toggle (toggles the phone app's dark/light mode) */}
                <button
                  onClick={toggleDarkMode}
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6,
                    border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                    background: studioTheme === "dark" ? "#171717" : "#FFFFFF",
                    color: studioTheme === "dark" ? "#FACC15" : "#111827", cursor: "pointer",
                  }}
                >
                  {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                </button>

                {/* Collapse Toolbar Arrow Button */}
                <button
                  onClick={() => setIsToolbarOpen(false)}
                  title="Collapse Toolbar"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6,
                    border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                    background: studioTheme === "dark" ? "#171717" : "#FFFFFF",
                    color: studioTheme === "dark" ? "#A3A3A3" : "#6B7280", cursor: "pointer",
                  }}
                >
                  <ChevronUp size={14} />
                </button>

              </div>
            </div>

            {/* Custom Sliders */}
            {devicePreset === "custom" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 20, paddingTop: 6,
                borderTop: `1px solid ${studioTheme === "dark" ? "#262626" : "#E5E7EB"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: studioTheme === "dark" ? "#E5E5E5" : "#111827" }}>Width: {customWidth}px</span>
                  <input
                    type="range" min={320} max={1024} step={5}
                    value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))}
                    style={{ cursor: "pointer", accentColor: "#000000" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: studioTheme === "dark" ? "#E5E5E5" : "#111827" }}>Height: {customHeight}px</span>
                  <input
                    type="range" min={500} max={1200} step={5}
                    value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))}
                    style={{ cursor: "pointer", accentColor: "#000000" }}
                  />
                </div>
              </div>
            )}
          </header>
        ) : (
          /* FLOATING TRIGGER WHEN COLLAPSED */
          <div style={{ position: "absolute", top: 12, right: 20, zIndex: 15, display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => handleTakeScreenshot("current")}
              disabled={isCapturing}
              title="Quick Screenshot"
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 20,
                border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                background: studioTheme === "dark" ? "rgba(24,24,24,0.92)" : "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)", color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                fontSize: 11, fontWeight: 600, cursor: isCapturing ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontFamily: vSystem.fontFamily,
              }}
            >
              {isCapturing ? (
                <Loader2 size={12} style={{ animation: "clSpin 0.8s linear infinite" }} />
              ) : (
                <Camera size={12} color={studioTheme === "dark" ? "#A5D6A7" : "#2E7D32"} />
              )}
              <span>{isCapturing ? "Capturing..." : "Screenshot"}</span>
            </button>

            <button
              onClick={() => setIsToolbarOpen(true)}
              title="Expand Toolbar Controls"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20,
                border: `1px solid ${studioTheme === "dark" ? "#333333" : "#D1D5DB"}`,
                background: studioTheme === "dark" ? "rgba(24,24,24,0.92)" : "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)", color: studioTheme === "dark" ? "#FFFFFF" : "#111827",
                fontSize: 11, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontFamily: vSystem.fontFamily,
              }}
            >
              <span>{activePreset.name} ({targetWidth}×{targetHeight})</span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}

        {/* WORKSPACE CANVAS WITH DEVICE FRAME */}
        <div style={{
          flex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px 16px", overflowY: "auto", position: "relative",
        }}>
          {/* Scalable Container */}
          <div style={{
            transform: `scale(${zoomScale / 100})`, transformOrigin: "center center",
            transition: "transform 0.2s ease, width 0.25s ease, height 0.25s ease",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "auto",
          }}>

            {/* DEVICE FRAME / SCREEN VIEWPORT */}
            <div ref={deviceFrameRef} style={{
              width: targetWidth, minWidth: targetWidth, height: targetHeight, minHeight: targetHeight,
              background: showFrame ? "#18181B" : "transparent",
              borderRadius: showFrame ? activePreset.radius : 16,
              padding: showFrame ? 10 : 0,
              boxShadow: showFrame
                ? (canvasTheme === "dark"
                    ? "0 25px 60px -15px rgba(0,0,0,0.9), inset 0 0 0 1.5px rgba(255,255,255,0.15)"
                    : "0 25px 50px -12px rgba(22,24,29,0.22), inset 0 0 0 1.5px rgba(0,0,0,0.1)")
                : "0 8px 32px rgba(0,0,0,0.08)",
              position: "relative", display: "flex", flexDirection: "column", flexShrink: 0,
              transition: "all 0.25s ease",
            }}>
              
              {/* Camera Shutter Flash Animation */}
              {isFlashing && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "#FFFFFF",
                  borderRadius: showFrame ? activePreset.radius : 14,
                  zIndex: 9999,
                  pointerEvents: "none",
                  animation: "clFadeIn .12s ease-out",
                }} />
              )}

              {/* Protruding Physical Hardware Side Buttons */}
              {showFrame && !isLandscape && (devicePreset === "iphone-15" || devicePreset === "iphone-se" || devicePreset === "android" || devicePreset === "pixel") && (
                <>
                  <div style={{ position: "absolute", left: -2.5, top: 110, width: 2.5, height: 16, background: "#27272A", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", left: -2.5, top: 146, width: 2.5, height: 44, background: "#27272A", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", left: -2.5, top: 202, width: 2.5, height: 44, background: "#27272A", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", right: -2.5, top: 172, width: 2.5, height: 68, background: "#27272A", borderRadius: "0 3px 3px 0" }} />
                </>
              )}
              
              {/* Inner Screen Display */}
              <div ref={screenDisplayRef} className="cl-phone-screen" style={{
                width: "100%", height: "100%", background: C.white,
                borderRadius: showFrame ? activePreset.innerRadius : 14,
                overflow: "hidden", position: "relative",
                border: showFrame ? "2px solid #09090B" : `1px solid ${C.border}`,
                display: "flex", flexDirection: "column",
                boxShadow: showFrame ? "inset 0 0 0 1px rgba(255,255,255,0.05)" : "none",
              }}>
                {/* Device Camera / Notch Rendering */}
                {showFrame && !isLandscape && (
                  <>
                    {devicePreset === "iphone-15" && (
                      <div style={{ position: "absolute", top: 8.5, left: "50%", transform: "translateX(-50%)", width: 120, height: 31, background: "#09090B", borderRadius: 18, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#18181B", border: "1px solid #27272A", opacity: 0.85 }} />
                      </div>
                    )}
                    {devicePreset === "android" || devicePreset === "pixel" ? (
                      <div style={{ position: "absolute", top: 16.5, left: "50%", transform: "translateX(-50%)", width: 15, height: 15, background: "#09090B", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.18)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#18181B" }} />
                      </div>
                    ) : null}
                  </>
                )}
                
                <StatusBar dark={screen === "splash" || screen === "get-started"} overlay={screen === "splash" || screen === "get-started"} />

                {/* Active Screen Component */}
                <div ref={screenWrapRef} className="cl-screen-wrap" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  <div key={screen} style={{ height: "100%", animation: "clScreenIn .3s cubic-bezier(.22,1,.36,1)" }}>
                    <ScreenErrorBoundary screen={screen} onReset={() => resetNav("client-home", {}, "client")}>
                      <ScreenComponent {...screenProps} />
                    </ScreenErrorBoundary>
                  </div>
                  <Toast toast={toastMsg} />
                </div>

                {/* Bottom Tab Bar */}
                {showTabs && <BottomTabs items={tabsForRole} value={activeTabScreen} onChange={(v) => resetNav(v, {}, role)} />}

                {/* iOS Bottom Home Indicator Swipe Bar */}
                {showFrame && !isLandscape && devicePreset === "iphone-15" && (
                  <div style={{
                    position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
                    width: 120, height: 4.5, borderRadius: 100,
                    background: (screen === "splash" || darkMode) ? "#FFFFFF" : "#000000",
                    opacity: 0.35, zIndex: 100, pointerEvents: "none",
                  }} />
                )}
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

/* =========================================================================
   ROOT — wraps the shell in the context provider
   ========================================================================= */
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
