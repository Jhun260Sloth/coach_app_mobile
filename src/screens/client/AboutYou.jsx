import React, { useState } from "react";
import { Search, X, MapPin, Check } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { SPORTS, ALL_SUBURBS } from "../../data/mockData";
import { Chip, SectionLabel, Btn } from "../../components/ui/Primitives";

export function ScreenAboutYou({ nav, onComplete }) {
  const [locations, setLocations] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [sports, setSports] = useState([]);

  const toggleLocation = (loc) => setLocations((arr) => arr.includes(loc) ? arr.filter((x) => x !== loc) : [...arr, loc]);
  const toggleSport = (s) => setSports((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]);

  const filteredLocations = locationSearch.trim()
    ? ALL_SUBURBS.filter((l) => l.toLowerCase().includes(locationSearch.trim().toLowerCase()))
    : ALL_SUBURBS;

  const canContinue = locations.length > 0 && sports.length > 0;

  const handleContinue = () => {
    const prefs = { locations, sports };
    if (onComplete) onComplete(prefs);
    nav("client-home");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>
          Let's learn about you
        </div>
        <div style={{ fontSize: 13, color: C.slate, ...fBody, marginBottom: 20, lineHeight: 1.5 }}>
          This helps us match you with the right coaches nearby.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>What location are you looking into?</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
          <Search size={16} color={C.slateLight} />
          <input
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder="Search suburb or area"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }}
          />
          {locationSearch && (
            <button onClick={() => setLocationSearch("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <X size={14} color={C.slateLight} />
            </button>
          )}
        </div>

        {locations.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {locations.map((l) => (
              <span key={l} style={{
                display: "flex", alignItems: "center", gap: 6, background: C.orangeTint, color: C.orange,
                borderRadius: 99, padding: "6px 10px", fontSize: 12.5, fontWeight: 600, ...fBody,
              }}>
                {l}
                <button onClick={() => toggleLocation(l)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  <X size={12} color={C.orange} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
          {filteredLocations.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 12.5, color: C.slateLight, ...fBody }}>
              No matching suburbs.
            </div>
          ) : (
            filteredLocations.map((loc, i) => {
              const active = locations.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggleLocation(loc)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: active ? C.orangeTint : C.white, border: "none",
                    borderBottom: i === filteredLocations.length - 1 ? "none" : `1px solid ${C.border}`,
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.jet, ...fBody }}>
                    <MapPin size={14} color={active ? C.orange : C.slateLight} /> {loc}
                  </span>
                  {active && <Check size={16} color={C.orange} />}
                </button>
              );
            })
          )}
        </div>

        <SectionLabel>What sports are you into?</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {SPORTS.map((s) => (
            <Chip key={s} active={sports.includes(s)} onClick={() => toggleSport(s)}>{s}</Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={handleContinue} style={!canContinue ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          Continue
        </Btn>
        <button
          onClick={() => nav("client-home")}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 10, fontSize: 12.5, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}