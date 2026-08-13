import React from "react";
import { Flag } from "lucide-react";
import { CL, CD, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { ADMIN_FLAGGED } from "../../data/mockData";
import { Card, Badge, Btn } from "../../components/ui/Primitives";

export function ScreenAdminMod() {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, fontFamily: "'Outfit', sans-serif" }}>Moderation</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {ADMIN_FLAGGED.map((f) => (
          <Card key={f.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Badge tone="neutral" icon={Flag}>{f.type}</Badge>
              <span style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{f.reason}</span>
            </div>
            <div style={{ fontSize: T.labelLg, color: C.jet, marginTop: 8, ...fBody }}>{f.content}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn size="sm" full variant="outline">Remove</Btn>
              <Btn size="sm" full variant="primary">Keep</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
