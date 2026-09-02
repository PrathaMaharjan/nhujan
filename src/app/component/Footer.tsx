"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsHoverDevice(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  const toggleExpanded = () => {
    if (isHoverDevice) return;
    setExpanded((prev) => !prev);
  };

  return (
    <footer className="site-footer fixed inset-x-0 bottom-0 z-[100] pointer-events-none px-3 pb-3 pt-4 sm:px-6 sm:pb-4 md:px-8 md:pb-5">
      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 sm:flex-row sm:items-end sm:gap-3 md:gap-4">
        
        {/* DEVELOPERS (LEFT) */}
        <div
          onClick={toggleExpanded}
          onMouseEnter={() => {
            if (isHoverDevice) setExpanded(true);
          }}
          onMouseLeave={() => {
            if (isHoverDevice) setExpanded(false);
          }}
          className="pointer-events-auto flex min-w-0 cursor-pointer items-center justify-start gap-1 overflow-hidden font-mono text-[7px] tracking-[0.22em] text-white/60 uppercase transition-colors duration-200 hover:text-white sm:text-[8px] md:text-[10px]"
        >
          <span className="shrink-0">Developed by</span>
          <span className="shrink-0 text-white/75">[</span>
          
          {/* Animated Expandable Links Container */}
          <div
            className={`inline-flex items-center gap-1 overflow-hidden transition-all duration-700 ease-in-out ${
              expanded ? "max-w-[40rem] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            <a
              href="https://github.com/prathamaharjan" 
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap hover:underline hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              PRATHA MAHARJAN
            </a>
            <span className="text-white/40">//</span>
            <a
              href="https://github.com/pragunrajmaskey" 
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap hover:underline hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              PRAGUN RAJ MASKEY
            </a>
          </div>

          <span className="shrink-0 text-white/75">]</span>
        </div>

        {/* LOCATION (CENTER) */}
        <div className="pointer-events-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          <span className="font-mono text-[7px] tracking-[0.2em] text-white/60 uppercase sm:text-[8px] md:text-[10px]">
            Based in Kathmandu, Nepal
          </span>
        </div>

        {/* SOCIAL LINKS (RIGHT) */}
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 md:gap-5">
          <a
            href="https://www.instagram.com/nhujan.d/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-white/85 transition-all hover:scale-110 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/nhujan/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-white/85 transition-all hover:scale-110 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
            >
              <path d="M5.2 3.5A2.2 2.2 0 1 1 5.2 7.9 2.2 2.2 0 0 1 5.2 3.5ZM3.3 9h3.8v11.5H3.3V9Zm6.1 0h3.6v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.8 0 4.5 2.5 4.5 5.7v6.1h-3.8V15c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.4V9Z" />
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}