import React, { useState } from "react";
import {
  ChevronLeft, Heart, Share2, Star, ShieldCheck, BadgeCheck, Play, MessageCircle, CheckCircle2, Trophy,
  Clock, TrendingUp, Repeat, MapPin, Navigation, Award, Users, XCircle,
} from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";
import { COACHES, REVIEWS, SPORT_ICON } from "../../data/mockData";
import { Avatar, Badge, SegTabs, SectionLabel, Card, Btn, StarRow } from "../../components/ui/Primitives";
import { StatusBanner } from "../../systems/StateSystem";

const LIVE_AVAILABILITY_COACH_ID = "c2";

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

export function ScreenCoachProfile({ nav, params, favorites, toggleFav, coachAvailableNow }) {
  const coach = COACHES.find((c) => c.id === params.id) || COACHES[0];
  const [tab, setTab] = useState("about");
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const selectedPkg = coach.packages.find((p) => p.id === selectedPkgId) || null;
  const fav = favorites.includes(coach.id);
  const unavailable = coach.id === LIVE_AVAILABILITY_COACH_ID && coachAvailableNow === false;
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
            <div style={{ fontSize: T.headingLg, fontWeight: 600, color: C.jet, ...fDisplay }}>{coach.name}</div>
            <div style={{ fontSize: T.body, color: C.slate, ...fBody }}>{coach.sport} · {coach.suburb}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: C.jet, ...fBody }}>
              <Star size={14} fill={C.orange} color={C.orange} /> {coach.rating}
            </div>
            <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>{coach.reviews} reviews</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {coach.verified.identity && <Badge tone="success" icon={ShieldCheck}>ID verified</Badge>}
          {coach.verified.wwcc && <Badge tone="success" icon={ShieldCheck}>WWCC verified</Badge>}
          {coach.verified.quals && <Badge tone="success" icon={BadgeCheck}>Qualifications checked</Badge>}
        </div>

        {unavailable && (
          <div style={{ marginTop: 14 }}>
            <StatusBanner
              state="coachUnavailable"
              onPrimary={() => nav("chat-thread", { name: coach.name })}
              primaryLabel="Notify me when available"
              onSecondary={() => nav("chat-thread", { name: coach.name })}
              secondaryLabel="Message coach"
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[
            { icon: Clock, label: "Response time", value: coach.responseTime.replace("Usually replies within ", "") },
            { icon: TrendingUp, label: "Acceptance rate", value: `${coach.acceptanceRate}%` },
            { icon: Repeat, label: "Repeat clients", value: `${coach.repeatClientRate}%` },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: C.fog, borderRadius: 14, padding: "10px 10px" }}>
              <s.icon size={14} color={C.orange} />
              <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, marginTop: 6, ...fDisplay }}>{s.value}</div>
              <div style={{ fontSize: T.tiny, color: C.slate, marginTop: 1, lineHeight: 1.3, ...fBody }}>{s.label}</div>
            </div>
          ))}
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
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>{coach.bio}</p>
            <SectionLabel>Coaching style</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, marginBottom: 16, ...fBody }}>{coach.style}</p>
            <SectionLabel>Experience</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, marginBottom: 16, ...fBody }}>{coach.experience}</p>

            <SectionLabel>Location & travel</SectionLabel>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <MapPin size={15} color={C.orange} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{coach.venue}</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>{coach.suburb}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Navigation size={15} color={C.orange} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Travels up to {coach.travelRadiusKm}km</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 1, ...fBody }}>
                    {coach.willingToTravel ? "Willing to travel to your location" : "In-venue sessions only — travel not offered"}
                  </div>
                </div>
              </div>
            </Card>

            <SectionLabel>Qualifications</SectionLabel>
            <Card style={{ marginBottom: 16 }}>
              {coach.qualifications.map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i === coach.qualifications.length - 1 ? "none" : `1px solid ${C.border}` }}>
                  <Award size={14} color={C.success} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: T.body, color: C.jet, ...fBody }}>{q}</span>
                </div>
              ))}
            </Card>

            <SectionLabel>Cancellation policy</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, marginBottom: 6, ...fBody }}>{coach.cancellationPolicy}</p>
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
            {coach.packages.map((p) => {
              const selected = selectedPkgId === p.id;
              const unavailable = p.active === false;
              return (
                <Card
                  key={p.id}
                  onClick={unavailable ? undefined : () => setSelectedPkgId(p.id)}
                  style={{
                    marginBottom: 10,
                    border: `1.5px solid ${selected ? C.orange : C.border}`,
                    background: selected ? C.orangeTint : unavailable ? C.fog : C.white,
                    opacity: unavailable ? 0.6 : 1,
                    cursor: unavailable ? "default" : "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: T.subtitle, color: C.jet, ...fDisplay }}>{p.name}</div>
                      <div style={{ fontSize: T.label, color: C.slate, marginTop: 3, ...fBody }}>{p.type} · {p.duration} min · {p.mode}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                        <Users size={11.5} color={C.slateLight} />
                        <span style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>
                          {p.maxParticipants ? `Up to ${p.maxParticipants} participant${p.maxParticipants > 1 ? "s" : ""}` : "1 participant"}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>${p.price}</div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    {unavailable ? (
                      <>
                        <XCircle size={14} color={C.slateLight} />
                        <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.slateLight, ...fBody }}>Currently unavailable</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 18, height: 18, borderRadius: 18, border: `1.5px solid ${selected ? C.orange : C.border}`, background: selected ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {selected && <CheckCircle2 size={11} color={C.white} />}
                        </div>
                        <span style={{ fontSize: T.labelLg, fontWeight: 600, color: selected ? C.orange : C.slate, ...fBody }}>{selected ? "Selected" : "Select this service"}</span>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
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
                      <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{r.name}</div>
                      <div style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{r.date}</div>
                    </div>
                  </div>
                  <StarRow value={r.rating} />
                </div>
                <p style={{ fontSize: T.body, color: C.slate, marginTop: 8, lineHeight: 1.55, ...fBody }}>{r.text}</p>
                {r.verified && <Badge tone="neutral" icon={CheckCircle2}>Verified booking</Badge>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "12px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        {unavailable ? (
          <div style={{ flex: 1 }}>
            <Btn full disabled variant="secondary">Unavailable for new bookings</Btn>
          </div>
        ) : selectedPkg ? (
          <>
            <div>
              <div style={{ fontSize: T.titleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>${selectedPkg.price}</div>
              <div style={{ fontSize: T.caption, color: C.slate, maxWidth: 120, ...fBody }}>{selectedPkg.name}</div>
            </div>
            <div style={{ flex: 1 }}>
              <Btn full onClick={() => nav("package-detail", { coachId: coach.id, packageId: selectedPkg.id })}>
                View package
              </Btn>
            </div>
          </>
        ) : (
          <div style={{ flex: 1 }}>
            <Btn full onClick={() => setTab("packages")}>Select a service</Btn>
          </div>
        )}
        <button onClick={() => nav("chat-thread", { name: coach.name })} style={{ width: 46, height: 46, borderRadius: 14, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <MessageCircle size={18} color={C.jet} />
        </button>
      </div>
    </div>
  );
}
