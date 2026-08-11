"use client";

import BarrelVideo from "@/app/component/BarrelVideo";
import Navigation from "@/app/component/Navigation";

export default function HomePage() {
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#111]">
      {/* SHOWREEL */}
      <div
        className="absolute
          left-1/2
          top-1/2
          w-[85vw]
          max-w-[1400px]
          aspect-video
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <BarrelVideo
          src="/showreel/sample-5s.webm"
          distortion={0.85}
          edgeSoftness={0.02}
          zoom={0.85}
          glow
        />
      </div>

      <Navigation />
    </main>
  );
}
