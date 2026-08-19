import React, { useRef, useState } from "react";
import { UploadCloud, Play, Image as ImageIcon, Trash2, Film, Camera } from "lucide-react";
import { CL, CD, fDisplay, fBody, T } from "../../theme/theme";
import { COACHES, SPORTS } from "../../data/mockData";
import { TopBar, Btn, Chip, Field, BottomSheet, ConfirmDialog, EmptyState } from "../../components/ui/Primitives";
import { useApp } from "../../context/AppContext";

export function ScreenCoachReels({ nav, toast, coachMedia = [], addMedia, removeMedia }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const coach = COACHES[1];
  const fileInputRef = useRef(null);
  const [pendingUpload, setPendingUpload] = useState(null); // { url, type, caption, sport }
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* One tile in the reels & photos grid. Video tiles use the actual clip so
     the preview always matches what clients will watch. */
  function MediaTile({ item, onDelete, onOpen }) {
    const isReel = item.type === "reel";
    return (
      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          style={{
            width: "100%", aspectRatio: "4 / 5", borderRadius: 16, overflow: "hidden", position: "relative",
            background: C.fog, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open ${item.caption || (isReel ? "reel" : "photo")}`}
          onClick={onOpen}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen?.(); } }}
        >
          {item.url ? (
            isReel ? (
              <video src={item.url} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <img src={item.url} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isReel ? <Play size={14} color={C.white} fill={C.white} /> : <ImageIcon size={15} color={C.white} />}
            </div>
          )}
          {item.url && isReel && (
            <div style={{ position: "absolute", bottom: 8, left: 8, width: 28, height: 28, borderRadius: 99, background: C.jet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={11} color={C.white} fill={C.white} />
            </div>
          )}
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onDelete(); }}
            aria-label={`Remove ${item.caption || "media"}`}
            title="Remove media"
            style={{ position: "absolute", top: 6, right: 6, width: 34, height: 34, minWidth: 34, minHeight: 34, padding: 0, borderRadius: 99, background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 2px 6px rgba(22,24,29,.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Trash2 size={14} color={C.slate} />
          </button>
        </div>
        <div style={{ minHeight: 34, margin: "7px 2px 0" }}>
          <div style={{ fontSize: T.label, fontWeight: 600, color: C.jet, ...fBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.caption || (isReel ? "Untitled reel" : "Untitled photo")}</div>
        </div>
      </div>
    );
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const type = file.type.startsWith("video") ? "reel" : "photo";
    setPendingUpload({ url: URL.createObjectURL(file), type, caption: "", sport: coach.sport });
  };

  const confirmUpload = () => {
    addMedia(pendingUpload);
    toast(pendingUpload.type === "reel" ? "Reel uploaded" : "Photo uploaded");
    setPendingUpload(null);
  };

  const confirmDelete = (item) => {
    removeMedia(item.id);
    setDeleteTarget(null);
    toast(item.type === "reel" ? "Reel removed" : "Photo removed");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Reels & photos" onBack={() => nav("coach-profile-edit")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px" }} className="cl-hide-scrollbar">
        <div style={{ fontSize: T.labelLg, color: C.slate, marginBottom: 16, lineHeight: 1.5, ...fBody }}>
          Show athletes what a session with you looks like. Reels and photos appear on your public profile in the order you add them.
        </div>

        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={onFileChange} style={{ display: "none" }} />
        <Btn full icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>Upload reel or photo</Btn>

        <div style={{ marginTop: 20 }}>
          {coachMedia.length === 0 ? (
            <EmptyState icon={Film} title="Nothing uploaded yet" body="Add your first reel or photo so athletes can see your coaching style before they book." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 10, rowGap: 18 }}>
              {coachMedia.map((item) => (
                <MediaTile
                  key={item.id}
                  item={item}
                  onDelete={() => setDeleteTarget(item)}
                  onOpen={() => nav("coach-media", { coachId: coach.id, mediaId: item.id, manage: true })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -------------------- ADD DETAILS FOR NEW UPLOAD -------------------- */}
      <BottomSheet open={!!pendingUpload} onClose={() => setPendingUpload(null)} title={pendingUpload?.type === "reel" ? "Add reel" : "Add photo"} heightPct={78}>
        {pendingUpload && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 120, aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", background: C.fog }}>
                {pendingUpload.type === "reel" ? (
                  <video src={pendingUpload.url} muted loop autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <img src={pendingUpload.url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field
                label="Caption"
                placeholder={pendingUpload.type === "reel" ? "e.g. Match-day serve technique" : "e.g. Group session at Riverside courts"}
                icon={Camera}
                value={pendingUpload.caption}
                onChange={(e) => setPendingUpload((d) => ({ ...d, caption: e.target.value }))}
              />

              <div>
                <div style={{ fontSize: T.labelLg, fontWeight: 600, color: C.jet, marginBottom: 6, ...fBody }}>Sport</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SPORTS.map((s) => (
                    <Chip key={s} active={pendingUpload.sport === s} onClick={() => setPendingUpload((d) => ({ ...d, sport: s }))}>{s}</Chip>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <Btn full onClick={confirmUpload}>{pendingUpload.type === "reel" ? "Add reel to profile" : "Add photo to profile"}</Btn>
            </div>
          </>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => confirmDelete(deleteTarget)}
        title={`Remove this ${deleteTarget?.type === "reel" ? "reel" : "photo"}?`}
        description="It will be permanently removed from your public profile. This can't be undone."
        confirmLabel={`Remove ${deleteTarget?.type === "reel" ? "reel" : "photo"}`}
      />
    </div>
  );
}
