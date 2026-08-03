import React, { useState, useRef, useEffect } from "react";
import {
  Bell, Search, Filter, Navigation, Star, MapPin, Heart, BadgeCheck, Sparkles,
  Calendar, MessageCircle, Percent, Check, X, Maximize2, Plus, Minus,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACHES, SPORTS, ALL_SUBURBS, CLIENT_NOTIFICATIONS } from "../../data/mockData";
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
              <MapPin size={12} /> {coach.suburb} · {coach.distanceKm} km
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

const MAP_PIN_POSITIONS = [[20, 30], [60, 15], [40, 55], [78, 45], [25, 70], [65, 75], [50, 40], [15, 55], [85, 20], [35, 80]];
const MAP_WORLD_SIZE = 1000;

export function PannableMapView({ coaches = [], onOpen, onClose }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dragRef = useRef(null);
  const movedRef = useRef(false);

  const startDrag = (e) => {
    const point = e.touches ? e.touches[0] : e;

    dragRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      panX: pan.x,
      panY: pan.y,
    };

    movedRef.current = false;
  };

  const moveDrag = (e) => {
    if (!dragRef.current) return;

    const point = e.touches ? e.touches[0] : e;

    const dx = point.clientX - dragRef.current.startX;
    const dy = point.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      movedRef.current = true;
    }

    setPan({
      x: dragRef.current.panX + dx,
      y: dragRef.current.panY + dy,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();

    setZoom((z) =>
      Math.min(
        2.5,
        Math.max(0.5, z - e.deltaY * 0.001)
      )
    );
  };

  const suggestions =
    searchText.trim().length > 0
      ? [
          ...new Set([
            ...coaches.map((c) => c.suburb),
            ...coaches.map((c) => c.name),
            ...coaches.map((c) => c.sport),
          ]),
        ]
          .filter((s) =>
            s
              .toLowerCase()
              .includes(searchText.trim().toLowerCase())
          )
          .slice(0, 5)
      : [];

  const visibleCoaches = searchText.trim()
    ? coaches.filter((c) => {
        const q = searchText.trim().toLowerCase();

        return (
          c.suburb.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.sport.toLowerCase().includes(q)
        );
      })
    : coaches;

  // Automatically center the map around matching coaches
  useEffect(() => {
    if (visibleCoaches.length === 0) return;

    const offsets = visibleCoaches.slice(0, 10).map((c, i) => {
      const [px, py] =
        MAP_PIN_POSITIONS[i % MAP_PIN_POSITIONS.length];

      return {
        x:
          (px / 100) * MAP_WORLD_SIZE -
          MAP_WORLD_SIZE / 2,

        y:
          (py / 100) * MAP_WORLD_SIZE -
          MAP_WORLD_SIZE / 2,
      };
    });

    const avgX =
      offsets.reduce((sum, o) => sum + o.x, 0) /
      offsets.length;

    const avgY =
      offsets.reduce((sum, o) => sum + o.y, 0) /
      offsets.length;

    setPan({
      x: -avgX,
      y: -avgY,
    });

  }, [searchText]);

  const selectSuggestion = (s) => {
    setSearchText(s);
    setShowSuggestions(false);
    setZoom(1.4);
  };

  const clearSearch = () => {
    setSearchText("");
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 999,
        background: C.fog,
      }}
    >
      {/* MAP AREA */}
      <div
        onMouseDown={startDrag}
        onMouseMove={moveDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={startDrag}
        onTouchMove={moveDrag}
        onTouchEnd={endDrag}
        onWheel={handleWheel}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          cursor: "grab",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: MAP_WORLD_SIZE,
            height: MAP_WORLD_SIZE,
            marginLeft: -MAP_WORLD_SIZE / 2,
            marginTop: -MAP_WORLD_SIZE / 2,

            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,

            transformOrigin: "center",

            backgroundImage:
              "linear-gradient(#E9EAEE 1px, transparent 1px), linear-gradient(90deg, #E9EAEE 1px, transparent 1px)",

            backgroundSize: "40px 40px",
          }}
        >
          {/* COACH PINS */}
          {visibleCoaches.slice(0, 10).map((c, i) => {
            const [px, py] =
              MAP_PIN_POSITIONS[
                i % MAP_PIN_POSITIONS.length
              ];

            const x =
              (px / 100) * MAP_WORLD_SIZE -
              MAP_WORLD_SIZE / 2;

            const y =
              (py / 100) * MAP_WORLD_SIZE -
              MAP_WORLD_SIZE / 2;

            return (
              <button
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();

                  onOpen && onOpen(c.id);
                }}
                style={{
                  position: "absolute",

                  left: `calc(50% + ${x}px)`,

                  top: `calc(50% + ${y}px)`,

                  transform:
                    "translate(-50%,-100%)",

                  background: "none",

                  border: "none",

                  cursor: "pointer",

                  display: "flex",

                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {/* COACH NAME */}
                <div
                  style={{
                    background: C.jet,

                    color: C.white,

                    fontSize: 11,

                    fontWeight: 700,

                    padding: "5px 9px",

                    borderRadius: 10,

                    whiteSpace: "nowrap",

                    marginBottom: 2,

                    maxWidth: 120,

                    overflow: "hidden",

                    textOverflow: "ellipsis",

                    ...fBody,
                  }}
                >
                  {c.name}
                </div>

                {/* MAP PIN */}
                <MapPin
                  size={22}
                  color={C.orange}
                  fill={C.orange}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 2,

          display: "flex",
          alignItems: "center",

          gap: 10,
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            width: 42,
            height: 42,

            borderRadius: 12,

            background: C.white,

            border: `1px solid ${C.border}`,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            cursor: "pointer",

            flexShrink: 0,

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <X size={18} color={C.jet} />
        </button>

        {/* SEARCH INPUT */}
        <div
          style={{
            position: "relative",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 8,

              background: C.white,

              borderRadius: 12,

              padding: "0 12px",

              height: 42,

              boxShadow:
                "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Search
              size={15}
              color={C.slateLight}
            />

            <input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() =>
                setShowSuggestions(true)
              }
              onBlur={() =>
                setTimeout(
                  () =>
                    setShowSuggestions(false),
                  120
                )
              }
              placeholder="Search location..."
              style={{
                flex: 1,

                border: "none",

                outline: "none",

                background: "transparent",

                fontSize: 13,

                color: C.jet,

                ...fBody,
              }}
            />

            {/* CLEAR SEARCH */}
            {searchText && (
              <button
                onMouseDown={(e) =>
                  e.preventDefault()
                }
                onClick={clearSearch}
                style={{
                  background: "none",

                  border: "none",

                  cursor: "pointer",

                  display: "flex",
                }}
              >
                <X
                  size={14}
                  color={C.slateLight}
                />
              </button>
            )}
          </div>

          {/* SEARCH SUGGESTIONS */}
          {showSuggestions &&
            suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",

                  top: "calc(100% + 6px)",

                  left: 0,

                  right: 0,

                  zIndex: 20,

                  background: C.white,

                  borderRadius: 12,

                  border: `1px solid ${C.border}`,

                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.08)",

                  overflow: "hidden",
                }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() =>
                      selectSuggestion(s)
                    }
                    style={{
                      width: "100%",

                      textAlign: "left",

                      padding: "10px 14px",

                      background: "none",

                      border: "none",

                      borderBottom: `1px solid ${C.border}`,

                      cursor: "pointer",

                      display: "flex",

                      alignItems: "center",

                      gap: 8,

                      fontSize: 13,

                      color: C.jet,

                      ...fBody,
                    }}
                  >
                    <MapPin
                      size={13}
                      color={C.slateLight}
                    />

                    {s}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* ZOOM CONTROLS */}
      <div
        style={{
          position: "absolute",

          top: 74,

          left: 16,

          zIndex: 2,

          display: "flex",

          flexDirection: "column",

          borderRadius: 12,

          overflow: "hidden",

          boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* ZOOM IN */}
        <button
          onClick={() =>
            setZoom((z) =>
              Math.min(2.5, z + 0.25)
            )
          }
          style={{
            width: 34,

            height: 34,

            background: C.white,

            border: "none",

            borderBottom: `1px solid ${C.border}`,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            cursor: "pointer",
          }}
        >
          <Plus size={15} color={C.jet} />
        </button>

        {/* ZOOM OUT */}
        <button
          onClick={() =>
            setZoom((z) =>
              Math.max(0.5, z - 0.25)
            )
          }
          style={{
            width: 34,

            height: 34,

            background: C.white,

            border: "none",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            cursor: "pointer",
          }}
        >
          <Minus size={15} color={C.jet} />
        </button>
      </div>

      {/* LOCATION INDICATOR */}
      <div
        style={{
          position: "absolute",

          bottom: 24,

          left: 16,

          background: C.white,

          borderRadius: 10,

          padding: "5px 9px",

          fontSize: 10.5,

          color: C.slate,

          display: "flex",

          alignItems: "center",

          gap: 4,

          ...fBody,

          pointerEvents: "none",
        }}
      >
        <Navigation
          size={11}
          color={C.orange}
        />

        Using your location
      </div>
    </div>
  );
}

const DEFAULT_FILTERS = {
  sports: [],
  areas: [],
  maxPrice: 150,
  minRating: 0,
};;

export function ScreenClientHome({ nav, favorites, toggleFav, filters, onFiltersChange }) {
  const [view, setView] = useState("list");
  const [sportFilter, setSportFilter] = useState("All");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(CLIENT_NOTIFICATIONS);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const appliedFilters = filters || DEFAULT_FILTERS;
  const setAppliedFilters = onFiltersChange || (() => {});

  const suggestions = searchText.trim().length > 0
    ? [...new Set([...ALL_SUBURBS, ...COACHES.map((c) => c.name)])]
        .filter((s) => s.toLowerCase().includes(searchText.trim().toLowerCase()))
        .slice(0, 5)
    : [];

  const filtered = COACHES.filter((c) => {
    const sportMatch = sportFilter === "All" || c.sport === sportFilter;
    const q = searchText.trim().toLowerCase();
    const searchMatch = !q ||
      c.suburb.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.sport.toLowerCase().includes(q);
    const areaMatch = appliedFilters.areas.length === 0 ||
      appliedFilters.areas.some((a) => c.suburb.toLowerCase().includes(a.toLowerCase()));
    return sportMatch && searchMatch && areaMatch;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => setNotifications((arr) => arr.map((n) => ({ ...n, unread: false })));
  const openNotification = (n) => {
    setNotifications((arr) => arr.map((x) => x.id === n.id ? { ...x, unread: false } : x));
    setNotifOpen(false);
    if (n.type === "message") nav("chat-thread", { name: n.coachName });
    else if (n.type === "availability" && n.coachId) nav("coach-profile", { id: n.coachId });
    else if (n.type === "booking" || n.type === "review") nav("client-dashboard");
  };

const selectSuggestion = (s) => {
  setSearchText(s);
  setShowSuggestions(false);
  setZoom(1.4);
};

  const clearAreaFilters = () => setAppliedFilters({ ...appliedFilters, areas: [] });

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

        <div style={{ position: "relative", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.fog, borderRadius: 14, padding: "13px 14px" }}>
            <Search size={16} color={C.slateLight} />
            <input
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Sport, coach name or suburb"
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 13.5, color: C.jet, ...fBody,
              }}
            />
            {searchText && (
              <button onClick={() => setSearchText("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <X size={14} color={C.slateLight} />
              </button>
            )}
            <button onClick={() => nav("search-filters", { initialFilters: appliedFilters, onApply: setAppliedFilters })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Filter size={15} color={C.slate} />
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
              background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden",
            }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => selectSuggestion(s)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 14px", background: "none",
                    border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.jet, ...fBody,
                  }}
                >
                  <MapPin size={13} color={C.slateLight} /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 4 }}>
          <Chip active={sportFilter === "All"} onClick={() => setSportFilter("All")}>All sports</Chip>
          {SPORTS.map((s) => <Chip key={s} active={sportFilter === s} onClick={() => setSportFilter(s)}>{s}</Chip>)}
        </div> */}

        {appliedFilters.areas.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: C.slate, ...fBody }}>Areas:</span>
            {appliedFilters.areas.map((a) => (
              <span key={a} style={{
                display: "flex", alignItems: "center", gap: 4, background: C.orangeTint, color: C.orange,
                borderRadius: 99, padding: "4px 9px", fontSize: 11.5, fontWeight: 600, ...fBody,
              }}>
                {a}
              </span>
            ))}
            <button onClick={clearAreaFilters} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11.5, color: C.slateLight, textDecoration: "underline", ...fBody }}>
              Clear
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.jet, ...fDisplay }}>
            <Navigation size={13} color={C.orange} /> Coaches near you
          </div>
          <SegTabs value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "map", label: "Map" }]} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px" }}>
    {filtered.length === 0 ? (
  <div style={{ textAlign: "center", padding: "40px 20px", color: C.slate, fontSize: 13, ...fBody }}>
    No coaches match your search. Try a different suburb or clear filters.
  </div>
) : (
  filtered.map((c) => (
    <CoachListCard key={c.id} coach={c} fav={favorites.includes(c.id)} onFav={() => toggleFav(c.id)} onOpen={() => nav("coach-profile", { id: c.id })} />
  ))
)}
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
      {view === "map" && (
  <PannableMapView
    coaches={filtered}
    onOpen={(id) => nav("coach-profile", { id })}
    onClose={() => setView("list")}
  />
)}
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

  const toggleSport = (s) => setSports((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]);

  const areaSuggestions = areaInput.trim().length > 0
    ? ALL_SUBURBS.filter((s) => s.toLowerCase().includes(areaInput.trim().toLowerCase()) && !areas.includes(s)).slice(0, 5)
    : [];

  const addArea = (s) => {
    if (!areas.includes(s)) setAreas([...areas, s]);
    setAreaInput("");
  };
  const removeArea = (s) => setAreas(areas.filter((a) => a !== s));

  const reset = () => {
    setSports([]);
    setAreas([]);
    setAreaInput("");
    setPrice(100);
    setMinRating(0);
  };

  const applyAndShow = () => {
    const result = { sports, areas, maxPrice: price, minRating };
    if (onApply) onApply(result);
    nav("client-home");
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Filters" onBack={() => nav("client-home")} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <SectionLabel>Sport</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {SPORTS.map((s) => <Chip key={s} active={sports.includes(s)} onClick={() => toggleSport(s)}>{s}</Chip>)}
        </div>

        <SectionLabel>Location</SectionLabel>
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <input
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              placeholder="Add a suburb or area"
              style={{
                width: "100%", boxSizing: "border-box", background: C.fog, border: "none", borderRadius: 12,
                padding: "11px 14px", fontSize: 13.5, color: C.jet, outline: "none", ...fBody,
              }}
            />
            {areaSuggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
                background: C.white, borderRadius: 12, border: `1px solid ${C.border}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden",
              }}>
                {areaSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addArea(s)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 14px", background: "none",
                      border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.jet, ...fBody,
                    }}
                  >
                    <MapPin size={13} color={C.slateLight} /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {areas.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {areas.map((a) => (
                <span key={a} style={{
                  display: "flex", alignItems: "center", gap: 6, background: C.orangeTint, color: C.orange,
                  borderRadius: 99, padding: "6px 10px", fontSize: 12.5, fontWeight: 600, ...fBody,
                }}>
                  {a}
                  <button onClick={() => removeArea(a)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                    <X size={12} color={C.orange} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

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
        <Btn variant="outline" onClick={reset}>Reset</Btn>
        <div style={{ flex: 1 }}><Btn full onClick={applyAndShow}>Show results</Btn></div>
      </div>
    </div>
  );
}