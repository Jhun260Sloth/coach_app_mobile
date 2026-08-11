import React, { useState, useRef } from "react";
import { HelpCircle, ChevronLeft, Paperclip, MapPin, Send, MoreVertical, Flag, Ban, Check, CheckCircle2, Calendar, FileText, Navigation, AlertCircle, RotateCcw, Pin, PinOff, Trash2, MessageCircle } from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";
import { THREADS, COACH_THREADS, CHAT_MESSAGES, BOOKING_ENQUIRY_MESSAGES, COACHES } from "../../data/mockData";
import { Avatar, BottomSheet, Btn, EmptyState } from "../../components/ui/Primitives";
import { StatusBanner } from "../../systems/StateSystem";

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

/* ── Pinned / Deleted Threads Store ────────────────────────────────────── */
// Same lightweight module-level store pattern as blocked threads above, so
// pin/delete state persists across screen visits within the session and stays
// in sync for both the client and coach thread lists (ids are unique across
// THREADS/COACH_THREADS, so one store safely covers both roles).

let pinnedIds = new Set();
const pinSubscribers = new Set();
const emitPinned = () => pinSubscribers.forEach(cb => cb(new Set(pinnedIds)));
const pinThread = id => id && (pinnedIds.add(id), emitPinned());
const unpinThread = id => id && (pinnedIds.delete(id), emitPinned());

function usePinnedThreads() {
  const [pinned, setPinned] = useState(() => new Set(pinnedIds));
  React.useEffect(() => {
    pinSubscribers.add(setPinned);
    return () => pinSubscribers.delete(setPinned);
  }, []);
  return { pinned, isPinned: id => pinned.has(id), pin: pinThread, unpin: unpinThread };
}

let deletedIds = new Set();
const deleteSubscribers = new Set();
const emitDeleted = () => deleteSubscribers.forEach(cb => cb(new Set(deletedIds)));
const deleteThread = id => id && (deletedIds.add(id), emitDeleted());

function useDeletedThreads() {
  const [deleted, setDeleted] = useState(() => new Set(deletedIds));
  React.useEffect(() => {
    deleteSubscribers.add(setDeleted);
    return () => deleteSubscribers.delete(setDeleted);
  }, []);
  return { deleted, isDeleted: id => deleted.has(id), remove: deleteThread };
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
  textAlign: "left", fontSize: T.bodyLg, fontWeight: 600, color: C.slate, ...fBody,
};

/* ── Messages Screen ───────────────────────────────────────────────────── */

export function ScreenMessages({ nav, role, isFirstTimeClient }) {
  const { isBlocked, unblock } = useBlockedThreads();
  const { isPinned, pin, unpin } = usePinnedThreads();
  const { isDeleted, remove } = useDeletedThreads();
  const rawThreads = role === "coach" ? COACH_THREADS : THREADS;
  // Pinned threads first, then unread, then original order; deleted threads drop out entirely.
  const threads = [...rawThreads]
    .filter(t => !isDeleted(t.id))
    .sort((a, b) => (isPinned(b.id) ? 1 : 0) - (isPinned(a.id) ? 1 : 0) || (b.unread > 0 ? 1 : 0) - (a.unread > 0 ? 1 : 0));
  const [blockedThread, setBlockedThread] = useState(null);
  const [optionsThread, setOptionsThread] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // First-time clients haven't sent a booking request yet, so there's nothing
  // to chat about — show a single unified empty state instead of the (mock)
  // thread list, pointing them back at Discover.
  const showEmptyChat = role !== "coach" && isFirstTimeClient;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Messages</div>
          <button onClick={() => nav("support")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <HelpCircle size={22} color={C.jet} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 100px" }}>
        {showEmptyChat ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <EmptyState
              large
              icon={MessageCircle}
              title="No Conversations Yet"
              body="Your conversations with coaches will appear here. Once you send a booking request, you can chat with the coach to discuss your session and ask any questions before your booking is confirmed."
              ctaLabel="Find My Coaches"
              onCta={() => nav("client-home")}
            />
          </div>
        ) : (
        <>
        {threads.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.slate, fontSize: T.body, ...fBody }}>No conversations here.</div>
        )}
        {threads.map(t => {
          const blocked = isBlocked(t.id);
          const pinned = isPinned(t.id);
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => blocked
                ? setBlockedThread(t)
                : nav("chat-thread", { name: t.withName, context: t.context, threadId: t.id })
              }
              style={{
                width: "100%", display: "flex", gap: 12, alignItems: "center",
                padding: "12px 4px", background: pinned ? C.fog : "none", borderRadius: pinned ? 13 : 0,
                border: "none", borderBottom: pinned ? "none" : `1px solid ${C.border}`, cursor: "pointer",
                textAlign: "left", opacity: blocked ? 0.68 : 1, marginBottom: pinned ? 4 : 0,
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                    {pinned && <Pin size={11} color={C.orange} style={{ flexShrink: 0 }} fill={C.orange} />}
                    <span style={{ fontSize: T.subtitle, fontWeight: 600, color: blocked ? C.slate : C.jet, ...fDisplay, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.withName}
                    </span>
                  </span>
                  <span style={{ fontSize: T.caption, color: C.slateLight, ...fBody, flexShrink: 0 }}>{t.time}</span>
                </div>
                {blocked ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, fontSize: T.labelLg, color: C.slateLight, fontWeight: 500, ...fBody }}>
                    <Ban size={11} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ textDecoration: "line-through" }}>Blocked</span> · Tap to unblock
                    </span>
                  </div>
                ) : (
                  <div style={{
                    fontSize: T.labelLg, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    color: t.unread > 0 ? C.jet : C.slate, fontWeight: t.unread > 0 ? 600 : 400, ...fBody,
                  }}>
                    <span style={{ color: C.orange, fontWeight: 600 }}>{t.context}</span>
                    <span style={{ color: C.slateLight, fontWeight: 400 }}> · </span>
                    {t.lastMsg}
                  </div>
                )}
              </div>

              {!blocked && t.unread > 0 && (
                <span style={{
                  width: 18, height: 18, borderRadius: 99, background: C.orange,
                  color: C.white, fontSize: T.micro, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {t.unread}
                </span>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); setOptionsThread(t); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, marginLeft: 2 }}
              >
                <MoreVertical size={16} color={C.slateLight} />
              </button>
            </div>
          );
        })}
        </>
        )}
      </div>

      <BottomSheet open={!!blockedThread} onClose={() => setBlockedThread(null)}
        title={blockedThread?.withName || "Conversation blocked"} heightPct={30}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => { unblock(blockedThread.id); setBlockedThread(null); }} style={sheetBtn()}>
            <div style={iconBox(C.successTint)}><CheckCircle2 size={16} color={C.success} /></div>
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.success, ...fBody }}>Unblock {blockedThread?.withName}</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>They can message and book you again</div>
            </div>
          </button>
          <button onClick={() => setBlockedThread(null)} style={cancelBtn}>Cancel</button>
        </div>
      </BottomSheet>

      {/* Per-thread options: pin/unpin + delete */}
      <BottomSheet open={!!optionsThread} onClose={() => setOptionsThread(null)}
        title={optionsThread?.withName || "Conversation options"} heightPct={30}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            onClick={() => {
              isPinned(optionsThread.id) ? unpin(optionsThread.id) : pin(optionsThread.id);
              setOptionsThread(null);
            }}
            style={sheetBtn()}
          >
            <div style={iconBox(C.orangeTint)}>
              {isPinned(optionsThread?.id) ? <PinOff size={16} color={C.orange} /> : <Pin size={16} color={C.orange} />}
            </div>
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>
                {isPinned(optionsThread?.id) ? "Unpin conversation" : "Pin conversation"}
              </div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>
                {isPinned(optionsThread?.id) ? "Move it back with the rest" : "Keep it at the top of your list"}
              </div>
            </div>
          </button>
          <button
            onClick={() => { setDeleteTarget(optionsThread); setOptionsThread(null); }}
            style={sheetBtn()}
          >
            <div style={iconBox(C.dangerTint)}><Trash2 size={16} color={C.danger} /></div>
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.danger, ...fBody }}>Delete conversation</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Removes it from your messages</div>
            </div>
          </button>
          <button onClick={() => setOptionsThread(null)} style={cancelBtn}>Cancel</button>
        </div>
      </BottomSheet>

      {/* Delete confirmation */}
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ ...iconBox(C.dangerTint), margin: "0 auto 12px" }}><Trash2 size={18} color={C.danger} /></div>
          <div style={{ fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Delete this conversation?</div>
          <div style={{ fontSize: T.labelLg, color: C.slate, marginTop: 6, lineHeight: 1.5, ...fBody }}>
            Your chat history with {deleteTarget?.withName} will be removed from Messages. This can't be undone.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
          <Btn full variant="danger" onClick={() => { remove(deleteTarget.id); setDeleteTarget(null); }}>Delete</Btn>
        </div>
      </ConfirmDialog>
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
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>Report conversation</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Flag this conversation for review by CoachLink Support</div>
            </div>
          </button>

          {isBlocked ? (
            <button onClick={() => { onUnblock(); closeAll(); }} style={sheetBtn()}>
              <div style={iconBox(C.successTint)}><CheckCircle2 size={16} color={C.success} /></div>
              <div>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.success, ...fBody }}>Unblock {otherName}</div>
                <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Allow them to message and book you again</div>
              </div>
            </button>
          ) : (
            <button onClick={() => { setStep(null); setBlockStep("confirm"); }} style={sheetBtn()}>
              <div style={iconBox(C.dangerTint)}><Ban size={16} color={C.danger} /></div>
              <div>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.danger, ...fBody }}>Block {otherName}</div>
                <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>They won't be able to message or book you</div>
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
            <div style={{ fontSize: T.body, color: C.slate, marginBottom: 14, ...fBody }}>Why are you reporting this conversation?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setSelectedReason(r)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  border: `1.5px solid ${selectedReason === r ? C.orange : C.border}`,
                  background: selectedReason === r ? C.orangeTint : C.white,
                }}>
                  <span style={{ fontSize: T.body, color: C.jet, ...fBody }}>{r}</span>
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
                  fontSize: T.body, color: C.jet, outline: "none", resize: "none", ...fBody,
                }} />
            )}
          </div>
          <div style={{ padding: "14px 0 4px", display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn full onClick={() => { onReportSubmit(); setStep("report-success"); }}
              style={!canSubmit ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
              Submit report
            </Btn>
            <button onClick={closeAll} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "10px 0", fontSize: T.bodyLg, fontWeight: 600, color: C.slate, ...fBody }}>
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
        <div style={{ fontSize: T.titleLg, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 8 }}>Block {otherName}?</div>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginBottom: 20, ...fBody }}>
          {otherName} won't be able to message you or book you. You can unblock them later in your settings.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="outline" onClick={closeAll}>Cancel</Btn>
          <div style={{ flex: 1 }}>
            <Btn full onClick={() => { onBlockConfirm(); setBlockStep("success"); }} style={{ background: C.danger }}>Block</Btn>
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
      <div style={{ fontSize: T.titleLg, fontWeight: 600, color: C.jet, ...fDisplay, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.5, marginBottom: 20, ...fBody }}>{body}</div>
      <Btn full onClick={onDone}>Done</Btn>
    </div>
  );
}

/* ── Chat Thread Screen ────────────────────────────────────────────────── */

export function ScreenChatThread({ nav, params, role, toast, offline }) {
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
  const msgIdRef = useRef(1000);
  const nextMsgId = () => (msgIdRef.current += 1);

  // Sends a message through a brief "sending" state before landing on
  // sent/failed — offline always fails; otherwise it succeeds. Failed
  // messages stay in the thread with a Retry action rather than vanishing.
  const deliver = (id, text) => {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, status: "sending" } : msg)));
    setTimeout(() => {
      if (offline) {
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, status: "failed" } : msg)));
      } else {
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, status: "sent" } : msg)));
      }
    }, 700);
  };

  const send = () => {
    if (!input.trim() || blocked) return;
    const id = nextMsgId();
    setMessages(m => [...m, { id, from: "me", text: input, time: "now", status: "sending" }]);
    setInput("");
    deliver(id, input);
  };

  const retryMessage = (id) => {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, status: "sending" } : msg)));
    deliver(id);
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
            <div style={{ fontSize: T.subtitle, fontWeight: 600, color: C.jet, ...fDisplay }}>{params.name}</div>
            {params.context && <div style={{ fontSize: T.caption, color: C.orange, fontWeight: 600, ...fBody }}>{params.context}</div>}
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
                  <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.fileName}</div>
                  <div style={{ fontSize: T.caption, color: C.slate, marginTop: 1 }}>{Math.max(1, Math.round((m.fileSize || 0) / 1024))} KB</div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>
                  <Navigation size={12} color={C.orange} /> Live location shared
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                <div style={{
                  padding: "10px 13px", borderRadius: 16,
                  borderBottomRightRadius: m.from === "me" ? 4 : 16,
                  borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                  background: m.status === "failed" ? C.dangerTint : m.from === "me" ? C.orange : C.fog,
                  color: m.status === "failed" ? C.danger : m.from === "me" ? C.white : C.jet,
                  fontSize: T.bodyLg, lineHeight: 1.45, ...fBody,
                }}>
                  {m.text}
                </div>
                {m.from === "me" && m.status && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: T.tiny, fontWeight: 600, ...fBody,
                    color: m.status === "failed" ? C.danger : m.status === "sending" ? C.slateLight : C.success }}>
                    {m.status === "sending" && <>Sending…</>}
                    {m.status === "sent" && <><Check size={10} /> Sent</>}
                    {m.status === "failed" && (
                      <>
                        <AlertCircle size={10} /> Not delivered
                        <button onClick={() => retryMessage(m.id)} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: C.danger, fontWeight: 700, fontSize: T.tiny, padding: 0, marginLeft: 4, ...fBody }}>
                          <RotateCcw size={10} /> Retry
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {offline && (
        <div style={{ padding: "0 16px 8px" }}>
          <StatusBanner state="offline" compact />
        </div>
      )}
      {blocked ? (
        <div style={{ padding: "14px 16px 22px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 12, padding: "12px 14px", fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>
            <Ban size={15} color={C.danger} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>You blocked {params.name}.</span>
            <button onClick={() => unblock(threadId)} style={{ fontSize: T.labelLg, fontWeight: 600, color: C.white, background: C.orange, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", ...fBody }}>
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
            placeholder="Message..." style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "9px 14px", fontSize: T.bodyLg, outline: "none", ...fBody }} />
          <button onClick={send} style={{ width: 36, height: 36, borderRadius: 99, background: C.orange, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Send size={15} color={C.white} />
          </button>
        </div>
      )}

      <BottomSheet open={locationSheet} onClose={() => setLocationSheet(false)} title="Share your location" heightPct={34}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
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