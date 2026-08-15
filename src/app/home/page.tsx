"use client";

import FullscreenVideo from "@/app/component/FullscreenVideo";
import Navigation from "@/app/component/Navigation";
import { useState } from "react";

export default function HomePage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [videoTime, setVideoTime] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(true);

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = (currentTime: number, playing: boolean) => {
    setVideoTime(currentTime);
    setWasPlaying(playing);
    setIsFullscreen(false);
  };

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-black">
      {/* =================================================
          NAVIGATION
      ================================================= */}

      {!isFullscreen && <Navigation />}

      {/* =================================================
          SHOWREEL PREVIEW
          NORMAL VIDEO — NO BARREL / FISHEYE
      ================================================= */}

      {!isFullscreen && (
        <div
          className="fixed inset-0 h-[100dvh] w-[100dvw] cursor-pointer overflow-hidden"
          onClick={openFullscreen}
        >
          <video
            src="/showreel/Showreel Draft.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="
        absolute
        inset-0
        h-[100dvh]
        w-[100dvw]
        object-cover
        grayscale-[0.8]
        saturate-[0.25]
        opacity-90
      "
          />

          {/* Subtle dark overlay */}
          <div
            className="
        pointer-events-none
        absolute
        inset-0
        bg-black/10
      "
          />

          {/* PLAY */}
          <div
            className="
        pointer-events-none
        absolute
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2
        text-[11px]
        uppercase
        tracking-[0.25em]
        text-white
        opacity-0
        transition-opacity
        duration-300
      "
          >
            PLAY
          </div>
        </div>
      )}

      {/* =================================================
          FULLSCREEN VIDEO
          REUSABLE COMPONENT
      ================================================= */}

      <FullscreenVideo
        src="/showreel/Showreel Draft.mp4"
        isOpen={isFullscreen}
        startTime={videoTime}
        wasPlaying={wasPlaying}
        onClose={closeFullscreen}
      />
    </main>
  );
}
