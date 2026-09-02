"use client";

import { useEffect, useRef, useState } from "react";
import MeshText from "@/app/component/MeshText";

interface BrandItem {
  id?: string;
  name: string;
  image: string;
  order?: number;
  posX?: number | null;
  posY?: number | null;
}

interface ArtistItem {
  id?: string;
  name: string;
  order?: number;
  posX?: number | null;
  posY?: number | null;
}

const FALLBACK_BRAND_LOGOS: BrandItem[] = [
  { name: "ADIDAS", image: "/Adidas_Logo 2.png" },
  { name: "CLOSEUP", image: "/Closeup logo.png" },
  { name: "UNILEVER", image: "/brands/Unilever.svg" },
  { name: "DARAZ", image: "/Daraz_Logo.png" },
  { name: "ESEWA", image: "/esewa.png" },
  { name: "MERCEDES", image: "/brands/Mercedes.svg" },
  { name: "SAMSUNG", image: "/brands/Samsung.svg" },
  { name: "NIKE", image: "/brands/Nike.svg" },
];

const FALLBACK_ARTISTS: ArtistItem[] = [
  { name: "Shushant KC" },
  { name: "Ujjan Shakya" },
  { name: "Sajjan Raj Vaidya" },
  { name: "Sushant Ghimire" },
  { name: "Nabin K Bhattarai" },
  { name: "Albatross" },
  { name: "Rohit John Chettri" },
  { name: "Bartika Eam Rai" },
  { name: "Phosphenes" },
  { name: "The Elements" },
  { name: "Kutumba" },
  { name: "Mingma Sherpa" },
  { name: "Yabesh Thapa" },
  { name: "Swoopna Suman" },
  { name: "Rachana Dahal" },
  { name: "Vek" },
  { name: "Prabesh Kumar Shrestha" },
  { name: "Diwas Gurung" },
  { name: "Bipul Chettri" },
  { name: "1974 AD" },
];

function BrandSticker({
  name,
  image,
  style,
}: {
  name: string;
  image: string;
  style?: React.CSSProperties;
}) {
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

  if (!image) return null;

  return (
    <div
      className="flex items-center justify-center"
      style={style}
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

function ArtistSticker({
  name,
  style,
}: {
  name: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="flex items-center justify-center px-1.5 py-1 text-center text-white"
      style={style}
    >
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
  const [brands, setBrands] = useState<BrandItem[]>(FALLBACK_BRAND_LOGOS);
  const [artists, setArtists] = useState<ArtistItem[]>(FALLBACK_ARTISTS);
  const [paw, setPaw] = useState({ x: 0, y: 0, visible: false });

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.brands) && data.brands.length > 0) {
            setBrands(data.brands);
          }
          if (Array.isArray(data.artists) && data.artists.length > 0) {
            setArtists(data.artists);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading brands/artists:", err);
      });
  }, []);

  const hasCustomCoordinates =
    brands.some((b) => typeof b.posX === "number" && typeof b.posY === "number") ||
    artists.some((a) => typeof a.posX === "number" && typeof a.posY === "number");

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

      {/* CUSTOM POSITIONED CANVAS LAYOUT */}
      {hasCustomCoordinates ? (
        <div className="absolute inset-0 z-10 overflow-hidden">
          {brands.map((brand, idx) => {
            const hasPos = typeof brand.posX === "number" && typeof brand.posY === "number";
            const x = hasPos ? brand.posX! : 15 + (idx % 4) * 22;
            const y = hasPos ? brand.posY! : 18 + Math.floor(idx / 4) * 16;

            return (
              <BrandSticker
                key={brand.id || `${brand.name}-${idx}`}
                name={brand.name}
                image={brand.image}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}

          {artists.map((artist, idx) => {
            const hasPos = typeof artist.posX === "number" && typeof artist.posY === "number";
            const x = hasPos ? artist.posX! : 12 + (idx % 5) * 18;
            const y = hasPos ? artist.posY! : 55 + Math.floor(idx / 5) * 10;

            return (
              <ArtistSticker
                key={artist.id || `${artist.name}-${idx}`}
                name={artist.name}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </div>
      ) : (
        /* DEFAULT AUTO FLOW LAYOUT */
        <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full w-full items-center justify-center px-4 py-16 sm:px-6 md:px-10">
            <div className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 sm:gap-10">
              {/* BRAND LOGOS SECTION */}
              <section className="flex w-full flex-col items-center justify-center">
                <h2 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                  Brands
                </h2>

                <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
                  {brands.map((brand, idx) => (
                    <BrandSticker
                      key={brand.id || `${brand.name}-${idx}`}
                      name={brand.name}
                      image={brand.image}
                    />
                  ))}
                </div>
              </section>

              <div className="h-px w-20 bg-white/10" />

              {/* ARTISTS SECTION */}
              <section className="flex w-full flex-col items-center justify-center">
                <h2 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                  Artists
                </h2>

                <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                  {artists.map((artist, idx) => (
                    <ArtistSticker
                      key={artist.id || `${artist.name}-${idx}`}
                      name={artist.name}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

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
