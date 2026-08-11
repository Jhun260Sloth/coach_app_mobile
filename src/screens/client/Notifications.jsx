import React from "react";
import { Bell, Calendar, MessageCircle, Star, Sparkles, Percent, CreditCard, Check } from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";
import { TopBar, EmptyState } from "../../components/ui/Primitives";

const NOTIF_ICON = { booking: Calendar, message: MessageCircle, review: Star, availability: Sparkles, promo: Percent, payment: CreditCard };

// Dedicated screen instead of a bottom sheet — gives notifications room to
// breathe (full list, no clipped height) and a natural place to grow into
// per-notification detail/management later, instead of being squeezed into
// a sheet meant for quick glances.
export function ScreenNotifications({ nav, clientNotifications: notifications = [], setClientNotifications: setNotifications }) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => setNotifications?.((arr) => arr.map((n) => ({ ...n, unread: false })));

  const openNotification = (n) => {
    setNotifications?.((arr) => arr.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    if (n.type === "message") nav("chat-thread", { name: n.coachName });
    else if (n.type === "availability" && n.coachId) nav("coach-profile", { id: n.coachId });
    else if (["booking", "review", "payment"].includes(n.type)) {
      nav(n.bookingId ? "client-booking-detail" : "client-dashboard", n.bookingId ? { id: n.bookingId } : {});
    }
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Notifications" onBack={() => nav("client-home")} />

      {unreadCount > 0 && (
        <button
          onClick={markAllRead}
          style={{ display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-start", background: "none", border: "none", color: C.orange, fontSize: T.labelLg, fontWeight: 600, cursor: "pointer", marginBottom: 12, padding: "2px 0", ...fBody }}
        >
          <Check size={13} /> Mark all as read
        </button>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" body="Updates about your bookings, messages and offers will show up here." />
        ) : (
          notifications.map((n) => {
            const Icon = NOTIF_ICON[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => openNotification(n)}
                style={{ width: "100%", display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.orangeTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={C.orange} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: T.bodyLg, fontWeight: 600, color: C.jet, ...fBody }}>{n.title}</span>
                    <span style={{ fontSize: T.caption, color: C.slateLight, flexShrink: 0, ...fBody }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: T.body, color: C.slate, marginTop: 4, lineHeight: 1.5, ...fBody }}>{n.body}</div>
                </div>
                {n.unread && <span style={{ width: 8, height: 8, borderRadius: 99, background: C.orange, flexShrink: 0, marginTop: 6 }} />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
