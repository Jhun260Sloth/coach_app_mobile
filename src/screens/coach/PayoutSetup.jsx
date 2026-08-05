import React, { useState } from "react";
import { User, Landmark, Hash, FileText } from "lucide-react";
import { C, fDisplay, fBody } from "../../theme/theme";
import { TopBar, StepProgress, Btn } from "../../components/ui/Primitives";

const labelStyle = { fontSize: 12.5, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody };
const fieldWrapStyle = {
  display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`,
  borderRadius: 13, padding: "11px 13px", marginBottom: 16, boxSizing: "border-box",
};
const fieldInputStyle = { border: "none", outline: "none", flex: 1, fontSize: 14, minWidth: 0, ...fBody };

export function ScreenCoachPayoutSetup({ nav, toast }) {
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [taxInfo, setTaxInfo] = useState("");

  const canContinue = accountHolder.trim().length > 0 && bankName.trim().length > 0
    && accountNumber.trim().length > 0 && routingNumber.trim().length > 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px 0", flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <TopBar title="Payout setup" onBack={() => nav("coach-availability-setup")} />
        <StepProgress step={3} total={3} label="Payout" />

        <div style={{ fontSize: 15, fontWeight: 600, color: C.jet, marginBottom: 6, ...fDisplay }}>
          Payout Setup
        </div>
        <div style={{ fontSize: 13, color: C.slate, marginBottom: 18, lineHeight: 1.5, ...fBody }}>
          Add your bank account information to receive payments for completed coaching sessions.
        </div>

        <div style={labelStyle}>Account holder name</div>
        <div style={fieldWrapStyle}>
          <User size={16} color={C.slateLight} />
          <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="e.g. Josh Whitfield" style={fieldInputStyle} />
        </div>

        <div style={labelStyle}>Bank name</div>
        <div style={fieldWrapStyle}>
          <Landmark size={16} color={C.slateLight} />
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Commonwealth Bank" style={fieldInputStyle} />
        </div>

        <div style={labelStyle}>Account number</div>
        <div style={fieldWrapStyle}>
          <Hash size={16} color={C.slateLight} />
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 12345678" inputMode="numeric" style={fieldInputStyle} />
        </div>

        <div style={labelStyle}>BSB / Routing number</div>
        <div style={fieldWrapStyle}>
          <Hash size={16} color={C.slateLight} />
          <input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 062-000" inputMode="numeric" style={fieldInputStyle} />
        </div>

        <div style={labelStyle}>Tax information (if required)</div>
        <div style={{ ...fieldWrapStyle, marginBottom: 8 }}>
          <FileText size={16} color={C.slateLight} />
          <input value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} placeholder="e.g. ABN or Tax File Number" style={fieldInputStyle} />
        </div>
        <div style={{ fontSize: 11, color: C.slateLight, marginBottom: 22, ...fBody }}>
          Only required in some regions — leave blank if it doesn't apply to you.
        </div>

        <Btn full disabled={!canContinue} onClick={() => { toast("Payout details saved"); nav("coach-setup-complete"); }}>
          Complete Setup
        </Btn>
        {!canContinue && (
          <div style={{ fontSize: 11, color: C.slateLight, textAlign: "center", marginTop: 8, ...fBody }}>
            Add your account holder name, bank name, account number and BSB / routing number to finish.
          </div>
        )}
      </div>
    </div>
  );
}
