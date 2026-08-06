import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { SectionLabel, Card, Btn, TopBar, StepProgress } from "../../components/ui/Primitives";
import { ServicePackageForm, packageSummary, packageFormToRecord } from "../../components/ui/ServicePackageForm";

let svcIdCounter = 1;

export function ScreenCoachServicesSetup({ nav, toast, savePackage, removePackage }) {
  const [services, setServices] = useState([]);

  const addService = (pkg) => {
    const id = "svc" + svcIdCounter++;
    setServices((s) => [...s, { id, ...pkg }]);
    // Persist to the coach's real service list so it's immediately visible
    // on the dashboard and profile once setup is complete.
    if (savePackage) savePackage(packageFormToRecord(pkg, id));
    toast(services.length === 0 ? "Service added" : "Another service added");
  };
  const removeService = (id) => {
    setServices((s) => s.filter((x) => x.id !== id));
    if (removePackage) removePackage(id);
  };

  const canContinue = services.length > 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <TopBar title="Coaching services" onBack={() => nav("verification-pending")} />
        <StepProgress step={1} total={3} label="Services" />

        <div style={{ fontSize: 15, fontWeight: 600, color: C.jet, marginBottom: 6, ...fDisplay }}>
          Add coaching services
        </div>
        <div style={{ fontSize: 13, color: C.slate, marginBottom: 18, lineHeight: 1.5, ...fBody }}>
          Create the coaching services athletes can book. Define your session types, pricing, duration, and delivery method to showcase what you offer.
        </div>

        {services.map((s) => (
          <Card key={s.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.jet, ...fDisplay }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2, ...fBody }}>{packageSummary(s)}</div>
                {s.venue && (
                  <div style={{ fontSize: 11.5, color: C.slateLight, marginTop: 2, ...fBody }}>{s.venue}</div>
                )}
                {s.equipment && (
                  <div style={{ fontSize: 11.5, color: C.slateLight, marginTop: 2, ...fBody }}>Equipment: {s.equipment}</div>
                )}
                {s.description && (
                  <div style={{ fontSize: 11.5, color: C.slateLight, marginTop: 4, lineHeight: 1.5, ...fBody }}>{s.description}</div>
                )}
              </div>
              <button onClick={() => removeService(s.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0, marginLeft: 8 }}>
                <Trash2 size={15} color={C.slateLight} />
              </button>
            </div>
          </Card>
        ))}

        <Card style={{ marginBottom: 18 }}>
          <SectionLabel>{services.length > 0 ? "Add another service" : "Add a service"}</SectionLabel>
          <ServicePackageForm
            key={services.length}
            onSave={addService}
            saveLabel={services.length > 0 ? "Add Another Service" : "Add Service"}
          />
        </Card>

        <Btn full disabled={!canContinue} onClick={() => { toast("Coaching services saved"); nav("coach-availability-setup"); }}>
          Continue
        </Btn>
        {!canContinue && (
          <div style={{ fontSize: 11, color: C.slateLight, textAlign: "center", marginTop: 8, ...fBody }}>
            Add at least one coaching service to continue.
          </div>
        )}
      </div>
    </div>
  );
}
