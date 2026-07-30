import React, { useState } from "react";
import { ShieldCheck, ChevronRight, FileImage, CheckCircle2, Info, X } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { Avatar, Card, Badge, EmptyState, TopBar, SectionLabel, Btn } from "../../components/ui/Primitives";

export function ScreenAdminVerify({ nav, verificationQueue }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>Verification queue</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {verificationQueue.length ? verificationQueue.map((v) => (
          <Card key={v.id} style={{ marginBottom: 10 }} onClick={() => nav("admin-verify-detail", { id: v.id })}>
            <div style={{ display: "flex", gap: 10 }}>
              <Avatar name={v.name} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{v.name}</div>
                  {v.submittedByUser && <Badge tone="orange">New</Badge>}
                </div>
                <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{v.sport} · Submitted: {v.type}</div>
              </div>
              <ChevronRight size={15} color={C.slateLight} />
            </div>
          </Card>
        )) : <EmptyState icon={ShieldCheck} title="Queue clear" body="No verification requests waiting." />}
      </div>
    </div>
  );
}

export function ScreenAdminVerifyDetail({ nav, params, verificationQueue, decideVerification }) {
  const applicant = verificationQueue.find((v) => v.id === params.id);
  const [viewingDoc, setViewingDoc] = useState(null);
  if (!applicant) return <EmptyState icon={ShieldCheck} title="Request not found" body="This request may have already been reviewed." />;
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <TopBar title="Review applicant" onBack={() => nav("admin-verify")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={applicant.name} size={50} />
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{applicant.name}</div>
            <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{applicant.sport} · {applicant.suburb}</div>
            <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{applicant.experience}</div>
          </div>
        </Card>

        <SectionLabel>Uploaded documents</SectionLabel>
        {applicant.documents.map((doc) => (
          <Card key={doc.key} onClick={() => setViewingDoc(doc)} style={{ marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileImage size={18} color={C.orange} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{doc.label}</div>
              <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{doc.detail}</div>
            </div>
            <Badge tone="success" icon={CheckCircle2}>Uploaded</Badge>
            <ChevronRight size={15} color={C.slateLight} />
          </Card>
        ))}
        <div style={{ fontSize: 11, color: C.slateLight, marginTop: -4, marginBottom: 10, ...fBody }}>Tap a document to view it.</div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginTop: 6 }}>
          <Info size={14} color={C.slate} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.slate, lineHeight: 1.5, ...fBody }}>Confirm each document is valid and matches the applicant's stated sport and coaching claims before approving.</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 0" }}>
        <Btn full variant="outline" onClick={() => decideVerification(applicant.id, false)}>Reject</Btn>
        <Btn full onClick={() => decideVerification(applicant.id, true)}>Approve</Btn>
      </div>

      {viewingDoc && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(22,24,29,.7)", display: "flex", alignItems: "flex-end", zIndex: 80 }}>
          <div style={{ width: "100%", background: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "82%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{viewingDoc.label}</div>
              <button onClick={() => setViewingDoc(null)} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} color={C.jet} />
              </button>
            </div>
            <div style={{
              flex: 1, minHeight: 260, borderRadius: 16, background: `linear-gradient(160deg, ${C.jetSoft}, ${C.jet})`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14,
            }}>
              <FileImage size={44} color="rgba(255,255,255,.85)" />
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", ...fBody }}>Document preview</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.55, marginBottom: 16, ...fBody }}>{viewingDoc.detail}</div>
            <Btn full onClick={() => setViewingDoc(null)}>Close</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
