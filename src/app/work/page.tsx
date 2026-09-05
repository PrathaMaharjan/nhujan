"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  isVideoUrl,
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
} from "@/lib/media";

interface WorkCategory {
  id: string;
  title: string;
  slug: string;
  subtext: string;
  image: string;
}

const FALLBACK_DEFAULT_BG =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop";

export default function WorkSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hudFrameRef = useRef<HTMLDivElement>(null);
  const spotlightInnerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const targetPos = useRef<{ x: number; y: number } | null>(null);
  const currentPos = useRef<{ x: number; y: number } | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [defaultBgImage, setDefaultBgImage] = useState(FALLBACK_DEFAULT_BG);
  const [workCategories, setWorkCategories] = useState<WorkCategory[]>([]);

  useEffect(() => {
    fetch("/api/work-categories")
      .then((res) => res.json())
      .then((data: { defaultImage: string | null; categories: any[] }) => {
        if (data.defaultImage) setDefaultBgImage(data.defaultImage);
        if (Array.isArray(data.categories)) {
          setWorkCategories(
            data.categories
              .filter((c) => c.image) // only show categories that have an image set
              .map((c) => ({
                id: c.slug,
                title: c.title,
                slug: `/work/${c.slug}`,
                subtext: c.subtext
                  ? c.subtext
                      .split("\n")
                      .map((l: string) => l.trim())
                      .filter(Boolean)
                      .join("\n")
                  : "",
                image: c.image,
              })),
          );
        }
      })
      .catch(() => {
        // silently keep empty/fallback state
      });
  }, []);

  const handleCategoryHover = (newIdx: number) => {
    if (newIdx !== activeIdx) {
      setActiveIdx(newIdx);
    }
  };

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
      const boxHeight = (boxWidth * 9) / 16;
      return { boxWidth, boxHeight };
    };

    let { boxWidth, boxHeight } = updateDimensions();

    const handleResize = () => {
      const dims = updateDimensions();
      boxWidth = dims.boxWidth;
      boxHeight = dims.boxHeight;
    };

    window.addEventListener("resize", handleResize);

    let isRunning = false;

    const render = () => {
      if (targetPos.current && currentPos.current) {
        const ease = 0.14;
        const dx = targetPos.current.x - currentPos.current.x;
        const dy = targetPos.current.y - currentPos.current.y;

        currentPos.current.x += dx * ease;
        currentPos.current.y += dy * ease;

        const top = currentPos.current.y - boxHeight / 2;
        const left = currentPos.current.x - boxWidth / 2;

        if (hudFrameRef.current) {
          hudFrameRef.current.style.transform = `translate3d(${left}px, ${top}px, 0px)`;
          hudFrameRef.current.style.width = `${boxWidth}px`;
          hudFrameRef.current.style.height = `${boxHeight}px`;
        }

        if (spotlightInnerRef.current) {
          spotlightInnerRef.current.style.transform = `translate3d(${-left}px, ${-top}px, 0px)`;
        }

        if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
          animFrameId.current = requestAnimationFrame(render);
          return;
        }
      }

      isRunning = false;
      animFrameId.current = null;
    };

    const triggerRender = () => {
      if (!isRunning) {
        isRunning = true;
        animFrameId.current = requestAnimationFrame(render);
      }
    };

    // Attach trigger to window mousemove
    const onMove = () => triggerRender();
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        targetPos.current = { x, y };

        if (!currentPos.current) {
          currentPos.current = { x, y };
        }

        setIsHovered(true);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, {
      once: false,
    });
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };
    if (!currentPos.current) {
      currentPos.current = { x, y };
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };
    currentPos.current = { x, y };
    setIsHovered(true);
  };

  const topRowCategories = workCategories.slice(0, 4);
  const bottomRowCategories = workCategories.slice(4);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-[100dvh] w-full flex-col justify-center overflow-hidden bg-black px-4 pt-20 pb-20 uppercase selection:bg-white selection:text-black sm:px-8 sm:pt-24 sm:pb-24 md:px-16"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
            activeIdx === null ? "opacity-100" : "opacity-0"
          }`}
        >
          {isVideoUrl(defaultBgImage) ? (
            <video
              src={getOptimizedVideoUrl(defaultBgImage, { width: 1280 })}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${getOptimizedImageUrl(defaultBgImage, { width: 1920 })}')`,
              }}
            />
          )}
        </div>

        {workCategories.map((cat, index) => {
          const isActive = index === activeIdx;

          return (
            <div
              key={cat.id}
              className={`absolute inset-0 transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                isActive
                  ? "opacity-100 translate-x-0"
                  : activeIdx !== null && index < activeIdx
                    ? "-translate-x-full opacity-0"
                    : "translate-x-full opacity-0"
              }`}
            >
              {isVideoUrl(cat.image) ? (
                <video
                  src={getOptimizedVideoUrl(cat.image, { width: 1280 })}
                  autoPlay={isActive}
                  loop
                  muted
                  playsInline
                  preload={isActive ? "auto" : "none"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${getOptimizedImageUrl(cat.image, { width: 1920 })}')`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none" />

      {/* HUD Frame / Spotlight */}
      <div
        ref={hudFrameRef}
        className={`pointer-events-none absolute left-0 top-0 z-20 overflow-hidden rounded border border-white/20 transition-opacity duration-300 ease-out hidden md:block ${
          isHovered && currentPos.current ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          ref={spotlightInnerRef}
          className="absolute inset-0 h-screen w-screen"
        >
          <div
            className={`absolute inset-0 h-full w-full transition-opacity duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
              activeIdx === null ? "opacity-100" : "opacity-0"
            }`}
            style={{
              filter: "brightness(1.2) contrast(1.05)",
            }}
          >
            {isVideoUrl(defaultBgImage) ? (
              <video
                src={getOptimizedVideoUrl(defaultBgImage, { width: 1280 })}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${getOptimizedImageUrl(defaultBgImage, { width: 1920 })}')`,
                }}
              />
            )}
          </div>

          {workCategories.map((cat, index) => {
            const isActive = index === activeIdx;

            return (
              <div
                key={`spotlight-${cat.id}`}
                className={`absolute inset-0 h-full w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                  isActive
                    ? "opacity-100 translate-x-0"
                    : activeIdx !== null && index < activeIdx
                      ? "-translate-x-full opacity-0"
                      : "translate-x-full opacity-0"
                }`}
                style={{
                  filter: "brightness(1.2) contrast(1.05)",
                }}
              >
                {isVideoUrl(cat.image) ? (
                  <video
                    src={getOptimizedVideoUrl(cat.image, { width: 1280 })}
                    autoPlay={isActive}
                    loop
                    muted
                    playsInline
                    preload={isActive ? "auto" : "none"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${getOptimizedImageUrl(cat.image, { width: 1920 })}')`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute top-0 left-0 h-4 w-4 border-l-2 border-t-2 border-white z-10" />
        <div className="absolute top-0 right-0 h-4 w-4 border-r-2 border-t-2 border-white z-10" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-white z-10" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-white z-10" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative h-3 w-5">
            <div className="absolute top-0 left-0 h-1.5 w-1.5 border-l border-t border-white/70" />
            <div className="absolute bottom-0 right-0 h-1.5 w-1.5 border-r border-b border-white/70" />
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-white drop-shadow-md z-10">
          <span className="text-white/90">
            {activeIdx !== null ? "CLICK TO OPEN" : "HOVER CATEGORY"}
          </span>
        </div>
      </div>

      {/* Categories Layout Container */}
      <main className="relative z-30 flex w-full max-w-7xl mx-auto flex-col gap-6 sm:gap-8 my-auto text-slate-100">
        {/* MOBILE & TABLET (< lg): Centered Vertical Stack */}
        <div className="flex flex-col items-center justify-center text-center w-full gap-5 sm:gap-6 md:gap-8 lg:hidden py-4">
          {workCategories.map((item, index) => {
            const isSelected = activeIdx === index;

            return (
              <Link
                key={item.id}
                href={item.slug}
                onMouseEnter={() => handleCategoryHover(index)}
                onTouchStart={() => handleCategoryHover(index)}
                className="group flex flex-col items-center text-center py-2 sm:py-2.5 transition-transform duration-300"
              >
                <h2
                  className={`m-0 mb-1.5 sm:mb-2 p-0 text-center tracking-tight text-white drop-shadow-lg transition-all duration-500 ease-out ${
                    isSelected
                      ? "font-normal text-2xl sm:text-3xl md:text-4xl opacity-100"
                      : "font-extralight text-xl sm:text-2xl md:text-3xl opacity-40 hover:opacity-75 sm:opacity-50"
                  }`}
                  style={{
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                >
                  {item.title}
                </h2>

                <p
                  className={`m-0 p-0 text-center max-w-xs sm:max-w-sm whitespace-pre-line text-[9px] sm:text-[10px] font-semibold tracking-widest leading-relaxed text-slate-300 transition-all duration-500 ${
                    isSelected
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  {item.subtext}
                </p>
              </Link>
            );
          })}
        </div>

        {/* DESKTOP (≥ lg): Horizontal Rows with Spotlight */}
        <div className="hidden lg:flex lg:flex-col lg:gap-8 lg:w-full">
          {/* Top Row / Main Grid for Categories */}
          <div className="grid w-full grid-cols-4 items-start justify-items-center gap-8">
            {topRowCategories.map((item, index) => {
              const isSelected = activeIdx === index;

              return (
                <Link
                  key={item.id}
                  href={item.slug}
                  onMouseEnter={() => handleCategoryHover(index)}
                  onTouchStart={() => handleCategoryHover(index)}
                  className="group mx-auto flex w-full max-w-[18rem] min-w-0 flex-col items-start overflow-visible py-4 text-left transition-colors duration-300"
                >
                  <h2
                    className={`m-0 mb-3 min-h-[3.75rem] w-full origin-left break-words p-0 text-left text-4xl leading-[1.05] tracking-tight text-white drop-shadow-lg transition-all duration-500 ease-out ${
                      isSelected
                        ? "z-10 scale-110 font-normal opacity-100"
                        : "font-extralight opacity-40 hover:scale-105 hover:opacity-75"
                    }`}
                    style={{
                      fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    {item.title}
                  </h2>

                  <p
                    className={`m-0 min-h-[2.5rem] w-full whitespace-pre-line p-0 text-left text-[10px] font-semibold tracking-widest leading-relaxed text-slate-300 transition-all duration-500 ${
                      isSelected
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    {item.subtext}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Bottom Row: Additional Items (5+) */}
          {bottomRowCategories.length > 0 && (
            <div className="grid w-full grid-cols-2 items-start justify-items-center gap-16">
              {bottomRowCategories.map((item, idx) => {
                const globalIdx = idx + 4;
                const isSelected = activeIdx === globalIdx;

                return (
                  <Link
                    key={item.id}
                    href={item.slug}
                    onMouseEnter={() => handleCategoryHover(globalIdx)}
                    onTouchStart={() => handleCategoryHover(globalIdx)}
                    className="group mx-auto flex w-full max-w-[18rem] min-w-0 flex-col items-start overflow-visible py-4 text-left transition-colors duration-300"
                  >
                    <h2
                      className={`m-0 mb-3 min-h-[3.75rem] w-full origin-left break-words p-0 text-left text-4xl leading-[1.05] tracking-tight text-white drop-shadow-lg transition-all duration-500 ease-out ${
                        isSelected
                          ? "z-10 scale-110 font-normal opacity-100"
                          : "font-extralight opacity-40 hover:scale-105 hover:opacity-75"
                      }`}
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      {item.title}
                    </h2>

                    <p
                      className={`m-0 min-h-[2.5rem] w-full whitespace-pre-line p-0 text-left text-[10px] font-semibold tracking-widest leading-relaxed text-slate-300 transition-all duration-500 ${
                        isSelected
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2 pointer-events-none"
                      }`}
                    >
                      {item.subtext}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </section>
  );
}
