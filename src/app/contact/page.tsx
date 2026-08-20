"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [catLoaded, setCatLoaded] = useState(false);
  const email = "nhujandongol@gmail.com";

  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const leftPupilRef = useRef<SVGGElement>(null);
  const rightPupilRef = useRef<SVGGElement>(null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCatLoaded(true);
    }, 100);

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const updatePupil = (
        eyeEl: SVGGElement | null,
        pupilEl: SVGGElement | null
      ) => {
        if (!eyeEl || !pupilEl) return;
        const rect = eyeEl.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Maximum pixel distance the pupil can shift inside the eye
        const maxRadius = 13;
        const moveRadius = Math.min(maxRadius, dist * 0.05);

        const angle = Math.atan2(dy, dx);
        const pupilX = Math.cos(angle) * moveRadius;
        const pupilY = Math.sin(angle) * moveRadius;

        pupilEl.style.transform = `translate3d(${pupilX.toFixed(2)}px, ${pupilY.toFixed(2)}px, 0)`;
      };

      updatePupil(leftEyeRef.current, leftPupilRef.current);
      updatePupil(rightEyeRef.current, rightPupilRef.current);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen bg-black text-white flex flex-col items-center justify-center select-none px-4 overflow-hidden">
      {/* Ambient center glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015),transparent_70%)]" />

      {/* Clickable Email in the middle */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <button
          type="button"
          onClick={handleCopyEmail}
          className="group relative flex flex-col items-center justify-center cursor-pointer px-4 py-2 transition-all duration-300"
        >
          <span className="font-mono text-xs sm:text-sm md:text-base tracking-widest text-zinc-300 group-hover:text-white transition-colors duration-300">
            {email}
          </span>

          <span className="mt-2 h-[1px] w-[250px] max-w-[80vw] bg-zinc-700 group-hover:bg-white transition-all duration-300" />

          <span
            className={`mt-2 font-mono text-[8px] sm:text-[9px] tracking-[0.2em] uppercase transition-all duration-300 ${copied
              ? "text-white opacity-100 font-semibold"
              : "text-zinc-500 opacity-50 group-hover:opacity-100"
              }`}
          >
            {copied ? "COPIED TO CLIPBOARD ✦" : "CLICK TO COPY"}
          </span>
        </button>
      </div>

      {/* Minimalist Peeking White Cat — pointed ears, cropped to ears + eyes */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none overflow-hidden">
        <div
          className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${catLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-[120%] opacity-0"
            }`}
        >
          <svg
            viewBox="0 0 400 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[220px] h-[95px] sm:w-[280px] sm:h-[121px] md:w-[330px] md:h-[143px] drop-shadow-[0_-4px_15px_rgba(255,255,255,0.08)]"
          >
            {/* Main White Cat Head Silhouette with pointed ears */}
            <path
              d="M 60 180
                 C 60 145, 66 118, 78 100
                 L 115 18
                 L 150 88
                 C 166 80, 234 80, 250 88
                 L 285 18
                 L 322 100
                 C 334 118, 340 145, 340 180
                 Z"
              fill="#FFFFFF"
            />

            {/* Left Eye Container */}
            <g ref={leftEyeRef}>
              {/* Eye socket */}
              <ellipse cx="140" cy="132" rx="26" ry="30" fill="#000000" />
              {/* Left Pupil */}
              <g ref={leftPupilRef} className="will-change-transform">
                <ellipse cx="140" cy="132" rx="11" ry="14" fill="#FFFFFF" />
              </g>
            </g>

            {/* Right Eye Container */}
            <g ref={rightEyeRef}>
              {/* Eye socket */}
              <ellipse cx="260" cy="132" rx="26" ry="30" fill="#000000" />
              {/* Right Pupil */}
              <g ref={rightPupilRef} className="will-change-transform">
                <ellipse cx="260" cy="132" rx="11" ry="14" fill="#FFFFFF" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </main>
  );
}