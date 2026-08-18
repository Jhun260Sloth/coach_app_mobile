import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronLeft, Star, CheckCircle2, Search, Wifi, Battery, AlertTriangle,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { initials, hashColor, avatarForName } from "../../utils/avatar";

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
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        border: "2px solid currentColor", borderTopColor: "transparent",
        opacity: 0.9, color: color || "currentColor",
        animation: "clSpin .7s linear infinite", display: "inline-block",
      }}
    />
  );
}

export function Btn({ children, onClick, variant = "primary", full, icon: Icon, disabled, loading, loadingText, size = "md", type = "button", ariaLabel, title }) {
  const C = useColors();
  const iconOnly = !!Icon && !children;
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: LAYOUT.buttonRadius, fontWeight: 600, cursor: (disabled || loading) ? "default" : "pointer",
    border: "1px solid transparent",
    transition: "opacity .16s ease, transform .14s cubic-bezier(.2,.7,.3,1), background .15s ease",
    opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", minWidth: iconOnly && !full ? LAYOUT.touchTarget : undefined, minHeight: LAYOUT.touchTarget,
    padding: iconOnly ? 0 : size === "sm" ? "9px 14px" : "13px 18px",
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
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} aria-label={ariaLabel} title={title} onClick={(disabled || loading) ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {loading ? <Spinner size={size === "sm" ? 13 : 15} /> : (Icon && <Icon aria-hidden="true" size={size === "sm" ? 14 : 17} strokeWidth={2.3} />)}
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

export function Card({ children, style, onClick, ariaLabel }) {
  const C = useColors();
  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? (event) => {
        if (event.currentTarget !== event.target) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(event);
        }
      } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      data-interactive={onClick ? "true" : "false"}
      className="cl-card"
      style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: LAYOUT.cardRadius, padding: 14, cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}

export function Chip({ children, active, onClick, icon: Icon }) {
  const C = useColors();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: LAYOUT.pillRadius, minHeight: 40,
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
      type="button"
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", padding: "8px 0", minHeight: LAYOUT.touchTarget,
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
      <path d="M20 6L9 17l-5-5" stroke={color || "currentColor"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RadioRow({ label, selected, onClick }) {
  const C = useColors();
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", padding: "8px 0", minHeight: LAYOUT.touchTarget,
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
  const inputId = React.useId();
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
              display: "inline-flex", alignItems: "center", gap: 4, minHeight: 32, boxSizing: "border-box", padding: "4px 8px", borderRadius: LAYOUT.pillRadius,
              fontSize: T.labelLg, fontWeight: 500, border: `1px solid ${C.brand}`, background: C.brandTint, color: C.brandIcon || C.brandColor, ...fBody,
            }}>
              {v}
              <button type="button" onClick={() => remove(v)} aria-label={`Remove ${v}`} style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: C.brandIcon || C.brandColor }}>
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
            id={inputId}
            name="multi-select-search"
            type="search"
            autoComplete="off"
            aria-label={placeholder}
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
                type="button"
                key={o}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(o)}
                style={{ display: "block", width: "100%", minHeight: LAYOUT.touchTarget, textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: T.body, color: C.jet, ...fBody }}
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
  const inputId = React.useId();
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
      <div className="cl-input" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: LAYOUT.touchTarget, boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "0 13px", background: C.white }}>
        <span style={{ fontSize: T.bodyLg, color: C.jet, fontWeight: 500, ...fBody }}>{value}</span>
        <button type="button" onClick={clear} aria-label="Clear selection" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.slateLight, flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div className="cl-input" style={{ display: "flex", alignItems: "center", gap: 8, minHeight: LAYOUT.touchTarget, boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "0 13px", background: C.white }}>
        <Search size={15} color={C.slateLight} />
        <input
          id={inputId}
          name="single-select-search"
          type="search"
          autoComplete="off"
          aria-label={placeholder}
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
              type="button"
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
              type="button"
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
    pending: { label: "Awaiting coach", tone: "orange", pulse: true },
    awaiting_payment: { label: "Payment due", tone: "orange", pulse: true },
    confirmed: { label: "Confirmed", tone: "success" },
    completion_pending: { label: "Confirm completion", tone: "orange", pulse: true },
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
      display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0, whiteSpace: "nowrap",
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
  const localSrc = src || avatarForName(label);
    // First-party seed avatars are preferred; DiceBear and the initials circle
    // remain resilient fallbacks for profiles created during the prototype.
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
          src={localSrc || dicebearSrc}
        alt={`${label} avatar`}
        width={size}
        height={size}
        loading={size >= 64 ? "eager" : "lazy"}
        decoding="async"
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

export function Toggle({ on, onClick, label = "Toggle setting" }) {
  const C = useColors();
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} style={{ width: 48, height: LAYOUT.touchTarget, borderRadius: LAYOUT.pillRadius, background: "transparent", position: "relative", flexShrink: 0, border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span aria-hidden="true" style={{ width: 42, height: 25, borderRadius: LAYOUT.pillRadius, background: on ? C.brand : C.border, position: "relative", transition: "background .2s ease", display: "block" }}>
        <span style={{ position: "absolute", top: 2.5, left: on ? 20 : 2.5, width: 20, height: 20, borderRadius: LAYOUT.pillRadius, background: C.white, transition: "left .15s ease", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
      </span>
    </button>
  );
}

export function SegTabs({ items, value, onChange, strong }) {
  const C = useColors();
  return (
    <div role="tablist" style={{ display: "flex", background: C.fog, borderRadius: 13, padding: 3, gap: 2 }}>
      {items.map((it) => {
        const active = value === it.value;
        const Icon = it.icon;
        const label = it.label;
        const ariaLabel = it.ariaLabel || (typeof label === "string" ? label : it.value);
        return (
          <button
            type="button"
            role="tab"
            aria-selected={active}
            key={it.value}
            onClick={() => onChange(it.value)}
            aria-label={ariaLabel}
            title={ariaLabel}
            style={{
              flex: 1,
              minHeight: LAYOUT.touchTarget,
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

export function BackButton({ onClick, floating = false, ariaLabel = "Go back" }) {
  const C = useColors();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: LAYOUT.touchTarget, height: LAYOUT.touchTarget,
        borderRadius: LAYOUT.pillRadius, background: floating ? C.white : C.fog,
        border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: floating ? "0 4px 14px rgba(22,24,29,.12)" : "0 1px 2px rgba(22,24,29,.04)",
        transition: "transform .12s ease, background .12s ease", padding: 0, flexShrink: 0,
      }}
    >
      <ChevronLeft aria-hidden="true" size={19} color={C.jet} style={{ marginRight: 1 }} />
    </button>
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
      <div style={{ width: LAYOUT.touchTarget, display: "flex", alignItems: "center", flexShrink: 0 }}>
        {onBack && <BackButton onClick={onBack} />}
      </div>
      <div style={{ fontSize: T.titleLg, fontWeight: 700, color: C.jet, letterSpacing: "-0.2px", ...fDisplay, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 8px", textAlign: "center", flex: 1, minWidth: 0 }}>{title}</div>
      <div style={{ minWidth: LAYOUT.touchTarget, minHeight: LAYOUT.touchTarget, display: "flex", justifyContent: "flex-end", alignItems: "center", flexShrink: 0 }}>{right}</div>
    </div>
  );
}

/** Fixed footer for screen-level decisions and primary actions. */
export function BottomActionBar({ children, stack = false, style }) {
  const C = useColors();
  return (
    <div style={{
      position: "relative", zIndex: 24, flexShrink: 0,
      padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`,
      borderTop: `1px solid ${C.border}`, background: C.white,
      boxShadow: "0 -8px 20px rgba(22,24,29,.06)",
      display: "flex", flexDirection: stack ? "column" : "row", alignItems: "center", gap: 10,
      ...style,
    }}>
      {children}
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
        <Icon aria-hidden="true" size={large ? 30 : 22} color={large ? C.brand : C.slateLight} />
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
      aria-live="polite"
      aria-atomic="true"
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
  const activeColor = C.brandIcon || C.brand;
  const inactiveColor = C.slate;
  const activePillBg = C.brandTint;

  return (
    <div
      role="tablist"
      aria-label="Primary navigation"
      style={{
        position: "absolute",
        bottom: "max(12px, env(safe-area-inset-bottom))",
        left: 12,
        right: 12,
        background: C.white,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${C.border}`,
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.12)",
        borderRadius: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 6px",
        zIndex: 40,
        boxSizing: "border-box",
        transition: "background .25s ease, border-color .25s ease, box-shadow .25s ease",
        animation: "clSlideUp .45s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {items.map((it) => {
        const active = value === it.value;
        const Icon = it.icon;

        return (
          <button
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={it.label}
            key={it.value}
            onClick={() => onChange(it.value)}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 48,
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
              position: "relative",
              transition: "background .22s cubic-bezier(0.16, 1, 0.3, 1), color .22s ease",
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
                  background: C.brand,
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
                fontSize: T.tiny,
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

export function Field({ label, placeholder, type = "text", icon: Icon, rightIcon: RightIcon, onRight, rightLabel, show = true, value, onChange, name, autoComplete, inputMode, required }) {
  const C = useColors();
  const generatedId = React.useId();
  if (!show) return null;
  const fieldName = name || String(label || "field").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <label htmlFor={generatedId} style={{ display: "block", fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>{label}</label>
      <div className="cl-input" style={{ width: "100%", minWidth: 0, display: "flex", alignItems: "center", gap: 8, minHeight: 48, boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: RightIcon ? "0 4px 0 13px" : "0 13px", background: C.white }}>
        {Icon && <Icon aria-hidden="true" size={16} color={C.slateLight} />}
        <input id={generatedId} name={fieldName} autoComplete={autoComplete || (type === "email" ? "email" : "off")} inputMode={inputMode || (type === "tel" ? "tel" : undefined)} required={required} placeholder={placeholder} type={type} value={value} onChange={onChange} style={{ border: "none", outline: "none", flex: 1, minWidth: 0, minHeight: 44, padding: 0, fontSize: T.bodyLg, background: "transparent", color: C.jet, ...fBody }} />
        {RightIcon && <button type="button" aria-label={rightLabel || `Show or hide ${label}`} onClick={onRight} style={{ width: 44, height: 44, padding: 0, flexShrink: 0, background: "none", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.slateLight }}><RightIcon aria-hidden="true" size={16} /></button>}
      </div>
    </div>
  );
}

/** Shared confirmation for irreversible or high-impact actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon: Icon = AlertTriangle,
  destructive = true,
}) {
  const C = useColors();

  return (
    <BottomSheet open={open} onClose={onClose} title={title} heightPct={42}>
      <div>
        {description && <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, paddingBottom: 14, ...fBody }}>{description}</div>}
        <button type="button" onClick={onConfirm} style={{ width: "100%", minHeight: LAYOUT.touchTarget, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", border: `1px solid ${destructive ? C.dangerBorder : C.border}`, borderRadius: LAYOUT.buttonRadius, background: destructive ? C.dangerTint : C.brandTint, color: destructive ? C.danger : C.brand, cursor: "pointer", fontSize: T.bodyLg, fontWeight: 600, ...fBody }}>
          <Icon aria-hidden="true" size={17} />
          {confirmLabel}
        </button>
        <button type="button" onClick={onClose} style={{ width: "100%", minHeight: LAYOUT.touchTarget, border: "none", background: "transparent", color: C.slate, cursor: "pointer", fontSize: T.body, fontWeight: 600, ...fBody }}>{cancelLabel}</button>
      </div>
    </BottomSheet>
  );
}

export function BottomSheet({ open, onClose, title, children, footer, heightPct = 70 }) {
  const C = useColors();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = React.useId();
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const phoneScreen = dialog?.closest(".cl-phone-screen");
    const scrollPositions = Array.from(phoneScreen?.querySelectorAll("*") || [])
      .filter(element => element.scrollTop !== 0 || element.scrollLeft !== 0)
      .map(element => ({ element, top: element.scrollTop, left: element.scrollLeft }));
    if (phoneScreen && (phoneScreen.scrollTop !== 0 || phoneScreen.scrollLeft !== 0)) {
      scrollPositions.push({ element: phoneScreen, top: phoneScreen.scrollTop, left: phoneScreen.scrollLeft });
    }
    const restoreScroll = () => scrollPositions.forEach(({ element, top, left }) => {
      element.scrollTop = top;
      element.scrollLeft = left;
    });
    const selector = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const focusable = () => Array.from(dialog?.querySelectorAll(selector) || []);
    (focusable()[0] || dialog)?.focus({ preventScroll: true });
    restoreScroll();
    const restoreFrame = requestAnimationFrame(restoreScroll);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog?.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(restoreFrame);
      document.removeEventListener("keydown", handleKeyDown);
      restoreScroll();
      previousFocus?.focus?.({ preventScroll: true });
      restoreScroll();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 95, overflow: "hidden", overscrollBehavior: "contain" }}>
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: 0, background: "rgba(22,24,29,.45)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", animation: "clBackdropIn .2s ease", cursor: "default", touchAction: "none" }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: `${heightPct}%`,
          background: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26,
          borderTop: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", boxShadow: "0 -12px 30px rgba(0,0,0,.18)",
          animation: "clSheetUp .3s cubic-bezier(.32,.72,0,1)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: LAYOUT.touchTarget, padding: "10px 0 4px", background: "none", border: "none", cursor: "pointer" }}
        >
          <div style={{ width: 40, height: 4.5, borderRadius: 99, background: C.border }} />
        </button>
        {title && (
          <div id={titleId} style={{ padding: "4px 20px 10px", fontSize: T.titleLg, fontWeight: 700, color: C.jet, letterSpacing: "-0.2px", ...fDisplay }}>{title}</div>
        )}
        <div style={{ overflowY: "auto", overscrollBehavior: "contain", padding: footer ? "4px 18px 24px" : "4px 18px max(28px, env(safe-area-inset-bottom))", flex: 1, minHeight: 0 }} className="cl-hide-scrollbar">{children}</div>
        {footer && (
          <div style={{ flexShrink: 0, padding: "12px 18px max(20px, env(safe-area-inset-bottom))", borderTop: `1px solid ${C.border}`, background: C.white, boxShadow: "0 -8px 20px rgba(22,24,29,.06)" }}>
            {footer}
          </div>
        )}
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
