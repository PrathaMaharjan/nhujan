"use client";

import FullscreenVideo from "@/app/component/FullscreenVideo";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [videoTime, setVideoTime] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(true);

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  const [mouseInside, setMouseInside] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  /*
   * -------------------------------------------------------
   * MOUSE
   * -------------------------------------------------------
   */

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /*
   * -------------------------------------------------------
   * OPEN FULLSCREEN
   * -------------------------------------------------------
   */

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  /*
   * -------------------------------------------------------
   * CLOSE FULLSCREEN
   * -------------------------------------------------------
   */

  const closeFullscreen = (currentTime: number, playing: boolean) => {
    setVideoTime(currentTime);
    setWasPlaying(playing);
    setIsFullscreen(false);
  };

  /*
   * -------------------------------------------------------
   * NORMAL HOME
   * -------------------------------------------------------
   */

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      {/* =================================================
          SHOWREEL PREVIEW
      ================================================= */}

      {!isFullscreen && (
        <div
          ref={videoContainerRef}
          className="
            absolute
            inset-0
            h-full
            w-full
            overflow-hidden
            cursor-none
          "
          onClick={openFullscreen}
          onMouseEnter={() => setMouseInside(true)}
          onMouseLeave={() => setMouseInside(false)}
        >
          {/* =================================================
              VIDEO
          ================================================= */}

          <video
            src="/showreel/showreel_preview.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              grayscale-[0.8]
              saturate-[0.9]
              opacity-90
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-35
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                font-mono
                text-[14px]
                uppercase
                tracking-[0.22em]
                text-white/35
                sm:text-[16px]
                md:text-[18px]
              "
            >
              FILMMAKER//EDITOR
            </span>
          </div>

          {/* =================================================
              CURSOR REACTIVE LIGHT
          ================================================= */}
          {/* 
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
            "
            style={{
              background: `
                radial-gradient(
                  circle 330px at ${mouse.x}px ${mouse.y}px,
                  rgba(255,255,255,0.34) 0%,
                  rgba(255,255,255,0.20) 18%,
                  rgba(255,255,255,0.09) 38%,
                  rgba(255,255,255,0.025) 58%,
                  transparent 78%
                )
              `,
              mixBlendMode: "screen",
            }}
          /> */}

          {/* =================================================
              STRONG VIGNETTE
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-20
            "
            style={{
              background: `
                radial-gradient(
                  ellipse at center,
                  transparent 1%,
                  rgba(0,0,0,0.12) 75%,
                  rgba(0, 0, 0, 0.24) 80%,
                  rgba(0,0,0,0.72) 100%
                )
              `,
            }}
          />

          {/* =================================================
              GRAIN
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-30
              opacity-[0.22]
              mix-blend-overlay
            "
            style={{
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.75'/%3E%3C/svg%3E")
              `,
              backgroundSize: "180px 180px",
            }}
          />

          {/* =================================================
              CENTER CLICK CURSOR
          ================================================= */}

          <div
            className={`
              pointer-events-none
              fixed
              z-40
              flex
              flex-col
              items-center
              justify-center
              gap-2
              text-white
              transition-opacity
              duration-300
              ${mouseInside ? "opacity-100" : "opacity-0"}
            `}
            style={{
              left: mouse.x,
              top: mouse.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                border
                border-white/70
                bg-black/10
                backdrop-blur-sm
              "
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            <span
              className="
                whitespace-nowrap
                font-mono
                text-[8px]
                tracking-[0.3em]
                uppercase
                text-white/90
              "
            >
              Click to Play
            </span>
          </div>

          {/* =================================================
              SHOWREEL 2026
          ================================================= */}

          {/* <div
            className="
              pointer-events-none
              absolute
              bottom-50
              right-8
              z-40
                  origin-bottom-right
    rotate-[-90deg]
              font-mono
              text-[9px]
              tracking-[0.3em]
              text-white/80
              uppercase
            "
          >
            Showreel / 2026
          </div> */}
        </div>
      )}

      {/* =================================================
          FULLSCREEN VIDEO
      ================================================= */}

      <FullscreenVideo
        src="/showreel/sample-5s.webm"
        isOpen={isFullscreen}
        startTime={videoTime}
        wasPlaying={wasPlaying}
        onClose={closeFullscreen}
      />
    </main>
  );
}
