"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const mainNavLinks = [
  { name: "HOME.", href: "/" },
  { name: "WORK.", href: "/work" },
  { name: "CONTACT.", href: "/contact" },
  { name: "BRANDS.", href: "/brands" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const isLanding = pathname === "/";

  const [isOpen, setIsOpen] = useState(false);
  const [isLeavingLanding, setIsLeavingLanding] = useState(false);

  /*
   * Close menu whenever pathname changes.
   */
  useEffect(() => {
    setIsOpen(false);
    setIsLeavingLanding(false);
  }, [pathname]);

  /*
   * Lock scrolling while dome menu is open.
   */
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

  /*
   * Landing-page navigation transition.
   */
  const navigateFromLanding = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === pathname) return;

    event.preventDefault();

    setIsLeavingLanding(true);

    setTimeout(() => {
      router.push(href);
    }, 450);
  };

  /*
   * Escape key to close menu.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  /*
   * Hamburger
   */
  const toggleMenu = () => {
    setIsOpen((current) => !current);
  };

  return (
    <>
      {/* GLOBAL NAV */}
      <header
        className="
          fixed
          inset-x-0
          top-0
          z-[100]
          pointer-events-none
          px-6
          md:px-8
          py-5
          md:py-6
        "
      >
        <div className="relative w-full h-full">
          {/* NAME */}
          <Link
            href="/"
            onClick={(event) => {
              if (isLanding) return;

              event.preventDefault();

              setIsOpen(false);

              setTimeout(() => {
                router.push("/");
              }, 250);
            }}
            className={`
              pointer-events-auto
              absolute
              top-0
              font-mono
              text-[13px]
              md:text-[15px]
              font-bold
              tracking-[0.25em]
              text-white
              uppercase
              whitespace-nowrap
              opacity-90
              hover:opacity-100
              transition-all
              duration-500
              ease-[cubic-bezier(0.76,0,0.24,1)]
              ${isLanding ? "left-0" : "left-1/2 -translate-x-1/2"}
              ${isLeavingLanding ? "left-1/2 -translate-x-1/2" : ""}
            `}
          >
            NHUJAN DONGOL
          </Link>

          {/* DESKTOP LANDING NAV */}
          {isLanding && (
            <nav
              className={`
                hidden
                md:flex
                pointer-events-auto
                absolute
                top-0
                right-0
                items-center
                gap-7
                lg:gap-9
                transition-all
                duration-[450ms]
                ease-[cubic-bezier(0.76,0,0.24,1)]
                ${
                  isLeavingLanding
                    ? "translate-x-[120%] opacity-0"
                    : "translate-x-0 opacity-100"
                }
              `}
            >
              {mainNavLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => navigateFromLanding(event, link.href)}
                    className={`
                      relative
                      font-mono
                      text-[12px]
                      lg:text-[13px]
                      tracking-[0.18em]
                      font-medium
                      uppercase
                      whitespace-nowrap
                      transition-all
                      duration-300
                      group
                      ${
                        isActive
                          ? "text-white"
                          : "text-white/55 hover:text-white"
                      }
                    `}
                  >
                    {link.name}

                    {/* Active underline */}
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
          )}

          {/* NON-LANDING BACK BUTTON */}
          {!isLanding && (
            <button
              onClick={() => router.back()}
              className="
                pointer-events-auto
                absolute
                top-0
                left-0
                font-mono
                text-[10px]
                md:text-[11px]
                font-semibold
                tracking-[0.2em]
                uppercase
                text-white/70
                hover:text-white
                transition-colors
              "
            >
              Back
            </button>
          )}

          {/* HAMBURGER */}
          <button
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className={`
              pointer-events-auto
              absolute
              top-0
              right-0
              z-[110]
              flex
              h-8
              w-8
              flex-col
              items-center
              justify-center
              gap-[6px]
              cursor-pointer
              transition-all
              duration-[450ms]
              ease-[cubic-bezier(0.76,0,0.24,1)]
              ${
                isLanding
                  ? "md:opacity-0 md:pointer-events-none"
                  : "opacity-100"
              }
              ${isLeavingLanding ? "md:opacity-100 md:pointer-events-auto" : ""}
            `}
          >
            <span
              className={`
                block
                h-[1.5px]
                w-6
                bg-white
                transition-transform
                duration-400
                ease-[cubic-bezier(0.76,0,0.24,1)]
                origin-center
                ${isOpen ? "translate-y-[7.5px] rotate-45" : ""}
              `}
            />
            <span
              className={`
                block
                h-[1.5px]
                w-6
                bg-white
                transition-all
                duration-300
                ease-[cubic-bezier(0.76,0,0.24,1)]
                ${isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"}
              `}
            />
            <span
              className={`
                block
                h-[1.5px]
                w-6
                bg-white
                transition-transform
                duration-400
                ease-[cubic-bezier(0.76,0,0.24,1)]
                origin-center
                ${isOpen ? "-translate-y-[7.5px] -rotate-45" : ""}
              `}
            />
          </button>
        </div>
      </header>

      {/* MOBILE TOP NAV (LANDING) */}
      {isLanding && (
        <div
          className="
            md:hidden
            fixed
            top-0
            right-0
            z-[101]
            pointer-events-none
            px-6
            py-5
          "
        >
          <button
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="
              pointer-events-auto
              relative
              flex
              h-8
              w-8
              flex-col
              items-center
              justify-center
              gap-[6px]
            "
          >
            <span
              className={`
                block h-[1.5px] w-6 bg-white transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] origin-center
                ${isOpen ? "translate-y-[7.5px] rotate-45" : ""}
              `}
            />
            <span
              className={`
                block h-[1.5px] w-6 bg-white transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]
                ${isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"}
              `}
            />
            <span
              className={`
                block h-[1.5px] w-6 bg-white transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] origin-center
                ${isOpen ? "-translate-y-[7.5px] -rotate-45" : ""}
              `}
            />
          </button>
        </div>
      )}

      {/* BACKDROP OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className={`
          fixed
          inset-0
          z-[105]
          bg-black/50
          backdrop-blur-[2px]
          transition-opacity
          duration-500
          ease-[cubic-bezier(0.76,0,0.24,1)]
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* DOME MENU */}
      <div
        className={`
          fixed
          top-1/2
          right-0
          -translate-y-1/2
          z-[106]
          h-[min(800px,100vh)]
          w-[min(380px,94vw)]
          bg-black
          border-l
          border-y
          border-white/[0.12]
          shadow-[-25px_0_60px_rgba(0,0,0,0.9)]
          rounded-l-[9999px]
          flex
          flex-col
          justify-center
          items-start
          gap-10
          pl-14
          pr-10
          md:pl-20
          md:pr-14
          overflow-hidden
          transition-transform
          duration-[600ms]
          ease-[cubic-bezier(0.76,0,0.24,1)]
          ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-[110%] pointer-events-none"}
        `}
      >
        <div className="flex flex-col gap-10 w-full min-w-[280px]">
          {/* LINKS */}
          <nav className="flex flex-col gap-6">
            {mainNavLinks.map((link, index) => {
              const isActive = pathname === link.href;

              return (
                <div key={link.href} className="overflow-hidden py-1">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      font-sans
                      font-extrabold
                      text-[clamp(1.75rem,4.5vw,2.5rem)]
                      leading-none
                      tracking-tight
                      transition-all
                      duration-300
                      hover:translate-x-2
                      whitespace-nowrap
                      ${
                        isActive
                          ? "text-white translate-x-2"
                          : "text-zinc-600 hover:text-white"
                      }
                      ${
                        isOpen
                          ? "translate-y-0 opacity-100"
                          : "translate-y-10 opacity-0"
                      }
                    `}
                    style={{
                      transitionDelay: `${isOpen ? 200 + index * 60 : 0}ms`,
                    }}
                  >
                    <span
                      className={`
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-white
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"
                        }
                      `}
                    />

                    <span>{link.name}</span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* BOTTOM META */}
          <div
            className={`
              flex
              flex-col
              gap-6
              transition-all
              duration-500
              ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{
              transitionDelay: isOpen ? "450ms" : "0ms",
            }}
          >
            <hr className=" text-slate-300" />

            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-400 uppercase whitespace-nowrap">
                Film Maker, Creative Director &amp; Editor
              </p>

              <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 uppercase whitespace-nowrap">
                Kathmandu, Nepal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LANDING BOTTOM CORNER */}
      {isLanding && (
        <>
          {/* DEVELOPERS */}
          <div
            className="
              fixed
              bottom-6
              left-6
              md:left-8
              z-[100]
              font-mono
              text-[9px]
              md:text-[10px]
              tracking-[0.3em]
              text-white/60
              uppercase
              pointer-events-none
            "
          >
            DEVELOPED BY
          </div>

          {/* SOCIAL ICONS */}
          <div
            className="
              fixed
              bottom-5
              right-6
              md:right-8
              z-[100]
              flex
              items-center
              gap-5
              pointer-events-auto
            "
          >
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="
                text-white/85
                hover:text-white
                transition-all
                hover:scale-110
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5 md:w-6 md:h-6"
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

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="
                text-white/85
                hover:text-white
                transition-all
                hover:scale-110
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 md:w-6 md:h-6"
              >
                <path d="M5.2 3.5A2.2 2.2 0 1 1 5.2 7.9 2.2 2.2 0 0 1 5.2 3.5ZM3.3 9h3.8v11.5H3.3V9Zm6.1 0h3.6v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.8 0 4.5 2.5 4.5 5.7v6.1h-3.8V15c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.4V9Z" />
              </svg>
            </a>
          </div>
        </>
      )}
    </>
  );
}
