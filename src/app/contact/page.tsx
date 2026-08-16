"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const email = "nhujandongol@gmail.com";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId: number;

    const mouse = { x: width / 2, y: height / 2, active: false };

    // Clapperboard 3D / sticky physics state
    let currX = 0;
    let currY = 0;
    let currRotX = 0;
    let currRotY = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = Math.min(90, Math.floor((width * height) / 18000));
    const REPEL_RADIUS = 140;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      r: number;
    };

    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.2 + 0.4,
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // ── 1. Update & Draw Particles ──
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        p.vx += (p.baseX - p.x) * 0.0006;
        p.vy += (p.baseY - p.y) * 0.0006;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS) {
            const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
            p.vx += (dx / (dist || 1)) * force * 0.6;
            p.vy += (dy / (dist || 1)) * force * 0.6;
          }
        }

        p.vx *= 0.94;
        p.vy *= 0.94;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // ── 2. Clapperboard Magnetic Physics & 3D Tilt ──
      if (boardRef.current) {
        let targetX = 0;
        let targetY = 0;
        let targetRotX = 0;
        let targetRotY = 0;

        if (mouse.active) {
          const centerX = width / 2;
          const centerY = height / 2;
          const deltaX = mouse.x - centerX;
          const deltaY = mouse.y - centerY;

          // Sticky offset (capped for smooth tactile feel)
          targetX = Math.max(-45, Math.min(45, deltaX * 0.08));
          targetY = Math.max(-40, Math.min(40, deltaY * 0.08));

          // 3D tilt angles
          targetRotY = Math.max(-14, Math.min(14, (deltaX / width) * 28));
          targetRotX = Math.max(-14, Math.min(14, -(deltaY / height) * 28));
        }

        // Smooth spring interpolation (LERP)
        currX += (targetX - currX) * 0.08;
        currY += (targetY - currY) * 0.08;
        currRotX += (targetRotX - currRotX) * 0.08;
        currRotY += (targetRotY - currRotY) * 0.08;

        boardRef.current.style.transform = `perspective(1000px) translate3d(${currX.toFixed(2)}px, ${currY.toFixed(2)}px, 0) rotateX(${currRotX.toFixed(2)}deg) rotateY(${currRotY.toFixed(2)}deg)`;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen bg-black text-white flex flex-col items-center justify-center select-none px-4 overflow-hidden">
      {/* Interactive particle background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient center glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_65%)]" />

      {/* Center Composition */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Clapperboard Container with Magnetic Cursor Movement */}
        <div
          ref={boardRef}
          className="relative w-[320px] sm:w-[440px] md:w-[520px] aspect-[4/3] flex items-center justify-center will-change-transform transition-shadow duration-300"
        >
          <img
            src="/tv-dark.png"
            alt="Contact Visual"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          />

          {/* Centered Email & Feedback overlay */}
          <div className="absolute left-[53%] top-[69%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 w-[80%] max-w-[320px] sm:max-w-[400px]">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="group relative flex flex-col items-center justify-center cursor-pointer px-4 py-2 w-full"
            >
              <span className="font-mono text-xs sm:text-sm tracking-wider text-zinc-200 group-hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {email}
              </span>

              <span className="mt-1.5 sm:mt-2 h-[1px] w-full max-w-[260px] bg-zinc-600/60 group-hover:bg-zinc-300 transition-colors duration-300" />

              <span
                className={`mt-2 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] uppercase transition-all duration-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${copied
                  ? "text-white opacity-100 font-bold"
                  : "text-zinc-400 opacity-60 group-hover:opacity-100"
                  }`}
              >
                {copied ? "COPIED ✦" : "CLICK TO COPY"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}