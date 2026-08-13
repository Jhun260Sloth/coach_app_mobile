import React from "react";
import { AlertCircle, FileText, Banknote } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { Card, Badge, EmptyState, Btn, TopBar, SectionLabel, Row } from "../../components/ui/Primitives";

export function ScreenAdminDisputes({ nav, disputes }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Disputes</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {disputes.length === 0 && <EmptyState icon={AlertCircle} title="No open disputes" body="Resolved disputes will disappear from this list." />}
        {disputes.map((d) => (
          <Card key={d.id} style={{ marginBottom: 10 }} onClick={() => nav("admin-dispute-detail", { id: d.id })}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Booking {d.booking}</div>
              <Badge tone="orange">Open</Badge>
            </div>
            <div style={{ fontSize: T.label, color: C.slate, marginTop: 3, ...fBody }}>{d.issue} · {d.parties}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn size="sm" variant="primary" full icon={FileText} onClick={(e) => { e.stopPropagation(); nav("admin-dispute-detail", { id: d.id }); }}>View details</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ScreenAdminDisputeDetail({ nav, params, disputes, resolveDispute, toast }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const dispute = disputes.find((d) => d.id === params.id);
  if (!dispute) return <EmptyState icon={AlertCircle} title="Dispute not found" body="This dispute may have already been resolved." />;
  const resolve = (action) => {
    resolveDispute(dispute.id);
    toast(action === "refund" ? "Refund issued to client" : "Dispute dismissed");
    nav("admin-disputes");
  };
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={`Dispute · Booking ${dispute.booking}`} onBack={() => nav("admin-disputes")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: T.subtitle, fontWeight: 600, color: C.jet, ...fDisplay }}>{dispute.issue}</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>{dispute.parties}</div>
            </div>
            <Badge tone="orange">Open</Badge>
          </div>
          <p style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.6, marginTop: 10, ...fBody }}>{dispute.summary}</p>
        </Card>

        <SectionLabel>Booking information</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          <Row label="Booking ID" value={dispute.booking} />
          <Row label="Service" value={dispute.service} />
          <Row label="Date" value={dispute.date} />
          <Row label="Filed by" value={dispute.filedBy} />
          <Row label="Amount in dispute" value={`$${dispute.amount}`} bold last />
        </Card>

        <SectionLabel>Submitted evidence</SectionLabel>
        {dispute.evidence.map((e, i) => (
          <Card key={i} style={{ marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={16} color={C.slate} />
            </div>
            <div>
              <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>{e.type}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{e.label}</div>
            </div>
          </Card>
        ))}

        <SectionLabel>Communication history</SectionLabel>
        <Card style={{ marginBottom: 14 }}>
          {dispute.messages.map((m, i) => (
            <div key={i} style={{ marginBottom: i === dispute.messages.length - 1 ? 0 : 12, paddingBottom: i === dispute.messages.length - 1 ? 0 : 12, borderBottom: i === dispute.messages.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>{m.from}</span>
                <span style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{m.time}</span>
              </div>
              <p style={{ fontSize: T.labelLg, color: C.slate, marginTop: 4, lineHeight: 1.55, ...fBody }}>{m.text}</p>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 0" }}>
        <Btn full variant="outline" onClick={() => resolve("dismiss")}>Dismiss</Btn>
        <Btn full variant="primary" icon={Banknote} onClick={() => resolve("refund")}>Issue refund</Btn>
      </div>
    </div>
  );
}
