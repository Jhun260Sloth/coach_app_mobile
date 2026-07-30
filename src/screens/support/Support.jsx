import React, { useState } from "react";
import { Search, ChevronDown, Send } from "lucide-react";
import { C, fBody } from "../../theme/theme";
import { FAQS } from "../../data/mockData";
import { TopBar, SegTabs, Badge, Card } from "../../components/ui/Primitives";

export function ScreenSupport({ nav, role }) {
  const [tab, setTab] = useState("faq");
  const [openIdx, setOpenIdx] = useState(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [query, setQuery] = useState("");
  const faqs = FAQS[role === "coach" ? "coach" : "client"].filter((f) => f.q.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <TopBar title="Support" onBack={() => nav(role === "coach" ? "coach-dashboard" : "client-home")} />
        <SegTabs value={tab} onChange={setTab} items={[{ value: "faq", label: "FAQs" }, { value: "chat", label: "Contact support" }]} />
      </div>

      {tab === "faq" ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 13, padding: "11px 13px", marginBottom: 16 }}>
            <Search size={15} color={C.slateLight} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search help articles"
              style={{ border: "none", outline: "none", background: "none", flex: 1, fontSize: 13, ...fBody }} />
          </div>
          <Badge tone="neutral">{role === "coach" ? "Coach help" : "Client help"}</Badge>
          <div style={{ marginTop: 12 }}>
            {faqs.map((f, i) => (
              <Card key={i} style={{ marginBottom: 10 }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, flex: 1, paddingRight: 10, ...fBody }}>{f.q}</span>
                  <ChevronDown size={16} color={C.slateLight} style={{ transform: openIdx === i ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }} />
                </div>
                {openIdx === i && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.6, ...fBody }}>{f.a}</p>
                    <button onClick={(e) => { e.stopPropagation(); setTab("chat"); setChatStarted(true); }} style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, fontSize: 12, marginTop: 8, cursor: "pointer", ...fBody }}>
                      Didn't solve it? Contact support →
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "0 20px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <Badge tone="neutral">{role === "coach" ? "Coach account" : "Client account"}</Badge>
              <Badge tone="neutral">Recent booking: Tue, 22 Jul</Badge>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 20px" }}>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
              <div style={{ maxWidth: "80%", background: C.fog, borderRadius: 16, borderBottomLeftRadius: 4, padding: "10px 13px", fontSize: 13, color: C.jet, lineHeight: 1.5, ...fBody }}>
                Hi Sarah 👋 I'm the CoachLink support assistant. I can see your account details and recent booking already — what can I help with?
              </div>
            </div>
            {chatStarted && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <div style={{ maxWidth: "80%", background: C.orange, color: C.white, borderRadius: 16, borderBottomRightRadius: 4, padding: "10px 13px", fontSize: 13, lineHeight: 1.5, ...fBody }}>
                  The FAQ didn't quite answer my question.
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ maxWidth: "80%", background: C.fog, borderRadius: 16, borderBottomLeftRadius: 4, padding: "10px 13px", fontSize: 13, color: C.jet, lineHeight: 1.5, ...fBody }}>
                Got it — connecting you with a member of our team now. Average reply time is under 10 minutes.
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 20px 20px", display: "flex", gap: 8, borderTop: `1px solid ${C.border}` }}>
            <input placeholder="Describe your issue..." style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "9px 14px", fontSize: 13.5, outline: "none", ...fBody }} />
            <button style={{ width: 36, height: 36, borderRadius: 99, background: C.orange, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Send size={15} color={C.white} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
