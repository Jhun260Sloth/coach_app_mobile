import React, { useState } from "react";
import {
  WifiOff,
  Calendar,
  Star,
  Banknote,
  Bell,
  MessageCircle,
  Check,
  CornerUpLeft,
  Flag,
  Clock,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { REVIEWS, CONFIG } from "../../data/mockData";
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
  Toggle,
} from "../../components/ui/Primitives";
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

export function ScreenCoachDashboard({
  nav,
  coachBookings,
  respondBooking,
  coachNotifications = [],
  verified,
  toast,
  offline,
  coachAvailableNow,
  setCoachAvailableNow,
}) {
  const { darkMode, coachIdentity } = useApp();
  const C = darkMode ? CD : CL;
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
  const notifications = coachNotifications;

  const pendingRequests = coachBookings.filter((b) => b.status === BOOKING_STATUS.PENDING);
  const awaitingPayment = coachBookings.filter((b) => b.status === BOOKING_STATUS.AWAITING_PAYMENT);
  const pending = [...pendingRequests, ...awaitingPayment];
  const upcoming = coachBookings.filter((b) => [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETION_PENDING].includes(b.status));
  const completed = coachBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);

  const earningsThisWeek = upcoming.reduce((s, b) => s + b.price, 0);
  const grossPaid = completed.reduce((s, b) => s + b.price, 0);
  const commission = Math.round(grossPaid * CONFIG.commissionRate);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const ratingAvg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

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
              onClick={() => nav("coach-notifications")}
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
        {/* Availability Status */}
        <Card
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            background: coachAvailableNow ? C.white : C.dangerTint,
            border: `1.5px solid ${coachAvailableNow ? C.border : C.dangerBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: coachAvailableNow ? C.successTint : C.dangerTint,
              border: coachAvailableNow ? "none" : `1px solid ${C.dangerBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: coachAvailableNow ? C.success : C.danger }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, ...fBody }}>
                {coachAvailableNow ? "Available for bookings" : "Unavailable for bookings"}
              </div>
              <div style={{ fontSize: T.caption, color: coachAvailableNow ? C.slateLight : C.danger, ...fBody }}>
                {coachAvailableNow ? "Clients can see and book your services" : "Clients can't book you right now"}
              </div>
            </div>
          </div>
          <Toggle
            label="Available for bookings"
            on={coachAvailableNow}
            onClick={() => {
              const next = !coachAvailableNow;
              setCoachAvailableNow(next);
              toast?.(next ? "You're now available for bookings" : "You're now marked unavailable");
            }}
          />
        </Card>

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
            value={ratingAvg}
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
              minHeight: 44,
              padding: "0 4px",
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

        {pendingRequests.length === 0 && (
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
        {pendingRequests.slice(0, 2).map((b, i) => {
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
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    minWidth: 0,
                    fontSize: T.bodyLg,
                    fontWeight: 600,
                    color: C.jet,
                    ...fDisplay,
                  }}
                >
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cn.name}</span>
                  {cn.handle && <HandleTag handle={cn.handle} size={11} color={C.slateLight} />}
                </div>

                <div
                  style={{
                    fontSize: T.body,
                    fontWeight: 600,
                    color: C.brand,
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    ...fBody,
                  }}
                >
                  {b.service}
                </div>

                <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 3, ...fBody }}>
                  {b.date} · {b.time}
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

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 12,
                paddingTop: 10,
                borderTop: `1px solid ${C.border}`,
                alignItems: "center",
              }}
            >
              <Btn
                size="sm"
                variant="outline"
                disabled={!!respondingId}
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

              <Btn
                size="sm"
                loading={respondingId === b.id}
                loadingText="Accepting…"
                disabled={!!respondingId && respondingId !== b.id}
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
            </div>
          </Card>
          );
        })}
        </div>

        {awaitingPayment.length > 0 && (
          <>
            <div style={{ marginTop: 18, marginBottom: 10 }}><SectionLabel>Waiting for payment</SectionLabel></div>
            {awaitingPayment.slice(0, 2).map((b) => {
              const cn = clientNameFor(b);
              return (
                <Card key={b.id} onClick={() => nav("booking-awaiting-payment", { id: b.id })} style={{ marginBottom: 10, borderColor: C.strong }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={cn.name} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: T.body, fontWeight: 700, color: C.jet, ...fBody }}>{cn.name}</div>
                      <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, ...fBody }}>{b.service} · {b.date}</div>
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, padding: "9px 10px", borderRadius: 12, background: C.strongTint }}>
                    <Clock size={14} color={C.strong} />
                    <span style={{ flex: 1, fontSize: T.label, color: C.slate, ...fBody }}>Reserved until {b.paymentDeadline || "tomorrow, 6:00pm"}</span>
                  </div>
                </Card>
              );
            })}
          </>
        )}

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
              onClick={() => nav("coach-session-detail", { id: b.id })}
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

              <StatusPill status={b.status} />
            </Card>
            );
          })}
          </div>
        )}

        {/* Recent Reviews */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          <SectionLabel>Recent reviews</SectionLabel>

          <button
            onClick={() => nav("coach-reviews")}
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
                placeholder="Write a public reply…"
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
                  placeholder="Tell us what's going on…"
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

    </div>
  );
}
