import React, { useState, useRef } from "react";
import {
  Camera, Edit3, Eye, EyeOff, CreditCard, Fingerprint, Lock, Shield, HelpCircle,
  LogOut, ChevronRight, Trash2, Plus, User, ShieldCheck, BadgeCheck, AlertTriangle,
  Wallet, Banknote, CalendarClock, Zap, Hand,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, LANGUAGE_OPTIONS, GENDER_OPTIONS, AU_SUBURBS } from "../../data/mockData";
import {
  Avatar, SectionLabel, Chip, Card, Toggle, Btn, Badge, BottomSheet, Field, RadioRow,
  SearchMultiSelect, SearchSelect,
} from "../../components/ui/Primitives";
import { CoverBanner } from "../client/CoachProfile";

const LOCATION_OPTIONS = AU_SUBURBS.map((s) => `${s.suburb}, ${s.state}`);

/* Small reusable settings-row, matching the client Account tab's Row2 pattern. */
function Row2({ icon: Icon, label, sub, onClick, right, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 4px",
        background: "none", border: "none", borderBottom: `1px solid ${C.border}`,
        cursor: onClick ? "pointer" : "default", textAlign: "left",
      }}
    >
      <Icon size={17} color={danger ? "#D64545" : C.jet} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: danger ? "#D64545" : C.jet, fontWeight: 500, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.slate, marginTop: 1, ...fBody }}>{sub}</div>}
      </div>
      {right !== undefined ? right : (onClick ? <ChevronRight size={16} color={C.slateLight} /> : null)}
    </button>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, background: C.fog, borderRadius: 14, padding: "10px 12px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.jet, ...fDisplay }}>{value || "—"}</div>
      <div style={{ fontSize: 10.5, color: C.slate, marginTop: 2, ...fBody }}>{label}</div>
    </div>
  );
}

/* =========================================================================
   PUBLIC PROFILE PREVIEW — reuses the same CoverBanner the client-facing
   coach profile uses, so "Preview Profile" shows (as closely as this
   prototype can) exactly what athletes will see once changes are published.
   Accepts whatever draft/committed profile data is passed in, so it can be
   used both for previewing unsaved edits and for viewing the live profile.
   ========================================================================= */
function ProfilePreview({ coach, data, packages, bookingType }) {
  const activePackages = packages.filter((p) => p.active !== false);
  return (
    <div>
      <div style={{ margin: "-4px -20px 0", position: "relative" }}>
        <CoverBanner sport={coach.sport} height={100} />
        <div style={{ position: "absolute", bottom: -30, left: 20 }}>
          {data.photo ? (
            <img src={data.photo} alt="Profile" style={{ width: 64, height: 64, borderRadius: 64, objectFit: "cover", border: `3px solid ${C.white}`, display: "block" }} />
          ) : (
            <Avatar name={data.displayName || coach.name} size={64} ring />
          )}
        </div>
      </div>
      <div style={{ height: 38 }} />

      <div style={{ fontSize: 18, fontWeight: 600, color: C.jet, ...fDisplay }}>{data.displayName || coach.name}</div>
      <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2, ...fBody }}>{coach.sport} · {data.location || coach.suburb}</div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {coach.verified.identity && <Badge tone="success" icon={ShieldCheck}>ID verified</Badge>}
        {coach.verified.wwcc && <Badge tone="success" icon={ShieldCheck}>WWCC verified</Badge>}
        {coach.verified.quals && <Badge tone="success" icon={BadgeCheck}>Quals checked</Badge>}
        <Badge tone="orange">{bookingType === "instant" ? "Instant Book" : "Request to Book"}</Badge>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionLabel>Bio</SectionLabel>
        <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody }}>{data.bio || "No bio added yet."}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <StatBox label="Experience" value={data.yearsExperience ? `${data.yearsExperience} yrs` : coach.experience} />
        <StatBox label="Languages" value={(data.languages && data.languages.length) ? data.languages.join(", ") : "English"} />
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionLabel>Services</SectionLabel>
        {activePackages.length === 0 && (
          <div style={{ fontSize: 12.5, color: C.slateLight, ...fBody }}>No active packages published yet.</div>
        )}
        {activePackages.map((p) => (
          <Card key={p.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 1, ...fBody }}>{p.packageType || p.type} · {p.duration || p.durationMinutes} min</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.jet, ...fDisplay }}>${p.price}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ScreenCoachProfileEdit({ nav, toast, coachPackages, savePackage, removePackage, biometric, setBiometric }) {
  const coach = COACHES[1];

  /* ---------------------------------------------------------------------
     1. PROFILE INFORMATION
     "profile" is the currently published state; "draft" only exists while
     the Edit sheet is open, so Preview can show either the live profile or
     unsaved edits, and Save Changes is what commits draft -> profile.
     --------------------------------------------------------------------- */
  const [profile, setProfile] = useState({
    photo: null,
    displayName: coach.name,
    bio: coach.bio,
    yearsExperience: (coach.experience.match(/\d+/) || [""])[0],
    gender: "",
    languages: ["English"],
    location: coach.suburb,
  });
  const [draft, setDraft] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const photoInputRef = useRef(null);

  const openEditProfile = () => { setDraft({ ...profile }); setSheet("edit"); };
  const setDraftField = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setDraftField({ photo: URL.createObjectURL(file) });
    e.target.value = "";
  };
  const openPreview = (data) => { setPreviewData(data); setPreviewOpen(true); };
  const saveProfile = () => {
    if (!draft.displayName.trim()) { toast("Add a display name first"); return; }
    setProfile(draft);
    toast("Profile changes saved and published");
    setDraft(null);
    setSheet(null);
    setPreviewOpen(false);
  };

  /* ---------------------------------------------------------------------
     2 & 3. SERVICE PACKAGES + booking type shown on each package
     --------------------------------------------------------------------- */
  const [bookingType, setBookingType] = useState(coach.instantBook ? "instant" : "request");
  const [policy, setPolicy] = useState("Moderate");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toggleActive = (pkg) => {
    const nowActive = !(pkg.active !== false);
    savePackage({ ...pkg, active: nowActive });
    toast(nowActive ? `${pkg.name} enabled` : `${pkg.name} paused — hidden from clients`);
  };
  const confirmDeletePackage = () => {
    removePackage(deleteTarget.id);
    toast("Package deleted");
    setDeleteTarget(null);
  };

  /* ---------------------------------------------------------------------
     4. PAYMENT (payout) METHOD
     --------------------------------------------------------------------- */
  const [payout, setPayout] = useState({ accountHolder: coach.name, bankName: "Commonwealth Bank", bsb: "062-000", accountNumber: "•••• 2210" });
  const [payoutDraft, setPayoutDraft] = useState(null);
  const openEditPayout = () => { setPayoutDraft({ ...payout }); setSheet("payment"); };
  const savePayout = () => {
    if (!payoutDraft.accountHolder.trim() || !payoutDraft.accountNumber.trim()) { toast("Check your payout details and try again"); return; }
    setPayout(payoutDraft);
    toast("Payout method updated");
    setSheet(null);
  };

  /* ---------------------------------------------------------------------
     5. NOTIFICATION PREFERENCES
     --------------------------------------------------------------------- */
  const [notifPrefs, setNotifPrefs] = useState({
    bookingRequests: true, bookingConfirmations: true, messages: true, paymentUpdates: true,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  const NotifRow = ({ label, sub, prefKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>{sub}</div>}
      </div>
      <Toggle on={notifPrefs[prefKey]} onClick={() => toggleNotif(prefKey)} />
    </div>
  );

  /* ---------------------------------------------------------------------
     SHEETS + misc UI state (Security / Privacy & Support / Account mgmt)
     --------------------------------------------------------------------- */
  const [sheet, setSheet] = useState(null);
  const closeSheet = () => setSheet(null);
  const [showPw, setShowPw] = useState(false);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 18, ...fDisplay }}>My coaching profile</div>

        {/* Identity strip — mirrors the client Account tab's avatar + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <Avatar name={profile.displayName} size={58} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.jet, ...fDisplay }}>{profile.displayName}</div>
              <Badge tone="neutral">Coach account</Badge>
            </div>
            <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2, ...fBody }}>{coach.sport} · {profile.location}</div>
          </div>
        </div>

        {/* ============ 1. PROFILE INFORMATION ============ */}
        <SectionLabel>Profile information</SectionLabel>
        <Card style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.55, margin: 0, ...fBody }}>
            {profile.bio.length > 120 ? `${profile.bio.slice(0, 120)}…` : profile.bio}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {coach.verified.identity && <Badge tone="success" icon={ShieldCheck}>ID verified</Badge>}
            {coach.verified.wwcc && <Badge tone="success" icon={ShieldCheck}>WWCC verified</Badge>}
            {coach.verified.quals && <Badge tone="success" icon={BadgeCheck}>Quals checked</Badge>}
          </div>
        </Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <div style={{ flex: 1 }}>
            <Btn full variant="secondary" size="sm" icon={Edit3} onClick={openEditProfile}>Edit profile</Btn>
          </div>
          <div style={{ flex: 1 }}>
            <Btn full variant="outline" size="sm" icon={Eye} onClick={() => openPreview(profile)}>Preview profile</Btn>
          </div>
        </div>

        {/* ============ 2 & 3. SERVICE PACKAGES ============ */}
        <SectionLabel>Service packages</SectionLabel>
        {coachPackages.length === 0 && (
          <div style={{ fontSize: 12.5, color: C.slateLight, marginBottom: 10, ...fBody }}>No packages yet — add your first service below.</div>
        )}
        {coachPackages.map((p) => {
          const isActive = p.active !== false;
          return (
            <Card key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{p.packageType || p.type} · {p.sport || coach.sport}</div>
                  <div style={{ fontSize: 11.5, color: C.slateLight, marginTop: 1, ...fBody }}>{p.duration || p.durationMinutes} min · {p.mode || p.locationType}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.jet, ...fDisplay }}>${p.price}</span>
                  <button onClick={() => nav("coach-edit-package", { id: p.id })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }} aria-label="Edit package">
                    <Edit3 size={15} color={C.slateLight} />
                  </button>
                  <button onClick={() => setDeleteTarget(p)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }} aria-label="Delete package">
                    <Trash2 size={15} color={C.slateLight} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge tone="neutral" icon={bookingType === "instant" ? Zap : Hand}>{bookingType === "instant" ? "Instant Book" : "Request to Book"}</Badge>
                  <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Paused"}</Badge>
                </div>
                <Toggle on={isActive} onClick={() => toggleActive(p)} />
              </div>
            </Card>
          );
        })}
        <div style={{ marginBottom: 22 }}>
          <Btn variant="outline" size="sm" icon={Plus} full onClick={() => nav("coach-create-package")}>Add service package</Btn>
        </div>

        {/* ============ 4. PAYMENT METHOD ============ */}
        <SectionLabel>Payment method</SectionLabel>
        <Card style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }} onClick={openEditPayout}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wallet size={17} color={C.jet} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{payout.bankName}</div>
            <div style={{ fontSize: 11.5, color: C.slate, marginTop: 1, ...fBody }}>Account {payout.accountNumber} · Payouts sent here</div>
          </div>
          <ChevronRight size={16} color={C.slateLight} />
        </Card>

        {/* ============ NOTIFICATION PREFERENCES ============ */}
        <div style={{ marginTop: 4 }}>
          <SectionLabel>Notification preferences</SectionLabel>
          <NotifRow label="Booking requests" sub="New requests waiting on your response" prefKey="bookingRequests" />
          <NotifRow label="Booking confirmations" sub="When a session is confirmed" prefKey="bookingConfirmations" />
          <NotifRow label="Messages" sub="New messages from athletes" prefKey="messages" />
          <NotifRow label="Payment updates" sub="Payouts, receipts and earnings" prefKey="paymentUpdates" />
        </div>

        {/* ============ BOOKING PREFERENCES ============ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Booking preferences</SectionLabel>
          <div style={{ fontSize: 12, color: C.slate, marginTop: -6, marginBottom: 10, lineHeight: 1.5, ...fBody }}>
            Choose how athletes are able to book your services.
          </div>
          <Card style={{ marginBottom: 16 }}>
            <RadioRow label="Instant Book — sessions are auto-confirmed" selected={bookingType === "instant"} onClick={() => { setBookingType("instant"); toast("Instant Book enabled"); }} />
            <RadioRow label="Request to Book — you approve each request" selected={bookingType === "request"} onClick={() => { setBookingType("request"); toast("Request to Book enabled"); }} />
          </Card>
          <SectionLabel>Cancellation policy</SectionLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {["Flexible", "Moderate", "Strict"].map((p) => <Chip key={p} active={policy === p} onClick={() => setPolicy(p)}>{p}</Chip>)}
          </div>
        </div>

        {/* ============ SECURITY ============ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Security</SectionLabel>
          <Row2 icon={Fingerprint} label="Biometric login" right={<Toggle on={biometric} onClick={() => setBiometric((v) => !v)} />} />
          <Row2 icon={Lock} label="Change password" onClick={() => setSheet("password")} />
        </div>

        {/* ============ PRIVACY & SUPPORT ============ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Privacy & support</SectionLabel>
          <Row2 icon={Shield} label="Privacy policy" onClick={() => setSheet("privacy")} />
          <Row2 icon={HelpCircle} label="Support centre" onClick={() => nav("support")} />
        </div>

        {/* ============ ACCOUNT MANAGEMENT ============ */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Account management</SectionLabel>
          <Row2 icon={LogOut} label="Sign out" onClick={() => setSheet("signout")} />
          <Row2 icon={Trash2} label="Delete account" danger onClick={() => setSheet("delete")} />
        </div>
      </div>

      {/* -------------------- EDIT PROFILE -------------------- */}
      <BottomSheet open={sheet === "edit"} onClose={() => { setSheet(null); setDraft(null); }} title="Edit profile" heightPct={90}>
        {draft && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                {draft.photo ? (
                  <img src={draft.photo} alt="Profile" style={{ width: 76, height: 76, borderRadius: 76, objectFit: "cover", display: "block" }} />
                ) : (
                  <Avatar name={draft.displayName || "You"} size={76} />
                )}
                <button onClick={() => photoInputRef.current?.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: 99, background: C.orange, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Camera size={12} color={C.white} />
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Display name" placeholder="How athletes will see you" icon={User} value={draft.displayName} onChange={(e) => setDraftField({ displayName: e.target.value })} />

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Bio</div>
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraftField({ bio: e.target.value })}
                  rows={4}
                  placeholder="Tell athletes about your coaching background, philosophy and what to expect"
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: 12, fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", ...fBody }}
                />
              </div>

              <Field label="Years of coaching experience" placeholder="e.g. 6" icon={CalendarClock} value={draft.yearsExperience} onChange={(e) => setDraftField({ yearsExperience: e.target.value.replace(/[^0-9]/g, "") })} />

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Gender (optional)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[...GENDER_OPTIONS, "Prefer not to say"].map((g) => (
                    <Chip key={g} active={draft.gender === g} onClick={() => setDraftField({ gender: draft.gender === g ? "" : g })}>{g}</Chip>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Languages spoken</div>
                <SearchMultiSelect options={LANGUAGE_OPTIONS} value={draft.languages} onChange={(v) => setDraftField({ languages: v })} placeholder="Search languages…" />
              </div>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Current location</div>
                <SearchSelect options={LOCATION_OPTIONS} value={draft.location} onChange={(v) => setDraftField({ location: v })} placeholder="Search suburb or city…" />
              </div>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Btn full variant="outline" icon={Eye} onClick={() => openPreview(draft)}>Preview</Btn>
              </div>
              <div style={{ flex: 1 }}>
                <Btn full onClick={saveProfile}>Save changes</Btn>
              </div>
            </div>
          </>
        )}
      </BottomSheet>

      {/* -------------------- PREVIEW PROFILE (stacks above Edit) -------------------- */}
      <BottomSheet open={previewOpen} onClose={() => setPreviewOpen(false)} title="Profile preview" heightPct={92}>
        {previewData && (
          <>
            <div style={{ fontSize: 11.5, color: C.slateLight, marginBottom: 10, ...fBody }}>This is how your profile will look to athletes.</div>
            <ProfilePreview coach={coach} data={previewData} packages={coachPackages} bookingType={bookingType} />
            <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Btn full variant="secondary" onClick={() => setPreviewOpen(false)}>Close</Btn>
              </div>
              {draft && previewData === draft && (
                <div style={{ flex: 1 }}>
                  <Btn full onClick={saveProfile}>Save changes</Btn>
                </div>
              )}
            </div>
          </>
        )}
      </BottomSheet>

      {/* -------------------- DELETE PACKAGE -------------------- */}
      <BottomSheet open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete package" heightPct={40}>
        <div style={{ display: "flex", gap: 10, padding: 12, background: C.warnTint, borderRadius: 14, marginBottom: 16 }}>
          <AlertTriangle size={17} color="#D64545" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: C.jet, lineHeight: 1.5, ...fBody }}>
            Deleting "{deleteTarget?.name}" removes it from your public profile immediately. This can't be undone.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="danger" icon={Trash2} onClick={confirmDeletePackage}>Delete package</Btn>
          <Btn full variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
        </div>
      </BottomSheet>

      {/* -------------------- PAYMENT METHOD -------------------- */}
      <BottomSheet open={sheet === "payment"} onClose={closeSheet} title="Payment method" heightPct={64}>
        {payoutDraft && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Account holder name" placeholder="Full name on account" icon={User} value={payoutDraft.accountHolder} onChange={(e) => setPayoutDraft((d) => ({ ...d, accountHolder: e.target.value }))} />
              <Field label="Bank name" placeholder="e.g. Commonwealth Bank" icon={Banknote} value={payoutDraft.bankName} onChange={(e) => setPayoutDraft((d) => ({ ...d, bankName: e.target.value }))} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="BSB / Routing number" placeholder="062-000" value={payoutDraft.bsb} onChange={(e) => setPayoutDraft((d) => ({ ...d, bsb: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Account number" placeholder="•••• 2210" icon={CreditCard} value={payoutDraft.accountNumber} onChange={(e) => setPayoutDraft((d) => ({ ...d, accountNumber: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.slateLight, marginTop: 14, lineHeight: 1.5, ...fBody }}>
              Payouts are processed by our PCI-compliant payment partner — CoachLink never stores your full account number.
            </div>
            <div style={{ marginTop: 20 }}>
              <Btn full onClick={savePayout}>Save payment method</Btn>
            </div>
          </>
        )}
      </BottomSheet>

      {/* -------------------- CHANGE PASSWORD -------------------- */}
      <BottomSheet open={sheet === "password"} onClose={closeSheet} title="Change password" heightPct={62}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Current password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((v) => !v)} />
          <Field label="New password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
          <Field label="Confirm new password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Password updated"); closeSheet(); }}>Update password</Btn>
        </div>
      </BottomSheet>

      {/* -------------------- PRIVACY POLICY -------------------- */}
      <BottomSheet open={sheet === "privacy"} onClose={closeSheet} title="Privacy policy" heightPct={75}>
        <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody }}>
          <p style={{ marginBottom: 12 }}>CoachLink collects the information needed to run your coaching business on the platform, including your profile details, service packages, booking history and payout information.</p>
          <p style={{ marginBottom: 12 }}>We never sell your personal data. Your public profile is shown to prospective clients; payout and identity details are only shared with our payment and verification partners.</p>
          <p>You can request a copy of your data or ask us to delete your account at any time from this Profile tab.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full variant="secondary" onClick={closeSheet}>Close</Btn>
        </div>
      </BottomSheet>

      {/* -------------------- SIGN OUT -------------------- */}
      <BottomSheet open={sheet === "signout"} onClose={closeSheet} title="Sign out" heightPct={38}>
        <div style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
          Are you sure you want to sign out of your coach account?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="dark" icon={LogOut} onClick={() => { closeSheet(); nav("splash"); }}>Sign out</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>

      {/* -------------------- DELETE ACCOUNT -------------------- */}
      <BottomSheet open={sheet === "delete"} onClose={closeSheet} title="Delete account" heightPct={50}>
        <div style={{ display: "flex", gap: 10, padding: 12, background: C.warnTint, borderRadius: 14, marginBottom: 16 }}>
          <AlertTriangle size={17} color="#D64545" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: C.jet, lineHeight: 1.5, ...fBody }}>
            This permanently deletes your coach account, public profile, service packages and booking history. Upcoming bookings will be cancelled and athletes notified. This can't be undone.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="danger" icon={Trash2} onClick={() => { closeSheet(); toast("Account deleted"); nav("splash"); }}>Delete account permanently</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>
    </div>
  );
}
