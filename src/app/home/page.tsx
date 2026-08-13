"use client";

import BarrelVideo from "@/app/component/BarrelVideo";
import Navigation from "@/app/component/Navigation";
import Preloader from "@/app/component/Preloader";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      /*
       * Convert mouse position to a range of:
       *
       * -1 = far left / top
       *  0 = center
       *  1 = far right / bottom
       */
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      setMouse({
        x,
        y,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-black">
      {/* {loading && <Preloader onComplete={() => setLoading(false)} />} */}
      {/* SHOWREEL */}
      <div
        className="absolute
          left-1/2
          top-1/2
          w-[75vw]
          max-w-[1920px]
          aspect-video
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <div
          className="w-full h-full"
          style={{
            transform: `
              translate3d(
                ${mouse.x * 10}px,
                ${mouse.y * 7}px,
                0
              )
              rotateX(${mouse.y * -0.7}deg)
              rotateY(${mouse.x * 0.9}deg)
            `,
            transition: "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          <BarrelVideo
            src="/showreel/sample-5s.webm"
            distortion={0.85}
            edgeSoftness={0.02}
            zoom={0.85}
            glow
          />
        </div>
      </div>

      <Navigation />
    </main>
  );
}
