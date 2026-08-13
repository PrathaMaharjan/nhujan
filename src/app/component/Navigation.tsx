"use client";

import Link from "next/link";
import MeshText from "@/app/component/MeshText";

// Shared font config — identical for all three links
const NAV_FONT = {
  fontFamily: "Inter",
  fontWeight: 900,
  fontSize: 32,
  lineHeight: "1em",
  letterSpacing: "0em",
  textAlign: "left" as const,
};

// Consistent edge padding across all corners
const PAD = "clamp(24px, 2vw, 40px)";

export default function Navigation() {
  return (
    <>
      <nav className="absolute inset-0 z-50 pointer-events-none">

        {/* =====================================================
          TOP — SVG name logo
          ===================================================== */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center text-white pointer-events-auto animate-signal-ui"
          style={{ top: PAD }}
        >
          <svg
            width="908"
            height="240"
            viewBox="0 0 908 240"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-white"
          >
            {/* Your path data goes here */}
            <path
              d="M61.383 16.8308C64.703 88.0108 ... 861.813 217.351Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* =====================================================
          MIDDLE — Nav links, positioned at vertical center
          ===================================================== */}
        <div
          className="absolute flex flex-col items-end gap-8 md:gap-9 pointer-events-auto"
          style={{ right: PAD, top: "50%", transform: "translateY(-50%)" }}
        >
          <div className="animate-signal-1">
            <Link href="/work">
              <MeshText
                text="WORK"
                color="#ffffff"
                font={NAV_FONT}
                glitchMode={false}
                enableHover={true}
                hoverIntensity={2.5}
                baseIntensity={0}
                fuzzRange={12}
                fps={60}
              />
            </Link>
          </div>

          <div className="animate-signal-2">
            <Link href="/contact">
              <MeshText
                text="CONTACT"
                color="#ffffff"
                font={NAV_FONT}
                glitchMode={false}
                enableHover={true}
                hoverIntensity={2.5}
                baseIntensity={0}
                fuzzRange={12}
                fps={60}
              />
            </Link>
          </div>

          <div className="animate-signal-3">
            <Link href="/brands">
              <MeshText
                text="BRANDS"
                color="#ffffff"
                font={NAV_FONT}
                glitchMode={false}
                enableHover={true}
                hoverIntensity={2.5}
                baseIntensity={0}
                fuzzRange={12}
                fps={60}
              />
            </Link>
          </div>
        </div>

        {/* =====================================================
          BOTTOM LEFT — Credits
          ===================================================== */}
        <Link
          href="/credits"
          className="absolute text-[9px] md:text-[10px] font-medium uppercase tracking-[0.18em] text-white/50 hover:text-white transition-colors duration-300 pointer-events-auto animate-signal-ui"
          style={{ left: PAD, bottom: PAD }}
        >
          CREDITS
        </Link>

        {/* =====================================================
          BOTTOM RIGHT — Social icons (side by side)
          ===================================================== */}
        <div
          className="absolute flex items-center gap-4 pointer-events-auto animate-signal-ui"
          style={{ right: PAD, bottom: PAD }}
        >
          {/* Instagram */}
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-white/60 hover:text-white transition-colors duration-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </Link>

          {/* Thin divider line between icons */}
          <span className="w-px h-3.5 bg-white/20" />

          {/* LinkedIn */}
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-white/60 hover:text-white transition-colors duration-300"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </Link>
        </div>

      </nav>
    </>
  );
}