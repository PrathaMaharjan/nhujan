"use client";

import React, { useState } from "react";
import Link from "next/link";

interface GalleryItem {
  id: number;
  title: string;
  image: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "KATHAK DANCE",
    image:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "TAJ MAHAL",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "HAWA MAHAL",
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "GOLDEN TEMPLE",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "ROYAL PALACE",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "DESERT DUNES",
    image:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function ProjectDetailPage() {
  const placeholderVimeoId = "76979871";
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black flex flex-col overflow-x-hidden select-none">
      {/* Header */}
      <header className="w-full px-6 md:px-12 py-8 flex items-center justify-between sticky top-0 bg-gradient-to-b from-black via-black/90 to-transparent z-30">
        <Link
          href="/work/commercial"
          className="text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors uppercase flex items-center gap-2"
        >
          <span>←</span> BACK
        </Link>

        <h1
          className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase text-white"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          NHUJAN
        </h1>

        <div className="w-12" />
      </header>

      {/* Main Container */}
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 md:px-12 pt-4 pb-32 flex flex-col items-center gap-8">
        {/* Video Player */}
        <section className="relative w-full aspect-video bg-black overflow-hidden shadow-2xl border border-white/10">
          <iframe
            src={`https://player.vimeo.com/video/${placeholderVimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
            className="relative w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </section>

        {/* 3-Column Grid Gallery */}
        <section className="w-full pt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-1.5 md:gap-2">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-neutral-900"
            >
              {/* Image with subtle hover zoom */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </section>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-8 right-8 text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors uppercase z-10"
          >
            CLOSE [✕]
          </button>

          <div
            className="relative max-w-5xl max-h-[80vh] w-full h-full flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="max-w-full max-h-[75vh] object-contain border border-white/10 shadow-2xl rounded-sm"
            />
            <p className="text-xs font-mono tracking-[0.3em] text-slate-300 uppercase">
              {selectedItem.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}