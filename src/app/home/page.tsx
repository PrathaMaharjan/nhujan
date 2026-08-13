"use client";

import BarrelVideo from "@/app/component/BarrelVideo";
import Navigation from "@/app/component/Navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-black">
      {/* SHOWREEL WITH CRT TV TURN-ON ANIMATION */}
      <div
        className={`absolute
          left-[42%]
          top-1/2
          w-[75vw]
          max-w-[1920px]
          aspect-video
          origin-center
          ${mounted ? "animate-crt-turn-on" : "opacity-0 scale-0"}
        `}
      >
        <BarrelVideo
          src="/showreel/sample-5s.webm"
          distortion={0.85}
          edgeSoftness={0.02}
          zoom={0.85}
          glow
        />

        {/* TV Glow & Power-on flash layer */}
        {mounted && (
          <div className="absolute inset-0 bg-white/20 blur-xl pointer-events-none animate-tv-flash mix-blend-screen" />
        )}
      </div>

      <Navigation />
    </main>
  );
}
