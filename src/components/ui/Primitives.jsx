import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft, Star, CheckCircle2, Search, Wifi, Battery,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { initials, hashColor } from "../../data/mockData";

/* =========================================================================
   SHARED UI PRIMITIVES
   Every component calls useApp() to get darkMode, then computes C so the
   entire UI switches between CL (light) and CD (dark) at runtime.
   ========================================================================= */

function useColors() {
  try {
    const app = useApp();
    const darkMode = app?.darkMode ?? false;
    return (darkMode ? CD : CL) || CL;
  } catch (e) {
    return CL;
  }
}

export function Spinner({ size = 15, color }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        border: "2px solid currentColor", borderTopColor: "transparent",
        opacity: 0.9, color: color || "currentColor",
        animation: "clSpin .7s linear infinite", display: "inline-block",
      }}
    />
  );
}

export function Btn({ children, onClick, variant = "primary", full, icon: Icon, disabled, loading, loadingText, size = "md", type = "button" }) {
  const C = useColors();
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: LAYOUT.buttonRadius, fontWeight: 600, cursor: (disabled || loading) ? "default" : "pointer",
    border: "1px solid transparent",
    transition: "opacity .16s ease, transform .14s cubic-bezier(.2,.7,.3,1), background .15s ease",
    opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto",
    padding: size === "sm" ? "9px 14px" : "13px 18px",
    fontSize: size === "sm" ? T.body : T.subtitleLg, ...fBody,
  };
  const variants = {
    primary: { background: C.brand, color: C.white, boxShadow: `0 6px 16px -6px ${darkenHex(C.brand, 0.35)}` },
    dark: { background: C.jet, color: C.white },
    secondary: { background: C.fog, color: C.jet },
    outline: { background: "transparent", color: C.jet, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.slate },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.dangerBorder}` },
  };
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} onClick={(disabled || loading) ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {loading ? <Spinner size={size === "sm" ? 13 : 15} /> : (Icon && <Icon size={size === "sm" ? 14 : 17} strokeWidth={2.3} />)}
      {loading ? (loadingText || children) : children}
    </button>
  );
}

/* Subtle brand-coloured soft shadow behind primary buttons. */
function darkenHex(hex, alpha) {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "transparent";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ScrollFadeRow({ children, style, className }) {
  const C = useColors();
  const ref = useRef(null);
  const [state, setState] = useState({ left: false, right: false });

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setState({
      left: scrollLeft > 4,
      right: scrollLeft + clientWidth < scrollWidth - 4,
    });
  };

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [children]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} onScroll={measure} className={["cl-hide-scrollbar", className].filter(Boolean).join(" ")} style={style}>
        {children}
      </div>
      {state.left && (
        <div style={{ position: "absolute", top: 0, bottom: 4, left: 0, width: 28, pointerEvents: "none", background: `linear-gradient(90deg, ${C.white}, rgba(255,255,255,0))` }} />
      )}
      {state.right && (
        <div style={{ position: "absolute", top: 0, bottom: 4, right: 0, width: 28, pointerEvents: "none", background: `linear-gradient(270deg, ${C.white}, rgba(255,255,255,0))` }} />
      )}
    </div>
  );
}

export function Card({ children, style, onClick }) {
  const C = useColors();
  return (
    <div
      onClick={onClick}
      className="cl-card"
      style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 14, cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}

export function Chip({ children, active, onClick, icon: Icon }) {
  const C = useColors();
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999,
        fontSize: T.body, fontWeight: 500, whiteSpace: "nowrap", border: `1px solid ${active ? C.brand : C.border}`,
        background: active ? C.brandTint : C.white, color: active ? (C.brandIcon || C.brandColor) : C.jet, ...fBody,
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}

export function Badge({ tone = "neutral", children, icon: Icon, style }) {
  const C = useColors();
  const tones = {
    neutral: { bg: C.fog, fg: C.slate },
    orange: { bg: C.brandTint, fg: C.brandIcon || C.brandColor },
    success: { bg: C.successTint, fg: C.success },
    dark: { bg: C.jet, fg: C.white },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: t.bg,
        color: t.fg,
        fontSize: T.captionLg,
        fontWeight: 600,
        padding: "4px 8px",
        borderRadius: 8,
        ...fBody,
        ...style,
      }}
    >
      {Icon && <Icon size={11.5} />}
      {children}
    </span>
  );
}

export function StepProgress({ step, total, label }) {
  const C = useColors();
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? C.brand : C.border }} />
        ))}
      </div>
      <div style={{ fontSize: T.captionLg, fontWeight: 600, color: C.slateLight, ...fBody }}>
        Step {step} of {total}{label ? ` — ${label}` : ""}
      </div>
    </div>
  );
}

export function CheckboxRow({ label, checked, onClick }) {
  const C = useColors();
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", padding: "8px 0",
      }}
    >
      <div style={{
        width: 19, height: 19, borderRadius: 6, flexShrink: 0,
        border: `1.5px solid ${checked ? C.brand : C.border}`, background: checked ? C.brand : C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <CheckCircle2Fill color={C.white} />}
      </div>
      <span style={{ fontSize: T.bodyLg, color: C.jet, ...fBody }}>{label}</span>
    </button>
  );
}

function CheckCircle2Fill({ color }) {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke={color || "#FFFFFF"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RadioRow({ label, selected, onClick }) {
  const C = useColors();
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", padding: "8px 0",
      }}
    >
      <div style={{
        width: 19, height: 19, borderRadius: 99, flexShrink: 0,
        border: `1.5px solid ${selected ? C.brand : C.border}`, background: C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: 99, background: C.brand }} />}
      </div>
      <span style={{ fontSize: T.bodyLg, color: C.jet, ...fBody }}>{label}</span>
    </button>
  );
}

export function SearchMultiSelect({ options, value, onChange, placeholder = "Search…" }) {
  const C = useColors();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filtered = options
    .filter((o) => !value.includes(o))
    .filter((o) => query.length > 0 && o.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const add = (o) => { onChange([...value, o]); setQuery(""); setOpen(false); };
  const remove = (o) => onChange(value.filter((v) => v !== o));

  return (
    <div>
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: value.length ? 8 : 0 }}>
          {value.map((v) => (
            <span key={v} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999,
              fontSize: T.labelLg, fontWeight: 500, border: `1px solid ${C.brand}`, background: C.brandTint, color: C.brandIcon || C.brandColor, ...fBody,
            }}>
              {v}
              <button onClick={() => remove(v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: C.brandIcon || C.brandColor }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <div className="cl-input" style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "11px 13px", background: C.white }}>
          <Search size={15} color={C.slateLight} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder}
            style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, background: "transparent", color: C.jet, ...fBody }}
          />
        </div>
        {open && filtered.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto", animation: "clFadeUp .18s ease" }}>
            {filtered.map((o) => (
              <button
                key={o}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(o)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: T.body, color: C.jet, ...fBody }}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchSelect({ options, value, onChange, placeholder = "Search…", allowCustom = true }) {
  const C = useColors();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filtered = options
    .filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 6);
  const trimmed = query.trim();
  const showAddCustom = allowCustom && trimmed.length > 0 && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  const choose = (v) => { onChange(v); setQuery(""); setOpen(false); };
  const clear = () => onChange("");

  if (value) {
    return (
      <div className="cl-input" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "11px 13px", background: C.white }}>
        <span style={{ fontSize: T.bodyLg, color: C.jet, fontWeight: 500, ...fBody }}>{value}</span>
        <button onClick={clear} aria-label="Clear" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: C.slateLight, flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div className="cl-input" style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "11px 13px", background: C.white }}>
        <Search size={15} color={C.slateLight} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, background: "transparent", color: C.jet, ...fBody }}
        />
      </div>
      {open && (filtered.length > 0 || showAddCustom) && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto", animation: "clFadeUp .18s ease" }}>
          {filtered.map((o) => (
            <button
              key={o}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: T.body, color: C.jet, ...fBody }}
            >
              {o}
            </button>
          ))}
          {showAddCustom && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(trimmed)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", borderTop: filtered.length ? `1px solid ${C.border}` : "none", cursor: "pointer", fontSize: T.body, color: C.brand, fontWeight: 600, ...fBody }}
            >
              Add "{trimmed}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }) {
  const C = useColors();
  const map = {
    pending: { label: "Pending", tone: "orange", pulse: true },
    confirmed: { label: "Confirmed", tone: "success" },
    completed: { label: "Completed", tone: "neutral" },
    cancelled: { label: "Cancelled", tone: "neutral" },
    declined: { label: "Declined", tone: "danger" },
    expired: { label: "Expired", tone: "neutral" },
    failed: { label: "Failed", tone: "danger" },
    refunded: { label: "Refunded", tone: "success" },
    live: { label: "Live now", tone: "orange", pulse: true },
  };
  const m = map[status] || map.pending;
  const colors = {
    orange: { bg: C.brandTint, fg: C.brand },
    success: { bg: C.successTint, fg: C.success },
    neutral: { bg: C.fog, fg: C.slate },
    danger: { bg: C.dangerTint, fg: C.danger },
  }[m.tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      color: colors.fg,
      fontSize: T.captionLg, fontWeight: 700, padding: "4px 8px", borderRadius: 8,
      background: colors.bg, ...fBody,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: "currentColor", animation: m.pulse ? "clPulse 1.4s infinite" : "none" }} />
      {m.label}
    </span>
  );
}

export function HandleTag({ handle, size = 12, color }) {
  const C = useColors();
  if (!handle) return null;
  const h = String(handle).startsWith("@") ? handle : `@${handle}`;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: size, fontWeight: 600, color: color || C.slateLight, ...fBody,
    }}>
      {h}
    </span>
  );
}

export function Avatar({ name, size = 42, ring, src }) {
  const C = useColors();
  const label = String(name || "User");
  // DiceBear initials avatar is used whenever no real photo is supplied; the
  // local initials circle sits behind it as an offline/error fallback so the
  // avatar never renders as a broken image.
  const dicebearSrc = `https://api.dicebear.com/10.x/initials/svg?initialsVariant=default:1&lettersProbability=100&lettersVariant=single:1&seed=${encodeURIComponent(label)}`;
  return (
    <div style={{
      position: "relative", width: size, height: size, borderRadius: size, overflow: "hidden",
      background: hashColor(name), color: C.white,
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36,
      flexShrink: 0, boxShadow: ring ? `0 0 0 2px ${C.white}, 0 0 0 3.5px ${C.brand}` : "none", ...fDisplay,
    }}>
      <span>{initials(name)}</span>
      <img
        src={src || dicebearSrc}
        alt={`${label} avatar`}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

export function StarRow({ value, size = 13 }) {
  const C = useColors();
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? C.brand : "none"} color={i <= Math.round(value) ? C.brand : C.slateLight} />
      ))}
    </span>
  );
}

export function Toggle({ on, onClick }) {
  const C = useColors();
  return (
    <button onClick={onClick} style={{ width: 42, height: 25, borderRadius: 99, background: on ? C.brand : C.border, position: "relative", flexShrink: 0, border: "none", cursor: "pointer", transition: "background .2s ease" }}>
      <span style={{ position: "absolute", top: 2.5, left: on ? 20 : 2.5, width: 20, height: 20, borderRadius: 99, background: C.white, transition: "left .15s ease", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </button>
  );
}

export function SegTabs({ items, value, onChange, strong }) {
  const C = useColors();
  return (
    <div style={{ display: "flex", background: C.fog, borderRadius: 13, padding: 3, gap: 2 }}>
      {items.map((it) => {
        const active = value === it.value;
        const Icon = it.icon;
        const label = it.label;
        const ariaLabel = it.ariaLabel || (typeof label === "string" ? label : it.value);
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            aria-label={ariaLabel}
            title={ariaLabel}
            style={{
              flex: 1,
              padding: label ? "8px 8px" : "8px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: active ? (strong ? C.jet : C.white) : "transparent",
              color: active ? (strong ? C.white : C.jet) : C.slate,
              fontWeight: active ? 700 : 600,
              fontSize: T.labelLg,
              boxShadow: active && !strong ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "background .15s ease, color .15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              ...fBody,
            }}
          >
            {Icon && (
              <Icon
                size={16}
                color={active ? (strong ? C.white : C.jet) : C.slate}
                fill={it.fillActive && active ? (strong ? C.white : C.jet) : "none"}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function TopBar({ title, onBack, right, border }) {
  const C = useColors();
  const { darkMode } = useApp();
  const hasBorder = border !== undefined ? border : !!title;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: LAYOUT.topBarH, padding: `0 ${LAYOUT.pagePadX}px`, boxSizing: "border-box",
      position: "sticky", top: 0, zIndex: 25,
      background: darkMode ? "rgba(13,17,23,0.86)" : "rgba(255,255,255,0.86)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      borderBottom: hasBorder ? `1px solid ${C.border}` : "none",
    }}>
      <div style={{ width: 38, display: "flex", alignItems: "center", flexShrink: 0 }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            style={{
              width: 38, height: 38, borderRadius: 999, background: C.fog,
              border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 1px 2px rgba(22,24,29,.04)",
              transition: "transform .12s ease, background .12s ease",
              padding: 0,
            }}
          >
            <ChevronLeft size={19} color={C.jet} style={{ marginRight: 1 }} />
          </button>
        )}
      </div>
      <div style={{ fontSize: T.titleLg, fontWeight: 700, color: C.jet, letterSpacing: "-0.2px", ...fDisplay, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 8px", textAlign: "center", flex: 1 }}>{title}</div>
      <div style={{ width: 38, display: "flex", justifyContent: "flex-end", alignItems: "center", flexShrink: 0 }}>{right}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, ctaLabel, onCta, large }) {
  const C = useColors();
  return (
    <div style={{ textAlign: "center", padding: large ? "20px 20px" : "40px 20px", color: C.slate, animation: "clFadeUp .35s ease" }}>
      <div style={{
        width: large ? 72 : 52, height: large ? 72 : 52, borderRadius: large ? 22 : 16, background: large ? C.brandTint : C.fog,
        display: "flex", alignItems: "center", justifyContent: "center", margin: large ? "0 auto 18px" : "0 auto 14px",
      }}>
        <Icon size={large ? 30 : 22} color={large ? C.brand : C.slateLight} />
      </div>
      <div style={{ fontSize: large ? T.display : undefined, fontWeight: 600, color: C.jet, marginBottom: large ? 10 : 4, ...fDisplay }}>{title}</div>
      <div style={{ fontSize: large ? T.bodyLg : T.body, lineHeight: large ? 1.6 : 1.5, maxWidth: large ? 300 : undefined, marginLeft: "auto", marginRight: "auto" }}>{body}</div>
      {ctaLabel && onCta && (
        <div style={{ marginTop: large ? 24 : 18, ...(large ? {} : { display: "inline-block" }) }}>
          <Btn full={large} onClick={onCta}>{ctaLabel}</Btn>
        </div>
      )}
    </div>
  );
}

export function Toast({ toast }) {
  const C = useColors();
  if (!toast) return null;
  return (
    <div
      role="status"
      style={{
        position: "absolute", bottom: 100, left: 16, right: 16, background: C.jet, color: C.white,
        padding: "10px 12px", borderRadius: 16, fontSize: T.body, fontWeight: 500, display: "flex",
        alignItems: "center", gap: 10, zIndex: 60, boxShadow: "0 12px 32px rgba(0,0,0,.28)",
        animation: "clToastIn .3s cubic-bezier(.22,1,.36,1)", ...fBody,
      }}
    >
      <span style={{ width: 26, height: 26, borderRadius: 9, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <CheckCircle2 size={14} color={C.brand} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>{toast}</span>
    </div>
  );
}

export function LogoMark({ size = 30, system = false }) {
  const C = useColors();
  const h = size * (207 / 179);
  const src = system || C !== CD ? "logo icon-green.png" : "logo icon-white.png";
  return (
    <img src={src} alt="CoachLink" width={size} height={h} style={{ display: "block", objectFit: "contain" }} />
  );
}

export function LogoMarkWhite({ size = 120 }) {
  const h = size * (207 / 179);
  return (
    <img src="logo icon-white.png" alt="CoachLink" width={size} height={h} style={{ display: "block", objectFit: "contain" }} />
  );
}

export function Wordmark({ size = 20, dark }) {
  const C = useColors();
  return (
    <span style={{ fontSize: size, fontWeight: 600, ...fDisplay }}>
      <span style={{ color: dark ? C.white : C.jet }}>Coach</span>
      <span style={{ color: dark ? C.onDark : C.slateLight, fontWeight: 500 }}>Link</span>
    </span>
  );
}

export function BottomTabs({ items, value, onChange }) {
  const C = useColors();
  const { darkMode } = useApp();

  // Modern iOS floating island tab tokens
  const activeColor = darkMode ? "#81C784" : "#1B5E20";
  const inactiveColor = darkMode ? "#9CA3AF" : "#6B7280";
  const activePillBg = darkMode ? "rgba(129, 199, 132, 0.15)" : "rgba(27, 94, 32, 0.08)";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        right: 12,
        background: darkMode ? "rgba(13, 17, 23, 0.92)" : "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}`,
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.12)",
        borderRadius: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 6px",
        zIndex: 40,
        boxSizing: "border-box",
        transition: "all 0.25s ease",
        animation: "clSlideUp .45s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {items.map((it) => {
        const active = value === it.value;
        const Icon = it.icon;

        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            style={{
              flex: 1,
              minWidth: 0,
              background: active ? activePillBg : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "6px 2px",
              borderRadius: 16,
              outline: "none",
              position: "relative",
              transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {it.badge ? (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: "26%",
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: darkMode ? "#81C784" : C.brand,
                  animation: "clPulse 1.6s infinite",
                }}
              />
            ) : null}

            <Icon
              size={19}
              strokeWidth={active ? 2.3 : 1.8}
              color={active ? activeColor : inactiveColor}
              style={{ flexShrink: 0, transition: "color 0.2s ease, transform 0.2s ease", transform: active ? "scale(1.05)" : "scale(1)", animation: active ? "clTabBounce .35s cubic-bezier(.34,1.56,.64,1)" : "none" }}
            />

            <span
              style={{
                fontSize: 10.5,
                fontWeight: active ? 700 : 500,
                color: active ? activeColor : inactiveColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
                textAlign: "center",
                lineHeight: 1.1,
                letterSpacing: "-0.1px",
                ...fBody,
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SectionLabel({ children }) {
  const C = useColors();
  return <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 10, ...fDisplay }}>{children}</div>;
}

export function Row({ label, value, bold, last }) {
  const C = useColors();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <span style={{ fontSize: T.body, color: C.slate, ...fBody }}>{label}</span>
      <span style={{ fontSize: T.body, color: C.jet, fontWeight: bold ? 700 : 500, textAlign: "right", ...fBody }}>{value}</span>
    </div>
  );
}

export function Field({ label, placeholder, type = "text", icon: Icon, rightIcon: RightIcon, onRight, show = true, value, onChange }) {
  const C = useColors();
  if (!show) return null;
  return (
    <div>
      <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>{label}</div>
      <div className="cl-input" style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "11px 13px", background: C.white }}>
        {Icon && <Icon size={16} color={C.slateLight} />}
        <input placeholder={placeholder} type={type} value={value} onChange={onChange} style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, background: "transparent", color: C.jet, ...fBody }} />
        {RightIcon && <button onClick={onRight} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><RightIcon size={16} color={C.slateLight} /></button>}
      </div>
    </div>
  );
}

export function BottomSheet({ open, onClose, title, children, heightPct = 70 }) {
  const C = useColors();
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 95 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.45)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", animation: "clBackdropIn .2s ease" }}
      />
      <div
        role="dialog"
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: `${heightPct}%`,
          background: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26,
          borderTop: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", boxShadow: "0 -12px 30px rgba(0,0,0,.18)",
          animation: "clSheetUp .3s cubic-bezier(.32,.72,0,1)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px", background: "none", border: "none", cursor: "pointer" }}
        >
          <div style={{ width: 40, height: 4.5, borderRadius: 99, background: C.border }} />
        </button>
        {title && (
          <div style={{ padding: "4px 20px 10px", fontSize: T.titleLg, fontWeight: 700, color: C.jet, letterSpacing: "-0.2px", ...fDisplay }}>{title}</div>
        )}
        <div style={{ overflowY: "auto", padding: "4px 18px 28px", flex: 1 }} className="cl-hide-scrollbar">{children}</div>
      </div>
    </div>
  );
}

export function SignalBars({ color = "currentColor" }) {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0.5" y="7.5" width="2.5" height="3" rx="0.5" fill={color} />
      <rect x="4.5" y="5.5" width="2.5" height="5" rx="0.5" fill={color} />
      <rect x="8.5" y="3" width="2.5" height="7.5" rx="0.5" fill={color} />
      <rect x="12.5" y="0.5" width="2.5" height="10" rx="0.5" fill={color} />
    </svg>
  );
}

export function BatteryIcon({ color = "currentColor", level = 82 }) {
  return (
    <svg width="22" height="11" viewBox="0 0 22 11" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0.5" y="0.5" width="18" height="10" rx="3" stroke={color} strokeWidth="1" opacity="0.8" />
      <path d="M20 3.75C20.4 3.75 20.6 4.0 20.6 4.5V6.5C20.6 7.0 20.4 7.25 20 7.25" fill={color} opacity="0.8" />
      <rect x="2" y="2" width={15 * (level / 100)} height="7" rx="1.5" fill={color} />
    </svg>
  );
}

export function StatusBar({ dark, overlay }) {
  const C = useColors();
  const { darkMode } = useApp();
  const color = dark ? (darkMode ? C.black : C.white) : C.jet;

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      height: 48, padding: "0 22px",
      fontSize: T.body, fontWeight: 600, color, ...fBody,
      boxSizing: "border-box", pointerEvents: "none", zIndex: 90,
      ...(overlay ? { position: "absolute", top: 0, left: 0, right: 0, width: "100%" } : {}),
    }}>
      <span style={{
        fontWeight: "700", fontSize: 13.5, letterSpacing: "-0.2px", lineHeight: "1",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
      }}>
        9:41
      </span>
      <div style={{ display: "flex", gap: 5, alignItems: "center", height: "100%" }}>
        <SignalBars color={color} />
        <Wifi size={13} color={color} strokeWidth={2.5} style={{ display: "block" }} />
        <BatteryIcon color={color} level={85} />
      </div>
    </div>
  );
}
