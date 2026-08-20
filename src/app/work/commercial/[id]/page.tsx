"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Player from "@vimeo/player";

const PROJECT = {
  title: "Street Is Not A Home",
  category: "Commercial",
  director: "Nhujan Dongol",
  year: "2024",
  client: "City Foundation",
  vimeoId: "70591644",
  heroImage:
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000&auto=format&fit=crop",
  description:
    "A raw, immersive portrait of displacement and urban solitude. Shot across three cities over four weeks, the film documents the invisible lives that exist in the margins of metropolitan density. Every frame is an act of witness.",
  credits: [
    { role: "Director", name: "Nhujan Dongol" },
    { role: "DOP", name: "Arun Shrestha" },
    { role: "Edit", name: "Nhujan Dongol" },
    { role: "Color", name: "Sagar Rai" },
    { role: "Sound", name: "Priya Tamang" },
    { role: "Production", name: "NHUJAN FILMS" },
  ],
  gallery: [
    { id: 1, src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop" },
    { id: 2, src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop" },
    { id: 3, src: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop" },
    { id: 4, src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop" },
    { id: 5, src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop" },
    { id: 6, src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop" },
    { id: 7, src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop" },
    { id: 8, src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop" },
    { id: 9, src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop" },
  ],
};

export default function ProjectDetailPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    // Reveal hero image slit animation first
    const t1 = setTimeout(() => setRevealed(true), 80);
    // Delay text entrance so image opens before title & description arise
    const t2 = setTimeout(() => setShowContent(true), 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const W = "w-full max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16";

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* HERO */}
      <div
        className={`${W} pt-10 pb-0 flex justify-center items-center overflow-hidden`}
        style={{ minHeight: "100vh" }}
      >
        <section
          className={`relative w-full max-w-[1300px] mx-auto aspect-video max-h-[96vh] bg-black overflow-hidden rounded-sm origin-center ${revealed ? "animate-slit-open" : "opacity-0"
            }`}
        >
          {/* Base Image */}
          <img
            src={PROJECT.heroImage}
            alt={PROJECT.title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover saturate-[0.85] brightness-[0.9]"
          />

          {/* INTENSIFIED MULTI-LAYER BOTTOM-ONLY BLUR */}
          <div
            className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none backdrop-blur-[64px]"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 15%, rgba(0,0,0,0.5) 45%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 15%, rgba(0,0,0,0.5) 45%, black 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none backdrop-blur-[40px]"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 40%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 40%, black 100%)",
            }}
          />

          {/* Darkening Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* ANIMATED INFO PANEL */}
          <div className="absolute inset-0 z-10 flex items-end p-6 sm:p-12 pointer-events-none">
            <div
              className={`w-full max-w-3xl pointer-events-auto transition-all duration-1000 ease-out ${showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
                }`}
            >
              <p
                className={`font-mono text-[9px] tracking-[0.4em] text-zinc-400 uppercase mb-3 transition-all duration-1000 delay-100 ease-out ${showContent
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                  }`}
              >
                {PROJECT.category} &nbsp;·&nbsp; {PROJECT.year}
              </p>
              <h2
                className={`font-sans font-black text-[clamp(1.8rem,4vw,3rem)] leading-[1] tracking-tight text-white mb-4 transition-all duration-1000 delay-200 ease-out ${showContent
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }`}
              >
                {PROJECT.title}
              </h2>
              <p
                className={`font-sans text-[13px] sm:text-[14px] leading-[1.7] text-zinc-300 max-w-2xl mb-6 font-normal transition-all duration-1000 delay-300 ease-out ${showContent
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }`}
              >
                {PROJECT.description}
              </p>

              <div
                className={`flex flex-wrap gap-x-12 gap-y-4 transition-all duration-1000 delay-500 ease-out ${showContent
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }`}
              >
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
      <section className={`${W} pb-32 pt-12`}>
        <div className="w-full h-[1px] bg-white/[0.08] mb-8" />

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

        <div className="w-full h-[1px] bg-white/[0.08] mt-16" />
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4 sm:p-10" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-7 font-mono text-[9px] tracking-[0.3em] text-white/40 hover:text-white uppercase transition-colors z-10 cursor-pointer">
            Close [✕]
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} draggable={false} />
        </div>
      )}

      {/* CENTERED WHITE FILL-UP BACK TO TOP BUTTON */}
      <div className="fixed bottom-8 left-0 right-0 z-[80] flex justify-center pointer-events-none">
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className={`
            relative group overflow-hidden
            w-12 h-12 rounded-full
            flex items-center justify-center
            border border-white/20 bg-black/60 backdrop-blur-md
            transition-all duration-500 ease-out
            cursor-pointer
            ${showTopBtn ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
          `}
        >
          {/* Bottom-to-top slow pure white fill overlay */}
          <span className="absolute inset-0 bg-white rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out pointer-events-none" />

          {/* Arrow Icon */}
          <span className="relative z-10 font-mono text-[16px] text-zinc-300 group-hover:text-black transition-colors duration-500">
            ↑
          </span>
        </button>
      </div>
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
      style={{ transitionDelay: visible ? `${(index % 4) * 90}ms` : "0ms" }}
      className={`relative overflow-hidden group cursor-pointer bg-zinc-900 ${aspect} ${className} transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.97]"
        }`}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] saturate-[0.8] group-hover:saturate-100 brightness-[0.92] group-hover:brightness-100"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border border-white/20 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/60 text-[9px] font-mono pointer-events-none">
        ↗
      </div>
    </button>
  );
}