import React, { useState, useRef } from "react";
import {
  ArrowRight, Camera, User, Trophy, Clock, Award, Images, Video,
  Upload, X, Plus, CheckCircle2, Trash2, DollarSign, Layers, FileText,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { Btn, Card, Badge, Toggle, TopBar, Field } from "../../components/ui/Primitives";

/* =========================================================================
   COACH — PROFILE SETUP
   (reached via "Proceed to Profile Setup" on the verification success screen)
   ========================================================================= */

const SPORTS = [
  "Tennis", "Basketball", "Football", "Swimming", "Golf",
  "Yoga", "Boxing", "Running", "Strength & Conditioning", "Padel",
];

const EXPERIENCE_LEVELS = [
  { key: "0-2", label: "0–2 years" },
  { key: "3-5", label: "3–5 years" },
  { key: "6-10", label: "6–10 years" },
  { key: "10+", label: "10+ years" },
];

export function ScreenProfileSetup({ nav, toast, saveProfile }) {
  const [photo, setPhoto] = useState(null);
  const [bio, setBio] = useState("");
  const [sports, setSports] = useState([]);
  const [experience, setExperience] = useState(null);
  const [certs, setCerts] = useState([]);
  const [media, setMedia] = useState([]);

  const photoInput = useRef(null);
  const certInput = useRef(null);
  const mediaInput = useRef(null);

  const toggleSport = (s) =>
    setSports((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const onPhotoChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto({ name: file.name, url: URL.createObjectURL(file) });
  };

  const onCertsChosen = (e) => {
    const files = Array.from(e.target.files || []);
    setCerts((cur) => [
      ...cur,
      ...files.map((f) => ({ id: `${Date.now()}-${f.name}`, name: f.name })),
    ]);
    e.target.value = "";
  };

  const onMediaChosen = (e) => {
    const files = Array.from(e.target.files || []);
    setMedia((cur) => [
      ...cur,
      ...files.map((f) => ({
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        type: f.type.startsWith("video") ? "video" : "photo",
        url: URL.createObjectURL(f),
      })),
    ]);
    e.target.value = "";
  };

  const removeCert = (id) => setCerts((cur) => cur.filter((c) => c.id !== id));
  const removeMedia = (id) => setMedia((cur) => cur.filter((m) => m.id !== id));

  const complete = photo && bio.trim().length > 0 && sports.length > 0 && experience;

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Set up your profile" />
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 18, ...fBody }}>
        This is what clients see when they search for a coach. Complete every field to get discovered faster.
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {/* Profile image */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            onClick={() => photoInput.current?.click()}
            style={{
              width: 72, height: 72, borderRadius: 20, background: photo ? "transparent" : C.orangeTint,
              border: `1.5px dashed ${photo ? "transparent" : C.border}`, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, overflow: "hidden",
            }}
          >
            {photo ? (
              <img src={photo.url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={26} color={C.orange} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.jet, ...fDisplay }}>Profile photo</div>
            <button
              onClick={() => photoInput.current?.click()}
              style={{ marginTop: 4, background: "none", border: "none", color: C.orange, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0, ...fBody }}
            >
              <Camera size={13} /> {photo ? "Change photo" : "Upload photo"}
            </button>
          </div>
          <input ref={photoInput} type="file" accept="image/*" onChange={onPhotoChosen} style={{ display: "none" }} />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Bio</div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 400))}
            placeholder="Tell clients about your coaching style, background and what makes you different..."
            rows={4}
            style={{
              width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 12,
              fontSize: 13.5, color: C.jet, resize: "none", outline: "none", boxSizing: "border-box", ...fBody,
            }}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: C.slateLight, marginTop: 4, ...fBody }}>
            {bio.length}/400
          </div>
        </div>

        {/* Sports coached */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 8, ...fBody }}>Sports coached</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SPORTS.map((s) => {
              const active = sports.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSport(s)}
                  style={{
                    padding: "8px 13px", borderRadius: 12, fontSize: 12.5, cursor: "pointer",
                    border: `1.5px solid ${active ? C.orange : C.border}`,
                    background: active ? C.orange : C.white,
                    color: active ? C.white : C.jet, fontWeight: 600, ...fBody,
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 8, ...fBody }}>
            <Trophy size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Experience
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXPERIENCE_LEVELS.map((lvl) => {
              const active = experience === lvl.key;
              return (
                <button
                  key={lvl.key}
                  onClick={() => setExperience(lvl.key)}
                  style={{
                    padding: "8px 13px", borderRadius: 12, fontSize: 12.5, cursor: "pointer",
                    border: `1.5px solid ${active ? C.orange : C.border}`,
                    background: active ? C.orange : C.white,
                    color: active ? C.white : C.jet, fontWeight: 600, ...fBody,
                  }}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Certifications upload */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, ...fBody }}>
              <Award size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Certifications
            </div>
            <button
              onClick={() => certInput.current?.click()}
              style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, ...fBody }}
            >
              <Upload size={12} /> Upload
            </button>
            <input ref={certInput} type="file" accept=".pdf,image/*" multiple onChange={onCertsChosen} style={{ display: "none" }} />
          </div>
          {certs.length === 0 ? (
            <div style={{ fontSize: 12, color: C.slateLight, ...fBody }}>No certifications uploaded yet — optional but builds trust.</div>
          ) : (
            certs.map((c) => (
              <Card key={c.id} style={{ marginBottom: 8, padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <FileText size={15} color={C.orange} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: C.jet, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...fBody }}>{c.name}</span>
                  </div>
                  <button onClick={() => removeCert(c.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                    <Trash2 size={14} color={C.slateLight} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Photos & video reels */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, ...fBody }}>
              <Images size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Photos & video reels
            </div>
            <button
              onClick={() => mediaInput.current?.click()}
              style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, ...fBody }}
            >
              <Upload size={12} /> Add
            </button>
            <input ref={mediaInput} type="file" accept="image/*,video/*" multiple onChange={onMediaChosen} style={{ display: "none" }} />
          </div>
          {media.length === 0 ? (
            <div style={{ fontSize: 12, color: C.slateLight, ...fBody }}>Show your coaching in action — add a few photos or a short reel.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {media.map((m) => (
                <div key={m.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", background: C.orangeTint }}>
                  {m.type === "video" ? (
                    <video src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                  ) : (
                    <img src={m.url} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  {m.type === "video" && (
                    <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,.55)", borderRadius: 6, padding: "2px 5px", display: "flex", alignItems: "center", gap: 3 }}>
                      <Video size={10} color={C.white} />
                    </div>
                  )}
                  <button
                    onClick={() => removeMedia(m.id)}
                    style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 6, background: "rgba(0,0,0,.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X size={12} color={C.white} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "14px 0" }}>
        <Btn
          full
          disabled={!complete}
          onClick={() => {
            saveProfile?.({ photo, bio, sports, experience, certs, media });
            toast("Profile saved");
            nav("services-setup");
          }}
        >
          Continue to services setup <ArrowRight size={16} />
        </Btn>
        {!complete && (
          <div style={{ fontSize: 11.5, color: C.slateLight, textAlign: "center", marginTop: 8, ...fBody }}>
            Add a photo, bio, at least one sport and your experience level to continue.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   COACH — COACHING SERVICES SETUP
   (reached after Profile Setup is completed)
   ========================================================================= */

const CATEGORIES = ["Fitness & Conditioning", "Sport-specific", "Wellness", "Nutrition", "Mental Performance", "Other"];
const RATE_UNITS = ["session", "hour", "package"];
const DURATIONS = ["30 min", "45 min", "60 min", "90 min", "Custom"];
const PACKAGE_TYPES = ["1:1 Session", "Group Session", "Package Deal", "Online Session"];

const emptyService = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  category: "",
  rate: "",
  rateUnit: "session",
  duration: "60 min",
  terms: "",
  packageTypes: [],
});

export function ScreenServicesSetup({ nav, toast, saveServices }) {
  const [services, setServices] = useState([emptyService()]);

  const updateService = (id, patch) =>
    setServices((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const togglePackage = (id, pkg) =>
    setServices((cur) =>
      cur.map((s) =>
        s.id === id
          ? { ...s, packageTypes: s.packageTypes.includes(pkg) ? s.packageTypes.filter((p) => p !== pkg) : [...s.packageTypes, pkg] }
          : s
      )
    );

  const addService = () => setServices((cur) => [...cur, emptyService()]);
  const removeService = (id) => setServices((cur) => (cur.length > 1 ? cur.filter((s) => s.id !== id) : cur));

  const isValid = (s) => s.name.trim() && s.category && s.rate && s.packageTypes.length > 0;
  const complete = services.every(isValid);

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Coaching services" onBack={() => nav("profile-setup")} />
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 16, ...fBody }}>
        Set up at least one service clients can book. You can add more, or edit pricing, any time from your dashboard.
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {services.map((s, idx) => (
          <Card key={s.id} style={{ marginBottom: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.jet, ...fDisplay }}>Service {idx + 1}</div>
              {services.length > 1 && (
                <button onClick={() => removeService(s.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <Trash2 size={15} color={C.slateLight} />
                </button>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <Field
                label="Service name"
                placeholder="e.g. 1-on-1 Tennis Coaching"
                value={s.name}
                onChange={(e) => updateService(s.id, { name: e.target.value })}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 8, ...fBody }}>Category</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const active = s.category === c;
                  return (
                    <button
                      key={c}
                      onClick={() => updateService(s.id, { category: c })}
                      style={{
                        padding: "7px 12px", borderRadius: 11, fontSize: 12, cursor: "pointer",
                        border: `1.5px solid ${active ? C.orange : C.border}`,
                        background: active ? C.orange : C.white,
                        color: active ? C.white : C.jet, fontWeight: 600, ...fBody,
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rate */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>
                <DollarSign size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Rate
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "10px 13px" }}>
                  <span style={{ fontSize: 13.5, color: C.slateLight, marginRight: 4 }}>$</span>
                  <input
                    type="number"
                    min="0"
                    value={s.rate}
                    onChange={(e) => updateService(s.id, { rate: e.target.value })}
                    placeholder="50"
                    style={{ border: "none", outline: "none", flex: 1, fontSize: 13.5, color: C.jet, background: "transparent", ...fBody }}
                  />
                </div>
                <div style={{ display: "flex", border: `1.5px solid ${C.border}`, borderRadius: 13, overflow: "hidden" }}>
                  {RATE_UNITS.map((u) => (
                    <button
                      key={u}
                      onClick={() => updateService(s.id, { rateUnit: u })}
                      style={{
                        padding: "10px 12px", border: "none", cursor: "pointer", fontSize: 12,
                        background: s.rateUnit === u ? C.orange : C.white,
                        color: s.rateUnit === u ? C.white : C.slate, fontWeight: 600, ...fBody,
                      }}
                    >
                      /{u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Session duration */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 8, ...fBody }}>
                <Clock size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Session duration
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DURATIONS.map((d) => {
                  const active = s.duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => updateService(s.id, { duration: d })}
                      style={{
                        padding: "7px 12px", borderRadius: 11, fontSize: 12, cursor: "pointer",
                        border: `1.5px solid ${active ? C.orange : C.border}`,
                        background: active ? C.orange : C.white,
                        color: active ? C.white : C.jet, fontWeight: 600, ...fBody,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Package types */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 8, ...fBody }}>
                <Layers size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Package types
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PACKAGE_TYPES.map((p) => {
                  const active = s.packageTypes.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePackage(s.id, p)}
                      style={{
                        padding: "7px 12px", borderRadius: 11, fontSize: 12, cursor: "pointer",
                        border: `1.5px solid ${active ? C.orange : C.border}`,
                        background: active ? C.orange : C.white,
                        color: active ? C.white : C.jet, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 5, ...fBody,
                      }}
                    >
                      {active && <CheckCircle2 size={12} />} {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Terms</div>
              <textarea
                value={s.terms}
                onChange={(e) => updateService(s.id, { terms: e.target.value.slice(0, 300) })}
                placeholder="Cancellation policy, what's included, equipment needed..."
                rows={3}
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: 11,
                  fontSize: 13, color: C.jet, resize: "none", outline: "none", boxSizing: "border-box", ...fBody,
                }}
              />
            </div>
          </Card>
        ))}

        <button
          onClick={addService}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px", borderRadius: 14, border: `1.5px dashed ${C.border}`, background: "none",
            color: C.orange, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 14, ...fBody,
          }}
        >
          <Plus size={15} /> Add another service
        </button>
      </div>

      <div style={{ padding: "14px 0" }}>
        <Btn
          full
          disabled={!complete}
          onClick={() => {
            saveServices?.(services);
            toast("Services published — you're ready to accept bookings");
            nav("coach-dashboard");
          }}
        >
          Finish setup <ArrowRight size={16} />
        </Btn>
        {!complete && (
          <div style={{ fontSize: 11.5, color: C.slateLight, textAlign: "center", marginTop: 8, ...fBody }}>
            Each service needs a name, category, rate and at least one package type.
          </div>
        )}
      </div>
    </div>
  );
}