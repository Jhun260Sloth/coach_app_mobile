import React from "react";
import { Banknote, Percent, Wallet, ChevronRight, Download } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { CONFIG } from "../../data/mockData";
import { Card, Badge, SectionLabel, Row } from "../../components/ui/Primitives";

export function ScreenCoachEarnings({ nav, coachBookings }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const completed = coachBookings.filter((b) => b.status === "completed");
  const gross = completed.reduce((s, b) => s + b.price, 0);
  const commission = Math.round(gross * CONFIG.commissionRate);
  const net = gross - commission;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, marginBottom: 16, ...fDisplay }}>Earnings</div>

        <div style={{ background: C.jet, borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: T.captionLg, color: C.onDarkMuted, ...fBody }}>Available for payout</div>
          <div style={{ fontSize: T.heroLg, fontWeight: 800, color: C.white, marginTop: 4, ...fDisplay }}>${net}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Badge tone="dark" icon={Banknote}>Next payout Fri</Badge>
            <Badge tone="dark" icon={Percent}>{Math.round(CONFIG.commissionRate * 100)}% commission</Badge>
          </div>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Row label="Gross earnings" value={`$${gross}`} />
          <Row label="Platform commission" value={`-$${commission}`} />
          <Row label="Net payout" value={`$${net}`} bold last />
        </Card>

        <SectionLabel>Payout method</SectionLabel>
        <Card style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <Wallet size={17} color={C.jet} />
          <span style={{ fontSize: T.body, color: C.jet, fontWeight: 500, ...fBody }}>Bank account •••• 2210</span>
          <ChevronRight size={15} color={C.slateLight} style={{ marginLeft: "auto" }} />
        </Card>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SectionLabel>Recent transactions</SectionLabel>
          {completed.length > 0 && (
            <button onClick={() => nav("coach-history")} style={{ background: "none", border: "none", color: C.brand, fontWeight: 600, fontSize: T.label, cursor: "pointer", ...fBody }}>
              View all
            </button>
          )}
        </div>
        {completed.length === 0 && (
          <div style={{ fontSize: T.labelLg, color: C.slate, padding: "6px 2px 2px", ...fBody }}>No completed sessions yet.</div>
        )}
        {completed.slice(0, 3).map((b) => (
          <Card key={b.id} onClick={() => nav("coach-history")} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{b.date} · {b.clientName}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.success, ...fDisplay }}>+${Math.round(b.price * (1 - CONFIG.commissionRate))}</span>
              <ChevronRight size={14} color={C.slateLight} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

