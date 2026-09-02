"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/* --------------------------------------------------------
 * Fallback only — used if the DB fetch fails or returns
 * nothing yet. Real images come from /api/preloader.
 * -------------------------------------------------------- */
const FALLBACK_IMAGES: string[] = [
  "/preloader/still-1.jpg",
  "/preloader/still-2.jpg",
  "/preloader/still-3.jpg",
  "/preloader/still-4.jpg",
  "/preloader/still-5.jpg",
  "/preloader/still-6.jpg",
];

type Phase = "counting" | "split" | "gallery" | "zoom" | "done";

interface PreloaderProps {
  children: React.ReactNode;
}

export default function Preloader({ children }: PreloaderProps) {
  const pathname = usePathname();
  const isAdminOrLogin = pathname.startsWith("/admin") || pathname.startsWith("/login");

  const [phase, setPhase] = useState<Phase>("counting");
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [skip, setSkip] = useState(false);
  const [zoomRect, setZoomRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>(FALLBACK_IMAGES);

  const overlayRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLSpanElement>(null);
  const rightTextRef = useRef<HTMLSpanElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const zoomCloneRef = useRef<HTMLDivElement>(null);

  // Fetch real images in parallel with the counting animation.
  useEffect(() => {
    fetch("/api/preloader")
      .then((res) => res.json())
      .then((urls: string[]) => {
        if (Array.isArray(urls) && urls.length > 0) setGalleryImages(urls);
      })
      .catch(() => {
        // silently keep fallback images
      });
  }, []);

  const loopedImages = useMemo(
    () => [...galleryImages, ...galleryImages, ...galleryImages],
    [galleryImages]
  );
  const targetIndex = loopedImages.length - 1;

  /* ---------------- COUNTING 0 -> 100 (gsap tween, eased) ---------------- */
  useEffect(() => {
    if (skip || phase !== "counting") return;

    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: 100,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => setPercent(Math.round(counter.val)),
      onComplete: () => {
        gsap.delayedCall(0.15, () => setPhase("split"));
      },
    });

    return () => {
      tween.kill();
    };
  }, [phase, skip]);

  /* ---------------- SPLIT THEN FULL TOP-TO-BOTTOM SCROLL ---------------- */
  useEffect(() => {
    if (skip || phase !== "split") return;

    const container = containerRef.current;
    const track = trackRef.current;
    const target = targetRef.current;
    if (!container || !track || !target) return;

    const containerHeight = container.clientHeight;

    const targetTop = target.offsetTop;
    const targetHeight = target.offsetHeight;
    const finalY = -(targetTop + targetHeight / 2 - containerHeight / 2);

    gsap.set(container, { y: 0, opacity: 1 });
    gsap.set(track, { y: "100vh" });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(0.1, () => setPhase("zoom"));
      },
    });

    // 1. Text splits outward completely
    tl.to(
      leftTextRef.current,
      { xPercent: -140, opacity: 0, duration: 0.65, ease: "power4.inOut" },
      0
    )
      .to(
        rightTextRef.current,
        { xPercent: 140, opacity: 0, duration: 0.65, ease: "power4.inOut" },
        0
      )
      .to(
        catRef.current,
        { opacity: 0, scale: 0.92, duration: 0.5, ease: "power2.out" },
        0.05
      )
      // 2. Fast continuous scroll from above viewport down to target image
      .to(
        track,
        { y: finalY, duration: 3.0, ease: "power4.out" },
        0.55
      );

    return () => {
      tl.kill();
    };
  }, [phase, skip]);

  /* ---------------- ZOOM: landed image morphs to fill the screen ---------------- */
  useEffect(() => {
    if (skip || phase !== "zoom") return;
    const target = targetRef.current;
    const container = containerRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    setZoomRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

    const raf = requestAnimationFrame(() => {
      if (container) {
        gsap.to(container, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
      if (zoomCloneRef.current) {
        gsap.to(zoomCloneRef.current, {
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          duration: 0.8,
          ease: "power4.inOut",
        });
      }
    });

    const t = setTimeout(() => {
      setPhase("done");
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => setVisible(false),
      });
    }, 850);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [phase, skip]);

  const handleSkip = useCallback(() => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.out",
      onComplete: () => {
        setPhase("done");
        setVisible(false);
      },
    });
  }, []);

  if (isAdminOrLogin) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {visible && !skip && (
        <div ref={overlayRef} className="fixed inset-0 z-[999] bg-[#0B0B0B] overflow-hidden">
          {/* ---------------- CENTERED COUNTER TEXT & CAT ---------------- */}
          {(phase === "counting" || phase === "split") && (
            <div className="absolute inset-0 mt-52 flex flex-col items-center justify-center gap-8 select-none z-10">
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 font-mono text-white text-xs sm:text-sm md:text-base tracking-[0.3em] text-center">
                <span ref={leftTextRef} className="inline-block whitespace-nowrap text-right">
                  [ NHUJAN DONGOL ]
                </span>
                <span ref={rightTextRef} className="inline-block whitespace-nowrap text-left">
                  [ {String(percent).padStart(2, "0")} PERCENT ]
                </span>
              </div>

              <div ref={catRef} className="relative flex justify-center items-center overflow-hidden">
                <img
                  src="/cat.gif"
                  alt="Running Cat"
                  className="w-52 md:w-72 h-auto pointer-events-none"
                  style={{
                    mixBlendMode: "color-dodge",
                    filter: "invert(1) grayscale(1) contrast(500%)",
                    clipPath: "inset(0 0 22% 0)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ---------------- SCROLLING GALLERY ---------------- */}
          {(phase === "split" || phase === "gallery" || phase === "zoom") && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div
                ref={containerRef}
                className="relative w-[320px] md:w-[480px] lg:w-[560px] h-screen overflow-hidden"
              >
                <div
                  ref={trackRef}
                  className="flex flex-col gap-4"
                  style={{
                    paddingTop: 0,
                    paddingBottom: 0,
                    willChange: "transform",
                  }}
                >
                  {loopedImages.map((src, i) => (
                    <div
                      key={i}
                      ref={i === targetIndex ? targetRef : undefined}
                      className="w-full aspect-[16/10] flex-shrink-0 overflow-hidden"
                    >
                      {src ? <img src={src} alt="" className="w-full h-full object-cover" draggable={false} /> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- ZOOM CLONE ---------------- */}
          {phase === "zoom" && zoomRect && (
            <div
              ref={zoomCloneRef}
              className="fixed overflow-hidden z-20"
              style={{
                top: zoomRect.top,
                left: zoomRect.left,
                width: zoomRect.width,
                height: zoomRect.height,
              }}
            >
              {galleryImages[galleryImages.length - 1] ? (
                <img
                  src={galleryImages[galleryImages.length - 1]}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : null}
            </div>
          )}

          {/* ---------------- SKIP BUTTON ---------------- */}
          {phase !== "done" && (
            <button
              type="button"
              onClick={handleSkip}
              className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.25em] text-zinc-500 hover:text-white transition-colors z-30"
            >
              SKIP
            </button>
          )}
        </div>
      )}
    </>
  );
}