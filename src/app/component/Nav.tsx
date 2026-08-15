"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (pathname === "/") return null;

  const mainNavLinks = [
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
    { name: "Brands", href: "/brands" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* ── Top Fixed Header ── */}
      <header className="fixed top-0 left-0 w-full z-50 mix-blend-difference pointer-events-none px-8 py-6">
        <div className="w-full flex items-center justify-between relative">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="pointer-events-auto text-[10px] md:text-xs font-mono font-semibold tracking-[0.2em] text-white/80 uppercase hover:text-white transition-colors cursor-pointer"
          >
            Back
          </button>

          {/* Centered Name */}
          <Link
            href="/"
            className="pointer-events-auto text-sm md:text-base font-bold font-mono tracking-[0.25em] text-white uppercase opacity-90 hover:opacity-100 transition-opacity"
          >
            NHUJAN DONGOL
          </Link>

          {/* Hamburger trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="pointer-events-auto relative flex flex-col justify-center items-end gap-[5px] w-10 h-10 group cursor-pointer z-[60]"
          >
            <span
              className={`block h-[1.5px] bg-white transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen
                  ? "w-6 rotate-45 translate-y-[6.5px]"
                  : "w-6 group-hover:w-8"
                }`}
            />
            <span
              className={`block h-[1.5px] bg-white transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? "w-0 opacity-0" : "w-5 group-hover:w-8"
                }`}
            />
            <span
              className={`block h-[1.5px] bg-white transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen
                  ? "w-6 -rotate-45 -translate-y-[6.5px]"
                  : "w-4 group-hover:w-8"
                }`}
            />
          </button>
        </div>
      </header>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[55] transition-all duration-500 ${isOpen
            ? "opacity-100 pointer-events-auto backdrop-blur-[2px] bg-black/80"
            : "opacity-0 pointer-events-none"
          }`}
      />

      {/* ── Full-height slide-in panel ── */}
      <div
        className={`
          fixed top-0 right-0 h-full z-[58]
          w-[min(400px,85vw)]
          bg-black
          border-l border-white/[0.08]
          flex flex-col justify-between
          px-10 pt-32 pb-12
          transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Thin vertical red accent line */}
        <div
          className={`absolute left-0 top-[15%] w-[1px] bg-red-600 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? "h-[40%] opacity-100" : "h-0 opacity-0"
            }`}
        />

        {/* Nav links */}
        <nav className="flex flex-col gap-6">
          {mainNavLinks.map((link, idx) => {
            const isActive = pathname === link.href;

            return (
              <div key={link.name} className="overflow-hidden py-1">
                <Link
                  href={link.href}
                  className={`
                    group flex items-center gap-3
                    font-sans font-extrabold
                    text-[clamp(1.75rem,4.5vw,2.5rem)]
                    leading-none
                    tracking-tight
                    transition-all duration-300
                    hover:text-white hover:translate-x-2
                    ${isActive
                      ? "text-white translate-x-2"
                      : "text-zinc-600"
                    }
                    ${isOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: `${isOpen ? 80 + idx * 55 : 0}ms`,
                  }}
                >
                  <span
                    className={`
                      w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300
                      group-hover:opacity-100 group-hover:scale-100
                      ${isActive
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0"
                      }
                    `}
                  />
                  <span>{link.name}.</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom meta row */}
        <div
          className={`flex flex-col gap-6 transition-all duration-500 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          style={{ transitionDelay: isOpen ? "350ms" : "0ms" }}
        >
          {/* Socials / Links row */}
          <div className="flex gap-4 font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
            <a
              href="https://vimeo.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Vimeo
            </a>
            <span>/</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>

          <div className="w-8 h-[1px] bg-white/10" />

          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-400 uppercase">
              Director &amp; Cinematographer
            </p>
            <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 uppercase">
              Kathmandu, Nepal
            </p>
          </div>
        </div>
      </div>
    </>
  );
}