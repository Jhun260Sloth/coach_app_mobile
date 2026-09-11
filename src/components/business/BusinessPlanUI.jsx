import React from "react";
import { CheckCircle2 } from "lucide-react";
import { fBody, fDisplay, T } from "../../theme/theme";
import { Badge, Card } from "../ui/Primitives";

export function BusinessPlanCard({ plan, selected = false, current = false, actionLabel, onSelect, C }) {
  return (
    <Card
      onClick={current ? undefined : onSelect}
      ariaLabel={current ? `${plan.name}, current plan` : `Choose ${plan.name}`}
      style={{
        marginBottom: 12,
        padding: 16,
        border: `1.5px solid ${selected ? C.brand : C.border}`,
        background: selected ? C.brandTint : C.white,
        opacity: current ? 0.82 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
            <div style={{ fontSize: T.title, fontWeight: 700, color: C.jet, ...fDisplay }}>{plan.name}</div>
            {current ? <Badge tone="success">Current</Badge> : actionLabel ? <Badge tone="orange">{actionLabel}</Badge> : null}
          </div>
          <div style={{ marginTop: 3, fontSize: T.captionLg, color: C.slate, lineHeight: 1.45, ...fBody }}>{plan.description}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontSize: T.heading, fontWeight: 800, color: C.jet, ...fDisplay }}>${plan.monthlyPrice}</span>
          <span style={{ fontSize: T.caption, color: C.slate, ...fBody }}>/month</span>
        </div>
      </div>
      {plan.trialMonths ? <div style={{ display: "inline-flex", marginTop: 10, padding: "4px 8px", borderRadius: 999, background: C.successTint, color: C.success, fontSize: T.caption, fontWeight: 700, ...fBody }}>First month free</div> : null}
      <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
        {plan.features.map((feature) => <div key={feature} style={{ display: "flex", gap: 7, color: C.slate, fontSize: T.captionLg, lineHeight: 1.4, ...fBody }}><CheckCircle2 size={14} color={C.brand} style={{ flexShrink: 0 }} />{feature}</div>)}
      </div>
    </Card>
  );
}

export function BusinessPlanSummary({ plan, label = "Selected plan", detail, C }) {
  return (
    <Card style={{ padding: 16, background: C.brandTint }}>
      <div style={{ fontSize: T.caption, fontWeight: 700, color: C.brand, textTransform: "uppercase", ...fBody }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginTop: 6 }}>
        <div style={{ fontSize: T.heading, fontWeight: 700, color: C.jet, ...fDisplay }}>{plan.name}</div>
        <div style={{ flexShrink: 0 }}><strong style={{ fontSize: T.heading, color: C.jet, ...fDisplay }}>${plan.monthlyPrice}</strong><span style={{ fontSize: T.caption, color: C.slate, ...fBody }}>/month</span></div>
      </div>
      <div style={{ marginTop: 7, fontSize: T.captionLg, color: C.slate, lineHeight: 1.5, ...fBody }}>{detail || (plan.trialMonths ? "No charge today. Billing starts after your free month." : "Your subscription starts as soon as payment is confirmed.")}</div>
    </Card>
  );
}
