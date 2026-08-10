import React from "react";
import { Trash2 } from "lucide-react";
import { C, fBody, T } from "../../theme/theme";
import { TopBar } from "../../components/ui/Primitives";
import { ServicePackageForm, recordToPackageForm, packageFormToRecord } from "../../components/ui/ServicePackageForm";

/**
 * Dedicated Create Package flow. Also handles editing an existing package
 * when navigated to with params.id — the form is seeded from the matching
 * record and saves overwrite it in place.
 */
export function ScreenCoachPackageForm({ nav, params, toast, coachPackages, savePackage, removePackage }) {
  const editing = params?.id ? coachPackages.find((p) => p.id === params.id) : null;
  const initial = editing ? recordToPackageForm(editing) : undefined;

  const handleSave = (pkg) => {
    savePackage(packageFormToRecord(pkg, editing?.id));
    toast(editing ? "Package updated" : "Package created");
    nav("coach-profile-edit");
  };

  const handleDelete = () => {
    removePackage(editing.id);
    toast("Package removed");
    nav("coach-profile-edit");
  };

  return (
    <div style={{ padding: "20px 20px 0", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar
        title={editing ? "Edit package" : "Create package"}
        onBack={() => nav("coach-profile-edit")}
        right={editing ? (
          <button onClick={handleDelete} aria-label="Delete package" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <Trash2 size={17} color={C.slateLight} />
          </button>
        ) : null}
      />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 30 }}>
        <div style={{ fontSize: T.label, color: C.slate, marginBottom: 16, lineHeight: 1.5, ...fBody }}>
          Package name, price, duration, location and description are all shown to clients when they browse and book.
        </div>
        <ServicePackageForm
          initial={initial}
          onSave={handleSave}
          onCancel={() => nav("coach-profile-edit")}
          saveLabel={editing ? "Save changes" : "Create package"}
        />
      </div>
    </div>
  );
}
