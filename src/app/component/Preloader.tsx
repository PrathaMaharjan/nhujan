"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/* --------------------------------------------------------
 * Replace with your own images. Keep the LAST one as the
 * shot that should become your homepage — ideally the
 * poster frame of your homepage showreel video, so the
 * zoom lands exactly where the real page picks up.
 * -------------------------------------------------------- */
const GALLERY_IMAGES: string[] = [
  "/preloader/still-1.jpg",
  "/preloader/still-2.jpg",
  "/preloader/still-3.jpg",
  "/preloader/still-4.jpg",
  "/preloader/still-5.jpg",
  "/preloader/still-6.jpg", // <- final "opens into homepage" shot
];

// Tripled so there's runway to scroll fast through a couple of
// loops before settling on the final copy's last image.
const LOOPED_IMAGES = [...GALLERY_IMAGES, ...GALLERY_IMAGES, ...GALLERY_IMAGES];
const TARGET_INDEX = LOOPED_IMAGES.length - 1;

type Phase = "counting" | "split" | "gallery" | "zoom" | "done";

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface PreloaderProps {
  children: React.ReactNode;
}

export default function Preloader({ children }: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>("counting");
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [skip, setSkip] = useState(false);
  const [galleryEntering, setGalleryEntering] = useState(false);
  const [zoomRect, setZoomRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null); // the h-screen viewport window
  const trackRef = useRef<HTMLDivElement>(null); // the scrolling column
  const targetRef = useRef<HTMLDivElement>(null); // the image we land on
  const rafRef = useRef<number | null>(null);

  // Plays once per browser session.
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("preloader-shown");
    if (alreadyShown) {
      setSkip(true);
      setVisible(false);
    }
  }, []);

  /* ---------------- COUNTING 0 -> 100 ---------------- */
  useEffect(() => {
    if (skip || phase !== "counting") return;

    if (percent >= 100) {
      const t = setTimeout(() => setPhase("split"), 350);
      return () => clearTimeout(t);
    }

    const speed = percent < 60 ? 14 : percent < 90 ? 26 : 45;
    const t = setTimeout(() => setPercent((p) => p + 1), speed);
    return () => clearTimeout(t);
  }, [percent, phase, skip]);

  /* ---------------- SPLIT -> GALLERY ---------------- */
  useEffect(() => {
    if (skip || phase !== "split") return;
    const t = setTimeout(() => setPhase("gallery"), 900);
    return () => clearTimeout(t);
  }, [phase, skip]);

  /* ---------------- GALLERY: enter from bottom, then fast scroll and decelerate ---------------- */
  useEffect(() => {
    if (skip || phase !== "gallery") return;

    const container = containerRef.current;
    const track = trackRef.current;
    const target = targetRef.current;
    if (!container || !track || !target) return;

    // 1. Trigger the "slide up from bottom" transition first
    setGalleryEntering(true);

    const containerHeight = container.clientHeight;
    const targetTop = target.offsetTop;
    const targetHeight = target.offsetHeight;
    const finalY = -(targetTop + targetHeight / 2 - containerHeight / 2);

    const duration = 2000;
    
    // 2. Delay the main scroll animation slightly so the entrance from below completes smoothly
    const startTimeout = setTimeout(() => {
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeOutExpo(t);
        track.style.transform = `translateY(${finalY * eased}px)`;

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setTimeout(() => setPhase("zoom"), 300);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 400); // 400ms entrance duration from below

    return () => {
      clearTimeout(startTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, skip]);

  /* ---------------- ZOOM: the landed image grows to fill the screen ---------------- */
  useEffect(() => {
    if (skip || phase !== "zoom") return;
    const target = targetRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    setZoomRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setZoomed(true));
      rafRef.current = raf2;
    });

    const t = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("preloader-shown", "1");
      setTimeout(() => setVisible(false), 500);
    }, 1000);

    return () => {
      cancelAnimationFrame(raf1);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(t);
    };
  }, [phase, skip]);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem("preloader-shown", "1");
    setPhase("done");
    setTimeout(() => setVisible(false), 400);
  }, []);

  return (
    <>
      {/* Real site renders underneath immediately */}
      {children}

      {visible && !skip && (
        <div
          className={`fixed inset-0 z-[999] bg-black overflow-hidden transition-opacity duration-500 ease-out ${
            phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* ---------------- CENTERED COUNTER TEXT & CAT ---------------- */}
          {(phase === "counting" || phase === "split") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 select-none">
              
              {/* CENTERED TEXT ROW */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 font-mono text-white text-xs sm:text-sm md:text-base tracking-[0.3em] text-center">
                <span
                  className={`transition-all duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                    phase === "split" ? "-translate-x-[70vw] opacity-0" : ""
                  }`}
                >
                  [ NHUJAN DONGOL ]
                </span>
                <span
                  className={`transition-all duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                    phase === "split" ? "translate-x-[70vw] opacity-0" : ""
                  }`}
                >
                  [ {String(percent).padStart(2, "0")} PERCENT ]
                </span>
              </div>

              {/* CENTERED CAT GIF CONTAINER */}
              <div
                className={`relative transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  phase === "split" ? "scale-95" : ""
                }`}
              >
                <img
                  src="/cat.gif"
                  alt="Running Cat"
                  className="w-36 md:w-48 h-auto pointer-events-none"
                  style={{
                    filter: "invert(1) grayscale(1) contrast(200%)",
                    mixBlendMode: "color-dodge",
                    clipPath: "inset(0 0 25% 0)",
                  }}
                />
                {/* Fades to black on top of the gif instead of fading the gif's own opacity */}
                <div
                  className={`absolute inset-0 bg-black transition-opacity duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                    phase === "split" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

            </div>
          )}

          {/* ---------------- SCROLLING GALLERY (SLIDES UP FROM BELOW) ---------------- */}
          {(phase === "gallery" || phase === "zoom") && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div
                ref={containerRef}
                className={`relative w-[320px] md:w-[480px] lg:w-[560px] h-screen overflow-hidden transition-all duration-700 cubic-bezier(0.16,1,0.3,1) ${
                  galleryEntering ? "translate-y-0 opacity-100" : "translate-y-[100vh] opacity-0"
                } ${zoomed ? "opacity-0" : ""}`}
              >
                <div
                  ref={trackRef}
                  className="flex flex-col gap-4"
                  style={{
                    paddingTop: "50vh",
                    paddingBottom: "50vh",
                    willChange: "transform",
                  }}
                >
                  {LOOPED_IMAGES.map((src, i) => (
                    <div
                      key={i}
                      ref={i === TARGET_INDEX ? targetRef : undefined}
                      className="w-full aspect-[16/10] flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- ZOOM CLONE ---------------- */}
          {phase === "zoom" && zoomRect && (
            <div
              className="fixed overflow-hidden z-10"
              style={{
                top: zoomed ? 0 : zoomRect.top,
                left: zoomed ? 0 : zoomRect.left,
                width: zoomed ? "100vw" : zoomRect.width,
                height: zoomed ? "100vh" : zoomRect.height,
                transition:
                  "top 900ms cubic-bezier(0.76,0,0.24,1), left 900ms cubic-bezier(0.76,0,0.24,1), width 900ms cubic-bezier(0.76,0,0.24,1), height 900ms cubic-bezier(0.76,0,0.24,1)",
              }}
            >
              <img
                src={GALLERY_IMAGES[GALLERY_IMAGES.length - 1]}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )}

          {/* ---------------- SKIP BUTTON ---------------- */}
          {phase !== "done" && (
            <button
              type="button"
              onClick={handleSkip}
              className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.25em] text-zinc-500 hover:text-white transition-colors z-20"
            >
              SKIP
            </button>
          )}
        </div>
      )}
    </>
  );
}