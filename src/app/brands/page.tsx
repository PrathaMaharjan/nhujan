"use client";

import { useState } from "react";

const BRAND_LOGOS = [
  { name: "ADIDAS", image: "/Adidas_Logo 2.png" },
  { name: "CLOSEUP", image: "/Closeup logo.png" },
  { name: "UNILEVER", image: "/brands/Unilever.svg" },
  { name: "DARAZ", image: "/Daraz_Logo.png" },
  { name: "ESEWA", image: "/esewa.png" },
];

const BRANDS = Array.from({ length: 16 }, (_, index) => {
  const logo = BRAND_LOGOS[index % BRAND_LOGOS.length];

  return {
    name: `${logo.name}-${index + 1}`,
    image: logo.image,
  };
});

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

const brandMarquees = [
  { items: BRANDS.slice(0, 6), direction: "left" as const, speed: 95 },
  {
    items: [...BRANDS].slice(0, 7).reverse(),
    direction: "right" as const,
    speed: 82,
  },
  { items: BRANDS.slice(0, 8), direction: "left" as const, speed: 95 },
  {
    items: [...BRANDS].slice(0, 5).reverse(),
    direction: "right" as const,
    speed: 95,
  },
];

const artistMarquees = [
  { items: ARTISTS.slice(0, 9), direction: "right" as const, speed: 95 },
  {
    items: [...ARTISTS].slice(0, 11).reverse(),
    direction: "left" as const,
    speed: 95,
  },
];

export default function BrandsPage() {
  const [torch, setTorch] = useState({ x: 50, y: 50 });

  return (
    <main
      className="relative h-screen w-full overflow-hidden bg-[#0b0b0b] text-white select-none"
      onPointerMove={(event) => {
        setTorch({ x: event.clientX, y: event.clientY });
      }}
      onPointerLeave={() => setTorch({ x: 50, y: 50 })}
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.04), transparent 36%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.025), transparent 45%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.09] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: `radial-gradient(circle at ${torch.x}px ${torch.y}px, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 10%, rgba(255,255,255,0.05) 18%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.98) 100%)`,
        }}
      />

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-16 sm:px-6 md:px-10">
          <div className="flex w-full max-w-[1200px] flex-col items-center gap-8 sm:gap-10">
            <section className="flex w-full flex-col items-center">
              <h2 className="mb-4 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                Brands
              </h2>

              <div className="flex w-full flex-col gap-3 sm:gap-4">
                {brandMarquees.map(({ items, direction, speed }, rowIndex) => (
                  <div key={`brand-row-${rowIndex}`} className="marquee-shell">
                    <div
                      className={`marquee-track ${direction === "left" ? "marquee-left" : "marquee-right"}`}
                      style={{ animationDuration: `${speed}s` }}
                    >
                      {[...items, ...items, ...items].map((brand, index) => (
                        <div
                          key={`${brand.name}-${rowIndex}-${index}`}
                          className="brand-tile"
                        >
                          <img
                            src={brand.image}
                            alt={brand.name}
                            draggable={false}
                            className="block h-full w-full object-contain brightness-0 invert opacity-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px w-20 bg-white/10" />

            <section className="flex w-full flex-col items-center">
              <h2 className="mb-4 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 sm:text-[11px]">
                Artists
              </h2>

              <div className="flex w-full flex-col gap-3 sm:gap-4">
                {artistMarquees.map(({ items, direction, speed }, rowIndex) => (
                  <div key={`artist-row-${rowIndex}`} className="marquee-shell">
                    <div
                      className={`marquee-track ${direction === "left" ? "marquee-left" : "marquee-right"}`}
                      style={{ animationDuration: `${speed}s` }}
                    >
                      {[...items, ...items, ...items].map((artist, index) => (
                        <div
                          key={`${artist}-${rowIndex}-${index}`}
                          className="artist-tile"
                        >
                          <span>{artist}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(circle, transparent 48%, rgba(0,0,0,0.28) 100%)",
        }}
      />
    </main>
  );
}
