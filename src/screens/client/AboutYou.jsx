import React, { useState } from "react";
import { MapPin, Check } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { SPORTS, ALL_SUBURBS } from "../../data/mockData";
import { Chip, SectionLabel, Btn, TopBar } from "../../components/ui/Primitives";

function StepDots({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ height: 4, borderRadius: 2, flex: 1, background: i <= step ? C.success : C.border, transition: "background .25s ease" }} />
      ))}
    </div>
  );
}

/* Step 1 of 2 — address (skippable) */
export function ScreenAboutYouLocation({ nav, params }) {
  const [address, setAddress] = useState(params?.address || "");

  const suggestions = address.trim()
    ? ALL_SUBURBS.filter((l) => l.toLowerCase().includes(address.trim().toLowerCase()))
    : ALL_SUBURBS;

  const canContinue = address.trim().length > 0;

  const goToSports = (addr) => nav("about-you-sports", { address: addr });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 20px 0" }}>
        <StepDots step={0} />
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>
          Let's learn about you
        </div>
        <div style={{ fontSize: 13, color: C.slate, ...fBody, marginBottom: 20, lineHeight: 1.5 }}>
          This helps us match you with the right coaches nearby.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>What's your address?</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
          <MapPin size={16} color={C.slateLight} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }}
          />
        </div>

        <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 12.5, color: C.slateLight, ...fBody }}>
              No matching suburbs.
            </div>
          ) : (
            suggestions.map((loc, i) => (
              <button
                key={loc}
                onClick={() => setAddress(loc)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", background: address === loc ? C.orangeTint : C.white, border: "none",
                  borderBottom: i === suggestions.length - 1 ? "none" : `1px solid ${C.border}`,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.jet, ...fBody }}>
                  <MapPin size={14} color={address === loc ? C.orange : C.slateLight} /> {loc}
                </span>
                {address === loc && <Check size={16} color={C.orange} />}
              </button>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={() => goToSports(address)} style={!canContinue ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          Continue
        </Btn>
        <button
          onClick={() => goToSports("")}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 10, fontSize: 12.5, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* Step 2 of 2 — sports (skippable) */
export function ScreenAboutYouSports({ nav, params, onComplete }) {
  const address = params?.address || "";
  const [sports, setSports] = useState([]);

  const toggleSport = (s) => setSports((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]);

  const canContinue = sports.length > 0;

  const finish = (selectedSports) => {
    const prefs = { address, sports: selectedSports };
    if (onComplete) onComplete(prefs);
    nav("client-home");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <TopBar title="" onBack={() => nav("about-you", { address })} />
        <StepDots step={1} />
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>
          Let's learn about you
        </div>
        <div style={{ fontSize: 13, color: C.slate, ...fBody, marginBottom: 20, lineHeight: 1.5 }}>
          This helps us match you with the right coaches nearby.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <SectionLabel>What sports are you into?</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {SPORTS.map((s) => (
            <Chip key={s} active={sports.includes(s)} onClick={() => toggleSport(s)}>{s}</Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px 20px" }}>
        <Btn full onClick={() => finish(sports)} style={!canContinue ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          Continue
        </Btn>
        <button
          onClick={() => finish([])}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 10, fontSize: 12.5, color: C.slateLight, textDecoration: "underline", ...fBody }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}