import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, Clock3,
  Copy, KeyRound, LifeBuoy, MapPin, MessageCircle, Navigation, Phone,
  PlayCircle, RefreshCcw, ShieldCheck, Smartphone, Timer, Video, XCircle,
  BellRing, ChevronRight,
} from "lucide-react";
import { CL, CD, T, fBody, fDisplay, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES } from "../../data/coaches";
import { BOOKING_STATUS, SESSION_OTP } from "../../data/bookings";
import {
  Avatar, Badge, Btn, Card, EmptyState, Row, SectionLabel, StatusPill, TopBar, BottomSheet,
} from "../../components/ui/Primitives";
import { haptic } from "../../utils/haptics";

/* =========================================================================
   SESSION FLOW — OTP check-in + live session screens
   -------------------------------------------------------------------------
   Ride-hailing-style session start: the client generates a 6-digit code,
   shares it with the coach, and the coach enters it to start the session.
   Completion stays coach-driven (see SessionLifecycle.jsx).
   ========================================================================= */

function findBooking(id, role, bookings, coachBookings) {
  const preferred = role === "coach" ? coachBookings : bookings;
  const fallback = role === "coach" ? bookings : coachBookings;
  return preferred.find((item) => item.id === id) || fallback.find((item) => item.id === id);
}

function resolveSessionDetails(booking, role, coachProfile) {
  if (role === "coach") {
    const pkg = coachProfile?.packages?.find((p) => p.name === booking?.service);
    return {
      venue: pkg?.venue || pkg?.location || coachProfile?.venue || "Venue to be confirmed",
      equipment: pkg?.equipment || "",
      online: booking?.mode === "Virtual",
    };
  }
  const coach = COACHES.find((c) => c.id === booking?.coachId)
    || COACHES.find((c) => c.name === booking?.coachName);
  const pkg = coach?.packages?.find((p) => p.name === booking?.service);
  return {
    venue: booking?.venue || pkg?.venue || pkg?.location || coach?.venue || "Venue to be confirmed",
    equipment: pkg?.equipment || "",
    online: booking?.mode === "Virtual",
    suburb: coach?.suburb || "",
  };
}

function mmss(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------
   CodeBoxes — 6-digit OTP input with auto-advance, paste, and backspace
   ------------------------------------------------------------------------- */
function CodeBoxes({ digits, onSetDigit, disabled = false, error = false, onKeyDown }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const inputsRef = useRef([]);

  const setDigit = (i, raw) => {
    const v = raw.replace(/[^0-9]/g, "").slice(-1);
    onSetDigit(i, v);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (onKeyDown) onKeyDown(e);
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    const text = (e.clipboardData?.getData("text") || "").replace(/[^0-9]/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...digits];
    text.split("").forEach((ch, idx) => { if (idx < 6) next[idx] = ch; });
    text.split("").forEach((_, idx) => onSetDigit(idx, next[idx]));
    const focusIndex = Math.min(text.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div
      style={{
        display: "flex", gap: 8, justifyContent: "space-between",
        animation: error ? "clShake .4s ease" : "none",
      }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          name={`session-code-${i + 1}`}
          aria-label={`Session code digit ${i + 1} of 6`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          ref={(el) => { inputsRef.current[i] = el; }}
          value={d}
          disabled={disabled}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          inputMode="numeric"
          maxLength={1}
          style={{
            width: 46, height: 58, flex: "0 0 46px", textAlign: "center",
            fontSize: T.headingLg, fontWeight: 700,
            border: `1.5px solid ${error ? C.error : d ? C.brand : C.border}`,
            borderRadius: 14, outline: "none", color: C.jet, boxSizing: "border-box",
            background: disabled ? C.fog : C.white, ...fDisplay,
            caretColor: C.brand,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   BigCodeDisplay — read-only 6-digit display for the client
   ------------------------------------------------------------------------- */
function BigCodeDisplay({ code }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const digits = String(code || "").padEnd(6, "•").split("");
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <div
          key={i}
          style={{
            width: 48, height: 62, borderRadius: 16, background: C.brandTint,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: T.displayLg, fontWeight: 800, color: C.brandIcon || C.brand, ...fDisplay,
            letterSpacing: "0.5px",
          }}
        >
          {d}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   ScreenClientSessionStart — client reviews details and generates the code
   ------------------------------------------------------------------------- */
export function ScreenClientSessionStart({
  nav, goBack, params, bookings = [], coachBookings = [], generateSessionCode, toast,
}) {
  const { darkMode, coachProfile } = useApp();
  const C = darkMode ? CD : CL;
  const booking = findBooking(params?.bookingId, "client", bookings, coachBookings);
  const [generating, setGenerating] = useState(false);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Start session" onBack={() => goBack("client-dashboard")} />
        <EmptyState icon={CalendarDays} title="Session not found" body="This session may no longer be available." />
      </div>
    );
  }

  const details = resolveSessionDetails(booking, "client", coachProfile);
  const person = booking.coachName || "your coach";
  const hasActiveCode = !!booking.sessionCode && booking.status === BOOKING_STATUS.CONFIRMED;

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    haptic(12);
    window.setTimeout(() => {
      const code = generateSessionCode?.(booking.id);
      setGenerating(false);
      if (code) {
        toast("Session code generated");
        nav("client-session-code", { bookingId: booking.id });
      } else {
        toast("This session can't start yet");
      }
    }, 550);
  };

  const goLive = () => nav("session-progress", { bookingId: booking.id, role: "client" });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Start session" onBack={() => nav("client-booking-detail", { id: booking.id })} right={<StatusPill status={booking.status} />} />
      <div style={{ flex: 1, overflowY: "auto", padding: `12px ${LAYOUT.pagePadX}px 26px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "6px 10px 20px" }}>
          <div style={{ width: 66, height: 66, borderRadius: 22, background: C.brandTint, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlayCircle size={31} color={C.brand} strokeWidth={2} />
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, letterSpacing: "-0.35px", ...fDisplay }}>Ready to start?</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 7, ...fBody }}>
            Generate a check-in code and share it with {person.split(" ")[0]} — they'll enter it to start your session.
          </div>
        </div>

        <Card style={{ marginBottom: 12, padding: 15 }}>
          <SectionLabel>How check-in works</SectionLabel>
          {[
            { icon: KeyRound, title: "Generate your code", detail: `A unique 6-digit code, valid for ${Math.round(SESSION_OTP.TTL_SECONDS / 60)} minutes.` },
            { icon: Smartphone, title: "Share it with your coach", detail: "Show it in person or message it to them in the chat." },
            { icon: BadgeCheck, title: "Coach starts the session", detail: "Once they enter the code, your session goes live — and your payment stays protected." },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "9px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={C.brandIcon || C.brand} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{i + 1}. {step.title}</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 2, ...fBody }}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </Card>

        <SectionLabel>Session details</SectionLabel>
        <Card style={{ marginBottom: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
            <Avatar name={person} size={42} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{booking.service}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>with {person}</div>
            </div>
          </div>
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Format" value={booking.mode} last />
        </Card>

        <SectionLabel>{details.online ? "How you'll connect" : "Where to meet"}</SectionLabel>
        <Card style={{ marginBottom: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {details.online ? <Video size={18} color={C.brandIcon || C.brand} /> : <MapPin size={18} color={C.brandIcon || C.brand} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{details.online ? "Online session" : details.venue}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>
                {details.online
                  ? "Your coach admits you once the code is verified. Make sure your camera and connection are ready."
                  : `${details.suburb ? `${details.suburb} · ` : ""}Arrive a few minutes early and look out for your coach.`}
              </div>
            </div>
          </div>
          {!details.online && (
            <Btn full variant="outline" icon={Navigation} style={{ marginTop: 13 }} onClick={() => { haptic(8); toast(`Opening directions to ${details.venue}`); }}>
              Get directions
            </Btn>
          )}
        </Card>

        {details.equipment && (
          <>
            <SectionLabel>What to bring</SectionLabel>
            <Card style={{ marginBottom: 12, padding: 15 }}>
              <p style={{ margin: 0, fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody }}>{details.equipment}</p>
            </Card>
          </>
        )}

        {booking.safetyNotes && (
          <>
            <SectionLabel>Health & safety information</SectionLabel>
            <Card style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 10, background: C.warnTint, border: "none" }}>
              <AlertTriangle size={17} color={C.warnStrong} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: T.body, color: C.jet, lineHeight: 1.6, whiteSpace: "pre-line", ...fBody }}>{booking.safetyNotes}</p>
            </Card>
          </>
        )}

        <Card style={{ display: "flex", gap: 11, alignItems: "flex-start", background: C.successTint, border: "none" }}>
          <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Your payment is protected</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>CoachNivo holds your payment securely and releases it only after the session is complete.</div>
          </div>
        </Card>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        {booking.status === BOOKING_STATUS.IN_PROGRESS && (
          <Btn full icon={BadgeCheck} onClick={goLive}>View live session</Btn>
        )}
        {booking.status !== BOOKING_STATUS.IN_PROGRESS && (
          <>
            <Btn full loading={generating} loadingText="Generating code…" icon={KeyRound} onClick={handleGenerate}>
              {hasActiveCode ? "View your session code" : "Generate session code"}
            </Btn>
            <Btn full variant="outline" icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.coachName, context: `${booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "client-session-start", backParams: { bookingId: booking.id } })}>
              Message {person.split(" ")[0]}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ScreenClientSessionCode — big code display + countdown + live handoff
   ------------------------------------------------------------------------- */
export function ScreenClientSessionCode({
  nav, goBack, params, bookings = [], coachBookings = [], generateSessionCode, toast,
}) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const booking = findBooking(params?.bookingId, "client", bookings, coachBookings);
  const [starting, setStarting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [regenerating, setRegenerating] = useState(false);
  // Seeded demo codes may not carry an expiry — give them a fresh TTL window
  // when first viewed so the countdown behaves like a real generated code.
  const [fallbackExpiresAt] = useState(() => Date.now() + SESSION_OTP.TTL_SECONDS * 1000);

  const code = booking?.sessionCode;
  const storedExpiresAt = Number(booking?.codeExpiresAt || 0);
  const expiresAt = storedExpiresAt > 0 ? storedExpiresAt : fallbackExpiresAt;
  const remaining = code ? Math.max(0, (expiresAt - now) / 1000) : 0;
  const expired = !!code && remaining <= 0 && booking?.status === BOOKING_STATUS.CONFIRMED;
  const voided = !code && booking?.status === BOOKING_STATUS.CONFIRMED;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Coach verified the code — celebrate briefly, then jump to the live screen.
  useEffect(() => {
    if (booking?.status === BOOKING_STATUS.IN_PROGRESS && !starting) {
      setStarting(true);
      haptic([10, 60, 10]);
      window.setTimeout(() => nav("session-progress", { bookingId: booking.id, role: "client" }), 1400);
    }
  }, [booking?.status, starting, booking?.id, nav]);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Session code" onBack={() => goBack("client-dashboard")} />
        <EmptyState icon={KeyRound} title="Session not found" body="This session may no longer be available." />
      </div>
    );
  }

  const person = booking.coachName || "your coach";
  const expiresAtLabel = expiresAt ? new Date(expiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
  const progressPct = expiresAt ? Math.min(100, Math.max(0, (remaining / SESSION_OTP.TTL_SECONDS) * 100)) : 0;

  const regenerate = () => {
    if (regenerating) return;
    setRegenerating(true);
    haptic(12);
    window.setTimeout(() => {
      const next = generateSessionCode?.(booking.id);
      setRegenerating(false);
      if (next) toast("A new code was generated");
      else toast("Couldn't refresh the code");
    }, 500);
  };

  const copyCode = () => {
    if (!code) return;
    haptic(8);
    try {
      navigator.clipboard?.writeText?.(code);
      toast("Code copied to clipboard");
    } catch {
      toast(`Your code is ${code}`);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Session code" onBack={() => nav("client-session-start", { bookingId: booking.id })} />

      {starting && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, animation: "clFadeIn .25s ease" }}>
          <div style={{ width: 92, height: 92, borderRadius: 30, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, animation: "clPopIn .35s cubic-bezier(.22,1,.36,1)" }}>
            <CheckCircle2 size={44} color={C.success} />
          </div>
          <div style={{ fontSize: T.displayLg, fontWeight: 750, color: C.jet, ...fDisplay }}>Session started!</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 8, textAlign: "center", ...fBody }}>
            {person.split(" ")[0]} verified your code. Taking you to the live session…
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: `12px ${LAYOUT.pagePadX}px 26px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "6px 10px 20px" }}>
          <div style={{ width: 66, height: 66, borderRadius: 22, background: C.brandTint, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={30} color={C.brand} strokeWidth={2} />
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, letterSpacing: "-0.35px", ...fDisplay }}>
            {voided ? (expired ? "Your code expired" : "No active code") : "Share this code"}
          </div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 7, ...fBody }}>
            {voided
              ? "Generate a fresh code and share it with your coach to continue."
              : `Tell ${person.split(" ")[0]} these 6 digits — they'll enter them to start the session.`}
          </div>
        </div>

        {!voided && (
          <>
            <button type="button" onClick={copyCode} aria-label="Copy session code" style={{ width: "100%", background: "none", border: "none", padding: "6px 0 4px", cursor: "pointer" }}>
              <BigCodeDisplay code={code} />
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 6, alignItems: "center", fontSize: T.label, fontWeight: 600, color: C.brand, ...fBody }}>
                <Copy size={13} /> Tap to copy
              </div>
            </button>

            <Card style={{ marginTop: 16, marginBottom: 12, padding: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Timer size={15} color={C.brand} />
                  <span style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>
                    {expired ? "Code expired" : `Expires in ${mmss(remaining)}`}
                  </span>
                </div>
                <span style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{expiresAtLabel}</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: C.fog, marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 99, background: expired ? C.error : C.brand, transition: "width 1s linear" }} />
              </div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 9, ...fBody }}>
                Codes refresh automatically after {Math.round(SESSION_OTP.TTL_SECONDS / 60)} minutes for security.
              </div>
            </Card>
          </>
        )}

        {expired && (
          <Card style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 11, background: C.warnTint, border: "none" }}>
            <XCircle size={19} color={C.warnStrong} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>This code is no longer valid</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>Generate a new one and share it with your coach — the old code can't be used again.</div>
            </div>
          </Card>
        )}

        {voided && (
          <Card style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 11, background: C.errorTint, border: "none" }}>
            <XCircle size={19} color={C.error} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Code not available</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>Generate a new code to continue your check-in.</div>
            </div>
          </Card>
        )}

        {!voided && (
          <Card style={{ marginBottom: 12, display: "flex", gap: 11, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Clock3 size={18} color={C.brandIcon || C.brand} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>
                Waiting for your coach
                <span style={{ width: 6, height: 6, borderRadius: 99, background: C.brand, animation: "clPulse 1.4s infinite" }} />
              </div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 3, ...fBody }}>
                Once {person.split(" ")[0]} enters the code, your session goes live and we'll take you straight there.
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 12, display: "flex", gap: 11, alignItems: "flex-start", background: C.successTint, border: "none" }}>
          <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Why a code?</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>It proves you and your coach are both at the right session, and keeps your payment protected until you're done.</div>
          </div>
        </Card>

        <Btn full variant="ghost" icon={RefreshCcw} loading={regenerating} loadingText="Generating…" onClick={regenerate}>
          Generate a new code
        </Btn>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", gap: 9 }}>
        {!voided ? (
          <>
            <Btn full icon={Copy} onClick={copyCode}>Copy code</Btn>
            <Btn full variant="outline" icon={MessageCircle} onClick={() => { haptic(8); toast(`Code shared with ${person.split(" ")[0]} in chat`); }}>
              Share with coach
            </Btn>
          </>
        ) : (
          <Btn full icon={KeyRound} loading={regenerating} loadingText="Generating…" onClick={regenerate}>Generate session code</Btn>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ScreenCoachSessionStart — coach enters the client's code to go live
   ------------------------------------------------------------------------- */
export function ScreenCoachSessionStart({
  nav, goBack, params, bookings = [], coachBookings = [], verifySessionCode, toast, pushNotification,
}) {
  const { darkMode, coachProfile } = useApp();
  const C = darkMode ? CD : CL;
  const booking = findBooking(params?.bookingId, "coach", bookings, coachBookings);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [voidedCode, setVoidedCode] = useState(false);
  const [started, setStarted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const inputsRef = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (booking?.status === BOOKING_STATUS.IN_PROGRESS && !started) {
      setStarted(true);
      haptic([10, 60, 10]);
      window.setTimeout(() => nav("session-progress", { bookingId: booking.id, role: "coach" }), 1400);
    }
  }, [booking?.status, started, booking?.id, nav]);

  // A fresh client code clears any previous failed-attempt state (a voided
  // code disappearing must NOT clear the void notice — only a new code does).
  const prevCodeRef = useRef(booking?.sessionCode);
  useEffect(() => {
    const nextCode = booking?.sessionCode;
    if (nextCode && nextCode !== prevCodeRef.current) {
      setVoidedCode(false);
      setError(null);
    }
    prevCodeRef.current = nextCode;
  }, [booking?.sessionCode]);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Start session" onBack={() => goBack("coach-bookings")} />
        <EmptyState icon={KeyRound} title="Session not found" body="This session may no longer be available." />
      </div>
    );
  }

  const details = resolveSessionDetails(booking, "coach", coachProfile);
  const client = booking.clientName || "your client";
  const hasCode = !!booking.sessionCode;
  const codeExpired = hasCode && Number(booking.codeExpiresAt || 0) > 0 && Number(booking.codeExpiresAt) < now;
  const attemptsUsed = Number(booking.codeAttempts || 0);
  const attemptsLeft = Math.max(0, SESSION_OTP.MAX_ATTEMPTS - attemptsUsed);
  const canStart = booking.status === BOOKING_STATUS.CONFIRMED;

  const setDigit = (i, v) => {
    setDigits((d) => { const n = [...d]; n[i] = v; return n; });
    setError(null);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" && digits.every(Boolean)) verify();
  };

  const nudgeClient = () => {
    haptic(10);
    pushNotification?.({
      audience: "client",
      type: "session",
      title: `${booking.coachName || "Your coach"} is waiting`,
      body: `Open your session and share the check-in code so ${booking.coachName || "your coach"} can start ${booking.service}.`,
      bookingId: booking.id,
    });
    toast("Nudge sent to client");
  };

  const verify = () => {
    if (!canStart || verifying) return;
    const code = digits.join("");
    if (code.length !== 6) return;
    setVerifying(true);
    haptic(10);
    window.setTimeout(() => {
      const result = verifySessionCode?.(booking.id, code);
      setVerifying(false);
      if (!result) {
        setError("Something went wrong — please try again");
        return;
      }
      if (result.ok) {
        setStarted(true);
        haptic([10, 60, 10]);
        window.setTimeout(() => nav("session-progress", { bookingId: booking.id, role: "coach" }), 1400);
        return;
      }
      if (result.reason === "expired") {
        setError("This code has expired — ask the client for a new one");
        return;
      }
      if (result.reason === "voided") {
        setError(null);
        setVoidedCode(true);
        setDigits(["", "", "", "", "", ""]);
        return;
      }
      setError(`Code doesn't match — ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} left`);
      setDigits(["", "", "", "", "", ""]);
      if (result.attemptsLeft > 0) inputsRef.current[0]?.focus();
    }, 700);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Start session" onBack={() => nav("coach-session-detail", { id: booking.id })} right={<StatusPill status={booking.status} />} />

      {started && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, animation: "clFadeIn .25s ease" }}>
          <div style={{ width: 92, height: 92, borderRadius: 30, background: C.successTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, animation: "clPopIn .35s cubic-bezier(.22,1,.36,1)" }}>
            <CheckCircle2 size={44} color={C.success} />
          </div>
          <div style={{ fontSize: T.displayLg, fontWeight: 750, color: C.jet, ...fDisplay }}>Session started!</div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 8, textAlign: "center", ...fBody }}>
            Code verified — {booking.service} with {client.split(" ")[0]} is now live.
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: `12px ${LAYOUT.pagePadX}px 26px` }} className="cl-hide-scrollbar">
        <div style={{ textAlign: "center", padding: "6px 10px 20px" }}>
          <div style={{ width: 66, height: 66, borderRadius: 22, background: C.brandTint, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={30} color={C.brand} strokeWidth={2} />
          </div>
          <div style={{ fontSize: T.display, fontWeight: 750, color: C.jet, letterSpacing: "-0.35px", ...fDisplay }}>
            {hasCode ? "Enter the client's code" : "Waiting for a code"}
          </div>
          <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginTop: 7, ...fBody }}>
            {hasCode
              ? `${client.split(" ")[0]} is ready. Enter the 6-digit code they share with you to start the session.`
              : `${client.split(" ")[0]} hasn't generated their check-in code yet. Ask them to open the session in their app.`}
          </div>
        </div>

        <SectionLabel>Session</SectionLabel>
        <Card style={{ marginBottom: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
            <Avatar name={client} size={42} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{booking.service}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>with {client}</div>
            </div>
          </div>
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Format" value={booking.mode} last />
        </Card>

        <SectionLabel>{details.online ? "Connection" : "Venue"}</SectionLabel>
        <Card style={{ marginBottom: 14, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {details.online ? <Video size={18} color={C.brandIcon || C.brand} /> : <MapPin size={18} color={C.brandIcon || C.brand} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{details.online ? "Online session" : details.venue}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>
                {details.online ? "The client is admitted after the code is verified." : "Confirm you're both at the venue before entering the code."}
              </div>
            </div>
          </div>
        </Card>

        {canStart && hasCode && !codeExpired && !voidedCode && (
          <>
            <SectionLabel>Session code</SectionLabel>
            <Card style={{ marginBottom: 14, padding: 18 }}>
              <CodeBoxes digits={digits} onSetDigit={setDigit} onKeyDown={onKeyDown} error={!!error && error.includes("doesn't match")} />
              {error && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 12, background: C.errorTint, borderRadius: 11, padding: "9px 11px" }}>
                  <XCircle size={15} color={C.error} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: T.captionLg, color: C.error, lineHeight: 1.5, ...fBody }}>{error}</span>
                </div>
              )}
              {!error && attemptsUsed > 0 && (
                <div style={{ fontSize: T.caption, color: C.warnStrong, marginTop: 12, ...fBody }}>
                  {attemptsLeft} of {SESSION_OTP.MAX_ATTEMPTS} attempts remaining
                </div>
              )}
              <Btn full icon={ArrowRight} style={{ marginTop: 16 }} loading={verifying} loadingText="Verifying…" disabled={digits.join("").length !== 6} onClick={verify}>
                Verify & start session
              </Btn>
            </Card>
          </>
        )}

        {canStart && voidedCode && (
          <Card style={{ marginBottom: 14, display: "flex", gap: 11, alignItems: "flex-start", background: C.errorTint, border: "none" }}>
            <XCircle size={19} color={C.error} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Too many incorrect attempts</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 3, ...fBody }}>This code is no longer valid. Ask {client.split(" ")[0]} to generate a fresh one.</div>
              <Btn full variant="outline" icon={BellRing} style={{ marginTop: 12 }} onClick={nudgeClient}>Ask for a new code</Btn>
            </div>
          </Card>
        )}

        {canStart && !hasCode && !voidedCode && (
          <Card style={{ marginBottom: 14, display: "flex", gap: 11, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Smartphone size={18} color={C.brandIcon || C.brand} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>
                No code yet
                <span style={{ width: 6, height: 6, borderRadius: 99, background: C.brand, animation: "clPulse 1.4s infinite" }} />
              </div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 3, ...fBody }}>
                The code appears once {client.split(" ")[0]} opens the session. It's valid for {Math.round(SESSION_OTP.TTL_SECONDS / 60)} minutes after they generate it.
              </div>
              <Btn full variant="outline" icon={BellRing} style={{ marginTop: 12 }} onClick={nudgeClient}>Nudge client</Btn>
            </div>
          </Card>
        )}

        {canStart && hasCode && codeExpired && (
          <Card style={{ marginBottom: 14, display: "flex", gap: 11, alignItems: "flex-start", background: C.warnTint, border: "none" }}>
            <XCircle size={19} color={C.warnStrong} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>This code has expired</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 3, ...fBody }}>Ask {client.split(" ")[0]} to generate a fresh code — codes stay valid for {Math.round(SESSION_OTP.TTL_SECONDS / 60)} minutes.</div>
              <Btn full variant="outline" icon={BellRing} style={{ marginTop: 12 }} onClick={nudgeClient}>Ask for a new code</Btn>
            </div>
          </Card>
        )}

        {booking.status === BOOKING_STATUS.IN_PROGRESS && !started && (
          <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 11, background: C.successTint, border: "none" }}>
            <BadgeCheck size={19} color={C.success} />
            <div style={{ flex: 1, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Session is live</div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        <Card style={{ display: "flex", gap: 11, alignItems: "flex-start", background: C.successTint, border: "none" }}>
          <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Verified start protects both of you</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>The code proves the client is present and agrees to start. Your payout stays protected by CoachNivo until completion.</div>
          </div>
        </Card>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white }}>
        {booking.status === BOOKING_STATUS.IN_PROGRESS && (
          <Btn full icon={BadgeCheck} onClick={() => nav("session-progress", { bookingId: booking.id, role: "coach" })}>View live session</Btn>
        )}
        {booking.status === BOOKING_STATUS.COMPLETION_PENDING && (
          <Btn full icon={ArrowRight} onClick={() => nav("coach-session-completion", { bookingId: booking.id, role: "coach", backTo: "coach-session-detail" })}>Finish session</Btn>
        )}
        {booking.status === BOOKING_STATUS.CONFIRMED && (
          <Btn full variant="outline" icon={MessageCircle} onClick={() => nav("chat-thread", { name: booking.clientName, context: `${booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "coach-session-start", backParams: { bookingId: booking.id } })}>
            Message {client.split(" ")[0]}
          </Btn>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ScreenSessionProgress — live session screen for both roles
   ------------------------------------------------------------------------- */
export function ScreenSessionProgress({
  nav, goBack, params, role: appRole, bookings = [], coachBookings = [], additionalCharges = [], toast,
}) {
  const { darkMode, coachProfile } = useApp();
  const C = darkMode ? CD : CL;
  const role = params?.role || appRole || "client";
  const booking = findBooking(params?.bookingId, role, bookings, coachBookings);
  const [seconds, setSeconds] = useState(0);
  const [endSheetOpen, setEndSheetOpen] = useState(false);

  useEffect(() => {
    if (booking?.status !== BOOKING_STATUS.IN_PROGRESS) return undefined;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [booking?.status]);

  if (!booking) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TopBar title="Session" onBack={() => goBack(role === "coach" ? "coach-bookings" : "client-dashboard")} />
        <EmptyState icon={Timer} title="Session not found" body="This session may no longer be available." />
      </div>
    );
  }

  const details = resolveSessionDetails(booking, role, coachProfile);
  const person = role === "coach" ? booking.clientName : booking.coachName;
  const live = booking.status === BOOKING_STATUS.IN_PROGRESS;
  const completed = booking.status === BOOKING_STATUS.COMPLETED;
  const pendingCharge = additionalCharges.find((charge) => (
    charge.bookingId === booking.id
    && charge.phase === "completion"
    && charge.status === "pending"
  ));

  const backScreen = role === "coach" ? "coach-session-detail" : "client-booking-detail";
  const messageName = role === "coach" ? booking.clientName : booking.coachName;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Live session" onBack={() => nav(backScreen, { id: booking.id })} right={live ? <Badge tone="success" icon={CheckCircle2}>Live</Badge> : <StatusPill status={booking.status} />} />

      <div style={{ flex: 1, overflowY: "auto", padding: `12px ${LAYOUT.pagePadX}px 26px` }} className="cl-hide-scrollbar">
        {/* Hero band */}
        <Card style={{ marginBottom: 12, padding: 18, background: live ? C.jet : C.fog, border: "none", textAlign: "center" }}>
          {live ? (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 99, background: C.successTint, padding: "5px 12px" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: C.live, animation: "clPulse 1.2s infinite" }} />
                <span style={{ fontSize: T.label, fontWeight: 700, color: C.success, ...fBody }}>Session in progress</span>
              </div>
              <div style={{ fontSize: T.hero, fontWeight: 800, color: C.white, letterSpacing: "-0.5px", marginTop: 10, ...fDisplay }}>{mmss(seconds)}</div>
              <div style={{ fontSize: T.captionLg, color: C.onDarkMuted, marginTop: 3, ...fBody }}>
                {booking.sessionStartedAt ? `Started ${booking.sessionStartedAt}` : `Started just now`} · keep going!
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 99, background: C.fog, padding: "5px 12px" }}>
                <Clock3 size={13} color={C.slate} />
                <span style={{ fontSize: T.label, fontWeight: 700, color: C.slate, ...fBody }}>
                  {completed ? "Session completed" : "Session ended"}
                </span>
              </div>
              <div style={{ fontSize: T.heading, fontWeight: 750, color: C.jet, marginTop: 10, ...fDisplay }}>
                {completed ? "Great work today" : "Wrapping up"}
              </div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 4, lineHeight: 1.5, ...fBody }}>
                {completed ? "The session is complete and the held payment has been released." : "Your coach is finishing the session — we'll keep you posted on any final steps."}
              </div>
            </>
          )}
        </Card>

        {/* Partner */}
        <SectionLabel>{role === "coach" ? "Your client" : "Your coach"}</SectionLabel>
        <Card style={{ marginBottom: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
            <Avatar name={person} size={46} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{person}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>{booking.service}</div>
            </div>
          </div>
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Format" value={booking.mode} last />
          {live && (
            <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
              <Btn full size="sm" variant="secondary" icon={MessageCircle} onClick={() => nav("chat-thread", { name: messageName, context: `${booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "session-progress", backParams: { bookingId: booking.id, role } })}>Message</Btn>
              <Btn full size="sm" variant="outline" icon={Phone} onClick={() => { haptic(8); toast(`Calling ${person.split(" ")[0]}…`); }}>Call</Btn>
            </div>
          )}
        </Card>

        {/* Venue / connection */}
        <SectionLabel>{details.online ? "Connection" : "Venue"}</SectionLabel>
        <Card style={{ marginBottom: 12, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {details.online ? <Video size={18} color={C.brandIcon || C.brand} /> : <MapPin size={18} color={C.brandIcon || C.brand} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{details.online ? "Online session" : details.venue}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 3, ...fBody }}>
                {details.online ? "Stay connected — your coach is with you on the call." : "You're both checked in at the venue."}
              </div>
            </div>
          </div>
          {!details.online && (
            <Btn full variant="outline" icon={Navigation} style={{ marginTop: 13 }} onClick={() => { haptic(8); toast(`Opening directions to ${details.venue}`); }}>
              Get directions
            </Btn>
          )}
        </Card>

        {/* Final charge (client) */}
        {pendingCharge && role === "client" && !live && (
          <Card style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 11, background: C.warnTint, border: "none" }} onClick={() => nav("additional-charge-payment", { chargeId: pendingCharge.id, role: "client", backTo: "session-progress" })}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Smartphone size={17} color={C.warnStrong} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Final payment · ${Number(pendingCharge.amount).toFixed(2)}</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{pendingCharge.reason} · Pay to complete the session</div>
            </div>
            <ChevronRight size={16} color={C.slateLight} />
          </Card>
        )}

        {/* In-session support */}
        <SectionLabel>{live ? "During your session" : "Support"}</SectionLabel>
        <Card style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => nav("support", { presetTab: "chat", bookingContext: `${booking.service} · ${booking.date}`, backTo: "session-progress", backParams: { bookingId: booking.id, role } })}
            style={{ width: "100%", minHeight: 56, padding: "0 15px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 11, cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 11, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LifeBuoy size={17} color={C.brandIcon || C.brand} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Get help during the session</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>CoachNivo support is one tap away</div>
            </div>
            <ChevronRight size={16} color={C.slateLight} />
          </button>
          <button
            type="button"
            onClick={() => nav("dispute-create", { bookingId: booking.id, role, category: role === "coach" ? "client_no_show" : "session_not_delivered", backTo: "session-progress", backParams: { bookingId: booking.id, role } })}
            style={{ width: "100%", minHeight: 56, padding: "0 15px", background: "none", border: "none", display: "flex", alignItems: "center", gap: 11, cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 11, background: C.dangerTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={17} color={C.danger} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Report an issue</div>
              <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>Safety or no-show concerns</div>
            </div>
            <ChevronRight size={16} color={C.slateLight} />
          </button>
        </Card>

        <Card style={{ display: "flex", gap: 11, alignItems: "flex-start", background: C.successTint, border: "none" }}>
          <ShieldCheck size={19} color={C.success} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Session protected</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, marginTop: 4, ...fBody }}>
              {role === "coach"
                ? `$${Number(booking.paidTotal || booking.price).toFixed(2)} is held securely and releases when the session completes.`
                : "Your payment stays held by CoachNivo until the session is complete."}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white }}>
        {live && role === "coach" && (
          <Btn full icon={CheckCircle2} onClick={() => setEndSheetOpen(true)}>End session</Btn>
        )}
        {live && role === "client" && (
          <div style={{ width: "100%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.fog, borderRadius: 12, padding: "10px 16px", color: C.slate, fontSize: T.body, fontWeight: 600, ...fBody }}>
            <Clock3 size={15} color={C.brand} />
            <span>Your coach ends the session when you're done</span>
          </div>
        )}
        {!live && role === "coach" && !completed && (
          <Btn full icon={ArrowRight} onClick={() => nav("coach-session-completion", { bookingId: booking.id, role: "coach", backTo: backScreen })}>Finish session</Btn>
        )}
        {!live && role === "client" && completed && (
          <Btn full icon={CheckCircle2} onClick={() => nav("funds-release-status", { bookingId: booking.id, role: "client", backTo: backScreen })}>View payment release</Btn>
        )}
        {!live && role === "client" && !completed && (
          <Btn full variant="outline" icon={CalendarDays} onClick={() => nav(backScreen, { id: booking.id })}>Back to session details</Btn>
        )}
      </div>

      <BottomSheet open={endSheetOpen} onClose={() => setEndSheetOpen(false)} title="End this session?" heightPct={56}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginBottom: 14, ...fBody }}>
          Once you end the session, you can add any agreed final charges — like extra time, equipment, or venue costs — before the funds are released.
        </div>
        <Card style={{ marginBottom: 18, display: "flex", gap: 11, alignItems: "flex-start", background: C.fog, border: "none" }}>
          <ShieldCheck size={18} color={C.brand} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.55, ...fBody }}>
            {pendingCharge
              ? `A final payment of $${Number(pendingCharge.amount).toFixed(2)} is waiting for ${(booking.clientName || "your client").split(" ")[0]} — the session completes once it's paid.`
              : "No charges yet — you can finish without one, and the held payment releases right away."}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full onClick={() => { haptic(12); setEndSheetOpen(false); nav("coach-session-completion", { bookingId: booking.id, role: "coach", backTo: "session-progress" }); }}>
            Continue to finish
          </Btn>
          <Btn full variant="secondary" onClick={() => setEndSheetOpen(false)}>Keep session live</Btn>
        </div>
      </BottomSheet>
    </div>
  );
}
