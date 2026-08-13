"use client";

import React, { useState, useEffect, useRef } from "react";
import Player from "@vimeo/player";

interface GalleryImage {
  id: number;
  src: string;
  colSpan: string; 
  aspectRatio?: string;
}

interface ProjectData {
  title: string;
  vimeoId: string;
  gallery: GalleryImage[];
}

const PROJECT: ProjectData = {
  title: "STREET IS NOT A HOME",
  vimeoId: "70591644", // Working public Vimeo placeholder ID
  gallery: [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop",
      colSpan: "col-span-12",
      aspectRatio: "aspect-[21/9]",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-6",
      aspectRatio: "aspect-[16/10]",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-6",
      aspectRatio: "aspect-[16/10]",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-4",
      aspectRatio: "aspect-[4/3]",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-4",
      aspectRatio: "aspect-[4/3]",
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-4",
      aspectRatio: "aspect-[4/3]",
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-8",
      aspectRatio: "aspect-[16/9]",
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop",
      colSpan: "col-span-12 md:col-span-4",
      aspectRatio: "aspect-[16/9]",
    },
  ],
};

export default function ProjectDetailPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const vimeoContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  // Initialize Vimeo Player SDK safely
  useEffect(() => {
    if (!vimeoContainerRef.current) return;

    const player = new Player(vimeoContainerRef.current, {
      id: parseInt(PROJECT.vimeoId, 10),
      responsive: true,
      title: false,       // Hides video title
      byline: false,      // Hides author line
      portrait: false,    // Hides author avatar
      color: "ffffff",    // Modern white controls accent
      dnt: true,
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-white selection:text-black flex flex-col items-center">
      
      {/* ==================================================
          MAIN CONTAINER WITH TOP PADDING
          ================================================== */}
      <main className="w-full max-w-[1450px] px-3 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-44 pb-24 flex flex-col gap-4 sm:gap-6">
        
        {/* ==================================================
            VIMEO SDK VIDEO PLAYER SECTION
            ================================================== */}
        <section className="w-full relative aspect-video bg-black overflow-hidden shadow-2xl flex items-center justify-center">
          <div 
            ref={vimeoContainerRef} 
            className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
          />
        </section>

        {/* ==================================================
            BENTO GALLERY SECTION (BOTTOM)
            ================================================== */}
        <section className="w-full">
          <div className="grid grid-cols-12 gap-3 sm:gap-4">
            {PROJECT.gallery.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`
                  relative
                  w-full
                  ${img.aspectRatio || "aspect-[16/9]"}
                  overflow-hidden
                  group
                  cursor-pointer
                  bg-neutral-900
                  ${img.colSpan}
                `}
              >
                <img
                  src={img.src}
                  alt=""
                  className="
                    w-full h-full object-cover
                    transition-transform duration-700 ease-out
                    group-hover:scale-105
                  "
                  draggable={false}
                />

                <div
                  className="
                    absolute inset-0 bg-black/0 group-hover:bg-black/20
                    transition-colors duration-300 ease-out
                  "
                />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ==================================================
          LIGHTBOX MODAL
          ================================================== */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-xs font-mono tracking-widest text-white/60 hover:text-white transition-colors uppercase z-10"
          >
            CLOSE [✕]
          </button>

          <img
            src={selectedImage.src}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}