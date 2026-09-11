import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, Award, Banknote, BarChart3, Bell, Building2, CalendarDays, Check, CheckCircle2, ChevronRight,
  Camera, CircleDollarSign, ClipboardCheck, Clock3, CreditCard, FileCheck2, Film, HelpCircle, Image as ImageIcon, Mail, MapPin, MessageCircle,
  MoreHorizontal, Pencil, Phone, Play, PlayCircle, Plus, RefreshCw, Scale, ShieldCheck, Sparkles, Star, Trash2, UploadCloud, UserCheck, Users, WalletCards,
} from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { BUSINESS_PLANS, BUSINESS_STATUS, BUSINESS_STATUS_LABELS, getBusinessPlan } from "../../data/businesses";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../data/bookings";
import { SPORT_NAMES } from "../../data/sports";
import { LocationField } from "../../components/ui/LocationField";
import { Avatar, Badge, BottomSheet, Btn, Card, CheckboxRow, Chip, ConfirmDialog, EmptyState, Field, Row, SearchSelect, SectionLabel, SegTabs, SettingsGroup, SettingsRow, StatusPill, StepProgress, ThreadSkeleton, Toggle, TopBar } from "../../components/ui/Primitives";
import { SportSearchSelect } from "../../components/ui/SportUI";
import { SessionJourneyTimeline } from "../../components/booking/SessionJourneyTimeline";
import { NotificationBellButton } from "../../systems/StateSystem";

const page = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });
const scroll = { flex: 1, overflowY: "auto", padding: "0 18px 124px" };
const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const statusTone = (status) => status === BUSINESS_STATUS.LIVE || status === BUSINESS_STATUS.APPROVED ? "success" : status === BUSINESS_STATUS.RESTRICTED || status === BUSINESS_STATUS.CHANGES_REQUIRED ? "orange" : "neutral";
const memberTone = (status) => status === "active" ? "success" : status === "suspended" ? "orange" : "neutral";

function ProgressBar({ value, C }) {
  return <div style={{ height: 8, borderRadius: 999, overflow: "hidden", background: C.border }}><div style={{ height: "100%", width: `${value}%`, borderRadius: 999, background: value === 100 ? C.success : C.brand, transition: "width .25s ease" }} /></div>;
}

function StatCard({ icon: Icon, value, label, C }) {
  return <Card style={{ padding: 12, minWidth: 0 }}><Icon size={17} color={C.brand} /><div style={{ marginTop: 9, fontSize: T.heading, fontWeight: 800, color: C.jet, ...fDisplay }}>{value}</div><div style={{ marginTop: 2, fontSize: T.micro, color: C.slate, ...fBody }}>{label}</div></Card>;
}

function HeaderIconButton({ icon: Icon, label, onClick, unread = 0, C }) {
  return <button type="button" aria-label={unread ? `${label}, ${unread} unread` : label} onClick={onClick} style={{ width: 44, height: 44, border: "none", borderRadius: 999, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}><Icon size={19} color={C.jet} />{unread ? <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 99, background: C.brand }} /> : null}</button>;
}

export function ScreenBusinessDashboard() {
  const { darkMode, nav, business, businessBookings, businessPrograms, businessRoster, businessNotifications, getBusinessProgress } = useApp();
  const C = darkMode ? CD : CL;
  const progress = getBusinessProgress();
  const pending = businessBookings.filter((item) => item.businessId === business.id && item.status === "pending");
  const activeCoaches = businessRoster.filter((item) => item.businessId === business.id && item.status === "active").length;
  const unreadCount = businessNotifications.filter((item) => item.unread).length;
  return <div style={page(C)}>
    <TopBar title={business.tradingName} subtitle="Business workspace" right={<NotificationBellButton count={unreadCount} onClick={() => nav("business-notifications")} />} />
    <div style={scroll} className="cl-hide-scrollbar">
      <Card style={{ marginTop: 14, padding: 16, background: C.black, border: `1px solid ${C.black}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}><div><span style={{ display: "inline-flex", minHeight: 24, alignItems: "center", padding: "0 9px", borderRadius: 999, background: `color-mix(in srgb, ${C.white} 14%, transparent)`, color: C.white, fontSize: T.caption, fontWeight: 700, ...fBody }}>{BUSINESS_STATUS_LABELS[business.status]}</span><div style={{ marginTop: 10, fontSize: T.title, fontWeight: 700, color: C.white, ...fDisplay }}>{progress.ready ? "Your business is ready" : "Complete your launch checklist"}</div></div><ShieldCheck size={24} color={C.white} /></div>
        <div style={{ height: 8, marginTop: 14, borderRadius: 999, overflow: "hidden", background: `color-mix(in srgb, ${C.white} 22%, transparent)` }}><div style={{ height: "100%", width: `${progress.percent}%`, borderRadius: 999, background: C.white, transition: "width .25s ease" }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 8, fontSize: T.captionLg, color: C.white, ...fBody }}><span style={{ opacity: .72 }}>{progress.complete} of {progress.total} requirements complete</span><button type="button" onClick={() => nav("business-compliance")} style={{ minHeight: 44, margin: "-10px -8px -10px 0", padding: "0 8px", border: "none", background: "transparent", color: C.white, fontSize: T.captionLg, fontWeight: 700, cursor: "pointer", ...fBody }}>View checklist</button></div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}><StatCard icon={Users} value={activeCoaches} label="Active coaches" C={C} /><StatCard icon={CalendarDays} value={business.metrics.bookings7d} label="Bookings · 7d" C={C} /><StatCard icon={CircleDollarSign} value={`$${Math.round(business.metrics.revenueMonth / 1000)}k`} label="This month" C={C} /></div>
      {business.payoutsStatus !== "enabled" ? <><SectionLabel style={{ marginTop: 24 }}>Needs attention</SectionLabel><Card onClick={() => nav("business-finance")} ariaLabel="Complete payout setup" style={{ padding: 14, marginTop: 10, display: "flex", alignItems: "center", gap: 12, background: C.warnTint }}><div style={{ width: 40, height: 40, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: C.white }}><WalletCards size={19} color={C.warnStrong} /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Finish payout setup</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>Required before paid bookings can go live.</div></div><ChevronRight size={17} color={C.slateLight} /></Card></> : null}
      <SectionLabel style={{ marginTop: 24 }}>Booking requests</SectionLabel>
      {pending.length ? pending.map((booking) => {
        const program = businessPrograms.find((item) => item.id === booking.programId);
        return <Card key={booking.id} onClick={() => nav("business-booking-detail", { id: booking.id })} ariaLabel={`Open booking from ${booking.clientName}`} style={{ padding: 14, marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div style={{ minWidth: 0 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...oneLine, ...fDisplay }}>{booking.clientName}</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program?.title} · {booking.date}</div></div><Badge tone="orange">Review</Badge></div></Card>;
      }) : <EmptyState icon={CalendarDays} title="No requests waiting" body="New program booking requests will appear here." />}
      <SectionLabel style={{ marginTop: 24 }}>Program snapshot</SectionLabel>
      <Card onClick={() => nav("business-programs")} ariaLabel="Manage programs" style={{ marginTop: 10, padding: 14, display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 14, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={19} color={C.brand} /></div><div style={{ flex: 1 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{businessPrograms.filter((item) => item.businessId === business.id && item.status === "live").length} programs live</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{business.metrics.occupancy}% average occupancy</div></div><ChevronRight size={17} color={C.slateLight} /></Card>
    </div>
  </div>;
}

const BUSINESS_BOOKING_FILTERS = [
  { value: "requests", label: "Requests", statuses: ["pending", "awaiting_payment"] },
  { value: "upcoming", label: "Upcoming", statuses: ["confirmed", "in_progress", "completion_pending"] },
  { value: "history", label: "History", statuses: ["completed", "cancelled", "declined", "expired"] },
];

export function ScreenBusinessBookings() {
  const { darkMode, nav, business, businessBookings, businessPrograms, businessRoster } = useApp();
  const C = darkMode ? CD : CL;
  const [filter, setFilter] = useState("requests");
  const activeFilter = BUSINESS_BOOKING_FILTERS.find((item) => item.value === filter) || BUSINESS_BOOKING_FILTERS[0];
  const bookings = businessBookings.filter((item) => item.businessId === business.id && activeFilter.statuses.includes(item.status));
  const pendingCount = businessBookings.filter((item) => item.businessId === business.id && item.status === "pending").length;

  return <div style={page(C)}><TopBar title="Bookings" subtitle={pendingCount ? `${pendingCount} request${pendingCount === 1 ? " needs" : "s need"} a response` : "Requests, sessions and booking history"} right={<HeaderIconButton icon={MessageCircle} label="Messages" onClick={() => nav("business-messages")} C={C} />} />
    <div style={{ padding: "4px 18px 10px" }}><SegTabs value={filter} onChange={setFilter} items={BUSINESS_BOOKING_FILTERS.map((item) => ({ value: item.value, label: item.value === "requests" && pendingCount ? `${item.label} (${pendingCount})` : item.label }))} /></div>
    <div style={scroll} className="cl-hide-scrollbar">
      {bookings.length ? bookings.map((booking) => {
        const program = businessPrograms.find((item) => item.id === booking.programId);
        const coach = businessRoster.find((item) => item.id === booking.assignedCoachId);
        const coachName = coach?.name || booking.coachName;
        return <Card key={booking.id} onClick={() => nav("business-booking-detail", { id: booking.id })} ariaLabel={`Open ${program?.title || booking.service} booking for ${booking.clientName}`} style={{ padding: 14, marginTop: 10, boxShadow: "0 1px 2px rgba(22,24,29,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={booking.clientName} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...oneLine, ...fDisplay }}>{booking.clientName}</div>
              <div style={{ marginTop: 2, fontSize: T.body, fontWeight: 600, color: C.brand, ...oneLine, ...fBody }}>{program?.title || booking.service}</div>
              <div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{booking.date} · {booking.time}</div>
              <div style={{ marginTop: 2, fontSize: T.caption, color: C.slateLight, ...oneLine, ...fBody }}>{booking.participants} · {booking.mode}</div>
            </div>
            <ChevronRight size={17} color={C.slateLight} style={{ flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <StatusPill status={booking.status} perspective="business" />
            <span style={{ minWidth: 0, fontSize: T.label, color: coachName ? C.slate : C.warnStrong, fontWeight: 600, textAlign: "right", ...oneLine, ...fBody }}>{coachName || "Coach not assigned"}</span>
          </div>
        </Card>;
      }) : <EmptyState icon={CalendarDays} title={filter === "requests" ? "No requests waiting" : filter === "upcoming" ? "No upcoming bookings" : "No booking history yet"} body={filter === "requests" ? "New client requests will appear here for your team to review." : filter === "upcoming" ? "Confirmed program bookings will appear here." : "Completed and cancelled bookings will remain available here."} />}
    </div>
  </div>;
}

const BUSINESS_NOTIFICATION_ICONS = { booking: CalendarDays, message: MessageCircle, payment: WalletCards, verification: ShieldCheck };

export function ScreenBusinessNotifications() {
  const { darkMode, nav, business, businessBookings, businessNotifications, setBusinessNotifications } = useApp();
  const C = darkMode ? CD : CL;
  const [loading, setLoading] = useState(true);
  const unreadCount = businessNotifications.filter((item) => item.unread).length;
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 500); return () => window.clearTimeout(timer); }, []);
  const markAllRead = () => setBusinessNotifications((items) => items.map((item) => ({ ...item, unread: false })));
  const openNotification = (notification) => {
    setBusinessNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, unread: false } : item));
    if (notification.type === "booking" && businessBookings.some((booking) => booking.id === notification.bookingId && booking.businessId === business.id)) nav("business-booking-detail", { id: notification.bookingId });
    else if (notification.type === "message") nav("business-messages");
    else if (notification.type === "payment") nav("business-finance");
    else if (notification.type === "verification") nav("business-compliance");
    else nav("business-dashboard");
  };
  return <div style={page(C)}><TopBar title="Notifications" onBack={() => nav("business-dashboard")} />
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{unreadCount ? <div style={{ padding: "8px 18px 0" }}><button type="button" onClick={markAllRead} style={{ minHeight: 44, display: "flex", alignItems: "center", gap: 6, padding: 0, border: "none", background: "transparent", color: C.brand, fontSize: T.labelLg, fontWeight: 700, cursor: "pointer", ...fBody }}><Check size={14} />Mark all as read</button></div> : null}<div style={{ flex: 1, overflowY: "auto", padding: "0 18px 28px" }} className="cl-hide-scrollbar">{loading ? <ThreadSkeleton rows={4} /> : businessNotifications.length ? <div className="cl-stagger">{businessNotifications.map((notification, index) => { const Icon = BUSINESS_NOTIFICATION_ICONS[notification.type] || Bell; return <button key={notification.id} type="button" onClick={() => openNotification(notification)} style={{ width: "100%", minHeight: 72, padding: "14px 4px", border: "none", borderBottom: `1px solid ${C.border}`, background: "transparent", display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", cursor: "pointer", animationDelay: `${Math.min(index, 8) * 45}ms` }}><span style={{ width: 40, height: 40, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={C.brand} /></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontSize: T.bodyLg, color: C.jet, ...fBody }}>{notification.title}</strong><span style={{ fontSize: T.caption, color: C.slateLight, flexShrink: 0, ...fBody }}>{notification.time}</span></span><span style={{ display: "block", marginTop: 4, fontSize: T.body, lineHeight: 1.5, color: C.slate, ...fBody }}>{notification.body}</span></span>{notification.unread ? <span style={{ width: 8, height: 8, borderRadius: 99, background: C.brand, flexShrink: 0, marginTop: 6 }} /> : null}</button>; })}</div> : <EmptyState icon={Bell} title="No notifications yet" body="Booking, payment, verification and message updates will appear here." />}</div></div>
  </div>;
}

export function ScreenBusinessRoster() {
  const { darkMode, nav, business, businessRoster, inviteBusinessCoach, toast } = useApp();
  const C = darkMode ? CD : CL;
  const [email, setEmail] = useState("");
  const members = businessRoster.filter((item) => item.businessId === business.id && item.status !== "removed");
  const plan = getBusinessPlan(business.planId);
  const atLimit = members.length >= plan.coachLimit;
  const invite = () => {
    if (!email.includes("@")) { toast("Enter a valid coach email"); return; }
    if (!inviteBusinessCoach(email.trim())) { toast("Upgrade to invite more coaches"); return; }
    setEmail(""); toast("Coach invitation sent");
  };
  return <div style={page(C)}><TopBar title="Coach roster" subtitle={`${members.length} of ${Number.isFinite(plan.coachLimit) ? plan.coachLimit : "unlimited"} coach seats used`} />
    <div style={scroll} className="cl-hide-scrollbar">
      <Card style={{ padding: 14, marginTop: 6, background: atLimit ? C.warnTint : C.fog }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: T.captionLg, color: C.slate, ...fBody }}><span>{plan.name} roster allowance</span><strong style={{ color: C.jet }}>{members.length}/{Number.isFinite(plan.coachLimit) ? plan.coachLimit : "∞"}</strong></div><div style={{ marginTop: 9 }}><ProgressBar value={Number.isFinite(plan.coachLimit) ? Math.min(100, members.length / plan.coachLimit * 100) : 25} C={C} /></div>{atLimit ? <div style={{ marginTop: 8, fontSize: T.captionLg, color: C.warnStrong, fontWeight: 700, ...fBody }}>Your roster is full. Upgrade to add another coach.</div> : null}</Card>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}><div style={{ flex: 1 }}><Field label="Invite a coach" placeholder="coach@email.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div style={{ alignSelf: "flex-end" }}><Btn size="sm" icon={Plus} disabled={atLimit} onClick={invite}>Invite</Btn></div></div>
      <SectionLabel style={{ marginTop: 24 }}>Your team</SectionLabel>
      <div style={{ marginTop: 10 }}>{members.map((member) => <Card key={member.id} onClick={() => nav("business-coach-detail", { id: member.id })} ariaLabel={`View ${member.name} in ${business.tradingName}`} style={{ padding: 14, marginBottom: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar name={member.name} size={48} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...oneLine, ...fDisplay }}>{member.name}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...oneLine, ...fBody }}>{member.sport} · {member.email}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}><Badge tone={memberTone(member.status)}>{member.status}</Badge><Badge tone={member.verification === "verified" ? "success" : "orange"}>{member.verification === "verified" ? "Verified" : "Checks pending"}</Badge></div></div><ChevronRight size={18} color={C.slateLight} /></div></Card>)}</div>
    </div></div>;
}

export function ScreenBusinessCoachDetail() {
  const { darkMode, nav, params, business, businessRoster, businessPrograms, businessBookings, updateBusinessRosterMember, toast } = useApp();
  const C = darkMode ? CD : CL;
  const member = businessRoster.find((item) => item.businessId === business.id && item.id === params?.id);
  const [actionsOpen, setActionsOpen] = useState(false);
  if (!member) return <div style={page(C)}><TopBar title="Coach profile" onBack={() => nav("business-roster")} /><EmptyState icon={Users} title="Coach not found" body="This roster member may no longer belong to your organisation." /></div>;
  const programs = businessPrograms.filter((program) => member.programs?.includes(program.id));
  const bookings = businessBookings.filter((booking) => booking.businessId === business.id && booking.assignedCoachId === member.id);
  const upcoming = bookings.filter((booking) => ["confirmed", "in_progress", "completion_pending"].includes(booking.status)).length;
  const verified = member.verification === "verified";
  const active = member.status === "active";
  const updateStatus = (status) => {
    updateBusinessRosterMember(member.id, { status });
    setActionsOpen(false);
    toast(status === "active" ? "Coach access restored" : status === "removed" ? "Coach removed from roster" : "Coach access suspended");
    if (status === "removed") nav("business-roster");
  };
  const checkItems = [
    { label: "Identity verification", done: verified },
    { label: "Working with children check", done: member.wwcc === "current" },
    { label: "Business roster access", done: active },
  ];
  return <div style={page(C)}><TopBar title="Coach profile" onBack={() => nav("business-roster")} right={<button type="button" aria-label={`Manage ${member.name}`} onClick={() => setActionsOpen(true)} style={{ width: 44, height: 44, border: "none", borderRadius: 12, background: C.fog, color: C.jet, cursor: "pointer" }}><MoreHorizontal size={20} /></button>} />
    <div style={{ ...scroll, paddingTop: 10, paddingBottom: 32 }} className="cl-hide-scrollbar">
      <Card style={{ padding: 18, textAlign: "center" }}><Avatar name={member.name} size={76} /><div style={{ marginTop: 11, fontSize: T.headingLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{member.name}</div><div style={{ marginTop: 4, fontSize: T.body, color: C.slate, ...fBody }}>{member.sport} coach at {business.tradingName}</div><div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 10 }}><Badge tone={memberTone(member.status)}>{member.status}</Badge><Badge tone={verified ? "success" : "orange"}>{verified ? "Coach verified" : "Verification pending"}</Badge></div></Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}><StatCard icon={CalendarDays} value={upcoming} label="Upcoming" C={C} /><StatCard icon={ClipboardCheck} value={bookings.length} label="Bookings" C={C} /><StatCard icon={Award} value={programs.length} label="Programs" C={C} /></div>
      <SectionLabel style={{ marginTop: 24 }}>Organisation details</SectionLabel><Card style={{ marginTop: 10, padding: "4px 14px" }}><div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 54 }}><Building2 size={17} color={C.brand} /><div><div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>Organisation</div><div style={{ marginTop: 2, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{business.tradingName}</div></div></div><div style={{ borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 54 }}><Mail size={17} color={C.brand} /><div><div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>Roster email</div><div style={{ marginTop: 2, fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{member.email}</div></div></div></Card>
      <SectionLabel style={{ marginTop: 24 }}>Compliance</SectionLabel><Card style={{ marginTop: 10, padding: "4px 14px" }}>{checkItems.map((item, index) => <div key={item.label} style={{ minHeight: 52, display: "flex", alignItems: "center", gap: 10, borderBottom: index < checkItems.length - 1 ? `1px solid ${C.border}` : "none" }}><span style={{ width: 30, height: 30, borderRadius: 10, background: item.done ? C.successTint : C.warnTint, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.done ? <CheckCircle2 size={16} color={C.success} /> : <Clock3 size={16} color={C.warnStrong} />}</span><span style={{ flex: 1, fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{item.label}</span><Badge tone={item.done ? "success" : "orange"}>{item.done ? "Current" : "Pending"}</Badge></div>)}</Card>
      <SectionLabel style={{ marginTop: 24 }}>Assigned programs</SectionLabel>{programs.length ? programs.map((program) => <Card key={program.id} onClick={() => nav("business-program-overview", { id: program.id })} style={{ marginTop: 9, padding: 14, display: "flex", alignItems: "center", gap: 11 }}><span style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}><Award size={18} color={C.brand} /></span><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: T.body, fontWeight: 700, color: C.jet, ...oneLine, ...fBody }}>{program.title}</span><span style={{ display: "block", marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program.schedule}</span></span><ChevronRight size={17} color={C.slateLight} /></Card>) : <EmptyState icon={Award} title="No programs assigned" body="Assign this coach from a program’s eligibility settings." />}
      <div style={{ display: "grid", gap: 9, marginTop: 22 }}><Btn full icon={MessageCircle} onClick={() => nav("chat-thread", { name: member.name, context: `${business.tradingName} roster`, backTo: "business-coach-detail", backParams: { id: member.id } })}>Message coach</Btn><Btn full variant="outline" onClick={() => setActionsOpen(true)}>Manage roster access</Btn></div>
    </div>
    <BottomSheet open={actionsOpen} onClose={() => setActionsOpen(false)} title="Manage coach" heightPct={38}><div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.55, marginBottom: 16, ...fBody }}>Changes affect {member.name}’s access to {business.tradingName}. Their personal CoachNivo profile stays separate.</div><div style={{ display: "grid", gap: 9 }}>{active ? <Btn full variant="outline" onClick={() => updateStatus("suspended")}>Suspend business access</Btn> : <Btn full onClick={() => updateStatus("active")}>Restore business access</Btn>}<Btn full variant="danger" onClick={() => updateStatus("removed")}>Remove from roster</Btn><Btn full variant="ghost" onClick={() => setActionsOpen(false)}>Keep current access</Btn></div></BottomSheet>
  </div>;
}

export function ScreenBusinessPrograms() {
  const { darkMode, nav, business, businessPrograms, businessLocations } = useApp();
  const C = darkMode ? CD : CL;
  const programs = businessPrograms.filter((item) => item.businessId === business.id);
  return <div style={page(C)}><TopBar title="Programs" subtitle="Pricing, capacity and schedule" right={<Btn size="sm" icon={Plus} onClick={() => nav("business-program-form")}>Add</Btn>} />
    <div style={scroll} className="cl-hide-scrollbar">{programs.length ? programs.map((program) => { const location = businessLocations.find((item) => item.id === program.locationId); const deliveryLabel = program.deliveryMode || program.mode || "In-person"; const locationLabel = deliveryLabel === "Online" ? "Online session" : deliveryLabel === "Come to You" ? "Coach travels to client" : location?.name || program.locationName || "Location to be confirmed"; return <Card key={program.id} onClick={() => nav("business-program-overview", { id: program.id })} ariaLabel={`Open ${program.title}`} style={{ padding: 15, marginTop: 10 }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{program.title}</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program.nextDate || program.schedule} · {program.schedule?.split("·")[1]?.trim() || `${program.durationMinutes} min`}</div><div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: T.captionLg, color: C.slate, ...fBody }}><MapPin size={13} color={C.brand} />{ locationLabel}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}><Badge tone={program.status === "live" ? "success" : "neutral"}>{program.status}</Badge><Badge tone="orange">{deliveryLabel}</Badge><Badge tone="orange">{program.assignmentMode === "client_selects" ? "Client chooses coach" : "Business assigns coach"}</Badge></div></div><div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: T.title, fontWeight: 800, color: C.jet, ...fDisplay }}>${program.price}</div><div style={{ marginTop: 4, fontSize: T.micro, color: C.slate, ...fBody }}>{program.enrolled}/{program.capacity} participants</div></div></div></Card>; }) : <EmptyState icon={Sparkles} title="Build your first program" body="Create a class, clinic, package or private session to start taking bookings." ctaLabel="Add program" onCta={() => nav("business-program-form")} />}</div>
  </div>;
}

export function ScreenBusinessProgramOverview() {
  const { darkMode, nav, params, business, businessPrograms, businessBookings, businessRoster, businessLocations, saveBusinessProgram, toast } = useApp();
  const C = darkMode ? CD : CL;
  const program = businessPrograms.find((item) => item.id === params?.id && item.businessId === business.id);
  if (!program) return <div style={page(C)}><TopBar title="Program overview" onBack={() => nav("business-programs")} /><EmptyState icon={Sparkles} title="Program not found" body="This program may have been removed or moved to another business." /></div>;

  const location = businessLocations.find((item) => item.id === program.locationId);
  const deliveryLabel = program.deliveryMode || program.mode || "In-person";
  const locationLabel = deliveryLabel === "Online" ? "Online session" : deliveryLabel === "Come to You" ? "Coach travels to client" : location?.name || program.locationName || "Location to be confirmed";
  const isLive = (program.status || "draft") === "live";
  const programBookings = businessBookings.filter((item) => item.businessId === business.id && item.programId === program.id);
  const confirmedBookings = programBookings.filter((item) => ["confirmed", "in_progress", "completion_pending", "completed"].includes(item.status));
  const bookedValue = confirmedBookings.reduce((sum, item) => sum + Number(item.total ?? item.price ?? 0), 0);
  const eligibleCoaches = businessRoster.filter((member) => (program.eligibleCoachIds || []).includes(member.id));
  const enrolled = Number(program.enrolled || 0);
  const capacity = Number(program.capacity || 0);
  const participantsLeft = Math.max(0, capacity - enrolled);
  const fillPct = capacity ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;

  const updateStatus = (status) => {
    if (status === (program.status || "draft")) return;
    saveBusinessProgram({ ...program, status });
    toast(status === "live" ? "Program is now open for bookings" : "Program saved as draft - hidden from clients");
  };

  return <div style={page(C)}>
    <TopBar title="Program overview" subtitle={program.type} onBack={() => nav("business-programs")} />
    <div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar">
      <Card style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: isLive ? C.white : C.dangerTint, border: `1.5px solid ${isLive ? C.border : C.dangerBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: isLive ? C.successTint : C.dangerTint, border: isLive ? "none" : `1px solid ${C.dangerBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: isLive ? C.success : C.danger }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{isLive ? "Open for bookings" : "Not accepting bookings"}</div>
            <div style={{ fontSize: T.caption, color: isLive ? C.slateLight : C.danger, ...fBody }}>{isLive ? "Clients can discover and book this program" : "Saved as a draft - hidden from clients until you publish"}</div>
          </div>
        </div>
        <Toggle label="Open for bookings" on={isLive} onClick={() => updateStatus(isLive ? "draft" : "live")} />
      </Card>

      <Card style={{ marginTop: 14, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}><Badge tone={isLive ? "success" : "neutral"}>{isLive ? "Live" : "Draft"}</Badge><Badge tone="orange">{program.type}</Badge><Badge tone="orange">{deliveryLabel}</Badge></div>
            <div style={{ fontSize: T.heading, fontWeight: 800, color: C.jet, ...fDisplay }}>{program.title}</div>
            <div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program.sport} · {program.ageRange} · {program.skillLevel}</div>
            <p style={{ margin: "10px 0 0", fontSize: T.body, lineHeight: 1.6, color: C.slate, ...fBody }}>{program.description}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: T.title, fontWeight: 800, color: C.jet, ...fDisplay }}>${program.price}</div><div style={{ marginTop: 4, fontSize: T.micro, color: C.slate, ...fBody }}>per participant</div></div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: T.captionLg, color: C.slate, ...fBody }}><span>{enrolled}/{capacity} participants booked</span><span>{participantsLeft} participant{participantsLeft === 1 ? "" : "s"} left</span></div>
          <div style={{ marginTop: 8 }}><ProgressBar value={fillPct} C={C} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}><CalendarDays size={15} color={C.brand} /><span>Next session: <strong>{program.nextDate || "To be confirmed"}</strong>{program.schedule ? ` · ${program.schedule}` : ""}</span></div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
        <StatCard icon={CalendarDays} value={programBookings.length} label="Bookings" C={C} />
        <StatCard icon={CheckCircle2} value={confirmedBookings.length} label="Confirmed" C={C} />
        <StatCard icon={CircleDollarSign} value={`$${Math.round(bookedValue)}`} label="Booked value" C={C} />
      </div>

      <SectionLabel style={{ marginTop: 24 }}>Program details</SectionLabel>
      <Card style={{ marginTop: 10, padding: "4px 14px" }}>
        <Row label="Format" value={program.type} />
        <Row label="Sport" value={program.sport} />
        <Row label="Age range" value={program.ageRange} />
        <Row label="Skill level" value={program.skillLevel} />
        <Row label="Duration" value={`${program.durationMinutes} min`} />
        <Row label="Delivery" value={deliveryLabel} />
        <Row label="Location" value={locationLabel} />
        <Row label="Schedule" value={program.schedule || "To be confirmed"} />
        <Row label="Coach assignment" value={program.assignmentMode === "client_selects" ? "Clients choose their coach" : "Business assigns a coach"} />
        <Row label="Waitlist" value={program.waitlist ? "Enabled" : "Not offered"} />
        <Row label="Serves minors" value={program.servesMinors ? "Yes - guardian consent required" : "No"} last />
      </Card>

      {eligibleCoaches.length ? <>
        <SectionLabel style={{ marginTop: 24 }}>Coaching team</SectionLabel>
        <Card style={{ marginTop: 10, padding: "4px 14px" }}>
          {eligibleCoaches.map((member, index) => <button key={member.id} type="button" onClick={() => nav("business-coach-detail", { id: member.id })} style={{ width: "100%", minHeight: 60, display: "flex", alignItems: "center", gap: 12, padding: "8px 0", border: "none", borderBottom: index < eligibleCoaches.length - 1 ? `1px solid ${C.border}` : "none", background: "transparent", cursor: "pointer", textAlign: "left" }}><Avatar name={member.name} size={38} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: T.body, fontWeight: 700, color: C.jet, ...oneLine, ...fBody }}>{member.name}</span><span style={{ display: "block", marginTop: 2, fontSize: T.captionLg, color: C.slate, ...fBody }}>{member.sport}</span></span><ChevronRight size={16} color={C.slateLight} /></button>)}
        </Card>
      </> : null}

      <SectionLabel style={{ marginTop: 24 }}>Recent bookings</SectionLabel>
      {programBookings.length ? <>
        {programBookings.slice(0, 4).map((booking) => {
          const coach = businessRoster.find((item) => item.id === booking.assignedCoachId);
          return <Card key={booking.id} onClick={() => nav("business-booking-detail", { id: booking.id })} ariaLabel={`Open booking from ${booking.clientName}`} style={{ marginTop: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...oneLine, ...fDisplay }}>{booking.clientName}</div>
                <div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{booking.participants} · {booking.date} · {booking.time}</div>
              </div>
              <StatusPill status={booking.status} perspective="business" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 11, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: T.captionLg, color: C.slate, ...fBody }}><span>{coach?.name || booking.coachName || "Coach not assigned"}</span><span style={{ fontWeight: 700, color: C.jet }}>${Number(booking.total ?? booking.price ?? 0).toFixed(2)}</span></div>
          </Card>;
        })}
        <div style={{ marginTop: 12 }}><Btn variant="outline" full onClick={() => nav("business-bookings")}>View all bookings</Btn></div>
      </> : <Card style={{ marginTop: 10, padding: 14, display: "flex", alignItems: "center", gap: 11 }}><CalendarDays size={18} color={C.slate} /><div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>No bookings for this program yet. Once clients book, their sessions will show up here.</div></Card>}
    </div>
    <div style={{ display: "flex", gap: 9, padding: "12px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white }}><Btn full icon={Pencil} onClick={() => nav("business-program-form", { id: program.id })}>Edit program</Btn></div>
  </div>;
}

const PROGRAM_TYPES = ["Group class", "1:1 coaching", "Term program", "Class pack", "Clinic", "Open training", "Small group"];
const PROGRAM_CADENCES = ["One-off session", "Weekly sessions", "Term program", "Flexible availability"];
const PROGRAM_DELIVERY_MODES = ["In-person", "Online", "Come to You"];

function toInputDate(value, legacyLabel) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const legacyMatch = String(legacyLabel || "").match(/(\d{1,2})\s+([A-Za-z]{3,9})/);
  if (legacyMatch) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(legacyMatch[2].slice(0, 3).toLowerCase());
    if (month >= 0) return `2026-${String(month + 1).padStart(2, "0")}-${String(Number(legacyMatch[1])).padStart(2, "0")}`;
  }
  return "2026-09-26";
}

function toInputTime(value) {
  if (value && /^\d{2}:\d{2}$/.test(value)) return value;
  const match = String(value || "").trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return "09:00";
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return `${String(Math.min(23, hour)).padStart(2, "0")}:${String(Math.min(59, minute)).padStart(2, "0")}`;
}

function formatProgramDate(value) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

function formatProgramTime(value) {
  if (!value) return "Time to be confirmed";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(`2026-01-01T${value}:00`));
}

function SelectField({ C, label, name, value, onChange, options, required }) {
  const id = `business-program-${name}`;
  const normalized = options.map((option) => ({ value: typeof option === "string" ? option : option.value, label: typeof option === "string" ? option : option.label }));
  const selected = normalized.find((option) => option.value === value);
  return <div style={{ display: "block", minWidth: 0 }}><div id={`${id}-label`} style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>{label}{required ? <span style={{ marginLeft: 3, color: C.brand }} aria-hidden="true">*</span> : null}</div><div style={{ marginTop: 6 }}><SearchSelect name={name} ariaLabel={label} options={normalized.map((option) => option.label)} value={selected?.label || ""} onChange={(nextLabel) => { const next = normalized.find((option) => option.label === nextLabel); onChange({ target: { name, value: next?.value || "" } }); }} allowCustom={false} placeholder={`Choose ${label.toLowerCase()}…`} /></div></div>;
}

function TextareaField({ C, label, name, value, onChange, placeholder, required }) {
  const id = `business-program-${name}`;
  return <label htmlFor={id} style={{ display: "block", minWidth: 0, fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>{label}{required ? <span style={{ marginLeft: 3, color: C.brand }} aria-hidden="true">*</span> : null}<textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={4} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, resize: "vertical", minHeight: 96, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", background: C.white, color: C.jet, fontSize: T.bodyLg, lineHeight: 1.45, ...fBody }} /></label>;
}

function BusinessLocationPreview({ C, location }) {
  const label = location?.name || "Custom venue";
  const address = location?.address || "Add an address to preview this venue";
  return <div role="img" aria-label={`Map preview for ${label}`} style={{ minHeight: 144, position: "relative", overflow: "hidden", borderRadius: 16, border: `1px solid ${C.border}`, background: C.fog, backgroundImage: `linear-gradient(24deg, transparent 42%, ${C.white} 43%, ${C.white} 46%, transparent 47%), linear-gradient(138deg, transparent 44%, ${C.white} 45%, ${C.white} 48%, transparent 49%), linear-gradient(90deg, transparent 48%, ${C.border} 49%, ${C.border} 51%, transparent 52%)` }}><div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 28%, ${C.brandTint}, transparent 28%), radial-gradient(circle at 75% 66%, ${C.successTint}, transparent 25%)`, opacity: .7 }} /><div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 42, height: 42, borderRadius: 999, display: "grid", placeItems: "center", background: C.brand, color: C.white, boxShadow: `0 6px 18px ${C.brandTint}` }}><MapPin size={21} fill={C.brand} color={C.white} /></div><div style={{ position: "absolute", left: 12, right: 12, bottom: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 11, background: C.white, border: `1px solid ${C.border}`, boxShadow: `0 2px 8px ${C.border}` }}><MapPin aria-hidden="true" size={14} color={C.brand} /><div style={{ minWidth: 0 }}><div style={{ fontSize: T.caption, fontWeight: 700, color: C.jet, ...oneLine, ...fBody }}>{label}</div><div style={{ marginTop: 2, fontSize: T.micro, color: C.slate, ...oneLine, ...fBody }}>{address}</div></div></div></div>;
}

function formatBusinessAddress(area, streetAddress) {
  const areaLabel = area ? [area.suburb, area.state, area.postcode].filter(Boolean).join(", ") : "";
  return [streetAddress?.trim(), areaLabel].filter(Boolean).join(", ");
}

export function ScreenBusinessProgramForm() {
  const { darkMode, nav, params, business, businessPrograms, businessLocations, businessRoster, saveBusinessProgram, saveBusinessLocation, toast } = useApp();
  const C = darkMode ? CD : CL;
  const existing = businessPrograms.find((item) => item.id === params?.id);
  const locations = businessLocations.filter((item) => item.businessId === business.id);
  const coaches = businessRoster.filter((item) => item.businessId === business.id && item.status === "active" && item.verification === "verified");
  const existingLocation = locations.find((item) => item.id === existing?.locationId);
  const scheduleTime = existing?.startTime || String(existing?.schedule || "").split("·")[1]?.trim();
  const initialDeliveryMode = existing?.deliveryMode || existing?.mode || "In-person";
  const [step, setStep] = useState(1);
  const [locationMode, setLocationMode] = useState(existingLocation ? "saved" : (locations.length ? "saved" : "custom"));
  const [customLocation, setCustomLocation] = useState({ name: existingLocation ? "" : (existing?.locationName || ""), streetAddress: existingLocation ? "" : (existing?.locationAddress || ""), area: existing?.locationArea || null, indoor: existing?.indoor ?? false });
  const [form, setForm] = useState(() => ({
    title: existing?.title || "", sport: existing?.sport || business.sports?.[0] || SPORT_NAMES[0], description: existing?.description || "", type: existing?.type || "Group class", ageRange: existing?.ageRange || "18+", skillLevel: existing?.skillLevel || "All levels", durationMinutes: existing?.durationMinutes || 60, price: existing?.price ?? 50, capacity: existing?.capacity || 8, enrolled: existing?.enrolled || 0, locationId: existing?.locationId || locations[0]?.id || "", deliveryMode: initialDeliveryMode, travelArea: existing?.travelArea || "", assignmentMode: existing?.assignmentMode || "business_assigns", eligibleCoachIds: existing?.eligibleCoachIds || [], startDate: toInputDate(existing?.startDate, existing?.nextDate), startTime: toInputTime(scheduleTime), cadence: existing?.cadence || (existing?.type === "Term program" ? "Term program" : "Weekly sessions"), status: existing?.status || "draft", servesMinors: existing?.servesMinors || false, waitlist: existing?.waitlist ?? true,
  }));
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectedLocation = locations.find((location) => location.id === form.locationId);
  const previewLocation = form.deliveryMode !== "In-person" ? null : locationMode === "custom" ? { name: customLocation.name || "Custom venue", address: formatBusinessAddress(customLocation.area, customLocation.streetAddress) || "Add an address to preview this venue" } : selectedLocation;
  const next = () => {
    if (step === 1 && (!form.title.trim() || !form.description.trim() || !form.sport || !form.type || Number(form.price) <= 0 || Number(form.capacity) <= 0)) { toast("Complete the required program details"); return; }
    if (step === 2 && (!form.startDate || !form.startTime || (form.deliveryMode === "In-person" && (locationMode === "saved" ? !form.locationId : (!customLocation.name.trim() || !customLocation.streetAddress.trim() || !customLocation.area))))) { toast("Add a date, time and location"); return; }
    setStep((value) => Math.min(3, value + 1));
  };
  const save = () => {
    if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.startTime) { toast("Complete the required program details"); setStep(1); return; }
    let locationId = form.locationId;
    if (form.deliveryMode === "In-person" && locationMode === "custom") {
      const savedLocation = saveBusinessLocation({ id: form.locationId || undefined, name: customLocation.name.trim(), address: formatBusinessAddress(customLocation.area, customLocation.streetAddress), locationArea: customLocation.area, indoor: customLocation.indoor, accessibility: "Contact the venue for access details", amenities: [], instructions: "", weatherPolicy: customLocation.indoor ? "Indoor venue — sessions run in all weather." : "Weather updates are sent before the session." });
      locationId = savedLocation.id;
    }
    const schedule = `${form.cadence === "One-off session" ? "One-off" : form.cadence.replace(" sessions", "")} · ${formatProgramTime(form.startTime)}`;
    const savedLocationId = form.deliveryMode === "In-person" ? locationId : null;
    saveBusinessProgram({ ...form, locationId: savedLocationId, mode: form.deliveryMode, schedule, nextDate: formatProgramDate(form.startDate), date: form.startDate, time: form.startTime, startDate: form.startDate, startTime: form.startTime, locationName: form.deliveryMode === "Online" ? "Online session" : form.deliveryMode === "Come to You" ? "Coach travels to client" : previewLocation?.name, locationAddress: form.deliveryMode === "In-person" ? previewLocation?.address : "", price: Number(form.price), capacity: Number(form.capacity), durationMinutes: Number(form.durationMinutes) });
    toast(existing ? "Program updated" : "Program created");
    nav("business-programs");
  };
  const stepLabels = ["Basics", "Schedule & location", "Team & publish"];
  return <div style={page(C)}><TopBar title={existing ? "Edit program" : "Create a program"} subtitle={stepLabels[step - 1]} onBack={() => nav("business-programs")} />
    <div style={{ ...scroll, paddingBottom: 116 }} className="cl-hide-scrollbar"><div style={{ paddingTop: 14 }}><StepProgress step={step} total={3} label={stepLabels[step - 1]} />
      {step === 1 ? <div style={{ display: "grid", gap: 14 }}><Card style={{ padding: 15, background: C.fog }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Build a clear offer</div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>Clients should understand who the program is for, what they’ll do and what they’ll pay.</div></Card><Field label="Program title" name="program-title" placeholder="e.g., Junior Development Program" value={form.title} onChange={(e) => set("title", e.target.value)} required /><SelectField C={C} label="Sport" name="sport" value={form.sport} onChange={(e) => set("sport", e.target.value)} options={SPORT_NAMES} required /><SelectField C={C} label="Program format" name="type" value={form.type} onChange={(e) => set("type", e.target.value)} options={PROGRAM_TYPES} required /><TextareaField C={C} label="Client-facing description" name="description" placeholder="Explain the outcomes, session style and what clients can expect…" value={form.description} onChange={(e) => set("description", e.target.value)} required /><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><Field label="Price (AUD)" name="price" type="number" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} required /><Field label="Places" name="capacity" type="number" inputMode="numeric" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} required /></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><SelectField C={C} label="Age range" name="age-range" value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)} options={["All ages", "8–14", "13+", "16+", "18+"]} /><SelectField C={C} label="Skill level" name="skill-level" value={form.skillLevel} onChange={(e) => set("skillLevel", e.target.value)} options={["All levels", "Beginner", "Beginner to intermediate", "Intermediate", "Intermediate to advanced", "Advanced"]} /></div></div> : null}
      {step === 2 ? <div style={{ display: "grid", gap: 14 }}><Card style={{ padding: 15, background: C.fog }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Make the next session obvious</div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>Use the date and time controls so clients see a consistent booking summary.</div></Card><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><Field label="First session date" name="start-date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required /><Field label="Start time" name="start-time" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} required /></div><SelectField C={C} label="Cadence" name="cadence" value={form.cadence} onChange={(e) => set("cadence", e.target.value)} options={PROGRAM_CADENCES} required /><SelectField C={C} label="Delivery mode" name="delivery-mode" value={form.deliveryMode} onChange={(e) => { const nextMode = e.target.value; set("deliveryMode", nextMode); if (nextMode !== "In-person") set("locationId", ""); else if (!form.locationId && locations[0]?.id) set("locationId", locations[0].id); }} options={PROGRAM_DELIVERY_MODES} required />{form.deliveryMode === "In-person" ? <><div><div style={{ marginBottom: 8, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>Where will it run?</div><SegTabs items={locations.length ? [{ value: "saved", label: "Saved location" }, { value: "custom", label: "Add custom venue" }] : [{ value: "custom", label: "Add custom venue" }]} value={locationMode} onChange={(value) => { setLocationMode(value); if (value === "saved" && !form.locationId) set("locationId", locations[0]?.id || ""); if (value === "custom") set("locationId", ""); }} /></div>{locationMode === "saved" ? <SelectField C={C} label="Business location" name="location" value={form.locationId} onChange={(e) => set("locationId", e.target.value)} options={locations.map((location) => ({ value: location.id, label: location.name }))} required /> : <Card style={{ padding: 14, display: "grid", gap: 12, background: C.fog }}><Field label="Venue name" name="custom-venue-name" placeholder="e.g., Riverside Reserve" value={customLocation.name} onChange={(e) => setCustomLocation((current) => ({ ...current, name: e.target.value }))} required /><LocationField value={customLocation.area} onChange={(area) => setCustomLocation((current) => ({ ...current, area }))} label="Find venue area" helper="Search an address, suburb or postcode, or detect your current location" placeholder="Search address, suburb or postcode…" required /><Field label="Street address" name="custom-venue-address" placeholder="e.g., 18 Ocean Street" value={customLocation.streetAddress} onChange={(e) => setCustomLocation((current) => ({ ...current, streetAddress: e.target.value }))} required /><CheckboxRow label="Indoor venue" checked={customLocation.indoor} onClick={() => setCustomLocation((current) => ({ ...current, indoor: !current.indoor }))} /></Card>}<BusinessLocationPreview C={C} location={previewLocation} /></> : form.deliveryMode === "Online" ? <Card style={{ padding: 15, display: "flex", gap: 11, alignItems: "flex-start", background: C.brandTint, border: "none" }}><PlayCircle size={19} color={C.brand} /><div><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Online session</div><div style={{ marginTop: 3, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>Clients will receive the online access details after their booking is confirmed.</div></div></Card> : <Card style={{ padding: 14, display: "grid", gap: 12, background: C.fog }}><div style={{ fontSize: T.body, lineHeight: 1.5, color: C.slate, ...fBody }}>The coach travels to the client. Add a service area so clients know where you operate.</div><Field label="Service area (optional)" name="travel-area" placeholder="e.g., Within 10 km of Broadbeach" value={form.travelArea} onChange={(e) => set("travelArea", e.target.value)} /></Card>}</div> : null}
      {step === 3 ? <div style={{ display: "grid", gap: 14 }}><Card style={{ padding: 15, background: C.fog }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Set up your delivery team</div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>Choose how bookings are matched and which verified coaches can deliver this program.</div></Card><Card style={{ padding: 14 }}><Row label="Program" value={form.title || "Untitled program"} /><Row label="First session" value={`${formatProgramDate(form.startDate)} · ${formatProgramTime(form.startTime)}`} /><Row label="Delivery" value={form.deliveryMode} />{form.deliveryMode === "In-person" ? <Row label="Location" value={previewLocation?.name || "To be confirmed"} last /> : <Row label="Location" value={form.deliveryMode === "Online" ? "Online session" : form.travelArea || "Coach travels to client"} last />}</Card><div><div style={{ marginBottom: 8, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>Coach assignment</div><SegTabs items={[{ value: "business_assigns", label: "We assign" }, { value: "client_selects", label: "Client chooses" }]} value={form.assignmentMode} onChange={(value) => set("assignmentMode", value)} /></div><div><div style={{ marginBottom: 8, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}>Eligible verified coaches</div>{coaches.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{coaches.map((coach) => <Chip key={coach.id} active={form.eligibleCoachIds.includes(coach.id)} onClick={() => set("eligibleCoachIds", form.eligibleCoachIds.includes(coach.id) ? form.eligibleCoachIds.filter((id) => id !== coach.id) : [...form.eligibleCoachIds, coach.id])}>{coach.name}</Chip>)}</div> : <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Invite and verify a coach before publishing this program.</div>}</div><Card style={{ padding: "4px 14px" }}><CheckboxRow label="This program serves participants under 18" checked={form.servesMinors} onClick={() => set("servesMinors", !form.servesMinors)} /><CheckboxRow label="Enable a waitlist when full" checked={form.waitlist} onClick={() => set("waitlist", !form.waitlist)} /></Card><SelectField C={C} label="Publishing status" name="status" value={form.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "draft", label: "Save as draft" }, { value: "live", label: "Publish immediately" }]} /></div> : null}
    </div></div>
    <div style={{ display: "flex", gap: 9, padding: "12px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white }}>{step > 1 ? <Btn variant="outline" onClick={() => setStep((value) => value - 1)}>Back</Btn> : null}<Btn full onClick={step < 3 ? next : save}>{step < 3 ? "Continue" : (existing ? "Save changes" : form.status === "live" ? "Publish program" : "Save draft")}</Btn></div>
  </div>;
}

export function ScreenBusinessBookingDetail() {
  const { darkMode, nav, params, business, businessBookings, businessPrograms, businessRoster, businessLocations, sessionDisputes, additionalCharges, updateBusinessBooking, pushNotification, toast } = useApp();
  const C = darkMode ? CD : CL;
  const ownBookings = businessBookings.filter((item) => item.businessId === business.id);
  const booking = ownBookings.find((item) => item.id === params?.id) || ownBookings[0];
  const program = businessPrograms.find((item) => item.id === booking?.programId);
  const location = businessLocations.find((item) => item.id === program?.locationId);
  const deliveryMode = program?.deliveryMode || program?.mode || "In-person";
  const deliveryLabel = deliveryMode === "Online" ? "Online session" : deliveryMode === "Come to You" ? (program?.travelArea ? `Coach travels to client · ${program.travelArea}` : "Coach travels to client") : location?.name || booking?.mode || "To be confirmed";
  const eligible = businessRoster.filter((item) => program?.eligibleCoachIds?.includes(item.id) && item.status === "active" && item.verification === "verified" && (!program.servesMinors || item.wwcc === "current"));
  const [coachId, setCoachId] = useState(booking?.assignedCoachId || eligible[0]?.id || "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({ date: booking?.date || "", time: booking?.time || "" });
  if (!booking) return <EmptyState icon={CalendarDays} title="Booking not found" body="Return to your dashboard and choose another request." />;
  const assignedCoach = businessRoster.find((item) => item.id === booking.assignedCoachId);
  const relatedCase = sessionDisputes.find((item) => item.bookingId === booking.id);
  const finalCharge = additionalCharges.find((item) => item.bookingId === booking.id && item.phase === "completion" && item.status !== "cancelled");
  const paid = ["held", "released", "refunded"].includes(booking.paymentStatus);
  const accept = () => { if (!coachId) { toast("Assign an eligible coach first"); return; } const coach = eligible.find((item) => item.id === coachId); updateBusinessBooking(booking.id, { status: "awaiting_payment", assignedCoachId: coachId, coachId, coachName: coach?.name || "Assigned coach", paymentStatus: "due" }); pushNotification({ audience: "client", type: "payment", title: "Coach assigned — payment ready", body: `${coach?.name || "Your coach"} has been assigned to ${program?.title || "your program"}. Pay now to secure the booking.`, bookingId: booking.id }); toast("Booking accepted — payment requested"); nav("business-bookings"); };
  const decline = () => { updateBusinessBooking(booking.id, { status: "declined", paymentStatus: "not_requested" }); pushNotification({ audience: "client", type: "booking", title: "Program request declined", body: `${business.tradingName} could not accept your request for ${program?.title || "this program"}.`, bookingId: booking.id }); toast("Booking declined"); nav("business-bookings"); };
  const cancel = () => { updateBusinessBooking(booking.id, { status: "cancelled", paymentStatus: paid ? "refunded" : "not_requested", refundStatus: paid ? "processing" : null }); pushNotification({ audience: "client", type: "booking", title: "Business booking cancelled", body: `${business.tradingName} cancelled ${program?.title || booking.service}. ${paid ? "Your refund is being processed." : "No payment was collected."}`, bookingId: booking.id }); setCancelOpen(false); toast("Booking cancelled"); nav("business-bookings"); };
  const reschedule = () => { if (!scheduleDraft.date.trim() || !scheduleDraft.time.trim()) { toast("Add a date and time"); return; } updateBusinessBooking(booking.id, scheduleDraft); pushNotification({ audience: "client", type: "booking", title: "Business booking rescheduled", body: `${program?.title || booking.service} moved to ${scheduleDraft.date} at ${scheduleDraft.time}.`, bookingId: booking.id }); setRescheduleOpen(false); toast("Booking rescheduled"); };
  const messageClient = () => nav("chat-thread", { name: booking.clientName, context: `${program?.title || booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "business-booking-detail", backParams: { id: booking.id } });
  const reportIssue = () => nav("dispute-create", { bookingId: booking.id, role: "coach", category: "client_no_show", backTo: "business-booking-detail", backParams: { id: booking.id } });
  return <div style={page(C)}><TopBar title="Booking details" onBack={() => nav("business-bookings")} right={<StatusPill status={booking.status} perspective="business" />} />
    <div style={{ ...scroll, paddingTop: 10, paddingBottom: 32 }} className="cl-hide-scrollbar">
      <Card style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}><div><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{program?.title || booking.service}</div><div style={{ marginTop: 5, color: C.slate, fontSize: T.body, ...fBody }}>{booking.clientName} · {booking.participants}</div></div><span style={{ width: 38, height: 38, borderRadius: 12, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CalendarDays size={18} color={C.brand} /></span></div><div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}><Row label="Date and time" value={`${booking.date} · ${booking.time}`} /><Row label="Delivery" value={deliveryLabel} /><Row label="Session total" value={`$${Number(booking.total || booking.price || 0).toFixed(2)}`} bold last /></div></Card>
      {booking.status === "awaiting_payment" ? <Card style={{ padding: 14, marginTop: 12, background: C.warnTint, border: "none", display: "flex", gap: 11 }}><Clock3 size={19} color={C.warnStrong} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Waiting for client payment</div><div style={{ marginTop: 3, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>The assigned coach and price are locked. The place confirms when payment is secured.</div></div></Card> : null}
      <SectionLabel style={{ marginTop: 24 }}>{booking.status === "pending" ? "Assign a verified coach" : "Assigned coach"}</SectionLabel><div style={{ display: "grid", gap: 8, marginTop: 10 }}>{booking.status === "pending" ? eligible.map((coach) => <Card key={coach.id} onClick={() => setCoachId(coach.id)} ariaLabel={`Assign ${coach.name}`} style={{ padding: 13, border: `1.5px solid ${coachId === coach.id ? C.brand : C.border}`, display: "flex", alignItems: "center", gap: 11 }}><Avatar name={coach.name} size={42} /><div style={{ flex: 1 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{coach.name}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{coach.sport} · WWCC current</div></div>{coachId === coach.id ? <CheckCircle2 size={20} color={C.brand} /> : null}</Card>) : <Card onClick={assignedCoach ? () => nav("business-coach-detail", { id: assignedCoach.id }) : undefined} style={{ padding: 13, display: "flex", alignItems: "center", gap: 11 }}><Avatar name={assignedCoach?.name || booking.coachName || "Coach"} size={42} /><div style={{ flex: 1 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{assignedCoach?.name || booking.coachName || "Assignment pending"}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{assignedCoach ? `${assignedCoach.sport} · ${assignedCoach.verification === "verified" ? "Verified" : "Checks pending"}` : "The coach will appear here when assigned"}</div></div>{assignedCoach ? <ChevronRight size={17} color={C.slateLight} /> : null}</Card>}</div>
      {booking.includesMinor ? <Card style={{ padding: 14, marginTop: 12, background: C.brandTint }}><div style={{ display: "flex", gap: 10 }}><UserCheck size={19} color={C.brand} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Minor participant safeguards</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{booking.guardianName || "Guardian not provided"}{booking.guardianPhone ? ` · ${booking.guardianPhone}` : ""}</div></div></div></Card> : null}
      {relatedCase ? <Card onClick={() => nav("dispute-status", { caseId: relatedCase.id, role: "coach", backTo: "business-booking-detail", bookingId: booking.id })} style={{ padding: 14, marginTop: 12, background: C.warnTint, border: "none", display: "flex", alignItems: "center", gap: 10 }}><Scale size={18} color={C.warnStrong} /><div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Session report {relatedCase.status.replaceAll("_", " ")}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{relatedCase.categoryLabel} · View case timeline</div></div><ChevronRight size={17} color={C.slateLight} /></Card> : null}
      <SectionLabel style={{ marginTop: 24 }}>Booking journey</SectionLabel><div style={{ marginTop: 10 }}><SessionJourneyTimeline booking={booking} role="coach" compact /></div>
      <div style={{ display: "grid", gap: 9, marginTop: 20 }}>
        {booking.status === "pending" ? <><Btn full onClick={accept}>Accept & request payment</Btn><Btn full variant="danger" onClick={decline}>Decline request</Btn></> : null}
        {booking.status === "confirmed" ? <Btn full icon={PlayCircle} onClick={() => nav("coach-session-start", { bookingId: booking.id, role: "coach", backTo: "business-booking-detail", backParams: { id: booking.id } })}>Open session check-in</Btn> : null}
        {booking.status === "in_progress" ? <><Btn full icon={PlayCircle} onClick={() => nav("session-progress", { bookingId: booking.id, role: "coach", backTo: "business-booking-detail", backParams: { id: booking.id } })}>View live session</Btn><Btn full variant="outline" onClick={() => nav("session-completion", { bookingId: booking.id, role: "coach", backTo: "business-booking-detail", backParams: { id: booking.id } })}>Finish session</Btn></> : null}
        {booking.status === "completion_pending" ? <Btn full icon={finalCharge ? CreditCard : CheckCircle2} onClick={() => nav("session-completion", { bookingId: booking.id, role: "coach", backTo: "business-booking-detail", backParams: { id: booking.id } })}>{finalCharge ? "Review final payment" : "Finish session"}</Btn> : null}
        {booking.status === "completed" ? <Btn full icon={Banknote} onClick={() => nav("funds-release-status", { bookingId: booking.id, role: "coach", backTo: "business-booking-detail", backParams: { id: booking.id } })}>View payout release</Btn> : null}
        {!['pending', 'declined', 'cancelled', 'expired'].includes(booking.status) ? <Btn full variant="outline" icon={CalendarDays} onClick={() => setRescheduleOpen(true)}>Reschedule booking</Btn> : null}
        <Btn full variant="outline" icon={MessageCircle} onClick={messageClient}>Message client</Btn>
        {!relatedCase && ['confirmed', 'in_progress', 'completion_pending', 'completed'].includes(booking.status) ? <Btn full variant="ghost" icon={Scale} onClick={reportIssue}>Report a session issue</Btn> : null}
        {['awaiting_payment', 'confirmed'].includes(booking.status) ? <Btn full variant="danger" onClick={() => setCancelOpen(true)}>Cancel booking</Btn> : null}
      </div>
    </div>
    <BottomSheet open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule booking" heightPct={46}><div style={{ display: "grid", gap: 14 }}><div style={{ fontSize: T.body, lineHeight: 1.55, color: C.slate, ...fBody }}>Confirm the new time with the client. They’ll receive an immediate booking update.</div><Field label="New date" value={scheduleDraft.date} onChange={(event) => setScheduleDraft((current) => ({ ...current, date: event.target.value }))} /><Field label="New time" value={scheduleDraft.time} onChange={(event) => setScheduleDraft((current) => ({ ...current, time: event.target.value }))} /><Btn full onClick={reschedule}>Save new time</Btn></div></BottomSheet>
    <BottomSheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking" heightPct={42}><div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.6, ...fBody }}>The client will be notified immediately. {paid ? "Their secured payment will move into refund processing." : "No payment has been collected."}</div><Card style={{ marginTop: 14, padding: 14, background: paid ? C.warnTint : C.fog }}><Row label="Payment outcome" value={paid ? "Refund processing" : "$0.00 collected"} bold last /></Card><div style={{ display: "grid", gap: 9, marginTop: 18 }}><Btn full variant="danger" onClick={cancel}>Confirm cancellation</Btn><Btn full variant="ghost" onClick={() => setCancelOpen(false)}>Keep booking</Btn></div></BottomSheet>
  </div>;
}

export function ScreenBusinessMore() {
  const { darkMode, nav, business, businessMedia, businessReviews } = useApp(); const C = darkMode ? CD : CL;
  const ownMedia = businessMedia.filter((item) => item.businessId === business.id);
  const visibleReviews = (businessReviews[business.id] || []).filter((review) => !review.hidden);
  const reviewCount = visibleReviews.length || business.profile?.reviews || 9;
  const ratingAvg = visibleReviews.length
    ? (visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length).toFixed(1)
    : (business.profile?.rating || "4.8");
  return (
    <div style={page(C)}>
      <TopBar title="Account" subtitle="Manage your organisation" border={false} />
      <div style={{ ...scroll, paddingTop: 14 }} className="cl-hide-scrollbar">
        <Card style={{ padding: 0, overflow: "hidden", textAlign: "center" }}>
          <div style={{ height: 86, background: business.profile?.bannerGradient || business.profile?.backgroundImage || C.brand }} />
          <div style={{ marginTop: -38, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 76, height: 76, borderRadius: 18, background: C.white, padding: 5, boxShadow: "0 6px 18px rgba(0,0,0,.12)", border: `2.5px solid ${C.white}`, overflow: "hidden" }}>
              <img src={business.profile.logo} alt={business.tradingName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
          <div style={{ padding: "9px 16px 16px" }}>
            <div style={{ fontSize: T.heading, fontWeight: 700, color: C.jet, ...fDisplay }}>{business.tradingName}</div>
            <div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{business.sports.join(" · ")}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 9 }}>
              <Badge tone="success">Business verified</Badge>
              <Badge tone="success">Insured</Badge>
            </div>
            <div style={{ marginTop: 14 }}>
              <Btn full size="sm" variant="secondary" onClick={() => nav("business-profile-edit")}>Edit business profile</Btn>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Reels & photos</SectionLabel>
          <BusinessProfileMediaSummary C={C} media={ownMedia} onManage={() => nav("business-media")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Reviews</SectionLabel>
          <BusinessProfileReviewsSummary C={C} reviews={visibleReviews} ratingAvg={ratingAvg} reviewCount={reviewCount} onManage={() => nav("business-reviews")} />
        </div>

        <div style={{ marginTop: 24 }}>
          <SettingsGroup title="Organisation">
            <SettingsRow icon={MessageCircle} label="Messages" sub="Client enquiries and coach conversations" onClick={() => nav("business-messages")} />
            <SettingsRow icon={MapPin} label="Locations" sub="Facilities, access and weather rules" onClick={() => nav("business-locations")} />
            <SettingsRow icon={CircleDollarSign} label="Finance & billing" sub="Subscription, invoices and payouts" onClick={() => nav("business-finance")} />
            <SettingsRow icon={BarChart3} label="Analytics" sub="Views, conversion and occupancy" onClick={() => nav("business-analytics")} />
          </SettingsGroup>
        </div>

        <SettingsGroup title="Application">
          <SettingsRow icon={ClipboardCheck} label="Launch checklist" sub={BUSINESS_STATUS_LABELS[business.status]} onClick={() => nav("business-compliance")} />
          <SettingsRow icon={HelpCircle} label="Help & support" sub="Get help with your business account" onClick={() => nav("support", { faqTopic: "business", backTo: "business-more" })} />
        </SettingsGroup>
      </div>
    </div>
  );
}

export function ScreenBusinessLocations() {
  const { darkMode, nav, business, businessLocations, saveBusinessLocation, toast } = useApp(); const C = darkMode ? CD : CL;
  const locations = businessLocations.filter((item) => item.businessId === business.id); const [adding, setAdding] = useState(false); const [name, setName] = useState(""); const [streetAddress, setStreetAddress] = useState(""); const [area, setArea] = useState(null);
  const save = () => { if (!name.trim() || !streetAddress.trim() || !area) { toast("Add a name, street address and area"); return; } saveBusinessLocation({ name: name.trim(), address: formatBusinessAddress(area, streetAddress), locationArea: area, indoor: false, accessibility: "Contact the venue for access details", amenities: [], instructions: "", weatherPolicy: "Updates are sent before the session." }); setName(""); setStreetAddress(""); setArea(null); setAdding(false); toast("Location added"); };
  return <div style={page(C)}><TopBar title="Locations" onBack={() => nav("business-more")} right={<Btn size="sm" icon={Plus} onClick={() => setAdding((value) => !value)}>Add</Btn>} /><div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar">{adding ? <Card style={{ padding: 14, marginTop: 8, display: "grid", gap: 12 }}><Field label="Location name" placeholder="e.g., Broadbeach Courts" value={name} onChange={(e) => setName(e.target.value)} required /><LocationField value={area} onChange={setArea} label="Find suburb or postcode" helper="Search an address, suburb or detect your current location" placeholder="Search address, suburb or postcode…" required /><Field label="Street address" placeholder="e.g., 18 Ocean Street" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required /><BusinessLocationPreview C={C} location={{ name: name || "New business location", address: formatBusinessAddress(area, streetAddress) || "Add an address to preview this venue" }} /><Btn full onClick={save}>Save location</Btn></Card> : null}{locations.map((location) => <Card key={location.id} style={{ padding: 15, marginTop: 10 }}><div style={{ display: "flex", gap: 11 }}><MapPin size={19} color={C.brand} /><div><div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{location.name}</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{location.address}</div></div></div><div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}><Badge tone="success">{location.indoor ? "Indoor" : "Outdoor"}</Badge><Badge tone="neutral">{location.accessibility}</Badge></div><div style={{ marginTop: 11, fontSize: T.captionLg, color: C.slate, ...fBody }}>{location.weatherPolicy}</div></Card>)}</div></div>;
}

export function ScreenBusinessProfile() {
  return <ScreenBusinessMore />;
}

function BusinessProfileMediaSummary({ C, media, onManage }) {
  if (!media.length) {
    return (
      <div style={{ fontSize: T.labelLg, color: C.slateLight, marginBottom: 22, ...fBody }}>
        No reels or photos yet — add some so clients can see your organisation in action.
      </div>
    );
  }

  return (
    <>
      <div className="cl-hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {media.slice(0, 6).map((item) => {
          const isReel = item.type === "reel";
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Manage ${item.caption || "media"}`}
              onClick={onManage}
              style={{ width: 76, minWidth: 76, minHeight: 0, aspectRatio: "3 / 4", padding: 0, overflow: "hidden", borderRadius: 14, flexShrink: 0, cursor: "pointer", background: C.fog, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            >
              {item.url ? (
                isReel
                  ? <video src={item.url} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <img src={item.url} alt={item.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: 99, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isReel ? <Play size={11} color={C.white} fill={C.white} /> : <ImageIcon size={12} color={C.white} />}
                </div>
              )}
              {item.url && isReel && (
                <div style={{ position: "absolute", bottom: 6, left: 6, width: 22, height: 22, borderRadius: 99, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={9} color={C.white} fill={C.white} />
                </div>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onManage}
          style={{
            width: 76, aspectRatio: "3/4", borderRadius: 14, flexShrink: 0, cursor: "pointer",
            background: C.fog, border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
          }}
        >
          <ChevronRight size={14} color={C.slate} />
          <span style={{ fontSize: T.tiny, fontWeight: 600, color: C.slate, ...fBody }}>See all {media.length}</span>
        </button>
      </div>
      <div style={{ marginBottom: 4 }}>
        <Btn full variant="outline" size="sm" icon={Film} onClick={onManage}>Manage reels & photos</Btn>
      </div>
    </>
  );
}

function BusinessProfileReviewsSummary({ C, reviews, ratingAvg, reviewCount, onManage }) {
  return (
    <>
      <Card style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: T.hero, fontWeight: 700, color: C.jet, ...fDisplay }}>{ratingAvg}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
            <Star size={12} fill={C.brand} color={C.brand} />
            <span style={{ fontSize: T.label, color: C.slate, ...fBody }}>{reviewCount} reviews</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Athletes rate you {ratingAvg} / 5</div>
          <div style={{ fontSize: T.label, color: C.slate, marginTop: 3, lineHeight: 1.5, ...fBody }}>
            Every review comes from a verified booking. Replying publicly helps build trust.
          </div>
        </div>
      </Card>
      <Btn full variant="outline" size="sm" icon={Star} onClick={onManage}>Manage reviews</Btn>
    </>
  );
}

export function ScreenBusinessProfileEdit() {
  const { darkMode, nav, business, updateBusiness, completeBusinessChecklistItem, toast } = useApp(); const C = darkMode ? CD : CL; const logoInput = useRef(null);
  const [draft, setDraft] = useState(() => ({ name: business.tradingName, website: business.website || "", email: business.ownerEmail || "", phone: business.phone || "", description: business.profile?.description || "", philosophy: business.profile?.philosophy || "", logo: business.profile?.logo || "" }));
  const chooseLogo = (event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) setDraft((current) => ({ ...current, logo: URL.createObjectURL(file) })); };
  const save = () => { if (!draft.name.trim()) return toast("Add your business name"); updateBusiness({ tradingName: draft.name.trim(), ownerEmail: draft.email.trim(), phone: draft.phone.trim(), website: draft.website.trim(), profile: { ...business.profile, logo: draft.logo, description: draft.description.trim(), philosophy: draft.philosophy.trim() } }); completeBusinessChecklistItem("profile"); toast("Business profile updated"); nav("business-more"); };
  return <div style={page(C)}><TopBar title="Edit business profile" onBack={() => nav("business-more")} /><div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar"><Card style={{ marginTop: 8, padding: 15, display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 72, height: 72, borderRadius: 18, background: C.fog, padding: 5, overflow: "hidden", border: `1px solid ${C.border}` }}><img src={draft.logo} alt="Business logo preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div><div style={{ flex: 1 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Business logo</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>Square PNG or JPG works best.</div><input ref={logoInput} type="file" accept="image/*" onChange={chooseLogo} style={{ display: "none" }} /><div style={{ marginTop: 9 }}><Btn size="sm" variant="outline" icon={UploadCloud} onClick={() => logoInput.current?.click()}>Change logo</Btn></div></div></Card><div style={{ display: "grid", gap: 14, marginTop: 18 }}><Field label="Trading name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required /><Field label="Website" placeholder="yourbusiness.com.au" value={draft.website} onChange={(e) => setDraft((d) => ({ ...d, website: e.target.value }))} /><Field label="Client contact email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} /><Field label="Client contact phone" placeholder="04XX XXX XXX" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} /><Field label="About your organisation" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} /><Field label="Coaching philosophy" value={draft.philosophy} onChange={(e) => setDraft((d) => ({ ...d, philosophy: e.target.value }))} /><Card style={{ padding: 13, background: C.fog }}><Row label="Legal entity" value={business.legalName || "Registered business"} /><Row label="Business registration" value={business.abn || "Verified"} last /></Card><Btn full onClick={save}>Save changes</Btn></div></div></div>;
}

const UPLOAD_GUIDELINES = [
  "Upload only content you own or have permission to use.",
  "Reels should run 15–30 seconds and never exceed 60 seconds.",
  "Vertical 9:16 format at 1080 × 1920 px is recommended.",
  "Keep uploads relevant and appropriate - no offensive, misleading, unsafe or confidential material.",
  "Get consent from anyone featured, including a parent or guardian for anyone under 18.",
  "Uploaded content appears publicly on your profile and may be reviewed or removed if it breaches our Community Guidelines or Terms of Use.",
];

export function ScreenBusinessMedia() {
  const { darkMode, nav, business, businessMedia, addBusinessMedia, removeBusinessMedia, toast } = useApp();
  const C = darkMode ? CD : CL;
  const fileInputRef = useRef(null);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const media = businessMedia.filter((item) => item.businessId === business.id);

  /* One tile in the reels & photos grid. Video tiles use the actual clip so
     the preview always matches what clients will watch. */
  function MediaTile({ item, onDelete, onOpen }) {
    const isReel = item.type === "reel";
    return (
      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          style={{
            width: "100%", aspectRatio: "4 / 5", borderRadius: 16, overflow: "hidden", position: "relative",
            background: C.fog, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open ${item.caption || (isReel ? "reel" : "photo")}`}
          onClick={onOpen}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen?.(); } }}
        >
          {item.url ? (
            isReel ? (
              <video src={item.url} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <img src={item.url} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isReel ? <Play size={14} color={C.white} fill={C.white} /> : <ImageIcon size={15} color={C.white} />}
            </div>
          )}
          {item.url && isReel && (
            <div style={{ position: "absolute", bottom: 8, left: 8, width: 28, height: 28, borderRadius: 99, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={11} color={C.white} fill={C.white} />
            </div>
          )}
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onDelete(); }}
            aria-label={`Remove ${item.caption || "media"}`}
            title="Remove media"
            style={{
              position: "absolute", top: 6, right: 6, width: 34, height: 34, minWidth: 34, minHeight: 34,
              padding: 0, borderRadius: 99, background: C.white, border: `1px solid ${C.border}`,
              boxShadow: "0 2px 6px rgba(22,24,29,.12)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
            }}
          >
            <Trash2 size={14} color={C.slate} />
          </button>
        </div>
        <div style={{ minHeight: 34, margin: "7px 2px 0" }}>
          <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, ...fBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.caption || (isReel ? "Untitled reel" : "Untitled photo")}
          </div>
        </div>
      </div>
    );
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const type = file.type.startsWith("video") ? "reel" : "photo";
    setPendingUpload({ url: URL.createObjectURL(file), type, caption: "", sport: business.sports?.[0] || "Tennis" });
  };

  const confirmUpload = () => {
    addBusinessMedia(pendingUpload);
    toast(pendingUpload.type === "reel" ? "Reel uploaded" : "Photo uploaded");
    setPendingUpload(null);
  };

  const confirmDelete = (item) => {
    removeBusinessMedia(item.id);
    setDeleteTarget(null);
    toast(item.type === "reel" ? "Reel removed" : "Photo removed");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Reels & photos" onBack={() => nav("business-more")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px" }} className="cl-hide-scrollbar">
        <div style={{ fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody, marginBottom: 16 }}>
          Show athletes what a session with you looks like.{" "}
          <button
            type="button"
            onClick={() => setShowGuidelines(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, margin: 0, minWidth: 0, minHeight: 0, fontSize: "inherit", fontWeight: 600, color: C.brand, ...fBody }}
          >
            Read upload guidelines
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={onFileChange} style={{ display: "none" }} />
        <div style={{ marginTop: 20 }}>
          {media.length === 0 ? (
            <EmptyState icon={Film} title="Nothing uploaded yet" body="Add your first reel or photo so athletes can see your coaching style before they book." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 10, rowGap: 18 }}>
              {media.map((item) => (
                <MediaTile
                  key={item.id}
                  item={item}
                  onDelete={() => setDeleteTarget(item)}
                  onOpen={() => nav("coach-media", { businessId: business.id, mediaId: item.id, manage: true })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed upload action */}
      <div style={{ flexShrink: 0, padding: "10px 18px", paddingBottom: "max(14px, env(safe-area-inset-bottom))", borderTop: `1px solid ${C.border}`, background: C.white }}>
        <Btn full icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>Upload reel or photo</Btn>
      </div>

      {/* -------------------- ADD DETAILS FOR NEW UPLOAD -------------------- */}
      <BottomSheet open={!!pendingUpload} onClose={() => setPendingUpload(null)} title={pendingUpload?.type === "reel" ? "Add reel" : "Add photo"} heightPct={78}>
        {pendingUpload && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 120, aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", background: C.fog }}>
                {pendingUpload.type === "reel" ? (
                  <video src={pendingUpload.url} muted loop autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <img src={pendingUpload.url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field
                label="Caption"
                placeholder={pendingUpload.type === "reel" ? "e.g. Squad training drills" : "e.g. Broadbeach centre facilities"}
                icon={Camera}
                value={pendingUpload.caption}
                onChange={(e) => setPendingUpload((d) => ({ ...d, caption: e.target.value }))}
              />

              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Sport</div>
                <SportSearchSelect value={pendingUpload.sport} onChange={(sport) => setPendingUpload((d) => ({ ...d, sport }))} placeholder="Search a sport…" />
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <Btn full onClick={confirmUpload}>{pendingUpload.type === "reel" ? "Add reel to profile" : "Add photo to profile"}</Btn>
            </div>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={showGuidelines} onClose={() => setShowGuidelines(false)} title="Upload guidelines" heightPct={65}>
        <div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.7, ...fBody }}>
          {UPLOAD_GUIDELINES.map((g, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <Check size={14} color={C.brand} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => confirmDelete(deleteTarget)}
        title={`Remove this ${deleteTarget?.type === "reel" ? "reel" : "photo"}?`}
        description="It will be permanently removed from your public profile. This can't be undone."
        confirmLabel={`Remove ${deleteTarget?.type === "reel" ? "reel" : "photo"}`}
      />
    </div>
  );
}

export function ScreenBusinessReviews() {
  const { darkMode, nav, business, businessReviews, replyToBusinessReview, setBusinessReviewVisibility, toast } = useApp(); const C = darkMode ? CD : CL; const [replying, setReplying] = useState(null); const [reply, setReply] = useState(""); const reviews = businessReviews[business.id] || [];
  const startReply = (review) => { setReplying(review); setReply(review.reply || ""); }; const saveReply = () => { if (!reply.trim()) return toast("Write a reply first"); replyToBusinessReview(replying.id, reply.trim()); setReplying(null); toast("Reply published"); };
  return <div style={page(C)}><TopBar title="Reviews" onBack={() => nav("business-more")} /><div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar"><Card style={{ marginTop: 10, padding: 14, background: C.brandTint, display: "flex", gap: 12, alignItems: "center" }}><Star size={23} fill={C.brand} color={C.brand} /><div><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Reply as {business.tradingName}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>Replies are visible to clients on your public profile.</div></div></Card>{reviews.map((review) => <Card key={review.id} style={{ padding: 14, marginTop: 10, opacity: review.hidden ? .62 : 1 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{review.name}</div><div style={{ marginTop: 2, fontSize: T.caption, color: C.slateLight, ...fBody }}>{review.date} · {review.program}</div></div><div style={{ display: "flex", alignItems: "center", gap: 3, color: C.jet, fontWeight: 700, ...fBody }}><Star size={12} fill={C.brand} color={C.brand} />{review.rating}</div></div><div style={{ marginTop: 9, fontSize: T.body, lineHeight: 1.55, color: C.slate, ...fBody }}>{review.text}</div>{review.reply ? <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: C.fog, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}><strong style={{ color: C.jet }}>Your reply</strong><br />{review.reply}</div> : null}<div style={{ display: "flex", gap: 8, marginTop: 12 }}><Btn size="sm" variant="outline" onClick={() => startReply(review)}>{review.reply ? "Edit reply" : "Reply"}</Btn><Btn size="sm" variant="ghost" onClick={() => { setBusinessReviewVisibility(review.id, !review.hidden); toast(review.hidden ? "Review restored" : "Review hidden from public profile"); }}>{review.hidden ? "Restore" : "Hide"}</Btn></div></Card>)}</div><BottomSheet open={!!replying} onClose={() => setReplying(null)} title="Reply to review" heightPct={46}>{replying ? <div style={{ display: "grid", gap: 14 }}><div style={{ fontSize: T.body, color: C.slate, lineHeight: 1.5, ...fBody }}>Your response will appear below {replying.name}’s verified review.</div><Field label="Your reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Thank you for your feedback…" /><Btn full onClick={saveReply}>Publish reply</Btn></div> : null}</BottomSheet></div>;
}

export function ScreenBusinessFinance() {
  const { darkMode, nav, business, updateBusiness, completeBusinessChecklistItem, toast } = useApp(); const C = darkMode ? CD : CL; const current = getBusinessPlan(business.planId);
  const changePlan = (planId) => { updateBusiness({ planId, trialEndsAt: planId === "starter" ? business.trialEndsAt || "10 Oct 2026" : null }); toast("Subscription updated"); };
  const connect = () => { updateBusiness({ paymentsStatus: "enabled", payoutsStatus: "enabled" }); completeBusinessChecklistItem("payments"); toast("Payments and payouts enabled"); };
  return <div style={page(C)}><TopBar title="Finance & billing" onBack={() => nav("business-more")} /><div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar"><Card style={{ padding: 16, marginTop: 8, background: C.brandTint }}><div style={{ fontSize: T.caption, fontWeight: 700, color: C.brand, textTransform: "uppercase", ...fBody }}>Current plan</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 5 }}><div style={{ fontSize: T.heading, fontWeight: 700, color: C.jet, ...fDisplay }}>{current.name}</div><div><strong style={{ fontSize: T.heading, color: C.jet, ...fDisplay }}>${current.monthlyPrice}</strong><span style={{ fontSize: T.caption, color: C.slate, ...fBody }}>/month</span></div></div>{business.trialEndsAt ? <div style={{ marginTop: 9, fontSize: T.captionLg, color: C.success, fontWeight: 700, ...fBody }}>First month free · trial ends {business.trialEndsAt}</div> : null}</Card>
      <SectionLabel style={{ marginTop: 24 }}>Payments & payouts</SectionLabel><Card style={{ padding: 14, marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: T.body, color: C.jet, ...fBody }}><span>Payments</span><Badge tone={business.paymentsStatus === "enabled" ? "success" : "orange"}>{business.paymentsStatus.replaceAll("_", " ")}</Badge></div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: T.body, color: C.jet, ...fBody }}><span>Payouts</span><Badge tone={business.payoutsStatus === "enabled" ? "success" : "orange"}>{business.payoutsStatus.replaceAll("_", " ")}</Badge></div>{business.payoutsStatus !== "enabled" ? <div style={{ marginTop: 14 }}><Btn full icon={CreditCard} onClick={connect}>Connect demo payment account</Btn></div> : null}</Card>
      <SectionLabel style={{ marginTop: 24 }}>Change plan</SectionLabel>{BUSINESS_PLANS.map((plan) => <Card key={plan.id} onClick={() => changePlan(plan.id)} ariaLabel={`Change to ${plan.name}`} style={{ padding: 14, marginTop: 9, border: `1.5px solid ${business.planId === plan.id ? C.brand : C.border}`, display: "flex", justifyContent: "space-between", gap: 12 }}><div><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{plan.name}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{plan.description}</div></div><strong style={{ fontSize: T.subtitle, color: C.jet, ...fDisplay }}>${plan.monthlyPrice}</strong></Card>)}
      <SectionLabel style={{ marginTop: 24 }}>Invoices</SectionLabel><Card style={{ padding: 14, marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: T.body, color: C.slate, ...fBody }}><span>September 2026</span><strong style={{ color: C.jet }}>$0.00 · Trial</strong></div></Card></div></div>;
}

export function ScreenBusinessAnalytics() {
  const { darkMode, nav, business } = useApp(); const C = darkMode ? CD : CL;
  const metrics = [{ label: "Profile views", value: business.metrics.profileViews, detail: "+18% this month" }, { label: "Booking conversion", value: "12.4%", detail: "+2.1 pts" }, { label: "Program occupancy", value: `${business.metrics.occupancy}%`, detail: "Across live programs" }, { label: "Repeat bookings", value: "42%", detail: "+6% this quarter" }];
  return <div style={page(C)}><TopBar title="Analytics" onBack={() => nav("business-more")} /><div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar"><div style={{ fontSize: T.display, fontWeight: 700, color: C.jet, marginTop: 8, ...fDisplay }}>Your growth at a glance</div><div style={{ marginTop: 6, fontSize: T.body, color: C.slate, ...fBody }}>Demo insights for the last 30 days.</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>{metrics.map((metric) => <Card key={metric.label} style={{ padding: 14 }}><div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{metric.label}</div><div style={{ marginTop: 8, fontSize: T.display, fontWeight: 800, color: C.jet, ...fDisplay }}>{metric.value}</div><div style={{ marginTop: 5, fontSize: T.micro, color: C.success, fontWeight: 700, ...fBody }}>{metric.detail}</div></Card>)}</div><Card style={{ marginTop: 18, padding: 16 }}><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Bookings trend</div><div style={{ height: 150, display: "flex", alignItems: "flex-end", gap: 10, marginTop: 18 }}>{[34, 52, 45, 70, 61, 82, 76].map((height, index) => <div key={index} style={{ flex: 1, height: `${height}%`, borderRadius: "8px 8px 3px 3px", background: index === 5 ? C.brand : C.brandTint }} />)}</div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: T.micro, color: C.slateLight, ...fBody }}><span>Week 1</span><span>Today</span></div></Card></div></div>;
}

export function ScreenBusinessCompliance() {
  const { darkMode, nav, business, getBusinessProgress, completeBusinessChecklistItem, simulateBusinessDecision, toast } = useApp(); const C = darkMode ? CD : CL; const progress = getBusinessProgress();
  const items = [{ key: "identity", label: "Business identity & registration", route: null }, { key: "insurance", label: "Insurance & safeguarding", route: null }, { key: "payments", label: "Payments & payout setup", route: "business-finance" }, { key: "profile", label: "Public business profile", route: "business-more" }, { key: "location", label: "At least one location", route: "business-locations" }, { key: "roster", label: "Verified coach roster", route: "business-roster" }, { key: "program", label: "Program & future availability", route: "business-programs" }];
  return <div style={page(C)}><TopBar title="Launch checklist" onBack={() => nav("business-more")} /><div style={{ ...scroll, paddingBottom: 32 }} className="cl-hide-scrollbar"><Card style={{ padding: 16, marginTop: 8, background: C.brandTint }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><Badge tone={statusTone(business.status)}>{BUSINESS_STATUS_LABELS[business.status]}</Badge><div style={{ marginTop: 9, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{progress.percent}% launch ready</div></div><ClipboardCheck size={28} color={C.brand} /></div><div style={{ marginTop: 13 }}><ProgressBar value={progress.percent} C={C} /></div></Card><div style={{ marginTop: 16 }}>{items.map((item) => { const done = business.launchChecklist[item.key]; return <Card key={item.key} onClick={item.route ? () => nav(item.route) : undefined} style={{ padding: 13, marginBottom: 9, display: "flex", alignItems: "center", gap: 11 }}><div style={{ width: 34, height: 34, borderRadius: 11, background: done ? C.successTint : C.warnTint, display: "flex", alignItems: "center", justifyContent: "center" }}>{done ? <CheckCircle2 size={18} color={C.success} /> : <AlertTriangle size={17} color={C.warnStrong} />}</div><div style={{ flex: 1, fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{item.label}</div>{item.route ? <ChevronRight size={17} color={C.slateLight} /> : !done ? <Btn size="sm" variant="outline" onClick={() => { completeBusinessChecklistItem(item.key); toast("Requirement completed"); }}>Complete demo</Btn> : null}</Card>; })}</div>
      <SectionLabel style={{ marginTop: 24 }}>Prototype verification controls</SectionLabel><Card style={{ padding: 14, marginTop: 10 }}><div style={{ fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>These controls mirror the existing coach verification simulation. They represent decisions from the separate admin portal.</div><div style={{ display: "grid", gap: 8, marginTop: 12 }}><Btn full variant="outline" onClick={() => simulateBusinessDecision(BUSINESS_STATUS.CHANGES_REQUIRED)}>Simulate changes required</Btn><Btn full variant="secondary" onClick={() => simulateBusinessDecision(BUSINESS_STATUS.CONDITIONAL)}>Simulate conditional approval</Btn><Btn full onClick={() => simulateBusinessDecision(BUSINESS_STATUS.LIVE)}>Complete gates & go live</Btn></div></Card></div></div>;
}
