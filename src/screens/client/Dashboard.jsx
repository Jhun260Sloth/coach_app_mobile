import React, { useState } from "react";
import {
  WifiOff, Calendar, ClipboardList, Heart, Download, Clock, MessageCircle, Star, CheckCircle2,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES } from "../../data/mockData";
import {
  Avatar, Card, Badge, SegTabs, SectionLabel, Btn, TopBar, EmptyState, StatusPill, Chip,
} from "../../components/ui/Primitives";
import { CoachListCard } from "./Discovery";

export function ScreenClientDashboard({ nav, bookings, favorites, offline }) {
  const [tab, setTab] = useState("upcoming");
  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const favCoaches = COACHES.filter((c) => favorites.includes(c.id));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>My sessions</div>
        {offline && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.jet, color: C.white, padding: "9px 12px", borderRadius: 12, marginTop: 12, fontSize: 12, ...fBody }}>
            <WifiOff size={14} color={C.orange} /> You're offline — showing your last saved sessions.
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <SegTabs value={tab} onChange={setTab} items={[
            { value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" },
            { value: "favorites", label: "Favorites" }, { value: "payments", label: "Payments" },
          ]} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {tab === "upcoming" && (upcoming.length ? upcoming.map((b) => <BookingCard key={b.id} b={b} nav={nav} />) :
          <EmptyState icon={Calendar} title="No upcoming sessions" body="Search for a coach to book your next session." />)}

        {tab === "past" && (past.length ? past.map((b) => <BookingCard key={b.id} b={b} nav={nav} past />) :
          <EmptyState icon={ClipboardList} title="No past sessions yet" body="Completed sessions will show up here." />)}

        {tab === "favorites" && (favCoaches.length ? favCoaches.map((c) => (
          <CoachListCard key={c.id} coach={c} fav onFav={() => {}} onOpen={() => nav("coach-profile", { id: c.id })} />
        )) : <EmptyState icon={Heart} title="No favorites yet" body="Tap the heart on a coach's profile to save them here." />)}

        {tab === "payments" && (
          <>
            {[...upcoming, ...past].map((b) => (
              <Card key={b.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{b.date} · {b.coachName}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.jet, ...fDisplay }}>${b.price}</div>
                  <Download size={15} color={C.slateLight} />
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function BookingCard({ b, nav, past }) {
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Avatar name={b.coachName || b.clientName} size={42} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.jet, ...fDisplay }}>{b.service}</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>{b.coachName || b.clientName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.slate, marginTop: 4, ...fBody }}>
              <Clock size={11} /> {b.date} · {b.time}
            </div>
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {!past ? (
          <>
            <Btn size="sm" variant="secondary" full onClick={() => {}}>Reschedule</Btn>
            <Btn size="sm" variant="outline" full onClick={() => {}}>Cancel</Btn>
            <Btn size="sm" variant="dark" icon={MessageCircle} onClick={() => nav("chat-thread", { name: b.coachName || b.clientName })} />
          </>
        ) : (
          b.status === "completed" && !b.reviewed ? (
            <Btn size="sm" full onClick={() => nav("leave-review", { bookingId: b.id, name: b.coachName })}>Leave a review</Btn>
          ) : b.reviewed ? (
            <Badge tone="success" icon={CheckCircle2}>Review submitted</Badge>
          ) : null
        )}
      </div>
    </Card>
  );
}

export function ScreenLeaveReview({ nav, params, toast }) {
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const options = ["Great communicator", "Punctual", "Well prepared", "Motivating", "Flexible"];
  const toggle = (t) => setTags((arr) => arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Leave a review" onBack={() => nav("client-dashboard")} />
      <div style={{ textAlign: "center", marginTop: 6, marginBottom: 20 }}>
        <Avatar name={params.name} size={54} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.jet, marginTop: 10, ...fDisplay }}>{params.name}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Star size={30} fill={i <= rating ? C.orange : "none"} color={i <= rating ? C.orange : C.slateLight} />
            </button>
          ))}
        </div>
      </div>
      <SectionLabel>What stood out?</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {options.map((t) => <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}
      </div>
      <textarea placeholder="Tell other clients about your session..." rows={4}
        style={{ border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 13, fontSize: 13.5, resize: "none", outline: "none", ...fBody }} />
      <div style={{ fontSize: 11, color: C.slateLight, marginTop: 10, ...fBody }}>Only clients with a verified booking can leave a review. Your review is moderated before it appears publicly.</div>
      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full onClick={() => { toast("Review submitted for moderation"); nav("client-dashboard"); }}>Submit review</Btn>
      </div>
    </div>
  );
}
