import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft, Star, CheckCircle2, Search,
} from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";
import { initials, hashColor } from "../../data/mockData";

/* =========================================================================
   SHARED UI PRIMITIVES
   ========================================================================= */

/* Small inline spinner used inside buttons and standalone loading states.
   Inherits color from its parent via currentColor so it matches any button variant. */
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
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, fontWeight: 600, cursor: (disabled || loading) ? "default" : "pointer",
    border: "1px solid transparent", transition: "opacity .15s ease",
    opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto",
    padding: size === "sm" ? "9px 14px" : "13px 18px",
    fontSize: size === "sm" ? T.body : T.subtitleLg, ...fBody,
  };
  const variants = {
    primary: { background: C.orange, color: C.white },
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

/* Wraps a horizontally-scrollable row (day pickers, media strips, chip rails) and renders
   a soft edge fade + directional cue on whichever side still has clipped, un-scrolled content.
   Purely presentational — measures the wrapped scroller via ref and updates on scroll/resize,
   so it never shows a cue on a row that already fits, and clears it once the user reaches the end. */
export function ScrollFadeRow({ children, style, className }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  return (
    <div
      onClick={onClick}
      style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 14, cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}

export function Chip({ children, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999,
        fontSize: T.body, fontWeight: 500, whiteSpace: "nowrap", border: `1px solid ${active ? C.orange : C.border}`,
        background: active ? C.orangeTint : C.white, color: active ? C.orange : C.jet, ...fBody,
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}

export function Badge({ tone = "neutral", children, icon: Icon, style }) {
  const tones = {
    neutral: { bg: C.fog, fg: C.slate },
    orange: { bg: C.orangeTint, fg: C.orange },
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
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? C.orange : C.border }} />
        ))}
      </div>
      <div style={{ fontSize: T.captionLg, fontWeight: 600, color: C.slateLight, ...fBody }}>
        Step {step} of {total}{label ? ` — ${label}` : ""}
      </div>
    </div>
  );
}

export function CheckboxRow({ label, checked, onClick }) {
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
        border: `1.5px solid ${checked ? C.orange : C.border}`, background: checked ? C.orange : C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <CheckCircle2Fill />}
      </div>
      <span style={{ fontSize: T.bodyLg, color: C.jet, ...fBody }}>{label}</span>
    </button>
  );
}

function CheckCircle2Fill() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RadioRow({ label, selected, onClick }) {
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
        border: `1.5px solid ${selected ? C.orange : C.border}`, background: C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: 99, background: C.orange }} />}
      </div>
      <span style={{ fontSize: T.bodyLg, color: C.jet, ...fBody }}>{label}</span>
    </button>
  );
}

export function SearchMultiSelect({ options, value, onChange, placeholder = "Search…" }) {
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
              fontSize: T.labelLg, fontWeight: 500, border: `1px solid ${C.orange}`, background: C.orangeTint, color: C.orange, ...fBody,
            }}>
              {v}
              <button onClick={() => remove(v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: C.orange }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
          <Search size={15} color={C.slateLight} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder}
            style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }}
          />
        </div>
        {open && filtered.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto" }}>
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

/**
 * Single-select search combobox. Shows a filled pill with a clear (x) button
 * once a value is chosen; otherwise a search input with a filtered dropdown.
 * If `allowCustom` is true (default) and the typed query doesn't match an
 * existing option, an "Add "<query>"" row lets the user pick a free-text value.
 */
export function SearchSelect({ options, value, onChange, placeholder = "Search…", allowCustom = true }) {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
        <span style={{ fontSize: T.bodyLg, color: C.jet, fontWeight: 500, ...fBody }}>{value}</span>
        <button onClick={clear} aria-label="Clear" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: C.slateLight, flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
        <Search size={15} color={C.slateLight} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }}
        />
      </div>
      {open && (filtered.length > 0 || showAddCustom) && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto" }}>
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
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", borderTop: filtered.length ? `1px solid ${C.border}` : "none", cursor: "pointer", fontSize: T.body, color: C.orange, fontWeight: 600, ...fBody }}
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
    orange: { bg: C.orangeTint, fg: C.orange },
    success: { bg: C.successTint, fg: C.success },
    neutral: { bg: C.fog, fg: C.slate },
    danger: { bg: C.dangerTint, fg: C.danger },
  }[m.tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      color: m.tone === "orange" ? C.orange : m.tone === "success" ? C.success : C.slate,
      fontSize: T.captionLg, fontWeight: 700, padding: "4px,8px", borderRadius: 8, ...fBody,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: "currentColor", animation: m.pulse ? "clPulse 1.4s infinite" : "none" }} />
      {m.label}
    </span>
  );
}

export function Avatar({ name, size = 42, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size, background: hashColor(name), color: C.white,
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36,
      flexShrink: 0, boxShadow: ring ? `0 0 0 2px ${C.white}, 0 0 0 3.5px ${C.orange}` : "none", ...fDisplay,
    }}>
      {initials(name)}
    </div>
  );
}

export function StarRow({ value, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? C.orange : "none"} color={i <= Math.round(value) ? C.orange : C.slateLight} />
      ))}
    </span>
  );
}

export function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 42, height: 25, borderRadius: 99, background: on ? C.orange : C.border, position: "relative", flexShrink: 0, border: "none", cursor: "pointer" }}>
      <span style={{ position: "absolute", top: 2.5, left: on ? 20 : 2.5, width: 20, height: 20, borderRadius: 99, background: C.white, transition: "left .15s ease", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
    </button>
  );
}

export function SegTabs({ items, value, onChange, strong }) {
  return (
    <div style={{ display: "flex", background: C.fog, borderRadius: 13, padding: 3, gap: 2 }}>
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button key={it.value} onClick={() => onChange(it.value)}
            style={{
              flex: 1, padding: "8px 6px", borderRadius: 10, border: "none", cursor: "pointer",
              background: active ? (strong ? C.jet : C.white) : "transparent",
              color: active ? (strong ? C.white : C.jet) : C.slate,
              fontWeight: active ? 700 : 600, fontSize: T.labelLg,
              boxShadow: active && !strong ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "background .15s ease, color .15s ease", ...fBody,
            }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 4px 14px" }}>
      <div style={{ width: 34 }}>
        {onBack && (
          <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 11, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={18} color={C.jet} />
          </button>
        )}
      </div>
      <div style={{ fontSize: T.titleLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{title}</div>
      <div style={{ width: 34, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, ctaLabel, onCta, large }) {
  return (
    <div style={{ textAlign: "center", padding: large ? "20px 20px" : "40px 20px", color: C.slate }}>
      <div style={{
        width: large ? 72 : 52, height: large ? 72 : 52, borderRadius: large ? 22 : 16, background: large ? C.orangeTint : C.fog,
        display: "flex", alignItems: "center", justifyContent: "center", margin: large ? "0 auto 18px" : "0 auto 14px",
      }}>
        <Icon size={large ? 30 : 22} color={large ? C.orange : C.slateLight} />
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
  if (!toast) return null;
  return (
    <div style={{
      position: "absolute", bottom: 96, left: 16, right: 16, background: C.jet, color: C.white,
      padding: "12px 14px", borderRadius: 14, fontSize: T.body, fontWeight: 500, display: "flex",
      alignItems: "center", gap: 8, zIndex: 60, boxShadow: "0 8px 24px rgba(0,0,0,.25)", ...fBody,
    }}>
      <CheckCircle2 size={16} color={C.orange} />
      {toast}
    </div>
  );
}

export function LogoMark({ size = 30 }) {
  // Icon aspect ratio (from source asset) ~ 179 x 207
  const h = size * (207 / 179);
  return (
    <img src="logo icon-green.png" alt="CoachLink" width={size} height={h} style={{ display: "block", objectFit: "contain" }} />
  );
}

export function LogoMarkWhite({ size = 120 }) {
  // Icon aspect ratio (from source asset) ~ 179 x 207
  const h = size * (207 / 179);
  return (
    <img src="logo icon-white.png" alt="CoachLink" width={size} height={h} style={{ display: "block", objectFit: "contain" }} />
  );
}

export function Wordmark({ size = 20, dark }) {
  return (
    <span style={{ fontSize: size, fontWeight: 600, ...fDisplay }}>
      <span style={{ color: dark ? C.white : C.jet }}>Coach</span>
      <span style={{ color: dark ? C.onDark : C.slateLight, fontWeight: 500 }}>Link</span>
    </span>
  );
}

export function BottomTabs({ items, value, onChange }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, background: C.white,
      borderTop: `1px solid ${C.border}`, display: "flex", padding: "8px 4px 22px", zIndex: 40,
    }}>
      {items.map((it) => {
        const active = value === it.value;
        const Icon = it.icon;
        return (
          <button key={it.value} onClick={() => onChange(it.value)}
            style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0", position: "relative" }}>
            {it.badge ? (
              <span style={{ position: "absolute", top: -1, right: "28%", width: 7, height: 7, borderRadius: 99, background: C.orange }} />
            ) : null}
            <Icon size={20} strokeWidth={active ? 2.4 : 1.9} color={active ? C.orange : C.slateLight} />
            <span style={{ fontSize: T.tiny, fontWeight: active ? 700 : 500, color: active ? C.jet : C.slateLight, ...fBody }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 10, ...fDisplay }}>{children}</div>;
}

export function Row({ label, value, bold, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <span style={{ fontSize: T.body, color: C.slate, ...fBody }}>{label}</span>
      <span style={{ fontSize: T.body, color: C.jet, fontWeight: bold ? 700 : 500, ...fBody }}>{value}</span>
    </div>
  );
}

export function Field({ label, placeholder, type = "text", icon: Icon, rightIcon: RightIcon, onRight, show = true, value, onChange }) {
  if (!show) return null;
  return (
    <div>
      <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
        {Icon && <Icon size={16} color={C.slateLight} />}
        <input placeholder={placeholder} type={type} value={value} onChange={onChange} style={{ border: "none", outline: "none", flex: 1, fontSize: T.subtitle, ...fBody }} />
        {RightIcon && <button onClick={onRight} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><RightIcon size={16} color={C.slateLight} /></button>}
      </div>
    </div>
  );
}

export function BottomSheet({ open, onClose, title, children, heightPct = 70 }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 95 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.45)", animation: "clBackdropIn .18s ease" }}
      />
      <div
        role="dialog"
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: `${heightPct}%`,
          background: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26,
          display: "flex", flexDirection: "column", boxShadow: "0 -12px 30px rgba(0,0,0,.18)",
          animation: "clSheetUp .22s cubic-bezier(.32,.72,0,1)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px", background: "none", border: "none", cursor: "pointer" }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 99, background: C.border }} />
        </button>
        {title && (
          <div style={{ padding: "6px 20px 10px", fontSize: T.title, fontWeight: 600, color: C.jet, ...fDisplay }}>{title}</div>
        )}
        <div style={{ overflowY: "auto", padding: "4px 20px 24px", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function StatusBar({ dark }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px 6px", fontSize: T.body, fontWeight: 600, color: dark ? C.white : C.jet, ...fBody }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{ fontSize: T.micro}}>●●●●</span>
        <span style={{ fontSize: T.micro}}>Wi‑Fi</span>
        <span style={{ border: `1.3px solid ${dark ? C.white : C.jet}`, borderRadius: 3, width: 20, height: 10, position: "relative", display: "inline-block" }}>
          <span style={{ position: "absolute", inset: 1.5, right: 3, background: dark ? C.white : C.jet, borderRadius: 1 }} />
        </span>
      </div>
    </div>
  );
}
