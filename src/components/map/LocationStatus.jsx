import React from "react";
import { Navigation } from "lucide-react";
import { C, fBody } from "../../theme/theme";
import { Spinner } from "../ui/Primitives";

// Two tiny, independently-memoised pills: one while we're waiting on the first
// GPS fix, one once we have a live, continuously-updating ("fixed") location.
// Split out so they re-render only when their own boolean flips, not on every
// map interaction happening in the parent.
function LocationStatusBase({ locating, fixed }) {
  if (!locating && !fixed) return null;
  return (
    <div style={{
      position: "absolute", top: 78, left: 16, zIndex: 401, display: "flex", alignItems: "center", gap: 6,
      background: C.white, borderRadius: 99, padding: "6px 11px", fontSize: 11.5, fontWeight: 600, color: C.jet,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)", ...fBody,
    }}>
      {locating ? (
        <>
          <Spinner size={11} color={C.orange} /> Locating you…
        </>
      ) : (
        <>
          <span style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: 99, background: "#22C55E" }} />
            <span style={{ position: "absolute", inset: -3, borderRadius: 99, border: "1.5px solid #22C55E", animation: "clFixedBlink 1.8s ease-in-out infinite" }} />
          </span>
          <Navigation size={11} color={C.slate} /> Live location
        </>
      )}
    </div>
  );
}

export const LocationStatus = React.memo(LocationStatusBase);
