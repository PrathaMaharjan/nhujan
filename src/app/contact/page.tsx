"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [catLoaded, setCatLoaded] = useState(false);
  const [showMeow, setShowMeow] = useState(false);
  const email = "nhujandongol@gmail.com";

  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const leftPupilRef = useRef<SVGGElement>(null);
  const rightPupilRef = useRef<SVGGElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const playMeow = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Main tone
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";

    // Vibrato
    const vibrato = ctx.createOscillator();
    vibrato.type = "sine";
    vibrato.frequency.value = 7;
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 15;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // Formant-style bandpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 6;

    const gain = ctx.createGain();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Pitch contour
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.22);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.55);

    // Filter sweep
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.22);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.55);

    // Amplitude envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.08);
    gain.gain.setValueAtTime(0.3, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

    osc.start(now);
    vibrato.start(now);
    osc.stop(now + 0.6);
    vibrato.stop(now + 0.6);
  };

  const handleCatClick = () => {
    playMeow();
    setShowMeow(true);
    setTimeout(() => setShowMeow(false), 800);
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

        const maxRadius = 10;
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
    <main className="relative min-h-[100dvh] h-screen h-[100dvh] w-full bg-black text-white flex flex-col items-center justify-center select-none px-4 pt-16 pb-28 sm:pt-20 sm:pb-32 overflow-hidden">
      {/* Ambient center glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015),transparent_70%)]" />

      {/* Center Stack */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
        {/* Clickable Email */}
        <button
          type="button"
          onClick={handleCopyEmail}
          className="group relative flex flex-col items-center justify-center cursor-pointer px-3 py-2 transition-all duration-300 max-w-[95vw]"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="font-mono text-[11px] xs:text-xs sm:text-sm md:text-base tracking-wider sm:tracking-widest text-zinc-300 group-hover:text-white transition-colors duration-300 break-all sm:break-normal">
              {email}
            </span>

            {/* Clipboard Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-all duration-300 ${
                copied
                  ? "text-white scale-110"
                  : "text-zinc-500 group-hover:text-white"
              }`}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </div>

          <span className="mt-2 h-[1px] w-[250px] max-w-[80vw] bg-zinc-700 group-hover:bg-white transition-all duration-300" />

          {/* "COPIED" label */}
          <span
            className={`mt-2 font-mono text-[8px] sm:text-xs tracking-[0.2em] text-white/60 transition-all duration-300 ${
              copied
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
          >
            COPIED
          </span>
        </button>
      </div>

      {/* Minimalist Peeking Wireframe Cat Outline with White Eyes */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none overflow-hidden">
        <div
          className={`relative transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            catLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-[120%] opacity-0"
          }`}
        >
          {/* Meow speech bubble */}
          <span
            className={`pointer-events-none absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 font-mono text-[9px] sm:text-xs tracking-widest text-white transition-all duration-300 ${
              showMeow ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"
            }`}
          >
            meow
          </span>

          <svg
            viewBox="0 0 400 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleCatClick}
            className="pointer-events-auto cursor-pointer w-[190px] h-[82px] sm:w-[260px] sm:h-[112px] md:w-[330px] md:h-[143px] drop-shadow-[0_-4px_15px_rgba(255,255,255,0.08)]"
          >
            {/* Outline Cat Head Silhouette */}
            <path
              d="M 60 180
                 C 60 145, 66 118, 78 100
                 L 115 18
                 L 150 88
                 C 166 80, 234 80, 250 88
                 L 285 18
                 L 322 100
                 C 334 118, 340 180, 340 180"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Left Eye Container */}
            <g ref={leftEyeRef}>
              <ellipse cx="140" cy="132" rx="24" ry="28" fill="#FFFFFF" />
              <g ref={leftPupilRef} className="will-change-transform">
                <ellipse cx="140" cy="132" rx="10" ry="12" fill="#000000" />
              </g>
            </g>

            {/* Right Eye Container */}
            <g ref={rightEyeRef}>
              <ellipse cx="260" cy="132" rx="24" ry="28" fill="#FFFFFF" />
              <g ref={rightPupilRef} className="will-change-transform">
                <ellipse cx="260" cy="132" rx="10" ry="12" fill="#000000" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </main>
  );
}