import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Volume2, VolumeX, Trash2 } from "lucide-react";
import { CL, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES } from "../../data/mockData";
import { getCoachMedia } from "../../data/media";
import { Avatar, BackButton, HandleTag, ConfirmDialog } from "../../components/ui/Primitives";
import { getPublicName } from "../../utils/name";

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

/** Immersive, swipeable presentation of a coach's reels and session photos. */
export function ScreenCoachMedia({ nav, goBack, params = {} }) {
  const { coachMedia, coachProfile, removeMedia, toast } = useApp();
  // Reels stay intentionally cinematic in either app theme, so their media
  // chrome uses the light palette's on-dark tokens rather than inverting.
  const C = CL;
  const listedCoach = COACHES.find((item) => item.id === params.coachId) || COACHES[0];
  const coach = listedCoach.id === COACHES[1].id ? coachProfile : listedCoach;
  const isManaging = params.manage === true;
  const media = useMemo(
    () => (coach.id === COACHES[1].id ? coachMedia : getCoachMedia(coach.id)),
    [coach.id, coachMedia],
  );
  const initialIndex = Math.max(0, media.findIndex((item) => item.id === params.mediaId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const pub = getPublicName(coach, "public");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = scrollRef.current?.children[initialIndex];
      target?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialIndex]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (!video) return;
      if (Number(index) === activeIndex) video.play().catch(() => {});
      else video.pause();
    });
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(0, media.length - 1)));
  }, [media.length]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const remaining = media.filter((item) => item.id !== deleteTarget.id);
    removeMedia?.(deleteTarget.id);
    setDeleteTarget(null);
    toast?.(deleteTarget.type === "reel" ? "Reel removed" : "Photo removed");
    if (!remaining.length) {
      goBack("coach-profile-edit");
      return;
    }
    const nextIndex = Math.min(activeIndex, remaining.length - 1);
    setActiveIndex(nextIndex);
    requestAnimationFrame(() => scrollRef.current?.children[nextIndex]?.scrollIntoView({ block: "start" }));
  };

  const handleScroll = (event) => {
    const height = event.currentTarget.clientHeight;
    if (!height) return;
    setActiveIndex(Math.max(0, Math.min(media.length - 1, Math.round(event.currentTarget.scrollTop / height))));
  };

  if (!media.length) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.black, color: C.white, padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: T.heading, fontWeight: 700, ...fDisplay }}>No highlights yet</div>
          <button type="button" onClick={() => goBack("coach-profile")} style={{ minHeight: 44, marginTop: 14, border: "none", background: "transparent", color: C.white, cursor: "pointer", fontSize: T.bodyLg, fontWeight: 600, ...fBody }}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", position: "relative", background: C.black, overflow: "hidden" }}>
      <div ref={scrollRef} onScroll={handleScroll} className="cl-hide-scrollbar" style={{ height: "100%", overflowY: "auto", scrollSnapType: "y mandatory", overscrollBehaviorY: "contain" }}>
        {media.map((item, index) => (
          <article key={item.id} style={{ height: "100%", position: "relative", scrollSnapAlign: "start", scrollSnapStop: "always", background: C.black }}>
            {item.type === "reel" ? (
              <video ref={(element) => { videoRefs.current[index] = element; }} src={item.url} muted={muted} loop playsInline preload={index === activeIndex ? "auto" : "metadata"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <img src={item.url} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(0,0,0,.54) 0%, transparent 30%, transparent 54%, rgba(0,0,0,.78) 100%)" }} />

            <div style={{ position: "absolute", left: 18, right: 18, bottom: 30, display: "flex", alignItems: "flex-end", gap: 14, color: C.white }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <button type="button" onClick={() => nav("coach-profile", { id: coach.id })} style={{ padding: 0, border: "none", background: "transparent", color: C.white, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}>
                  <Avatar name={pub.name} src={coach.avatar} size={42} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: T.bodyLg, fontWeight: 700, ...oneLine, ...fDisplay }}>{pub.name}</span>
                    {pub.handle && <HandleTag handle={pub.handle} size={11} color={C.onDark} />}
                  </span>
                </button>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, lineHeight: 1.35, marginTop: 12, ...fBody }}>{item.caption}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: T.label, color: C.onDark, ...fBody }}><MapPin size={13} />{coach.suburb}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                {isManaging && <MediaAction C={C} destructive label={`Delete ${item.type === "reel" ? "reel" : "photo"}`} onClick={() => setDeleteTarget(item)}><Trash2 size={20} /></MediaAction>}
                {item.type === "reel" && <MediaAction C={C} label={muted ? "Turn sound on" : "Mute reel"} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</MediaAction>}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ position: "absolute", top: 52, left: 16 }}><BackButton floating onClick={() => goBack("coach-profile")} /></div>
      <div style={{ position: "absolute", top: 60, right: 18, color: C.white, fontSize: T.label, fontWeight: 700, ...fBody }}>{activeIndex + 1} / {media.length}</div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete this ${deleteTarget?.type === "reel" ? "reel" : "photo"}?`}
        description="It will be permanently removed from your public profile. This can't be undone."
        confirmLabel={`Delete ${deleteTarget?.type === "reel" ? "reel" : "photo"}`}
        icon={Trash2}
      />
    </div>
  );
}

function MediaAction({ C, label, onClick, destructive = false, children }) {
  return <button type="button" aria-label={label} onClick={onClick} style={{ width: 44, height: 44, padding: 0, border: `1px solid ${C.onDarkDivider}`, borderRadius: 999, background: C.jetSoft, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>{children}</button>;
}
