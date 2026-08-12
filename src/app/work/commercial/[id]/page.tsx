"use client";

import React, { useRef, useState } from "react";

interface GalleryImage {
  id: number;
  src: string;
  colSpan: string; // Tailwind grid span
}

interface ProjectData {
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  gallery: GalleryImage[];
}

const PROJECT: ProjectData = {
  title: "STREET IS NOT A HOME",
  description:
    "A quiet study of displacement — two strangers cross paths on the same street over the course of a single night.",
  videoSrc: "/showreel/sample-5s.webm",
  posterSrc:
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop",
  gallery: [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop",
      colSpan: "col-span-12",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 sm:col-span-3",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 sm:col-span-3",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 sm:col-span-6",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 sm:col-span-6",
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 sm:col-span-3",
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
      colSpan: "col-span-12 sm:col-span-3",
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop",
      colSpan: "col-span-12",
    },
  ],
};

export default function ProjectDetailPage() {
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleVideoFullscreen = () => {
    const el = videoWrapRef.current;
    if (!el) return;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black flex flex-col">
      {/* ==================================================
          HERO SECTION
          ================================================== */}
      <section
        ref={videoWrapRef}
        onClick={handleVideoFullscreen}
        className="relative w-full h-screen overflow-hidden cursor-pointer group"
      >
        <video
          src={PROJECT.videoSrc}
          poster={PROJECT.posterSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div
          className="absolute inset-x-0 bottom-0 h-4/5 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 75%, #000000 100%)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 md:px-16 pb-10 md:pb-14 z-20">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] max-w-3xl">
            {PROJECT.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
            {PROJECT.description}
          </p>
        </div>
      </section>

      {/* ==================================================
          GALLERY
          ================================================== */}
      <section className="w-full bg-black px-3 sm:px-6 md:px-8 pt-8 pb-24">
        <div className="w-full grid grid-cols-12 gap-2 sm:gap-3">
          {PROJECT.gallery.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className={`
                relative
                w-full
                aspect-[16/9] sm:aspect-auto sm:h-[220px] md:h-[300px] lg:h-[380px]
                overflow-hidden
                rounded-none
                group
                cursor-pointer
                ${img.colSpan}
              `}
            >
              {/* Image with grayscale transition */}
              <img
                src={img.src}
                alt=""
                className="
                  w-full h-full object-cover
                  rounded-none
                  filter grayscale-0 group-hover:grayscale
                  transition-all duration-500 ease-out
                "
                draggable={false}
              />

              {/* Inset Border Frame Reveal */}
              <div
                className="
                  absolute inset-0 pointer-events-none 
                  border border-white/0 group-hover:border-white/40
                  scale-105 group-hover:scale-95
                  transition-all duration-500 ease-out
                "
              />

              {/* Subtle Dark Tint */}
              <div
                className="
                  absolute inset-0 bg-black/0 group-hover:bg-black/20
                  transition-colors duration-500 ease-out
                "
              />
            </button>
          ))}
        </div>
      </section>

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