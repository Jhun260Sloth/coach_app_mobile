import React, { useState } from "react";
import {
  Edit3, Bell, CreditCard, Fingerprint, Lock, FileText, Shield, HelpCircle, LogOut, Users, ChevronRight,
  Mail, Phone, User, Plus, Trash2, Eye, EyeOff, AlertTriangle,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { Avatar, Btn, SectionLabel, Toggle, BottomSheet, Field } from "../../components/ui/Primitives";

export function ScreenClientProfile({ nav, biometric, setBiometric, toast, addCoachRole }) {
  const [sheet, setSheet] = useState(null); // which bottom sheet is open

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
