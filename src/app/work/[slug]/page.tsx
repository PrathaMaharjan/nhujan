"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MeshText from "@/app/component/MeshText";
import { isVideoUrl } from "@/lib/media";
import { slugify } from "@/lib/slug";

interface Project {
  id: string;
  slug?: string;
  title: string;
  category: string;
  thumbnail: string;
  gif?: string;
}

const SIDEBAR_COPIES = 7;
const TRANSITION_MS = 700;

export default function WorkCategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const hasPositionedRef = useRef(false);

  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [sidebarPos, setSidebarPos] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/work-categories/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((cat) => {
        if (cat?.title) setCategoryTitle(cat.title);
      })
      .catch(() => {});

    fetch(`/api/work-projects/${slug}`)
      .then((res) => res.json())
      .then((data: Project[]) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0) {
            const initialPos = Math.floor(SIDEBAR_COPIES / 2) * data.length;
            setSidebarPos(initialPos);
            lastTickItemRef.current = initialPos;
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const programmaticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  const N = projects.length;

  const EXTENDED_PROJECTS = useMemo(() => {
    if (N === 0) return [];
    return [projects[N - 1], ...projects, projects[0]];
  }, [projects, N]);

  const INFINITE_SIDEBAR_PROJECTS = useMemo(() => {
    if (N === 0) return [];
    return Array.from({ length: SIDEBAR_COPIES }, () => projects).flat();
  }, [projects, N]);

  const SIDEBAR_MIDDLE_START = useMemo(
    () => Math.floor(SIDEBAR_COPIES / 2) * N,
    [N]
  );

  const selectedIndex = N === 0 ? 0 : (((trackIndex - 1) % N) + N) % N;
  const activeProject = projects[selectedIndex];

  /*
   * --------------------------------------------------------
   * SCROLL TICK SOUND (synthesized — no audio file needed)
   * --------------------------------------------------------
   */
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickItemRef = useRef<number>(0);
  const tickRafRef = useRef<number | null>(null);

  useEffect(() => {
    lastTickItemRef.current = SIDEBAR_MIDDLE_START;
  }, [SIDEBAR_MIDDLE_START]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  }, []);

  const playTick = useCallback(
    (strength: number = 1) => {
      try {
        const ctx = getAudioCtx();

        const fire = () => {
          const now = ctx.currentTime;

          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(3200 + Math.random() * 400, now);
          osc.frequency.exponentialRampToValueAtTime(1600, now + 0.015);

          const gain = ctx.createGain();
          const peak = 0.6 * Math.min(1.8, Math.max(0.5, strength));
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(peak, now + 0.001);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

          const filter = ctx.createBiquadFilter();
          filter.type = "highpass";
          filter.frequency.value = 1000;

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.025);
        };

        if (ctx.state === "suspended") {
          ctx.resume().then(fire).catch(() => {});
        } else {
          fire();
        }
      } catch {
        // audio not available — fail silently
      }
    },
    [getAudioCtx],
  );

  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [getAudioCtx]);

  /*
   * --------------------------------------------------------
   * GO TO NEXT / PREVIOUS
   * --------------------------------------------------------
   */
  const goTo = useCallback(
    (direction: 1 | -1) => {
      if (N === 0) return;
      const now = Date.now();
      if (now - lastScrollTimeRef.current < TRANSITION_MS + 50) return;
      lastScrollTimeRef.current = now;

      playTick(1);
      setTransitionEnabled(true);
      setTrackIndex((prev) => prev + direction);
      setSidebarPos((prev) => prev + direction);
    },
    [playTick, N],
  );

  /*
   * --------------------------------------------------------
   * MAIN TRACK LOOP (infinite clone jump)
   * --------------------------------------------------------
   */
  const handleTransitionEnd = () => {
    if (N === 0) return;
    if (trackIndex === 0) {
      setTransitionEnabled(false);
      setTrackIndex(N);
    } else if (trackIndex === N + 1) {
      setTransitionEnabled(false);
      setTrackIndex(1);
    }
  };

  /*
   * --------------------------------------------------------
   * MOUSE WHEEL — main window only
   * --------------------------------------------------------
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        sidebarRef.current &&
        e.target instanceof Node &&
        sidebarRef.current.contains(e.target)
      ) {
        return;
      }

      e.preventDefault();

      const threshold = 40;
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
   * AUTO-SCROLL SIDEBAR when main track changes or on mount
   * --------------------------------------------------------
   */
  const scrollToActive = useCallback(
    (smooth = true) => {
      const container = sidebarRef.current;
      if (!container || N === 0) return;

      const element = container.children[sidebarPos] as HTMLElement | undefined;
      if (!element) return;

      const targetScrollTop =
        element.offsetTop + element.offsetHeight / 2 - container.clientHeight / 2;

      if (Math.abs(container.scrollTop - targetScrollTop) < 1) return;

      isProgrammaticScrollRef.current = true;
      if (smooth) {
        container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
      } else {
        container.scrollTop = targetScrollTop;
      }

      if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
      programmaticTimeoutRef.current = setTimeout(
        () => {
          isProgrammaticScrollRef.current = false;
        },
        smooth ? TRANSITION_MS : 50
      );
    },
    [sidebarPos, N]
  );

  useEffect(() => {
    if (N === 0) return;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      scrollToActive(false);
      const rId = requestAnimationFrame(() => scrollToActive(false));
      const t1 = setTimeout(() => scrollToActive(false), 50);
      const t2 = setTimeout(() => scrollToActive(false), 200);
      const t3 = setTimeout(() => scrollToActive(false), 1000);

      return () => {
        cancelAnimationFrame(rId);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      scrollToActive(true);
    }
  }, [sidebarPos, N, scrollToActive]);

  /*
   * --------------------------------------------------------
   * SIDEBAR SCROLL — debounced snap-to-closest + tick sound
   * --------------------------------------------------------
   */
  const handleSidebarScroll = () => {
    const container = sidebarRef.current;
    if (!container || N === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const singleSetHeight = scrollHeight / SIDEBAR_COPIES;
    const threshold = singleSetHeight * 1.5;

    if (!isProgrammaticScrollRef.current) {
      if (tickRafRef.current) cancelAnimationFrame(tickRafRef.current);
      tickRafRef.current = requestAnimationFrame(() => {
        const itemStep = singleSetHeight / N;
        const currentItem = Math.round(scrollTop / itemStep);
        if (currentItem !== lastTickItemRef.current) {
          const delta = Math.abs(currentItem - lastTickItemRef.current);
          lastTickItemRef.current = currentItem;
          playTick(Math.min(1.5, 0.6 + delta * 0.15));
        }
      });
    }

    if (scrollTop < threshold) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop += singleSetHeight * 2;
      if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
      programmaticTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
      return;
    } else if (scrollTop + clientHeight > scrollHeight - threshold) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop -= singleSetHeight * 2;
      if (programmaticTimeoutRef.current) clearTimeout(programmaticTimeoutRef.current);
      programmaticTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
      return;
    }

    if (isProgrammaticScrollRef.current) return;

    if (sidebarDebounceTimeoutRef.current) clearTimeout(sidebarDebounceTimeoutRef.current);

    sidebarDebounceTimeoutRef.current = setTimeout(() => {
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
        setTransitionEnabled(true);
        setTrackIndex(realIndex + 1);
      }
    }, 180);
  };

  /*
   * --------------------------------------------------------
   * SIDEBAR THUMBNAIL CLICK
   * --------------------------------------------------------
   */
  const handleThumbnailClick = (clickedAbsIndex: number, realIndex: number) => {
    if (N === 0) return;
    const now = Date.now();
    if (now - lastScrollTimeRef.current < TRANSITION_MS + 50) return;
    lastScrollTimeRef.current = now;

    playTick(1);
    setTransitionEnabled(true);
    setTrackIndex(realIndex + 1);
    setSidebarPos(clickedAbsIndex);
  };

  if (loading) {
    return <main className="h-screen w-full bg-black" />;
  }

  if (N === 0 || !activeProject) {
    return (
      <main className="h-screen w-full bg-black text-white flex items-center justify-center">
        <p className="text-xs tracking-[0.3em] text-white/30 uppercase">
          {categoryTitle ? `No projects yet in ${categoryTitle}` : "No projects yet"}
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white select-none">
      {/* ==================================================
          MAIN CENTER TRACK — GIFs play directly, no video layer
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
            {EXTENDED_PROJECTS.map((project, idx) => (
              <div
                key={`main-track-${project.id}-${idx}`}
                className="w-full h-screen flex-shrink-0 flex items-center justify-center"
                style={{ padding: "24px 20px" }}
              >
                <Link
                  href={`/work/${slug}/${project.slug || slugify(project.title) || project.id}`}
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
                    {(() => {
                      const mediaUrl = project.gif || project.thumbnail;
                      return isVideoUrl(mediaUrl) ? (
                        <video
                          src={mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                            pointer-events-none
                          "
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={project.title}
                          className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                            pointer-events-none
                          "
                          draggable={false}
                        />
                      );
                    })()}
                  </div>
                </Link>
              </div>
            ))}
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

        <div className="col-span-6" />

        <div className="col-span-3 h-full flex items-center justify-end gap-6 pointer-events-auto animate-signal-ui">
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
            onWheel={(e) => e.stopPropagation()}
            className="
              relative
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
                    outline-none
                    border-none
                    ${isSelected
                      ? "opacity-100 scale-135 z-10 shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                      : "opacity-35 scale-90 hover:opacity-75 hover:scale-95 grayscale-[30%]"
                    }
                  `}
                >
                  {isVideoUrl(project.thumbnail) ? (
                    <video
                      src={project.thumbnail}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="
                        w-full
                        h-full
                        object-cover
                        pointer-events-none
                      "
                    />
                  ) : (
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
                  )}
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