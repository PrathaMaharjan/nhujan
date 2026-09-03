"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

type Phase = "counting" | "split" | "done";

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

  const overlayRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLSpanElement>(null);
  const rightTextRef = useRef<HTMLSpanElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const centerContentRef = useRef<HTMLDivElement>(null);

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
        gsap.delayedCall(0.12, () => setPhase("split"));
      },
    });

    return () => {
      tween.kill();
    };
  }, [phase, skip]);

  /* ---------------- LEFT/RIGHT SIMULTANEOUS SPLIT ANIMATION ---------------- */
  useEffect(() => {
    if (skip || phase !== "split") return;

    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const leftText = leftTextRef.current;
    const rightText = rightTextRef.current;
    const cat = catRef.current;
    const centerContent = centerContentRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("done");
        setVisible(false);
      },
    });

    // Screen curtains, text, and cat split simultaneously at time 0
    tl.to(
      leftPanel,
      { xPercent: -100, duration: 0.85, ease: "power4.inOut" },
      0
    )
      .to(
        rightPanel,
        { xPercent: 100, duration: 0.85, ease: "power4.inOut" },
        0
      )
      .to(
        leftText,
        { x: "-45vw", opacity: 0, duration: 0.85, ease: "power4.inOut" },
        0
      )
      .to(
        rightText,
        { x: "45vw", opacity: 0, duration: 0.85, ease: "power4.inOut" },
        0
      )
      .to(
        cat,
        { opacity: 0, scale: 0.8, duration: 0.35, ease: "power2.out" },
        0
      )
      .to(
        centerContent,
        { opacity: 0, duration: 0.2 },
        0.6
      );

    return () => {
      tl.kill();
    };
  }, [phase, skip]);

  const handleSkip = useCallback(() => {
    setSkip(true);
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const leftText = leftTextRef.current;
    const rightText = rightTextRef.current;
    const cat = catRef.current;
    const centerContent = centerContentRef.current;

    gsap.to([cat, centerContent], { opacity: 0, duration: 0.2 });
    gsap.to(leftText, { x: "-45vw", opacity: 0, duration: 0.5, ease: "power3.inOut" });
    gsap.to(rightText, { x: "45vw", opacity: 0, duration: 0.5, ease: "power3.inOut" });
    gsap.to([leftPanel, rightPanel], {
      xPercent: (i) => (i === 0 ? -100 : 100),
      duration: 0.5,
      ease: "power3.inOut",
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

      {visible && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[999] pointer-events-none select-none overflow-hidden"
        >
          {/* Left Half Curtain */}
          <div
            ref={leftPanelRef}
            className="absolute inset-y-0 left-0 w-[calc(50%+1px)] bg-[#0B0B0B] pointer-events-auto will-change-transform"
          />

          {/* Right Half Curtain */}
          <div
            ref={rightPanelRef}
            className="absolute inset-y-0 right-0 w-[calc(50%+1px)] bg-[#0B0B0B] pointer-events-auto will-change-transform"
          />

          {/* ---------------- CENTERED COUNTER TEXT & CAT ---------------- */}
          {phase !== "done" && (
            <div
              ref={centerContentRef}
              className="absolute inset-0 mt-52 flex flex-col items-center justify-center gap-8 select-none z-10 pointer-events-auto"
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 font-mono text-white text-xs sm:text-sm md:text-base tracking-[0.3em] text-center">
                <span ref={leftTextRef} className="inline-block whitespace-nowrap text-right will-change-transform">
                  [ NHUJAN DONGOL ]
                </span>
                <span ref={rightTextRef} className="inline-block whitespace-nowrap text-left will-change-transform">
                  [ {String(percent).padStart(2, "0")} PERCENT ]
                </span>
              </div>

              <div ref={catRef} className="relative flex justify-center items-center overflow-hidden will-change-transform">
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

          {/* ---------------- SKIP BUTTON ---------------- */}
          {phase !== "done" && (
            <button
              type="button"
              onClick={handleSkip}
              className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.25em] text-zinc-500 hover:text-white transition-colors z-30 pointer-events-auto cursor-pointer"
            >
              SKIP
            </button>
          )}
        </div>
      )}
    </>
  );
}