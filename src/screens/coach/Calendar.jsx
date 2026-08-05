import React, { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Ban, Trash2, CalendarDays,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { COACH_BLOCKED, fmtTimeRange } from "../../data/mockData";
import {
  Card, SectionLabel, Btn, Avatar, StatusPill, BottomSheet, EmptyState, Chip,
} from "../../components/ui/Primitives";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TODAY_ISO = "2026-08-03";

function pad(n) { return String(n).padStart(2, "0"); }
function iso(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y, m) { return new Date(y, m, 1).getDay(); }

function monthLabel(y, m) {
  const d = new Date(y, m, 1);
  return d.toLocaleDateString(undefined, { month: "long" });
}
function dayLabel(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}

const STATUS_DOT = {
  pending: C.orange,
  confirmed: C.success,
  completed: C.slateLight,
  cancelled: C.slateLight,
};

export function ScreenCoachCalendar({ nav, toast, coachBookings }) {
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7); // August (0-indexed)
  const [selectedDate, setSelectedDate] = useState(TODAY_ISO);
  const [blocked, setBlocked] = useState(COACH_BLOCKED);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [bDate, setBDate] = useState(TODAY_ISO);
  const [bAllDay, setBAllDay] = useState(true);
  const [bStart, setBStart] = useState("09:00");
  const [bEnd, setBEnd] = useState("17:00");
  const [bReason, setBReason] = useState("");

  const bookingsByDate = useMemo(() => {
    const map = {};
    coachBookings.forEach((b) => {
      if (!b.dateISO) return;
      (map[b.dateISO] ||= []).push(b);
    });
    return map;
  }, [coachBookings]);

  const blockedByDate = useMemo(() => {
    const map = {};
    blocked.forEach((x) => { (map[x.dateISO] ||= []).push(x); });
    return map;
  }, [blocked]);

  const weeks = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const startPad = firstWeekday(viewYear, viewMonth);
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewYear, viewMonth]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  };

  const selectedBookings = (bookingsByDate[selectedDate] || []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
  const selectedBlocks = blockedByDate[selectedDate] || [];
  const allDayBlocked = selectedBlocks.some((x) => x.allDay);

  const saveBlock = () => {
    if (!bDate) { toast("Pick a date to block"); return; }
    if (!bAllDay && bStart >= bEnd) { toast("End time must be after start time"); return; }
    setBlocked((arr) => [
      ...arr,
      { id: "bl" + (arr.length + 1), dateISO: bDate, allDay: bAllDay, startTime: bAllDay ? undefined : bStart, endTime: bAllDay ? undefined : bEnd, reason: bReason || "Unavailable" },
    ]);
    toast("Marked unavailable");
    setSheetOpen(false);
    setSelectedDate(bDate);
    setBReason("");
  };
  const removeBlock = (id) => { setBlocked((arr) => arr.filter((x) => x.id !== id)); toast("Unavailability removed"); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 14, ...fDisplay }}>Calendar</div>

        {/* Month header + nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: C.jet, ...fDisplay }}>
            {viewYear} / {viewMonth + 1} <span style={{ fontSize: 13, fontWeight: 500, color: C.slateLight }}>· {monthLabel(viewYear, viewMonth)}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => changeMonth(-1)} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft size={16} color={C.jet} />
            </button>
            <button onClick={() => changeMonth(1)} style={{ width: 30, height: 30, borderRadius: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight size={16} color={C.jet} />
            </button>
          </div>
        </div>

        {/* Weekday header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: C.slateLight, padding: "4px 0", ...fBody }}>{w}</div>
          ))}
        </div>

        {/* Month grid */}
        <div style={{ marginBottom: 18 }}>
          {weeks.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {row.map((d, ci) => {
                if (!d) return <div key={ci} style={{ height: 46 }} />;
                const dateISO = iso(viewYear, viewMonth, d);
                const isSelected = dateISO === selectedDate;
                const isToday = dateISO === TODAY_ISO;
                const events = bookingsByDate[dateISO] || [];
                const dayBlocks = blockedByDate[dateISO] || [];
                const isBlockedAllDay = dayBlocks.some((x) => x.allDay);
                return (
                  <button
                    key={ci}
                    onClick={() => setSelectedDate(dateISO)}
                    style={{
                      height: 46, border: "none", background: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: isSelected ? 700 : isToday ? 700 : 500,
                      background: isSelected ? C.orange : "transparent",
                      color: isSelected ? C.white : isBlockedAllDay ? C.slateLight : C.jet,
                      border: isToday && !isSelected ? `1.5px solid ${C.orange}` : "none",
                      textDecoration: isBlockedAllDay && !isSelected ? "line-through" : "none",
                      ...fBody,
                    }}>
                      {d}
                    </span>
                    <span style={{ display: "flex", gap: 2, height: 4 }}>
                      {events.slice(0, 3).map((e, i) => (
                        <span key={i} style={{ width: 4, height: 4, borderRadius: 99, background: isSelected ? C.white : STATUS_DOT[e.status] || C.slate }} />
                      ))}
                      {events.length === 0 && dayBlocks.length > 0 && (
                        <span style={{ width: 4, height: 4, borderRadius: 99, background: isSelected ? C.white : C.slateLight }} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Day agenda */}
        <SectionLabel>Sessions on {dayLabel(selectedDate)}</SectionLabel>

        {allDayBlocked && (
          <Card style={{ marginBottom: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <Ban size={16} color={C.slate} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, ...fBody }}>Unavailable all day</div>
              <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{selectedBlocks.find((x) => x.allDay)?.reason}</div>
            </div>
            <button onClick={() => removeBlock(selectedBlocks.find((x) => x.allDay).id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Trash2 size={14} color={C.slateLight} />
            </button>
          </Card>
        )}

        {selectedBlocks.filter((x) => !x.allDay).map((x) => (
          <Card key={x.id} style={{ marginBottom: 10, background: C.fog, border: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <Ban size={16} color={C.slate} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, ...fBody }}>Blocked · {fmtTimeRange(x.startTime, x.endTime)}</div>
              <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>{x.reason}</div>
            </div>
            <button onClick={() => removeBlock(x.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Trash2 size={14} color={C.slateLight} />
            </button>
          </Card>
        ))}

        {selectedBookings.length === 0 && !allDayBlocked && selectedBlocks.length === 0 && (
          <div style={{ marginBottom: 6 }}>
            <EmptyState icon={CalendarDays} title="Nothing scheduled" body="No sessions booked for this day yet." />
          </div>
        )}

        {selectedBookings.map((b) => (
          <Card key={b.id} style={{ marginBottom: 10 }} onClick={() => nav("coach-booking-detail", { id: b.id })}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                <Avatar name={b.clientName} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fDisplay }}>{b.clientName}</div>
                  <div style={{ fontSize: 12, color: C.slate, ...fBody }}>{b.service}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{fmtTimeRange(b.startTime, b.endTime)}</div>
                </div>
              </div>
              <StatusPill status={b.status} />
            </div>
          </Card>
        ))}

        <div style={{ marginTop: 8, marginBottom: 22 }}>
          <Btn full variant="outline" icon={Ban} onClick={() => { setBDate(selectedDate); setSheetOpen(true); }}>Block out this date / time</Btn>
        </div>

        {/* All blocked dates overview */}
        {blocked.length > 0 && (
          <>
            <SectionLabel>Unavailable dates & times</SectionLabel>
            {blocked
              .slice()
              .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
              .map((x) => (
                <Card key={x.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setSelectedDate(x.dateISO)}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, ...fBody }}>
                      {dayLabel(x.dateISO)} — {x.allDay ? "All day" : fmtTimeRange(x.startTime, x.endTime)}
                    </div>
                    <div style={{ fontSize: 11, color: C.slate, ...fBody }}>{x.reason}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(x.id); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                    <Trash2 size={14} color={C.slateLight} />
                  </button>
                </Card>
              ))}
          </>
        )}
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Block time off" heightPct={62}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Date</div>
          <input type="date" value={bDate} onChange={(e) => setBDate(e.target.value)}
            style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Chip active={bAllDay} onClick={() => setBAllDay(true)}>Whole day</Chip>
          <Chip active={!bAllDay} onClick={() => setBAllDay(false)}>Specific time slot</Chip>
        </div>

        {!bAllDay && (
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Start</div>
              <input type="time" value={bStart} onChange={(e) => setBStart(e.target.value)}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>End</div>
              <input type="time" value={bEnd} onChange={(e) => setBEnd(e.target.value)}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Reason (optional)</div>
          <input value={bReason} onChange={(e) => setBReason(e.target.value)} placeholder="e.g. Personal leave, facility maintenance"
            style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" full onClick={() => setSheetOpen(false)}>Cancel</Btn>
          <Btn full onClick={saveBlock}>Save</Btn>
        </div>
      </BottomSheet>
    </div>
  );
}
