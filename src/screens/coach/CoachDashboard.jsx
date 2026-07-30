import React from "react";
import { WifiOff, Calendar, Star, Banknote } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { REVIEWS, CONFIG } from "../../data/mockData";
import { Avatar, Card, Btn, SectionLabel, StatusPill, StarRow } from "../../components/ui/Primitives";

export function StatMini({ label, value, icon: Icon }) {
  return (
    <Card style={{ flex: 1, textAlign: "center", padding: "12px 6px" }}>
      <Icon size={15} color={C.orange} style={{ margin: "0 auto 6px" }} />
      <div style={{ fontSize: 16, fontWeight: 700, color: C.jet, ...fDisplay }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.slate, ...fBody }}>{label}</div>
    </Card>
  );
}

export function ScreenCoachDashboard({ nav, coachBookings, setCoachBookings, verified, toast, offline }) {
  const pending = coachBookings.filter((b) => b.status === "pending");
  const upcoming = coachBookings.filter((b) => b.status === "confirmed");
  const completed = coachBookings.filter((b) => b.status === "completed");
  const earningsThisWeek = upcoming.reduce((s, b) => s + b.price, 0);
  const grossPaid = completed.reduce((s, b) => s + b.price, 0);
  const commission = Math.round(grossPaid * CONFIG.commissionRate);

  const respond = (id, status) => setCoachBookings((arr) => arr.map((b) => b.id === id ? { ...b, status } : b));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12.5, color: C.slate, ...fBody }}>Welcome back</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>Josh's dashboard</div>
          </div>
          <button onClick={() => nav("coach-profile-edit")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Avatar name="Josh Whitfield" size={40} />
          </button>
        </div>

        {offline && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.jet, color: C.white, padding: "9px 12px", borderRadius: 12, marginTop: 14, fontSize: 12, ...fBody }}>
            <WifiOff size={14} color={C.orange} /> Offline — showing your last synced data.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          <div style={{ background: C.jet, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#9CA0AC", ...fBody }}>This week's earnings</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.white, marginTop: 4, ...fDisplay }}>${earningsThisWeek}</div>
          </div>
          <div style={{ background: C.orangeTint, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 11, color: C.orange, fontWeight: 600, ...fBody }}>Pending requests</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.jet, marginTop: 4, ...fDisplay }}>{pending.length}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <StatMini label="Upcoming" value={upcoming.length} icon={Calendar} />
          <StatMini label="Rating" value="4.8" icon={Star} />
          <StatMini label="Next payout" value="Fri" icon={Banknote} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 10 }}>
          <SectionLabel>Pending requests</SectionLabel>
          <button onClick={() => nav("coach-bookings")} style={{ background: "none", border: "none", color: C.orange, fontSize: 12, fontWeight: 600, cursor: "pointer", ...fBody }}>See all</button>
        </div>
        {pending.length === 0 && <div style={{ fontSize: 12.5, color: C.slateLight, marginBottom: 6, ...fBody }}>No pending requests right now.</div>}
        {pending.map((b) => (
          <Card key={b.id} style={{ marginBottom: 10 }} onClick={() => nav("coach-booking-detail", { id: b.id })}>
            <div style={{ display: "flex", gap: 10 }}>
              <Avatar name={b.clientName} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{b.clientName}</div>
                <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{b.service} · {b.date}, {b.time}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.jet, ...fDisplay }}>${b.price}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn size="sm" full onClick={(e) => { e.stopPropagation(); respond(b.id, "confirmed"); toast("Booking accepted"); }}>Accept</Btn>
              <Btn size="sm" full variant="outline" onClick={(e) => { e.stopPropagation(); respond(b.id, "cancelled"); toast("Booking declined"); }}>Decline</Btn>
            </div>
          </Card>
        ))}

        <div style={{ marginTop: 18, marginBottom: 10 }}><SectionLabel>Upcoming sessions</SectionLabel></div>
        {upcoming.length === 0 ? <div style={{ fontSize: 12.5, color: C.slateLight, ...fBody }}>Nothing scheduled yet.</div> :
          upcoming.map((b) => (
            <Card key={b.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar name={b.clientName} size={38} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{b.clientName}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{b.date} · {b.time}</div>
                </div>
              </div>
              <StatusPill status="confirmed" />
            </Card>
          ))}

        <div style={{ marginTop: 18, marginBottom: 10 }}><SectionLabel>Recent reviews</SectionLabel></div>
        {REVIEWS.slice(0, 2).map((r) => (
          <Card key={r.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{r.name}</div>
              <StarRow value={r.rating} size={11} />
            </div>
            <p style={{ fontSize: 12.5, color: C.slate, marginTop: 4, lineHeight: 1.5, ...fBody }}>{r.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
