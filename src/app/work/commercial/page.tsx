"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import BarrelVideo from "@/app/component/BarrelVideo";
import MeshText from "@/app/component/MeshText";

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  preview: string;
  vimeoId: string;
}

const COMMERCIAL_PROJECTS: Project[] = [
  {
    id: "1",
    title: "STREET IS NOT A HOME",
    category: "COMMERCIAL",
    thumbnail:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
  {
    id: "2",
    title: "TOAD SHORT FILM",
    category: "NARRATIVE",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
  {
    id: "3",
    title: "DESERT SILHOUETTE",
    category: "MUSIC VIDEO",
    thumbnail:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
  {
    id: "4",
    title: "EQUESTRIAN SHOW",
    category: "BRAND FILM",
    thumbnail:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
  {
    id: "5",
    title: "RED BULL ATHLETE",
    category: "COMMERCIAL",
    thumbnail:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
  {
    id: "6",
    title: "CYCLING STAFF PICK",
    category: "DOCUMENTARY",
    thumbnail:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
  {
    id: "7",
    title: "URBAN ECHOES",
    category: "EDITORIAL",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    preview: "/showreel/sample-5s.webm",
    vimeoId: "76979871",
  },
];

const N = COMMERCIAL_PROJECTS.length;

const EXTENDED_PROJECTS: Project[] = [
  COMMERCIAL_PROJECTS[N - 1],
  ...COMMERCIAL_PROJECTS,
  COMMERCIAL_PROJECTS[0],
];

const SIDEBAR_COPIES = 7;

const INFINITE_SIDEBAR_PROJECTS: Project[] = Array.from(
  { length: SIDEBAR_COPIES },
  () => COMMERCIAL_PROJECTS,
).flat();

const SIDEBAR_MIDDLE_START = Math.floor(SIDEBAR_COPIES / 2) * N;

const TRANSITION_MS = 700;

export default function CommercialPage() {
  const [mounted, setMounted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [sidebarPos, setSidebarPos] = useState(SIDEBAR_MIDDLE_START);

  // FIX 3: video only renders after the CSS transition fully settles
  const [isSettled, setIsSettled] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX 1: throttle by wall-clock time instead of a binary lock
  const lastScrollTimeRef = useRef<number>(0);

  const selectedIndex = (((trackIndex - 1) % N) + N) % N;
  const activeProject = COMMERCIAL_PROJECTS[selectedIndex];

  /*
   * --------------------------------------------------------
   * GO TO NEXT / PREVIOUS
   * --------------------------------------------------------
   */
  const goTo = useCallback((direction: 1 | -1) => {
    const now = Date.now();
    // Hard throttle — ignore events arriving before the previous animation finishes
    if (now - lastScrollTimeRef.current < TRANSITION_MS + 50) return;
    lastScrollTimeRef.current = now;

    setIsSettled(false); // hide video while animating
    setTransitionEnabled(true);
    setTrackIndex((prev) => prev + direction);
    setSidebarPos((prev) => prev + direction);
  }, []);

  /*
   * --------------------------------------------------------
   * MAIN TRACK LOOP (infinite clone jump)
   * --------------------------------------------------------
   */
  const handleTransitionEnd = () => {
    if (trackIndex === 0) {
      setTransitionEnabled(false);
      setTrackIndex(N);
    } else if (trackIndex === N + 1) {
      setTransitionEnabled(false);
      setTrackIndex(1);
    }
    // FIX 3: animation done — allow video to start playing
    setIsSettled(true);
  };

  /*
   * --------------------------------------------------------
   * MOUSE WHEEL — main window only (FIX 1 + FIX 2)
   * --------------------------------------------------------
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // FIX 2: if the event target is inside the sidebar, let it scroll freely
      if (
        sidebarRef.current &&
        e.target instanceof Node &&
        sidebarRef.current.contains(e.target)
      ) {
        return;
      }

      e.preventDefault();

      const threshold = 40; // minimum delta before registering a step
      if (Math.abs(e.deltaY) < threshold) return;

      goTo(e.deltaY > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goTo]);

  /*
   * --------------------------------------------------------
   * KEYBOARD
   * --------------------------------------------------------
   */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(1);
      if (e.key === "ArrowUp") goTo(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goTo]);

  /*
   * --------------------------------------------------------
   * AUTO-SCROLL SIDEBAR when main track changes
   * --------------------------------------------------------
   */
  useEffect(() => {
    if (isProgrammaticScrollRef.current) return;

    const container = sidebarRef.current;
    if (!container) return;

    const element = container.children[sidebarPos] as HTMLElement | undefined;
    if (!element) return;

    isProgrammaticScrollRef.current = true;
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    const timeout = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, TRANSITION_MS);

    return () => window.clearTimeout(timeout);
  }, [sidebarPos]);

  /*
   * --------------------------------------------------------
   * SIDEBAR SCROLL — debounced snap-to-closest (FIX 2)
   * --------------------------------------------------------
   */
  const handleSidebarScroll = () => {
    const container = sidebarRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const singleSetHeight = scrollHeight / SIDEBAR_COPIES;
    const threshold = singleSetHeight * 1.5;

    // Infinite boundary jump
    if (scrollTop < threshold) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop += singleSetHeight * 2;
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
      return;
    } else if (scrollTop + clientHeight > scrollHeight - threshold) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop -= singleSetHeight * 2;
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
      return;
    }

    if (isProgrammaticScrollRef.current) return;

    // Debounce: fire 180ms after scrolling stops
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      const containerCenter =
        container.getBoundingClientRect().top + clientHeight / 2;
      let closestIndex = sidebarPos;
      let minDistance = Infinity;

      Array.from(container.children).forEach((child) => {
        const rect = child.getBoundingClientRect();
        const childCenter = rect.top + rect.height / 2;
        const distance = Math.abs(containerCenter - childCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = Number(child.getAttribute("data-index"));
        }
      });

      if (!Number.isNaN(closestIndex) && closestIndex !== sidebarPos) {
        const realIndex = closestIndex % N;
        setSidebarPos(closestIndex);
        setIsSettled(false); // hide video while new item animates in
        setTransitionEnabled(true);
        setTrackIndex(realIndex + 1);

        // Re-settle after transition
        window.setTimeout(() => setIsSettled(true), TRANSITION_MS + 50);
      }
    }, 180);
  };

  /*
   * --------------------------------------------------------
   * SIDEBAR THUMBNAIL CLICK
   * --------------------------------------------------------
   */
  const handleThumbnailClick = (clickedAbsIndex: number, realIndex: number) => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current < TRANSITION_MS + 50) return;
    lastScrollTimeRef.current = now;

    setIsSettled(false);
    setTransitionEnabled(true);
    setTrackIndex(realIndex + 1);
    setSidebarPos(clickedAbsIndex);

    window.setTimeout(() => setIsSettled(true), TRANSITION_MS + 50);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white select-none">
      {/* ==================================================
          MAIN CENTER BARREL VIDEO TRACK
          ================================================== */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10 overflow-hidden">
        <div
          className={`w-full max-w-xl md:max-w-2xl h-screen flex flex-col items-center origin-center relative overflow-hidden ${mounted ? "animate-crt-turn-on-centered" : "opacity-0 scale-0"
            }`}
        >
          <div
            className="w-full h-screen flex flex-col items-center"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translateY(-${trackIndex * 100}vh)`,
              transition: transitionEnabled
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`
                : "none",
              willChange: "transform",
            }}
          >
            {EXTENDED_PROJECTS.map((project, idx) => {
              const projectRealIndex = (((idx - 1) % N) + N) % N;
              const isActive = projectRealIndex === selectedIndex;

              return (
                <div
                  key={`main-track-${project.id}-${idx}`}
                  className="w-full h-screen flex-shrink-0 flex items-center justify-center"
                  style={{ padding: "24px 20px" }}
                >
                  <Link
                    href={`/work/commercial/${project.id}`}
                    className="
                      relative
                      w-full
                      aspect-[16/10]
                      pointer-events-auto
                      group
                      block
                      cursor-pointer
                    "
                  >
                    {/* Glow halo — radial gradient so it fades to nothing instead of ending in a hard rectangle */}
                    <div
                      className="
                        absolute
                        inset-[-15%]
                        opacity-30
                        group-hover:opacity-50
                        transition-opacity
                        duration-500
                        pointer-events-none
                      "
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.18) 35%, rgba(255,255,255,0) 70%)",
                        filter: "blur(30px)",
                      }}
                    />

                    <div className="relative w-full h-full overflow-hidden">
                      {/* FIX 3: only mount BarrelVideo after animation fully settles */}
                      {isActive && isSettled ? (
                        <BarrelVideo
                          src={project.preview}
                          distortion={0}
                          edgeSoftness={0.001}
                          zoom={1}
                          glow={false}
                        />
                      ) : (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                            scale-110
                            pointer-events-none
                          "
                          draggable={false}
                        />
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================
          GRID OVERLAY CONTROLS
          ================================================== */}
      <div
        className="h-full w-full grid grid-cols-12 items-center relative z-20 pointer-events-none"
        style={{ padding: "0 4%" }}
      >
        {/* LEFT SIDE INFO */}
        <div
          className="col-span-3 flex flex-col justify-between h-full pointer-events-auto animate-signal-ui"
          style={{ paddingTop: "10%", paddingBottom: "10%" }}
        >
          <div />

          <div className="max-w-xs md:max-w-sm w-full overflow-hidden">
            <div key={activeProject.id} className="animate-title-in">
              <MeshText
                text={activeProject.title}
                color="#ffffff"
                font={{
                  fontFamily: "Inter",
                  fontWeight: 900,
                  fontSize: 26,
                  lineHeight: "1.05em",
                  letterSpacing: "0.01em",
                  textAlign: "left",
                }}
                glitchMode={false}
                enableHover={true}
                hoverIntensity={2.5}
                baseIntensity={0}
                fuzzRange={12}
                fps={60}
              />
            </div>

            <p
              key={`${activeProject.id}-subtitle`}
              className="
                mt-3
                text-[10px]
                font-mono
                tracking-[0.25em]
                text-zinc-500
                uppercase
                animate-subtitle-in
              "
            >
              {activeProject.category}
            </p>
          </div>

          <div />
        </div>

        {/* EMPTY CENTER */}
        <div className="col-span-6" />

        {/* RIGHT SIDEBAR RAIL */}
        <div className="col-span-3 h-full flex items-center justify-end gap-6 pointer-events-auto animate-signal-ui">
          {/* NUMBER */}
          <div className="flex flex-col items-center font-mono text-zinc-400 select-none">
            <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter transition-all duration-300">
              {selectedIndex + 1 < 10
                ? `0${selectedIndex + 1}`
                : selectedIndex + 1}
            </span>

            <div className="w-8 h-[1px] bg-red-600 my-1.5" />

            <span className="text-xl text-zinc-600">
              {N < 10 ? `0${N}` : N}
            </span>
          </div>

          {/* THUMBNAIL RAIL */}
          <div
            ref={sidebarRef}
            onScroll={handleSidebarScroll}
            onWheel={(e) => e.stopPropagation()}
            className="
              h-[80vh]
              w-32 md:w-36
              flex
              flex-col
              items-center
              gap-5
              overflow-y-auto
              no-scrollbar
              py-32
              snap-y
              snap-mandatory
              overscroll-contain
            "
          >
            {INFINITE_SIDEBAR_PROJECTS.map((project, idx) => {
              const realIndex = idx % N;
              const isSelected = idx === sidebarPos;

              return (
                <button
                  key={`sidebar-item-${idx}`}
                  type="button"
                  data-index={idx}
                  onClick={() => handleThumbnailClick(idx, realIndex)}
                  className={`
                    relative
                    w-full
                    aspect-[16/10]
                    flex-shrink-0
                    rounded-sm
                    overflow-hidden
                    snap-center
                    transition-all
                    duration-500
                    ease-out
                    cursor-pointer
                    ${isSelected
                      ? "opacity-100 scale-135 z-10 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-white/40"
                      : "opacity-35 scale-90 hover:opacity-75 hover:scale-95 grayscale-[30%]"
                    }
                  `}
                >
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="
                      w-full
                      h-full
                      object-cover
                      pointer-events-none
                    "
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        * {
          scrollbar-width: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }

        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        @keyframes titleIn {
          from {
            opacity: 0;
            transform: translateY(45px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-title-in {
          animation: titleIn 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes subtitleIn {
          from {
            opacity: 0;
            transform: translateY(45px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-subtitle-in {
          animation: subtitleIn 900ms cubic-bezier(0.16, 1, 0.3, 1) 350ms both;
        }
      `}</style>
    </main>
  );
}