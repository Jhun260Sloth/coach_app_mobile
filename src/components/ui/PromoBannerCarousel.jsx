import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { SportIcon } from "./SportUI";
import { haptic } from "../../utils/haptics";

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export function PromoBannerCarousel({ banners = [], onSelectBanner, style }) {
  const { darkMode } = useApp();
  const C = darkMode ? CD : CL;
  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef(null);
  const scrollTimerRef = useRef(null);

  useEffect(() => () => {
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
  }, []);

  const handleScroll = () => {
    if (!railRef.current) return;
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);

    scrollTimerRef.current = window.setTimeout(() => {
      const rail = railRef.current;
      if (!rail) return;
      const cards = [...rail.querySelectorAll("button[data-package-slide]")];
      const firstOffset = cards[0]?.offsetLeft || 0;
      const nextIndex = cards.reduce((closest, card, index) => {
        const distance = Math.abs((card.offsetLeft - firstOffset) - rail.scrollLeft);
        return distance < closest.distance ? { index, distance } : closest;
      }, { index: 0, distance: Infinity }).index;
      setActiveIndex(nextIndex);
    }, 70);
  };

  const goToSlide = (index) => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = [...rail.querySelectorAll("button[data-package-slide]")];
    const card = cards[index];
    if (!card) return;
    haptic(8);
    setActiveIndex(index);
    rail.scrollTo({
      left: card.offsetLeft - (cards[0]?.offsetLeft || 0),
      behavior: "smooth",
    });
  };

  if (!banners.length) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Popular coaching packages"
      style={{ width: "100%", marginBottom: 22, ...style }}
    >
      <div style={{ minWidth: 0, marginBottom: 12 }}>
        <div style={{ color: C.jet, fontSize: T.title, fontWeight: 700, ...fDisplay }}>
          Popular coaching packages
        </div>
        <div style={{ marginTop: 2, color: C.slate, fontSize: T.captionLg, ...fBody }}>
          Group formats with more value per session
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={handleScroll}
        className="cl-hide-scrollbar cl-swipe-row"
        style={{
          display: "flex",
          gap: 12,
          margin: "0 -18px",
          padding: "2px 18px 4px",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollPaddingInline: 18,
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {banners.map((banner, index) => (
          <button
            key={banner.id || index}
            data-package-slide="true"
            type="button"
            aria-label={`${banner.title}. ${banner.packageMeta}. ${banner.priceTag}. View package.`}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => {
              haptic(10);
              onSelectBanner?.(banner);
            }}
            style={{
              position: "relative",
              flex: "0 0 calc(100% - 40px)",
              minWidth: 0,
              aspectRatio: "16 / 9",
              minHeight: LAYOUT.touchTarget,
              padding: 0,
              overflow: "hidden",
              scrollSnapAlign: "start",
              border: `0px`,
              borderRadius: LAYOUT.cardRadius,
              color: CL.white,
              cursor: "pointer",
              textAlign: "left",
              userSelect: "none",
              outline: "none",
            }}
          >
            <img
              src={banner.image}
              alt=""
              aria-hidden="true"
              draggable="false"
              loading={index === 0 ? "eager" : "lazy"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: banner.imagePosition || "center",
              }}
            />

            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to top, color-mix(in srgb, ${CL.black} 92%, transparent) 0%, color-mix(in srgb, ${CL.black} 64%, transparent) 43%, color-mix(in srgb, ${CL.black} 8%, transparent) 76%)`,
              }}
            />

            <span
              style={{
                position: "relative",
                zIndex: 1,
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                padding: 12,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span
                  style={{
                    minHeight: 22,
                    minWidth: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "0 7px",
                    borderRadius: LAYOUT.pillRadius,
                    background: `color-mix(in srgb, ${C.brandColor} 90%, ${CL.black})`,
                    color: CL.white,
                    fontSize: T.micro,
                    fontWeight: 800,
                    letterSpacing: ".35px",
                    textTransform: "uppercase",
                    ...fBody,
                  }}
                >
                  <SportIcon sport={banner.sport} size={10} color={CL.white} />
                  <span style={oneLine}>{banner.sport}</span>
                </span>

                <span
                  style={{
                    minHeight: 22,
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "0 7px",
                    border: `1px solid color-mix(in srgb, ${CL.white} 28%, transparent)`,
                    borderRadius: LAYOUT.pillRadius,
                    background: `color-mix(in srgb, ${CL.black} 42%, transparent)`,
                    color: CL.white,
                    fontSize: T.micro,
                    fontWeight: 700,
                    ...fBody,
                  }}
                >
                  <Layers3 size={10} strokeWidth={2.4} aria-hidden="true" />
                  {banner.badge}
                </span>
              </span>

              <span style={{ marginTop: "auto", minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    color: CL.white,
                    fontSize: T.titleLg,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: "-.2px",
                    ...oneLine,
                    ...fDisplay,
                  }}
                >
                  {banner.title}
                </span>

                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: CL.onDark,
                    fontSize: T.captionLg,
                    fontWeight: 500,
                    ...oneLine,
                    ...fBody,
                  }}
                >
                  {banner.packageMeta}
                </span>

                <span style={{ minHeight: 34, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ minWidth: 0, color: CL.white, fontSize: T.labelLg, fontWeight: 800, ...oneLine, ...fDisplay }}>
                    {banner.priceTag}
                  </span>
                  <span
                    style={{
                      minHeight: 30,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "0 9px",
                      border: `1px solid color-mix(in srgb, ${CL.white} 24%, transparent)`,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${CL.white} 14%, transparent)`,
                      color: CL.white,
                      fontSize: T.captionLg,
                      fontWeight: 700,
                      ...fBody,
                    }}
                  >
                    View
                    <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {banners.length > 1 && (
        <div
          role="group"
          aria-label="Choose coaching package"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 4,
          }}
        >
          {banners.map((banner, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={banner.id || index}
                type="button"
                aria-label={`Show ${banner.title}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => goToSlide(index)}
                style={{
                  minWidth: 0,
                  minHeight: 0,
                  width: "auto",
                  height: "auto",
                  padding: "4px 2px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  borderRadius: LAYOUT.pillRadius,
                  background: "transparent",
                  cursor: "pointer",
                  transform: "none",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: isActive ? 18 : 5,
                    height: 5,
                    borderRadius: LAYOUT.pillRadius,
                    background: isActive ? C.brand : C.border,
                    boxShadow: "none",
                    transition: "width .24s cubic-bezier(.22,1,.36,1), background .2s ease",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
