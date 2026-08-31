"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FuzzyText from "@/app/component/MeshText";
const mainNavLinks = [
  { name: "HOME.", href: "/" },
  { name: "WORK.", href: "/work" },
  { name: "CONTACT.", href: "/contact" },
  { name: "BRANDS.", href: "/brands" },
];

export default function Nav() {
  const pathname = usePathname();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pawTrailActive, setPawTrailActive] = useState(false);
  const [paws, setPaws] = useState<
    { id: number; x: number; y: number; angle: number; isLeft: boolean }[]
  >([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastPawPosRef = useRef<{ x: number; y: number } | null>(null);
  const pawIndexRef = useRef(0);
  const hideNav =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "c" || e.key === "C") {
        setPawTrailActive((prev) => {
          const next = !prev;
          setToastMsg(
            next ? "CAT PAW TRAIL ACTIVATED" : "CAT PAW TRAIL DEACTIVATED",
          );
          setTimeout(() => setToastMsg(null), 3000);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Paw Trail Mouse Listener
   */

  useEffect(() => {
    if (!pawTrailActive) {
      lastPawPosRef.current = null;
      const clearPaws = setTimeout(() => setPaws([]), 0);
      return () => clearTimeout(clearPaws);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (!lastPawPosRef.current) {
        lastPawPosRef.current = { x, y };
        return;
      }

      const dx = x - lastPawPosRef.current.x;
      const dy = y - lastPawPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 75) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        const isLeft = pawIndexRef.current % 2 === 0;
        pawIndexRef.current += 1;

        const newPaw = {
          id: Date.now() + Math.random(),
          x,
          y,
          angle,
          isLeft,
        };

        setPaws((prev) => [...prev.slice(-6), newPaw]);
        lastPawPosRef.current = { x, y };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pawTrailActive]);

  /*
   * Auto fade-out old paws
   */
  useEffect(() => {
    if (paws.length === 0) return;
    const timer = setTimeout(() => {
      setPaws((prev) => prev.slice(1));
    }, 700);
    return () => clearTimeout(timer);
  }, [paws]);

  if (hideNav) {
    return null;
  }

  return (
    <>
      {/* TOAST NOTIFICATION FOR EASTER EGGS */}
      {toastMsg && (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none transition-all duration-300">
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {toastMsg}
          </span>
        </div>
      )}

      {/* 🐾 PAW PRINT TRAIL OVERLAY */}
      {pawTrailActive && (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
          {paws.map((paw) => (
            <div
              key={paw.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 opacity-75 transition-opacity duration-1000"
              style={{
                left: `${paw.x}px`,
                top: `${paw.y}px`,
                transform: `translate(-50%, -50%) rotate(${paw.angle}deg) scale(${
                  paw.isLeft ? 1 : -1
                }, 1)`,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" />
                <circle cx="6" cy="9" r="2" fill="currentColor" />
                <circle cx="10" cy="6" r="2" fill="currentColor" />
                <circle cx="14" cy="6" r="2" fill="currentColor" />
                <circle cx="18" cy="9" r="2" fill="currentColor" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* GLOBAL NAV */}
      <header className="site-nav fixed inset-x-0 top-0 z-[100] pointer-events-none px-3 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <Link
            href="/"
            className="pointer-events-auto inline-block opacity-90 transition-opacity duration-300 hover:opacity-100"
          >
            <FuzzyText
              text="NHUJAN DONGOL"
              font={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.25em",
                textAlign: "left",
              }}
              color="#ffffff"
              baseIntensity={0}
              hoverIntensity={4}
              fuzzRange={12}
              fps={60}
              enableHover={true}
              glitchMode={false}
            />
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="pointer-events-auto relative z-[120] flex h-10 w-10 items-center justify-center border border-white/15 bg-black/20 transition-colors duration-300 hover:border-white/40 md:hidden"
          >
            <span className="relative flex h-4 w-5 items-center justify-center">
              <span
                className={`absolute block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45" : "-translate-y-1.5"}`}
              />
              <span
                className={`absolute block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45" : "translate-y-1.5"}`}
              />
            </span>
          </button>

          <nav className="pointer-events-auto hidden items-center justify-end gap-2 sm:gap-3 md:flex md:gap-5 lg:gap-9">
            {mainNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative
                    font-mono
                    text-[9px]
                    sm:text-[10px]
                    md:text-[11px]
                    lg:text-[13px]
                    tracking-[0.14em]
                    sm:tracking-[0.18em]
                    font-bold
                    uppercase
                    whitespace-nowrap
                    transition-all
                    duration-300
                    ease-out
                    hover:scale-105
                    group
                    ${isActive ? "text-white" : "text-white/55 hover:text-white"}
                  `}
                >
                  {link.name}

                  <span
                    className={`
                      absolute
                      left-0
                      -bottom-1
                      h-[2px]
                      bg-white
                      transition-all
                      duration-300
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          <div
            className={`fixed inset-0 z-[110] bg-[#0b0b0b] transition-transform duration-300 ease-out md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            aria-hidden={!mobileOpen}
          >
            <div className="flex h-full w-full flex-col px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/50">
                  Menu
                </span>

                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileOpen(false)}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/15 bg-black/20 transition-colors duration-300 hover:border-white/40"
                >
                  <span className="relative block h-4 w-4">
                    <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 rotate-45 bg-white" />
                    <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 -rotate-45 bg-white" />
                  </span>
                </button>
              </div>

              <nav className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
                {mainNavLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        font-sans
                        text-[30px]
                        font-black
                        uppercase
                        tracking-[0.08em]
                        transition-all
                        duration-200
                        ${isActive ? "text-white" : "text-white/55 hover:text-white"}
                      `}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
