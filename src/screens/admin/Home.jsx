import React from "react";
import { TrendingUp, Percent, ClipboardList, Users, ChevronRight } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { CONFIG, ADMIN_RECENT_BOOKINGS } from "../../data/mockData";
import { Card, Badge, SectionLabel, Avatar, StatusPill } from "../../components/ui/Primitives";

export function AdminSectionHeader({ title, count, onSeeAll }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SectionLabel>{title}</SectionLabel>
        {count != null && <Badge tone={count > 0 ? "orange" : "neutral"}>{count}</Badge>}
      </div>
      {onSeeAll && <button onClick={onSeeAll} style={{ background: "none", border: "none", color: C.brand, fontSize: T.label, fontWeight: 600, cursor: "pointer", ...fBody }}>See all</button>}
    </div>
  );
}

export function StatBig({ label, value, icon: Icon }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <Card>
      <Icon size={15} color={C.brand} />
      <div style={{ fontSize: T.headingLg, fontWeight: 700, color: C.jet, marginTop: 8, ...fDisplay }}>{value}</div>
      <div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>{label}</div>
    </Card>
  );
}

export function ScreenAdminHome({ nav, verificationQueue, disputes }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const pendingCount = verificationQueue.length;
  const disputeCount = disputes.length;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: T.labelLg, color: C.slate, ...fBody }}>Admin console</div>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Platform overview</div>

        {/* Revenue */}
        <div style={{ background: C.jet, borderRadius: 20, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: T.caption, color: C.onDarkMuted, ...fBody }}>Revenue (30d)</div>
          <div style={{ fontSize: T.heroLg, fontWeight: 800, color: C.white, marginTop: 4, ...fDisplay }}>$7,230</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Badge tone="dark" icon={TrendingUp}>$48.2k GMV</Badge>
            <Badge tone="dark" icon={Percent}>{Math.round(CONFIG.commissionRate * 100)}% commission</Badge>
          </div>
        </div>

        {/* Platform-wide bookings */}
        <AdminSectionHeader title="Bookings" onSeeAll={() => nav("admin-disputes")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
          <StatBig label="Bookings (30d)" value="612" icon={ClipboardList} />
          <StatBig label="Active coaches" value="184" icon={Users} />
        </div>
        <div style={{ marginTop: 10 }}>
          {ADMIN_RECENT_BOOKINGS.map((b) => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{b.client} <span style={{ color: C.slateLight, fontWeight: 400 }}>→</span> {b.coach}</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>${b.amount}</div>
              </div>
              <StatusPill status={b.status} />
            </Card>
          ))}
        </div>

        {/* Verification queue */}
        <AdminSectionHeader title="Verification queue" count={pendingCount} onSeeAll={() => nav("admin-verify")} />
        {verificationQueue.slice(0, 2).map((v) => (
          <Card key={v.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }} onClick={() => nav("admin-verify-detail", { id: v.id })}>
            <Avatar name={v.name} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{v.name}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{v.sport} · {v.type}</div>
            </div>
            {v.submittedByUser && <Badge tone="orange">New</Badge>}
            <ChevronRight size={15} color={C.slateLight} />
          </Card>
        ))}

        {/* Disputes */}
        <AdminSectionHeader title="Disputes" count={disputeCount} onSeeAll={() => nav("admin-disputes")} />
        {disputes.slice(0, 2).map((d) => (
          <Card key={d.id} style={{ marginBottom: 10 }} onClick={() => nav("admin-dispute-detail", { id: d.id })}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fDisplay }}>Booking {d.booking}</div>
              <Badge tone="orange">Open</Badge>
            </div>
            <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>{d.issue} · {d.parties}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
