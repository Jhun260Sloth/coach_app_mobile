import React, { useState, useRef } from "react";
import { HelpCircle, ChevronLeft, Paperclip, MapPin, Send, MoreVertical, Flag, Ban, Check, CheckCircle2, Calendar, FileText, Navigation } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { THREADS, COACH_THREADS, CHAT_MESSAGES, BOOKING_ENQUIRY_MESSAGES, COACHES } from "../../data/mockData";
import { Avatar, BottomSheet, Btn } from "../../components/ui/Primitives";

/* ── Blocked Threads Store ─────────────────────────────────────────────── */

let blockedIds = new Set();
const subscribers = new Set();
const emit = () => subscribers.forEach(cb => cb(new Set(blockedIds)));
const blockThread = id => id && (blockedIds.add(id), emit());
const unblockThread = id => id && (blockedIds.delete(id), emit());

function useBlockedThreads() {
  const [blocked, setBlocked] = useState(() => new Set(blockedIds));
  React.useEffect(() => {
    subscribers.add(setBlocked);
    return () => subscribers.delete(setBlocked);
  }, []);
  return { blocked, isBlocked: id => blocked.has(id), block: blockThread, unblock: unblockThread };
}

/* ── Shared Styles ─────────────────────────────────────────────────────── */

const iconBox = (bg) => ({
  width: 36, height: 36, borderRadius: 11, background: bg,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
});

const sheetBtn = (extra = {}) => ({
  display: "flex", alignItems: "center", gap: 12, padding: "14px 4px",
  background: "none", border: "none", borderBottom: `1px solid ${C.border}`,
  cursor: "pointer", textAlign: "left", ...extra,
});

const cancelBtn = {
  padding: "14px 4px", background: "none", border: "none", cursor: "pointer",
  textAlign: "left", fontSize: 13.5, fontWeight: 600, color: C.slate, ...fBody,
};

/* ── Messages Screen ───────────────────────────────────────────────────── */

export function ScreenMessages({ nav, role }) {
  const { isBlocked, unblock } = useBlockedThreads();
  const rawThreads = role === "coach" ? COACH_THREADS : THREADS;
  // Prioritize threads with unread/new messages at the top; preserve relative order otherwise.
  const threads = [...rawThreads].sort((a, b) => (b.unread > 0 ? 1 : 0) - (a.unread > 0 ? 1 : 0));
  const [blockedThread, setBlockedThread] = useState(null);

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
        {threads.map(t => {
          const blocked = isBlocked(t.id);
          return (
            <button
              key={t.id}
              onClick={() => blocked
                ? setBlockedThread(t)
                : nav("chat-thread", { name: t.withName, context: t.context, threadId: t.id })
              }
              style={{
                width: "100%", display: "flex", gap: 12, alignItems: "center",
                padding: "12px 4px", background: "none", border: "none",
                borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                textAlign: "left", opacity: blocked ? 0.68 : 1,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ filter: blocked ? "grayscale(1)" : "none" }}>
                  <Avatar name={t.withName} size={46} />
                </div>
                {blocked && (
                  <div style={{
                    position: "absolute", right: -3, bottom: -3, width: 19, height: 19,
                    borderRadius: 99, background: C.white, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Ban size={11} color={C.slateLight} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: blocked ? C.slate : C.jet, ...fDisplay }}>
                    {t.withName}
                  </span>
                  <span style={{ fontSize: 11, color: C.slateLight, ...fBody, flexShrink: 0 }}>{t.time}</span>
                </div>
                <div style={{ fontSize: 11, color: blocked ? C.slateLight : C.orange, fontWeight: 600, marginTop: 1, ...fBody }}>
                  {t.context}
                </div>
                {blocked ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, fontSize: 12.5, color: C.slateLight, fontWeight: 500, ...fBody }}>
                    <Ban size={12} />
                    <span style={{ textDecoration: "line-through" }}>Blocked</span>
                    <span>· Tap to unblock</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: C.slate, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...fBody }}>
                    {t.lastMsg}
                  </div>
                )}
              </div>

              {!blocked && t.unread > 0 && (
                <span style={{
                  width: 19, height: 19, borderRadius: 99, background: C.orange,
                  color: C.white, fontSize: 10.5, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {t.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <BottomSheet open={!!blockedThread} onClose={() => setBlockedThread(null)}
        title={blockedThread?.withName || "Conversation blocked"} heightPct={30}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => { unblock(blockedThread.id); setBlockedThread(null); }} style={sheetBtn()}>
            <div style={iconBox(C.successTint)}><CheckCircle2 size={16} color={C.success} /></div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.success, ...fBody }}>Unblock {blockedThread?.withName}</div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>They can message and book you again</div>
            </div>
          </button>
          <button onClick={() => setBlockedThread(null)} style={cancelBtn}>Cancel</button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ── Confirm Dialog ────────────────────────────────────────────────────── */

function ConfirmDialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 998,
      background: "rgba(17,18,22,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 320, background: C.white,
        borderRadius: 20, padding: "22px 20px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── Conversation Options Flow ─────────────────────────────────────────── */

const REPORT_REASONS = ["Harassment or bullying", "Inappropriate messages", "Spam or scam", "Unsafe behaviour", "Something else"];

function ConversationOptionsFlow({ otherName, onReportSubmit, onBlockConfirm, isBlocked, onUnblock, step, setStep, blockStep, setBlockStep, selectedReason, setSelectedReason, customReason, setCustomReason }) {
  const closeAll = () => { setStep(null); setBlockStep(null); setSelectedReason(null); setCustomReason(""); };
  const canSubmit = selectedReason && (selectedReason !== "Something else" || customReason.trim().length > 0);

  return (
    <>
      {/* Options Sheet */}
      <BottomSheet open={step === "options"} onClose={closeAll} title="Conversation options" heightPct={isBlocked ? 30 : 34}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => setStep("report-reason")} style={sheetBtn()}>
            <div style={iconBox(C.orangeTint)}><Flag size={16} color={C.orange} /></div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>Report conversation</div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>Flag this conversation for review by CoachLink Support</div>
            </div>
          </button>

          {isBlocked ? (
            <button onClick={() => { onUnblock(); closeAll(); }} style={sheetBtn()}>
              <div style={iconBox(C.successTint)}><CheckCircle2 size={16} color={C.success} /></div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.success, ...fBody }}>Unblock {otherName}</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>Allow them to message and book you again</div>
              </div>
            </button>
          ) : (
            <button onClick={() => { setStep(null); setBlockStep("confirm"); }} style={sheetBtn()}>
              <div style={iconBox("#FDE8E8")}><Ban size={16} color="#D64545" /></div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#D64545", ...fBody }}>Block {otherName}</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>They won't be able to message or book you</div>
              </div>
            </button>
          )}

          <button onClick={closeAll} style={cancelBtn}>Cancel</button>
        </div>
      </BottomSheet>

      {/* Report Reason Sheet */}
      <BottomSheet open={step === "report-reason"} onClose={closeAll} title="Report conversation"
        heightPct={selectedReason === "Something else" ? 74 : 62}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 13, color: C.slate, marginBottom: 14, ...fBody }}>Why are you reporting this conversation?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setSelectedReason(r)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  border: `1.5px solid ${selectedReason === r ? C.orange : C.border}`,
                  background: selectedReason === r ? C.orangeTint : C.white,
                }}>
                  <span style={{ fontSize: 13, color: C.jet, ...fBody }}>{r}</span>
                  {selectedReason === r && <Check size={16} color={C.orange} />}
                </button>
              ))}
            </div>
            {selectedReason === "Something else" && (
              <textarea value={customReason} onChange={e => setCustomReason(e.target.value)}
                placeholder="Tell us what's going on..." rows={4} autoFocus
                style={{
                  width: "100%", boxSizing: "border-box", background: C.fog, marginTop: 14,
                  border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px",
                  fontSize: 13, color: C.jet, outline: "none", resize: "none", ...fBody,
                }} />
            )}
          </div>
          <div style={{ padding: "14px 0 4px", display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn full onClick={() => { onReportSubmit(); setStep("report-success"); }}
              style={!canSubmit ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
              Submit report
            </Btn>
            <button onClick={closeAll} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "10px 0", fontSize: 13.5, fontWeight: 600, color: C.slate, ...fBody }}>
              Cancel
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Report Success Sheet */}
      <BottomSheet open={step === "report-success"} onClose={closeAll} title="" heightPct={36}>
        <SuccessPanel title="Report submitted" body="Thanks for letting us know. CoachLink Support will review this conversation." onDone={closeAll} />
      </BottomSheet>

      {/* Block Confirm Dialog */}
      <ConfirmDialog open={blockStep === "confirm"} onClose={closeAll}>
        <div style={{ fontSize: 16.5, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 8 }}>Block {otherName}?</div>
        <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.55, marginBottom: 20, ...fBody }}>
          {otherName} won't be able to message you or book you. You can unblock them later in your settings.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="outline" onClick={closeAll}>Cancel</Btn>
          <div style={{ flex: 1 }}>
            <Btn full onClick={() => { onBlockConfirm(); setBlockStep("success"); }} style={{ background: "#D64545" }}>Block</Btn>
          </div>
        </div>
      </ConfirmDialog>

      {/* Block Success Dialog */}
      <ConfirmDialog open={blockStep === "success"} onClose={closeAll}>
        <SuccessPanel title={`${otherName} blocked`} body="They can no longer message you or book you." onDone={closeAll} />
      </ConfirmDialog>
    </>
  );
}

/* ── Success Panel (shared) ────────────────────────────────────────────── */

function SuccessPanel({ title, body, onDone }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 8px" }}>
      <div style={{ ...iconBox(C.successTint), width: 56, height: 56, borderRadius: 18, margin: "0 auto 14px" }}>
        <CheckCircle2 size={26} color={C.success} />
      </div>
      <div style={{ fontSize: 16.5, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.5, marginBottom: 20, ...fBody }}>{body}</div>
      <Btn full onClick={onDone}>Done</Btn>
    </div>
  );
}

/* ── Chat Thread Screen ────────────────────────────────────────────────── */

export function ScreenChatThread({ nav, params, role, toast }) {
  const { isBlocked, block, unblock } = useBlockedThreads();
  const threadId = params?.threadId || params?.bookingId || params?.name;
  const blocked = isBlocked(threadId);
  const coach = role !== "coach" ? COACHES.find((c) => c.name === params.name) : null;

  const [messages, setMessages] = useState(
    (params?.bookingId && BOOKING_ENQUIRY_MESSAGES[params.bookingId]) || CHAT_MESSAGES
  );
  const [input, setInput] = useState("");
  const [step, setStep] = useState(null);
  const [blockStep, setBlockStep] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [locationSheet, setLocationSheet] = useState(false);
  const fileInputRef = useRef(null);

  const send = () => {
    if (!input.trim() || blocked) return;
    setMessages(m => [...m, { id: m.length + 1, from: "me", text: input, time: "now" }]);
    setInput("");
  };

  const handleAttachmentPick = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages(m => [...m, { id: m.length + 1, from: "me", type: "attachment", fileName: file.name, fileSize: file.size, time: "now" }]);
      toast?.(`${file.name} sent`);
    }
    e.target.value = "";
  };

  const shareLocation = () => {
    setMessages(m => [...m, { id: m.length + 1, from: "me", type: "location", time: "now" }]);
    setLocationSheet(false);
    toast?.("Location shared");
  };

  const backTarget = params?.backTo || (role === "coach" ? "coach-messages" : "client-messages");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => nav(backTarget, params?.backParams || {})} style={{
            width: 34, height: 34, borderRadius: 11, background: C.fog,
            border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <ChevronLeft size={18} color={C.jet} />
          </button>
          <Avatar name={params.name} size={38} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{params.name}</div>
            {params.context && <div style={{ fontSize: 11, color: C.orange, fontWeight: 600, ...fBody }}>{params.context}</div>}
          </div>
          <button onClick={() => setStep("options")} style={{
            width: 34, height: 34, borderRadius: 11, background: "none", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <MoreVertical size={20} color={C.jet} />
          </button>
        </div>

        {coach && !blocked && (
          <div style={{ marginTop: 12 }}>
            <Btn full size="sm" variant="secondary" icon={Calendar} onClick={() => nav("coach-profile", { id: coach.id })}>
              Book now
            </Btn>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            {m.type === "attachment" ? (
              <div style={{
                maxWidth: "75%", display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 16,
                borderBottomRightRadius: m.from === "me" ? 4 : 16, borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                background: m.from === "me" ? C.orangeTint : C.fog, ...fBody,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={15} color={C.orange} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.fileName}</div>
                  <div style={{ fontSize: 11, color: C.slate, marginTop: 1 }}>{Math.max(1, Math.round((m.fileSize || 0) / 1024))} KB</div>
                </div>
              </div>
            ) : m.type === "location" ? (
              <div style={{
                maxWidth: "75%", borderRadius: 16, overflow: "hidden",
                borderBottomRightRadius: m.from === "me" ? 4 : 16, borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                background: m.from === "me" ? C.orangeTint : C.fog,
              }}>
                <div style={{
                  height: 74, background: `repeating-linear-gradient(45deg, ${C.border} 0 6px, ${C.fog} 6px 12px)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: 99, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.25)" }}>
                    <MapPin size={16} color={C.white} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, color: C.jet, ...fBody }}>
                  <Navigation size={12} color={C.orange} /> Live location shared
                </div>
              </div>
            ) : (
              <div style={{
                maxWidth: "75%", padding: "10px 13px", borderRadius: 16,
                borderBottomRightRadius: m.from === "me" ? 4 : 16,
                borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                background: m.from === "me" ? C.orange : C.fog,
                color: m.from === "me" ? C.white : C.jet,
                fontSize: 13.5, lineHeight: 1.45, ...fBody,
              }}>
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input / Blocked Bar */}
      {blocked ? (
        <div style={{ padding: "14px 16px 22px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: C.slate, lineHeight: 1.5, ...fBody }}>
            <Ban size={15} color="#D64545" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>You blocked {params.name}.</span>
            <button onClick={() => unblock(threadId)} style={{ fontSize: 12.5, fontWeight: 600, color: C.white, background: C.orange, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", ...fBody }}>
              Unblock
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "10px 16px 20px", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}` }}>
          <input ref={fileInputRef} type="file" onChange={handleAttachmentPick} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer" }}><Paperclip size={19} color={C.slate} /></button>
          <button onClick={() => setLocationSheet(true)} style={{ background: "none", border: "none", cursor: "pointer" }}><MapPin size={19} color={C.slate} /></button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Message..." style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "9px 14px", fontSize: 13.5, outline: "none", ...fBody }} />
          <button onClick={send} style={{ width: 36, height: 36, borderRadius: 99, background: C.orange, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Send size={15} color={C.white} />
          </button>
        </div>
      )}

      <BottomSheet open={locationSheet} onClose={() => setLocationSheet(false)} title="Share your location" heightPct={34}>
        <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
          {params.name} will be able to see your live location for this session. You can stop sharing at any time.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full icon={Navigation} onClick={shareLocation}>Share current location</Btn>
          <Btn full variant="secondary" onClick={() => setLocationSheet(false)}>Cancel</Btn>
        </div>
      </BottomSheet>

      <ConversationOptionsFlow
        otherName={params.name}
        isBlocked={blocked}
        onUnblock={() => unblock(threadId)}
        onReportSubmit={() => toast?.(`Report submitted (${selectedReason === "Something else" ? customReason.trim() : selectedReason})`)}
        onBlockConfirm={() => { block(threadId); toast?.(`${params.name} has been blocked`); }}
        step={step} setStep={setStep}
        blockStep={blockStep} setBlockStep={setBlockStep}
        selectedReason={selectedReason} setSelectedReason={setSelectedReason}
        customReason={customReason} setCustomReason={setCustomReason}
      />
    </div>
  );
}