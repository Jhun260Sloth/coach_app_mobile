import React, { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Trash2, Plus, Clock, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { Card, ScreenHeader, SectionLabel, Btn, ConfirmDialog, Toggle, Chip, EmptyState, SegTabs, Avatar, StatusPill } from "../../components/ui/Primitives";
import { useApp } from "../../context/AppContext";
import { BOOKING_STATUS } from "../../data/bookings";

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// "14:30" -> "2:30 PM"
function to12h(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/* ---- date helpers for the calendar view ---- */
function addDays(d, n) { const r = new Date(d); r.setDate(d.getDate() + n); return r; }
function startOfWeek(d) { const dow = (d.getDay() + 6) % 7; return addDays(d, -dow); } // Monday-start
function buildMonthGrid(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const weeks = [];
  let cur = gridStart;
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) { row.push(cur); cur = addDays(cur, 1); }
    weeks.push(row);
  }
  return weeks;
}
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
// Matches the "Sat, 2 Aug" style strings used for one-off exceptions.
function formatDateShort(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function parseCalendarBadge(dateStr) {
  if (!dateStr) return { weekday: "-", dayNumber: "-" };
  const str = String(dateStr).trim();

  // Extract day number (1-31)
  const dayMatch = str.match(/\b([0-3]?\d)\b/);
  const dayNumber = dayMatch ? dayMatch[1] : "-";

  // Match English day of week name or abbreviation (e.g. Saturday -> SAT, Thu -> THU)
  const weekdayMatch = str.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*/i);
  if (weekdayMatch) {
    return {
      weekday: weekdayMatch[1].slice(0, 3).toUpperCase(),
      dayNumber,
    };
  }

  // If dateStr can be parsed as a Date object
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return {
      weekday: dows[parsed.getDay()],
      dayNumber: String(parsed.getDate()),
    };
  }

  // Fallback: take first 3 letters
  const alpha = str.match(/[a-zA-Z]{3}/);
  return {
    weekday: alpha ? alpha[0].toUpperCase() : "-",
    dayNumber,
  };
}

const DOW_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScreenCoachCalendar({ nav, toast, coachPackages, availabilityBlocks, setAvailabilityBlocks, coachBookings = [] }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const timeInputStyle = {
    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
    fontSize: T.bodyLg, outline: "none", boxSizing: "border-box", color: C.jet, background: C.white, ...fBody,
  };
  const [synced, setSynced] = useState(true);
  const [removalTarget, setRemovalTarget] = useState(null);
  const [section, setSection] = useState("schedule");
  const [view, setView] = useState("list");
  const scheduledSessions = coachBookings.filter((booking) => [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(booking.status));

  // Calendar view — month grid navigation
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const weeks = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const headerLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const goPrev = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  // New availability block form state
  const [showForm, setShowForm] = useState(false);
  const [days, setDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pkgIds, setPkgIds] = useState([]);

  const toggleDay = (d) => setDays((a) => (a.includes(d) ? a.filter((x) => x !== d) : [...a, d]));
  const togglePkg = (id) => setPkgIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const resetForm = () => { setDays([]); setStart(""); setEnd(""); setPkgIds([]); setShowForm(false); };

  const saveBlock = () => {
    if (days.length === 0) { toast("Pick at least one day"); return; }
    if (!start || !end) { toast("Set a start and end time"); return; }
    if (start >= end) { toast("End time must be after start time"); return; }
    if (pkgIds.length === 0) { toast("Select at least one package for this slot"); return; }
    setAvailabilityBlocks((arr) => [...arr, { id: "ab" + Date.now(), days: [...days], start, end, packageIds: [...pkgIds] }]);
    toast("Availability added");
    resetForm();
  };
  const removeBlock = (id) => { setAvailabilityBlocks((arr) => arr.filter((b) => b.id !== id)); toast("Availability removed"); };

  const packageName = (id) => coachPackages.find((p) => p.id === id)?.name || "Package";
  const packageMissing = (b) => b.packageIds.length === 0;

  // One-off exceptions (dates blocked out entirely, e.g. leave)
  const [exceptions, setExceptions] = useState([{ id: "e1", date: "Sat, 2 Aug", reason: "Personal leave" }]);
  const [showExForm, setShowExForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  };

  const saveException = () => {
    if (!newDate) { toast("Pick a date for the exception"); return; }
    setExceptions((arr) => [...arr, { id: "e" + (arr.length + 1), date: formatDate(newDate), reason: newReason || "Unavailable" }]);
    toast("Exception added");
    setNewDate(""); setNewReason(""); setShowExForm(false);
  };
  const removeException = (id) => { setExceptions((arr) => arr.filter((e) => e.id !== id)); toast("Exception removed"); };
  const confirmRemoval = () => {
    if (removalTarget?.type === "availability") removeBlock(removalTarget.id);
    if (removalTarget?.type === "exception") removeException(removalTarget.id);
    setRemovalTarget(null);
  };

  // Resolve a calendar date to whichever weekly availability blocks recur on
  // that day, and whether a one-off exception blocks it out entirely.
  const blocksForDate = (d) => availabilityBlocks.filter((b) => b.days.includes(DOW_ABBR[d.getDay()]));
  const exceptionForDate = (d) => exceptions.find((ex) => ex.date === formatDateShort(d));
  const selectedBlocks = blocksForDate(selectedDate);
  const selectedException = exceptionForDate(selectedDate);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0" }}>
        <ScreenHeader title="Calendar" subtitle="Sessions and availability in one place." style={{ marginBottom: 14 }} />

        <div style={{ marginBottom: 10 }}>
          <SegTabs value={section} onChange={setSection} items={[{ value: "schedule", label: "Schedule" }, { value: "availability", label: "Availability" }]} />
        </div>

        {section === "availability" && <div style={{ marginBottom: 16 }}>
          <SegTabs value={view} onChange={setView} items={[{ value: "list", label: "List" }, { value: "calendar", label: "Calendar" }]} />
        </div>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", paddingBottom: 116 }} className="cl-hide-scrollbar">
        {section === "schedule" ? (
          <>
            <Card style={{ marginBottom: 16, padding: 16, background: C.jet, border: "none" }}>
              <div style={{ fontSize: T.captionLg, color: C.onDarkMuted, ...fBody }}>Confirmed schedule</div>
              <div style={{ fontSize: T.hero, fontWeight: 750, color: C.white, marginTop: 3, ...fDisplay }}>{scheduledSessions.length}</div>
              <div style={{ fontSize: T.captionLg, color: C.onDark, marginTop: 2, ...fBody }}>upcoming sessions ready to deliver</div>
            </Card>
            <SectionLabel>Upcoming sessions</SectionLabel>
            {scheduledSessions.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="Your schedule is clear" body="Confirmed client sessions will appear here." />
            ) : scheduledSessions.map((booking) => {
              const badge = parseCalendarBadge(booking.date);
              return (
                <Card key={booking.id} onClick={() => nav("coach-session-detail", { id: booking.id })} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 48, height: 50, borderRadius: 14, background: C.brandTint, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "3px 2px" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.brand, textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1, ...fBody }}>{badge.weekday}</span>
                      <span style={{ fontSize: 18, fontWeight: 750, color: C.jet, marginTop: 3, lineHeight: 1, ...fDisplay }}>{badge.dayNumber}</span>
                    </div>
                    <Avatar name={booking.clientName} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{booking.clientName}</div>
                      <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{booking.service}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: T.caption, color: C.slateLight, marginTop: 4, ...fBody }}><Clock size={11} />{booking.time} · {booking.mode}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                    <StatusPill status={booking.status} />
                  </div>
                </Card>
              );
            })}
          </>
        ) : view === "calendar" ? (
          <>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <button type="button" aria-label="Previous month" onClick={goPrev} style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronLeft size={16} color={C.jet} />
                </button>
                <span style={{ fontSize: T.bodyLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{headerLabel}</span>
                <button type="button" aria-label="Next month" onClick={goNext} style={{ width: 44, height: 44, borderRadius: 12, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronRight size={16} color={C.jet} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
                {WEEKDAY_HEADERS.map((d) => (
                  <div key={d} style={{ textAlign: "center", fontSize: T.tiny, fontWeight: 700, color: C.slateLight, ...fBody }}>{d}</div>
                ))}
              </div>
              {weeks.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                  {row.map((d, di) => {
                    const inRange = d.getMonth() === cursor.getMonth();
                    const isSelected = sameDay(d, selectedDate);
                    const blocked = !!exceptionForDate(d);
                    const available = !blocked && blocksForDate(d).length > 0;
                    return (
                      <button key={di} onClick={() => setSelectedDate(d)} style={{
                        aspectRatio: "1", width: "100%", minWidth: 0, minHeight: 0, borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${isSelected ? C.brand : C.border}`,
                        background: isSelected ? C.brandTint : C.white,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                        opacity: inRange ? 1 : 0.35,
                      }}>
                        <span style={{ fontSize: T.label, fontWeight: isSelected ? 700 : 500, color: C.jet, ...fBody }}>{d.getDate()}</span>
                        <span style={{
                          width: 5, height: 5, borderRadius: 99,
                          background: blocked ? C.danger : available ? C.success : "transparent",
                        }} />
                      </button>
                    );
                  })}
                </div>
              ))}

              <div style={{ display: "flex", gap: 14, marginTop: 12, justifyContent: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.caption, color: C.slate, ...fBody }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: C.success }} /> Available
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: T.caption, color: C.slate, ...fBody }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: C.danger }} /> Blocked
                </span>
              </div>
            </Card>

            <SectionLabel>{selectedDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</SectionLabel>
            {selectedException && (
              <Card style={{ marginBottom: 10, background: C.dangerTint, border: `1px solid ${C.dangerBorder}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Ban size={16} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Blocked all day</div>
                  <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Reason: {selectedException.reason}</div>
                </div>
              </Card>
            )}
            {!selectedException && selectedBlocks.length === 0 && (
              <EmptyState icon={CalendarIcon} title="No availability" body="Nothing set for this day. Add a weekly slot below in List view." />
            )}
            {!selectedException && selectedBlocks.map((b) => (
              <Card key={b.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={12} color={C.slate} />
                  <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>{to12h(b.start)} – {to12h(b.end)}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {packageMissing(b) ? (
                    <span style={{ fontSize: T.captionLg, color: C.brand, fontWeight: 600, ...fBody }}>No packages selected</span>
                  ) : (
                    b.packageIds.map((id) => <Chip key={id} active>{packageName(id)}</Chip>)
                  )}
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
        <Card style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarIcon size={17} color={C.jet} />
            <div>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>Sync with device calendar</div>
              <div style={{ fontSize: T.caption, color: C.slate, ...fBody }}>{synced ? "Connected - Google Calendar" : "Not connected"}</div>
            </div>
          </div>
          <Toggle label="Sync with device calendar" on={synced} onClick={() => { setSynced((v) => !v); toast(!synced ? "Calendar connected" : "Calendar disconnected"); }} />
        </Card>

        <SectionLabel>Weekly availability</SectionLabel>
        <div style={{ fontSize: T.captionLg, color: C.slateLight, marginBottom: 12, marginTop: -6, ...fBody }}>
          Set exact times you're bookable, then choose which packages clients can book in each slot.
        </div>

        {availabilityBlocks.length === 0 && !showForm && (
          <EmptyState icon={Clock} title="No availability set" body="Add a time slot so clients can start booking you." />
        )}

        {availabilityBlocks.map((b) => (
          <Card key={b.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{b.days.join(", ")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <Clock size={12} color={C.slate} />
                  <span style={{ fontSize: T.label, color: C.slate, ...fBody }}>{to12h(b.start)} – {to12h(b.end)}</span>
                </div>
              </div>
              <button onClick={() => setRemovalTarget({ type: "availability", id: b.id, label: `${b.days.join(", ")} · ${to12h(b.start)}–${to12h(b.end)}` })} aria-label="Remove availability" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <Trash2 size={16} color={C.slateLight} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {packageMissing(b) ? (
                <span style={{ fontSize: T.captionLg, color: C.brand, fontWeight: 600, ...fBody }}>No packages selected</span>
              ) : (
                b.packageIds.map((id) => <Chip key={id} active>{packageName(id)}</Chip>)
              )}
            </div>
          </Card>
        ))}

        {showForm && (
          <Card style={{ marginBottom: 10 }}>
            <SectionLabel>New availability</SectionLabel>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Days</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DAY_OPTIONS.map((d) => <Chip key={d} active={days.includes(d)} onClick={() => toggleDay(d)}>{d}</Chip>)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Start time</div>
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={timeInputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>End time</div>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={timeInputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Packages available in this slot</div>
              {coachPackages.length === 0 ? (
                <div style={{ fontSize: T.label, color: C.slateLight, ...fBody }}>Create a package first, then come back to set when it's bookable.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {coachPackages.map((p) => <Chip key={p.id} active={pkgIds.includes(p.id)} onClick={() => togglePkg(p.id)}>{p.name}</Chip>)}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="outline" size="sm" full onClick={resetForm}>Cancel</Btn>
              <Btn size="sm" full onClick={saveBlock}>Save availability</Btn>
            </div>
          </Card>
        )}

        {!showForm && (
          <Btn variant="outline" size="sm" icon={Plus} full onClick={() => setShowForm(true)}>Add availability</Btn>
        )}

        <div style={{ marginTop: 20 }}>
          <SectionLabel>One-off exceptions</SectionLabel>
          {exceptions.map((ex) => (
            <Card key={ex.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>{ex.date} - blocked</div>
                <div style={{ fontSize: T.captionLg, color: C.slate, ...fBody }}>Reason: {ex.reason}</div>
              </div>
              <button onClick={() => setRemovalTarget({ type: "exception", id: ex.id, label: ex.date })} aria-label={`Remove exception for ${ex.date}`} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <Trash2 size={16} color={C.slateLight} />
              </button>
            </Card>
          ))}

          {showExForm && (
            <Card style={{ marginBottom: 10 }}>
              <SectionLabel>New exception</SectionLabel>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Date</div>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, outline: "none", color: C.jet, background: C.white, boxSizing: "border-box", ...fBody }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Reason (optional)</div>
                <input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Personal leave"
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px", fontSize: T.bodyLg, outline: "none", color: C.jet, background: C.white, boxSizing: "border-box", ...fBody }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="outline" size="sm" full onClick={() => { setShowExForm(false); setNewDate(""); setNewReason(""); }}>Cancel</Btn>
                <Btn size="sm" full onClick={saveException}>Save exception</Btn>
              </div>
            </Card>
          )}

          {!showExForm && (
            <Btn variant="outline" size="sm" icon={Plus} full onClick={() => setShowExForm(true)}>Add exception</Btn>
          )}
        </div>
          </>
        )}
      </div>
      <ConfirmDialog
        open={!!removalTarget}
        onClose={() => setRemovalTarget(null)}
        onConfirm={confirmRemoval}
        title={removalTarget?.type === "availability" ? "Remove this availability?" : "Remove this exception?"}
        description={removalTarget?.type === "availability"
          ? `${removalTarget?.label || "This time slot"} will no longer be offered for new bookings.`
          : `${removalTarget?.label || "This date"} will become available according to your weekly schedule.`}
        confirmLabel="Remove"
        icon={Trash2}
      />
    </div>
  );
}
