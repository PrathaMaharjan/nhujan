"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 1. ALL HOOKS MUST RUN UNCONDITIONALLY AT THE TOP
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 2. CONDITIONAL RETURNS COME AFTER HOOKS
  if (pathname === "/") return null;

  const mainNavLinks = [
    { name: "Home.", href: "/" },
    { name: "Work.", href: "/work" },
    { name: "Brands.", href: "/brands" },
    { name: "Contact.", href: "/contact" },
  ];

  return (
    <>
      {/* Top Fixed Bar Header */}
      <header className="fixed top-0 left-0 w-full z-50 mix-blend-difference pointer-events-none px-8 py-6">
        <div className="w-full flex items-center justify-between relative">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="pointer-events-auto text-[10px] md:text-xs font-medium tracking-[0.2em] text-white/80 uppercase hover:text-white transition-colors cursor-pointer"
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

          {/* Hamburger / Close Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="pointer-events-auto flex flex-col justify-center items-end gap-1.5 w-10 h-10 group cursor-pointer z-50"
          >
            <span
              className={`h-[1.5px] bg-white transition-all duration-300 ease-out ${
                isOpen ? "w-6 rotate-45 translate-y-[7.5px]" : "w-6 group-hover:w-8"
              }`}
            />
            <span
              className={`h-[1.5px] bg-white transition-all duration-300 ease-out ${
                isOpen ? "opacity-0 w-0" : "w-5 group-hover:w-8"
              }`}
            />
            <span
              className={`h-[1.5px] bg-white transition-all duration-300 ease-out ${
                isOpen ? "w-6 -rotate-45 -translate-y-[7.5px]" : "w-4 group-hover:w-8"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Dimmed Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Right-Centered Half-Circle Dome */}
      <div
        className={`fixed top-1/2 right-[-380px] sm:right-[-420px] -translate-y-1/2 w-[680px] h-[680px] rounded-full bg-black/50 backdrop-blur-md border border-white/10 z-40 flex items-center justify-start pl-20 sm:pl-24 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] origin-right ${
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[120%] opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-start gap-5 text-left">
          {mainNavLinks.map((link, idx) => (
            <div key={link.name} className="overflow-hidden">
              <Link
                href={link.href}
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-white block transition-all duration-300 hover:text-zinc-400 hover:translate-x-2 ${
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${isOpen ? 100 + idx * 40 : 0}ms` }}
              >
                {link.name}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}