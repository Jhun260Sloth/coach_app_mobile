import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Volume2, VolumeX } from "lucide-react";
import { CL, fBody, fDisplay, T } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { COACHES } from "../../data/mockData";
import { getCoachMedia } from "../../data/media";
import { Avatar, BackButton, HandleTag } from "../../components/ui/Primitives";
import { getPublicName } from "../../utils/name";

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

/** Immersive, swipeable presentation of a coach's reels and session photos. */
export function ScreenCoachMedia({ nav, goBack, params = {} }) {
  const { coachMedia } = useApp();
  // Reels stay intentionally cinematic in either app theme, so their media
  // chrome uses the light palette's on-dark tokens rather than inverting.
  const C = CL;
  const coach = COACHES.find((item) => item.id === params.coachId) || COACHES[0];
  const media = useMemo(
    () => (coach.id === COACHES[1].id ? coachMedia : getCoachMedia(coach.id)),
    [coach.id, coachMedia],
  );
  const initialIndex = Math.max(0, media.findIndex((item) => item.id === params.mediaId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(true);
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
                  <Avatar name={pub.name} src={coach.avatar} size={42} ring />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: T.bodyLg, fontWeight: 700, ...oneLine, ...fDisplay }}>{pub.name}</span>
                    {pub.handle && <HandleTag handle={pub.handle} size={11} color={C.onDark} />}
                  </span>
                </button>
                <div style={{ fontSize: T.bodyLg, fontWeight: 600, lineHeight: 1.35, marginTop: 12, ...fBody }}>{item.caption}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: T.label, color: C.onDark, ...fBody }}><MapPin size={13} />{coach.suburb}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                {item.type === "reel" && <MediaAction C={C} label={muted ? "Turn sound on" : "Mute reel"} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</MediaAction>}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ position: "absolute", top: 52, left: 16 }}><BackButton floating onClick={() => goBack("coach-profile")} /></div>
      <div style={{ position: "absolute", top: 60, right: 18, color: C.white, fontSize: T.label, fontWeight: 700, ...fBody }}>{activeIndex + 1} / {media.length}</div>
    </div>
  );
}

function MediaAction({ C, label, onClick, children }) {
  return <button type="button" aria-label={label} onClick={onClick} style={{ width: 44, height: 44, padding: 0, border: `1px solid ${C.onDarkDivider}`, borderRadius: 999, background: C.jetSoft, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>{children}</button>;
}
