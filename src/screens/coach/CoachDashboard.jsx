import React, { useState } from "react";
import {
  WifiOff,
  Calendar,
  Star,
  Banknote,
  Bell,
  MessageCircle,
  ShieldAlert,
  Check,
  Percent,
} from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { REVIEWS, CONFIG, COACH_NOTIFICATIONS } from "../../data/mockData";
import {
  Avatar,
  Card,
  Btn,
  SectionLabel,
  StatusPill,
  StarRow,
  BottomSheet,
} from "../../components/ui/Primitives";
import { useLiveNotifications } from "../../systems/StateSystem";

const NOTIF_ICON = {
  message: MessageCircle,
  verification: ShieldAlert,
  booking: Calendar,
  review: Star,
  promo: Percent,
};

export function StatMini({ label, value, icon: Icon }) {
  return (
    <Card style={{ flex: 1, textAlign: "center", padding: "12px 6px" }}>
      <Icon size={15} color={C.orange} style={{ margin: "0 auto 6px" }} />
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.jet,
          ...fDisplay,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: C.slate,
          ...fBody,
        }}
      >
        {label}
      </div>
    </Card>
  );
}

export function ScreenCoachDashboard({
  nav,
  coachBookings,
  respondBooking,
  coachNotifications,
  verified,
  toast,
  offline,
  pushNotification,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  // Merges real, in-app-generated notifications (bookings actioned, etc) on
  // top of the seed list — which already includes the verification-expiry
  // notice — so expiry warnings surface here instead of as a dashboard banner.
  const [notifications, setNotifications] = useLiveNotifications(coachNotifications, COACH_NOTIFICATIONS);

  const pending = coachBookings.filter((b) => b.status === "pending");
  const upcoming = coachBookings.filter((b) => b.status === "confirmed");
  const completed = coachBookings.filter((b) => b.status === "completed");

  const earningsThisWeek = upcoming.reduce((s, b) => s + b.price, 0);
  const grossPaid = completed.reduce((s, b) => s + b.price, 0);
  const commission = Math.round(grossPaid * CONFIG.commissionRate);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const respondWithFeedback = (id, status, message) => {
    // Guard against acting on a request that's no longer pending (already
    // handled from the full Bookings screen, for instance).
    const target = coachBookings.find((b) => b.id === id);
    if (!target || target.status !== "pending") {
      toast("This request has already been handled");
      return;
    }
    setRespondingId(id);

    setTimeout(() => {
      respondBooking(id, status);
      setRespondingId(null);
      toast(message);
      pushNotification?.({
        audience: "client", type: "booking",
        title: status === "confirmed" ? "Booking confirmed" : "Booking declined",
        body: status === "confirmed"
          ? `Your session with ${target.coachName || "your coach"} is confirmed for ${target.date}, ${target.time}.`
          : `Your request for ${target.service} on ${target.date} was declined.`,
      });
    }, 600);
  };

  const markAllRead = () =>
    setNotifications((arr) =>
      arr.map((n) => ({
        ...n,
        unread: false,
      }))
    );

  const openNotification = (n) => {
    setNotifications((arr) =>
      arr.map((x) =>
        x.id === n.id
          ? {
              ...x,
              unread: false,
            }
          : x
      )
    );

    setNotifOpen(false);

    if (n.type === "message") {
      nav("chat-thread", {
        name: n.clientName,
        threadId: n.threadId,
      });
    } else if (n.type === "verification") {
      nav("coach-profile-edit");
    } else if (n.type === "booking") {
      nav("coach-bookings");
    } else if (n.type === "review") {
      nav("coach-dashboard");
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "18px 20px 0",
          flex: 1,
          overflowY: "auto",
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12.5,
                color: C.slate,
                ...fBody,
              }}
            >
              Welcome back
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: C.jet,
                ...fDisplay,
              }}
            >
              Josh's dashboard
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                <Bell size={22} color={C.jet} />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      minWidth: 15,
                      height: 15,
                      padding: "0 3px",
                      background: C.orange,
                      borderRadius: 99,
                      border: `1.5px solid ${C.white}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: C.white,
                      ...fBody,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Profile */}
            <button
              onClick={() => nav("coach-profile-edit")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Avatar name="Josh Whitfield" size={40} />
            </button>
          </div>
        </div>

        {/* Offline Status */}
        {offline && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: C.jet,
              color: C.white,
              padding: "9px 12px",
              borderRadius: 12,
              marginTop: 14,
              fontSize: 12,
              ...fBody,
            }}
          >
            <WifiOff size={14} color={C.orange} />
            Offline — showing your last synced data.
          </div>
        )}

        {/* Earnings + Pending Requests */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 18,
          }}
        >
          <div
            style={{
              background: C.jet,
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9CA0AC",
                ...fBody,
              }}
            >
              This week's earnings
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: C.white,
                marginTop: 4,
                ...fDisplay,
              }}
            >
              ${earningsThisWeek}
            </div>
          </div>

          <div
            style={{
              background: C.orangeTint,
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: C.orange,
                fontWeight: 600,
                ...fBody,
              }}
            >
              Pending requests
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: C.jet,
                marginTop: 4,
                ...fDisplay,
              }}
            >
              {pending.length}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 10,
          }}
        >
          <StatMini
            label="Upcoming"
            value={upcoming.length}
            icon={Calendar}
          />

          <StatMini
            label="Rating"
            value="4.8"
            icon={Star}
          />

          <StatMini
            label="Next payout"
            value="Fri"
            icon={Banknote}
          />
        </div>

        {/* Pending Requests */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 22,
            marginBottom: 10,
          }}
        >
          <SectionLabel>Pending requests</SectionLabel>

          <button
            onClick={() => nav("coach-bookings")}
            style={{
              background: "none",
              border: "none",
              color: C.orange,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              ...fBody,
            }}
          >
            See all
          </button>
        </div>

        {pending.length === 0 && (
          <div
            style={{
              fontSize: 12.5,
              color: C.slateLight,
              marginBottom: 6,
              ...fBody,
            }}
          >
            No pending requests right now.
          </div>
        )}

        {pending.map((b) => (
          <Card
            key={b.id}
            style={{
              marginBottom: 10,
            }}
            onClick={() =>
              nav("coach-booking-detail", {
                id: b.id,
              })
            }
          >
            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <Avatar name={b.clientName} size={40} />

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: C.jet,
                    ...fDisplay,
                  }}
                >
                  {b.clientName}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: C.slate,
                    ...fBody,
                  }}
                >
                  {b.service} · {b.date}, {b.time}
                </div>
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.jet,
                  ...fDisplay,
                }}
              >
                ${b.price}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                alignItems: "center",
              }}
            >
              <Btn
                size="sm"
                full
                loading={respondingId === b.id}
                loadingText="Accepting…"
                disabled={respondingId && respondingId !== b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  respondWithFeedback(
                    b.id,
                    "confirmed",
                    "Booking accepted"
                  );
                }}
              >
                Accept
              </Btn>

              <Btn
                size="sm"
                variant="ghost"
                disabled={respondingId === b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  respondWithFeedback(
                    b.id,
                    "declined",
                    "Booking declined"
                  );
                }}
              >
                Decline
              </Btn>
            </div>
          </Card>
        ))}

        {/* Upcoming Sessions */}
        <div
          style={{
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <SectionLabel>Upcoming sessions</SectionLabel>
        </div>

        {upcoming.length === 0 ? (
          <div
            style={{
              fontSize: 12.5,
              color: C.slateLight,
              ...fBody,
            }}
          >
            Nothing scheduled yet.
          </div>
        ) : (
          upcoming.map((b) => (
            <Card
              key={b.id}
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar name={b.clientName} size={38} />

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.jet,
                      ...fBody,
                    }}
                  >
                    {b.clientName}
                  </div>

                  <div
                    style={{
                      fontSize: 11.5,
                      color: C.slate,
                      ...fBody,
                    }}
                  >
                    {b.date} · {b.time}
                  </div>
                </div>
              </div>

              <StatusPill status="confirmed" />
            </Card>
          ))
        )}

        {/* Recent Reviews */}
        <div
          style={{
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <SectionLabel>Recent reviews</SectionLabel>
        </div>

        {REVIEWS.slice(0, 2).map((r) => (
          <Card
            key={r.id}
            style={{
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.jet,
                  ...fBody,
                }}
              >
                {r.name}
              </div>

              <StarRow value={r.rating} size={11} />
            </div>

            <p
              style={{
                fontSize: 12.5,
                color: C.slate,
                marginTop: 4,
                lineHeight: 1.5,
                ...fBody,
              }}
            >
              {r.text}
            </p>
          </Card>
        ))}
      </div>

      {/* Notifications Bottom Sheet */}
      <BottomSheet
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        heightPct={72}
      >
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              color: C.orange,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 10,
              padding: "2px 0",
              ...fBody,
            }}
          >
            <Check size={13} />
            Mark all as read
          </button>
        )}

        {notifications.map((n) => {
          const Icon = NOTIF_ICON[n.type] || Bell;

          return (
            <button
              key={n.id}
              onClick={() => openNotification(n)}
              style={{
                width: "100%",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "12px 4px",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${C.border}`,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background:
                    n.type === "verification"
                      ? C.warnTint
                      : C.orangeTint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color={C.orange} />
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.jet,
                      ...fBody,
                    }}
                  >
                    {n.title}
                  </span>

                  <span
                    style={{
                      fontSize: 10.5,
                      color: C.slateLight,
                      flexShrink: 0,
                      ...fBody,
                    }}
                  >
                    {n.time}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    color: C.slate,
                    marginTop: 3,
                    lineHeight: 1.45,
                    ...fBody,
                  }}
                >
                  {n.body}
                </div>
              </div>

              {n.unread && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: C.orange,
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
              )}
            </button>
          );
        })}
      </BottomSheet>
    </div>
  );
}