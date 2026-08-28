"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FuzzyText from "@/app/component/MeshText"
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
  const lastPawPosRef = useRef<{ x: number; y: number } | null>(null);
  const pawIndexRef = useRef(0);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

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
                transform: `translate(-50%, -50%) rotate(${paw.angle}deg) scale(${paw.isLeft ? 1 : -1
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
      <header className="fixed inset-x-0 top-0 z-[100] pointer-events-none px-6 md:px-8 py-5 md:py-6">
        <div className="relative w-full h-full">
          {/* NAME - integrated with FuzzyText */}
          <Link
            href="/"
            className="pointer-events-auto absolute top-0 left-0 inline-block opacity-90 hover:opacity-100 transition-opacity duration-300"
          >
            <FuzzyText
              text="NHUJAN DONGOL"
              font={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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

          {/* DESKTOP NAV */}
          <nav className="flex pointer-events-auto absolute top-0 right-0 items-center gap-4 md:gap-7 lg:gap-9">
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
                    text-[12px]
                    lg:text-[13px]
                    tracking-[0.18em]
                    font-bold
                    uppercase
                    whitespace-nowrap
                    transition-all
                    duration-300
                    ease-out
                    hover:scale-110
                    group
                    ${isActive ? "text-white" : "text-white/55 hover:text-white"
                    }
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
        </div>
      </header>
    </>
  );
}