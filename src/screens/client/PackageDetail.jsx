import React from "react";
import {
  Clock, DollarSign, Users, MapPin, Wrench, Tag, Info, XCircle, MessageCircle, CalendarDays, Bell,
} from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES } from "../../data/mockData";
import { CONFIG } from "../../config";
import { Avatar, Card, SectionLabel, Btn, TopBar, HandleTag } from "../../components/ui/Primitives";
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

  const durationLabel = pkg.duration != null ? `${pkg.duration} min` : "—";
  const typeLabel = pkg.packageTypes && pkg.packageTypes.length ? pkg.packageTypes.join(" + ") : (pkg.type || pkg.packageType || "—");
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
    { icon: DollarSign, label: "Price", value: `$${pkg.price} per session` },
    { icon: Users, label: "Max participants", value: pkg.maxParticipants ? `Up to ${pkg.maxParticipants}` : "1" },
    { icon: MapPin, label: "Mode & location", value: `${pkg.mode || pkg.locationType || "In-person"} · ${locationLabel}` },
  ];
  if (pkg.equipment) rows.push({ icon: Wrench, label: "Equipment", value: pkg.equipment });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Package details" onBack={() => nav("coach-profile", { id: coach.id, tab: "packages" })} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px" }} className="cl-hide-scrollbar">
        <Card style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center", border: `1px solid ${C.border}` }}>
          <Avatar name={pub.name} src={coach.avatar} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: T.subtitleLg, fontWeight: 700, color: C.jet, ...fDisplay }}>{pub.name}</div>
            <HandleTag handle={pub.handle} size={11} color={C.slateLight} />
            <div style={{ fontSize: T.label, color: C.slate, marginTop: 4, ...fBody }}>{coach.suburb}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {(coach.sports || [coach.sport]).map((sport) => <SportBadge key={sport} sport={sport} compact />)}
            </div>
          </div>
        </Card>

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: T.heading, fontWeight: 700, color: C.jet, ...fDisplay }}>{pkg.name}</div>
          <div style={{ marginTop: 8 }}><SportBadge sport={pkg.sport || coach.sport} compact /></div>
          <div style={{ fontSize: T.headingLg, fontWeight: 800, color: C.jet, marginTop: 4, ...fDisplay }}>${pkg.price}</div>
        </div>

        {unavailable && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginTop: 12 }}>
            <XCircle size={15} color={C.slateLight} />
            <span style={{ fontSize: T.labelLg, color: C.slate, fontWeight: 600, ...fBody }}>This package isn't currently accepting new bookings.</span>
          </div>
        )}

        {hasSelectedSession && (
          <div style={{ marginTop: 16 }}>
            <SectionLabel>Your selected session</SectionLabel>
            <Card style={{ marginTop: 8, padding: 14, background: C.brandTint, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: C.white, border: `1px solid ${C.border}` }}>
                  <CalendarDays size={19} color={C.brand} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.subtitle, fontWeight: 700, color: C.jet, ...fDisplay }}>{selectedDateLabel}</div>
                  <div style={{ marginTop: 3, fontSize: T.body, color: C.slate, ...fBody }}>{selectedTimeLabel}</div>
                  <div style={{ marginTop: 3, fontSize: T.caption, color: C.slateLight, ...fBody }}>{durationLabel} session · {pkg.mode || pkg.locationType || "In-person"}</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Btn full size="sm" variant="outline" icon={CalendarDays} onClick={changeSchedule} style={{ background: C.white }}>Change date & time</Btn>
              </div>
            </Card>
          </div>
        )}

        {pkg.description && (
          <div style={{ marginTop: 16 }}>
            <SectionLabel>Description</SectionLabel>
            <p style={{ fontSize: T.bodyLg, color: C.slate, lineHeight: 1.6, ...fBody }}>{pkg.description}</p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <SectionLabel>Package info</SectionLabel>
          <Card>
            {rows.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}` }}>
                <r.icon size={15} color={C.brand} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: T.caption, color: C.slateLight, ...fBody }}>{r.label}</div>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: C.jet, marginTop: 1, ...fBody }}>{r.value}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.fog, borderRadius: 12, padding: 12, marginTop: 16 }}>
          <Info size={14} color={C.slate} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: T.label, color: C.slate, lineHeight: 1.5, ...fBody }}>Cancellation policy: {CONFIG.cancellationPolicy}</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <Btn size="sm" full variant="outline" icon={MessageCircle} onClick={() => nav("package-inquiry", { coachId: coach.id, packageId: pkg.id })}>Ask a question</Btn>
          </div>
          {!hasSelectedSession ? (
            <div style={{ flex: 1 }}>
              <Btn size="sm" full variant="outline" icon={CalendarDays} onClick={changeSchedule}>Choose a time</Btn>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "14px 18px", paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}>
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
