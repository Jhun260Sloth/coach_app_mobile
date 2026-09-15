import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Building2, ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { CL, CD, fDisplay, fBody, T, LAYOUT } from "../../theme/theme";
import { useApp } from "../../context/AppContext";
import { SportIcon } from "./SportUI";
import { haptic } from "../../utils/haptics";
import { FEATURED_BUSINESS_BANNERS } from "../../data/mockData";

const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

export function FeaturedBusinessCarousel({
  banners = FEATURED_BUSINESS_BANNERS,
  onSelectBusiness,
  onViewAll,
  showViewAll = true,
  title = "Featured clubs & academies",
  subtitle = "Accredited sports academies, squads & facilities",
  style,
}) {
  const { darkMode, businesses = [], businessPrograms = [], businessRoster = [] } = useApp();
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
      const cards = [...rail.querySelectorAll("button[data-business-slide]")];
      if (!cards.length) return;
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
    const cards = [...rail.querySelectorAll("button[data-business-slide]")];
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
      aria-label={title}
      style={{ width: "100%", marginBottom: 22, ...style }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
          <div style={{ color: C.jet, fontSize: T.title, fontWeight: 700, ...fDisplay }}>
            {title}
          </div>
          <div style={{ marginTop: 2, color: C.slate, fontSize: T.captionLg, ...oneLine, ...fBody }}>
            {subtitle}
          </div>
        </div>

        {showViewAll && onViewAll && (
          <button
            type="button"
            onClick={() => {
              haptic(8);
              onViewAll();
            }}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              padding: "4px 0",
              border: "none",
              background: "transparent",
              color: C.brand,
              fontSize: T.labelLg,
              fontWeight: 700,
              cursor: "pointer",
              ...fBody,
            }}
          >
            <span>View all</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
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
        {banners.map((item, index) => {
          // Cross-reference live data if available
          const liveBiz = businesses.find((b) => b.id === item.businessId);
          const liveProgramCount = liveBiz
            ? businessPrograms.filter((p) => p.businessId === liveBiz.id && p.status === "live").length
            : item.programCount;
          const liveCoachCount = liveBiz
            ? (businessRoster.filter((m) => m.businessId === liveBiz.id && m.status === "active").length || item.coachCount)
            : item.coachCount;
          const rating = liveBiz?.profile?.rating || item.rating;
          const reviewCount = liveBiz?.profile?.reviews || item.reviews;

          return (
            <button
              key={item.id || index}
              data-business-slide="true"
              type="button"
              aria-label={`${item.tradingName}, ${item.sport} ${item.badge}. Rating ${rating}. ${liveProgramCount} programs. Explore club.`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => {
                haptic(10);
                onSelectBusiness?.(item.businessId || item.id);
              }}
              style={{
                position: "relative",
                flex: "0 0 calc(100% - 38px)",
                minWidth: 0,
                aspectRatio: "16 / 9.6",
                minHeight: 180,
                padding: 0,
                overflow: "hidden",
                scrollSnapAlign: "start",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: LAYOUT.cardRadius,
                color: CL.white,
                cursor: "pointer",
                textAlign: "left",
                userSelect: "none",
                outline: "none",
                boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
              }}
            >
              {/* Background cover image */}
              <img
                src={item.image}
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
                  objectPosition: item.imagePosition || "center",
                }}
              />

              {/* Multi-gradient backdrop for optimal text contrast */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(180deg, rgba(8,10,14,0.72) 0%, rgba(8,10,14,0.18) 36%, rgba(8,10,14,0.76) 68%, rgba(8,10,14,0.96) 100%)`,
                }}
              />

              {/* Inner content container */}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "12px 13px",
                }}
              >
                {/* Top badges bar */}
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    {/* Sport pill */}
                    <span
                      style={{
                        minHeight: 22,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "0 8px",
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
                      <SportIcon sport={item.sport} size={10} color={CL.white} />
                      <span style={oneLine}>{item.sport}</span>
                    </span>

                    {/* Facility type badge */}
                    <span
                      style={{
                        minHeight: 22,
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "0 7px",
                        border: `1px solid color-mix(in srgb, ${CL.white} 26%, transparent)`,
                        borderRadius: LAYOUT.pillRadius,
                        background: `color-mix(in srgb, ${CL.black} 42%, transparent)`,
                        color: CL.white,
                        fontSize: T.micro,
                        fontWeight: 700,
                        ...fBody,
                      }}
                    >
                      <Building2 size={10} strokeWidth={2.4} aria-hidden="true" />
                      {item.badge}
                    </span>
                  </span>

                  {/* Verified business pill */}
                  <span
                    style={{
                      minHeight: 22,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0 8px",
                      border: "1px solid rgba(52, 211, 153, 0.45)",
                      borderRadius: LAYOUT.pillRadius,
                      background: "rgba(6, 78, 59, 0.55)",
                      color: "#A7F3D0",
                      fontSize: T.micro,
                      fontWeight: 700,
                      ...fBody,
                    }}
                  >
                    <ShieldCheck size={11} strokeWidth={2.5} color="#34D399" aria-hidden="true" />
                    Verified
                  </span>
                </span>

                {/* Bottom Club Identity & Action Row */}
                <span style={{ minWidth: 0, marginTop: "auto" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {/* Club Logo Badge */}
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: CL.white,
                        padding: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                        border: "1.5px solid rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={item.logo}
                        alt={item.tradingName}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                      />
                    </span>

                    {/* Name & Location */}
                    <span style={{ flex: 1, minWidth: 0 }}>
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
                        {item.tradingName}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 3,
                          color: "rgba(255,255,255,0.85)",
                          fontSize: T.captionLg,
                          fontWeight: 500,
                          ...oneLine,
                          ...fBody,
                        }}
                      >
                        <MapPin size={11} color={C.brandColor} aria-hidden="true" />
                        <span style={oneLine}>{item.location}</span>
                      </span>
                    </span>
                  </span>

                  {/* Stats & CTA Row */}
                  <span
                    style={{
                      minHeight: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      paddingTop: 8,
                      borderTop: "1px solid rgba(255,255,255,0.16)",
                    }}
                  >
                    {/* Social proof & stats */}
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.captionLg, color: "rgba(255,255,255,0.92)", ...fBody }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 800, color: CL.white }}>
                        <Star size={12} fill="#FBBF24" color="#FBBF24" aria-hidden="true" />
                        {rating}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.55)" }}>({reviewCount})</span>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
                      <span style={{ color: "rgba(255,255,255,0.85)" }}>
                        {liveCoachCount} coaches · {liveProgramCount} programs
                      </span>
                    </span>

                    {/* Action button */}
                    <span
                      style={{
                        minHeight: 28,
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        padding: "0 10px",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: 9,
                        background: "rgba(255,255,255,0.16)",
                        backdropFilter: "blur(6px)",
                        color: CL.white,
                        fontSize: T.captionLg,
                        fontWeight: 700,
                        ...fBody,
                      }}
                    >
                      Explore
                      <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div
          role="group"
          aria-label="Choose featured club slide"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 6,
          }}
        >
          {banners.map((banner, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={banner.id || index}
                type="button"
                aria-label={`Show ${banner.tradingName}`}
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
