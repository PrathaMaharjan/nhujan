'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

interface WorkCategory {
  id: string;
  title: string;
  slug: string;
  subtext: string;
  image: string;
}

export default function WorkSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hudFrameRef = useRef<HTMLDivElement>(null);
  const spotlightInnerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  const defaultBgImage =
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop';

  const workCategories: WorkCategory[] = [
    {
      id: 'commercial',
      title: 'Commercial',
      slug: '/work/commercial',
      subtext: 'NARRATIVE\nDOCUMENTARY\nSHORT FILMS',
      image:
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop',
    },
    {
      id: 'music-videos',
      title: 'Music Video',
      slug: '/work/music-videos',
      subtext: 'BRAND CAMPAIGNS\nAUTOMOTIVE\nFASHION & EDITORIAL',
      image:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop',
    },
    {
      id: 'Film',
      title: 'FILM',
      slug: '/work/film',
      subtext: 'VISUAL CONCEPTS\nLIVE SESSIONS\nPERFORMANCE',
      image:
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000&auto=format&fit=crop',
    },
    {
      id: 'event-coverage',
      title: 'Event Coverage',
      slug: '/work/event-coverage',
      subtext: 'REPRESENTATION\nSTUDIO DIRECT\nAVAILABILITY',
      image:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop',
    },
  ];

  const handleCategoryHover = (newIdx: number) => {
    if (newIdx !== activeIdx) {
      setActiveIdx(newIdx);
    }
  };

  useEffect(() => {
    const boxWidth = 384;
    const boxHeight = 216;

    const render = () => {
      // Increased ease (0.08) makes mouse tracking noticeably faster while keeping smooth interpolation
      const ease = 0.08;
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

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
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
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeIdx === null ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${defaultBgImage}')` }}
        />

        {workCategories.map((cat, index) => {
          const isActive = index === activeIdx;

          return (
            <div
              key={cat.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive
                  ? 'opacity-100 translate-x-0'
                  : activeIdx !== null && index < activeIdx
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
              }`}
              style={{ backgroundImage: `url('${cat.image}')` }}
            />
          );
        })}
      </div>

      {/* 2. Global Dark Overlay */}
      <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none" />

     
      <div
        ref={hudFrameRef}
        className={`pointer-events-none absolute left-0 top-0 z-20 overflow-hidden rounded border border-white/20 transition-opacity duration-300 ease-out ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          ref={spotlightInnerRef}
          className="absolute inset-0 h-screen w-screen"
        >
          <div
            className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeIdx === null ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('${defaultBgImage}')`,
              filter: 'brightness(1.2) contrast(1.05)',
            }}
          />

          {workCategories.map((cat, index) => {
            const isActive = index === activeIdx;

            return (
              <div
                key={`spotlight-${cat.id}`}
                className={`absolute inset-0 h-full w-full bg-cover bg-center transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive
                    ? 'opacity-100 translate-x-0'
                    : activeIdx !== null && index < activeIdx
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }`}
                style={{
                  backgroundImage: `url('${cat.image}')`,
                  filter: 'brightness(1.2) contrast(1.05)',
                }}
              />
            );
          })}
        </div>

        {/* Reticle Brackets */}
        <div className="absolute top-0 left-0 h-4 w-4 border-l-2 border-t-2 border-white z-10" />
        <div className="absolute top-0 right-0 h-4 w-4 border-r-2 border-t-2 border-white z-10" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-white z-10" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-white z-10" />

        {/* Center Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative h-3 w-5">
            <div className="absolute top-0 left-0 h-1.5 w-1.5 border-l border-t border-white/70" />
            <div className="absolute bottom-0 right-0 h-1.5 w-1.5 border-r border-b border-white/70" />
          </div>
        </div>

        {/* HUD Headers */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-white drop-shadow-md z-10">
          <span className="flex items-center gap-1.5 text-[#FF2A2A] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A2A] animate-pulse" />
            REC
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-white drop-shadow-md z-10">
          <span className="text-white/90">
            {activeIdx !== null ? 'CLICK TO OPEN' : 'HOVER CATEGORY'}
          </span>
          <span>RAW 4K</span>
        </div>
      </div>

      {/* 4. Interactive Category Navigation */}
      <main className="relative z-30 flex w-full max-w-7xl mx-auto items-center justify-between px-4 text-slate-100">
        {workCategories.map((item, index) => {
          const isSelected = activeIdx === index;

          return (
            <Link
              key={item.id}
              href={item.slug}
              onMouseEnter={() => handleCategoryHover(index)}
              className="group flex flex-col items-center text-center py-8"
            >
              <h2
                className={`mb-4 tracking-tighter text-white drop-shadow-lg transition-all duration-500 ease-out ${
                  isSelected
                    ? 'scale-110 font-normal text-3xl md:text-4xl lg:text-5xl opacity-100'
                    : 'scale-75 font-extralight text-xl md:text-2xl lg:text-3xl opacity-50 hover:opacity-80'
                }`}
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {item.title}
              </h2>

              <p
                className={`whitespace-pre-line text-[9px] font-semibold tracking-widest leading-relaxed text-slate-300 transition-all duration-500 ${
                  isSelected
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