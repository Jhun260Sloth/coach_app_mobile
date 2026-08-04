import React, { useState } from "react";
import {
  Edit3, Bell, CreditCard, Fingerprint, Lock, FileText, Shield, HelpCircle, LogOut, Users, ChevronRight,
  Mail, Phone, User, Plus, Trash2, Eye, EyeOff, AlertTriangle, Camera, MapPin, Target, Calendar, UserPlus,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { Avatar, Btn, SectionLabel, Toggle, BottomSheet, Field, Chip, Card, Badge } from "../../components/ui/Primitives";
import { SPORTS } from "../../data/mockData";

const emptyChildDraft = { name: "", age: "", sport: [], goals: "", postalCode: "", preferences: "", hasPhoto: false };

export function ScreenClientProfile({ nav, biometric, setBiometric, toast, addCoachRole, children = [], addChild, updateChild, removeChild, bookings = [] }) {
  const [sheet, setSheet] = useState(null); // which bottom sheet is open
  const [editingChildId, setEditingChildId] = useState(null); // null = creating new
  const [childDraft, setChildDraft] = useState(emptyChildDraft);

  const openNewChild = () => { setEditingChildId(null); setChildDraft(emptyChildDraft); setSheet("child"); };
  const openEditChild = (child) => { setEditingChildId(child.id); setChildDraft({ ...emptyChildDraft, ...child }); setSheet("child"); };
  const toggleDraftSport = (s) => setChildDraft((d) => ({ ...d, sport: d.sport.includes(s) ? d.sport.filter((x) => x !== s) : [...d.sport, s] }));
  const saveChild = () => {
    if (!childDraft.name.trim()) { toast("Give this profile a name first"); return; }
    if (editingChildId) { updateChild(editingChildId, childDraft); toast(`${childDraft.name}'s profile updated`); }
    else { addChild(childDraft); toast(`${childDraft.name}'s profile added`); }
    setSheet(null);
  };
  const deleteChild = () => {
    if (editingChildId) removeChild(editingChildId);
    toast("Profile removed");
    setSheet(null);
  };

  const [notifPrefs, setNotifPrefs] = useState({
    push: true, email: true, sms: false, bookingReminders: true, messages: true, promos: false,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const [cards, setCards] = useState([
    { id: 1, brand: "Visa", last4: "4242", exp: "08/28", isDefault: true },
    { id: 2, brand: "Mastercard", last4: "8891", exp: "02/27", isDefault: false },
  ]);
  const removeCard = (id) => setCards((c) => c.filter((card) => card.id !== id));
  const makeDefault = (id) => setCards((c) => c.map((card) => ({ ...card, isDefault: card.id === id })));

  const [showPw, setShowPw] = useState(false);

  const closeSheet = () => setSheet(null);

  const Row2 = ({ icon: Icon, label, onClick, right }) => (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
      <Icon size={17} color={C.jet} />
      <span style={{ flex: 1, fontSize: 13.5, color: C.jet, fontWeight: 500, ...fBody }}>{label}</span>
      {right || <ChevronRight size={16} color={C.slateLight} />}
    </button>
  );

  const NotifRow = ({ label, sub, prefKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>{sub}</div>}
      </div>
      <Toggle on={notifPrefs[prefKey]} onClick={() => toggleNotif(prefKey)} />
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.jet, marginBottom: 18, ...fDisplay }}>Account</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <Avatar name="Sarah Lin" size={58} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.jet, ...fDisplay }}>Sarah Lin</div>
            <div style={{ fontSize: 12.5, color: C.slate, ...fBody }}>sarah.lin@email.com</div>
          </div>
        </div>

        <Btn full variant="secondary" icon={Users} onClick={() => { addCoachRole(); toast("Coach profile added — switch anytime"); }}>Add a coaching profile</Btn>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Family</SectionLabel>
          <div style={{ fontSize: 12, color: C.slate, marginTop: -6, marginBottom: 12, lineHeight: 1.5, ...fBody }}>
            Manage a separate profile for each child — their own sport, goals and booking history, all under your account.
          </div>
          {children.map((child) => (
            <button key={child.id} onClick={() => openEditChild(child)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
              <Avatar name={child.name || "Child"} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{child.name || "Unnamed profile"}</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 1, ...fBody }}>
                  {child.age ? `Age ${child.age}` : "Age not set"}{child.sport?.length ? ` · ${child.sport.join(", ")}` : ""}
                </div>
              </div>
              <ChevronRight size={16} color={C.slateLight} />
            </button>
          ))}
          <div style={{ marginTop: 12 }}>
            <Btn full variant="secondary" icon={UserPlus} onClick={openNewChild}>Add a child profile</Btn>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Profile</SectionLabel>
          <Row2 icon={Edit3} label="Edit profile" onClick={() => setSheet("edit")} />
          <Row2 icon={Bell} label="Notification preferences" onClick={() => setSheet("notif")} />
          <Row2 icon={CreditCard} label="Payment methods" onClick={() => setSheet("payment")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Security</SectionLabel>
          <Row2 icon={Fingerprint} label="Biometric login" right={<Toggle on={biometric} onClick={() => setBiometric((v) => !v)} />} />
          <Row2 icon={Lock} label="Change password" onClick={() => setSheet("password")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Privacy</SectionLabel>
          <Row2 icon={FileText} label="Export my data" onClick={() => toast("We'll email your data export shortly")} />
          <Row2 icon={Shield} label="Privacy policy" onClick={() => setSheet("privacy")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Support</SectionLabel>
          <Row2 icon={HelpCircle} label="Help & FAQs" onClick={() => nav("support")} />
        </div>

        <div style={{ marginTop: 22 }}>
          <Row2 icon={LogOut} label="Log out" onClick={() => setSheet("logout")} />
          <button onClick={() => setSheet("deactivate")} style={{ width: "100%", textAlign: "left", padding: "13px 4px", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: "#D64545", fontWeight: 500, ...fBody }}>Deactivate account</span>
          </button>
        </div>
      </div>

      {/* Child / participant profile */}
      <BottomSheet open={sheet === "child"} onClose={() => setSheet(null)} title={editingChildId ? "Edit child profile" : "Add child profile"} heightPct={90}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <button
            onClick={() => setChildDraft((d) => ({ ...d, hasPhoto: !d.hasPhoto }))}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}
          >
            {childDraft.hasPhoto ? <Avatar name={childDraft.name || "Child"} size={72} /> : (
              <div style={{ width: 72, height: 72, borderRadius: 72, background: C.fog, border: `1.5px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={20} color={C.slateLight} />
              </div>
            )}
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 24, background: C.orange, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={11} color={C.white} />
            </div>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 2 }}>
              <Field label="Child's name" placeholder="e.g. Ava" icon={User} value={childDraft.name} onChange={(e) => setChildDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Age" placeholder="e.g. 9" value={childDraft.age} onChange={(e) => setChildDraft((d) => ({ ...d, age: e.target.value }))} />
            </div>
          </div>
          <Field label="Location / postcode" placeholder="e.g. 2026" icon={MapPin} value={childDraft.postalCode} onChange={(e) => setChildDraft((d) => ({ ...d, postalCode: e.target.value }))} />
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Sport / interests</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {SPORTS.map((s) => (
              <Chip key={s} active={childDraft.sport.includes(s)} onClick={() => toggleDraftSport(s)}>{s}</Chip>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Coaching goals</SectionLabel>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
            <Target size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <textarea
              value={childDraft.goals}
              onChange={(e) => setChildDraft((d) => ({ ...d, goals: e.target.value }))}
              placeholder="e.g. build confidence for club trials"
              rows={2}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, resize: "none", ...fBody }}
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionLabel>Coaching preferences</SectionLabel>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px" }}>
            <Users size={16} color={C.slateLight} style={{ marginTop: 2, flexShrink: 0 }} />
            <textarea
              value={childDraft.preferences}
              onChange={(e) => setChildDraft((d) => ({ ...d, preferences: e.target.value }))}
              placeholder="e.g. prefers a female coach, mornings only"
              rows={2}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.jet, resize: "none", ...fBody }}
            />
          </div>
        </div>

        {editingChildId && (
          <div style={{ marginTop: 18 }}>
            <SectionLabel>Booking history</SectionLabel>
            {(() => {
              const history = bookings.filter((b) => b.participant === childDraft.name);
              if (history.length === 0) {
                return <div style={{ fontSize: 12.5, color: C.slateLight, ...fBody }}>No sessions booked yet for {childDraft.name || "this profile"}.</div>;
              }
              return history.map((b) => (
                <Card key={b.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.jet, ...fBody }}>{b.service}</div>
                      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{b.coachName} · {b.date}</div>
                    </div>
                    <Badge tone={b.status === "completed" ? "success" : "orange"}>{b.status}</Badge>
                  </div>
                </Card>
              ));
            })()}
          </div>
        )}

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full onClick={saveChild}>{editingChildId ? "Save changes" : "Add profile"}</Btn>
          {editingChildId && (
            <Btn full variant="danger" icon={Trash2} onClick={deleteChild}>Remove profile</Btn>
          )}
        </div>
      </BottomSheet>

      {/* Edit profile */}
      <BottomSheet open={sheet === "edit"} onClose={closeSheet} title="Edit profile" heightPct={78}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Avatar name="Sarah Lin" size={64} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Full name" placeholder="Sarah Lin" icon={User} />
          <Field label="Email" placeholder="sarah.lin@email.com" icon={Mail} type="email" />
          <Field label="Phone" placeholder="+1 (555) 123-4567" icon={Phone} type="tel" />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Profile updated"); closeSheet(); }}>Save changes</Btn>
        </div>
      </BottomSheet>

      {/* Notification preferences */}
      <BottomSheet open={sheet === "notif"} onClose={closeSheet} title="Notification preferences" heightPct={70}>
        <NotifRow label="Push notifications" sub="Alerts on this device" prefKey="push" />
        <NotifRow label="Email notifications" sub="Updates sent to your inbox" prefKey="email" />
        <NotifRow label="SMS notifications" sub="Text messages for urgent updates" prefKey="sms" />
        <NotifRow label="Booking reminders" sub="Reminders before your sessions" prefKey="bookingReminders" />
        <NotifRow label="Messages" sub="New messages from coaches" prefKey="messages" />
        <NotifRow label="Promotions & offers" sub="Deals and product news" prefKey="promos" />
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Notification preferences saved"); closeSheet(); }}>Save preferences</Btn>
        </div>
      </BottomSheet>

      {/* Payment methods */}
      <BottomSheet open={sheet === "payment"} onClose={closeSheet} title="Payment methods" heightPct={70}>
        {cards.map((card) => (
          <div key={card.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 28, borderRadius: 6, background: C.fog, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={15} color={C.jet} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.jet, ...fBody }}>{card.brand} •••• {card.last4}</div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 2, ...fBody }}>Expires {card.exp}{card.isDefault ? " · Default" : ""}</div>
            </div>
            {!card.isDefault && (
              <button onClick={() => makeDefault(card.id)} style={{ background: "none", border: "none", color: C.orange, fontSize: 12, fontWeight: 600, cursor: "pointer", ...fBody }}>Set default</button>
            )}
            <button onClick={() => removeCard(card.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <Trash2 size={15} color={C.slateLight} />
            </button>
          </div>
        ))}
        <div style={{ marginTop: 18 }}>
          <Btn full variant="secondary" icon={Plus} onClick={() => toast("Add a new payment method")}>Add payment method</Btn>
        </div>
      </BottomSheet>

      {/* Change password */}
      <BottomSheet open={sheet === "password"} onClose={closeSheet} title="Change password" heightPct={62}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Current password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} rightIcon={showPw ? EyeOff : Eye} onRight={() => setShowPw((v) => !v)} />
          <Field label="New password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
          <Field label="Confirm new password" placeholder="••••••••" icon={Lock} type={showPw ? "text" : "password"} />
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full onClick={() => { toast("Password updated"); closeSheet(); }}>Update password</Btn>
        </div>
      </BottomSheet>

      {/* Privacy policy */}
      <BottomSheet open={sheet === "privacy"} onClose={closeSheet} title="Privacy policy" heightPct={75}>
        <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, ...fBody }}>
          <p style={{ marginBottom: 12 }}>CoachLink collects only the information needed to connect you with coaches and manage your bookings, such as your profile details, session history, and payment information.</p>
          <p style={{ marginBottom: 12 }}>We never sell your personal data. Information is shared with coaches only as needed to fulfil a booking, and with payment processors to complete transactions securely.</p>
          <p>You can request a copy of your data or ask us to delete your account at any time from this Account tab.</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <Btn full variant="secondary" onClick={closeSheet}>Close</Btn>
        </div>
      </BottomSheet>

      {/* Log out confirmation */}
      <BottomSheet open={sheet === "logout"} onClose={closeSheet} title="Log out" heightPct={38}>
        <div style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.55, marginBottom: 18, ...fBody }}>
          Are you sure you want to log out of your account?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="dark" icon={LogOut} onClick={() => { closeSheet(); nav("splash"); }}>Log out</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>

      {/* Deactivate account confirmation */}
      <BottomSheet open={sheet === "deactivate"} onClose={closeSheet} title="Deactivate account" heightPct={46}>
        <div style={{ display: "flex", gap: 10, padding: 12, background: C.warnTint, borderRadius: 14, marginBottom: 16 }}>
          <AlertTriangle size={17} color="#D64545" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: C.jet, lineHeight: 1.5, ...fBody }}>
            Deactivating your account will hide your profile and cancel any upcoming bookings. This can be undone by logging back in within 30 days.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn full variant="danger" onClick={() => { closeSheet(); toast("Account deactivated"); nav("splash"); }}>Deactivate account</Btn>
          <Btn full variant="secondary" onClick={closeSheet}>Cancel</Btn>
        </div>
      </BottomSheet>
    </div>
  );
}
