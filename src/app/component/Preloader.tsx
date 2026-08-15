"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import GalleryTunnelPreloader from "@/app/component/Gallerytunnelpreloader";

const AUTO_ADVANCE_MS = 6000;

const FLY_DURATION_MS = 1000;
const FADE_DURATION_MS = 450;
const TOTAL_EXIT_MS = FLY_DURATION_MS + FADE_DURATION_MS;

type Phase = "tunnel" | "exiting" | "done";

export default function Preloader({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("tunnel");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startExit = useCallback(() => {
    setPhase((current) => {
      if (current !== "tunnel") return current;
      return "exiting";
    });
  }, []);

  /*
   * Automatically start the exit after the tunnel has been
   * visible for the minimum amount of time.
   */
  useEffect(() => {
    if (phase !== "tunnel") return;

    timerRef.current = setTimeout(() => {
      startExit();
    }, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [phase, startExit]);

  /*
   * Prevent the homepage behind the preloader from scrolling.
   */
  useEffect(() => {
    if (phase === "done") return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  return (
    <>
      {phase !== "done" && (
        <div
          role="button"
          aria-label="Skip intro"
          onClick={startExit}
          onTransitionEnd={(event) => {
            if (event.propertyName === "opacity" && phase === "exiting") {
              setPhase("done");
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000",

            /*
             * Keep the black screen visible while the name
             * flies toward the viewer.
             *
             * Then fade the entire preloader away.
             */
            opacity: phase === "exiting" ? 0 : 1,

            /*
             * DO NOT scale the entire preloader.
             *
             * The previous version scaled the complete tunnel,
             * which made the transition feel like the whole
             * page was zooming.
             */
            transform: "none",

            transition:
              phase === "exiting"
                ? `opacity ${FADE_DURATION_MS}ms ease ${FLY_DURATION_MS}ms`
                : "none",

            pointerEvents: phase === "exiting" ? "none" : "auto",

            overflow: "hidden",
          }}
        >
          {/* 
            Existing tunnel.

            It remains completely untouched.
          */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: phase === "exiting" ? 0.15 : 1,
              transition: `opacity ${FLY_DURATION_MS}ms ease`,
            }}
          >
            <GalleryTunnelPreloader
              labelText="Press to Enter"
              onPress={startExit}
            />
          </div>

          {/*
            NHUJAN DONGOL flying toward the viewer.

            This only appears during the exit.
          */}
          {/* NHUJAN DONGOL — present from the beginning */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 20,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              pointerEvents: "none",

              perspective: "1400px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",

                textAlign: "center",
                whiteSpace: "nowrap",

                color: "#fff",

                fontFamily: 'Georgia, "Times New Roman", serif',

                fontWeight: 400,

                letterSpacing: "-0.045em",

                lineHeight: 0.86,

                transformOrigin: "50% 50%",

                /*
                 * Before exiting:
                 * completely calm and readable.
                 *
                 * During exiting:
                 * grows toward the viewer at a CONSTANT rate
                 * (linear) rather than easing in/out, so the
                 * scale-up feels uniform all the way until it
                 * flies off screen.
                 */
                animation:
                  phase === "exiting"
                    ? `nhujanFlyPast ${FLY_DURATION_MS}ms linear forwards`
                    : "none",

                transform: "translate3d(0, 0, 0) scale(1)",

                opacity: 1,
              }}
            >
              <span
                style={{
                  fontSize: "clamp(24px, 3.5vw, 48px)",
                }}
              >
                NHUJAN
              </span>

              <span
                style={{
                  fontSize: "clamp(24px, 3.5vw, 48px)",
                }}
              >
                DONGOL
              </span>
            </div>
          </div>

          {/*
            Animation lives here instead of in globals.css,
            so you don't need another CSS file.
          */}
          <style>
            {`
  @keyframes nhujanFlyPast {
    /* Start small */
    0% {
      transform: translate3d(0, 0, 0) scale(0.2);
      opacity: 1;
    }

    /* Midway: larger but still visible */
    50% {
      transform: translate3d(0, 0, 600px) scale(3);
      opacity: 1;
    }

    /* End: very large, fading out */
    100% {
      transform: translate3d(0, 0, 2200px) scale(13);
      opacity: 0;
    }
  }
`}
          </style>
        </div>
      )}

      {/*
        Homepage exists underneath the preloader.

        Once the black overlay disappears, the homepage
        is already there — no navigation/reload is necessary.
      */}
      {children}
    </>
  );
}
