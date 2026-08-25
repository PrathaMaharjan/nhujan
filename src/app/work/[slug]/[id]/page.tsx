"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface GalleryItem {
  id: string;
  imageUrl: string;
  colSpan?: string;
  aspectRatio?: string;
}

interface ProjectData {
  id: string;
  title: string;
  categorySlug: string;
  categoryLabel?: string;
  director?: string;
  year?: string;
  client?: string;
  description?: string;
  vimeoId?: string;
  heroImageUrl?: string;
  thumbnailUrl?: string;
  gifUrl?: string;
  gallery: GalleryItem[];
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  const { slug, id } = params;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/work-projects/detail/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProject(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 80);
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

  if (loading) {
    return <div className="min-h-screen w-full bg-black" />;
  }

  if (!project) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xs tracking-[0.3em] text-white/40 uppercase">Project not found</p>
        <Link
          href={`/work/${slug || ""}`}
          className="text-xs tracking-[0.2em] text-white underline hover:text-white/70 transition"
        >
          BACK TO WORK
        </Link>
      </div>
    );
  }

  const heroImage =
    project.heroImageUrl || project.thumbnailUrl || project.gifUrl || "/placeholder.jpg";

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* HERO SECTION */}
      <div
        className={`${W} pt-10 pb-0 flex justify-center items-center overflow-hidden`}
        style={{ minHeight: "100vh" }}
      >
        <section
          className={`relative w-full max-w-[1300px] mx-auto aspect-video max-h-[96vh] bg-black overflow-hidden rounded-sm origin-center ${
            revealed ? "animate-slit-open" : "opacity-0"
          }`}
        >
          {/* Vimeo Video or Base Image */}
          {project.vimeoId ? (
            <div className="absolute inset-0 w-full h-full">
              <iframe
                src={`https://player.vimeo.com/video/${project.vimeoId}?autoplay=1&muted=1&loop=1&autopause=0&background=0&title=0&byline=0&portrait=0`}
                className="w-full h-full object-cover border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={project.title}
              />
            </div>
          ) : (
            <img
              src={heroImage}
              alt={project.title}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover saturate-[0.85] brightness-[0.9]"
            />
          )}

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
              className={`w-full max-w-3xl pointer-events-auto transition-all duration-1000 ease-out ${
                showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              {(project.categoryLabel || project.year) && (
                <p
                  className={`font-mono text-[9px] tracking-[0.4em] text-zinc-400 uppercase mb-3 transition-all duration-1000 delay-100 ease-out ${
                    showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  {project.categoryLabel} {project.categoryLabel && project.year && " · "} {project.year}
                </p>
              )}
              <h1
                className={`font-sans font-black text-[clamp(1.8rem,4vw,3rem)] leading-[1] tracking-tight text-white mb-4 transition-all duration-1000 delay-200 ease-out ${
                  showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {project.title}
              </h1>
              {project.description && (
                <p
                  className={`font-sans text-[13px] sm:text-[14px] leading-[1.7] text-zinc-300 max-w-2xl mb-6 font-normal transition-all duration-1000 delay-300 ease-out ${
                    showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  {project.description}
                </p>
              )}

              {(project.director || project.client) && (
                <div
                  className={`flex flex-wrap gap-x-12 gap-y-4 transition-all duration-1000 delay-500 ease-out ${
                    showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  {project.director && (
                    <div>
                      <p className="font-mono text-[8px] tracking-[0.35em] text-zinc-500 uppercase mb-1">
                        Director
                      </p>
                      <p className="font-sans text-[13px] font-medium text-zinc-100">
                        {project.director}
                      </p>
                    </div>
                  )}
                  {project.client && (
                    <div>
                      <p className="font-mono text-[8px] tracking-[0.35em] text-zinc-500 uppercase mb-1">
                        Client
                      </p>
                      <p className="font-sans text-[13px] font-medium text-zinc-100">
                        {project.client}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* BENTO BOX GALLERY */}
      {project.gallery && project.gallery.length > 0 && (
        <section className={`${W} pb-32 pt-12`}>
          <div className="w-full h-[1px] bg-white/[0.08] mb-8" />

          <div className="grid grid-cols-12 auto-rows-auto gap-2 sm:gap-3">
            {project.gallery.map((item, index) => {
              const colClass = item.colSpan || "col-span-12 md:col-span-6";
              const aspectClass = item.aspectRatio || "aspect-[16/9]";

              return (
                <GalleryCell
                  key={item.id}
                  src={item.imageUrl}
                  index={index}
                  className={colClass}
                  aspect={aspectClass}
                  onClick={() => setLightbox(item.imageUrl)}
                />
              );
            })}
          </div>

          <div className="w-full h-[1px] bg-white/[0.08] mt-16" />
        </section>
      )}

      {/* LIGHTBOX MODAL */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white font-mono text-sm tracking-widest uppercase transition"
          >
            ✕ CLOSE
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
          <span className="absolute inset-0 bg-white rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out pointer-events-none" />
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
  index,
  className = "",
  aspect = "aspect-[16/9]",
  onClick,
}: {
  src: string;
  index: number;
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{ transitionDelay: visible ? `${(index % 4) * 90}ms` : "0ms" }}
      className={`relative overflow-hidden group cursor-pointer bg-zinc-900 ${aspect} ${className} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.97]"
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
