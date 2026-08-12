"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import BarrelVideo from "@/app/component/BarrelVideo";

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  preview: string;
  vimeoId: string;
}

/*
|--------------------------------------------------------------------------
| PROJECT DATA
|--------------------------------------------------------------------------
|
| Put your preview videos inside:
|
| public/showreel/
|
| Example:
|
| public/showreel/street-is-not-a-home.webm
| public/showreel/toad-short-film.webm
| public/showreel/desert-silhouette.webm
|
*/

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

/*
|--------------------------------------------------------------------------
| EXTENDED MAIN TRACK
|--------------------------------------------------------------------------
|
| Previous last item
| All projects
| First item
|
| This allows the existing infinite vertical animation.
|
*/

const EXTENDED_PROJECTS: Project[] = [
  COMMERCIAL_PROJECTS[N - 1],
  ...COMMERCIAL_PROJECTS,
  COMMERCIAL_PROJECTS[0],
];

/*
|--------------------------------------------------------------------------
| INFINITE SIDEBAR
|--------------------------------------------------------------------------
*/

const SIDEBAR_COPIES = 7;

const INFINITE_SIDEBAR_PROJECTS: Project[] = Array.from(
  { length: SIDEBAR_COPIES },
  () => COMMERCIAL_PROJECTS,
).flat();

const SIDEBAR_MIDDLE_START = Math.floor(SIDEBAR_COPIES / 2) * N;

const TRANSITION_MS = 700;

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function CommercialPage() {
  /*
   * Main vertical track.
   *
   * 1 = first real project
   * 2 = second real project
   * etc.
   */

  const [trackIndex, setTrackIndex] = useState(1);

  const [transitionEnabled, setTransitionEnabled] = useState(true);

  /*
   * Sidebar currently selected item.
   */

  const [sidebarPos, setSidebarPos] = useState(SIDEBAR_MIDDLE_START);

  /*
   * Title displayed on the left.
   */

  const [displayedTitleIndex, setDisplayedTitleIndex] = useState(0);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const isScrollingRef = useRef(false);

  const isProgrammaticScrollRef = useRef(false);

  /*
   * Currently selected project.
   *
   * IMPORTANT:
   *
   * This is the project that gets rendered in the
   * center BarrelVideo.
   */

  const selectedIndex = (((trackIndex - 1) % N) + N) % N;

  const activeProject = COMMERCIAL_PROJECTS[selectedIndex];

  /*
   * --------------------------------------------------------
   * GO TO NEXT / PREVIOUS
   * --------------------------------------------------------
   */

  const goTo = useCallback((direction: 1 | -1) => {
    if (isScrollingRef.current) return;

    isScrollingRef.current = true;

    setTransitionEnabled(true);

    setTrackIndex((prev) => prev + direction);

    setSidebarPos((prev) => prev + direction);

    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, TRANSITION_MS + 20);
  }, []);

  /*
   * --------------------------------------------------------
   * MAIN TRACK LOOP
   * --------------------------------------------------------
   */

  const handleTransitionEnd = () => {
    let nextIndex = trackIndex - 1;

    /*
     * Went above first real project.
     */

    if (trackIndex === 0) {
      setTransitionEnabled(false);

      setTrackIndex(N);

      nextIndex = N - 1;
    } else if (trackIndex === N + 1) {
      /*
       * Went below last real project.
       */
      setTransitionEnabled(false);

      setTrackIndex(1);

      nextIndex = 0;
    }

    setDisplayedTitleIndex(((nextIndex % N) + N) % N);
  };

  /*
   * --------------------------------------------------------
   * MOUSE WHEEL
   * --------------------------------------------------------
   */

  useEffect(() => {
    let wheelDeltaAccumulator = 0;

    let resetTimer: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      /*
       * Let sidebar scroll normally.
       */

      if (
        sidebarRef.current &&
        e.target instanceof Node &&
        sidebarRef.current.contains(e.target)
      ) {
        return;
      }

      e.preventDefault();

      if (isScrollingRef.current) return;

      wheelDeltaAccumulator += e.deltaY;

      const threshold = 30;

      if (Math.abs(wheelDeltaAccumulator) >= threshold) {
        goTo(wheelDeltaAccumulator > 0 ? 1 : -1);

        wheelDeltaAccumulator = 0;
      }

      clearTimeout(resetTimer);

      resetTimer = setTimeout(() => {
        wheelDeltaAccumulator = 0;
      }, 150);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);

      clearTimeout(resetTimer);
    };
  }, [goTo]);

  /*
   * --------------------------------------------------------
   * KEYBOARD
   * --------------------------------------------------------
   */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        goTo(1);
      }

      if (e.key === "ArrowUp") {
        goTo(-1);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [goTo]);

  /*
   * --------------------------------------------------------
   * MOVE SIDEBAR TO SELECTED PROJECT
   * --------------------------------------------------------
   */

  useEffect(() => {
    if (isProgrammaticScrollRef.current) {
      return;
    }

    const container = sidebarRef.current;

    if (!container) return;

    const element = container.children[sidebarPos] as HTMLElement | undefined;

    if (!element) return;

    isProgrammaticScrollRef.current = true;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const timeout = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, TRANSITION_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [sidebarPos]);

  /*
   * --------------------------------------------------------
   * SIDEBAR INTERSECTION OBSERVER
   * --------------------------------------------------------
   */

  useEffect(() => {
    const container = sidebarRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) {
          return;
        }

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number(entry.target.getAttribute("data-index"));

          if (Number.isNaN(index)) return;

          if (index === sidebarPos) {
            return;
          }

          const realIndex = index % N;

          setSidebarPos(index);

          setTransitionEnabled(true);

          setTrackIndex(realIndex + 1);

          setDisplayedTitleIndex(realIndex);
        });
      },
      {
        root: container,

        rootMargin: "-45% 0px -45% 0px",

        threshold: 0,
      },
    );

    Array.from(container.children).forEach((child) => {
      observer.observe(child);
    });

    return () => {
      observer.disconnect();
    };
  }, [sidebarPos]);

  /*
   * --------------------------------------------------------
   * INFINITE SIDEBAR
   * --------------------------------------------------------
   */

  const handleSidebarScroll = () => {
    const container = sidebarRef.current;

    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const singleSetHeight = scrollHeight / SIDEBAR_COPIES;

    const threshold = singleSetHeight * 1.5;

    /*
     * User reached upper side.
     */

    if (scrollTop < threshold) {
      isProgrammaticScrollRef.current = true;

      container.scrollTop += singleSetHeight * 2;

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
    } else if (scrollTop + clientHeight > scrollHeight - threshold) {
      /*
       * User reached lower side.
       */
      isProgrammaticScrollRef.current = true;

      container.scrollTop -= singleSetHeight * 2;

      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
    }
  };

  /*
   * --------------------------------------------------------
   * SIDEBAR THUMBNAIL CLICK
   * --------------------------------------------------------
   */

  const handleThumbnailClick = (clickedAbsIndex: number, realIndex: number) => {
    if (isScrollingRef.current) {
      return;
    }

    isScrollingRef.current = true;

    setTransitionEnabled(true);

    setTrackIndex(realIndex + 1);

    setSidebarPos(clickedAbsIndex);

    setDisplayedTitleIndex(realIndex);

    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, TRANSITION_MS + 20);
  };

  /*
   * --------------------------------------------------------
   * RENDER
   * --------------------------------------------------------
   */

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white select-none">
      {/* ==================================================
          MAIN CENTER BARREL VIDEO TRACK
          ================================================== */}

      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
        <div
          className="w-full max-w-xl md:max-w-2xl h-screen flex flex-col items-center"
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
            /*
             * Convert extended-track index
             * back to the real project index.
             *
             * EXTENDED:
             *
             * 0 = last project
             * 1 = first project
             * 2 = second project
             * ...
             * N = last project
             * N+1 = first project
             */

            const projectRealIndex = (((idx - 1) % N) + N) % N;

            /*
             * ONLY the active project gets
             * the WebGL BarrelVideo.
             *
             * This prevents 9+ WebGL contexts
             * from being created simultaneously.
             */

            const isActive = projectRealIndex === selectedIndex;

            return (
              <div
                key={`main-track-${project.id}-${idx}`}
                className="w-full h-screen flex-shrink-0 flex items-center justify-center"
                style={{
                  padding: "24px 20px",
                }}
              >
                {/* CLICKABLE CENTER FRAME */}

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
                  {/* ==================================
                      GLOW
                      ================================== */}

                  <div
                    className="
                        absolute
                        inset-[-8%]
                        rounded-[40%]
                        bg-white/20
                        blur-[70px]
                        opacity-30
                        group-hover:opacity-50
                        transition-opacity
                        duration-500
                        pointer-events-none
                      "
                  />

                  {/* ==================================
                      BARREL FRAME
                      ================================== */}

                  <div
                    className="
                        relative
                        w-full
                        h-full
                        overflow-hidden
                      "
                  >
                    {isActive ? (
                      /*
                       * ACTIVE PROJECT
                       *
                       * This is the ONLY WebGL
                       * BarrelVideo mounted.
                       */

                      <BarrelVideo
                        src={project.preview}
                        distortion={0.85}
                        edgeSoftness={0.02}
                        zoom={0.85}
                        glow={false}
                      />
                    ) : (
                      /*
                       * INACTIVE PROJECTS
                       *
                       * Use thumbnails instead of
                       * creating additional WebGL
                       * contexts.
                       */

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

      {/* ==================================================
          GRID OVERLAY CONTROLS
          ================================================== */}

      <div
        className="h-full w-full grid grid-cols-12 items-center relative z-20 pointer-events-none"
        style={{
          padding: "0 4%",
        }}
      >
        {/* ==================================================
            LEFT SIDE INFO
            ================================================== */}

        <div
          className="col-span-3 flex flex-col justify-between h-full pointer-events-auto"
          style={{
            paddingTop: "10%",
            paddingBottom: "10%",
          }}
        >
          <Link
            href="/work"
            className="
              text-xs
              font-mono
              tracking-widest
              text-zinc-400
              hover:text-white
              transition-colors
              uppercase
            "
          >
            
          </Link>

          {/* TITLE */}

          <div className="max-w-xs overflow-hidden">
            <h1
              key={activeProject.id}
              className="
                text-4xl
                md:text-5xl
                font-black
                uppercase
                tracking-tight
                leading-[0.9]
                text-white
                animate-title-in
              "
            >
              {activeProject.title}
            </h1>

            <p
              className="
                mt-4
                text-[10px]
                font-mono
                tracking-[0.25em]
                text-zinc-500
                uppercase
              "
            >
              {activeProject.category}
            </p>
          </div>

          <div />
        </div>

        {/* ==================================================
            EMPTY CENTER
            ================================================== */}

        <div className="col-span-6" />

        {/* ==================================================
            RIGHT SIDEBAR RAIL
            ================================================== */}

        <div className="col-span-3 h-full flex items-center justify-end gap-6 pointer-events-auto">
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

          {/* ==================================================
              THUMBNAIL RAIL
              ================================================== */}

          <div
            ref={sidebarRef}
            onScroll={handleSidebarScroll}
            className="
              h-[80vh]
              flex
              flex-col
              gap-4
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
                    w-28
                    md:w-36
                    aspect-[16/10]
                    flex-shrink-0
                    overflow-hidden
                    snap-center
                    transition-all
                    duration-300
                    ease-out
                    cursor-pointer
                    ${
                      isSelected
                        ? "opacity-100 scale-105"
                        : "opacity-30 hover:opacity-70"
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

      {/* ==================================================
          STYLES
          ================================================== */}

      <style jsx global>{`
        /* Universal scrollbar hiding for both Chrome/Safari/Edge and Firefox */
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
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-title-in {
          animation: titleIn 500ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </main>
  );
}