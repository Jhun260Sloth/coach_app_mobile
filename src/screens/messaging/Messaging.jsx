import React, { useState } from "react";
import { HelpCircle, ChevronLeft, Paperclip, MapPin, Send } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { THREADS, COACH_THREADS, CHAT_MESSAGES, BOOKING_ENQUIRY_MESSAGES } from "../../data/mockData";
import { Avatar } from "../../components/ui/Primitives";

export function ScreenMessages({ nav, role }) {
  const threads = role === "coach" ? COACH_THREADS : THREADS;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>Messages</div>
          <button onClick={() => nav("support")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <HelpCircle size={22} color={C.jet} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 100px" }}>
        {threads.map((t) => (
          <button key={t.id} onClick={() => nav("chat-thread", { name: t.withName, context: t.context })}
            style={{ width: "100%", display: "flex", gap: 12, alignItems: "center", padding: "12px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
            <Avatar name={t.withName} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.jet, ...fDisplay }}>{t.withName}</span>
                <span style={{ fontSize: 11, color: C.slateLight, ...fBody }}>{t.time}</span>
              </div>
              <div style={{ fontSize: 11, color: C.orange, fontWeight: 600, marginTop: 1, ...fBody }}>{t.context}</div>
              <div style={{ fontSize: 12.5, color: C.slate, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...fBody }}>{t.lastMsg}</div>
            </div>
            {t.unread > 0 && <span style={{ width: 19, height: 19, borderRadius: 99, background: C.orange, color: C.white, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.unread}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScreenChatThread({ nav, params, role }) {
  const initialMessages = (params && params.bookingId && BOOKING_ENQUIRY_MESSAGES[params.bookingId]) || CHAT_MESSAGES;
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: m.length + 1, from: "me", text: input, time: "now" }]);
    setInput("");
  };
  const backTarget = params && params.backTo ? params.backTo : (role === "coach" ? "coach-messages" : "client-messages");
  const backParams = params && params.backParams ? params.backParams : {};
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => nav(backTarget, backParams)} style={{ width: 34, height: 34, borderRadius: 11, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={18} color={C.jet} />
          </button>
          <Avatar name={params.name} size={38} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{params.name}</div>
            {params.context && <div style={{ fontSize: 11, color: C.orange, fontWeight: 600, ...fBody }}>{params.context}</div>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "10px 13px", borderRadius: 16,
              borderBottomRightRadius: m.from === "me" ? 4 : 16, borderBottomLeftRadius: m.from === "me" ? 16 : 4,
              background: m.from === "me" ? C.orange : C.fog, color: m.from === "me" ? C.white : C.jet, fontSize: 13.5, lineHeight: 1.45, ...fBody,
            }}>{m.text}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 16px 20px", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}` }}>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}><Paperclip size={19} color={C.slate} /></button>
        <button style={{ background: "none", border: "none", cursor: "pointer" }}><MapPin size={19} color={C.slate} /></button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message..."
          style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "9px 14px", fontSize: 13.5, outline: "none", ...fBody }} />
        <button onClick={send} style={{ width: 36, height: 36, borderRadius: 99, background: C.orange, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={15} color={C.white} />
        </button>
      </div>
    </div>
  );
}
