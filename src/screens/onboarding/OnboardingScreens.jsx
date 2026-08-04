import React, { useState } from "react";
import {
  ArrowRight, Search, Users, Mail, Eye, EyeOff, Fingerprint, Check,
  Upload, CheckCircle2, ClipboardList, Clock, Lock,
} from "lucide-react";
import { C, fDisplay, fBody, LOGO_WHITE_SRC } from "../../theme/theme";
import { Btn, Card, Badge, Toggle, TopBar, Field, BottomSheet } from "../../components/ui/Primitives";
import { LogoMark } from "../../components/ui/Primitives";

function GoogleGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.04 12.27c0-.82-.07-1.42-.22-2.05H12.24v3.72h6.19c-.12 1.02-.8 2.56-2.31 3.6l-.02.14 3.35 2.58.23.02c2.14-1.96 3.36-4.85 3.36-8.01z" />
      <path fill="#34A853" d="M12.24 23.5c3.04 0 5.6-1 7.46-2.72l-3.56-2.74c-.95.66-2.23 1.13-3.9 1.13-2.98 0-5.5-1.96-6.4-4.67l-.13.01-3.48 2.68-.05.13c1.85 3.66 5.65 6.18 10.06 6.18z" />
      <path fill="#FBBC05" d="M5.84 14.5a6.9 6.9 0 0 1-.38-2.25c0-.78.14-1.54.37-2.25l-.01-.15-3.53-2.72-.11.05A11.2 11.2 0 0 0 1 12.25c0 1.8.44 3.51 1.19 5.02l3.65-2.77z" />
      <path fill="#EA4335" d="M12.24 5.33c2.12 0 3.55.9 4.37 1.66l3.19-3.08C17.83 2.02 15.28 1 12.24 1 7.83 1 4.03 3.52 2.18 7.18l3.64 2.82c.92-2.71 3.44-4.67 6.42-4.67z" />
    </svg>
  );
}

function FacebookGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fill={C.white}
        d="M15.5 8.5h-2v-1.7c0-.64.42-.8.72-.8h1.24V3.5l-1.9-.01C11.4 3.49 10.5 5 10.5 6.9V8.5H9v3h1.5v8h3v-8h1.87l.13-3z"
      />
    </svg>
  );
}

const TERMS_POINTS = [
  "We collect your location to show nearby coaches and enable travel-radius search.",
  "Payment details are processed by our PCI-compliant payment partner — CoachLink never stores full card numbers.",
  "If you're booking for someone under 18, a parent or guardian must provide consent before the session is confirmed.",
  "Coaches working with minors must hold a valid Working with Children Check, verified before their profile goes live.",
  "You can request a full export or deletion of your data at any time from Account Settings.",
];

const PRIVACY_POINTS = [
  "We only use your personal information to match you with coaches and run your bookings safely.",
  "Your exact location is never shown to other users — only your suburb and approximate distance.",
  "We never sell your personal information to third parties.",
  "You can review, download or delete the data we hold about you at any time from Account Settings.",
];

function LegalSheet({ open, onClose, title, points }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} heightPct={60}>
      <Badge tone="neutral">Version 2.1 · Updated Jun 2026</Badge>
      <div style={{ marginTop: 14, fontSize: 13, color: C.slate, lineHeight: 1.7, ...fBody }}>
        {points.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Check size={14} color={C.orange} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ========================================================================
   ONBOARDING / AUTH SCREENS
   ========================================================================= */
export function ScreenSplash({ nav }) {
  return (
    <div style={{ height: "100%", background: C.jet, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
      <div style={{ animation: "clFadeUp .5s ease" }}>
        <img src={LOGO_WHITE_SRC} alt="CoachLink" style={{ width: 120, height: "auto" }} />
      </div>
      
      <div style={{ color: "#9CA0AC", fontSize: 14, marginTop: 22, lineHeight: 1.5, ...fBody }}>
        Find a coach you trust, or build your coaching business — all in one place.
      </div>

      <div style={{ marginTop: 40, width: "100%", display: "flex", gap: 10 }}>
        {/* Primary CTA */}
        <div style={{ flex: 1 }}>
          <Btn full variant="primary" onClick={() => nav("role-select")}>Sign up</Btn>
        </div>

        {/* Secondary CTA */}
        <div style={{ flex: 1 }}>
          <Btn full variant="secondary" onClick={() => nav("auth", { mode: "login" })}>Log in</Btn>
        </div>
      </div>
    </div>
  );
}

export function ScreenRoleSelect({ nav, setRole }) {
  const Option = ({ role, title, body, icon: Icon }) => (
    <button onClick={() => { setRole(role); nav("auth", { mode: "signup" }); }}
      style={{ width: "100%", textAlign: "left", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: 16, display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={C.orange} />
      </div>
      <div>
        <div style={{ fontWeight: 600, color: C.jet, fontSize: 15.5, marginBottom: 3, ...fDisplay }}>{title}</div>
        <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.5, ...fBody }}>{body}</div>
      </div>
    </button>
  );
  return (
    <div style={{ padding: "24px 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <LogoMark size={34} />
      <div style={{ fontSize: 24, fontWeight: 600, color: C.jet, marginTop: 22, ...fDisplay }}>What brings you<br />to CoachLink?</div>
      <div style={{ fontSize: 13.5, color: C.slate, marginTop: 6, marginBottom: 22, ...fBody }}>You can add a coaching profile later from the same account.</div>
      <Option role="client" icon={Search} title="Find a coach" body="Search, book and pay for sessions with verified coaches near you." />
      <Option role="coach" icon={Users} title="Coach others" body="List your services, manage bookings and get paid automatically." />
      <div style={{ marginTop: "auto", textAlign: "center" }}>
        <button onClick={() => nav("auth", { mode: "login" })} style={{ background: "none", border: "none", color: C.slate, fontSize: 13.5, cursor: "pointer", ...fBody }}>
          Already have an account? <span style={{ color: C.orange, fontWeight: 600 }}>Log in</span>
        </button>
      </div>
    </div>
  );
}

export function ScreenAuth({ nav, params, role, toast }) {
  const [mode, setMode] = useState(params?.mode || "signup");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [sheet, setSheet] = useState(null); // null | "terms" | "privacy"

  const proceedAfterAuth = () => {
    if (mode === "login") { nav(role === "coach" ? "coach-dashboard" : "client-home"); return; }
    if (role === "coach") nav("verification");
    else nav("about-you-profile");
  };

  const canSubmit = mode === "login" || agree;

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="" onBack={() => nav("role-select")} />
      <div style={{ fontSize: 24, fontWeight: 600, color: C.jet, ...fDisplay }}>{mode === "signup" ? "Create your account" : "Welcome back"}</div>
      <div style={{ fontSize: 13.5, color: C.slate, marginTop: 6, marginBottom: 20, ...fBody }}>
        {role === "coach" ? "Signing up as a Coach." : "Signing up as a Client."} <button onClick={() => nav("role-select")} style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, cursor: "pointer", fontSize: 13.5 }}>Change</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Full name" placeholder="Sarah Lin" show={mode === "signup"} />
        <Field label="Email" placeholder="you@email.com" icon={Mail} />
        <Field label="Password" placeholder="••••••••" type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((s) => !s)} />
      </div>

      {mode === "signup" && (
        <button onClick={() => setAgree(!agree)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginTop: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${agree ? C.orange : C.border}`, background: agree ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {agree && <Check size={13} color={C.white} />}
          </div>
          <span style={{ fontSize: 12.5, color: C.jet, lineHeight: 1.5, ...fBody }}>
            I agree to the{" "}
            <span onClick={(e) => { e.stopPropagation(); setSheet("terms"); }} style={{ color: C.orange, fontWeight: 600, textDecoration: "underline" }}>Terms &amp; Conditions</span>
            {" "}and{" "}
            <span onClick={(e) => { e.stopPropagation(); setSheet("privacy"); }} style={{ color: C.orange, fontWeight: 600, textDecoration: "underline" }}>Privacy Policy</span>
            {" "}in the sign up
          </span>
        </button>
      )}

      <div style={{ marginTop: 18 }}>
        <Btn full disabled={!canSubmit} onClick={proceedAfterAuth}>{mode === "signup" ? "Create account" : "Log in"}</Btn>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 12, color: C.slateLight, ...fBody }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => { toast("Face ID recognised — welcome back"); nav(role === "coach" ? "coach-dashboard" : "client-home"); }}
          aria-label="Continue with Face ID"
          style={{ width: 52, height: 52, borderRadius: 16, background: C.jet, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <Fingerprint size={22} color={C.white} />
        </button>
        <button
          onClick={() => { toast("Signed in with Google"); proceedAfterAuth(); }}
          aria-label="Continue with Google"
          style={{ width: 52, height: 52, borderRadius: 16, background: C.white, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <GoogleGlyph size={20} />
        </button>
        <button
          onClick={() => { toast("Signed in with Facebook"); proceedAfterAuth(); }}
          aria-label="Continue with Facebook"
          style={{ width: 52, height: 52, borderRadius: 16, background: "#1877F2", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <FacebookGlyph size={20} />
        </button>
      </div>

      <div style={{ marginTop: "auto", textAlign: "center", paddingBottom: 22 }}>
        <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} style={{ background: "none", border: "none", color: C.slate, fontSize: 13, cursor: "pointer", ...fBody }}>
          {mode === "signup" ? "Already have an account? " : "New to CoachLink? "}
          <span style={{ color: C.orange, fontWeight: 600 }}>{mode === "signup" ? "Log in" : "Sign up"}</span>
        </button>
      </div>

      <LegalSheet open={sheet === "terms"} onClose={() => setSheet(null)} title="Terms & Conditions" points={TERMS_POINTS} />
      <LegalSheet open={sheet === "privacy"} onClose={() => setSheet(null)} title="Privacy Policy" points={PRIVACY_POINTS} />
    </div>
  );
}

export function ScreenVerification({ nav, toast, submitVerification }) {
  const [worksWithMinors, setWorksWithMinors] = useState(true);
  const [docs, setDocs] = useState({ id: false, wwcc: false, quals: false });
  const allDone = docs.id && (!worksWithMinors || docs.wwcc) && docs.quals;
  const Row = ({ k, title, body }) => (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.jet, ...fDisplay }}>{title}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>{body}</div>
        </div>
        {docs[k] ? <Badge tone="success" icon={CheckCircle2}>Uploaded</Badge> :
          <Btn size="sm" variant="secondary" icon={Upload} onClick={() => setDocs((d) => ({ ...d, [k]: true }))}>Upload</Btn>}
      </div>
    </Card>
  );
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Get verified" />
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 16, ...fBody }}>
        Verification builds trust with clients and unlocks bookings. Most reviews complete within 2 business days.
      </div>
      <Row k="id" title="Identity document" body="Driver's licence or passport" />
      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>I coach clients under 18</div>
          <Toggle on={worksWithMinors} onClick={() => setWorksWithMinors((v) => !v)} />
        </div>
      </Card>
      {worksWithMinors && <Row k="wwcc" title="Working with Children Check" body="Required to coach minors — state/territory issued" />}
      <Row k="quals" title="Coaching qualifications" body="Certifications relevant to your sport (optional but recommended)" />

      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full disabled={!allDone} onClick={() => {
          const documents = [
            { key: "id", label: "Identity document", detail: "Driver's licence or passport — uploaded" },
            ...(worksWithMinors ? [{ key: "wwcc", label: "Working with Children Check", detail: "State/territory issued — uploaded" }] : []),
            { key: "quals", label: "Coaching qualifications", detail: "Certifications uploaded" },
          ];
          submitVerification({ documents, worksWithMinors });
          toast("Documents submitted for review");
          nav("verification-pending");
        }}>
          Submit for review
        </Btn>
      </div>
    </div>
  );
}

export function ScreenVerificationPending({ nav, verificationStatus, setReachedDashboardAfterVerification }) {
  const approved = verificationStatus === "approved";
  const goToDashboard = () => {
    if (approved && setReachedDashboardAfterVerification) setReachedDashboardAfterVerification(true);
    nav("coach-dashboard");
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
        <div style={{ fontSize: 20, fontWeight: 600, color: C.jet, ...fDisplay }}>
          {approved ? "Your application has been successfully verified" : "Verification submitted"}
        </div>
        <div style={{ fontSize: 13.5, color: C.slate, marginTop: 8, lineHeight: 1.6, maxWidth: 300, marginLeft: "auto", marginRight: "auto", ...fBody }}>
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
        <Btn full disabled={!approved} onClick={goToDashboard}>Continue to dashboard</Btn>
        {!approved && (
          <div style={{ fontSize: 11.5, color: C.slateLight, textAlign: "center", lineHeight: 1.5, ...fBody }}>
            This unlocks once an admin approves your application.
          </div>
        )}
        <Btn full variant="ghost" onClick={() => nav("support")}>Contact support</Btn>
      </div>
    </div>
  );
}

/* =========================================================================
   ADMIN — LOGIN (admin skips splash / role-select / sign-up entirely)
   ========================================================================= */
export function ScreenAdminLogin({ nav, toast }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{ height: "100%", background: C.jet, display: "flex", flexDirection: "column", padding: "40px 24px 28px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img src={LOGO_WHITE_SRC} alt="CoachLink" style={{ width: 120, height: "auto", marginBottom: 20 }} />
          <div style={{ marginTop: 14, fontSize: 20, fontWeight: 600, color: C.white, ...fDisplay }}>Admin console</div>
          <div style={{ fontSize: 13, color: "#9CA0AC", marginTop: 4, ...fBody }}>Sign in with your CoachLink admin credentials</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#C7C9D1", marginBottom: 6, ...fBody }}>Email</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #333747", background: "#1F2129", borderRadius: 13, padding: "11px 13px" }}>
              <Mail size={16} color="#8A8E9B" />
              <input placeholder="you@coachlink.com" style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent", color: C.white, ...fBody }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#C7C9D1", marginBottom: 6, ...fBody }}>Password</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #333747", background: "#1F2129", borderRadius: 13, padding: "11px 13px" }}>
              <Lock size={16} color="#8A8E9B" />
              <input type={showPw ? "text" : "password"} placeholder="••••••••" style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent", color: C.white, ...fBody }} />
              <button onClick={() => setShowPw((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {showPw ? <EyeOff size={16} color="#8A8E9B" /> : <Eye size={16} color="#8A8E9B" />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <button style={{ background: "none", border: "none", color: C.orange, fontSize: 12.5, fontWeight: 600, cursor: "pointer", ...fBody }}>Forgot password?</button>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Welcome back, Admin"); nav("admin-home"); }}>Log in</Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#2B2E38" }} />
          <span style={{ fontSize: 11.5, color: "#6F7280", ...fBody }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#2B2E38" }} />
        </div>

        <Btn full variant="secondary" icon={Fingerprint} onClick={() => { toast("Face ID recognised — welcome back"); nav("admin-home"); }}>
          Continue with Face ID
        </Btn>
      </div>

      <div style={{ textAlign: "center", fontSize: 11.5, color: "#6F7280", lineHeight: 1.6, ...fBody }}>
        Admin access is restricted to authorised CoachLink staff and is logged for audit purposes.
      </div>
    </div>
  );
}
