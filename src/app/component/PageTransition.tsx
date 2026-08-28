"use client";

import React, { useContext, useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Freezes the Next.js router context for exiting pages
 * so their rendered DOM and state don't immediately switch to the new route.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const TOP_LEVEL_ORDER: Record<string, number> = {
  "/": 0,
  "/home": 0,
  "/work": 1,
  "/contact": 2,
  "/brands": 3,
};

function isTopLevel(pathname: string): boolean {
  return pathname in TOP_LEVEL_ORDER;
}

// Ultra-smooth, luxurious quintic deceleration curve for soft, cinematic arrival
const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 1.15; // Soft and gracefully paced

const slideVariants = {
  initial: (direction: number) => ({
    x: direction >= 0 ? "100%" : "-100%",
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 2,
    boxShadow:
      direction >= 0
        ? "-30px 0 60px rgba(0,0,0,0.65)"
        : "30px 0 60px rgba(0,0,0,0.65)",
    willChange: "transform",
  }),
  animate: {
    x: "0%",
    position: "relative" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 2,
    boxShadow: "0px 0 0px rgba(0,0,0,0)",
    willChange: "transform",
    transition: {
      x: { duration: DURATION, ease: EASE_SMOOTH },
      boxShadow: { duration: DURATION, ease: EASE_SMOOTH },
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? "-100%" : "100%",
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    willChange: "transform",
    transition: {
      x: { duration: DURATION, ease: EASE_SMOOTH },
    },
  }),
};

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  const [direction, setDirection] = useState(1);

  if (pathname !== prevPath) {
    const isCurrentTopLevel = isTopLevel(pathname);
    const isPrevTopLevel = isTopLevel(prevPath);

    let newDirection = 1;
    if (isCurrentTopLevel && isPrevTopLevel) {
      const prevOrder = TOP_LEVEL_ORDER[prevPath] ?? 0;
      const currentOrder = TOP_LEVEL_ORDER[pathname] ?? 0;
      newDirection = currentOrder >= prevOrder ? 1 : -1;
    }

    setPrevPath(pathname);
    setDirection(newDirection);
  }

  const isCurrentTopLevel = isTopLevel(pathname);

  // If this is a subpage (e.g. /work/film, /work/music-video, /admin, etc.),
  // render directly without the horizontal slide transition.
  if (!isCurrentTopLevel) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
