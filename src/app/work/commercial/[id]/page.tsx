"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Player from "@vimeo/player";

/* ─────────────────────────────────────────────
   PROJECT DATA
───────────────────────────────────────────── */

const PROJECT = {
  title: "Street Is Not A Home",
  category: "Commercial",
  director: "Nhujan Dongol",
  year: "2024",
  client: "City Foundation",
  vimeoId: "70591644",
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

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function ProjectDetailPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const vimeoContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!vimeoContainerRef.current) return;
    const player = new Player(vimeoContainerRef.current, {
      id: parseInt(PROJECT.vimeoId, 10),
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
      color: "ffffff",
      dnt: true,
    });
    playerRef.current = player;
    return () => { playerRef.current?.destroy().catch(() => { }); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const W = "w-full max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16";

  return (
    <div className="min-h-screen w-full bg-[#080808] text-white selection:bg-white selection:text-black overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          VIMEO — full bleed
      ══════════════════════════════════════════════ */}
      <section
        className={`relative w-full aspect-video bg-black overflow-hidden transition-opacity duration-700 ${revealed ? "opacity-100" : "opacity-0"}`}
        style={{ marginTop: "72px" }}
      >
        <div
          ref={vimeoContainerRef}
          className="absolute inset-0 w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
        />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
          TITLE + DESCRIPTION — two columns
      ══════════════════════════════════════════════ */}
      <div
        className={`${W} pt-10 pb-0 transition-all duration-700 delay-150 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        {/* thin top rule */}
        <div className="w-full h-[1px] bg-white/[0.07] mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 pb-12">
          {/* LEFT — title block */}
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="font-mono text-[9px] tracking-[0.4em] text-zinc-500 uppercase mb-4">
                {PROJECT.category} &nbsp;·&nbsp; {PROJECT.year}
              </p>
              <h1 className="font-sans font-black text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] tracking-tight text-white">
                {PROJECT.title}
              </h1>
            </div>


          </div>

          {/* RIGHT — description + quick meta */}
          <div className="flex flex-col gap-8 justify-center">
            <p className="font-sans text-[15px] leading-[1.75] text-zinc-400 max-w-prose">
              {PROJECT.description}
            </p>

            <div className="flex gap-10">
              {[
                { label: "Director", value: PROJECT.director },
                { label: "Client", value: PROJECT.client },
              ].map((m) => (
                <div key={m.label}>
                  <p className="font-mono text-[8px] tracking-[0.35em] text-zinc-600 uppercase mb-1.5">
                    {m.label}
                  </p>
                  <p className="font-sans text-sm font-medium text-zinc-200">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* thin bottom rule */}
        <div className="w-full h-[1px] bg-white/[0.05]" />
      </div>



      {/* thin rule */}
      <div className={`${W} transition-opacity duration-700 delay-300 ${revealed ? "opacity-100" : "opacity-0"}`}>
        <div className="w-full h-[1px] bg-white/[0.05]" />
      </div>


      <section className={`${W} pt-12 pb-32`}>
        {/* gallery header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 uppercase">
            Gallery
          </span>
          <div className="flex-1 h-[1px] bg-white/[0.04]" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">
            {PROJECT.gallery.length.toString().padStart(2, "0")}
          </span>
        </div>

        {/* editorial grid */}
        <div className="grid grid-cols-12 auto-rows-auto gap-2 sm:gap-3">

          {/* Row 1: cinescope banner */}
          <GalleryCell
            src={PROJECT.gallery[0].src}
            className="col-span-12"
            aspect="aspect-[21/8]"
            onClick={() => setLightbox(PROJECT.gallery[0].src)}
          />

          {/* Row 2: tall portrait left + two stacked right */}
          <GalleryCell
            src={PROJECT.gallery[1].src}
            className="col-span-12 md:col-span-5"
            aspect="aspect-[3/4]"
            onClick={() => setLightbox(PROJECT.gallery[1].src)}
          />
          <div className="col-span-12 md:col-span-7 flex flex-col gap-2 sm:gap-3">
            <GalleryCell
              src={PROJECT.gallery[2].src}
              className="w-full"
              aspect="aspect-[16/9]"
              onClick={() => setLightbox(PROJECT.gallery[2].src)}
            />
            <GalleryCell
              src={PROJECT.gallery[3].src}
              className="w-full"
              aspect="aspect-[16/9]"
              onClick={() => setLightbox(PROJECT.gallery[3].src)}
            />
          </div>

          {/* Row 3: wide + narrow */}
          <GalleryCell
            src={PROJECT.gallery[4].src}
            className="col-span-12 md:col-span-7"
            aspect="aspect-[16/9]"
            onClick={() => setLightbox(PROJECT.gallery[4].src)}
          />
          <GalleryCell
            src={PROJECT.gallery[5].src}
            className="col-span-12 md:col-span-5"
            aspect="aspect-[16/9]"
            onClick={() => setLightbox(PROJECT.gallery[5].src)}
          />

          {/* Row 4: narrow + wide */}
          <GalleryCell
            src={PROJECT.gallery[6].src}
            className="col-span-12 md:col-span-8"
            aspect="aspect-[16/9]"
            onClick={() => setLightbox(PROJECT.gallery[6].src)}
          />
          <GalleryCell
            src={PROJECT.gallery[7].src}
            className="col-span-12 md:col-span-4"
            aspect="aspect-[16/9]"
            onClick={() => setLightbox(PROJECT.gallery[7].src)}
          />

          {/* Row 5: closing cinescope */}
          <GalleryCell
            src={PROJECT.gallery[8].src}
            className="col-span-12"
            aspect="aspect-[21/8]"
            onClick={() => setLightbox(PROJECT.gallery[8].src)}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════ */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4 sm:p-10"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-7 font-mono text-[9px] tracking-[0.3em] text-white/40 hover:text-white uppercase transition-colors z-10 cursor-pointer"
          >
            Close [✕]
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   GALLERY CELL
───────────────────────────────────────────── */

function GalleryCell({
  src,
  className = "",
  aspect = "aspect-[16/9]",
  onClick,
}: {
  src: string;
  className?: string;
  aspect?: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`
        relative overflow-hidden group cursor-pointer bg-zinc-900
        ${aspect} ${className}
        transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
      `}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="
          w-full h-full object-cover
          transition-transform duration-700 ease-out
          group-hover:scale-[1.04]
          saturate-[0.8] group-hover:saturate-100
          brightness-[0.92] group-hover:brightness-100
        "
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      {/* expand hint */}
      <div className="
        absolute bottom-3 right-3 w-6 h-6
        border border-white/20 bg-black/30
        flex items-center justify-center
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        text-white/60 text-[9px] font-mono pointer-events-none
      ">↗</div>
    </button>
  );
}