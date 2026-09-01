"use client";

import { useRef, useState } from "react";
import MeshText from "@/app/component/MeshText";

const BRAND_LOGOS = [
  { name: "ADIDAS", image: "/Adidas_Logo 2.png" },
  { name: "CLOSEUP", image: "/Closeup logo.png" },
  { name: "UNILEVER", image: "/brands/Unilever.svg" },
  { name: "DARAZ", image: "/Daraz_Logo.png" },
  { name: "ESEWA", image: "/esewa.png" },
  { name: "MERCEDES", image: "/brands/Mercedes.svg" },
  { name: "SAMSUNG", image: "/brands/Samsung.svg" },
  { name: "NIKE", image: "/brands/Nike.svg" },
];

const ARTISTS = [
  "Shushant KC",
  "Ujjan Shakya",
  "Sajjan Raj Vaidya",
  "Sushant Ghimire",
  "Nabin K Bhattarai",
  "Albatross",
  "Rohit John Chettri",
  "Bartika Eam Rai",
  "Phosphenes",
  "The Elements",
  "Kutumba",
  "Mingma Sherpa",
  "Yabesh Thapa",
  "Swoopna Suman",
  "Rachana Dahal",
  "Vek",
  "Prabesh Kumar Shrestha",
  "Diwas Gurung",
  "Bipul Chettri",
  "1974 AD",
];

function BrandSticker({ name, image }: { name: string; image: string }) {
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    active: false,
  });

  const [state, setState] = useState({ x: 0, y: 0, lift: 0, active: false });

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      active: true,
    };

    setState({ x: 0, y: 0, lift: 10, active: true });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;
    const distX = event.clientX - dragRef.current.startX;
    const distY = event.clientY - dragRef.current.startY;
    const distance = Math.hypot(distX, distY);
    const velocity = Math.hypot(dx, dy);

    const nextX = clamp(distX * 0.18, -18, 18);
    const nextY = clamp(distY * -0.18, -18, 18);
    const lift = clamp(distance * 0.18 + velocity * 0.12, 0, 18);

    setState({
      x: nextX,
      y: nextY,
      lift,
      active: true,
    });

    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setState({ x: 0, y: 0, lift: 0, active: false });
  };

  return (
    <div
      className="flex items-center justify-center"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        dragRef.current.active = false;
        setState({ x: 0, y: 0, lift: 0, active: false });
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate3d(0, ${-state.lift}px, 0) rotateX(${state.y * 0.9}deg) rotateY(${state.x * 0.9}deg) scale(${state.active ? 1.04 : 0.9})`,
          transformStyle: "preserve-3d",
          transition: state.active ? "none" : "transform 220ms ease, box-shadow 220ms ease",
          boxShadow: "0 8px 12px rgba(0,0,0,0.18)",
          filter: "brightness(0) invert(1)",
          cursor: "grab",
        }}
      >
        <img
          src={image}
          alt={name}
          draggable={false}
          style={{
            height: 64,
            width: "auto",
            display: "block",
            objectFit: "contain",
            opacity: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function ArtistSticker({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-1.5 py-1 text-center text-white">
      <div className="inline-block">
        <MeshText
          text={name}
          color="#ffffff"
          font={{
            fontFamily: "Inter",
            fontWeight: 900,
            fontSize: 20,
            lineHeight: "1.05em",
            letterSpacing: "0.01em",
            textAlign: "left",
          }}
          glitchMode={false}
          enableHover={true}
          hoverIntensity={2.5}
          baseIntensity={0}
          fuzzRange={12}
          fps={60}
        />
      </div>
    </div>
  );
}

export default function BrandsPage() {
  const [paw, setPaw] = useState({ x: 0, y: 0, visible: false });

  return (
    <main
      className="relative h-screen w-full overflow-hidden bg-[#0b0b0b] text-white select-none cursor-none"
      onPointerMove={(event) => {
        setPaw({ x: event.clientX, y: event.clientY, visible: true });
      }}
      onPointerLeave={() => setPaw({ x: 0, y: 0, visible: false })}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_42%)]" />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.08] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-full w-full items-center justify-center px-4 py-16 sm:px-6 md:px-10">
          <div className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 sm:gap-10">
            <section className="flex w-full flex-col items-center justify-center">
              <h2 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                Brands
              </h2>

              <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
                {BRAND_LOGOS.map((brand) => (
                  <BrandSticker
                    key={brand.name}
                    name={brand.name}
                    image={brand.image}
                  />
                ))}
              </div>
            </section>

            <div className="h-px w-20 bg-white/10" />

            <section className="flex w-full flex-col items-center justify-center">
              <h2 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                Artists
              </h2>

              <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                {ARTISTS.map((artist) => (
                  <ArtistSticker key={artist} name={artist} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {paw.visible && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: paw.x,
            top: paw.y,
            transform: "translate(-18%, -18%)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          >
            <circle cx="8" cy="7" r="2" fill="white" />
            <circle cx="15" cy="7" r="2" fill="white" />
            <circle cx="5" cy="12" r="2" fill="white" />
            <circle cx="18" cy="12" r="2" fill="white" />
            <ellipse cx="11.5" cy="16.5" rx="5.5" ry="4.5" fill="white" />
            <path
              d="M11.5 2.5L14 6.2L11.5 4.5L9 6.2L11.5 2.5Z"
              fill="white"
              opacity="0.8"
            />
          </svg>
        </div>
      )}
    </main>
  );
}
