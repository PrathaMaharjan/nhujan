'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { isVideoUrl } from '@/lib/media';

interface WorkCategory {
  id: string;
  title: string;
  slug: string;
  subtext: string;
  image: string;
}

const FALLBACK_DEFAULT_BG =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop';

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
    fetch('/api/work-categories')
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
                    .split('\n')
                    .map((l: string) => l.trim())
                    .filter(Boolean)
                    .join('\n')
                  : '',
                image: c.image,
              }))
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
    const boxWidth = 384;
    const boxHeight = 216;

    const render = () => {
      if (targetPos.current && currentPos.current) {
        const ease = 0.12;
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

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
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
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

    window.addEventListener('mousemove', handleGlobalMouseMove, { once: false });
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
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

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-black px-6 uppercase selection:bg-white selection:text-black md:px-16"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${activeIdx === null ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {isVideoUrl(defaultBgImage) ? (
            <video
              src={defaultBgImage}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${defaultBgImage}')` }}
            />
          )}
        </div>

        {workCategories.map((cat, index) => {
          const isActive = index === activeIdx;

          return (
            <div
              key={cat.id}
              className={`absolute inset-0 transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${isActive
                ? 'opacity-100 translate-x-0'
                : activeIdx !== null && index < activeIdx
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
                }`}
            >
              {isVideoUrl(cat.image) ? (
                <video
                  src={cat.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none" />

      <div
        ref={hudFrameRef}
        className={`pointer-events-none absolute left-0 top-0 z-20 overflow-hidden rounded border border-white/20 transition-opacity duration-300 ease-out ${isHovered && currentPos.current ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <div ref={spotlightInnerRef} className="absolute inset-0 h-screen w-screen">
          <div
            className={`absolute inset-0 h-full w-full transition-opacity duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${activeIdx === null ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              filter: 'brightness(1.2) contrast(1.05)',
            }}
          >
            {isVideoUrl(defaultBgImage) ? (
              <video
                src={defaultBgImage}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${defaultBgImage}')` }}
              />
            )}
          </div>

          {workCategories.map((cat, index) => {
            const isActive = index === activeIdx;

            return (
              <div
                key={`spotlight-${cat.id}`}
                className={`absolute inset-0 h-full w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${isActive
                  ? 'opacity-100 translate-x-0'
                  : activeIdx !== null && index < activeIdx
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                  }`}
                style={{
                  filter: 'brightness(1.2) contrast(1.05)',
                }}
              >
                {isVideoUrl(cat.image) ? (
                  <video
                    src={cat.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${cat.image}')` }}
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
            {activeIdx !== null ? 'CLICK TO OPEN' : 'HOVER CATEGORY'}
          </span>
        </div>
      </div>

      <main className="relative z-30 flex w-full max-w-7xl mx-auto items-center justify-between px-4 text-slate-100">
        {workCategories.map((item, index) => {
          const isSelected = activeIdx === index;

          return (
            <Link
              key={item.id}
              href={item.slug}
              onMouseEnter={() => handleCategoryHover(index)}
              className="group flex flex-col items-start text-left py-8"
            >
              <h2
                className={`m-0 mb-3 p-0 text-left tracking-tight text-white drop-shadow-lg transition-all duration-500 ease-out ${isSelected
                  ? 'font-normal text-3xl md:text-4xl lg:text-5xl opacity-100'
                  : 'font-extralight text-2xl md:text-3xl lg:text-4xl opacity-40 hover:opacity-75'
                  }`}
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {item.title}
              </h2>

              <p
                className={`m-1 p-0 text-left w-full whitespace-pre-line text-[9px] font-semibold tracking-widest leading-relaxed text-slate-300 transition-all duration-500 ${isSelected
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
              >
                {item.subtext}
              </p>
            </Link>
          );
        })}
      </main>
    </section>
  );
}
