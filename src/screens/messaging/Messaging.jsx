import React, { useEffect, useState, useRef } from "react";
import { HelpCircle, Paperclip, MapPin, Send, MoreVertical, Flag, Ban, Check, CheckCircle2, Calendar, ChevronRight, FileText, Navigation, AlertCircle, RotateCcw, Pin, PinOff, Trash2, MessageCircle } from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { THREADS, COACH_THREADS, CHAT_MESSAGES, BOOKING_ENQUIRY_MESSAGES, COACHES } from "../../data/mockData";
import { Avatar, BackButton, BottomSheet, Btn, ConfirmDialog, EmptyState, TopBar, HandleTag } from "../../components/ui/Primitives";
import { StatusBanner } from "../../systems/StateSystem";
import { getPublicName } from "../../utils/name";
import { clientMetaFor } from "../../data/users";
import { BOOKING_STATUS } from "../../data/bookings";

/** Privacy-safe display name for a thread participant. */
function threadParticipantName(withName, role) {
  if (role !== "coach") {
    const coach = COACHES.find((c) => c.name === withName);
    if (coach) return getPublicName(coach, "public").name;
  }
  return getPublicName({ name: withName, ...clientMetaFor(withName) }, "public").name;
}

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

const sheetBtn = (C) => (extra = {}) => ({
  display: "flex", alignItems: "center", gap: 12, padding: "14px 4px",
  background: "none", border: "none", borderBottom: `1px solid ${C.border}`,
  cursor: "pointer", textAlign: "left", ...extra,
});

const cancelBtn = (C) => ({
  padding: "14px 4px", background: "none", border: "none", cursor: "pointer",
  textAlign: "left", fontSize: T.bodyLg, fontWeight: 600, color: C.slate, ...fBody,
});

/* ── Messages Screen ───────────────────────────────────────────────────── */

export function ScreenMessages({ nav, role, isFirstTimeClient }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
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
      <TopBar
        title="Messages"
        right={
          <button type="button" aria-label="Open help and support" onClick={() => nav("support")} style={{ width: LAYOUT.touchTarget, height: LAYOUT.touchTarget, padding: 0, background: "transparent", border: "none", borderRadius: LAYOUT.pillRadius, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HelpCircle size={22} color={C.jet} />
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", paddingBottom: 116 }} className="cl-hide-scrollbar">
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
        <div className="cl-stagger">
        {threads.map((t, i) => {
          const blocked = isBlocked(t.id);
          const pinned = isPinned(t.id);
          const participantName = threadParticipantName(t.withName, role);
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => blocked
                ? setBlockedThread(t)
                : nav("chat-thread", { name: t.withName, context: t.context, threadId: t.id })
              }
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                if (blocked) setBlockedThread(t);
                else nav("chat-thread", { name: t.withName, context: t.context, threadId: t.id });
              }}
              style={{
                width: "100%", display: "flex", gap: 12, alignItems: "center",
                padding: "12px 4px", background: pinned ? C.fog : "none", borderRadius: pinned ? 13 : 0,
                border: "none", borderBottom: pinned ? "none" : `1px solid ${C.border}`, cursor: "pointer",
                textAlign: "left", opacity: blocked ? 0.68 : 1, marginBottom: pinned ? 4 : 0,
                animationDelay: `${Math.min(i, 8) * 45}ms`,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ filter: blocked ? "grayscale(1)" : "none" }}>
                  <Avatar name={participantName} size={46} />
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
                <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                  {pinned && <Pin size={11} color={C.brand} style={{ flexShrink: 0 }} fill={C.brand} />}
                  <span style={{ fontSize: T.subtitle, fontWeight: 600, color: blocked ? C.slate : C.jet, ...fDisplay, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {participantName}
                  </span>
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
                    <span style={{ color: C.brand, fontWeight: 600 }}>{t.context}</span>
                    <span style={{ color: C.slateLight, fontWeight: 400 }}> · </span>
                    {t.lastMsg}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, alignSelf: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 5 }}>
                  <span style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{t.time}</span>
                  {!blocked && t.unread > 0 && (
                    <span style={{
                      width: 18, height: 18, borderRadius: 99, background: C.brand,
                      color: C.white, fontSize: T.micro, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {t.unread}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Conversation options for ${participantName}`}
                  onClick={(e) => { e.stopPropagation(); setOptionsThread(t); }}
                  style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, padding: 0, background: "transparent", border: "none", borderRadius: LAYOUT.pillRadius, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <MoreVertical size={16} color={C.slateLight} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
        </>
        )}
      </div>

      <BottomSheet open={!!blockedThread} onClose={() => setBlockedThread(null)}
        title={blockedThread?.withName || "Conversation blocked"} heightPct={30}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => { unblock(blockedThread.id); setBlockedThread(null); }} style={sheetBtn(C)()}>
            <div style={iconBox(C.successTint)}><CheckCircle2 size={16} color={C.success} /></div>
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.success, ...fBody }}>Unblock {blockedThread?.withName}</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>They can message and book you again</div>
            </div>
          </button>
          <button onClick={() => setBlockedThread(null)} style={cancelBtn(C)}>Cancel</button>
        </div>
      </BottomSheet>

      {/* Per-thread options: pin/unpin + delete */}
      <BottomSheet open={!!optionsThread} onClose={() => setOptionsThread(null)}
        title={optionsThread?.withName || "Conversation options"} heightPct={36}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            onClick={() => {
              isPinned(optionsThread.id) ? unpin(optionsThread.id) : pin(optionsThread.id);
              setOptionsThread(null);
            }}
            style={sheetBtn(C)()}
          >
            <div style={iconBox(C.brandTint)}>
              {isPinned(optionsThread?.id) ? <PinOff size={16} color={C.brand} /> : <Pin size={16} color={C.brand} />}
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
            style={sheetBtn(C)()}
          >
            <div style={iconBox(C.dangerTint)}><Trash2 size={16} color={C.danger} /></div>
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.danger, ...fBody }}>Delete conversation</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Removes it from your messages</div>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { remove(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete this conversation?"
        description={`Your chat history with ${deleteTarget?.withName || "this person"} will be removed from Messages. This can't be undone.`}
        confirmLabel="Delete"
        icon={Trash2}
      />
    </div>
  );
}

/* ── Confirm Dialog ────────────────────────────────────────────────────── */

function CenteredDialog({ open, onClose, children }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
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

function ConversationOptionsFlow({ otherName, onReportSubmit, onBlockConfirm, isBlocked, onUnblock, pendingBookingAction, step, setStep, blockStep, setBlockStep, selectedReason, setSelectedReason, customReason, setCustomReason }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const closeAll = () => { setStep(null); setBlockStep(null); setSelectedReason(null); setCustomReason(""); };
  const canSubmit = selectedReason && (selectedReason !== "Something else" || customReason.trim().length > 0);
  const pendingActionLabel = pendingBookingAction === "decline" ? "declined" : "withdrawn";
  const blockDescription = pendingBookingAction
    ? `${pendingBookingAction === "decline" ? "The pending booking request" : "Your pending booking request"} will be ${pendingActionLabel}. You and ${otherName} won't be able to message or make new bookings together. You can unblock them later in settings.`
    : `You and ${otherName} won't be able to message or make new bookings together. You can unblock them later in settings.`;

  return (
    <>
      {/* Options Sheet */}
      <BottomSheet open={step === "options"} onClose={closeAll} heightPct={isBlocked ? 24 : 28}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => setStep("report-reason")} style={sheetBtn(C)()}>
            <div style={iconBox(C.brandTint)}><Flag size={16} color={C.brand} /></div>
            <div>
              <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>Report conversation</div>
              <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Flag this conversation for review by CoachLink Support</div>
            </div>
          </button>

          {isBlocked ? (
            <button onClick={() => { onUnblock(); closeAll(); }} style={sheetBtn(C)()}>
              <div style={iconBox(C.successTint)}><CheckCircle2 size={16} color={C.success} /></div>
              <div>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.success, ...fBody }}>Unblock {otherName}</div>
                <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>Allow them to message and book you again</div>
              </div>
            </button>
          ) : (
            <button onClick={() => { setStep(null); setBlockStep("confirm"); }} style={sheetBtn(C)()}>
              <div style={iconBox(C.dangerTint)}><Ban size={16} color={C.danger} /></div>
              <div>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.danger, ...fBody }}>Block {otherName}</div>
                <div style={{ fontSize: T.label, color: C.slate, marginTop: 2, ...fBody }}>
                  {pendingBookingAction ? `The pending request will be ${pendingActionLabel}` : "Stop messages and new bookings together"}
                </div>
              </div>
            </button>
          )}
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
                  border: `1.5px solid ${selectedReason === r ? C.brand : C.border}`,
                  background: selectedReason === r ? C.brandTint : C.white,
                }}>
                  <span style={{ fontSize: T.body, color: C.jet, ...fBody }}>{r}</span>
                  {selectedReason === r && <Check size={16} color={C.brand} />}
                </button>
              ))}
            </div>
            {selectedReason === "Something else" && (
              <textarea value={customReason} onChange={e => setCustomReason(e.target.value)}
                placeholder="Tell us what's going on…" rows={4} autoFocus
                style={{
                  width: "100%", boxSizing: "border-box", background: C.white, marginTop: 14,
                  border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
                  fontSize: T.bodyLg, color: C.jet, outline: "none", resize: "none", ...fBody,
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
      <ConfirmDialog
        open={blockStep === "confirm"}
        onClose={closeAll}
        onConfirm={() => { onBlockConfirm(); setBlockStep("success"); }}
        title={`Block ${otherName}?`}
        description={blockDescription}
        confirmLabel={pendingBookingAction ? `${pendingBookingAction === "decline" ? "Decline" : "Withdraw"} & block` : "Block"}
        icon={Ban}
      />

      {/* Block Success Dialog */}
      <CenteredDialog open={blockStep === "success"} onClose={closeAll}>
        <SuccessPanel
          title={`${otherName} blocked`}
          body={pendingBookingAction ? `The pending request was ${pendingActionLabel}. You can no longer message or make new bookings together.` : "You can no longer message or make new bookings together."}
          onDone={closeAll}
        />
      </CenteredDialog>
    </>
  );
}

/* ── Success Panel (shared) ────────────────────────────────────────────── */

function SuccessPanel({ title, body, onDone }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
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

export function ScreenChatThread({ nav, goBack, params, role, toast, offline, bookings, coachBookings, respondBooking, cancelBooking }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const { isBlocked, block, unblock } = useBlockedThreads();
  const threadId = params?.threadId || params?.bookingId || params?.name;
  const blocked = isBlocked(threadId);
  const coach = role !== "coach" ? COACHES.find((c) => c.name === params.name) : null;

  // Live location is only safe to expose once money/a booking is actually
  // locked in — never in a pre-payment enquiry chat with an unverified or
  // unpaid other party. Prefer the real booking record (status can change
  // after this thread was opened); fall back to the thread's own context
  // label ("Booking · ..." vs "Enquiry") when there's no bookingId to look up.
  const bookingPool = (role === "coach" ? coachBookings : bookings) || [];
  const explicitBooking = params?.bookingId
    ? bookingPool.find((booking) => booking.id === params.bookingId)
    : null;
  const isBookingConversation = !!params?.context?.startsWith("Booking");
  const bookingStatusPriority = { confirmed: 0, awaiting_payment: 1, pending: 2, completed: 3 };
  const inferredBooking = isBookingConversation
    ? [...bookingPool]
      .filter((booking) => role === "coach"
        ? String(booking.clientName || "").replace(/\s*\(u18\)\s*/i, "").startsWith(String(params.name || "").replace(/\s*\(u18\)\s*/i, ""))
        : booking.coachName === params.name)
      .sort((a, b) => (bookingStatusPriority[a.status] ?? 9) - (bookingStatusPriority[b.status] ?? 9))[0]
    : null;
  const relatedBooking = explicitBooking || inferredBooking || null;
  const pendingBookingAction = relatedBooking?.status === BOOKING_STATUS.PENDING
    ? (role === "coach" ? "decline" : "withdraw")
    : null;
  const locationUnlocked = relatedBooking
    ? (relatedBooking.status === "confirmed" || relatedBooking.status === "completed")
    : !!params?.context?.startsWith("Booking");

  // Privacy-safe name for the chat header — public name unless this thread's
  // booking is confirmed (then the full partner name is revealed).
  const pub = role === "coach"
    ? getPublicName(
      { name: params.name, ...clientMetaFor(params.name) },
      relatedBooking && ["confirmed", "completed"].includes(relatedBooking.status) ? "confirmed" : "public"
    )
    : (coach
      ? getPublicName(coach, relatedBooking && ["confirmed", "completed"].includes(relatedBooking?.status) ? "confirmed" : "public")
      : { name: params.name, handle: params.handle ? `@${params.handle}` : null });

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
  const messageListRef = useRef(null);
  const msgIdRef = useRef(1000);
  const nextMsgId = () => (msgIdRef.current += 1);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages.length]);

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
      // Belt-and-braces on top of the input's `accept` filter (which is only
      // a picker hint and can be bypassed) — reject anything that isn't an
      // image, PDF, or video, and anything oversized, before it ever lands
      // in the thread. Executables/scripts and other unsafe file types are
      // never accepted here.
      const isAllowedType = /^image\/|^video\/|^application\/pdf$/.test(file.type)
        || /\.(pdf)$/i.test(file.name);
      const maxBytes = (file.type.startsWith("video/") ? 100 : 25) * 1024 * 1024; // 100MB video, 25MB image/PDF
      if (!isAllowedType) {
        toast?.("Only images, PDFs, and videos can be shared here");
      } else if (file.size > maxBytes) {
        toast?.(`${file.name} is too large to send (max ${maxBytes / (1024 * 1024)}MB)`);
      } else {
        setMessages(m => [...m, { id: m.length + 1, from: "me", type: "attachment", fileName: file.name, fileSize: file.size, time: "now" }]);
        toast?.(`${file.name} sent`);
      }
    }
    e.target.value = "";
  };

  const shareLocation = () => {
    if (!locationUnlocked) return;
    setMessages(m => [...m, { id: m.length + 1, from: "me", type: "location", time: "now" }]);
    setLocationSheet(false);
    toast?.("Location shared");
  };

  const backTarget = params?.backTo || (role === "coach" ? "coach-messages" : "client-messages");
  const openBooking = () => {
    if (!relatedBooking) return;
    if (role !== "coach") {
      nav("client-booking-detail", { id: relatedBooking.id });
      return;
    }
    const coachRoute = ["confirmed", "completed"].includes(relatedBooking.status)
      ? "coach-session-detail"
      : relatedBooking.status === "awaiting_payment" ? "booking-awaiting-payment" : "coach-booking-detail";
    nav(coachRoute, { id: relatedBooking.id });
  };

  return (
    <div style={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: C.white }}>
      {/* Header */}
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <div style={{ minHeight: LAYOUT.topBarH, boxSizing: "border-box", padding: `6px ${LAYOUT.pagePadX}px`, display: "flex", alignItems: "center", gap: 10 }}>
          <BackButton onClick={() => goBack(backTarget, params?.backParams || {})} />
          <button
            type="button"
            disabled={!coach}
            aria-label={coach ? `View ${pub.name}'s coach profile` : undefined}
            onClick={coach ? () => nav("coach-profile", { id: coach.id }) : undefined}
            style={{
              flex: 1, minWidth: 0, minHeight: LAYOUT.touchTarget, padding: 0,
              display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              background: "transparent", border: "none", borderRadius: LAYOUT.inputRadius,
              cursor: coach ? "pointer" : "default", opacity: 1,
            }}
          >
            <Avatar name={pub.name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
                <span style={{ minWidth: 0, fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pub.name}</span>
                {coach && <ChevronRight aria-hidden="true" size={13} color={C.slateLight} style={{ flexShrink: 0 }} />}
              </div>
              {pub.handle && (
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <HandleTag handle={pub.handle} size={11} color={C.slateLight} />
                </div>
              )}
            </div>
          </button>
          <button type="button" aria-label="Conversation options" onClick={() => setStep("options")} style={{
            width: LAYOUT.touchTarget, height: LAYOUT.touchTarget, borderRadius: LAYOUT.pillRadius, background: "transparent", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <MoreVertical size={20} color={C.jet} />
          </button>
        </div>

        {relatedBooking && !blocked && (
          <div style={{ padding: "0 14px 10px" }}>
            <button
              type="button"
              onClick={openBooking}
              aria-label={`View booking for ${relatedBooking.service}`}
              style={{
                width: "100%", minHeight: LAYOUT.touchTarget, padding: "8px 11px",
                display: "flex", alignItems: "center", gap: 9, textAlign: "left",
                background: C.fog, border: `1px solid ${C.border}`, borderRadius: LAYOUT.inputRadius,
                cursor: "pointer",
              }}
            >
              <Calendar aria-hidden="true" size={16} color={C.brand} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>View booking</span>
                <span style={{ display: "block", fontSize: T.caption, color: C.slate, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...fBody }}>{relatedBooking.service} · {relatedBooking.date}</span>
              </span>
              <ChevronRight aria-hidden="true" size={15} color={C.slateLight} />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={messageListRef} className="cl-hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: "14px 16px 12px", display: "flex", flexDirection: "column", gap: 10, background: C.white }}>
        <div style={{ alignSelf: "center", padding: "4px 9px", borderRadius: LAYOUT.pillRadius, background: C.fog, fontSize: T.caption, fontWeight: 600, color: C.slate, ...fBody }}>Today</div>
        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", animation: "clSlideUp .3s ease" }}>
            {m.type === "attachment" ? (
              <div style={{
                maxWidth: "75%", display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 16,
                borderBottomRightRadius: m.from === "me" ? 4 : 16, borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                background: m.from === "me" ? C.brandTint : C.fog, ...fBody,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={15} color={C.brand} />
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
                background: m.from === "me" ? C.brandTint : C.fog,
              }}>
                <div style={{
                  height: 74, background: `repeating-linear-gradient(45deg, ${C.border} 0 6px, ${C.fog} 6px 12px)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: 99, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.25)" }}>
                    <MapPin size={16} color={C.white} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>
                  <Navigation size={12} color={C.brand} /> Live location shared
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                <div style={{
                  padding: "10px 13px", borderRadius: 16,
                  borderBottomRightRadius: m.from === "me" ? 4 : 16,
                  borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                  background: m.status === "failed" ? C.dangerTint : m.from === "me" ? C.brand : C.fog,
                  color: m.status === "failed" ? C.danger : m.from === "me" ? C.white : C.jet,
                  fontSize: T.bodyLg, lineHeight: 1.45, ...fBody,
                }}>
                  {m.text}
                </div>
                {m.from === "me" && m.status && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: T.tiny, fontWeight: 600, ...fBody,
                    color: m.status === "failed" ? C.danger : m.status === "sending" ? C.slateLight : C.success }}>
                    {m.status === "sending" && <>Sending…</>}
                    {m.status === "sent" && <><Check size={10} /> {m.time && m.time !== "now" ? `${m.time} · ` : ""}Sent</>}
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
                {(m.from !== "me" || !m.status) && m.time && (
                  <div style={{ marginTop: 4, fontSize: T.tiny, color: C.slateLight, ...fBody }}>{m.time}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {offline && (
        <div style={{ padding: "0 18px 8px" }}>
          <StatusBanner state="offline" compact />
        </div>
      )}
      {blocked ? (
        <div style={{ padding: "14px 18px 22px", borderTop: `1px solid ${C.border}`, background: C.white }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 12, padding: "12px 14px", fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>
            <Ban size={15} color={C.danger} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>You blocked {params.name}.</span>
            <button onClick={() => unblock(threadId)} style={{ fontSize: T.labelLg, fontWeight: 600, color: C.white, background: C.brand, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", ...fBody }}>
              Unblock
            </button>
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box", padding: "8px 12px", paddingBottom: "max(24px, env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 6, borderTop: `1px solid ${C.border}`, background: C.white, overflow: "hidden", flexShrink: 0 }}>
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf,video/*" onChange={handleAttachmentPick} style={{ display: "none" }} />
          <div className="cl-input" style={{ flex: "1 1 0", minWidth: 0, height: LAYOUT.touchTarget, boxSizing: "border-box", display: "flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: LAYOUT.inputRadius, padding: "0 4px 0 12px", background: C.white }}>
            <input name="message" autoComplete="off" aria-label="Message" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Write a message…" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: T.bodyLg, color: C.jet, ...fBody }} />
            <button type="button" aria-label="Attach a file" onClick={() => fileInputRef.current?.click()} style={{ width: 36, height: 36, padding: 0, marginLeft: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: LAYOUT.pillRadius, cursor: "pointer" }}><Paperclip size={19} color={C.slate} /></button>
            <button
              type="button"
              aria-label={locationUnlocked ? "Share your location" : "Location sharing is available after confirmation"}
              onClick={() => setLocationSheet(true)}
              title={locationUnlocked ? "Share your location" : "Available once the booking is confirmed"}
              style={{ width: 36, height: 36, padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: LAYOUT.pillRadius, cursor: "pointer", opacity: locationUnlocked ? 1 : 0.4 }}
            >
              <MapPin size={19} color={C.slate} />
            </button>
          </div>
          <button type="button" aria-label="Send message" disabled={!input.trim()} onClick={send} style={{ width: LAYOUT.touchTarget, height: LAYOUT.touchTarget, padding: 0, borderRadius: LAYOUT.pillRadius, background: input.trim() ? C.brand : C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", flexShrink: 0, transition: "background .15s ease" }}>
            <Send size={16} color={input.trim() ? C.white : C.slateLight} />
          </button>
        </div>
      )}

      <BottomSheet open={locationSheet} onClose={() => setLocationSheet(false)} title="Share your location" heightPct={34}>
        {locationUnlocked ? (
          <>
            <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
              {params.name} will be able to see your live location for this session. You can stop sharing at any time.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn full icon={Navigation} onClick={shareLocation}>Share current location</Btn>
              <Btn full variant="secondary" onClick={() => setLocationSheet(false)}>Cancel</Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
              <AlertCircle size={16} color={C.slate} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, ...fBody }}>
                Your live location can only be shared once your booking with {params.name} is confirmed. This protects you from sharing it with unpaid or unverified contacts.
              </div>
            </div>
            <Btn full variant="secondary" onClick={() => setLocationSheet(false)}>Got it</Btn>
          </>
        )}
      </BottomSheet>

      <ConversationOptionsFlow
        otherName={params.name}
        isBlocked={blocked}
        pendingBookingAction={pendingBookingAction}
        onUnblock={() => unblock(threadId)}
        onReportSubmit={() => toast?.(`Report submitted (${selectedReason === "Something else" ? customReason.trim() : selectedReason})`)}
        onBlockConfirm={() => {
          if (pendingBookingAction === "decline") {
            respondBooking?.(relatedBooking.id, BOOKING_STATUS.DECLINED);
          } else if (pendingBookingAction === "withdraw") {
            cancelBooking?.(relatedBooking.id);
          }
          block(threadId);
          toast?.(pendingBookingAction
            ? `Pending request ${pendingBookingAction === "decline" ? "declined" : "withdrawn"}; ${params.name} blocked`
            : `${params.name} has been blocked`);
        }}
        step={step} setStep={setStep}
        blockStep={blockStep} setBlockStep={setBlockStep}
        selectedReason={selectedReason} setSelectedReason={setSelectedReason}
        customReason={customReason} setCustomReason={setCustomReason}
      />
    </div>
  );
}
