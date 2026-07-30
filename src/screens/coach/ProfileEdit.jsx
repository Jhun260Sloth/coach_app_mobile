import React, { useState } from "react";
import { Camera, Plus, Play, Edit3, ShieldCheck, BadgeCheck } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES } from "../../data/mockData";
import { Avatar, SectionLabel, Chip, Card, Toggle, Btn, Badge } from "../../components/ui/Primitives";

export function ScreenCoachProfileEdit({ nav, toast }) {
  const coach = COACHES[1];
  const [instantBook, setInstantBook] = useState(coach.instantBook);
  const [policy, setPolicy] = useState("Moderate");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 16, ...fDisplay }}>My coaching profile</div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Avatar name={coach.name} size={72} />
            <button style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: 99, background: C.orange, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={12} color={C.white} />
            </button>
          </div>
        </div>

        <SectionLabel>Bio</SectionLabel>
        <textarea defaultValue={coach.bio} rows={4} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 13, fontSize: 13, resize: "none", outline: "none", marginBottom: 18, ...fBody }} />

        <SectionLabel>Sports coached</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {[coach.sport, ...coach.tags].map((t) => <Chip key={t} active>{t}</Chip>)}
          <Chip icon={Plus}>Add</Chip>
        </div>

        <SectionLabel>Reels & photos</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: `linear-gradient(160deg, ${C.jetSoft}, ${C.jet})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={13} color={C.white} fill={C.white} />
            </div>
          ))}
          <button onClick={() => toast("Opening camera — trim clip before posting")} style={{ aspectRatio: "1", borderRadius: 12, border: `1.5px dashed ${C.border}`, background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Camera size={16} color={C.slate} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: C.slateLight, marginBottom: 18, ...fBody }}>Trim clips right after capture before adding them to your profile.</div>

        <SectionLabel>Services & rates</SectionLabel>
        {coach.packages.map((p) => (
          <Card key={p.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{p.type} · {p.duration} min · {p.mode}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.jet, ...fDisplay }}>${p.price}</span>
              <Edit3 size={15} color={C.slateLight} />
            </div>
          </Card>
        ))}
        <Btn variant="outline" size="sm" icon={Plus} full onClick={() => toast("New package draft created")}>Add package</Btn>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Booking type</SectionLabel>
          <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>Instant Book</div>
              <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{instantBook ? "Requests are auto-confirmed" : "You'll review each request"}</div>
            </div>
            <Toggle on={instantBook} onClick={() => setInstantBook((v) => !v)} />
          </Card>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Cancellation policy</SectionLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {["Flexible", "Moderate", "Strict"].map((p) => <Chip key={p} active={policy === p} onClick={() => setPolicy(p)}>{p}</Chip>)}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel>Verification</SectionLabel>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge tone="success" icon={ShieldCheck}>ID verified</Badge>
            <Badge tone="success" icon={ShieldCheck}>WWCC verified</Badge>
            <Badge tone="success" icon={BadgeCheck}>Quals checked</Badge>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn full onClick={() => toast("Profile changes saved")}>Save changes</Btn>
        </div>
      </div>
    </div>
  );
}
