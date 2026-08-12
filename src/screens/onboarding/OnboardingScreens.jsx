import React, { useState, useEffect } from "react";
import {
  Search, Users, Mail, Eye, EyeOff, Fingerprint, Check,
  Upload, CheckCircle2, ClipboardList, Clock, Lock, Camera, MapPin, LocateFixed,
  Plus, Trash2, CreditCard, ScanFace, FileCheck2, Smartphone,
} from "lucide-react";
import { C, fDisplay, fBody, LOGO_WHITE_SRC, T } from "../../theme/theme";
import {
  Btn, Card, Badge, Toggle, TopBar, Field, StepProgress, CheckboxRow, RadioRow,
  SearchMultiSelect, Avatar, Chip, BottomSheet, Spinner,
} from "../../components/ui/Primitives";
import { LogoMark } from "../../components/ui/Primitives";
import {
  LANGUAGE_OPTIONS, GENDER_OPTIONS, AU_SUBURBS, SPORT_OPTIONS_FULL,
  COACHING_CATEGORY_OPTIONS, SKILL_LEVEL_OPTIONS, AGE_GROUP_OPTIONS,
  COACHING_EXPERIENCE_LEVELS, COACHING_FORMAT_OPTIONS, ID_TYPE_OPTIONS,
  CERTIFICATION_TYPE_OPTIONS,
} from "../../data/mockData";

const inputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
  fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", ...fBody,
};
const labelStyle = { fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody };

function AppleIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 384 512" fill={color} style={{ flexShrink: 0 }}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "Select…" }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, appearance: "auto", background: C.white, color: value ? C.jet : C.slateLight }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const TERMS_POINTS = [
  "We collect your location to show nearby coaches and enable travel-radius search.",
  "Payment details are processed by our PCI-compliant payment partner — CoachLink never stores full card numbers.",
  "If you're booking for someone under 18, a parent or guardian must provide consent before the session is confirmed.",
  "Coaches working with minors must hold a valid Working with Children Check, verified before their profile goes live.",
  "You can request a full export or deletion of your data at any time from Account Settings.",
];

function LegalSheet({ open, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Terms & Conditions" heightPct={60}>
      <Badge tone="neutral">Version 2.1 · Updated Jun 2026</Badge>
      <div style={{ marginTop: 14, fontSize: T.body, color: C.slate, lineHeight: 1.7, ...fBody }}>
        {TERMS_POINTS.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Check size={14} color={C.orange} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

export function ScreenSplash({ nav }) {
  // Splash is purely branding + loading — it establishes the brand while the
  // app "warms up", then hands off automatically. No auth actions live here.
  useEffect(() => {
    const t = setTimeout(() => nav("get-started"), 1600);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
      <div style={{ animation: "clFadeUp .5s ease" }}>
        <img src={LOGO_WHITE_SRC} alt="CoachLink" style={{ width: 120, height: "auto" }} />
      </div>
      {/* <div style={{ color: C.onDarkMuted, fontSize: T.subtitle, marginTop: 22, lineHeight: 1.5, ...fBody }}>
        Find a coach you trust, or build your coaching business — all in one place.
      </div> */}
      <div style={{ marginTop: 34 }}>
        <Spinner size={22} color="#C7CAD3" />
      </div>
    </div>
  );
}

export function ScreenGetStarted({ nav }) {
  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
      <div style={{ animation: "clFadeUp .5s ease" }}>
        <img src={LOGO_WHITE_SRC} alt="CoachLink" style={{ width: 96, height: "auto" }} />
      </div>
      <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, marginTop: 24, ...fDisplay }}>
        Welcome to CoachLink
      </div>
      <div style={{ color: C.slate, fontSize: T.subtitle, marginTop: 10, lineHeight: 1.55, maxWidth: 280, ...fBody }}>
        Find a coach you trust, or build your coaching business.
      </div>
      <div style={{ marginTop: 36, width: "100%" }}>
        <Btn full variant="primary" onClick={() => nav("role-select")}>Get Started</Btn>
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => nav("auth", { mode: "login" })} style={{ background: "none", border: "none", color: C.slate, fontSize: T.bodyLg, cursor: "pointer", ...fBody }}>
          Have an existing account? <span style={{ color: C.orange, fontWeight: 600 }}>Sign In</span>
        </button>
      </div>
    </div>
  );
}

export function ScreenRoleSelect({ nav, setRole }) {
  // Picking a path here kicks off account creation directly — existing users
  // use the "Sign In" link below instead of going through role selection.
  const Option = ({ role, title, body, icon: Icon }) => (
    <button onClick={() => { setRole(role); nav("auth", { mode: "signup" }); }}
      style={{ width: "100%", textAlign: "left", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: 16, display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={C.orange} />
      </div>
      <div>
        <div style={{ fontWeight: 600, color: C.jet, fontSize: T.subtitleLg, marginBottom: 3, ...fDisplay }}>{title}</div>
        <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{body}</div>
      </div>
    </button>
  );
  return (
    <div style={{ padding: "24px 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <LogoMark size={34} />
      <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, marginTop: 22, ...fDisplay }}>What brings you<br />to CoachLink?</div>
      <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 6, marginBottom: 22, ...fBody }}>You can add a coaching profile later from the same account.</div>
      <Option role="client" icon={Search} title="Find a coach" body="Search, book and pay for sessions with verified coaches near you." />
      <Option role="coach" icon={Users} title="Coach others" body="List your services, manage bookings and get paid automatically." />
      <div style={{ marginTop: "auto", textAlign: "center", paddingTop: 16 }}>
        <button onClick={() => nav("auth", { mode: "login" })} style={{ background: "none", border: "none", color: C.slate, fontSize: T.bodyLg, cursor: "pointer", ...fBody }}>
          Have an existing account? <span style={{ color: C.orange, fontWeight: 600 }}>Sign In</span>
        </button>
      </div>
    </div>
  );
}

export function ScreenAuth({ nav, params, role, toast, biometric }) {
  // Login is the default landing point after role selection — "Create an account"
  // is what reveals the registration flow (a dedicated screen for coaches, since
  // that signup needs extra fields; an inline form for clients).
  const [mode, setMode] = useState(params?.mode || "login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = mode === "login"
    ? true
    : firstName.trim() && lastName.trim() && email.trim() && password.length >= 6 && passwordsMatch && agree;
  const homeScreen = role === "coach" ? "coach-dashboard" : "client-home";

  const proceedAfterAuth = () => {
    if (mode === "login") { nav(homeScreen); return; }
    nav("enable-biometric", { next: role === "coach" ? "coach-info" : "about-you-profile" });
  };

  const goCreateAccount = () => {
    // Coaches have a dedicated multi-field registration screen; clients can
    // register inline on this same screen.
    if (role === "coach") { nav("coach-register"); return; }
    setMode("signup");
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("role-select")} />
      <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{mode === "signup" ? "Create your account" : "Welcome back"}</div>
      <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 6, marginBottom: 20, ...fBody }}>
        {mode === "signup"
          ? (role === "coach" ? "Signing up as a Coach." : "Signing up as a Client.")
          : (role === "coach" ? "Signing in as a Coach." : "Signing in as a Client.")}{" "}
        <button onClick={() => nav("role-select")} style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, cursor: "pointer", fontSize: T.bodyLg}}>Change</button>
      </div>

       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "signup" && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>First name</div>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Josh" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Last name</div>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Whitfield" style={inputStyle} />
            </div>
          </div>
        )}

        <Field label="Email address" placeholder="you@email.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" placeholder="••••••••" type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((s) => !s)} value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === "signup" && (
          <div>
            <Field label="Confirm password" placeholder="••••••••" type={showConfirmPw ? "text" : "password"} rightIcon={showConfirmPw ? EyeOff : Eye} onRight={() => setShowConfirmPw((s) => !s)} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <div style={{ fontSize: T.captionLg, color: C.danger, marginTop: 6, ...fBody }}>Passwords don't match</div>
            )}
          </div>
        )}
      </div>

      {mode === "login" && (
        <div style={{ textAlign: "right", marginTop: 10 }}>
          <button onClick={() => nav("forgot-password", { role })} style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, fontSize: T.labelLg, cursor: "pointer", ...fBody }}>
            Forgot password?
          </button>
        </div>
      )}

      {mode === "signup" && (
        <button onClick={() => setAgree((v) => !v)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginTop: 14, padding: "6px 0" }}>
          <div style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${agree ? C.orange : C.border}`, background: agree ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {agree && <Check size={12} color={C.white} />}
          </div>
          <span style={{ fontSize: T.labelLg, color: C.jet, lineHeight: 1.5, ...fBody }}>
            I agree to the{" "}
            <span onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} style={{ color: C.orange, fontWeight: 600, textDecoration: "underline" }}>Terms & Conditions</span>
          </span>
        </button>
      )}

      <div style={{ marginTop: 18 }}>
        <Btn full disabled={!canSubmit} onClick={proceedAfterAuth}>{mode === "signup" ? "Create account" : "Sign in"}</Btn>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: T.label, color: C.slateLight, ...fBody }}>or</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {mode === "login" && biometric && (
        <div style={{ marginBottom: 10 }}>
          <Btn full variant="dark" icon={Fingerprint} onClick={() => { toast("Face ID recognised — welcome back"); nav(homeScreen); }}>
            Continue with Face ID
          </Btn>
        </div>
      )}
      <Btn full variant="dark" icon={AppleIcon}  onClick={() => { toast(mode === "signup" ? "Signed up with Apple" : "Signed in with Apple"); proceedAfterAuth(); }}>
        Continue with Apple
      </Btn>
      <div style={{ marginTop: 10 }}>
        <Btn full variant="outline"  onClick={() => { toast(mode === "signup" ? "Signed up with Google" : "Signed in with Google"); proceedAfterAuth(); }}>Continue with Google</Btn>
      </div>

      <div style={{ marginTop: "auto", textAlign: "center", paddingBottom: 22 }}>
        <button onClick={mode === "signup" ? () => setMode("login") : goCreateAccount} style={{ background: "none", border: "none", color: C.slate, fontSize: T.body, cursor: "pointer", ...fBody }}>
          {mode === "signup" ? "Already have an account? " : "New to CoachLink? "}
          <span style={{ color: C.orange, fontWeight: 600 }}>{mode === "signup" ? "Sign in" : "Create an account"}</span>
        </button>
      </div>

      <LegalSheet open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

/* =========================================================================
   FORGOT PASSWORD — three-step reset flow shared by both roles: email →
   6-digit code → new password. Prototype scope, so any well-formed input
   is accepted and simply advances the flow (mirrors login/signup here).
   ========================================================================= */
export function ScreenForgotPassword({ nav, params, role, toast }) {
  const effectiveRole = params?.role || role;
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const canSubmit = email.trim().length > 3 && email.includes("@");

  const submit = () => {
    if (!canSubmit || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast(`Reset code sent to ${email}`);
      nav("reset-code", { email, role: effectiveRole });
    }, 900);
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("auth", { mode: "login" })} />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <Lock size={22} color={C.orange} />
      </div>
      <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Forgot your password?</div>
      <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 6, marginBottom: 24, lineHeight: 1.55, ...fBody }}>
        Enter the email on your {effectiveRole === "coach" ? "coach" : "client"} account and we'll send you a 6-digit code to reset it.
      </div>
      <Field label="Email address" placeholder="you@email.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
      <div style={{ marginTop: 22 }}>
        <Btn full disabled={!canSubmit} loading={sending} loadingText="Sending…" onClick={submit}>Send reset code</Btn>
      </div>
      <div style={{ marginTop: "auto", textAlign: "center", paddingBottom: 22 }}>
        <button onClick={() => nav("auth", { mode: "login" })} style={{ background: "none", border: "none", color: C.slate, fontSize: T.body, cursor: "pointer", ...fBody }}>
          Remembered it? <span style={{ color: C.orange, fontWeight: 600 }}>Back to sign in</span>
        </button>
      </div>
    </div>
  );
}

export function ScreenResetCode({ nav, params, toast }) {
  const email = params?.email || "";
  const role = params?.role;
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = React.useRef([]);
  const code = digits.join("");
  const canSubmit = code.length === 6;

  const setDigit = (i, raw) => {
    const v = raw.replace(/[^0-9]/g, "").slice(-1);
    setDigits((d) => { const n = [...d]; n[i] = v; return n; });
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("forgot-password", { role })} />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <Smartphone size={22} color={C.orange} />
      </div>
      <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Enter the code</div>
      <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 6, marginBottom: 26, lineHeight: 1.55, ...fBody }}>
        We sent a 6-digit code to <span style={{ color: C.jet, fontWeight: 600 }}>{email || "your email"}</span>.
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            style={{
              width: 44, height: 54, textAlign: "center", fontSize: T.headingLg, fontWeight: 700,
              border: `1.5px solid ${d ? C.orange : C.border}`, borderRadius: 13, outline: "none",
              color: C.jet, boxSizing: "border-box", ...fDisplay,
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Btn full disabled={!canSubmit} onClick={() => nav("reset-password", { email, role })}>Verify code</Btn>
      </div>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button onClick={() => toast(`Code resent to ${email || "your email"}`)} style={{ background: "none", border: "none", color: C.slate, fontSize: T.body, cursor: "pointer", ...fBody }}>
          Didn't get it? <span style={{ color: C.orange, fontWeight: 600 }}>Resend code</span>
        </button>
      </div>
    </div>
  );
}

export function ScreenResetPassword({ nav, params, toast }) {
  const role = params?.role;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const match = password.length > 0 && password === confirm;
  const canSubmit = password.length >= 6 && match;

  const submit = () => {
    if (!canSubmit) return;
    toast("Password reset — sign in with your new password");
    nav("auth", { mode: "login" });
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("reset-code", { role })} />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <Check size={22} color={C.orange} />
      </div>
      <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Set a new password</div>
      <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 6, marginBottom: 22, lineHeight: 1.55, ...fBody }}>
        Choose a new password for your account.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="New password" placeholder="••••••••" type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((s) => !s)} value={password} onChange={(e) => setPassword(e.target.value)} />
        <div>
          <Field label="Confirm new password" placeholder="••••••••" type={showConfirm ? "text" : "password"} rightIcon={showConfirm ? EyeOff : Eye} onRight={() => setShowConfirm((s) => !s)} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {confirm.length > 0 && !match && (
            <div style={{ fontSize: T.captionLg, color: C.danger, marginTop: 6, ...fBody }}>Passwords don't match</div>
          )}
          {password.length > 0 && password.length < 6 && (
            <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 6, ...fBody }}>Use at least 6 characters</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <Btn full disabled={!canSubmit} onClick={submit}>Reset password</Btn>
      </div>
    </div>
  );
}

export function ScreenCoachRegister({ nav, toast, updateCoachOnboarding }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canContinue = firstName.trim() && lastName.trim() && email.trim() && mobile.trim()
    && password.length >= 6 && passwordsMatch && agreeTerms;

  const proceed = () => {
    updateCoachOnboarding({ firstName, lastName, email, mobile, displayName: `${firstName} ${lastName}`.trim() });
    nav("enable-biometric", { next: "coach-info" });
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("role-select")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <StepProgress step={1} total={4} label="Account" />

        <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Create your coach account</div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 8, marginBottom: 20, lineHeight: 1.55, ...fBody }}>
          Join thousands of coaches growing their business through secure bookings, payments and client management.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>First name</div>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Josh" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Last name</div>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Whitfield" style={inputStyle} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Email address</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <Mail size={15} color={C.slateLight} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Mobile number</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <Smartphone size={15} color={C.slateLight} />
              <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9+\s]/g, ""))} placeholder="04XX XXX XXX" inputMode="tel" style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Password</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="At least 6 characters" style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }} />
              <button onClick={() => setShowPw((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {showPw ? <EyeOff size={15} color={C.slateLight} /> : <Eye size={15} color={C.slateLight} />}
              </button>
            </div>
          </div>

          <div>
            <div style={labelStyle}>Confirm password</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${confirmPassword && !passwordsMatch ? C.dangerBorderSoft : C.border}`, borderRadius: 13, padding: "11px 13px" }}>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPw ? "text" : "password"} placeholder="Re-enter your password" style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }} />
              <button onClick={() => setShowConfirmPw((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {showConfirmPw ? <EyeOff size={15} color={C.slateLight} /> : <Eye size={15} color={C.slateLight} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <div style={{ fontSize: T.caption, color: C.danger, marginTop: 5, ...fBody }}>Passwords don't match.</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={() => setAgreeTerms((v) => !v)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "6px 0" }}>
            <div style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${agreeTerms ? C.orange : C.border}`, background: agreeTerms ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {agreeTerms && <Check size={12} color={C.white} />}
            </div>
            <span style={{ fontSize: T.labelLg, color: C.jet, ...fBody }}>
              I agree to the{" "}
              <span onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} style={{ color: C.orange, fontWeight: 600, textDecoration: "underline" }}>Terms & Conditions</span>
            </span>
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <Btn full disabled={!canContinue} onClick={proceed}>Continue</Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: T.label, color: C.slateLight, ...fBody }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <Btn full variant="dark" icon={AppleIcon} onClick={() => { toast("Signed up with Apple"); updateCoachOnboarding({ displayName: "New Coach" }); nav("enable-biometric", { next: "coach-info" }); }}>
          Continue with Apple
        </Btn>
        <div style={{ marginTop: 10 }}>
          <Btn full variant="outline" onClick={() => { toast("Signed up with Google"); updateCoachOnboarding({ displayName: "New Coach" }); nav("enable-biometric", { next: "coach-info" }); }}>
            Continue with Google
          </Btn>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, paddingBottom: 8 }}>
          <button onClick={() => nav("auth", { mode: "login" })} style={{ background: "none", border: "none", color: C.slate, fontSize: T.body, cursor: "pointer", ...fBody }}>
            Already have an account? <span style={{ color: C.orange, fontWeight: 600 }}>Login</span>
          </button>
        </div>
      </div>

      <LegalSheet open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

export function ScreenEnableBiometric({ nav, params, toast, biometric, setBiometric, role }) {
  const next = params?.next || (role === "coach" ? "coach-info" : "about-you-profile");

  const enable = () => {
    setBiometric(true);
    toast("Face ID enabled");
    // Client UI: enabling Face ID skips the rest of onboarding (profile details
    // etc.) and goes straight to the setup success screen. Coaches still need
    // their onboarding details, so they continue to the normal next step.
    if (role === "coach") nav(next);
    else nav("client-setup-complete");
  };
  const skip = () => nav(next);

  return (
    <div style={{ padding: "24px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: 24, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
          <ScanFace size={38} color={C.orange} />
        </div>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>Set up Face ID</div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 10, lineHeight: 1.6, maxWidth: 280, ...fBody }}>
          Your account is ready. Turn on Face ID to sign in instantly next time — no password needed.
        </div>
      </div>
      <div style={{ paddingBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn full variant="dark" icon={Fingerprint} onClick={enable}>Enable Face ID</Btn>
        <Btn full variant="ghost" onClick={skip}>Not now</Btn>
      </div>
    </div>
  );
}

export function ScreenCoachInfo({ nav, toast, coachOnboarding, updateCoachOnboarding }) {
  const [photo, setPhoto] = useState(coachOnboarding.photo || null);
  const [displayName, setDisplayName] = useState(coachOnboarding.displayName || "");
  const [bio, setBio] = useState(coachOnboarding.bio || "");
  const [yearsExperience, setYearsExperience] = useState(coachOnboarding.yearsExperience || "");
  const [gender, setGender] = useState(coachOnboarding.gender || "");
  const [languages, setLanguages] = useState(coachOnboarding.languages || []);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState(coachOnboarding.location || null);

  const photoInputRef = React.useRef(null);
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
    e.target.value = "";
  };

  const experienceOptions = [...Array.from({ length: 29 }, (_, i) => `${i + 1} year${i === 0 ? "" : "s"}`), "30+ years"];

  const filteredSuburbs = AU_SUBURBS.filter((s) =>
    locationQuery.length > 0 && (
      s.suburb.toLowerCase().includes(locationQuery.toLowerCase()) ||
      s.postcode.includes(locationQuery)
    )
  ).slice(0, 6);

  const pickLocation = (s) => { setLocation(s); setLocationQuery(""); setLocationOpen(false); };
  const useCurrentLocation = () => {
    setLocation({ suburb: "Sydney", state: "NSW", postcode: "2000" });
    toast("Location detected");
  };

  const complete = displayName.trim() && bio.trim() && yearsExperience && languages.length > 0 && location;

  const proceed = () => {
    updateCoachOnboarding({ photo, displayName, bio, yearsExperience, gender, languages, location });
    nav("coach-expertise");
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("coach-register")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <StepProgress step={2} total={4} label="Coach info" />

        <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Coach information</div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 8, marginBottom: 20, lineHeight: 1.55, ...fBody }}>
          This is what clients see first — your photo, name and story help them decide if you're the right coach for them.
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            {photo ? (
              <img src={photo} alt="Profile" style={{ width: 84, height: 84, borderRadius: 84, objectFit: "cover", display: "block" }} />
            ) : (
              <Avatar name={displayName || "New Coach"} size={84} />
            )}
            <button onClick={() => photoInputRef.current?.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: 99, background: C.orange, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={13} color={C.white} />
            </button>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
          <div style={{ fontSize: T.captionLg, color: C.slateLight, marginTop: 8, ...fBody }}>Tap to upload a profile photo</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={labelStyle}>Display name</div>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How clients will see you" style={inputStyle} />
          </div>

          <div>
            <div style={labelStyle}>Bio</div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Write a short introduction about your coaching background, philosophy, and what athletes can expect from your sessions"
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          <SelectField label="Years of coaching experience" value={yearsExperience} onChange={setYearsExperience} options={experienceOptions} placeholder="Select years of experience" />

          <SelectField label="Gender (optional)" value={gender} onChange={setGender} options={GENDER_OPTIONS} placeholder="Prefer not to say" />

          <div>
            <div style={labelStyle}>Languages spoken</div>
            <SearchMultiSelect options={LANGUAGE_OPTIONS} value={languages} onChange={setLanguages} placeholder="Search languages…" />
          </div>

          <div>
            <div style={labelStyle}>Location</div>
            {location ? (
              <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={16} color={C.orange} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{location.suburb}, {location.state}</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Postcode {location.postcode}</div>
                </div>
                <button onClick={() => setLocation(null)} style={{ background: "none", border: "none", color: C.orange, fontSize: T.label, fontWeight: 600, cursor: "pointer", ...fBody }}>Change</button>
              </div>
            ) : (
              <>
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px" }}>
                    <Search size={15} color={C.slateLight} />
                    <input
                      value={locationQuery}
                      onChange={(e) => { setLocationQuery(e.target.value); setLocationOpen(true); }}
                      onFocus={() => setLocationOpen(true)}
                      onBlur={() => setTimeout(() => setLocationOpen(false), 150)}
                      placeholder="Search suburb, city or postcode…"
                      style={{ border: "none", outline: "none", flex: 1, fontSize: T.bodyLg, minWidth: 0, ...fBody }}
                    />
                  </div>
                  {locationOpen && filteredSuburbs.length > 0 && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, boxShadow: "0 10px 24px rgba(0,0,0,.10)", zIndex: 30, maxHeight: 190, overflowY: "auto" }}>
                      {filteredSuburbs.map((s) => (
                        <button
                          key={`${s.suburb}-${s.postcode}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickLocation(s)}
                          style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: T.body, color: C.jet, ...fBody }}
                        >
                          <span>{s.suburb}, {s.state}</span>
                          <span style={{ color: C.slateLight }}>{s.postcode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={useCurrentLocation} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.orange, fontSize: T.labelLg, fontWeight: 600, marginTop: 8, padding: 0, ...fBody }}>
                  <LocateFixed size={14} /> Use current location
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn full disabled={!complete} onClick={proceed}>Continue</Btn>
        </div>
      </div>
    </div>
  );
}

export function ScreenCoachExpertise({ nav, coachOnboarding, updateCoachOnboarding }) {
  const [primarySports, setPrimarySports] = useState(coachOnboarding.primarySports || []);
  const [secondarySports, setSecondarySports] = useState(coachOnboarding.secondarySports || []);
  const [categories, setCategories] = useState(coachOnboarding.coachingCategories || []);
  const [skillLevels, setSkillLevels] = useState(coachOnboarding.skillLevels || []);
  const [ageGroups, setAgeGroups] = useState(coachOnboarding.ageGroups || []);
  const [experienceLevel, setExperienceLevel] = useState(coachOnboarding.coachingExperienceLevel || "");
  const [formats, setFormats] = useState(coachOnboarding.coachingFormats || []);

  const toggleIn = (setter, arr, v) => setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const complete = primarySports.length > 0 && categories.length > 0 && skillLevels.length > 0
    && ageGroups.length > 0 && !!experienceLevel && formats.length > 0;

  const proceed = () => {
    updateCoachOnboarding({
      primarySports, secondarySports, coachingCategories: categories, skillLevels, ageGroups,
      coachingExperienceLevel: experienceLevel, coachingFormats: formats,
    });
    nav("verification");
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("coach-info")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <StepProgress step={3} total={4} label="Expertise" />

        <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Coaching expertise</div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 8, marginBottom: 20, lineHeight: 1.55, ...fBody }}>
          Help clients find you by sharing the sports, formats and skill levels you coach.
        </div>

        <div style={{ marginBottom: 4, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Primary sport</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 8, ...fBody }}>Select the main sport or discipline you specialise in.</div>
        <SearchMultiSelect options={SPORT_OPTIONS_FULL} value={primarySports} onChange={setPrimarySports} placeholder="Search sports…" />

        <div style={{ marginTop: 20, marginBottom: 4, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Secondary sports (optional)</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 8, ...fBody }}>Add any additional sports or disciplines you coach.</div>
        <SearchMultiSelect options={SPORT_OPTIONS_FULL.filter((s) => !primarySports.includes(s))} value={secondarySports} onChange={setSecondarySports} placeholder="Search sports…" />

        <div style={{ marginTop: 22, marginBottom: 2, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Coaching categories</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 4, ...fBody }}>Select all coaching services you provide.</div>
        <div>
          {COACHING_CATEGORY_OPTIONS.map((c) => (
            <CheckboxRow key={c} label={c} checked={categories.includes(c)} onClick={() => toggleIn(setCategories, categories, c)} />
          ))}
        </div>

        <div style={{ marginTop: 18, marginBottom: 2, fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Athlete skill levels</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 4, ...fBody }}>Select the experience levels you coach.</div>
        <div>
          {SKILL_LEVEL_OPTIONS.map((s) => (
            <CheckboxRow key={s} label={s} checked={skillLevels.includes(s)} onClick={() => toggleIn(setSkillLevels, skillLevels, s)} />
          ))}
        </div>

        <div style={{ marginTop: 18, marginBottom: 2, fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Age groups</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 4, ...fBody }}>Select the age groups you work with.</div>
        <div>
          {AGE_GROUP_OPTIONS.map((a) => (
            <CheckboxRow key={a} label={a} checked={ageGroups.includes(a)} onClick={() => toggleIn(setAgeGroups, ageGroups, a)} />
          ))}
        </div>

        <div style={{ marginTop: 18, marginBottom: 2, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Coaching experience</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 4, ...fBody }}>Specify your level of coaching experience.</div>
        <div>
          {COACHING_EXPERIENCE_LEVELS.map((l) => (
            <RadioRow key={l} label={l} selected={experienceLevel === l} onClick={() => setExperienceLevel(l)} />
          ))}
        </div>

        <div style={{ marginTop: 18, marginBottom: 2, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Preferred coaching format</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 4, ...fBody }}>Select how you deliver coaching sessions.</div>
        <div style={{ marginBottom: 8 }}>
          {COACHING_FORMAT_OPTIONS.map((f) => (
            <CheckboxRow key={f} label={f} checked={formats.includes(f)} onClick={() => toggleIn(setFormats, formats, f)} />
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <Btn full disabled={!complete} onClick={proceed}>Continue</Btn>
        </div>
      </div>
    </div>
  );
}

let qualIdCounter = 1;
function emptyQualification() {
  return { id: "q" + qualIdCounter++, type: "", name: "", uploaded: false };
}

export function ScreenVerification({ nav, toast, submitVerification, coachOnboarding }) {
  const [idType, setIdType] = useState("");
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [worksWithMinors, setWorksWithMinors] = useState(false);
  const [wwccNumber, setWwccNumber] = useState("");
  const [wwccExpiry, setWwccExpiry] = useState("");
  const [wwccUploaded, setWwccUploaded] = useState(false);
  const [qualifications, setQualifications] = useState([emptyQualification()]);

  const updateQual = (id, patch) => setQualifications((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const addQualification = () => setQualifications((qs) => [...qs, emptyQualification()]);
  const removeQualification = (id) => setQualifications((qs) => qs.filter((q) => q.id !== id));

  const wwccOk = !worksWithMinors || (wwccNumber.trim() && wwccExpiry && wwccUploaded);
  const qualsOk = qualifications.length > 0 && qualifications.every((q) => q.type && q.name.trim() && q.uploaded);
  const allDone = !!idType && idUploaded && selfieUploaded && wwccOk && qualsOk;

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("coach-expertise")} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <StepProgress step={4} total={4} label="Verification" />

        <div style={{ fontSize: T.displayLg, fontWeight: 600, color: C.jet, ...fDisplay }}>Get verified</div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 8, marginBottom: 18, lineHeight: 1.55, ...fBody }}>
          Verification builds trust with clients and unlocks bookings. Most reviews complete within 2 business days.
        </div>

        <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 8, ...fDisplay }}>Government-issued photo ID</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {ID_TYPE_OPTIONS.map((t) => (
            <Chip key={t} active={idType === t} onClick={() => { setIdType(t); setIdUploaded(false); }}>{t}</Chip>
          ))}
        </div>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CreditCard size={16} color={C.orange} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: T.bodyLg, color: C.jet, ...fBody }}>{idType || "Select an ID type above"}</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>Front & back, clear and unedited</div>
              </div>
            </div>
            {idUploaded ? <Badge tone="success" icon={CheckCircle2}>Uploaded</Badge> :
              <Btn size="sm" variant="secondary" icon={Upload} disabled={!idType} onClick={() => setIdUploaded(true)}>Upload</Btn>}
          </div>
        </Card>

        <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 8, ...fDisplay }}>Selfie verification</div>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ScanFace size={16} color={C.orange} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: T.bodyLg, color: C.jet, ...fBody }}>Take or upload a selfie</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>We'll match it against your ID</div>
              </div>
            </div>
            {selfieUploaded ? <Badge tone="success" icon={CheckCircle2}>Uploaded</Badge> :
              <Btn size="sm" variant="secondary" icon={Camera} onClick={() => setSelfieUploaded(true)}>Upload</Btn>}
          </div>
        </Card>

        <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, marginBottom: 4, ...fDisplay }}>Working with Children Check (WWCC)</div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 8, ...fBody }}>Required if you coach athletes under 18.</div>
        <Card style={{ marginBottom: worksWithMinors ? 12 : 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>Do you coach athletes under 18 years of age?</div>
            <Toggle on={worksWithMinors} onClick={() => setWorksWithMinors((v) => !v)} />
          </div>
        </Card>

        {worksWithMinors && (
          <Card style={{ marginBottom: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={labelStyle}>WWCC number</div>
              <input value={wwccNumber} onChange={(e) => setWwccNumber(e.target.value)} placeholder="e.g. WWC1234567E" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={labelStyle}>Expiry date</div>
              <input type="date" value={wwccExpiry} onChange={(e) => setWwccExpiry(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: T.labelLg, color: C.slate, ...fBody }}>WWCC certificate</div>
              {wwccUploaded ? <Badge tone="success" icon={CheckCircle2}>Uploaded</Badge> :
                <Btn size="sm" variant="secondary" icon={Upload} onClick={() => setWwccUploaded(true)}>Upload</Btn>}
            </div>
          </Card>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Coaching qualifications</div>
        </div>
        <div style={{ fontSize: T.captionLg, color: C.slate, marginBottom: 10, ...fBody }}>Add your coaching accreditations, First Aid, CPR or sports-specific certifications.</div>

        {qualifications.map((q, i) => (
          <Card key={q.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: T.labelLg, fontWeight: 700, color: C.slate, ...fBody }}>Qualification {i + 1}</div>
              {qualifications.length > 1 && (
                <button onClick={() => removeQualification(q.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: C.slateLight, fontSize: T.captionLg, ...fBody }}>
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>Certificate type</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CERTIFICATION_TYPE_OPTIONS.map((t) => (
                  <Chip key={t} active={q.type === t} onClick={() => updateQual(q.id, { type: t })}>{t}</Chip>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>Qualification / certificate name</div>
              <input value={q.name} onChange={(e) => updateQual(q.id, { name: e.target.value })} placeholder="e.g. Tennis Australia Club Professional" style={inputStyle} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>PDF, JPG or PNG · Max 10MB</div>
              {q.uploaded ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge tone="success" icon={FileCheck2}>Uploaded</Badge>
                  <Btn size="sm" variant="outline" onClick={() => updateQual(q.id, { uploaded: false })}>Replace</Btn>
                </div>
              ) : (
                <Btn size="sm" variant="secondary" icon={Upload} onClick={() => updateQual(q.id, { uploaded: true })}>Upload</Btn>
              )}
            </div>
          </Card>
        ))}
        <Btn variant="outline" size="sm" icon={Plus} full onClick={addQualification}>Add another qualification</Btn>

        <div style={{ marginTop: 22, paddingBottom: 8 }}>
          <Btn full disabled={!allDone} onClick={() => {
            const documents = [
              { key: "id", label: `${idType} — Identity document`, detail: "Uploaded" },
              { key: "selfie", label: "Selfie verification", detail: "Uploaded" },
              ...(worksWithMinors ? [{ key: "wwcc", label: "Working with Children Check", detail: `${wwccNumber} — expires ${wwccExpiry}` }] : []),
              ...qualifications.map((q) => ({ key: q.id, label: `${q.type} — ${q.name}`, detail: "Certificate uploaded" })),
            ];
            submitVerification({ documents, worksWithMinors });
            toast("Documents submitted for review");
            nav("verification-pending");
          }}>
            Submit for review
          </Btn>
          {!allDone && (
            <div style={{ fontSize: T.caption, color: C.slateLight, textAlign: "center", marginTop: 8, ...fBody }}>
              Complete your ID, selfie{worksWithMinors ? ", WWCC" : ""} and qualification details to submit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScreenVerificationPending({ nav, verificationStatus, setReachedDashboardAfterVerification }) {
  const approved = verificationStatus === "approved";
  const goToSetup = () => {
    if (approved && setReachedDashboardAfterVerification) setReachedDashboardAfterVerification(true);
    nav("coach-services-setup");
  };
  return (
    <div style={{ padding: "28px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: approved ? C.successTint : C.orangeTint,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          {approved ? <CheckCircle2 size={28} color={C.success} /> : <ClipboardList size={28} color={C.orange} />}
        </div>
        <div style={{ fontSize: T.headingLg, fontWeight: 600, color: C.jet, ...fDisplay }}>
          {approved ? "Your application has been successfully verified" : "Verification submitted"}
        </div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 8, lineHeight: 1.6, maxWidth: 300, marginLeft: "auto", marginRight: "auto", ...fBody }}>
          {approved
            ? "An admin has reviewed and approved your documents. You now have full access to the Coach dashboard and can start accepting bookings."
            : "Your documents have been submitted successfully and are now awaiting review by a CoachLink administrator. This usually takes up to 2 business days — we'll notify you as soon as a decision is made."}
        </div>
        {!approved && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 18 }}>
            <Badge tone="orange" icon={Clock}>Pending review</Badge>
          </div>
        )}
        {approved && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 18 }}>
            <Badge tone="success" icon={CheckCircle2}>Verified</Badge>
          </div>
        )}
      </div>

      <div style={{ marginTop: "auto", padding: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn full disabled={!approved} onClick={goToSetup}>Proceed to setup</Btn>
        {!approved && (
          <div style={{ fontSize: T.captionLg, color: C.slateLight, textAlign: "center", lineHeight: 1.5, ...fBody }}>
            This unlocks once an admin approves your application.
          </div>
        )}
        <Btn full variant="ghost" onClick={() => nav("support")}>Contact support</Btn>
      </div>
    </div>
  );
}

export function ScreenAdminLogin({ nav, toast }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", padding: "40px 24px 28px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img src={LOGO_WHITE_SRC} alt="CoachLink" style={{ width: 120, height: "auto", marginBottom: 20 }} />
          <div style={{ fontSize: T.body, color: C.onDarkMuted, marginTop: 4, ...fBody }}>Sign in with your CoachLink admin credentials</div>
        </div>

<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  <div>
    <div
      style={{
        fontSize: T.label,
        fontWeight: 600,
        color: C.jet,
        marginBottom: 6,
        ...fBody,
      }}
    >
      Email
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: `1.5px solid ${C.border}`,
        background: C.white,
        borderRadius: 13,
        padding: "11px 13px",
      }}
    >
      <Mail size={16} color={C.slate} />

      <input
        type="email"
        placeholder="you@coachlink.com"
        style={{
          border: "none",
          outline: "none",
          flex: 1,
          fontSize: T.subtitle,
          background: "transparent",
          color: C.jet,
          ...fBody,
        }}
      />
    </div>
  </div>

  <div>
    <div
      style={{
        fontSize: T.label,
        fontWeight: 600,
        color: C.jet,
        marginBottom: 6,
        ...fBody,
      }}
    >
      Password
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: `1.5px solid ${C.border}`,
        background: C.white,
        borderRadius: 13,
        padding: "11px 13px",
      }}
    >
      <Lock size={16} color={C.slate} />

      <input
        type={showPw ? "text" : "password"}
        placeholder="••••••••"
        style={{
          border: "none",
          outline: "none",
          flex: 1,
          fontSize: T.subtitle,
          background: "transparent",
          color: C.jet,
          ...fBody,
        }}
      />

      <button
        onClick={() => setShowPw((s) => !s)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          padding: 2,
        }}
      >
        {showPw ? (
          <EyeOff size={16} color={C.slate} />
        ) : (
          <Eye size={16} color={C.slate} />
        )}
      </button>
    </div>
  </div>

  <div style={{ textAlign: "right" }}>
    <button
      style={{
        background: "none",
        border: "none",
        color: C.orange,
        fontSize: T.labelLg,
        fontWeight: 600,
        cursor: "pointer",
        ...fBody,
      }}
    >
      Forgot password?
    </button>
  </div>
</div>

        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Welcome back, Admin"); nav("admin-home"); }}>Log in</Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.onDarkDivider }} />
          <span style={{ fontSize: T.captionLg, color: C.onDarkFaint, ...fBody }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.onDarkDivider }} />
        </div>

        <Btn full variant="secondary" icon={Fingerprint} onClick={() => { toast("Face ID recognised — welcome back"); nav("admin-home"); }}>
          Continue with Face ID
        </Btn>
      </div>

      <div style={{ textAlign: "center", fontSize: T.captionLg, color: C.onDarkFaint, lineHeight: 1.6, ...fBody }}>
        Admin access is restricted to authorised CoachLink staff and is logged for audit purposes.
      </div>
    </div>
  );
}
