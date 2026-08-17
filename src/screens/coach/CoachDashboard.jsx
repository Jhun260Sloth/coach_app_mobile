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
  CornerUpLeft,
  Flag,
  Clock,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { REVIEWS, CONFIG, COACH_NOTIFICATIONS } from "../../data/mockData";
import {
  Avatar,
  Card,
  Btn,
  SectionLabel,
  StatusPill,
  StarRow,
  BottomSheet,
  Badge,
  HandleTag,
} from "../../components/ui/Primitives";
import { useLiveNotifications } from "../../systems/StateSystem";
import { useReviewActions, DISPUTE_REASONS } from "../../systems/ReviewsSystem";
import { useApp } from "../../context/AppContext";
import { getBookingClientName } from "../../utils/name";
import { withClientMeta } from "../../data/users";
import { BOOKING_STATUS } from "../../data/bookings";

/** Name the coach should see for a booking's client — privacy-safe until the
    booking is confirmed, full name afterwards (partner reveal). */
function clientNameFor(booking) {
  return getBookingClientName(withClientMeta(booking));
}

const NOTIF_ICON = {
  message: MessageCircle,
  verification: ShieldAlert,
  booking: Calendar,
  review: Star,
  promo: Percent,
};

export function ScreenCoachDashboard({
  nav,
  coachBookings,
  respondBooking,
  coachNotifications,
  verified,
  toast,
  offline,
}) {
  const { darkMode, coachIdentity } = useApp();
  const C = darkMode ? CD : CL;
  const [notifOpen, setNotifOpen] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const { getReply, getDispute, submitReply, submitDispute } = useReviewActions();
  const [replyTarget, setReplyTarget] = useState(null); // review being replied to
  const [replyText, setReplyText] = useState("");
  const [disputeTarget, setDisputeTarget] = useState(null); // review being disputed
  const [disputeReason, setDisputeReason] = useState(null);
  const [disputeDetail, setDisputeDetail] = useState("");

  const openReply = (r) => { setReplyText(getReply(r.id)?.text || ""); setReplyTarget(r); };
  const closeReply = () => { setReplyTarget(null); setReplyText(""); };
  const submitReplyAction = () => {
    if (!replyText.trim()) return;
    submitReply(replyTarget.id, replyText);
    toast?.("Reply posted");
    closeReply();
  };

  const openDispute = (r) => { setDisputeReason(null); setDisputeDetail(""); setDisputeTarget(r); };
  const closeDispute = () => { setDisputeTarget(null); setDisputeReason(null); setDisputeDetail(""); };
  const submitDisputeAction = () => {
    if (!disputeReason) return;
    submitDispute(disputeTarget.id, disputeReason, disputeDetail);
    toast?.("Dispute submitted to CoachLink Support");
    closeDispute();
  };
  // Merges real, in-app-generated notifications (bookings actioned, etc) on
  // top of the seed list — which already includes the verification-expiry
  // notice — so expiry warnings surface here instead of as a dashboard banner.
  const [notifications, setNotifications] = useLiveNotifications(coachNotifications, COACH_NOTIFICATIONS);

  const pending = coachBookings.filter((b) => [BOOKING_STATUS.PENDING, BOOKING_STATUS.AWAITING_PAYMENT].includes(b.status));
  const upcoming = coachBookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED);
  const completed = coachBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);

  const earningsThisWeek = upcoming.reduce((s, b) => s + b.price, 0);
  const grossPaid = completed.reduce((s, b) => s + b.price, 0);
  const commission = Math.round(grossPaid * CONFIG.commissionRate);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const respondWithFeedback = (id, status, message) => {
    // Guard against acting on a request that's no longer pending (already
    // handled from the full Bookings screen, for instance).
    const target = coachBookings.find((b) => b.id === id);
    if (!target || target.status !== BOOKING_STATUS.PENDING) {
      toast("This request has already been handled");
      return;
    }
    setRespondingId(id);

    setTimeout(() => {
      respondBooking(id, status);
      setRespondingId(null);
      toast(message);
    }, 600);
  };

  const markAllRead = () =>
    setNotifications((arr) =>
      arr.map((n) => ({
        ...n,
        unread: false,
      }))
    );

  function StatMini({ label, value, icon: Icon }) {
    return (
      <Card style={{ flex: 1, textAlign: "center", padding: "12px 6px" }}>
        <Icon size={15} color={C.brand} style={{ margin: "0 auto 6px" }} />
        <div
          style={{
            fontSize: T.title,
            fontWeight: 700,
            color: C.jet,
            ...fDisplay,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: T.tiny,
            color: C.slate,
            ...fBody,
          }}
        >
          {label}
        </div>
      </Card>
    );
  }

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
        handle: withClientMeta({ clientName: n.clientName }).clientHandle,
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
          padding: "18px 18px 0",
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
                fontSize: T.labelLg,
                color: C.slate,
                ...fBody,
              }}
            >
              Welcome back
            </div>

            <div
              style={{
                fontSize: T.display,
                fontWeight: 600,
                color: C.jet,
                ...fDisplay,
              }}
            >
              {(coachIdentity.name || "Coach").split(" ")[0]}'s dashboard
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
                      background: C.brand,
                      borderRadius: 99,
                      border: `1.5px solid ${C.white}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: T.micro,
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
              <Avatar name={coachIdentity.name} size={40} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", paddingBottom: 116 }} className="cl-hide-scrollbar">
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
              fontSize: T.label,
              ...fBody,
            }}
          >
            <WifiOff size={14} color={C.brand} />
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
                fontSize: T.caption,
                color: C.onDarkMuted,
                ...fBody,
              }}
            >
              This week's earnings
            </div>

            <div
              style={{
                fontSize: T.hero,
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
              background: C.brandTint,
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: T.caption,
                color: C.brand,
                fontWeight: 600,
                ...fBody,
              }}
            >
              Pending requests
            </div>

            <div
              style={{
                fontSize: T.hero,
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
              color: C.brand,
              fontSize: T.label,
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
              fontSize: T.labelLg,
              color: C.slateLight,
              marginBottom: 6,
              ...fBody,
            }}
          >
            No active booking requests right now.
          </div>
        )}

        <div className="cl-stagger">
        {pending.map((b, i) => {
          const cn = clientNameFor(b);
          return (
          <Card
            key={b.id}
            style={{
              marginBottom: 10,
              animationDelay: `${Math.min(i, 8) * 45}ms`,
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
              <Avatar name={cn.name} size={40} />

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: T.bodyLg,
                    fontWeight: 600,
                    color: C.jet,
                    ...fDisplay,
                  }}
                >
                  {cn.name}
                  {cn.handle && <HandleTag handle={cn.handle} size={11} color={C.slateLight} />}
                </div>

                <div
                  style={{
                    fontSize: T.label,
                    color: C.slate,
                    ...fBody,
                  }}
                >
                  {b.service} · {b.date}, {b.time}
                </div>
              </div>

              <div
                style={{
                  fontSize: T.subtitle,
                  fontWeight: 700,
                  color: C.jet,
                  ...fDisplay,
                }}
              >
                ${b.price}
              </div>
            </div>

            {b.status === BOOKING_STATUS.PENDING ? <div
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
                    BOOKING_STATUS.AWAITING_PAYMENT,
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
                    BOOKING_STATUS.DECLINED,
                    "Booking declined"
                  );
                }}
              >
                Decline
              </Btn>
            </div> : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "9px 10px", borderRadius: 12, background: C.brandTint }}>
                <Clock size={14} color={C.brand} />
                <span style={{ flex: 1, fontSize: T.label, color: C.slate, ...fBody }}>Accepted — waiting for the client to pay.</span>
                <StatusPill status={b.status} />
              </div>
            )}
          </Card>
          );
        })}
        </div>

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
              fontSize: T.labelLg,
              color: C.slateLight,
              ...fBody,
            }}
          >
            Nothing scheduled yet.
          </div>
        ) : (
          <div className="cl-stagger">
          {upcoming.map((b, i) => {
            const cn = clientNameFor(b);
            return (
            <Card
              key={b.id}
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                animationDelay: `${Math.min(i, 8) * 45}ms`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar name={cn.name} size={38} />

                <div>
                  <div
                    style={{
                      fontSize: T.body,
                      fontWeight: 600,
                      color: C.jet,
                      ...fBody,
                    }}
                  >
                    {cn.name}
                    {cn.handle && <HandleTag handle={cn.handle} size={10.5} color={C.slateLight} />}
                  </div>

                  <div
                    style={{
                      fontSize: T.captionLg,
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
            );
          })}
          </div>
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

        {REVIEWS.slice(0, 2).map((r) => {
          const reply = getReply(r.id);
          const dispute = getDispute(r.id);
          return (
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
                    fontSize: T.body,
                    fontWeight: 600,
                    color: C.jet,
                    ...fBody,
                  }}
                >
                  {r.name}
                  {r.handle && <HandleTag handle={r.handle} size={10.5} color={C.slateLight} />}
                </div>

                <StarRow value={r.rating} size={11} />
              </div>

              <p
                style={{
                  fontSize: T.labelLg,
                  color: C.slate,
                  marginTop: 4,
                  lineHeight: 1.5,
                  ...fBody,
                }}
              >
                {r.text}
              </p>

              {dispute && (
                <div style={{ marginTop: 8 }}>
                  <Badge tone="orange" icon={Clock}>Dispute pending review</Badge>
                </div>
              )}

              {reply && (
                <div style={{ marginTop: 10, background: C.fog, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: T.caption, fontWeight: 700, color: C.brand, ...fBody }}>Your reply</div>
                  <p style={{ fontSize: T.labelLg, color: C.jet, marginTop: 3, lineHeight: 1.5, ...fBody }}>{reply.text}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Btn size="sm" variant="secondary" icon={CornerUpLeft} onClick={() => openReply(r)}>
                  {reply ? "Edit reply" : "Reply to review"}
                </Btn>
                {!dispute && (
                  <Btn size="sm" variant="outline" icon={Flag} onClick={() => openDispute(r)}>
                    Report
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Reply to Review Sheet */}
      <BottomSheet open={!!replyTarget} onClose={closeReply} title="Reply to review" heightPct={52}>
        {replyTarget && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <div style={{ background: C.fog, borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, ...fBody }}>{replyTarget.name}</span>
                  <StarRow value={replyTarget.rating} size={11} />
                </div>
                <p style={{ fontSize: T.labelLg, color: C.slate, marginTop: 4, lineHeight: 1.5, ...fBody }}>{replyTarget.text}</p>
              </div>
              <div style={{ fontSize: T.label, color: C.slate, marginBottom: 8, ...fBody }}>
                Your reply is public and will appear underneath this review on your profile.
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a public reply..."
                rows={4}
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box", background: C.white,
                  border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
                  fontSize: T.bodyLg, color: C.jet, outline: "none", resize: "none", ...fBody,
                }}
              />
            </div>
            <div style={{ padding: "14px 0 4px" }}>
              <Btn full onClick={submitReplyAction} style={!replyText.trim() ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
                Post reply
              </Btn>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Report / Dispute Review Sheet */}
      <BottomSheet open={!!disputeTarget} onClose={closeDispute} title="Report this review"
        heightPct={disputeReason === "Something else" ? 76 : 64}>
        {disputeTarget && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: T.body, color: C.slate, marginBottom: 14, ...fBody }}>
                Tell us why this review seems unfair or made in bad faith. CoachLink Support will review it.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DISPUTE_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setDisputeReason(reason)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      border: `1.5px solid ${disputeReason === reason ? C.brand : C.border}`,
                      background: disputeReason === reason ? C.brandTint : C.white,
                    }}
                  >
                    <span style={{ fontSize: T.body, color: C.jet, ...fBody }}>{reason}</span>
                    {disputeReason === reason && <Check size={16} color={C.brand} />}
                  </button>
                ))}
              </div>
              {disputeReason === "Something else" && (
                <textarea
                  value={disputeDetail}
                  onChange={(e) => setDisputeDetail(e.target.value)}
                  placeholder="Tell us what's going on..."
                  rows={4}
                  autoFocus
                  style={{
                    width: "100%", boxSizing: "border-box", background: C.white, marginTop: 14,
                    border: `1.5px solid ${C.border}`, borderRadius: 13, padding: "11px 13px",
                    fontSize: T.bodyLg, color: C.jet, outline: "none", resize: "none", ...fBody,
                  }}
                />
              )}
            </div>
            <div style={{ padding: "14px 0 4px" }}>
              <Btn full onClick={submitDisputeAction} style={!disputeReason ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
                Submit dispute
              </Btn>
            </div>
          </div>
        )}
      </BottomSheet>

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
              color: C.brand,
              fontSize: T.labelLg,
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
                      : C.brandTint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color={C.brand} />
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
                      fontSize: T.body,
                      fontWeight: 600,
                      color: C.jet,
                      ...fBody,
                    }}
                  >
                    {n.title}
                  </span>

                  <span
                    style={{
                      fontSize: T.tiny,
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
                    fontSize: T.labelLg,
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
                    background: C.brand,
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
