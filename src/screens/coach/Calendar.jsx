import React, { useState } from "react";
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { Card, SectionLabel, Btn, Toggle } from "../../components/ui/Primitives";

export function ScreenCoachCalendar({ nav, toast }) {
  const [synced, setSynced] = useState(true);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["6:00", "7:00", "9:00", "16:00", "17:00", "18:00"];
  const [active, setActive] = useState({ "Tue-6:00": true, "Tue-7:00": true, "Thu-6:00": true, "Sat-9:00": true });
  const toggle = (k) => setActive((a) => ({ ...a, [k]: !a[k] }));

  const [exceptions, setExceptions] = useState([{ id: "e1", date: "Sat, 2 Aug", reason: "Personal leave" }]);
  const [showForm, setShowForm] = useState(false);
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
    setNewDate(""); setNewReason(""); setShowForm(false);
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

        <SectionLabel>Recurring weekly availability</SectionLabel>
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: `70px repeat(${days.length}, 40px)`, gap: 6, minWidth: 400 }}>
            <div />
            {days.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: C.slate, ...fBody }}>{d}</div>)}
            {slots.map((s) => (
              <React.Fragment key={s}>
                <div style={{ fontSize: 11, color: C.slate, display: "flex", alignItems: "center", ...fBody }}>{s}</div>
                {days.map((d) => {
                  const k = `${d}-${s}`;
                  const on = active[k];
                  return (
                    <button key={k} onClick={() => toggle(k)} style={{
                      width: 40, height: 30, borderRadius: 8, cursor: "pointer",
                      background: on ? C.orange : C.fog, border: "none",
                    }} />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

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

        {showForm && (
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
              <Btn variant="outline" size="sm" full onClick={() => { setShowForm(false); setNewDate(""); setNewReason(""); }}>Cancel</Btn>
              <Btn size="sm" full onClick={saveException}>Save exception</Btn>
            </div>
          </Card>
        )}

        {!showForm && (
          <Btn variant="outline" size="sm" icon={Plus} full onClick={() => setShowForm(true)}>Add exception</Btn>
        )}
      </div>
    </div>
  );
}
