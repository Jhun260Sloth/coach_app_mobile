import React from "react";
import {
  Clock, DollarSign, Users, MapPin, Wrench, Tag, ShieldCheck, Star,
  XCircle, MessageCircle, CalendarDays, Bell, ChevronRight,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES } from "../../data/mockData";
import { CONFIG } from "../../config";
import { Avatar, Card, SectionLabel, Btn, TopBar, HandleTag, Badge } from "../../components/ui/Primitives";
import { SportBadge } from "../../components/ui/SportUI";
import { getPublicName } from "../../utils/name";
import { packageLocationLabel } from "../../components/ui/ServicePackageForm";
import { formatTimeRange12, formatFullDateFromDate } from "./Booking";

/**
 * Full package detail page — mirrors the fields a coach fills in on the
 * Create/Edit Package form (Coach UI), so a client sees exactly what the
 * coach set: type, sport, description, duration, price, max participants,
 * delivery mode/location and equipment. A "Continue" button below moves
 * the client into the booking flow (Who's attending → date & time…).
 */
export function ScreenPackageDetail({ nav, params }) {
  const { darkMode, coachProfile } = useApp();
  const C = darkMode ? CD : CL;
  const listedCoach = COACHES.find((c) => c.id === params.coachId) || COACHES[0];
  const coach = listedCoach.id === COACHES[1].id ? coachProfile : listedCoach;
  const pub = getPublicName(coach, "public");
  const pkg = coach.packages.find((p) => p.id === params.packageId) || coach.packages[0];
  const unavailable = pkg.active === false;

  const durationLabel = pkg.duration != null ? `${pkg.duration} min` : "-";
  const typeLabel = pkg.packageTypes && pkg.packageTypes.length ? pkg.packageTypes.join(" + ") : (pkg.type || pkg.packageType || "-");
  const locationLabel = pkg.locationType
    ? packageLocationLabel({ deliveryMode: pkg.locationType, venue: pkg.location, travelArea: pkg.location })
    : (pkg.venue || coach.venue || pkg.mode || "Venue to be confirmed");

  // If a date/time was picked before landing here (Packages tab, or the
  // date-led calendar flow), show the exact session time as a start–end
  // range rather than just the duration in the abstract.
  const presetDateObj = params.presetDate ? new Date(params.presetDate) : null;
  const selectedDateLabel = presetDateObj ? formatFullDateFromDate(presetDateObj) : null;
  const selectedTimeLabel = params.presetTime ? formatTimeRange12(params.presetTime, pkg.duration) : null;
  const hasSelectedSession = Boolean(selectedDateLabel && selectedTimeLabel);
  const changeSchedule = () => nav("coach-profile", {
    id: coach.id,
    tab: "packages",
    packageId: pkg.id,
    openSchedule: true,
    presetDate: params.presetDate,
    presetTime: params.presetTime,
  });

  const rows = [
    { icon: Tag, label: "Package type", value: typeLabel },
    { icon: Clock, label: "Duration", value: durationLabel },
    { icon: DollarSign, label: "Session price", value: `$${pkg.price}` },
    { icon: Users, label: "Participants", value: pkg.maxParticipants ? `Up to ${pkg.maxParticipants}` : "1 person" },
    { icon: MapPin, label: "Delivery mode", value: `${pkg.mode || pkg.locationType || "In-person"} · ${locationLabel}` },
  ];
  if (pkg.equipment) rows.push({ icon: Wrench, label: "Equipment", value: pkg.equipment });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      <TopBar title="Package details" onBack={() => nav("coach-profile", { id: coach.id, tab: "packages" })} />

      <div style={{ flex: 1, overflowY: "auto", padding: `16px ${LAYOUT.pagePadX}px 32px` }} className="cl-hide-scrollbar">
        {/* Coach summary card */}
        <Card
          onClick={() => nav("coach-profile", { id: coach.id })}
          style={{ marginBottom: 18, display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
        >
          <Avatar name={pub.name} src={coach.avatar} size={48} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{pub.name}</div>
              {coach.verified?.identity && <ShieldCheck size={14} color={C.brand} />}
            </div>
            <HandleTag handle={pub.handle} size={11} color={C.slateLight} />
            <div style={{ fontSize: T.captionLg, color: C.slate, marginTop: 2, display: "flex", alignItems: "center", gap: 4, ...fBody }}>
              <MapPin size={11} color={C.slateLight} />
              <span>{coach.suburb || coach.location}</span>
              {coach.rating && (
                <>
                  <span style={{ color: C.border }}>•</span>
                  <Star size={11} fill={C.brand} color={C.brand} />
                  <span style={{ fontWeight: 600, color: C.jet }}>{coach.rating}</span>
                </>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {(coach.sports || [coach.sport]).map((sport) => <SportBadge key={sport} sport={sport} compact />)}
            </div>
          </div>
          <ChevronRight size={18} color={C.slateLight} style={{ flexShrink: 0 }} />
        </Card>

        {/* Package Title & Price */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <SportBadge sport={pkg.sport || coach.sport} compact />
            {pkg.type && <Badge tone="neutral">{pkg.type}</Badge>}
          </div>
          <h1 style={{ margin: 0, fontSize: T.display, fontWeight: 800, color: C.jet, letterSpacing: "-0.3px", ...fDisplay }}>
            {pkg.name}
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: T.displayLg, fontWeight: 800, color: C.jet, ...fDisplay }}>
              ${pkg.price}
            </span>
            <span style={{ fontSize: T.body, color: C.slate, ...fBody }}>
              / session
            </span>
          </div>
        </div>

        {unavailable && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.fog, borderRadius: 14, padding: 13, marginBottom: 18 }}>
            <XCircle size={16} color={C.slateLight} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: T.labelLg, color: C.slate, fontWeight: 600, ...fBody }}>This package isn't currently accepting new bookings.</span>
          </div>
        )}

        {/* Selected session timestamp (if selected) */}
        {hasSelectedSession && (
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Your selected session</SectionLabel>
            <Card style={{ marginTop: 8, padding: 14, background: C.brandTint, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: C.white, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                  <CalendarDays size={20} color={C.brand} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{selectedDateLabel}</div>
                  <div style={{ marginTop: 2, fontSize: T.body, color: C.slate, fontWeight: 600, ...fBody }}>{selectedTimeLabel}</div>
                  <div style={{ marginTop: 2, fontSize: T.captionLg, color: C.slateLight, ...fBody }}>{durationLabel} session · {pkg.mode || pkg.locationType || "In-person"}</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Btn full size="sm" variant="secondary" icon={CalendarDays} onClick={changeSchedule} style={{ background: C.white }}>Change date & time</Btn>
              </div>
            </Card>
          </div>
        )}

        {/* Description */}
        {pkg.description && (
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Description</SectionLabel>
            <p style={{ margin: "6px 0 0", fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, ...fBody }}>{pkg.description}</p>
          </div>
        )}

        {/* Package info rows */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Package info</SectionLabel>
          <Card style={{ marginTop: 8, padding: "2px 14px" }}>
            {rows.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: C.brandTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <r.icon size={14} color={C.brand} />
                  </div>
                  <span style={{ fontSize: T.body, color: C.slate, ...fBody }}>{r.label}</span>
                </div>
                <span style={{ fontSize: T.body, fontWeight: 650, color: C.jet, textAlign: "right", ...fBody }}>{r.value}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Cancellation policy */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.fog, borderRadius: 14, padding: "12px 14px", marginBottom: 18 }}>
          <ShieldCheck size={16} color={C.brand} style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: T.label, fontWeight: 700, color: C.jet, ...fBody }}>Cancellation policy</div>
            <div style={{ fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, marginTop: 2, ...fBody }}>{CONFIG.cancellationPolicy}</div>
          </div>
        </div>

        {/* Question / Schedule actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Btn size="md" full variant="secondary" icon={MessageCircle} onClick={() => nav("package-inquiry", { coachId: coach.id, packageId: pkg.id })}>Ask a question</Btn>
          </div>
          {!hasSelectedSession && (
            <div style={{ flex: 1 }}>
              <Btn size="md" full variant="secondary" icon={CalendarDays} onClick={changeSchedule}>Choose a time</Btn>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ padding: `12px ${LAYOUT.pagePadX}px max(${LAYOUT.ctaPadBottom}px, env(safe-area-inset-bottom))`, borderTop: `1px solid ${C.border}`, background: C.white }}>
        {unavailable ? (
          <Btn
            full
            variant="secondary"
            icon={Bell}
            onClick={() => nav("package-waitlist", { coachId: coach.id, packageId: pkg.id })}
          >
            Join waitlist
          </Btn>
        ) : (
          <Btn
            full
            icon={hasSelectedSession ? Users : CalendarDays}
            onClick={hasSelectedSession
              ? () => nav("booking-participants", { coachId: coach.id, packageId: pkg.id, presetDate: params.presetDate, presetTime: params.presetTime })
              : changeSchedule}
          >
            {hasSelectedSession ? "Continue to attendees" : "Choose date & time"}
          </Btn>
        )}
      </div>
    </div>
  );
}
