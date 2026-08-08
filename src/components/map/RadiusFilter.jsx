import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { C, fBody } from "../../theme/theme";
import { RADIUS_PRESETS_KM, CUSTOM_RADIUS_MIN_KM, CUSTOM_RADIUS_MAX_KM } from "../../lib/mapUtils";

const pill = active => ({
  display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
  padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
  border: `1px solid ${active ? C.orange : C.border}`,
  background: active ? C.orangeTint : C.white, color: active ? C.orange : C.jet,
  cursor: "pointer", whiteSpace: "nowrap", ...fBody,
});

// Isolated so dragging the custom-radius slider (which changes on every pixel)
// only re-renders this small control, not the whole map + coach pin tree.
function RadiusFilterBase({ radiusKm, onChange, resultCount }) {
  const isPreset = radiusKm != null && RADIUS_PRESETS_KM.includes(radiusKm);
  const isCustom = radiusKm != null && !isPreset;
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState(radiusKm && !isPreset ? radiusKm : 20);

  return (
    <div style={{ position: "absolute", top: 78, right: 16, left: showCustom ? 16 : "auto", zIndex: 401 }}>
      {showCustom ? (
        <div style={{ background: C.white, borderRadius: 14, padding: "12px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.jet, ...fBody }}>Custom radius</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, ...fBody }}>{customVal} km</span>
          </div>
          <input
            type="range" min={CUSTOM_RADIUS_MIN_KM} max={CUSTOM_RADIUS_MAX_KM} value={customVal}
            onChange={e => setCustomVal(Number(e.target.value))}
            onMouseUp={() => onChange(customVal)}
            onTouchEnd={() => onChange(customVal)}
            style={{ width: "100%", accentColor: C.orange }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setShowCustom(false)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.jet, fontSize: 12.5, fontWeight: 600, cursor: "pointer", ...fBody }}>Close</button>
            <button onClick={() => { onChange(customVal); setShowCustom(false); }} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: C.orange, color: C.white, fontSize: 12.5, fontWeight: 700, cursor: "pointer", ...fBody }}>Apply</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 7, overflowX: "auto", maxWidth: "100%", paddingBottom: 2 }} className="cl-hide-scrollbar">
          <button onClick={() => onChange(null)} style={{ ...pill(radiusKm == null), background: C.white, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>All</button>
          {RADIUS_PRESETS_KM.map(km => (
            <button key={km} onClick={() => onChange(km)} style={{ ...pill(radiusKm === km), boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>{km} km</button>
          ))}
          <button onClick={() => setShowCustom(true)} style={{ ...pill(isCustom), boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <SlidersHorizontal size={12} /> {isCustom ? `${radiusKm} km` : "Custom"}
          </button>
        </div>
      )}
      {!showCustom && radiusKm != null && (
        <div style={{ marginTop: 6, fontSize: 11, color: C.slate, textAlign: "right", ...fBody }}>
          {resultCount} coach{resultCount === 1 ? "" : "es"} within {radiusKm} km
        </div>
      )}
    </div>
  );
}

export const RadiusFilter = React.memo(RadiusFilterBase);
