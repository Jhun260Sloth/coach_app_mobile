import React, { useState } from "react";
import { Calendar as CalendarIcon, Trash2, Plus, Clock } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { Card, SectionLabel, Btn, Toggle, Chip, EmptyState } from "../../components/ui/Primitives";

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeInputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px",
  fontSize: 13.5, outline: "none", boxSizing: "border-box", ...fBody,
};

// "14:30" -> "2:30 PM"
function to12h(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function ScreenCoachCalendar({ nav, toast, coachPackages, availabilityBlocks, setAvailabilityBlocks }) {
  const [synced, setSynced] = useState(true);

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

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 14, ...fDisplay }}>Availability</div>

        <Card style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarIcon size={17} color={C.jet} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>Sync with device calendar</div>
              <div style={{ fontSize: 11, color: C.slate, ...fBody }}>{synced ? "Connected — Google Calendar" : "Not connected"}</div>
            </div>
          </div>
          <Toggle on={synced} onClick={() => { setSynced((v) => !v); toast(!synced ? "Calendar connected" : "Calendar disconnected"); }} />
        </Card>

        <SectionLabel>Weekly availability</SectionLabel>
        <div style={{ fontSize: 11.5, color: C.slateLight, marginBottom: 12, marginTop: -6, ...fBody }}>
          Set exact times you're bookable, then choose which packages clients can book in each slot.
        </div>

        {availabilityBlocks.length === 0 && !showForm && (
          <EmptyState icon={Clock} title="No availability set" body="Add a time slot so clients can start booking you." />
        )}

        {availabilityBlocks.map((b) => (
          <Card key={b.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{b.days.join(", ")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <Clock size={12} color={C.slate} />
                  <span style={{ fontSize: 12, color: C.slate, ...fBody }}>{to12h(b.start)} – {to12h(b.end)}</span>
                </div>
              </div>
              <button onClick={() => removeBlock(b.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <Trash2 size={16} color={C.slateLight} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {packageMissing(b) ? (
                <span style={{ fontSize: 11.5, color: C.orange, fontWeight: 600, ...fBody }}>No packages selected</span>
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
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Days</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DAY_OPTIONS.map((d) => <Chip key={d} active={days.includes(d)} onClick={() => toggleDay(d)}>{d}</Chip>)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Start time</div>
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={timeInputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>End time</div>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={timeInputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Packages available in this slot</div>
              {coachPackages.length === 0 ? (
                <div style={{ fontSize: 12, color: C.slateLight, ...fBody }}>Create a package first, then come back to set when it's bookable.</div>
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
                <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{ex.date} — blocked</div>
                <div style={{ fontSize: 11.5, color: C.slate, ...fBody }}>Reason: {ex.reason}</div>
              </div>
              <button onClick={() => removeException(ex.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <Trash2 size={16} color={C.slateLight} />
              </button>
            </Card>
          ))}

          {showExForm && (
            <Card style={{ marginBottom: 10 }}>
              <SectionLabel>New exception</SectionLabel>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Date</div>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", ...fBody }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Reason (optional)</div>
                <input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Personal leave"
                  style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13.5, outline: "none", ...fBody }} />
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
      </div>
    </div>
  );
}
