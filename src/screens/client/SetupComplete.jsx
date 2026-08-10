import React from "react";
import { PartyPopper } from "lucide-react";
import { C, fDisplay, fBody, T } from "../../theme/theme";
import { Btn } from "../../components/ui/Primitives";

/**
 * Shown at the very end of the client onboarding journey (after the "About
 * you" / participant steps), mirroring ScreenCoachSetupComplete on the coach
 * side. Gives a clear "you're done" moment before dropping the client into
 * the Discover tab.
 */
export function ScreenClientSetupComplete({ nav, params }) {
  const name = params?.name ? params.name.split(" ")[0] : "";

  return (
    <div style={{ padding: "28px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginTop: 48 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, background: C.orangeTint,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
        }}>
          <PartyPopper size={32} color={C.orange} />
        </div>
        <div style={{ fontSize: T.display, fontWeight: 600, color: C.jet, ...fDisplay }}>You're All Set{name ? `, ${name}` : ""}!</div>
        <div style={{ fontSize: T.bodyLg, color: C.slate, marginTop: 10, lineHeight: 1.6, maxWidth: 300, marginLeft: "auto", marginRight: "auto", ...fBody }}>
          Your profile is complete and you're ready to start booking. Discover coaches near you, book sessions, and manage everything from your dashboard.
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "14px 0" }}>
        <Btn full onClick={() => nav("client-home")}>Start exploring</Btn>
      </div>
    </div>
  );
}
