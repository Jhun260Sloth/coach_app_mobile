import React, { useState } from "react";
import {
  ArrowRight, Search, Users, Mail, Eye, EyeOff, Fingerprint, Check,
  Upload, CheckCircle2, ClipboardList, Clock, Lock,
} from "lucide-react";
import { C, fDisplay, fBody, LOGO_WHITE_SRC } from "../../theme/theme";
import { Btn, Card, Badge, Toggle, TopBar, Field } from "../../components/ui/Primitives";
import { LogoMark } from "../../components/ui/Primitives";

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
      <div style={{ marginTop: 40, width: "100%" }}>
        <Btn full onClick={() => nav("role-select")}>Get started <ArrowRight size={16} /></Btn>
        <div style={{ marginTop: 14 }}>
          <button onClick={() => nav("auth", { mode: "login" })} style={{ background: "none", border: "none", color: "#9CA0AC", fontSize: 13.5, cursor: "pointer", ...fBody }}>
            Already have an account? <span style={{ color: C.white, fontWeight: 600 }}>Log in</span>
          </button>
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

      <div style={{ marginTop: 18 }}>
        <Btn full onClick={() => nav("tnc")}>{mode === "signup" ? "Create account" : "Log in"}</Btn>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 12, color: C.slateLight, ...fBody }}>or</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <Btn full variant="dark" icon={Fingerprint} onClick={() => { toast("Face ID recognised — welcome back"); nav("client-home"); }}>
        Continue with Face ID
      </Btn>
      <div style={{ marginTop: 10 }}>
        <Btn full variant="outline" onClick={() => { toast("Signed in with Google"); nav("tnc"); }}>Continue with Google</Btn>
      </div>

      <div style={{ marginTop: "auto", textAlign: "center", paddingBottom: 22 }}>
        <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} style={{ background: "none", border: "none", color: C.slate, fontSize: 13, cursor: "pointer", ...fBody }}>
          {mode === "signup" ? "Already have an account? " : "New to CoachLink? "}
          <span style={{ color: C.orange, fontWeight: 600 }}>{mode === "signup" ? "Log in" : "Sign up"}</span>
        </button>
      </div>
    </div>
  );
}

export function ScreenTnc({ nav, role, toast }) {
  const [agree, setAgree] = useState(false);
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Terms & Privacy" onBack={() => nav("auth")} />
      <Badge tone="neutral">Version 2.1 · Updated Jun 2026</Badge>
      <div style={{ marginTop: 14, flex: 1, overflowY: "auto", fontSize: 13, color: C.slate, lineHeight: 1.7, ...fBody }}>
        <p style={{ marginBottom: 12 }}>By continuing you agree to CoachLink's Terms of Service and Privacy Policy. Key points:</p>
        {[
          "We collect your location to show nearby coaches and enable travel-radius search.",
          "Payment details are processed by our PCI-compliant payment partner — CoachLink never stores full card numbers.",
          "If you're booking for someone under 18, a parent or guardian must provide consent before the session is confirmed.",
          "Coaches working with minors must hold a valid Working with Children Check, verified before their profile goes live.",
          "You can request a full export or deletion of your data at any time from Account Settings.",
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Check size={14} color={C.orange} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 0", borderTop: `1px solid ${C.border}` }}>
        <button onClick={() => setAgree(!agree)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${agree ? C.orange : C.border}`, background: agree ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {agree && <Check size={13} color={C.white} />}
          </div>
          <span style={{ fontSize: 13, color: C.jet, ...fBody }}>I have read and agree to the Terms of Service and Privacy Policy.</span>
        </button>
        <Btn full disabled={!agree} onClick={() => {
          toast("Terms accepted");
           if (role === "coach") nav("verification"); else nav("about-you");
        }}>Accept & continue</Btn>
      </div>
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
