"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  onComplete?: () => void;
}

const TECH_MESSAGES = [
  "Initializing page...",
  "Loading components...",
  "Fetching images...",
  "Connecting wires...",
  "Calibrating the vibe...",
  "Waking up the pixels...",
  "Organizing the chaos...",
  "Creating the vibe...",
  "Polishing the pixels...",
  "Almost there...",
  "Final checks...",
  "Ready.",
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [typedMessage, setTypedMessage] = useState("");
  const [opening, setOpening] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOADING PROGRESS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let animationFrame = 0;

    const startTime = performance.now();

    // Total preload duration.
    const duration = 7000;

    const updateProgress = (time: number) => {
      const elapsed = time - startTime;

      const rawProgress = Math.min(elapsed / duration, 1);

      /*
       * Smooth progress.
       *
       * It starts reasonably quickly and slows slightly
       * toward the end.
       */
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2);

      const value = Math.floor(easedProgress * 100);

      setProgress(value);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);

        /*
         * Let 100% sit on screen briefly.
         */
        window.setTimeout(() => {
          setOpening(true);
        }, 500);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CHANGE TECHNICAL MESSAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (opening) return;

    /*
     * Much slower than before.
     *
     * Each message remains visible for around
     * 1.6 seconds.
     */
    const interval = window.setInterval(() => {
      setMessageIndex((current) => {
        if (current >= TECH_MESSAGES.length - 1) {
          return current;
        }

        return current + 1;
      });
    }, 1600);

    return () => {
      window.clearInterval(interval);
    };
  }, [opening]);

  /*
  |--------------------------------------------------------------------------
  | TYPEWRITER EFFECT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (opening) return;

    const message = TECH_MESSAGES[messageIndex];

    let characterIndex = 0;

    setTypedMessage("hello");

    const interval = window.setInterval(() => {
      characterIndex += 1;

      setTypedMessage(message.slice(0, characterIndex));

      if (characterIndex >= message.length) {
        window.clearInterval(interval);
      }
    }, 45);

    return () => {
      window.clearInterval(interval);
    };
  }, [messageIndex, opening]);

  /*
  |--------------------------------------------------------------------------
  | OPEN HOMEPAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!opening) return;

    /*
     * The two black panels need enough time
     * to move completely outside the viewport.
     */
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 1250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [opening, onComplete]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`
        fixed
        inset-0
        z-[9999]
        overflow-hidden
        pointer-events-none
        ${opening ? "animate-preloader-fade" : ""}
      `}
    >
      {/* =====================================================
          TOP BLACK HALF
          ===================================================== */}

      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-1/2
          bg-black
          ${opening ? "animate-open-top" : ""}
        `}
      >
        {/*
          NHUJAN

          Restrained serif rather than the previous
          giant heavy sans-serif.
        */}

        <div
          className="
            absolute
            bottom-[-0.08em]
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-white
            font-serif
            font-normal
            italic
            tracking-[-0.055em]
            leading-none
            text-[clamp(3.5rem,8vw,8rem)]
          "
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          NHUJAN
        </div>
      </div>

      {/* =====================================================
          BOTTOM BLACK HALF
          ===================================================== */}

      <div
        className={`
          absolute
          inset-x-0
          bottom-0
          h-1/2
          bg-black
          ${opening ? "animate-open-bottom" : ""}
        `}
      >
        <div
          className="
            absolute
            top-[-0.08em]
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-white
            font-serif
            font-normal
            italic
            tracking-[-0.055em]
            leading-none
            text-[clamp(3.5rem,8vw,8rem)]
          "
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          DONGOL
        </div>
      </div>

      {/* =====================================================
          CENTER LOADING TRACK
          ===================================================== */}

      <div
        className="
          absolute
          left-0
          right-0
          top-1/2
          z-30
          h-[1px]
          -translate-y-1/2
          bg-white/20
        "
      >
        {/* Actual loading progress */}
        <div
          className="
            absolute
            left-0
            top-0
            h-full
            bg-white
            transition-[width]
            duration-100
            ease-linear
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* =====================================================
          TOP LEFT TECHNICAL STATUS
          ===================================================== */}

      <div
        className="
          absolute
          left-[4vw]
          top-[4vh]
          z-40
          flex
          flex-col
          gap-1
          font-mono
        "
      >
        {/* Tiny system label */}

        <div
          className="
            flex
            items-center
            gap-2
            text-[8px]
            uppercase
            tracking-[0.25em]
            text-zinc-600
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-white
              animate-pulse
            "
          />
          SYSTEM / BOOT
        </div>

        {/* Typewriter text */}

        <div
          className="
            min-h-[18px]
            text-[10px]
            uppercase
            tracking-[0.15em]
            text-zinc-300
            sm:text-xs
          "
        >
          {typedMessage}
          <span
            className="
              ml-0.5
              inline-block
              h-[11px]
              w-[1px]
              translate-y-[1px]
              bg-white/70
              animate-cursor-blink
            "
          />
        </div>

        {/* Process number */}

        <div
          className="
            text-[7px]
            uppercase
            tracking-[0.2em]
            text-zinc-700
          "
        >
          PROCESS_
          {messageIndex + 1}
        </div>
      </div>

      {/* =====================================================
          TOP RIGHT SMALL INFORMATION
          ===================================================== */}

      <div
        className="
          absolute
          right-[4vw]
          top-[4vh]
          z-40
          text-right
          font-mono
          text-[7px]
          uppercase
          tracking-[0.2em]
          text-zinc-700
        "
      >
        <div>CREATIVE SYSTEM</div>

        <div>VISUAL DEPARTMENT</div>
      </div>

      {/* =====================================================
          BOTTOM LEFT
          ===================================================== */}

      <div
        className="
          absolute
          bottom-[4vh]
          left-[4vw]
          z-40
          font-mono
          text-[7px]
          uppercase
          tracking-[0.2em]
          text-zinc-700
        "
      >
        NHUJAN DONGOL
        <br />
        EST. 2026
      </div>

      {/* =====================================================
          BOTTOM RIGHT PERCENTAGE
          ===================================================== */}

      <div
        className="
          absolute
          bottom-[3.5vh]
          right-[4vw]
          z-40
          flex
          items-baseline
          font-serif
          text-white
        "
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <span
          className="
            text-[clamp(1rem,2vw,3rem)]
            // text-[clamp(2.5rem,5vw,5rem)]
            font-normal
            
            tracking-[-0.06em]
            leading-none
          "
        >
          {/* {progress} */}
          {/* Loading... */}
        </span>

        <span
          className="
            ml-1
            text-sm
            font-normal
            not-italic
            text-zinc-500
          "
        >
          {/* % */}
        </span>
      </div>

      {/* =====================================================
          ANIMATIONS
          ===================================================== */}

      <style>{`
        /*
         * Top half leaves the viewport upward.
         */
        @keyframes openTop {
          0% {
            transform: translateY(0);
          }

          100% {
            transform: translateY(-100%);
          }
        }

        /*
         * Bottom half leaves the viewport downward.
         */
        @keyframes openBottom {
          0% {
            transform: translateY(0);
          }

          100% {
            transform: translateY(100%);
          }
        }

        /*
         * UI elements disappear while the panels
         * are opening.
         */
        @keyframes preloaderFade {
          0% {
            opacity: 1;
          }

          75% {
            opacity: 1;
          }

          100% {
            opacity: 0;
          }
        }

        /*
         * Typewriter cursor.
         */
        @keyframes cursorBlink {
          0%,
          45% {
            opacity: 1;
          }

          46%,
          100% {
            opacity: 0;
          }
        }

        .animate-open-top {
          animation:
            openTop
            1200ms
            cubic-bezier(0.76, 0, 0.24, 1)
            forwards;
        }

        .animate-open-bottom {
          animation:
            openBottom
            1200ms
            cubic-bezier(0.76, 0, 0.24, 1)
            forwards;
        }

        .animate-preloader-fade {
          animation:
            preloaderFade
            1250ms
            ease
            forwards;
        }

        .animate-cursor-blink {
          animation:
            cursorBlink
            900ms
            steps(1)
            infinite;
        }
      `}</style>
    </div>
  );
}
