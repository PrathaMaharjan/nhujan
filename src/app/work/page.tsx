"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import Link from "next/link";

interface WorkCategory {
  id: string;
  partLabel: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  number: string;
  label: string;
}

const WORK_CATEGORIES: WorkCategory[] = [
  {
    id: "documentary",
    partLabel: "DOCUMENTARY : PART 1",
    title: "The Frontline Chronicles",
    slug: "/work/documentary",
    description: "Deep-dive documentary storytelling paying tribute to human perseverance, environmental bravery, and high-seas activism.",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop",
    number: "001",
    label: "DOCUMENTARY",
  },
  {
    id: "guided-tour",
    partLabel: "EXPEDITION : PART 2",
    title: "The Arctic Sunrise Fleet",
    slug: "/work/guided-tour",
    description: "Step aboard Greenpeace's boats. Follow the guides: the Arctic Sunrise and the Rainbow Warrior tell the fleet's stories, large and small.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop",
    number: "002",
    label: "GUIDED TOUR",
  },
  {
    id: "ships-log",
    partLabel: "ARCHIVE : PART 3",
    title: "The Ship's Log entries",
    slug: "/work/ships-log",
    description: "Chronological entries and navigational insights recorded from high-seas expeditions across remote polar channels.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop",
    number: "003",
    label: "SHIP'S LOG",
  },
  {
    id: "rainbow-warrior",
    partLabel: "BONUS : PART 4",
    title: "The Rainbow Warrior attack",
    slug: "/work/rainbow-warrior",
    description: "The film marking the 30th anniversary of the Rainbow Warrior attack. Paying tribute to the bravery of men and women who are committed to the planet.",
    image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=2000&auto=format&fit=crop",
    number: "004",
    label: "ATTACK",
  },
  {
    id: "bottle-notes",
    partLabel: "DISPATCH : PART 5",
    title: "The Bottle Notes story",
    slug: "/work/bottle-notes",
    description: "Archived stories, field notes, and messages gathered across remote coastal waters and oceanic research stations.",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop",
    number: "005",
    label: "BOTTLE",
  },
  {
    id: "polar-expedition",
    partLabel: "MISSION : PART 6",
    title: "The Polar Ice campaign",
    slug: "/work/arctic-mission",
    description: "Documenting ice-breaker journeys and frontline scientific research in extreme, sub-zero oceanic environments.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000&auto=format&fit=crop",
    number: "006",
    label: "EXPEDITION",
  },
  {
    id: "ocean-patrol",
    partLabel: "ACTION : PART 7",
    title: "The Ocean Patrol defense",
    slug: "/work/ocean-patrol",
    description: "Direct action campaigns defending vulnerable marine reserves and fragile ecosystems from industrial threats.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop",
    number: "007",
    label: "PATROL",
  },
];

export default function WorkReelSection() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dragStartY = useRef(0);
  const startAngle = useRef(0);
  const totalItems = WORK_CATEGORIES.length;
  const stepAngle = 360 / totalItems;
  const uid = useId().replace(/:/g, "");

  // Calculate active index based on rotation angle (index 3 "004 ATTACK" defaults as active)
  const activeIdx =
    (Math.round(-rotationAngle / stepAngle) % totalItems + totalItems) %
    totalItems;

  const activeCategory = WORK_CATEGORIES[activeIdx];

  // Rotate to specific category on click
  const selectIndex = (index: number) => {
    let diff = index - activeIdx;
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;

    setRotationAngle((prev) => prev - diff * stepAngle);
  };

  // Wheel handling: scrolling down advances to the next slide
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -stepAngle : stepAngle;
      setRotationAngle((prev) => Math.round((prev + delta) / stepAngle) * stepAngle);
    },
    [stepAngle]
  );

  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reelNode = reelRef.current;
    if (!reelNode) return;

    reelNode.addEventListener("wheel", handleWheel, { passive: false });
    return () => reelNode.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setRotationAngle((prev) => Math.round(prev / stepAngle) * stepAngle - stepAngle);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setRotationAngle((prev) => Math.round(prev / stepAngle) * stepAngle + stepAngle);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stepAngle]);

  // Drag interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    startAngle.current = rotationAngle;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    setRotationAngle(startAngle.current + deltaY * 0.35);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setRotationAngle((prev) => Math.round(prev / stepAngle) * stepAngle);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const PERF_COUNT = 40;

  return (
    <section className="relative w-full h-screen bg-[#070708] text-white overflow-hidden select-none flex items-center">
      {/* Background slide projection glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft atmospheric blurred projection from active frame */}
        <div
          className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[50vw] h-[60vh] bg-cover bg-center opacity-[0.16] blur-3xl scale-125 transition-all duration-1000"
          style={{ backgroundImage: `url('${activeCategory.image}')` }}
        />
        {/* Projected cone light gradient from the reel slide aperture to the copy */}
        <div className="absolute right-[35%] top-1/2 -translate-y-1/2 w-[55vw] h-[65vh] bg-[radial-gradient(ellipse_at_right,rgba(40,90,100,0.18),rgba(15,20,25,0.06)_50%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-[#070708]/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.02),transparent_70%)]" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full h-full max-w-[1700px] mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* Left Side: Headline & Project Metadata (matching reference image) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center gap-6 z-20 max-w-lg">
          <p className="font-mono text-xs sm:text-sm tracking-[0.3em] text-zinc-400 uppercase transition-all duration-500">
            {activeCategory.partLabel}
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-sans font-bold tracking-tight text-white leading-[1.06] transition-all duration-500">
            {activeCategory.title}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-md transition-all duration-500">
            {activeCategory.description}
          </p>

          <div className="pt-4">
            <Link
              href={activeCategory.slug}
              className="group inline-flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-zinc-300 uppercase hover:text-white transition-colors"
            >
              <span>WATCH THE FILM</span>
              <span className="h-px w-8 bg-zinc-500 group-hover:w-14 group-hover:bg-white transition-all duration-300" />
            </Link>
          </div>
        </div>

        {/* Right Side: Exact Half Semi-Circle View-Master Reel */}
        <div className="lg:col-span-7 xl:col-span-7 relative h-full flex items-center justify-end pointer-events-none">
          {/* Reel Disc: Anchored so its center is right on the screen edge */}
          <div
            ref={reelRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2
                       w-[750px] h-[750px] sm:w-[920px] sm:h-[920px] md:w-[1080px] md:h-[1080px] lg:w-[1240px] lg:h-[1240px] xl:w-[1360px] xl:h-[1360px]
                       cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
            style={{ willChange: "transform" }}
          >
            {/* Deep Contact Shadow behind the disc */}
            <div className="absolute inset-0 rounded-full bg-black/95 blur-3xl scale-95" />

            {/* Rotating Disc Assembly */}
            <div
              className="absolute w-full h-full rounded-full flex items-center justify-center"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isDragging ? "none" : "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Disc SVG: Clean Industrial Grey View-Master Cardstock Disc (NO TEXT) */}
              <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  {/* Authentic Vintage Grey Cardstock Gradient */}
                  <radialGradient id={`reel-grey-${uid}`} cx="32%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#484a50" />
                    <stop offset="28%" stopColor="#3c3e44" />
                    <stop offset="60%" stopColor="#2e3035" />
                    <stop offset="88%" stopColor="#222328" />
                    <stop offset="100%" stopColor="#18191c" />
                  </radialGradient>

                  {/* Rim Shadow & Depth */}
                  <radialGradient id={`reel-rim-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="86%" stopColor="transparent" />
                    <stop offset="95%" stopColor="rgba(0,0,0,0.55)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.92)" />
                  </radialGradient>

                  {/* Subtle Overhead Lighting Sheen */}
                  <radialGradient id={`reel-sheen-${uid}`} cx="26%" cy="20%" r="42%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>

                  {/* Metallic Hub Gradient */}
                  <radialGradient id={`reel-hub-${uid}`} cx="38%" cy="34%" r="65%">
                    <stop offset="0%" stopColor="#404248" />
                    <stop offset="60%" stopColor="#26272b" />
                    <stop offset="100%" stopColor="#151618" />
                  </radialGradient>

                  {/* Center Hole */}
                  <radialGradient id={`reel-hole-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#08080a" />
                    <stop offset="80%" stopColor="#030304" />
                    <stop offset="100%" stopColor="#000000" />
                  </radialGradient>
                </defs>

                {/* Outer Grey Disc Body */}
                <circle cx="500" cy="500" r="488" fill={`url(#reel-grey-${uid})`} />
                <circle cx="500" cy="500" r="488" fill={`url(#reel-rim-${uid})`} />
                <circle cx="500" cy="500" r="488" fill={`url(#reel-sheen-${uid})`} />

                {/* Embossed Fine Edge Rings */}
                <circle cx="500" cy="500" r="486" fill="none" stroke="#5d6068" strokeOpacity="0.4" strokeWidth="2" />
                <circle cx="500" cy="500" r="462" fill="none" stroke="#1c1d20" strokeOpacity="0.85" strokeWidth="1.5" />
                <circle cx="500" cy="500" r="458" fill="none" stroke="#4c5058" strokeOpacity="0.3" strokeWidth="1" />

                {/* View-Master Outer Sprocket Notches */}
                {Array.from({ length: PERF_COUNT }).map((_, i) => {
                  const a = (360 / PERF_COUNT) * i;
                  return (
                    <rect
                      key={`notch-${i}`}
                      x="493"
                      y="14"
                      width="14"
                      height="24"
                      rx="3"
                      fill="#0e0f11"
                      stroke="#1e2024"
                      strokeWidth="1"
                      transform={`rotate(${a} 500 500)`}
                    />
                  );
                })}

                {/* Embossed Intermediate Concentric Grooves */}
                <circle cx="500" cy="500" r="392" fill="none" stroke="#1e1f23" strokeWidth="2.5" strokeOpacity="0.85" />
                <circle cx="500" cy="500" r="390" fill="none" stroke="#4f525c" strokeWidth="1" strokeOpacity="0.25" />

                <circle cx="500" cy="500" r="235" fill="none" stroke="#18191c" strokeWidth="3" strokeOpacity="0.95" />
                <circle cx="500" cy="500" r="232" fill="none" stroke="#525660" strokeWidth="1.5" strokeOpacity="0.35" />

                {/* Rivets / Screw Indentations around the inner ring */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <circle
                    key={`rivet-${a}`}
                    cx="500"
                    cy="270"
                    r="4.5"
                    fill="#1e2024"
                    stroke="#42454e"
                    strokeWidth="1"
                    transform={`rotate(${a} 500 500)`}
                  />
                ))}

                {/* Center Hub Assembly */}
                <circle cx="500" cy="500" r="108" fill={`url(#reel-hub-${uid})`} stroke="#16171a" strokeWidth="3" />
                <circle cx="500" cy="500" r="106" fill="none" stroke="#50545e" strokeOpacity="0.4" strokeWidth="1.5" />

                {/* Drive Notches / Center Locking Cutouts */}
                {[0, 90, 180, 270].map((a) => (
                  <rect
                    key={`drive-notch-${a}`}
                    x="495"
                    y="412"
                    width="10"
                    height="20"
                    rx="2"
                    fill="#0c0d10"
                    stroke="#1e2024"
                    strokeWidth="0.5"
                    transform={`rotate(${a} 500 500)`}
                  />
                ))}

                {/* Center Spindle Hole */}
                <circle cx="500" cy="500" r="54" fill={`url(#reel-hole-${uid})`} stroke="#0a0a0c" strokeWidth="4" />
                <circle cx="500" cy="500" r="52" fill="none" stroke="#3e4147" strokeOpacity="0.4" strokeWidth="1.5" />
              </svg>

              {/* Mounted Horizontal Landscape TTV Film Slides */}
              {WORK_CATEGORIES.map((cat, idx) => {
                // 180deg is 9 o'clock (the active leftmost position pointing to the copy)
                const baseAngle = 180 + idx * stepAngle;
                const radius = 330; // radial distance from disc center
                const isActive = activeIdx === idx;

                return (
                  <div
                    key={cat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectIndex(idx);
                    }}
                    className="absolute cursor-pointer group"
                    style={{
                      // Position each slide along the circle:
                      // rotate(baseAngle) translateX(radius) rotate(180) ensures:
                      // At 9 o'clock (baseAngle = 180): the slide is placed at (-radius, 0) and oriented perfectly horizontal (landscape)!
                      // As the wheel turns, slides tilt along the circle curvature matching the reference image.
                      transform: `rotate(${baseAngle}deg) translateX(${radius}px) rotate(180deg)`,
                    }}
                  >
                    {/* TTV Film Slide Bezel: Dark rounded TV bezel */}
                    <div
                      className={`relative w-48 h-32 sm:w-60 sm:h-40 md:w-72 md:h-48 lg:w-80 lg:h-54 rounded-[18px] bg-[#0e0f12] p-2.5 sm:p-3 transition-all duration-300 ${isActive
                          ? "ring-2 ring-cyan-400/70 shadow-[0_0_45px_rgba(30,170,180,0.35),0_20px_45px_rgba(0,0,0,0.95)] scale-[1.06]"
                          : "border border-white/10 opacity-75 hover:opacity-100 hover:scale-[1.02] shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
                        }`}
                    >
                      {/* Interactive Hover Hand Cue on Slide */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <span className="text-xl drop-shadow-lg select-none">👆</span>
                      </div>

                      {/* Screen / Aperture: Horizontal Landscape CRT Screen */}
                      <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-black flex items-center justify-center border border-black/90 shadow-inner">
                        {/* Film Image */}
                        <img
                          src={cat.image}
                          alt={cat.title}
                          className={`w-full h-full object-cover transition-all duration-700 ${isActive
                              ? "scale-105 contrast-[1.15] brightness-[1.1] saturate-[1.15]"
                              : "contrast-100 brightness-[0.7] group-hover:brightness-90"
                            }`}
                          draggable={false}
                        />

                        {/* CRT Scanline Overlay Texture */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-35"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 3px)",
                          }}
                        />

                        {/* CRT Curved Glass Vignette & Specular Highlight */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.85)]" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] pointer-events-none" />

                        {/* Retro Cyan CRT Phosphor Glow for active slide */}
                        {isActive && (
                          <div className="absolute inset-0 bg-cyan-400/[0.08] mix-blend-screen pointer-events-none" />
                        )}
                      </div>

                      {/* Slide metadata printed directly on the dark bezel (matching reference image) */}
                      <div className="w-full pt-1.5 px-1 flex items-center justify-between pointer-events-none">
                        <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-wider text-zinc-400">
                          {cat.number}
                        </span>
                        <span className="font-mono text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] text-zinc-300 uppercase">
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Indicator: "TURN THE REEL" (matching reference) */}
      <div className="absolute bottom-8 left-12 sm:left-20 flex flex-col items-center gap-2 pointer-events-none z-20 opacity-70">
        <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center animate-spin [animation-duration:8s]">
          <svg className="w-3.5 h-3.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="3" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="3" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="21" y2="12" />
          </svg>
        </div>
        <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-zinc-300">
          TURN THE REEL
        </p>
      </div>

      {/* Bottom Right Action Buttons (matching reference screenshot) */}
      <div className="absolute bottom-8 right-8 sm:right-12 flex flex-col gap-2.5 z-30">
        <button
          onClick={toggleFullscreen}
          type="button"
          aria-label="Toggle Fullscreen"
          className="w-12 h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/90 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-xl active:scale-95"
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setRotationAngle((prev) => prev - stepAngle)}
          type="button"
          aria-label="Next Reel Slide"
          className="w-12 h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/90 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>
      </div>
    </section>
  );
}

