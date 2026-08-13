import React from "react";
import { Search, X, MapPin } from "lucide-react";
import { CL, CD, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";

// Split out from the map so typing in the search field doesn't re-render the
// Leaflet map/marker tree on every keystroke — only this bar re-renders.
function MapSearchBarBase({ value, onChange, onClear, onClose, onFocus, onBlur, showSuggestions, suggestions, onSelectSuggestion }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 401 }}>
      {/* Full-width, flush to the edges — no side margins — white bar with a bottom shadow */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: C.white,
        padding: "14px 16px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <X size={18} color={C.jet} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Search size={15} color={C.slateLight} style={{ flexShrink: 0 }} />
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Search location..."
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: T.subtitle, color: C.jet, ...fBody }}
          />
          {value && (
            <button onMouseDown={e => e.preventDefault()} onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
              <X size={14} color={C.slateLight} />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div style={{ margin: "0 16px", background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          {suggestions.map(s => (
            <button key={s} onMouseDown={() => onSelectSuggestion(s)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: T.body, color: C.jet, ...fBody }}>
              <MapPin size={13} color={C.slateLight} />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const MapSearchBar = React.memo(MapSearchBarBase);
