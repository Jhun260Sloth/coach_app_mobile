import React, { useState } from "react";
import { DollarSign, Users, MapPin } from "lucide-react";
import { C, fBody } from "../../theme/theme";
import { Chip, Btn, SearchSelect } from "./Primitives";

export const PACKAGE_TYPE_OPTIONS = [
  "1:1 Coaching", "Group Training", "Team Program", "Skills Clinic", "Online Coaching",
];
// Small set of quick-pick sports shown by default in the searchable Sport
// Category field below. Coaches aren't limited to this list — they can search
// a broader range or add any sport that isn't already listed.
export const SPORT_OPTIONS = [
  "Tennis", "Strength & Conditioning", "Swimming", "Basketball", "Football", "Yoga",
];
export const SESSION_DURATION_OPTIONS = [30, 45, 60, 90, 120];
export const DELIVERY_MODE_OPTIONS = ["In-person", "Online"];

const inputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "10px 13px",
  fontSize: 13, outline: "none", boxSizing: "border-box", ...fBody,
};
const fieldWrapStyle = {
  display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${C.border}`,
  borderRadius: 13, padding: "11px 13px", boxSizing: "border-box",
};
const fieldInputStyle = { border: "none", outline: "none", flex: 1, fontSize: 13, minWidth: 0, ...fBody };
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody };

export function emptyPackage() {
  return {
    name: "",
    packageType: "",
    sport: "",
    description: "",
    sessionDuration: 60,
    sessionDurationCustom: "",
    useCustomDuration: false,
    price: "",
    maxParticipants: "",
    deliveryMode: "",
    venue: "",
    equipment: "",
  };
}

export function isPackageValid(pkg) {
  const durationOk = pkg.useCustomDuration ? pkg.sessionDurationCustom.trim().length > 0 : !!pkg.sessionDuration;
  const venueOk = pkg.deliveryMode === "In-person" ? pkg.venue.trim().length > 0 : true;
  return (
    pkg.name.trim().length > 0 &&
    !!pkg.packageType &&
    !!pkg.sport &&
    durationOk &&
    pkg.price !== "" && Number(pkg.price) > 0 &&
    pkg.maxParticipants !== "" && Number(pkg.maxParticipants) > 0 &&
    !!pkg.deliveryMode &&
    venueOk
  );
}

export function packageSummary(pkg) {
  const duration = pkg.useCustomDuration ? pkg.sessionDurationCustom : `${pkg.sessionDuration} min`;
  const parts = [
    pkg.packageType, pkg.sport, duration,
    pkg.price !== "" ? `$${pkg.price}` : null,
    pkg.maxParticipants !== "" ? `max ${pkg.maxParticipants}` : null,
    pkg.deliveryMode,
  ];
  return parts.filter(Boolean).join(" · ");
}

/**
 * Controlled-ish package form for a single coaching service. Pass `initial`
 * to seed values (e.g. when editing), and receive the finished service
 * object via onSave.
 */
export function ServicePackageForm({ initial, onSave, onCancel, saveLabel = "Add Service" }) {
  const [pkg, setPkg] = useState(() => ({ ...emptyPackage(), ...(initial || {}) }));
  const set = (patch) => setPkg((p) => ({ ...p, ...patch }));
  const valid = isPackageValid(pkg);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={labelStyle}>Service name</div>
        <input
          value={pkg.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="e.g. 1:1 Court Session"
          style={inputStyle}
        />
      </div>

      <div style={labelStyle}>Package type</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {PACKAGE_TYPE_OPTIONS.map((t) => (
          <Chip key={t} active={pkg.packageType === t} onClick={() => set({ packageType: t })}>{t}</Chip>
        ))}
      </div>

      <div style={labelStyle}>Sport category</div>
      <div style={{ marginBottom: 16 }}>
        <SearchSelect
          options={SPORT_OPTIONS}
          value={pkg.sport}
          onChange={(v) => set({ sport: v })}
          placeholder="Search a sport or add your own…"
        />
      </div>

      <div style={labelStyle}>Description</div>
      <textarea
        value={pkg.description}
        onChange={(e) => set({ description: e.target.value })}
        rows={3}
        placeholder="What's included, who it's for, what to expect…"
        style={{ ...inputStyle, resize: "none", marginBottom: 16 }}
      />

      <div style={labelStyle}>Session duration</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {SESSION_DURATION_OPTIONS.map((d) => (
          <Chip
            key={d}
            active={!pkg.useCustomDuration && pkg.sessionDuration === d}
            onClick={() => set({ sessionDuration: d, useCustomDuration: false })}
          >
            {d} minutes
          </Chip>
        ))}
        <Chip active={pkg.useCustomDuration} onClick={() => set({ useCustomDuration: true })}>Custom</Chip>
      </div>
      {pkg.useCustomDuration && (
        <input
          value={pkg.sessionDurationCustom}
          onChange={(e) => set({ sessionDurationCustom: e.target.value })}
          placeholder="e.g. 75 minutes"
          style={{ ...inputStyle, marginBottom: 8 }}
        />
      )}
      <div style={{ marginBottom: 8 }} />

      <div style={labelStyle}>Price</div>
      <div style={{ ...fieldWrapStyle, marginBottom: 16 }}>
        <DollarSign size={14} color={C.slateLight} />
        <input
          value={pkg.price}
          onChange={(e) => set({ price: e.target.value.replace(/[^0-9.]/g, "") })}
          placeholder="e.g. 75"
          inputMode="decimal"
          style={fieldInputStyle}
        />
        <span style={{ fontSize: 11.5, color: C.slateLight, ...fBody }}>per session</span>
      </div>

      <div style={labelStyle}>Maximum participants</div>
      <div style={{ ...fieldWrapStyle, marginBottom: 16 }}>
        <Users size={14} color={C.slateLight} />
        <input
          value={pkg.maxParticipants}
          onChange={(e) => set({ maxParticipants: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="e.g. 1"
          inputMode="numeric"
          style={fieldInputStyle}
        />
      </div>

      <div style={labelStyle}>In-person / Online</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {DELIVERY_MODE_OPTIONS.map((m) => (
          <Chip
            key={m}
            active={pkg.deliveryMode === m}
            onClick={() => set({ deliveryMode: m, venue: m === "Online" ? "" : pkg.venue })}
          >
            {m}
          </Chip>
        ))}
      </div>

      {pkg.deliveryMode === "In-person" && (
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Venue</div>
          <div style={fieldWrapStyle}>
            <MapPin size={14} color={C.slateLight} />
            <input
              value={pkg.venue}
              onChange={(e) => set({ venue: e.target.value })}
              placeholder="e.g. Fitzroy Tennis Courts"
              style={fieldInputStyle}
            />
          </div>
        </div>
      )}

      <div style={labelStyle}>Equipment required (optional)</div>
      <input
        value={pkg.equipment}
        onChange={(e) => set({ equipment: e.target.value })}
        placeholder="e.g. Bring your own racquet"
        style={{ ...inputStyle, marginBottom: 18 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        {onCancel && <Btn variant="outline" full onClick={onCancel}>Cancel</Btn>}
        <Btn full disabled={!valid} onClick={() => valid && onSave(pkg)}>{saveLabel}</Btn>
      </div>
    </div>
  );
}
