"use client";

import React, { useEffect, useState, useRef } from "react";
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

  const [isLeavingLanding, setIsLeavingLanding] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pawTrailActive, setPawTrailActive] = useState(false);
  const [paws, setPaws] = useState<
    { id: number; x: number; y: number; angle: number; isLeft: boolean }[]
  >([]);
  const lastPawPosRef = useRef<{ x: number; y: number } | null>(null);
  const pawIndexRef = useRef(0);

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

      // Spawn a new paw print every 75px traveled
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

  /*
   * Close menu whenever pathname changes.
   */
  useEffect(() => {
    const resetNavigation = setTimeout(() => {
      setIsLeavingLanding(false);
    }, 0);

    return () => clearTimeout(resetNavigation);
  }, [pathname]);

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
                {/* Main Pad */}
                <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" />
                {/* Toe Beans */}
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

          {/* DESKTOP NAV */}
          <nav
            className={`
              flex
              pointer-events-auto
              absolute
              top-0
              right-0
              items-center
              gap-4
              md:gap-7
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
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) =>
                    isLanding && navigateFromLanding(event, link.href)
                  }
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
                    ${
                      isActive ? "text-white" : "text-white/55 hover:text-white"
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
        </div>
      </header>

      {/* BACKDROP OVERLAY */}
      {/* <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className={`
          fixed
          inset-0
          z-[105]
          bg-black/30
          backdrop-blur-[2px]
          transition-opacity
          duration-700
          ease-[cubic-bezier(0.76,0,0.24,1)]
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      /> */}

      {/* HIGHLY TRANSLUCENT DOME MENU */}
      {/* <div
        className={`
          fixed
          top-1/2
          right-0
          -translate-y-1/2
          z-[106]
          h-[min(800px,100vh)]
          w-[min(380px,94vw)]
          bg-black/35
          backdrop-blur-2xl
          border-l
          border-y
          border-white/20
          shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
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
          duration-[700ms]
          ease-[cubic-bezier(0.76,0,0.24,1)]
          ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-[110%] pointer-events-none"}
        `}
      >
        <div className="flex flex-col gap-10 w-full min-w-[280px]">
          {/* SLOWER STAGGERED NAV LINKS */}
      {/* <nav className="flex flex-col gap-6">
            {mainNavLinks.map((link, index) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

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
                      whitespace-nowrap
                      transition-all
                      duration-700
                      ease-[cubic-bezier(0.16,1,0.3,1)]
                      ${
                        isActive
                          ? "text-white translate-x-2"
                          : "text-zinc-400 hover:text-white hover:translate-x-2"
                      }
                      ${
                        isOpen
                          ? "translate-y-0 opacity-100"
                          : "translate-y-12 opacity-0 pointer-events-none"
                      }
                    `}
                    style={{
                      transitionDelay: isOpen
                        ? `${300 + index * 160}ms`
                        : "0ms",
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
                            ? "opacity-100 scale-100" 3333333333333333333
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

          {/* SLOWER STAGGERED BOTTOM META */}
      {/* <div
            className={`
              flex
              flex-col
              gap-6
              transition-all
              duration-700
              ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                isOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8 pointer-events-none"
              }
            `}
            style={{
              transitionDelay: isOpen
                ? `${300 + mainNavLinks.length * 160}ms`
                : "0ms",
            }}
          >
            <hr className="border-white/20" />

            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[9px] tracking-[0.3em] text-white/90 uppercase whitespace-nowrap drop-shadow-sm">
                Film Maker, Creative Director &amp; Editor
              </p>

              <div className="flex items-center gap-3">
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/70 uppercase whitespace-nowrap drop-shadow-sm">
                  Kathmandu, Nepal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LANDING BOTTOM CORNER */}
      {/* <Footer /> */}
    </>
  );
}
