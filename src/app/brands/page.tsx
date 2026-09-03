"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MeshText from "@/app/component/MeshText";
import { getOptimizedImageUrl } from "@/lib/media";

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
      className="flex items-center justify-center select-none"
      style={{ ...style, touchAction: "pan-y" }}
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
          height: 34,
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
        <Image
          src={getOptimizedImageUrl(image, { width: 200, quality: 80 })}
          alt={name}
          width={160}
          height={40}
          unoptimized={typeof image === "string" && image.endsWith(".svg")}
          draggable={false}
          className="h-7 sm:h-8 md:h-9 w-auto object-contain pointer-events-none select-none"
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
      className="group flex items-center justify-center px-2 py-1 text-center text-white select-none cursor-pointer transition-transform duration-300 hover:scale-105"
      style={style}
    >
      <span className="font-sans text-[13px] sm:text-[14px] md:text-[16px] font-black uppercase tracking-[0.02em] text-white/80 transition-colors duration-300 group-hover:text-white">
        {name}
      </span>
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
    <main className="relative min-h-[100dvh] h-screen h-[100dvh] w-full overflow-hidden bg-black text-white select-none">
      {/* Translucent Frosted Glass Background Video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <video
          src="/showreel/showreel_preview.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover scale-110 filter blur-[22px] sm:blur-[28px] brightness-[0.5] contrast-[1.15] opacity-55 transform-gpu pointer-events-none"
        />
        {/* Deep Frosted Translucent Glass Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[16px]" />
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-full w-full items-center justify-center px-4 pt-20 pb-20 sm:px-6 sm:pt-24 sm:pb-24 md:px-10">
          <div className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 sm:gap-10 my-auto">
            {/* BRAND LOGOS SECTION */}
            <section className="flex w-full flex-col items-center justify-center">
              <h2 className="mb-4 sm:mb-5 font-sans text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
                Brands
              </h2>

              <div className="flex w-full flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
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
              <h2 className="mb-4 sm:mb-5 font-sans text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
                Artists
              </h2>

              <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
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
