import React, { useMemo, useState } from "react";
import { BadgeCheck, Banknote, Building2, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, CreditCard, Languages, MapPin, MessageCircle, Phone, Play, PlayCircle, Plus, Scale, Search, ShieldCheck, Star, User, Users } from "lucide-react";
import { CL, CD, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { BUSINESS_REVIEWS, isBusinessDiscoverable } from "../../data/businesses";
import { Avatar, Badge, BottomSheet, Btn, Card, CheckboxRow, EmptyState, Field, FullscreenImageViewer, SegTabs, StatusPill, TopBar } from "../../components/ui/Primitives";
import { calcAge } from "./AboutYou";
import { SessionJourneyTimeline } from "../../components/booking/SessionJourneyTimeline";

const page = (C) => ({ height: "100%", display: "flex", flexDirection: "column", background: C.white });
const scroll = { flex: 1, overflowY: "auto", padding: "16px 18px 124px" };
const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export function BusinessCard({ business, programCount, rosterCount, onOpen, C, style }) {
  const location = business.registeredAddress?.split(",").slice(-2).join(",").trim();
  const bannerGradient = business.profile?.bannerGradient || business.profile?.backgroundImage || C.brand;
  return (
    <Card onClick={onOpen} ariaLabel={`View ${business.tradingName}`} style={{ padding: 0, marginBottom: 12, overflow: "hidden", ...style }}>
      <div style={{ height: 4, background: bannerGradient }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: "#ffffff", padding: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img src={business.profile.logo} alt={business.tradingName} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...oneLine, ...fDisplay }}>{business.tradingName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}><MapPin size={12} /> <span style={oneLine}>{location}</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>{business.sports.map((sport) => <Badge key={sport} tone="orange">{sport}</Badge>)}</div>
          </div>
          <ChevronRight size={17} color={C.slateLight} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: T.captionLg, color: C.slate, ...fBody }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={12} color={C.brand} fill={C.brand} /> <strong style={{ color: C.jet }}>{business.profile.rating}</strong> ({business.profile.reviews})</span>
          <span>{rosterCount} coaches · {programCount} programs</span>
        </div>
      </div>
    </Card>
  );
}

export function ScreenBusinessDirectory() {
  const { darkMode, nav, businesses, businessPrograms, businessRoster } = useApp(); const C = darkMode ? CD : CL;
  const [query, setQuery] = useState("");
  const visible = useMemo(() => businesses.filter(isBusinessDiscoverable).filter((item) => !query.trim() || [item.tradingName, item.registeredAddress, ...(item.sports || [])].join(" ").toLowerCase().includes(query.trim().toLowerCase())), [businesses, query]);
  return <div style={page(C)}><TopBar title="Businesses & clubs" subtitle="Verified organisations and programs" onBack={() => nav("client-home")} />
    <div style={{ padding: "4px 18px 12px" }}><div style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 48, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "0 13px", background: C.fog }}><Search size={17} color={C.slateLight} /><input aria-label="Search businesses" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sport, club or location…" style={{ flex: 1, minWidth: 0, minHeight: 44, border: "none", outline: "none", background: "transparent", color: C.jet, fontSize: T.bodyLg, ...fBody }} /></div><div style={{ marginTop: 10 }}><SegTabs items={[{ value: "coaches", label: "Individual coaches" }, { value: "businesses", label: "Businesses & clubs" }]} value="businesses" onChange={(value) => value === "coaches" && nav("client-home")} /></div></div>
    <div style={scroll} className="cl-hide-scrollbar"><div style={{ marginBottom: 14, fontSize: T.body, color: C.slate, ...fBody }}>{visible.length} verified organisation{visible.length === 1 ? "" : "s"}</div>{visible.length ? visible.map((item) => <BusinessCard key={item.id} business={item} programCount={businessPrograms.filter((program) => program.businessId === item.id && program.status === "live").length} rosterCount={businessRoster.filter((member) => member.businessId === item.id && member.status === "active").length || 4} onOpen={() => nav("business-public-profile", { id: item.id })} C={C} />) : <EmptyState icon={Building2} title="No businesses match" body="Try another sport, club name or location." ctaLabel="Clear search" onCta={() => setQuery("")} />}</div>
    </div>;
}

export function ScreenBusinessPublicProfile() {
  const { darkMode, nav, goBack, params, businesses, businessPrograms, businessRoster, businessLocations, businessMedia, businessReviews } = useApp(); const C = darkMode ? CD : CL;
  const business = businesses.find((item) => item.id === params?.id) || businesses[0];
  const programs = businessPrograms.filter((item) => item.businessId === business.id && item.status === "live");
  const roster = businessRoster.filter((item) => item.businessId === business.id && item.status === "active");
  const locations = businessLocations.filter((item) => item.businessId === business.id);
  const [tab, setTab] = useState(params?.tab || "programs");
  const [logoOpen, setLogoOpen] = useState(false);
  const media = businessMedia.filter((item) => item.businessId === business.id);
  const reviews = (businessReviews[business.id] || BUSINESS_REVIEWS[business.id] || []).filter((review) => !review.hidden);
  const locationLabel = locations.map((item) => item.name).join(", ") || business.registeredAddress;
  const messageBusiness = () => nav("chat-thread", { name: business.tradingName, context: "Organisation enquiry", backTo: "business-public-profile", backParams: { id: business.id } });
  const bannerGradient = business.profile?.bannerGradient || business.profile?.backgroundImage || "linear-gradient(135deg, #071D3A 0%, #0F3260 55%, #72B01D 100%)";

  return (
    <div style={{ ...page(C), position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }} className="cl-hide-scrollbar">
        {/* Cover Banner with Logo-derived Gradient Background */}
        <div style={{ position: "relative", height: 175, background: bannerGradient, overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 20% 10%, rgba(255,255,255,0.24) 0%, transparent 60%), linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.36) 100%)" }} />
          <div style={{ position: "absolute", top: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
            <button
              type="button"
              aria-label="Back to businesses"
              onClick={() => goBack("business-directory")}
              style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(18,20,24,0.40)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronLeft size={22} color="#ffffff" />
            </button>
            <button
              type="button"
              aria-label="Message organisation"
              onClick={messageBusiness}
              style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(18,20,24,0.40)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <MessageCircle size={19} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Profile Identity Card overlapping the Banner */}
        <div style={{ marginTop: -34, position: "relative", zIndex: 2, background: C.white, borderRadius: "28px 28px 0 0", padding: "0 18px 0", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button type="button" aria-label={`Open ${business.tradingName} logo full screen`} onClick={() => setLogoOpen(true)} style={{ width: 92, height: 92, borderRadius: 24, background: C.white, padding: 6, boxShadow: "0 12px 28px rgba(0,0,0,0.1)", border: `3.5px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "zoom-in", marginTop: -45 }}>
              <img src={business.profile.logo} alt={business.tradingName} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </button>
          </div>
          <div style={{ marginTop: 10, color: C.jet, fontSize: T.display, fontWeight: 800, letterSpacing: "-0.02em", ...fDisplay }}>{business.tradingName}</div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: C.slate, fontSize: T.body, ...fBody }}><MapPin size={14} color={C.brand} /><span>{business.sports.join(" · ")} · {locationLabel}</span></div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 12 }}><Badge tone="success">Business verified</Badge><Badge tone="success">Insured</Badge></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 18 }}>
            {[{ value: business.profile.rating, label: "Rating" }, { value: business.profile.reviews, label: "Reviews" }, { value: programs.length, label: "Programs" }, { value: roster.length || 4, label: "Coaches" }].map((stat) => <div key={stat.label} style={{ padding: "10px 4px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}><div style={{ fontSize: T.subtitleLg, fontWeight: 800, color: C.jet, ...fDisplay }}>{stat.value}</div><div style={{ marginTop: 2, fontSize: T.micro, color: C.slateLight, ...fBody }}>{stat.label}</div></div>)}
          </div>
        </div>
      <div style={{ padding: "0 18px" }}>
        <div style={{ marginTop: 18 }}><SegTabs value={tab} onChange={setTab} items={[{ value: "programs", label: "Programs" }, { value: "about", label: "About" }, { value: "media", label: "Media" }, { value: "reviews", label: "Reviews" }]} /></div>

        {tab === "programs" && <div style={{ marginTop: 16 }}><div style={{ marginBottom: 12, fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>Choose a program and find a session that fits your goals.</div>{programs.length ? programs.map((program) => <Card key={program.id} onClick={() => nav("business-program-detail", { businessId: business.id, programId: program.id })} ariaLabel={`View ${program.title}`} style={{ padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 13, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center" }}><CalendarDays size={19} color={C.brand} /></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{program.title}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program.type} · {program.durationMinutes} min</div></div><div style={{ textAlign: "right" }}><strong style={{ fontSize: T.subtitle, color: C.jet, ...fDisplay }}>${program.price}</strong><ChevronRight size={15} color={C.slateLight} style={{ marginTop: 6 }} /></div></Card>) : <EmptyState icon={CalendarDays} title="Programs coming soon" body="This organisation is preparing its next schedule." />}</div>}

        {tab === "about" && <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Coaching built around your progress</div><div style={{ marginTop: 7, fontSize: T.body, lineHeight: 1.65, color: C.slate, ...fBody }}>{business.profile.description}</div>
          <Card style={{ marginTop: 14, padding: 14 }}><div style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>Our coaching philosophy</div><div style={{ marginTop: 6, fontSize: T.body, lineHeight: 1.6, color: C.slate, ...fBody }}>{business.profile.philosophy}</div></Card>
          {roster.length ? <><div style={{ marginTop: 22, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Meet the coaching team</div><div className="cl-swipe-row" style={{ display: "flex", gap: 14, overflowX: "auto", margin: "12px -18px 0", padding: "0 18px 8px" }}>{roster.map((coach) => <div key={coach.id} style={{ width: 76, flexShrink: 0, textAlign: "center" }}><Avatar name={coach.name} size={54} /><div style={{ marginTop: 7, fontSize: T.captionLg, fontWeight: 700, color: C.jet, ...oneLine, ...fBody }}>{coach.name.split(" ")[0]}</div><div style={{ marginTop: 2, fontSize: T.micro, color: C.slate, ...fBody }}>{coach.sport}</div></div>)}</div></> : null}
          <Card style={{ marginTop: 16, padding: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Languages size={18} color={C.brand} /><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fDisplay }}>Languages</div></div><div style={{ marginTop: 6, fontSize: T.body, color: C.slate, ...fBody }}>{business.profile.languages.join(" · ")}</div><div style={{ marginTop: 13, paddingTop: 13, borderTop: `1px solid ${C.border}`, display: "flex", gap: 9 }}><MapPin size={18} color={C.brand} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fDisplay }}>Locations</div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>{locationLabel}</div></div></div></Card>
          <Card style={{ marginTop: 14, padding: 14, display: "flex", gap: 11 }}><ShieldCheck size={20} color={C.success} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fDisplay }}>Verified at two levels</div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>CoachNivo checks the organisation and each coach’s credentials separately.</div></div></Card>
        </div>}

        {tab === "media" && <div style={{ marginTop: 16 }}><div style={{ marginBottom: 12, fontSize: T.labelLg, color: C.slate, lineHeight: 1.5, ...fBody }}>See the team, facilities and coaching sessions in action.</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{media.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Open ${item.caption}`}
            onClick={() => nav("coach-media", { businessId: business.id, mediaId: item.id })}
            style={{ aspectRatio: "3/4", padding: 0, overflow: "hidden", borderRadius: 14, border: `1px solid ${C.border}`, background: C.fog, position: "relative", cursor: "pointer" }}
          >
            {item.type === "reel" ? (
              <video src={item.url} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <img src={item.url} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,.56))" }} />
            {item.type === "reel" && <span style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 99, background: "rgba(22,24,29,.60)", display: "flex", alignItems: "center", justifyContent: "center" }}><Play size={13} color={C.white} fill={C.white} /></span>}
            <span style={{ position: "absolute", left: 9, right: 9, bottom: 9, textAlign: "left", color: C.white, fontSize: T.caption, fontWeight: 600, lineHeight: 1.25, ...fBody }}>{item.caption}</span>
          </button>
        ))}</div></div>}

        {tab === "reviews" && <div style={{ marginTop: 16 }}><Card style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, background: C.brandTint }}><div style={{ fontSize: T.hero, fontWeight: 800, color: C.jet, ...fDisplay }}>{business.profile.rating}</div><div><div style={{ display: "flex", gap: 3 }}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} color={C.brand} fill={C.brand} />)}</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>Based on {business.profile.reviews} verified reviews</div></div></Card><div style={{ marginTop: 12 }}>{reviews.map((review) => <Card key={review.id} style={{ padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar name={review.name} size={32} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{review.name}</div><div style={{ marginTop: 2, fontSize: T.caption, color: C.slateLight, ...fBody }}>{review.date}</div></div></div><div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: T.labelLg, fontWeight: 700, color: C.jet, ...fBody }}><Star size={12} color={C.brand} fill={C.brand} />{review.rating.toFixed(1)}</div></div><div style={{ marginTop: 9, fontSize: T.body, lineHeight: 1.6, color: C.slate, ...fBody }}>{review.text}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}><Badge tone="neutral" icon={CheckCircle2}>Verified booking</Badge><Badge tone="orange">{review.program}</Badge></div></Card>)}</div></div>}
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 18px", paddingBottom: 28, background: C.white, borderTop: `1px solid ${C.border}` }}><Btn full variant="outline" icon={MessageCircle} onClick={messageBusiness}>Message business</Btn></div>
    <FullscreenImageViewer open={logoOpen} onClose={() => setLogoOpen(false)} src={business.profile.logo} alt={`${business.tradingName} logo`} />
    </div>
  );
}

const emptyBusinessChild = { name: "", dob: "", guardianMobile: "" };

function ParticipantChoice({ name, subtitle, selected, onSelect, C }) {
  return <button type="button" aria-pressed={selected} onClick={onSelect} style={{ width: "100%", minHeight: 64, padding: "10px 13px", borderRadius: 16, border: `1.5px solid ${selected ? C.black : C.border}`, background: selected ? C.fog : C.white, display: "flex", alignItems: "center", gap: 11, textAlign: "left", cursor: "pointer" }}><Avatar name={name} size={42} /><span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...oneLine, ...fBody }}>{name}</span><span style={{ display: "block", marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{subtitle}</span></span><span style={{ width: 22, height: 22, borderRadius: 99, border: `1.5px solid ${selected ? C.black : C.border}`, background: selected ? C.black : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{selected ? <Check size={13} color={C.white} strokeWidth={3} /> : null}</span></button>;
}

export function ScreenBusinessProgramDetail() {
  const { darkMode, nav, params, businesses, businessPrograms, businessRoster, businessLocations, children, addChild, clientIdentity, toast } = useApp();
  const C = darkMode ? CD : CL;
  const business = businesses.find((item) => item.id === params?.businessId);
  const program = businessPrograms.find((item) => item.id === params?.programId);
  const location = businessLocations.find((item) => item.id === program?.locationId);
  const coaches = businessRoster.filter((item) => program?.eligibleCoachIds?.includes(item.id) && item.status === "active" && item.verification === "verified" && (!program.servesMinors || item.wwcc === "current"));
  const [coachId, setCoachId] = useState(program?.assignmentMode === "client_selects" ? coaches[0]?.id || "" : "");
  const [participantId, setParticipantId] = useState(params?.participantId || "self");
  const [consent, setConsent] = useState(false);
  const [childSheetOpen, setChildSheetOpen] = useState(false);
  const [childDraft, setChildDraft] = useState(emptyBusinessChild);

  if (!business || !program) return <EmptyState icon={CalendarDays} title="Program unavailable" body="This program may have been paused or removed." />;

  const selfName = `${clientIdentity.firstName || ""} ${clientIdentity.lastName || ""}`.trim() || "Myself";
  const selectedChild = children.find((child) => String(child.id) === String(participantId));
  const participantName = participantId === "self" ? "You" : selectedChild?.name || "Participant";
  const participantAge = selectedChild?.dob ? calcAge(selectedChild.dob) : Number(selectedChild?.age);
  const includesMinor = participantId !== "self" && Number.isFinite(participantAge) && participantAge < 18;
  const full = program.enrolled >= program.capacity;
  const canContinue = !full && participantId && (program.assignmentMode !== "client_selects" || coachId) && (!includesMinor || consent);
  const deliveryMode = program.deliveryMode || program.mode || "In-person";
  const deliveryLabel = deliveryMode === "Online" ? "Online session" : deliveryMode === "Come to You" ? (program.travelArea ? `Coach travels to you · ${program.travelArea}` : "Coach travels to you") : location?.name || program.locationName || "Location confirmed after booking";
  const programTime = program.startTime ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(`2026-01-01T${program.startTime}:00`)) : program.schedule?.split("·")[1]?.trim() || "9:00am";

  const saveChild = () => {
    const age = calcAge(childDraft.dob);
    if (!childDraft.name.trim() || !childDraft.dob || age === null || age >= 18 || !childDraft.guardianMobile.trim()) { toast("Add name, birth date and guardian mobile"); return; }
    const id = Date.now();
    addChild({ id, name: childDraft.name.trim(), dob: childDraft.dob, age: String(age), sport: [program.sport], sportLevels: {}, guardianName: selfName, guardianRelationship: "Parent or guardian", guardianMobile: childDraft.guardianMobile.trim(), location: null, goals: "", preferences: "", hasPhoto: false });
    setParticipantId(id);
    setConsent(false);
    setChildSheetOpen(false);
    setChildDraft(emptyBusinessChild);
    toast("Child profile added and selected");
  };

  const continueBooking = () => nav("business-booking-review", {
    businessId: business.id, programId: program.id, assignedCoachId: coachId || null,
    participantId, participant: participantName, includesMinor,
    guardianName: includesMinor ? selectedChild?.guardianName || selfName : "",
    guardianPhone: includesMinor ? selectedChild?.guardianMobile || "" : "",
    date: program.nextDate, time: programTime,
  });

  return (
    <div style={page(C)}>
      <TopBar title="Program details" onBack={() => nav("business-public-profile", { id: business.id })} />
      <div style={{ ...scroll, paddingTop: 22 }} className="cl-hide-scrollbar">
        <div style={{ marginBottom: 12 }}>
          <Badge tone="orange">{program.type}</Badge>
        </div>
        <div style={{ fontSize: T.display, fontWeight: 700, color: C.jet, ...fDisplay }}>{program.title}</div>
        <div style={{ marginTop: 6, fontSize: T.body, color: C.slate, ...fBody }}>with {business.tradingName}</div>
        <div style={{ marginTop: 16, fontSize: T.body, lineHeight: 1.65, color: C.slate, ...fBody }}>{program.description}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 18 }}>
          <Card style={{ padding: 13 }}><Clock3 size={17} color={C.brand} /><div style={{ marginTop: 7, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{program.durationMinutes} minutes</div></Card>
          <Card style={{ padding: 13 }}><Users size={17} color={C.brand} /><div style={{ marginTop: 7, fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{Math.max(0, program.capacity - program.enrolled)} participant{Math.max(0, program.capacity - program.enrolled) === 1 ? "" : "s"} left</div></Card>
        </div>
        <Card style={{ padding: 14, marginTop: 10 }}>
          <div style={{ display: "flex", gap: 9, fontSize: T.body, color: C.slate, ...fBody }}><CalendarDays size={17} color={C.brand} />{program.nextDate} · {programTime}</div>
          <div style={{ display: "flex", gap: 9, marginTop: 10, fontSize: T.body, color: C.slate, ...fBody }}><MapPin size={17} color={C.brand} />{deliveryLabel}</div>
        </Card>

    <div style={{ marginTop: 22, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Who’s attending?</div><div style={{ marginTop: 5, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>Choose your account or a saved child profile.</div>
    <div style={{ display: "grid", gap: 9, marginTop: 11 }}><ParticipantChoice name={selfName} subtitle="Account holder · You" selected={participantId === "self"} onSelect={() => { setParticipantId("self"); setConsent(false); }} C={C} />{children.map((child) => <ParticipantChoice key={child.id} name={child.name || "Child profile"} subtitle={child.dob ? `${calcAge(child.dob)} years old` : "Child profile"} selected={String(participantId) === String(child.id)} onSelect={() => { setParticipantId(child.id); setConsent(false); }} C={C} />)}<button type="button" onClick={() => setChildSheetOpen(true)} style={{ width: "100%", minHeight: 48, borderRadius: 15, border: `1.5px dashed ${C.border}`, background: C.fog, color: C.jet, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: T.body, fontWeight: 600, cursor: "pointer", ...fBody }}><Plus size={17} />Add child profile</button></div>

    {program.assignmentMode === "client_selects" ? <><div style={{ marginTop: 22, fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>Choose your coach</div><div style={{ display: "grid", gap: 8, marginTop: 10 }}>{coaches.map((coach) => <Card key={coach.id} onClick={() => setCoachId(coach.id)} style={{ padding: 13, border: `1.5px solid ${coachId === coach.id ? C.brand : C.border}`, display: "flex", alignItems: "center", gap: 11 }}><Avatar name={coach.name} size={42} /><div style={{ flex: 1, fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{coach.name}</div>{coachId === coach.id ? <CheckCircle2 size={19} color={C.brand} /> : null}</Card>)}</div></> : <Card style={{ padding: 14, marginTop: 20, background: C.brandTint, display: "flex", gap: 10 }}><BadgeCheck size={20} color={C.brand} /><div style={{ fontSize: T.body, lineHeight: 1.55, color: C.slate, ...fBody }}>The organisation will assign a verified coach from its roster based on availability. You’ll see their name before payment.</div></Card>}
    {includesMinor ? <Card style={{ padding: "4px 14px", marginTop: 14 }}><CheckboxRow label={`I confirm I am authorised to book for ${participantName} and accept the participation waiver`} checked={consent} onClick={() => setConsent((value) => !value)} /></Card> : null}
  </div><div style={{ padding: "14px 18px", paddingBottom: 28, borderTop: `1px solid ${C.border}`, background: C.white }}><Btn full disabled={!canContinue} onClick={continueBooking}>{full ? "Program is full" : `Review booking · $${program.price}`}</Btn></div>
  <BottomSheet open={childSheetOpen} onClose={() => setChildSheetOpen(false)} title="Add child profile" heightPct={58}><div style={{ textAlign: "center", marginBottom: 16 }}><Avatar name={childDraft.name || "Child"} size={66} /><div style={{ marginTop: 8, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>Add the essentials now. You can complete sport preferences and medical notes from Account later.</div></div><div style={{ display: "grid", gap: 14 }}><Field label="Child’s name" placeholder="e.g. Ava" icon={User} value={childDraft.name} onChange={(event) => setChildDraft((current) => ({ ...current, name: event.target.value }))} required /><div><div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Date of birth</div><div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 48, border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "0 13px", background: C.white }}><CalendarDays size={16} color={C.slateLight} /><input aria-label="Child date of birth" type="date" max={new Date().toISOString().slice(0, 10)} value={childDraft.dob} onChange={(event) => setChildDraft((current) => ({ ...current, dob: event.target.value }))} style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: C.jet, fontSize: T.bodyLg, ...fBody }} /></div></div><Field label="Guardian mobile" placeholder="04XX XXX XXX" icon={Phone} value={childDraft.guardianMobile} onChange={(event) => setChildDraft((current) => ({ ...current, guardianMobile: event.target.value.replace(/[^0-9+\s]/g, "") }))} required /><Btn full onClick={saveChild}>Add profile & select</Btn></div></BottomSheet>
  </div>);
}

export function ScreenBusinessBookingReview() {
  const { darkMode, nav, params, businesses, businessPrograms, businessRoster, businessLocations, clientIdentity, addBusinessBooking, toast } = useApp(); const C = darkMode ? CD : CL;
  const business = businesses.find((item) => item.id === params?.businessId); const program = businessPrograms.find((item) => item.id === params?.programId); const coach = businessRoster.find((item) => item.id === params?.assignedCoachId); const location = businessLocations.find((item) => item.id === program?.locationId); const deliveryMode = program?.deliveryMode || program?.mode || "In-person"; const deliveryLabel = deliveryMode === "Online" ? "Online session" : deliveryMode === "Come to You" ? (program?.travelArea ? `Coach travels to you · ${program.travelArea}` : "Coach travels to you") : location?.name || program?.locationName || "Location confirmed after booking"; const [paying, setPaying] = useState(false);
  if (!business || !program) return <EmptyState icon={CalendarDays} title="Booking unavailable" body="Return to the organisation and choose another program." />;
  const total = Number(program.price) + Math.round(Number(program.price) * 0.06 * 100) / 100;
  const submit = () => { setPaying(true); window.setTimeout(() => { const id = addBusinessBooking({ providerId: business.id, providerName: business.tradingName, businessId: business.id, programId: program.id, programTitle: program.title, service: program.title, assignedCoachId: coach?.id || null, coachId: coach?.id || null, coachName: coach?.name || "To be assigned", clientName: `${clientIdentity.firstName || "Sarah"} ${clientIdentity.lastName || "Lin"}`.trim(), participantId: params.participantId, participants: params.participant, includesMinor: !!params.includesMinor, guardianName: params.guardianName || "", guardianPhone: params.guardianPhone || "", date: params.date, time: params.time, mode: deliveryMode, status: coach ? "confirmed" : "pending", paymentStatus: coach ? "held" : "not_requested", price: program.price, total }); toast(coach ? "Booking confirmed" : "Booking request sent"); nav("business-booking-confirmation", { bookingId: id }); }, 650); };
  return <div style={page(C)}><TopBar title={coach ? "Review & pay" : "Review request"} onBack={() => nav("business-program-detail", { businessId: business.id, programId: program.id, participantId: params.participantId })} /><div style={{ ...scroll, paddingTop: 20, paddingBottom: 32 }} className="cl-hide-scrollbar"><Card style={{ padding: 16 }}><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{program.title}</div><div style={{ marginTop: 5, fontSize: T.body, color: C.slate, ...fBody }}>{business.tradingName}</div><div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "grid", gap: 10, fontSize: T.body, color: C.slate, ...fBody }}><div>Date & time <strong style={{ color: C.jet }}>{params.date} · {params.time}</strong></div><div>Location <strong style={{ color: C.jet }}>{deliveryLabel}</strong></div><div>Participant <strong style={{ color: C.jet }}>{params.participant}</strong></div>{params.includesMinor ? <div>Guardian <strong style={{ color: C.jet }}>{params.guardianName}</strong></div> : null}<div>Coach <strong style={{ color: C.jet }}>{coach?.name || "Assigned after request"}</strong></div></div></Card><Card style={{ padding: 16, marginTop: 14 }}><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{coach ? "Payment summary" : "Price summary"}</div><div style={{ display: "grid", gap: 10, marginTop: 14, fontSize: T.body, color: C.slate, ...fBody }}><div style={{ display: "flex", justifyContent: "space-between" }}><span>Program</span><strong style={{ color: C.jet }}>${program.price.toFixed(2)}</strong></div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Service fee</span><strong style={{ color: C.jet }}>${(total - program.price).toFixed(2)}</strong></div><div style={{ display: "flex", justifyContent: "space-between", paddingTop: 11, borderTop: `1px solid ${C.border}`, fontSize: T.subtitle }}><strong style={{ color: C.jet }}>Total</strong><strong style={{ color: C.jet }}>${total.toFixed(2)}</strong></div></div></Card><Card style={{ padding: 14, marginTop: 14, display: "flex", gap: 10 }}><CreditCard size={19} color={C.brand} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{coach ? "Visa ending 4242" : "No charge today"}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>{coach ? "Charged securely when you confirm." : "You’ll pay only after the organisation accepts and assigns your coach."}</div></div></Card><div style={{ marginTop: 20 }}><Btn full loading={paying} loadingText={coach ? "Securing your place…" : "Sending your request…"} onClick={submit}>{coach ? `Confirm & pay · $${total.toFixed(2)}` : "Send booking request"}</Btn></div></div></div>;
}

export function ScreenBusinessBookingConfirmation() {
  const { darkMode, nav, params, businessBookings, businessPrograms } = useApp(); const C = darkMode ? CD : CL; const booking = businessBookings.find((item) => item.id === params?.bookingId); const program = businessPrograms.find((item) => item.id === booking?.programId); const confirmed = booking?.status !== "pending";
  return <div style={{ ...page(C), justifyContent: "center", padding: "28px 22px", boxSizing: "border-box" }}><div style={{ width: 78, height: 78, borderRadius: 25, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: confirmed ? C.successTint : C.brandTint }}>{confirmed ? <CheckCircle2 size={39} color={C.success} /> : <CalendarDays size={38} color={C.brand} />}</div><div style={{ textAlign: "center", fontSize: T.displayLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{confirmed ? "Your place is secured!" : "Request sent to the academy"}</div><div style={{ textAlign: "center", marginTop: 9, fontSize: T.bodyLg, lineHeight: 1.6, color: C.slate, ...fBody }}>{confirmed ? `You’re booked into ${program?.title}. We’ve added it to your upcoming sessions.` : "The organisation will review your request and assign a verified coach. You’ll be notified before payment is requested."}</div><Card style={{ padding: 15, marginTop: 22 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{booking?.providerName}</div><div style={{ marginTop: 6, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program?.title} · {booking?.date} · {booking?.time}</div></Card><div style={{ display: "grid", gap: 9, marginTop: 20 }}><Btn full onClick={() => nav("client-dashboard")}>View your bookings</Btn><Btn full variant="outline" onClick={() => nav("business-public-profile", { id: booking?.businessId })}>Back to organisation</Btn></div></div>;
}

export function ScreenClientBusinessBookingDetail() {
  const { darkMode, nav, goBack, params, businessBookings, businessPrograms, businesses, businessRoster, sessionDisputes, updateBusinessBooking, pushNotification, toast } = useApp();
  const C = darkMode ? CD : CL;
  const booking = businessBookings.find((item) => item.id === params?.id);
  const program = businessPrograms.find((item) => item.id === booking?.programId);
  const business = businesses.find((item) => item.id === booking?.businessId);
  const coach = businessRoster.find((item) => item.id === booking?.assignedCoachId);

  if (!booking) return <div style={page(C)}><TopBar title="Booking details" onBack={() => goBack("client-dashboard")} /><EmptyState icon={CalendarDays} title="Booking not found" body="This booking may have been removed." /></div>;

  const paymentDue = booking.status === "awaiting_payment" && booking.paymentStatus === "due";
  const relatedCase = sessionDisputes.find((item) => item.bookingId === booking.id);
  const cancel = () => { const wasPending = booking.status === "pending"; updateBusinessBooking(booking.id, { status: "cancelled", paymentStatus: "not_requested" }); pushNotification({ audience: "business", businessId: booking.businessId, type: "booking", title: wasPending ? "Booking request withdrawn" : "Booking cancelled", body: `${booking.clientName || "A client"} ${wasPending ? "withdrew their request for" : "cancelled"} ${program?.title || booking.service}.`, bookingId: booking.id }); toast(wasPending ? "Booking request withdrawn" : "Booking cancelled"); nav("client-dashboard"); };
  const pay = () => { updateBusinessBooking(booking.id, { status: "confirmed", paymentStatus: "held" }); pushNotification({ audience: "business", businessId: booking.businessId, type: "payment", title: "Program payment received", body: `${booking.clientName || "A client"} paid for ${program?.title || booking.service}. The booking is confirmed.`, bookingId: booking.id }); toast("Payment secured — your booking is confirmed"); };

  return <div style={page(C)}><TopBar title="Booking details" onBack={() => goBack("client-dashboard")} /><div style={{ ...scroll, paddingTop: 20, paddingBottom: 32 }} className="cl-hide-scrollbar">
    <Card style={{ padding: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 54, height: 54, borderRadius: 14, padding: 4, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: C.white, border: `1px solid ${C.border}` }}>{business?.profile?.logo ? <img src={business.profile.logo} alt={`${business.tradingName} logo`} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} /> : <Avatar name={business?.tradingName || booking.providerName} size={46} />}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{business?.tradingName || booking.providerName}</div><div style={{ marginTop: 4, fontSize: T.captionLg, color: C.slate, ...fBody }}>{program?.title || booking.service}</div></div></div><div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}><StatusPill status={booking.status} /></div></Card>
    {paymentDue ? <Card style={{ padding: 14, marginTop: 12, background: C.brandTint, display: "flex", gap: 10 }}><CreditCard size={20} color={C.brand} /><div><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fDisplay }}>Your coach is assigned</div><div style={{ marginTop: 4, fontSize: T.captionLg, lineHeight: 1.5, color: C.slate, ...fBody }}>Pay now to secure your place with {coach?.name || booking.coachName}.</div></div></Card> : null}
    <Card style={{ padding: 16, marginTop: 12 }}><div style={{ display: "grid", gap: 11, fontSize: T.body, color: C.slate, ...fBody }}><div>Date & time <strong style={{ color: C.jet }}>{booking.date} · {booking.time}</strong></div><div>Participant <strong style={{ color: C.jet }}>{booking.participants}</strong></div><div>Coach <strong style={{ color: C.jet }}>{coach?.name || booking.coachName || "To be assigned"}</strong></div><div>Format <strong style={{ color: C.jet }}>{booking.mode}</strong></div><div style={{ paddingTop: 11, borderTop: `1px solid ${C.border}` }}>Total <strong style={{ color: C.jet }}>${Number(booking.total || booking.price).toFixed(2)} AUD</strong></div></div></Card>
    <Card style={{ padding: 14, marginTop: 12, display: "flex", gap: 10 }}><ShieldCheck size={20} color={C.success} /><div style={{ fontSize: T.captionLg, lineHeight: 1.55, color: C.slate, ...fBody }}>Your booking is managed by {business?.tradingName || booking.providerName}. CoachNivo separately verifies the organisation and assigned coach.</div></Card>
    {relatedCase ? <Card onClick={() => nav("dispute-status", { caseId: relatedCase.id, role: "client", backTo: "client-booking-detail", bookingId: booking.id })} style={{ padding: 14, marginTop: 12, background: C.warnTint, border: "none", display: "flex", alignItems: "center", gap: 10 }}><Scale size={18} color={C.warnStrong} /><div style={{ flex: 1 }}><div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>Session report {relatedCase.status.replaceAll("_", " ")}</div><div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, ...fBody }}>View the case timeline and protected payment status.</div></div><ChevronRight size={17} color={C.slateLight} /></Card> : null}
    <div style={{ marginTop: 18 }}><SessionJourneyTimeline booking={booking} role="client" compact /></div>
    <div style={{ display: "grid", gap: 9, marginTop: 20 }}>{paymentDue ? <Btn full onClick={pay}>Pay & confirm · ${Number(booking.total || booking.price).toFixed(2)}</Btn> : null}{booking.status === "confirmed" ? <Btn full icon={PlayCircle} onClick={() => nav("client-session-start", { bookingId: booking.id, role: "client", backTo: "client-booking-detail", backParams: { id: booking.id } })}>Start session check-in</Btn> : null}{booking.status === "in_progress" ? <Btn full icon={PlayCircle} onClick={() => nav("session-progress", { bookingId: booking.id, role: "client", backTo: "client-booking-detail", backParams: { id: booking.id } })}>View live session</Btn> : null}{booking.status === "completion_pending" ? <Btn full icon={CreditCard} onClick={() => nav("session-completion", { bookingId: booking.id, role: "client", backTo: "client-booking-detail", backParams: { id: booking.id } })}>Review session completion</Btn> : null}{booking.status === "completed" ? <Btn full icon={Banknote} onClick={() => nav("funds-release-status", { bookingId: booking.id, role: "client", backTo: "client-booking-detail", backParams: { id: booking.id } })}>View payment release</Btn> : null}<Btn full variant={paymentDue ? "outline" : "dark"} icon={MessageCircle} onClick={() => nav("chat-thread", { name: business?.tradingName || booking.providerName, context: `${program?.title || booking.service} · ${booking.date}`, bookingId: booking.id, backTo: "client-booking-detail", backParams: { id: booking.id } })}>Message organisation</Btn>{!relatedCase && ["confirmed", "in_progress", "completion_pending", "completed"].includes(booking.status) ? <Btn full variant="ghost" icon={Scale} onClick={() => nav("dispute-create", { bookingId: booking.id, role: "client", category: "session_not_delivered", backTo: "client-booking-detail", backParams: { id: booking.id } })}>Report a session issue</Btn> : null}{["pending", "awaiting_payment", "confirmed"].includes(booking.status) ? <Btn full variant="ghost" onClick={cancel}>{booking.status === "pending" ? "Withdraw request" : "Cancel booking"}</Btn> : null}</div>
  </div></div>;
}
