import React from "react";
import { Banknote, Percent, Wallet, ChevronRight } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { CONFIG } from "../../data/mockData";
import { Card, Badge, SectionLabel, Row, TopBar } from "../../components/ui/Primitives";
import { getBookingClientName } from "../../utils/name";
import { withClientMeta } from "../../data/users";
import { BOOKING_STATUS, PAYOUT_STATUS } from "../../data/bookings";

export function ScreenCoachEarnings({ nav, goBack, coachBookings }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const completed = coachBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
  const released = completed.filter((b) => b.payoutStatus === PAYOUT_STATUS.RELEASED);
  const processing = coachBookings.filter((b) => b.payoutStatus === PAYOUT_STATUS.PROCESSING);
  const gross = released.reduce((s, b) => s + Number(b.paidTotal || b.price || 0), 0);
  const commission = Math.round(gross * CONFIG.commissionRate);
  const net = gross - commission;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Earnings & payouts" onBack={() => goBack("coach-profile-edit")} />

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px", paddingBottom: "max(28px, env(safe-area-inset-bottom))" }} className="cl-hide-scrollbar">

        <div style={{ background: C.jet, borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: T.captionLg, color: C.onDarkMuted, ...fBody }}>Released earnings</div>
          <div style={{ fontSize: T.heroLg, fontWeight: 800, color: C.white, marginTop: 4, ...fDisplay }}>${net}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Badge tone="dark" icon={Banknote}>Next payout Fri</Badge>
            <Badge tone="dark" icon={Percent}>{Math.round(CONFIG.commissionRate * 100)}% commission</Badge>
          </div>
          {processing.length > 0 && <div style={{ fontSize: T.captionLg, color: C.onDark, marginTop: 12, ...fBody }}>{processing.length} payout{processing.length === 1 ? "" : "s"} currently processing</div>}
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Row label="Gross earnings" value={`$${gross}`} />
          <Row label="Platform commission" value={`-$${commission}`} />
          <Row label="Net payout" value={`$${net}`} bold last />
        </Card>

        <SectionLabel>Payout method</SectionLabel>
        <Card ariaLabel="Edit payout method" onClick={() => nav("coach-payout-setup", { mode: "edit" })} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <Wallet size={17} color={C.jet} />
          <span style={{ fontSize: T.body, color: C.jet, fontWeight: 500, ...fBody }}>Bank account •••• 2210</span>
          <ChevronRight size={15} color={C.slateLight} style={{ marginLeft: "auto" }} />
        </Card>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SectionLabel>Recent transactions</SectionLabel>
          {completed.length > 0 && (
            <button type="button" onClick={() => nav("coach-history")} style={{ minHeight: 44, padding: "0 4px", background: "transparent", border: "none", color: C.brand, fontWeight: 600, fontSize: T.label, cursor: "pointer", ...fBody }}>
              Payout history
            </button>
          )}
        </div>
        {completed.length === 0 && (
          <div style={{ fontSize: T.labelLg, color: C.slate, padding: "6px 2px 2px", ...fBody }}>No completed sessions yet.</div>
        )}
        <div className="cl-stagger">
        {completed.slice(0, 3).map((b, i) => (
          <Card key={b.id} onClick={() => nav("funds-release-status", { bookingId: b.id, role: "coach", backTo: "coach-earnings" })} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <div>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{b.date} · {getBookingClientName(withClientMeta(b)).name}</div>
              <div style={{ marginTop: 5 }}><Badge tone={b.payoutStatus === PAYOUT_STATUS.RELEASED ? "success" : "orange"}>{b.payoutStatus === PAYOUT_STATUS.RELEASED ? "Payout released" : "Processing"}</Badge></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.success, ...fDisplay }}>+${Math.round(Number(b.paidTotal || b.price || 0) * (1 - CONFIG.commissionRate))}</span>
              <ChevronRight size={14} color={C.slateLight} />
            </div>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
}

