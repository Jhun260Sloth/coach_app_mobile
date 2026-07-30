import React, { useState } from "react";
import {
  Bell, Search, Filter, Navigation, Star, MapPin, Heart, BadgeCheck, Sparkles,
  Calendar, MessageCircle, Percent, Check,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, SPORTS, CLIENT_NOTIFICATIONS } from "../../data/mockData";
import { Card, Chip, Badge, SegTabs, SectionLabel, Avatar, Btn, TopBar, BottomSheet } from "../../components/ui/Primitives";

const NOTIF_ICON = {
  booking: Calendar,
  message: MessageCircle,
  review: Star,
  availability: Sparkles,
  promo: Percent,
};

export function CoachListCard({ coach, onOpen, fav, onFav }) {
  return (
    <Card onClick={onOpen} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Avatar name={coach.name} size={54} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: C.jet, ...fDisplay }}>{coach.name}</div>
              <div style={{ fontSize: 12.5, color: C.slate, ...fBody }}>{coach.sport}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onFav(); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Heart size={18} color={fav ? C.orange : C.slateLight} fill={fav ? C.orange : "none"} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: C.jet, fontWeight: 600, ...fBody }}>
              <Star size={12} fill={C.orange} color={C.orange} /> {coach.rating} <span style={{ color: C.slateLight, fontWeight: 400 }}>({coach.reviews})</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12.5, color: C.slate, ...fBody }}>
              <MapPin size={12} /> {coach.distanceKm} km
            </span>
          </div>
         <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
              width: "100%",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", minWidth: 0 }}>
              {coach.verified.identity && <Badge tone="success" icon={BadgeCheck}>Verified</Badge>}
              {coach.instantBook && <Badge tone="orange" icon={Sparkles}>Instant Book</Badge>}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.jet,
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginLeft: "auto",
                ...fDisplay,
              }}
            >
              ${coach.packages[0].price}
              <span style={{ fontSize: 11, fontWeight: 500, color: C.slate }}>/session</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ScreenClientHome({ nav, favorites, toggleFav }) {
  const [view, setView] = useState("list");
  const [sportFilter, setSportFilter] = useState("All");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(CLIENT_NOTIFICATIONS);
  const filtered = COACHES.filter((c) => sportFilter === "All" || c.sport === sportFilter);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => setNotifications((arr) => arr.map((n) => ({ ...n, unread: false })));
  const openNotification = (n) => {
    setNotifications((arr) => arr.map((x) => x.id === n.id ? { ...x, unread: false } : x));
    setNotifOpen(false);
    if (n.type === "message") nav("chat-thread", { name: n.coachName });
    else if (n.type === "availability" && n.coachId) nav("coach-profile", { id: n.coachId });
    else if (n.type === "booking" || n.type === "review") nav("client-dashboard");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12.5, color: C.slate, ...fBody }}>Good morning</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>Find your coach</div>
          </div>
          <button onClick={() => setNotifOpen(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ position: "relative" }}>
              <Bell size={22} color={C.jet} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -6, minWidth: 15, height: 15, padding: "0 3px",
                  background: C.orange, borderRadius: 99, border: `1.5px solid ${C.white}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9.5, fontWeight: 700, color: C.white, ...fBody,
                }}>{unreadCount}</span>
              )}
            </div>
          </button>
        </div>

        <button onClick={() => nav("search-filters")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: C.fog, border: "none", borderRadius: 14, padding: "13px 14px", marginTop: 16, cursor: "pointer" }}>
          <Search size={16} color={C.slateLight} />
          <span style={{ fontSize: 13.5, color: C.slateLight, ...fBody }}>Sport, coach name or suburb</span>
          <Filter size={15} color={C.slate} style={{ marginLeft: "auto" }} />
        </button>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 4 }}>
          <Chip active={sportFilter === "All"} onClick={() => setSportFilter("All")}>All sports</Chip>
          {SPORTS.map((s) => <Chip key={s} active={sportFilter === s} onClick={() => setSportFilter(s)}>{s}</Chip>)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.jet, ...fDisplay }}>
            <Navigation size={13} color={C.orange} /> Coaches near you
          </div>
          <SegTabs value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "map", label: "Map" }]} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px" }}>
        {view === "map" ? <MapView coaches={filtered} onOpen={(id) => nav("coach-profile", { id })} /> :
          filtered.map((c) => (
            <CoachListCard key={c.id} coach={c} fav={favorites.includes(c.id)} onFav={() => toggleFav(c.id)} onOpen={() => nav("coach-profile", { id: c.id })} />
          ))}
      </div>

      <BottomSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications" heightPct={72}>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: C.orange, fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 10, padding: "2px 0", ...fBody }}>
            <Check size={13} /> Mark all as read
          </button>
        )}
        {notifications.map((n) => {
          const Icon = NOTIF_ICON[n.type] || Bell;
          return (
            <button key={n.id} onClick={() => openNotification(n)}
              style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={C.orange} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{n.title}</span>
                  <span style={{ fontSize: 10.5, color: C.slateLight, flexShrink: 0, ...fBody }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.slate, marginTop: 3, lineHeight: 1.45, ...fBody }}>{n.body}</div>
              </div>
              {n.unread && <span style={{ width: 8, height: 8, borderRadius: 99, background: C.orange, flexShrink: 0, marginTop: 5 }} />}
            </button>
          );
        })}
      </BottomSheet>
    </div>
  );
}

export function MapView({ coaches, onOpen }) {
  const positions = [[20, 30], [60, 15], [40, 55], [78, 45], [25, 70], [65, 75]];
  return (
    <div style={{ position: "relative", height: 320, borderRadius: 18, overflow: "hidden", background: C.fog, marginBottom: 16, border: `1px solid ${C.border}` }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <rect width="100" height="100" fill={C.fog} />
        {[10, 30, 50, 70, 90].map((x) => <line key={"v" + x} x1={x} y1="0" x2={x} y2="100" stroke="#E9EAEE" strokeWidth="0.4" />)}
        {[10, 30, 50, 70, 90].map((y) => <line key={"h" + y} x1="0" y1={y} x2="100" y2={y} stroke="#E9EAEE" strokeWidth="0.4" />)}
      </svg>
      {coaches.slice(0, 6).map((c, i) => {
        const [x, y] = positions[i % positions.length];
        return (
          <button key={c.id} onClick={() => onOpen(c.id)} style={{
            position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-100%)",
            background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ background: C.jet, color: C.white, fontSize: 11, fontWeight: 700, padding: "5px 9px", borderRadius: 10, whiteSpace: "nowrap", marginBottom: 2, ...fBody }}>
              ${c.packages[0].price}
            </div>
            <MapPin size={22} color={C.orange} fill={C.orange} />
          </button>
        );
      })}
      <div style={{ position: "absolute", bottom: 10, left: 10, background: C.white, borderRadius: 10, padding: "5px 9px", fontSize: 10.5, color: C.slate, display: "flex", alignItems: "center", gap: 4, ...fBody }}>
        <Navigation size={11} color={C.orange} /> Using your location
      </div>
    </div>
  );
}

export function ScreenSearchFilters({ nav }) {
  const [sports, setSports] = useState([]);
  const [radius, setRadius] = useState(10);
  const [price, setPrice] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const toggle = (s) => setSports((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]);
  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Filters" onBack={() => nav("client-home")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <SectionLabel>Sport</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {SPORTS.map((s) => <Chip key={s} active={sports.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}
        </div>

        <SectionLabel>Travel radius — up to {radius} km</SectionLabel>
        <input type="range" min="1" max="30" value={radius} onChange={(e) => setRadius(e.target.value)} style={{ width: "100%", accentColor: C.orange, marginBottom: 20 }} />

        <SectionLabel>Max price per session — ${price}</SectionLabel>
        <input type="range" min="20" max="150" step="5" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", accentColor: C.orange, marginBottom: 20 }} />

        <SectionLabel>Minimum rating</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[0, 3, 4, 4.5].map((r) => (
            <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>{r === 0 ? "Any" : `${r}+`}</Chip>
          ))}
        </div>

        <SectionLabel>Availability</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["Today", "This week", "Weekends", "Mornings", "Evenings"].map((t) => <Chip key={t}>{t}</Chip>)}
        </div>
      </div>
      <div style={{ padding: "14px 0", display: "flex", gap: 10 }}>
        <Btn variant="outline" onClick={() => { setSports([]); setRadius(10); setPrice(100); setMinRating(0); }}>Reset</Btn>
        <div style={{ flex: 1 }}><Btn full onClick={() => nav("client-home")}>Show results</Btn></div>
      </div>
    </div>
  );
}
