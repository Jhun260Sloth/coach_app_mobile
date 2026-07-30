import React, { useState } from "react";
import {
  ChevronLeft, Heart, Share2, Star, ShieldCheck, BadgeCheck, Play, MessageCircle, CheckCircle2, Trophy,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, REVIEWS, SPORT_ICON } from "../../data/mockData";
import { Avatar, Badge, SegTabs, SectionLabel, Card, Btn, StarRow } from "../../components/ui/Primitives";

export function CoverBanner({ sport, height = 150 }) {
  const Icon = SPORT_ICON[sport] || Trophy;
  return (
    <div style={{ height, position: "relative", flexShrink: 0, overflow: "hidden", background: `linear-gradient(145deg, ${C.jet} 0%, ${C.jetSoft} 55%, #3A3F4C 100%)` }}>
      {/* soft light wash for photographic depth */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,.10), transparent 55%)" }} />
      {/* signature angled accent, echoing the logo flag */}
      <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 100, background: C.orange, opacity: 0.9, transform: "rotate(-18deg)", clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)" }} />
      <div style={{ position: "absolute", top: -30, right: 40, width: 90, height: 100, background: C.jet, opacity: 0.55, transform: "rotate(-18deg)", clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)" }} />
      {/* oversized watermark icon for a sport-specific "stock photo" feel */}
      <Icon size={140} color="#FFFFFF" strokeWidth={1.1} style={{ position: "absolute", bottom: -30, left: -20, opacity: 0.14, transform: "rotate(-8deg)" }} />
    </div>
  );
}

export function ScreenCoachProfile({ nav, params, favorites, toggleFav }) {
  const coach = COACHES.find((c) => c.id === params.id) || COACHES[0];
  const [tab, setTab] = useState("about");
  const fav = favorites.includes(coach.id);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CoverBanner sport={coach.sport} height={150} />
      <div style={{ height: 150, position: "relative", flexShrink: 0, marginTop: -150, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 16, left: 16, pointerEvents: "auto" }}>
          <button onClick={() => nav("client-home")} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,.18)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={18} color={C.white} />
          </button>
        </div>
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8, pointerEvents: "auto" }}>
          <button onClick={() => toggleFav(coach.id)} style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,.18)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Heart size={16} color={C.white} fill={fav ? C.orange : "none"} />
          </button>
          <button style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,.18)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Share2 size={15} color={C.white} />
          </button>
        </div>
        <div style={{ position: "absolute", bottom: -34, left: 20, zIndex: 5, pointerEvents: "auto" }}>
          <Avatar name={coach.name} size={68} ring />
        </div>
      </div>

      <div style={{ padding: "0 20px", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ height: 40 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.jet, ...fDisplay }}>{coach.name}</div>
            <div style={{ fontSize: 13, color: C.slate, ...fBody }}>{coach.sport} · {coach.suburb}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: C.jet, ...fBody }}>
              <Star size={14} fill={C.orange} color={C.orange} /> {coach.rating}
            </div>
            <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{coach.reviews} reviews</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {coach.verified.identity && <Badge tone="success" icon={ShieldCheck}>ID verified</Badge>}
          {coach.verified.wwcc && <Badge tone="success" icon={ShieldCheck}>WWCC verified</Badge>}
          {coach.verified.quals && <Badge tone="success" icon={BadgeCheck}>Qualifications checked</Badge>}
        </div>

        <div style={{ marginTop: 18 }}>
          <SegTabs value={tab} onChange={setTab} items={[
            { value: "about", label: "About" }, { value: "reels", label: "Reels" },
            { value: "packages", label: "Packages" }, { value: "reviews", label: "Reviews" },
          ]} />
        </div>

        {tab === "about" && (
          <div style={{ marginTop: 16 }}>
            <SectionLabel>Bio</SectionLabel>
            <p style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>{coach.bio}</p>
            <SectionLabel>Coaching style</SectionLabel>
            <p style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>{coach.style}</p>
            <SectionLabel>Experience</SectionLabel>
            <p style={{ fontSize: 13.5, color: C.slate, marginBottom: 16, ...fBody }}>{coach.experience}</p>
            <SectionLabel>Cancellation policy</SectionLabel>
            <p style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.6, marginBottom: 6, ...fBody }}>{coach.cancellationPolicy}</p>
          </div>
        )}

        {tab === "reels" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
            {Array.from({ length: coach.reelsCount }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "3/4", borderRadius: 14, background: `linear-gradient(160deg, ${C.jetSoft}, ${C.jet})`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={14} color={C.white} fill={C.white} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "packages" && (
          <div style={{ marginTop: 16 }}>
            {coach.packages.map((p) => (
              <Card key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.jet, ...fDisplay }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: C.slate, marginTop: 3, ...fBody }}>{p.type} · {p.duration} min · {p.mode}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.jet, ...fDisplay }}>${p.price}</div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Btn size="sm" full onClick={() => nav("booking-datetime", { coachId: coach.id, packageId: p.id })}>
                    {coach.instantBook ? "Book now" : "Request to book"}
                  </Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ marginTop: 16 }}>
            {REVIEWS.map((r) => (
              <Card key={r.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={r.name} size={30} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: C.slateLight, ...fBody }}>{r.date}</div>
                    </div>
                  </div>
                  <StarRow value={r.rating} />
                </div>
                <p style={{ fontSize: 13, color: C.slate, marginTop: 8, lineHeight: 1.55, ...fBody }}>{r.text}</p>
                {r.verified && <Badge tone="neutral" icon={CheckCircle2}>Verified booking</Badge>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "12px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.jet, ...fDisplay }}>${coach.packages[0].price}</div>
          <div style={{ fontSize: 11, color: C.slate, ...fBody }}>from / session</div>
        </div>
        <div style={{ flex: 1 }}>
          <Btn full onClick={() => nav("booking-datetime", { coachId: coach.id, packageId: coach.packages[0].id })}>
            {coach.instantBook ? "Book now" : "Request to book"}
          </Btn>
        </div>
        <button onClick={() => nav("chat-thread", { name: coach.name })} style={{ width: 46, height: 46, borderRadius: 14, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <MessageCircle size={18} color={C.jet} />
        </button>
      </div>
    </div>
  );
}
