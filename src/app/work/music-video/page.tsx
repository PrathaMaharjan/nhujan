"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  vimeoId: string;
}

const COMMERCIAL_PROJECTS: Project[] = [
  {
    id: "1",
    title: "STREET IS NOT A HOME",
    category: "COMMERCIAL",
    thumbnail:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
    vimeoId: "76979871",
  },
  {
    id: "2",
    title: "TOAD SHORT FILM",
    category: "NARRATIVE",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
    vimeoId: "76979871",
  },
  {
    id: "3",
    title: "DESERT SILHOUETTE",
    category: "MUSIC VIDEO",
    thumbnail:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop",
    vimeoId: "76979871",
  },
  {
    id: "4",
    title: "EQUESTRIAN SHOW",
    category: "BRAND FILM",
    thumbnail:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    vimeoId: "76979871",
  },
  {
    id: "5",
    title: "RED BULL ATHLETE",
    category: "COMMERCIAL",
    thumbnail:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop",
    vimeoId: "76979871",
  },
  {
    id: "6",
    title: "CYCLING STAFF PICK",
    category: "DOCUMENTARY",
    thumbnail:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    vimeoId: "76979871",
  },
  {
    id: "7",
    title: "URBAN ECHOES",
    category: "EDITORIAL",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
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
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [sidebarPos, setSidebarPos] = useState(SIDEBAR_MIDDLE_START);
  const [displayedTitleIndex, setDisplayedTitleIndex] = useState(0);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  const selectedIndex = (((trackIndex - 1) % N) + N) % N;
  const activeTitleProject = COMMERCIAL_PROJECTS[displayedTitleIndex];

  const goTo = useCallback((direction: 1 | -1) => {
    if (isScrollingRef.current) return;

    isScrollingRef.current = true;
    setTransitionEnabled(true);
    setTrackIndex((prev) => prev + direction);
    setSidebarPos((prev) => prev + direction);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, TRANSITION_MS + 20);
  }, []);

  const handleTransitionEnd = () => {
    let nextIndex = trackIndex - 1;
    if (trackIndex === 0) {
      setTransitionEnabled(false);
      setTrackIndex(N);
      nextIndex = N - 1;
    } else if (trackIndex === N + 1) {
      setTransitionEnabled(false);
      setTrackIndex(1);
      nextIndex = 0;
    }

    setDisplayedTitleIndex(((nextIndex % N) + N) % N);
  };

  useEffect(() => {
    let wheelDeltaAccumulator = 0;
    let resetTimer: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(1);
      if (e.key === "ArrowUp") goTo(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goTo]);

  useEffect(() => {
    if (isProgrammaticScrollRef.current) return;

    const el = sidebarRef.current?.children[sidebarPos] as
      | HTMLElement
      | undefined;
    if (el && sidebarRef.current) {
      isProgrammaticScrollRef.current = true;
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, TRANSITION_MS);
    }
  }, [sidebarPos]);

  useEffect(() => {
    const container = sidebarRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index) && index !== sidebarPos) {
              const realIdx = index % N;
              setSidebarPos(index);
              setTransitionEnabled(true);
              setTrackIndex(realIdx + 1);
            }
          }
        });
      },
      {
        root: container,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [sidebarPos]);

  const handleSidebarScroll = () => {
    const container = sidebarRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const singleSetHeight = scrollHeight / SIDEBAR_COPIES;
    const threshold = singleSetHeight * 1.5;

    if (scrollTop < threshold) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop += singleSetHeight * 2;
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
    } else if (scrollTop + clientHeight > scrollHeight - threshold) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop -= singleSetHeight * 2;
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
    }
  };

  const handleThumbnailClick = (clickedAbsIndex: number, realIndex: number) => {
    if (isScrollingRef.current) return;
    setTransitionEnabled(true);
    setTrackIndex(realIndex + 1);
    setSidebarPos(clickedAbsIndex);

    setTimeout(() => {
      setDisplayedTitleIndex(realIndex);
    }, TRANSITION_MS);

    isScrollingRef.current = true;
    setTimeout(() => {
      isScrollingRef.current = false;
    }, TRANSITION_MS + 20);
  };

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden font-sans select-none relative">
      {/* Standard React style element to avoid styled-jsx TS7026 error */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes titleIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-title-in { animation: titleIn 500ms cubic-bezier(0.16, 1, 0.3, 1); }
        `,
        }}
      />

      {/* SVG Barrel Frame Distortion Filter */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="barrelFrame" x="-20%" y="-20%" width="140%" height="140%">
            <feImage
              xlinkHref="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='75%25'%3E%3Cstop offset='0%25' stop-color='%23000000'/%3E%3Cstop offset='100%25' stop-color='%23ffffff'/%3E%3C/radialGradient%3E%3Crect width='100' height='100' fill='url(%23g)'/%3E%3C/svg%3E"
              result="map"
            />
            <feGaussianBlur in="map" stdDeviation="4" result="mapBlur" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="mapBlur"
              scale="-30"
              xChannelSelector="R"
              yChannelSelector="R"
            />
          </filter>
        </defs>
      </svg>

      {/* Main Center Video Track */}
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
          {EXTENDED_PROJECTS.map((proj, idx) => (
            <div
              key={`main-track-${proj.id}-${idx}`}
              className="w-full h-screen flex-shrink-0 flex items-center justify-center"
              style={{ padding: '24px 40px' }}
            >
              {/* Clickable Card Link */}
              <Link
                href={`/work/commercial/${proj.id}`}
                className="relative w-full aspect-[16/10] pointer-events-auto group block cursor-pointer"
              >
                <div
                  className="
                    absolute inset-[-6%] rounded-[24%]
                    bg-white/25 blur-[60px]
                    opacity-40 group-hover:opacity-70 group-hover:scale-[0.98] transition-all duration-500
                    pointer-events-none
                  "
                />

                <div
                  className="relative w-full h-full bg-zinc-900 shadow-2xl overflow-hidden rounded-[2.5%]"
                  style={{
                    filter: "url(#barrelFrame)",
                    maskImage:
                      "radial-gradient(ellipse 78% 78% at 50% 50%, black 60%, transparent 100%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 78% 78% at 50% 50%, black 60%, transparent 100%)",
                  }}
                >
                  <img
                    src={proj.thumbnail}
                    alt={proj.title}
                    className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    draggable={false}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Overlay Controls */}
      <div className="h-full w-full grid grid-cols-12 items-center relative z-20 pointer-events-none" style={{ padding: '0 10%' }}>
        {/* Left Side Info */}
        <div className="col-span-3 flex flex-col justify-between h-full pointer-events-auto" style={{ paddingTop: '10%', paddingBottom: '10%' }}>
          <Link
            href="/work"
            className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors uppercase"
          >
            BACK
          </Link>

          <div className="max-w-xs overflow-hidden">
            <h1
              key={activeTitleProject.id}
              className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.9] text-white animate-title-in"
            >
              {activeTitleProject.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase"></div>
        </div>

        <div className="col-span-6" />

        {/* Right Sidebar Rail */}
        <div className="col-span-3 h-full flex items-center justify-end gap-6 pointer-events-auto">
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

          <div
            ref={sidebarRef}
            onScroll={handleSidebarScroll}
            className="h-[80vh] flex flex-col gap-4 overflow-y-auto no-scrollbar py-32 snap-y snap-mandatory overscroll-contain"
          >
            {INFINITE_SIDEBAR_PROJECTS.map((proj, idx) => {
              const realIndex = idx % N;
              const isSelected = idx === sidebarPos;
              return (
                <button
                  key={`sidebar-item-${idx}`}
                  data-index={idx}
                  onClick={() => handleThumbnailClick(idx, realIndex)}
                  className={`relative w-28 md:w-36 aspect-[16/10] flex-shrink-0 overflow-hidden snap-center transition-all duration-300 ease-out cursor-pointer ${
                    isSelected
                      ? "opacity-100 scale-105"
                      : "opacity-30 hover:opacity-70"
                  }`}
                >
                  <img
                    src={proj.thumbnail}
                    alt={proj.title}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
