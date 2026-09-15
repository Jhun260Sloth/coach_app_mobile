import React, { useMemo, useState } from "react";
import {
  Bell, Building2, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign,
  Clock3, FileCheck2, LockKeyhole, LogIn, Mail, MapPin, MessageCircle, Scale,
  ShieldCheck, Smartphone, UserRoundCheck, UsersRound, WalletCards,
} from "lucide-react";

import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { Avatar, Badge, Btn, Card, EmptyState, Field, SegTabs, SettingsGroup, SettingsRow, TopBar } from "../../components/ui/Primitives";

const COACH_ID = "rm1";
const BUSINESS_ID = "biz1";

function useBusinessCoach() {
  const app = useApp();
  const member = app.businessRoster.find((item) => item.id === COACH_ID);
  const organisation = app.businesses.find((item) => item.id === BUSINESS_ID) || app.business;
  const programs = app.businessPrograms.filter((item) => member?.programs?.includes(item.id));
  const bookings = app.businessBookings.filter((item) => item.assignedCoachId === COACH_ID && item.status !== "pending" && item.status !== "declined" && item.status !== "cancelled");
  const payouts = app.businessCoachPayouts.filter((item) => item.coachId === COACH_ID);
  return { ...app, member, organisation, programs, bookings, payouts };
}

function Page({ children, top, bottom, C }) {
  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>{top}<div className="cl-hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: bottom ? "0 18px 18px" : "0 18px 116px" }}>{children}</div>{bottom}</div>;
}

function OrganisationMark({ organisation, size = 46, C }) {
  return <div style={{ width: size, height: size, borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
    {organisation?.profile?.logo ? <img src={organisation.profile.logo} alt="Apex Tennis Academy logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Building2 size={20} color={C.brand} />}
  </div>;
}

function OrgIdentity({ organisation, C, compact = false }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <OrganisationMark organisation={organisation} size={compact ? 40 : 48} C={C} />
    <div style={{ minWidth: 0 }}><div style={{ fontSize: compact ? T.bodyLg : T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{organisation?.tradingName}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>Business-managed coaching</div></div>
  </div>;
}

function InfoStrip({ C, children, icon: Icon = LockKeyhole }) {
  return <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 14, background: C.brandTint, color: C.jet, marginBottom: 18 }}><Icon size={17} color={C.brandIcon} style={{ flexShrink: 0, marginTop: 1 }} /><div style={{ fontSize: T.labelLg, lineHeight: 1.5, ...fBody }}>{children}</div></div>;
}

function statusTone(status) { return status === "completed" || status === "paid" ? "success" : status === "confirmed" || status === "processing" ? "orange" : "neutral"; }

function SessionCard({ booking, organisation, C, onClick }) {
  return <Card onClick={onClick} ariaLabel={`Open ${booking.programTitle}`} style={{ padding: 14, marginBottom: 10 }}>
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><OrganisationMark organisation={organisation} size={42} C={C} /><div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}><div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, lineHeight: 1.3, ...fDisplay }}>{booking.programTitle}</div><ChevronRight size={16} color={C.slateLight} /></div>
      <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>{booking.participants} · {organisation.tradingName}</div>
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><span style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{booking.date} · {booking.time}</span><Badge tone={statusTone(booking.status)}>{booking.status}</Badge></div>
    </div></div>
  </Card>;
}

export function ScreenBusinessCoachLogin() {
  const { darkMode, nav, resetNav, organisation, member } = useBusinessCoach();
  const C = darkMode ? CD : CL;
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState(member?.email || "priya@apextennis.example");
  const [password, setPassword] = useState("coachdemo");
  const [loading, setLoading] = useState(false);
  const signIn = () => { setLoading(true); setTimeout(() => resetNav("business-coach-home", {}, "businessCoach"), 550); };
  const acceptInvite = () => nav("auth", { mode: "signup", email: member?.email || email, backTo: "business-coach-login", next: "coach-info", invitation: true });
  return <Page C={C} top={<div style={{ padding: "28px 22px 18px", textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><OrganisationMark organisation={organisation} size={64} C={C} /></div><div style={{ fontSize: T.displayLg, fontWeight: 800, color: C.jet, ...fDisplay }}>Your team invitation</div><div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.5, marginTop: 6, ...fBody }}>Choose how you want to continue with {organisation.tradingName}.</div></div>}>
    <Card style={{ padding: 16, marginBottom: 16 }}><OrgIdentity organisation={organisation} C={C} /><div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}><Badge tone="success" icon={ShieldCheck}>Verified business</Badge><Badge tone="orange" icon={UserRoundCheck}>Coach invitation</Badge></div></Card>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}><Btn full variant={showSignIn ? "primary" : "outline"} icon={LogIn} onClick={() => setShowSignIn(true)}>Sign in</Btn><Btn full variant={showSignIn ? "outline" : "primary"} icon={UserRoundCheck} onClick={acceptInvite}>Accept invite</Btn></div>
    {showSignIn ? <Card style={{ padding: 16, marginBottom: 16 }}><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginBottom: 14, ...fDisplay }}>Sign in to your account</div><div style={{ display: "grid", gap: 14 }}><Field label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /><Btn full icon={LogIn} loading={loading} loadingText="Signing in…" onClick={signIn}>Sign in</Btn><button type="button" onClick={() => nav("forgot-password", { role: "businessCoach", backTo: "business-coach-login" })} style={{ minHeight: 44, border: 0, background: "transparent", color: C.brandIcon, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}>Forgot password?</button></div></Card> : <Card style={{ padding: 16, marginBottom: 16, background: C.brandTint }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>New to CoachNivo?</div><div style={{ marginTop: 5, fontSize: T.captionLg, lineHeight: 1.55, color: C.slate, ...fBody }}>Accept the invitation to create your coach account, verify your contact details, complete your coaching profile and submit your checks for review.</div></Card>}
    <InfoStrip C={C}>Sign in goes straight to your workspace. Accept invite follows the same identity and coaching verification journey as an independent coach.</InfoStrip>
  </Page>;
}

export function ScreenBusinessCoachHome() {
  const { darkMode, nav, member, organisation, bookings, programs, payouts, businessCoachNotifications = [] } = useBusinessCoach();
  const C = darkMode ? CD : CL;
  const processing = payouts.find((item) => item.status === "processing");
  const unread = businessCoachNotifications.filter((item) => item.unread).length;
  return <Page C={C} top={<div style={{ padding: "18px 18px 16px", borderBottom: `1px solid ${C.border}` }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar name={member.name} size={48} ring /><div style={{ flex: 1 }}><div style={{ fontSize: T.display, fontWeight: 800, color: C.jet, ...fDisplay }}>Hi Priya 👋</div><div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Coach at {organisation.tradingName}</div></div><button type="button" aria-label={unread ? `${unread} unread notifications` : "Notifications"} onClick={() => nav("business-coach-notifications")} style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}><Bell size={19} color={C.jet} />{unread ? <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 99, background: C.brand }} /> : null}</button></div></div>}>
    <div style={{ paddingTop: 16 }}><InfoStrip C={C}>This is your organisation workspace. You can run assigned sessions and view your business-paid earnings; customer pricing stays with {organisation.tradingName}.</InfoStrip></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}><Card style={{ padding: 14 }}><CalendarDays size={18} color={C.brand} /><div style={{ fontSize: T.headingLg, fontWeight: 800, color: C.jet, marginTop: 8, ...fDisplay }}>{bookings.filter((item) => item.status === "confirmed").length}</div><div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Upcoming sessions</div></Card><Card style={{ padding: 14 }}><WalletCards size={18} color={C.brand} /><div style={{ fontSize: T.headingLg, fontWeight: 800, color: C.jet, marginTop: 8, ...fDisplay }}>{processing ? `$${processing.amount}` : "—"}</div><div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>From business</div></Card></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Next assigned session</span><button onClick={() => nav("business-coach-bookings")} style={{ minHeight: 44, border: 0, background: "transparent", color: C.brandIcon, fontSize: T.label, fontWeight: 700, cursor: "pointer", ...fBody }}>View all</button></div>
    {bookings.filter((item) => item.status === "confirmed").slice(0, 1).map((booking) => <SessionCard key={booking.id} booking={booking} organisation={organisation} C={C} onClick={() => nav("business-coach-booking-detail", { id: booking.id })} />)}
    <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, margin: "22px 0 10px", ...fDisplay }}>Your access</div><Card style={{ padding: 0, overflow: "hidden" }}>{[[CalendarDays, `${bookings.length} assigned sessions`], [UsersRound, `${programs.length} assigned programs`], [ShieldCheck, "Verification current"]].map(([Icon, label], index) => <div key={label} style={{ minHeight: 48, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: index === 2 ? "none" : `1px solid ${C.border}` }}><Icon size={16} color={C.brand} /><span style={{ fontSize: T.body, color: C.jet, ...fBody }}>{label}</span></div>)}</Card>
  </Page>;
}

export function ScreenBusinessCoachNotifications() {
  const { darkMode, nav, businessCoachNotifications = [], setBusinessCoachNotifications } = useBusinessCoach(); const C = darkMode ? CD : CL;
  const open = (item) => { setBusinessCoachNotifications((items) => items.map((notification) => notification.id === item.id ? { ...notification, unread: false } : notification)); if (item.bookingId) nav("business-coach-booking-detail", { id: item.bookingId }); };
  return <Page C={C} top={<TopBar title="Notifications" subtitle="Assignments and schedule updates" onBack={() => nav("business-coach-home")} />}><div style={{ paddingTop: 10 }}>{businessCoachNotifications.length ? businessCoachNotifications.map((item) => <Card key={item.id} onClick={() => open(item)} ariaLabel={`Open ${item.title}`} style={{ padding: 14, marginBottom: 10, display: "flex", gap: 11, alignItems: "flex-start", background: item.unread ? C.brandTint : C.white }}><span style={{ width: 38, height: 38, borderRadius: 12, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Bell size={17} color={C.brand} /></span><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{item.title}</div><div style={{ fontSize: T.micro, color: C.slateLight, ...fBody }}>{item.time || "Now"}</div></div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>{item.body}</div></div></Card>) : <EmptyState icon={Bell} title="You’re all caught up" body="New assignments and schedule changes will appear here." />}</div></Page>;
}

export function ScreenBusinessCoachBookings() {
  const { darkMode, nav, bookings, organisation } = useBusinessCoach(); const C = darkMode ? CD : CL; const [tab, setTab] = useState("upcoming");
  const visible = bookings.filter((item) => tab === "history" ? item.status === "completed" : item.status !== "completed");
  return <Page C={C} top={<TopBar title="Assigned sessions" subtitle="Only sessions assigned to you" />}><div style={{ paddingTop: 14 }}><SegTabs items={[{ value: "upcoming", label: "Upcoming" }, { value: "history", label: "History" }]} value={tab} onChange={setTab} /></div><div style={{ marginTop: 16 }}><InfoStrip C={C}>New customer requests go to the business first. You’ll see them here after the business assigns them to you.</InfoStrip>{visible.length ? visible.map((booking) => <SessionCard key={booking.id} booking={booking} organisation={organisation} C={C} onClick={() => nav("business-coach-booking-detail", { id: booking.id })} />) : <EmptyState icon={CalendarDays} title="No assigned sessions" body="Your next business-assigned session will appear here." />}</div></Page>;
}

export function ScreenBusinessCoachBookingDetail() {
  const { darkMode, goBack, params, bookings, programs, businessLocations, organisation, nav, toast, sessionDisputes } = useBusinessCoach(); const C = darkMode ? CD : CL;
  const booking = bookings.find((item) => item.id === params.id) || bookings[0]; const program = programs.find((item) => item.id === booking?.programId); const location = businessLocations.find((item) => item.id === program?.locationId);
  const relatedCase = sessionDisputes.find((item) => item.bookingId === booking?.id);
  if (!booking) return <Page C={C} top={<TopBar title="Session details" onBack={goBack} />}><EmptyState icon={CalendarDays} title="Session unavailable" body="This session is no longer assigned to you." /></Page>;
  return <Page C={C} top={<TopBar title="Session details" subtitle="Business-managed booking" onBack={goBack} />}>
    <div style={{ paddingTop: 16 }}><Card style={{ padding: 16, marginBottom: 16 }}><OrgIdentity organisation={organisation} C={C} compact /><div style={{ fontSize: T.heading, fontWeight: 800, color: C.jet, marginTop: 16, ...fDisplay }}>{booking.programTitle}</div><div style={{ display: "flex", gap: 8, marginTop: 8 }}><Badge tone={statusTone(booking.status)}>{booking.status}</Badge><Badge>{booking.mode}</Badge></div></Card>
    <Card style={{ padding: 16, marginBottom: 16 }}>{[[CalendarDays, "When", `${booking.date} · ${booking.time}`], [UsersRound, "Participant", booking.participants], [MapPin, "Location", location?.name || "Apex Tennis Academy"]].map(([Icon, label, value], index) => <div key={label} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: index === 2 ? "none" : `1px solid ${C.border}` }}><Icon size={17} color={C.brand} /><div><div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>{label}</div><div style={{ fontSize: T.body, color: C.jet, fontWeight: 600, marginTop: 2, ...fBody }}>{value}</div></div></div>)}</Card>
    <InfoStrip C={C}>Customer payment, pricing, refunds and receipts are managed by {organisation.tradingName}. Your compensation is recorded separately under Earnings.</InfoStrip>
    {relatedCase ? <Card onClick={() => nav("dispute-status", { caseId: relatedCase.id, role: "businessCoach", backTo: "business-coach-booking-detail", backParams: { id: booking.id } })} style={{ padding: 14, marginBottom: 12, background: C.warnTint, display: "flex", gap: 10, alignItems: "center" }}><Scale size={18} color={C.warnStrong} /><div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Report {relatedCase.status.replaceAll("_", " ")}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>View the shared case timeline</div></div><ChevronRight size={16} color={C.slateLight} /></Card> : null}
    <div style={{ display: "grid", gap: 10 }}>{booking.status === "confirmed" ? <Btn full icon={CheckCircle2} onClick={() => nav("coach-session-start", { bookingId: booking.id, role: "businessCoach", backTo: "business-coach-booking-detail", backParams: { id: booking.id } })}>Check in participant</Btn> : null}<Btn full variant="outline" icon={MessageCircle} onClick={() => toast("Message thread opened")}>Message participant</Btn>{!relatedCase && ["confirmed", "in_progress", "completion_pending", "completed"].includes(booking.status) ? <Btn full variant="ghost" icon={Scale} onClick={() => nav("dispute-create", { bookingId: booking.id, role: "businessCoach", category: "safety", backTo: "business-coach-booking-detail", backParams: { id: booking.id } })}>Report a session issue</Btn> : null}</div>
    </div>
  </Page>;
}

export function ScreenBusinessCoachPrograms() {
  const { darkMode, nav, programs, organisation, businessLocations } = useBusinessCoach(); const C = darkMode ? CD : CL;
  return <Page C={C} top={<TopBar title="Assigned programs" subtitle={`Managed by ${organisation.tradingName}`} />}><div style={{ paddingTop: 16 }}><InfoStrip C={C}>Open a program to review the schedule, location, participants and delivery responsibilities assigned to you.</InfoStrip>{programs.length ? programs.map((program) => { const location = businessLocations.find((item) => item.id === program.locationId); return <Card key={program.id} onClick={() => nav("business-coach-program-overview", { id: program.id })} ariaLabel={`Open ${program.title}`} style={{ padding: 16, marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div style={{ flex: 1, minWidth: 0 }}><Badge tone="orange">{program.sport}</Badge><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginTop: 10, ...fDisplay }}>{program.title}</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><OrganisationMark organisation={organisation} size={42} C={C} /><ChevronRight size={17} color={C.slateLight} /></div></div><div style={{ display: "grid", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}><div style={{ fontSize: T.body, color: C.slate, ...fBody }}><Clock3 size={14} style={{ verticalAlign: "-2px", marginRight: 7 }} />{program.schedule} · {program.durationMinutes} min</div><div style={{ fontSize: T.body, color: C.slate, ...fBody }}><MapPin size={14} style={{ verticalAlign: "-2px", marginRight: 7 }} />{location?.name || program.locationName || "Location to be confirmed"}</div><div style={{ fontSize: T.body, color: C.slate, ...fBody }}><UsersRound size={14} style={{ verticalAlign: "-2px", marginRight: 7 }} />{program.enrolled} enrolled · Capacity {program.capacity}</div></div></Card>; }) : <EmptyState icon={UsersRound} title="No assigned programs" body="The business will let you know when a program is assigned." />}</div></Page>;
}

function ProgramDetailRow({ label, value, last, C }) {
  return <div style={{ minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, borderBottom: last ? "none" : `1px solid ${C.border}`, fontSize: T.body, ...fBody }}><span style={{ color: C.slate }}>{label}</span><strong style={{ color: C.jet, textAlign: "right" }}>{value}</strong></div>;
}

export function ScreenBusinessCoachProgramOverview() {
  const { darkMode, nav, params, programs, bookings, businessLocations, organisation } = useBusinessCoach(); const C = darkMode ? CD : CL;
  const program = programs.find((item) => item.id === params?.id);
  if (!program) return <Page C={C} top={<TopBar title="Program overview" onBack={() => nav("business-coach-programs")} />}><EmptyState icon={UsersRound} title="Program unavailable" body="This program is no longer assigned to you." /></Page>;
  const location = businessLocations.find((item) => item.id === program.locationId);
  const programBookings = bookings.filter((item) => item.programId === program.id);
  const delivery = program.deliveryMode || program.mode || "In-person";
  const fillPct = program.capacity ? Math.min(100, Math.round((Number(program.enrolled || 0) / Number(program.capacity)) * 100)) : 0;
  return <Page C={C} top={<TopBar title="Program overview" subtitle={program.type} onBack={() => nav("business-coach-programs")} />}>
    <div style={{ paddingTop: 14 }}><Card style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div style={{ flex: 1 }}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Badge tone={program.status === "live" ? "success" : "neutral"}>{program.status}</Badge><Badge tone="orange">{delivery}</Badge></div><div style={{ fontSize: T.heading, fontWeight: 800, color: C.jet, marginTop: 10, ...fDisplay }}>{program.title}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 4, ...fBody }}>{program.sport} · {program.ageRange} · {program.skillLevel}</div></div><OrganisationMark organisation={organisation} size={48} C={C} /></div><p style={{ margin: "12px 0 0", fontSize: T.body, lineHeight: 1.6, color: C.slate, ...fBody }}>{program.description}</p><div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: T.captionLg, color: C.slate, ...fBody }}><span>{program.enrolled}/{program.capacity} participants</span><span>{fillPct}% filled</span></div><div style={{ height: 8, borderRadius: 999, background: C.border, overflow: "hidden", marginTop: 8 }}><div style={{ width: `${fillPct}%`, height: "100%", borderRadius: 999, background: C.brand }} /></div></div></Card>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}><Card style={{ padding: 14 }}><CalendarDays size={18} color={C.brand} /><div style={{ fontSize: T.headingLg, fontWeight: 800, color: C.jet, marginTop: 8, ...fDisplay }}>{programBookings.length}</div><div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Assigned sessions</div></Card><Card style={{ padding: 14 }}><UsersRound size={18} color={C.brand} /><div style={{ fontSize: T.headingLg, fontWeight: 800, color: C.jet, marginTop: 8, ...fDisplay }}>{program.enrolled}</div><div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Participants</div></Card></div>
    <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, margin: "22px 0 10px", ...fDisplay }}>Delivery details</div><Card style={{ padding: "0 14px" }}><ProgramDetailRow C={C} label="Schedule" value={program.schedule || "To be confirmed"} /><ProgramDetailRow C={C} label="Duration" value={`${program.durationMinutes} min`} /><ProgramDetailRow C={C} label="Delivery" value={delivery} /><ProgramDetailRow C={C} label="Location" value={location?.name || program.locationName || "To be confirmed"} /><ProgramDetailRow C={C} label="Coach assignment" value="Assigned to you" /><ProgramDetailRow C={C} label="Serves minors" value={program.servesMinors ? "Yes · guardian consent" : "No"} last /></Card>
    <div style={{ marginTop: 16 }}><InfoStrip C={C}>This is a read-only delivery view. {organisation.tradingName} controls publishing, customer pricing, capacity and coach eligibility.</InfoStrip></div>{programBookings.length ? <Btn full variant="outline" onClick={() => nav("business-coach-bookings")}>View assigned sessions</Btn> : null}</div>
  </Page>;
}

export function ScreenBusinessCoachEarnings() {
  const { darkMode, payouts, organisation } = useBusinessCoach(); const C = darkMode ? CD : CL;
  const paid = useMemo(() => payouts.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0), [payouts]); const pending = useMemo(() => payouts.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount, 0), [payouts]);
  return <Page C={C} top={<TopBar title="Earnings from business" subtitle="Your compensation ledger" />}><div style={{ paddingTop: 16 }}><Card style={{ padding: 18, background: C.jet, marginBottom: 16 }}><div style={{ fontSize: T.label, color: C.onDark, ...fBody }}>Paid by {organisation.tradingName}</div><div style={{ fontSize: T.hero, fontWeight: 800, color: C.white, marginTop: 5, ...fDisplay }}>${paid.toFixed(2)}</div><div style={{ fontSize: T.captionLg, color: C.onDarkMuted, marginTop: 5, ...fBody }}>${pending.toFixed(2)} currently processing</div></Card><InfoStrip C={C} icon={CircleDollarSign}>These payments come from {organisation.tradingName}. They are separate from what customers pay for programs.</InfoStrip><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginBottom: 10, ...fDisplay }}>Payment history</div>{payouts.map((payout) => <Card key={payout.id} style={{ padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{payout.period}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 4, ...fBody }}>{payout.sessions} sessions · {payout.paidAt ? `Paid ${payout.paidAt}` : `Due ${payout.dueDate}`}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: T.title, fontWeight: 800, color: C.jet, ...fDisplay }}>${payout.amount}</div><div style={{ marginTop: 5 }}><Badge tone={statusTone(payout.status)}>{payout.status}</Badge></div></div></div></Card>)}</div></Page>;
}

export function ScreenBusinessCoachAccount() {
  const { darkMode, nav, member, organisation, resetNav } = useBusinessCoach(); const C = darkMode ? CD : CL;
  return <Page C={C} top={<TopBar title="Coach workspace" subtitle="Profile & organisation access" />}><div style={{ paddingTop: 16 }}><Card style={{ padding: 16, marginBottom: 22 }}><div style={{ display: "flex", gap: 12, alignItems: "center" }}><Avatar name={member.name} size={52} ring /><div><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{member.name}</div><div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{member.sport} coach</div><div style={{ marginTop: 6 }}><Badge tone="success" icon={ShieldCheck}>Verified</Badge></div></div></div><div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 14 }}><OrgIdentity organisation={organisation} C={C} compact /></div></Card>
    <SettingsGroup title="Workspace permissions"><SettingsRow icon={CalendarDays} label="Assigned sessions" sub="View and deliver sessions assigned to you" onClick={() => nav("business-coach-bookings")} /><SettingsRow icon={UsersRound} label="Assigned programs" sub="View delivery details without customer pricing" onClick={() => nav("business-coach-programs")} /><SettingsRow icon={MessageCircle} label="Participant messages" sub="Available for your assigned sessions" onClick={() => nav("business-coach-messages")} /><SettingsRow icon={LockKeyhole} label="Business controls restricted" sub="Review your workspace permissions" onClick={() => nav("business-coach-access")} /></SettingsGroup>
    <SettingsGroup title="Checks & support"><SettingsRow icon={ShieldCheck} label="Identity & credentials" sub="Verified · WWCC current" onClick={() => nav("business-coach-credentials")} /><SettingsRow icon={Building2} label="Contact the business" sub="Questions about schedules or compensation" onClick={() => nav("business-coach-contact")} /></SettingsGroup>
    <Btn variant="outline" full onClick={() => resetNav("business-coach-login", {}, "businessCoach")}>Sign out</Btn></div></Page>;
}

export function ScreenBusinessCoachAccess() {
  const { darkMode, nav, organisation } = useBusinessCoach(); const C = darkMode ? CD : CL;
  const permissions = [[CalendarDays, "Assigned sessions", "View details, check in participants and complete delivery"], [UsersRound, "Assigned programs", "Review the programs and locations assigned to you"], [MessageCircle, "Participant messages", "Message participants connected to your assigned sessions"]];
  return <Page C={C} top={<TopBar title="Workspace access" subtitle="Your role and permissions" onBack={() => nav("business-coach-account")} />}><div style={{ paddingTop: 16 }}><Card style={{ padding: 16, marginBottom: 16 }}><OrgIdentity organisation={organisation} C={C} /><div style={{ marginTop: 12 }}><Badge tone="success" icon={ShieldCheck}>Business coach access active</Badge></div></Card><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, marginBottom: 10, ...fDisplay }}>What you can do</div>{permissions.map(([Icon, label, detail]) => <Card key={label} style={{ padding: 14, marginBottom: 10, display: "flex", gap: 11 }}><span style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={C.brand} /></span><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{label}</div><div style={{ fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, marginTop: 3, ...fBody }}>{detail}</div></div></Card>)}<InfoStrip C={C}>Pricing, client refunds, business billing, roster changes and program publishing remain with {organisation.tradingName}.</InfoStrip></div></Page>;
}

export function ScreenBusinessCoachCredentials() {
  const { darkMode, nav, member } = useBusinessCoach(); const C = darkMode ? CD : CL;
  return <Page C={C} top={<TopBar title="Identity & credentials" subtitle="Your current verification" onBack={() => nav("business-coach-account")} />}><div style={{ paddingTop: 16 }}><Card style={{ padding: 16, textAlign: "center" }}><Avatar name={member.name} size={64} ring /><div style={{ fontSize: T.heading, fontWeight: 800, color: C.jet, marginTop: 10, ...fDisplay }}>{member.name}</div><div style={{ marginTop: 7 }}><Badge tone="success" icon={ShieldCheck}>Verified coach</Badge></div></Card><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, margin: "22px 0 10px", ...fDisplay }}>Verification record</div><Card style={{ padding: "0 14px" }}><ProgramDetailRow C={C} label="Identity check" value="Verified" /><ProgramDetailRow C={C} label="Coaching credentials" value="Current" /><ProgramDetailRow C={C} label="Working with Children Check" value="Current" /><ProgramDetailRow C={C} label="Roster status" value={member.status === "active" ? "Active" : member.status} last /></Card><div style={{ marginTop: 16 }}><InfoStrip C={C} icon={FileCheck2}>Your verification belongs to your CoachNivo profile and stays with you across business invitations.</InfoStrip></div></div></Page>;
}

export function ScreenBusinessCoachContact() {
  const { darkMode, nav, organisation, toast } = useBusinessCoach(); const C = darkMode ? CD : CL;
  return <Page C={C} top={<TopBar title="Contact the business" subtitle="Schedules, access and compensation" onBack={() => nav("business-coach-account")} />}><div style={{ paddingTop: 16 }}><Card style={{ padding: 16, marginBottom: 16 }}><OrgIdentity organisation={organisation} C={C} /><div style={{ display: "grid", gap: 9, marginTop: 16 }}><Btn full icon={MessageCircle} onClick={() => nav("chat-thread", { name: organisation.tradingName, context: "Business coach support", backTo: "business-coach-contact" })}>Message business</Btn><Btn full variant="outline" icon={Mail} onClick={() => toast(`Email opened for ${organisation.ownerEmail}`)}>Email business</Btn></div></Card><SettingsGroup title="Business contact"><SettingsRow icon={UserRoundCheck} label={organisation.ownerName} sub={organisation.representativeRole} /><SettingsRow icon={Mail} label={organisation.ownerEmail} sub="Account contact" /><SettingsRow icon={Smartphone} label="Response time" sub="Usually within one business day" /></SettingsGroup><InfoStrip C={C}>Contact the business for program changes, schedule conflicts or compensation questions. Contact CoachNivo support for identity and verification help.</InfoStrip></div></Page>;
}
