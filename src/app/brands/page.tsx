"use client";

import { useEffect, useRef, useState } from "react";
import MeshText from "@/app/component/MeshText";

interface BrandItem {
  id?: string;
  name: string;
  image: string;
  order?: number;
}

interface ArtistItem {
  id?: string;
  name: string;
  order?: number;
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

    setState({ x: 0, y: 0, lift: 8, active: true });
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

    const nextX = clamp(distX * 0.22, -28, 28);
    const nextY = clamp(distY * 0.22, -28, 28);
    const lift = clamp(distance * 0.12 + velocity * 0.08, 8, 20);

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
        className="brand-logo"
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate3d(${state.x}px, ${state.y - state.lift}px, 0) rotateX(${state.y * -0.35}deg) rotateY(${state.x * 0.35}deg) scale(${state.active ? 1.08 : 1})`,
          transformStyle: "preserve-3d",
          transition: state.active
            ? "none"
            : "transform 620ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: "brightness(0) invert(1)",
          cursor: "grab",
        }}
      >
        <img
          src={image}
          alt={name}
          draggable={false}
          style={{
            height: 36,
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
            fontSize: 16,
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

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#0b0b0b] text-white select-none">
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
            {/* BRAND LOGOS SECTION */}
            <section className="flex w-full flex-col items-center justify-center">
              <h2 className="mb-5 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                Brands
              </h2>

              <div className="flex w-full flex-wrap items-center justify-center gap-10 sm:gap-12 md:gap-14">
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

              <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-5 md:gap-6">
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
    </main>
  );
}
