import React from "react";
import { LogOut } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { CONFIG } from "../../data/mockData";
import { Card, SectionLabel, Toggle, Badge } from "../../components/ui/Primitives";

export function ScreenAdminSettings({ nav }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Settings</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        <SectionLabel>Commission rate</SectionLabel>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: T.displayLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{Math.round(CONFIG.commissionRate * 100)}%</div>
          <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Applied to every completed booking</div>
        </Card>
        <SectionLabel>Featured listings</SectionLabel>
        <Card style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: T.body, color: C.jet, fontWeight: 500, ...fBody }}>Homepage featured slots</span>
          <Toggle on={true} onClick={() => {}} />
        </Card>
        <SectionLabel>Active promotions</SectionLabel>
        <Card style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>WELCOME10</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>10% off first booking</div>
          </div>
          <Badge tone="success">Active</Badge>
        </Card>
        <button onClick={() => nav("admin-login")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 4px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
          <LogOut size={17} color={C.jet} />
          <span style={{ fontSize: T.bodyLg, color: C.jet, fontWeight: 500, ...fBody }}>Log out</span>
        </button>
      </div>
    </div>
  );
}
