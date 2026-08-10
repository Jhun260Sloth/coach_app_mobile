import React from "react";
import { Navigation, ChevronRight, X } from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";
import { Avatar } from "../ui/Primitives";

// Isolated so route-fetch progress (`routing`/`routeInfo`) only re-renders this
// card, not the search bar or radius filter above it.
function SelectedCoachCardBase({ coach, routing, routeInfo, onOpen, onClose }) {
  if (!coach) return null;
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 20, zIndex: 401, background: C.white,
      borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <Avatar name={coach.name} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: T.subtitle, color: C.jet, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...fDisplay }}>{coach.name}</div>
        <div style={{ fontSize: T.label, color: C.orange, fontWeight: 700, marginTop: 1, ...fDisplay }}>{coach.sport} · ${coach.packages[0].price}/session</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, display: "flex", alignItems: "center", gap: 4, ...fBody }}>
          <Navigation size={11} color={C.slateLight} />
          {routing ? "Finding route…" : routeInfo ? `${routeInfo.distanceKm.toFixed(1)} km · ${Math.round(routeInfo.durationMin)} min drive` : `${coach.distanceKm} km away`}
        </div>
      </div>
      <button onClick={() => onOpen?.(coach.id)} style={{ width: 38, height: 38, borderRadius: 11, background: C.orange, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <ChevronRight size={19} color={C.white} />
      </button>
      <button onClick={onClose} style={{ position: "absolute", top: -9, right: -9, width: 24, height: 24, borderRadius: 99, background: C.jet, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <X size={12} color={C.white} />
      </button>
    </div>
  );
}

export const SelectedCoachCard = React.memo(SelectedCoachCardBase);
