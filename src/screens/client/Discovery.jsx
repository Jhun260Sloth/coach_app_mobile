import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Filter, Navigation, Star, MapPin, Heart, Sparkles, Calendar, MessageCircle, Percent, Check, X, CreditCard } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, SPORTS, ALL_SUBURBS } from "../../data/mockData";
import { Card, Chip, Badge, SegTabs, SectionLabel, Avatar, Btn, TopBar, BottomSheet, EmptyState } from "../../components/ui/Primitives";
import { useLiveNotifications, NotificationBellButton, StatusBanner } from "../../systems/StateSystem";
import { CoachMapView } from "../../components/map/CoachMapView";

// Only the current in-app coach (Josh Whitfield, c2) has a live "available now"
// toggle driven by app state — every other coach in the directory is static
// mock data, so this is the one card that can actually flip to "unavailable".
const LIVE_AVAILABILITY_COACH_ID = "c2";

const NOTIF_ICON = { booking: Calendar, message: MessageCircle, review: Star, availability: Sparkles, promo: Percent, payment: CreditCard };
const DEFAULT_FILTERS = { sports: [], areas: [], maxPrice: 150, minRating: 0 };

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export function CoachListCard({ coach, onOpen, unavailable }) {
  return (
    <Card
      onClick={onOpen}
      style={{ marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(22,24,29,.04)", opacity: unavailable ? 0.8 : 1 }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar name={coach.name} size={54} />
          {unavailable && (
            <span style={{ position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: 99, background: C.slateLight, border: `2px solid ${C.white}` }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Identity + price: price sits top-right, same visual weight as the name, so it's
              one of the first two things scanned — not something buried at the bottom of the card. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.jet, letterSpacing: "-0.1px", ...oneLine, ...fDisplay }}>{coach.name}</div>
              {/* Sport category — bumped up in size/weight and given the brand colour so a
                  client's eye lands on "what this coach does" as fast as on their name. */}
              <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginTop: 2, ...oneLine, ...fDisplay }}>{coach.sport}</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.jet, whiteSpace: "nowrap", flexShrink: 0, ...fDisplay }}>
              ${coach.packages[0].price}<span style={{ fontSize: 11, fontWeight: 500, color: C.slateLight }}>/session</span>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: C.jet, fontWeight: 600, ...fBody }}>
              <Star size={12} fill={C.orange} color={C.orange} /> {coach.rating}
              <span style={{ color: C.slateLight, fontWeight: 400 }}>({coach.reviews})</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 4, fontSize: 12.5, color: C.slate, marginTop: 4, ...fBody }}>
              <MapPin size={12} style={{ flexShrink: 0, marginTop: 1 }} /> <span style={{ minWidth: 0 }}>{coach.suburb} · {coach.distanceKm} km</span>
            </div>
          </div>

          {(coach.instantBook || unavailable) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {unavailable ? (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.fog, color: C.slate, ...fBody }}>Currently unavailable</span>
              ) : (
                <>
                  {coach.verified.identity && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.successTint, color: C.success, ...fBody }}>Verified</span>
                  )}
                  {coach.instantBook && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 8, background: C.orangeTint, color: C.orange, ...fBody }}>Instant book</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ScreenClientHome({ nav, favorites, toggleFav, filters, onFiltersChange, clientNotifications: notifications, setClientNotifications: setNotifications, coachAvailableNow }) {
  const [view, setView] = useState("list");
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const appliedFilters = filters || DEFAULT_FILTERS;
  const setAppliedFilters = onFiltersChange || (() => {});
  const unreadCount = notifications.filter(n => n.unread).length;

  const suggestions = searchText.trim().length > 0
    ? [...new Set([...ALL_SUBURBS, ...COACHES.map(c => c.name)])].filter(s => s.toLowerCase().includes(searchText.trim().toLowerCase())).slice(0, 5)
    : [];

  const filtered = COACHES.filter(c => {
    const q = searchText.trim().toLowerCase();
    return (!q || c.suburb.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q))
      && (!appliedFilters.areas.length || appliedFilters.areas.some(a => c.suburb.toLowerCase().includes(a.toLowerCase())));
  });
  const favCoaches = COACHES.filter(c => favorites.includes(c.id));

  const markAllRead = () => setNotifications(arr => arr.map(n => ({ ...n, unread: false })));
  const openNotification = n => {
    setNotifications(arr => arr.map(x => x.id === n.id ? { ...x, unread: false } : x));
    setNotifOpen(false);
    if (n.type === "message") nav("chat-thread", { name: n.coachName });
    else if (n.type === "availability" && n.coachId) nav("coach-profile", { id: n.coachId });
    else if (["booking", "review", "payment"].includes(n.type)) {
      nav(n.bookingId ? "client-booking-detail" : "client-dashboard", n.bookingId ? { id: n.bookingId } : {});
    }
  };
  const selectSuggestion = s => { setSearchText(s); setShowSuggestions(false); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12.5, color: C.slate, ...fBody }}>Good morning</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, ...fDisplay }}>Find your coach</div>
          </div>
          <NotificationBellButton count={unreadCount} onClick={() => setNotifOpen(true)} />
        </div>

        <div style={{ position: "relative", marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 14, padding: "13px 14px" }}>
            <Search size={16} color={C.slateLight} />
            <input value={searchText} onChange={e => { setSearchText(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Sport, coach name or suburb" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, ...fBody }} />
            {searchText && <button onClick={() => setSearchText("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={14} color={C.slateLight} /></button>}
            <button onClick={() => nav("search-filters", { initialFilters: appliedFilters, onApply: setAppliedFilters })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Filter size={15} color={C.slate} />
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {suggestions.map(s => (
                <button key={s} onMouseDown={() => selectSuggestion(s)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.jet, ...fBody }}>
                  <MapPin size={13} color={C.slateLight} /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {appliedFilters.areas.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: C.slate, ...fBody }}>Areas:</span>
            {appliedFilters.areas.map(a => (
              <span key={a} style={{ display: "flex", alignItems: "center", gap: 4, background: C.orangeTint, color: C.orange, borderRadius: 99, padding: "4px 9px", fontSize: 11.5, fontWeight: 600, ...fBody }}>{a}</span>
            ))}
            <button onClick={() => setAppliedFilters({ ...appliedFilters, areas: [] })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11.5, color: C.slateLight, textDecoration: "underline", ...fBody }}>Clear</button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.jet, ...fDisplay }}>
            {view === "favorites" ? <><Heart size={13} color={C.orange} /> Your favorites</> : <><Navigation size={13} color={C.orange} /> Coaches near you</>}
          </div>
          <SegTabs strong value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "map", label: "Map" }, { value: "favorites", label: "Favorites" }]} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px" }}>
        {view === "favorites" ? (
          favCoaches.length === 0
            ? <EmptyState icon={Heart} title="No favorites yet" body="Tap the heart on a coach's card or profile to save them here." />
            : favCoaches.map(c => <CoachListCard key={c.id} coach={c} onOpen={() => nav("coach-profile", { id: c.id })} />)
        ) : filtered.length === 0
          ? (
            <StatusBanner
              state="noResults"
              style={{ marginTop: 10 }}
              onPrimary={() => { setSearchText(""); setAppliedFilters(DEFAULT_FILTERS); }}
            />
          )
          : filtered.map(c => <CoachListCard key={c.id} coach={c} unavailable={c.id === LIVE_AVAILABILITY_COACH_ID && !coachAvailableNow} onOpen={() => nav("coach-profile", { id: c.id })} />)
        }
      </div>

      <BottomSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications" heightPct={72}>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: C.orange, fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 10, padding: "2px 0", ...fBody }}>
            <Check size={13} /> Mark all as read
          </button>
        )}
        {notifications.map(n => {
          const Icon = NOTIF_ICON[n.type] || Bell;
          return (
            <button key={n.id} onClick={() => openNotification(n)} style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color={C.orange} /></div>
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

      {view === "map" && <CoachMapView coaches={filtered} onOpen={id => nav("coach-profile", { id })} onClose={() => setView("list")} />}
    </div>
  );
}

export function ScreenSearchFilters({ nav, initialFilters, onApply }) {
  const base = initialFilters || DEFAULT_FILTERS;
  const [sports, setSports] = useState(base.sports || []);
  const [areas, setAreas] = useState(base.areas || []);
  const [areaInput, setAreaInput] = useState("");
  const [price, setPrice] = useState(base.maxPrice || 100);
  const [minRating, setMinRating] = useState(base.minRating || 0);

  const areaSuggestions = areaInput.trim().length > 0
    ? ALL_SUBURBS.filter(s => s.toLowerCase().includes(areaInput.trim().toLowerCase()) && !areas.includes(s)).slice(0, 5)
    : [];

  const addArea = s => { if (!areas.includes(s)) setAreas([...areas, s]); setAreaInput(""); };
  const reset = () => { setSports([]); setAreas([]); setAreaInput(""); setPrice(100); setMinRating(0); };
  const applyAndShow = () => { onApply?.({ sports, areas, maxPrice: price, minRating }); nav("client-home"); };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Filters" onBack={() => nav("client-home")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <SectionLabel>Sport</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {SPORTS.map(s => <Chip key={s} active={sports.includes(s)} onClick={() => setSports(arr => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s])}>{s}</Chip>)}
        </div>

        <SectionLabel>Location</SectionLabel>
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <input value={areaInput} onChange={e => setAreaInput(e.target.value)} placeholder="Add a suburb or area"
              style={{ width: "100%", boxSizing: "border-box", background: C.fog, border: "none", borderRadius: 12, padding: "11px 14px", fontSize: 13.5, color: C.jet, outline: "none", ...fBody }} />
            {areaSuggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {areaSuggestions.map(s => (
                  <button key={s} onClick={() => addArea(s)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.jet, ...fBody }}>
                    <MapPin size={13} color={C.slateLight} /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {areas.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {areas.map(a => (
                <span key={a} style={{ display: "flex", alignItems: "center", gap: 6, background: C.orangeTint, color: C.orange, borderRadius: 99, padding: "6px 10px", fontSize: 12.5, fontWeight: 600, ...fBody }}>
                  {a}
                  <button onClick={() => setAreas(areas.filter(x => x !== a))} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}><X size={12} color={C.orange} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <SectionLabel>Max price per session â€” ${price}</SectionLabel>
        <input type="range" min="20" max="150" step="5" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", accentColor: C.orange, marginBottom: 20 }} />

        <SectionLabel>Minimum rating</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[0, 3, 4, 4.5].map(r => <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>{r === 0 ? "Any" : `${r}+`}</Chip>)}
        </div>

        <SectionLabel>Availability</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["Today", "This week", "Weekends", "Mornings", "Evenings"].map(t => <Chip key={t}>{t}</Chip>)}
        </div>
      </div>
      <div style={{ padding: "14px 0", display: "flex", gap: 10 }}>
        <Btn variant="outline" onClick={reset}>Reset</Btn>
        <div style={{ flex: 1 }}><Btn full onClick={applyAndShow}>Show results</Btn></div>
      </div>
    </div>
  );
}