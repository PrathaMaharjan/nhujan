"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const PROJECT = {
  title: "Equestrian Show",
  category: "Event Coverage",
  director: "Nhujan Dongol",
  year: "2024",
  client: "Grand Arena",
  heroImage:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop",
  description:
    "High energy documentation capturing movement, speed, and real-time passion. Filmed on location with multi-cam setup.",
  gallery: [
    { id: 1, src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop" },
    { id: 2, src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop" },
    { id: 3, src: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop" },
    { id: 4, src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop" },
    { id: 5, src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop" },
    { id: 6, src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop" },
    { id: 7, src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop" },
    { id: 8, src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop" },
    { id: 9, src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop" },
  ],
};

export default function EventCoverageDetailPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setInfoOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const W = "w-full max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16";

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* HERO — opening like TV slit */}
      <div
        className={`${W} pt-24 pb-24 sm:pt-28 flex justify-center items-center overflow-hidden`}
      >
        <section
          className={`relative w-full max-w-[1300px] mx-auto aspect-video bg-black overflow-hidden rounded-sm origin-center ${
            revealed ? "animate-slit-open" : "opacity-0"
          }`}
        >
          <img
            src={PROJECT.heroImage}
            alt={PROJECT.title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover saturate-[0.85] brightness-[0.9]"
          />

          {/* INFO TRIGGER */}
          <button
            onClick={() => setInfoOpen((v) => !v)}
            aria-label="Toggle project info"
            className={`
              absolute bottom-4 right-4 z-20
              w-9 h-9 rounded-full
              flex items-center justify-center
              border border-white/25 bg-black/40 backdrop-blur-md
              hover:bg-black/60 hover:border-white/50
              transition-all duration-300
              ${infoOpen ? "bg-white text-black border-white" : "text-white"}
            `}
          >
            <span className="font-mono text-[13px] font-medium">
              {infoOpen ? "✕" : "i"}
            </span>
          </button>

          {/* INFO PANEL */}
          <div
            className={`
              absolute inset-0 z-10
              flex items-end
              transition-opacity duration-500 ease-out
              ${infoOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setInfoOpen(false)}
            />

            <div
              className={`
                relative z-10 w-full p-6 sm:p-10
                transition-all duration-500 ease-out
                ${infoOpen ? "translate-y-0" : "translate-y-4"}
              `}
            >
              <p className="font-mono text-[9px] tracking-[0.4em] text-zinc-400 uppercase mb-3">
                {PROJECT.category} &nbsp;·&nbsp; {PROJECT.year}
              </p>
              <h2 className="font-sans font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-[1] tracking-tight text-white mb-5">
                {PROJECT.title}
              </h2>
              <p className="font-sans text-[14px] leading-[1.75] text-zinc-300 max-w-2xl mb-6">
                {PROJECT.description}
              </p>

              <div className="flex flex-wrap gap-x-10 gap-y-4">
                {[
                  { label: "Director", value: PROJECT.director },
                  { label: "Client", value: PROJECT.client },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="font-mono text-[8px] tracking-[0.35em] text-zinc-500 uppercase mb-1">
                      {m.label}
                    </p>
                    <p className="font-sans text-[13px] font-medium text-zinc-100">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* GALLERY */}
      <section className={`${W} pb-32`}>
        <div className="mb-12">
          <h2 className="font-sans font-black text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight text-white uppercase">
            Gallery
          </h2>
          <div className="w-full h-[1px] bg-white/[0.08] mt-6" />
        </div>

        <div className="grid grid-cols-12 auto-rows-auto gap-2 sm:gap-3">
          <GalleryCell src={PROJECT.gallery[0].src} index={0} className="col-span-12" aspect="aspect-[21/8]" onClick={() => setLightbox(PROJECT.gallery[0].src)} />
          <GalleryCell src={PROJECT.gallery[1].src} index={1} className="col-span-12 md:col-span-5" aspect="aspect-[3/4]" onClick={() => setLightbox(PROJECT.gallery[1].src)} />
          <div className="col-span-12 md:col-span-7 flex flex-col gap-2 sm:gap-3">
            <GalleryCell src={PROJECT.gallery[2].src} index={2} className="w-full" aspect="aspect-[16/9]" onClick={() => setLightbox(PROJECT.gallery[2].src)} />
            <GalleryCell src={PROJECT.gallery[3].src} index={3} className="w-full" aspect="aspect-[16/9]" onClick={() => setLightbox(PROJECT.gallery[3].src)} />
          </div>
          <GalleryCell src={PROJECT.gallery[4].src} index={4} className="col-span-12 md:col-span-7" aspect="aspect-[16/9]" onClick={() => setLightbox(PROJECT.gallery[4].src)} />
          <GalleryCell src={PROJECT.gallery[5].src} index={5} className="col-span-12 md:col-span-5" aspect="aspect-[16/9]" onClick={() => setLightbox(PROJECT.gallery[5].src)} />
          <GalleryCell src={PROJECT.gallery[6].src} index={6} className="col-span-12 md:col-span-8" aspect="aspect-[16/9]" onClick={() => setLightbox(PROJECT.gallery[6].src)} />
          <GalleryCell src={PROJECT.gallery[7].src} index={7} className="col-span-12 md:col-span-4" aspect="aspect-[16/9]" onClick={() => setLightbox(PROJECT.gallery[7].src)} />
          <GalleryCell src={PROJECT.gallery[8].src} index={8} className="col-span-12" aspect="aspect-[21/8]" onClick={() => setLightbox(PROJECT.gallery[8].src)} />
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4 sm:p-10" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-7 font-mono text-[9px] tracking-[0.3em] text-white/40 hover:text-white uppercase transition-colors z-10 cursor-pointer">
            Close [✕]
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} draggable={false} />
        </div>
      )}
    </div>
  );
}

function GalleryCell({
  src,
  className = "",
  aspect = "aspect-[16/9]",
  index = 0,
  onClick,
}: {
  src: string;
  className?: string;
  aspect?: string;
  index?: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{
        transitionDelay: visible ? `${(index % 4) * 90}ms` : "0ms",
      }}
      className={`relative overflow-hidden group cursor-pointer bg-zinc-900 ${aspect} ${className} transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-[0.97]"
      }`}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] saturate-[0.8] group-hover:saturate-100 brightness-[0.92] group-hover:brightness-100"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border border-white/20 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/60 text-[9px] font-mono pointer-events-none">↗</div>
    </button>
  );
}