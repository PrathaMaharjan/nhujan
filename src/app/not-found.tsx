"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Canvas sizing setup
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Bouncing Box State
    const text = "  PAGE NOT FOUND";
    const colors = [
      "#FF5555",
      "#55FF55",
      "#5555FF",
      "#FFFF55",
      "#FF55FF",
      "#55FFFF",
      "#FFAA00",
    ];
    let currentColorIndex = 0;

    // Box dimensions & initial position
    const boxWidth = 220;
    const boxHeight = 60;
    let x = Math.random() * (canvas.width - boxWidth);
    let y = Math.random() * (canvas.height - boxHeight);

    // Movement speed & direction
    let dx = 2.5;
    let dy = 2.5;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bounce checks against screen boundaries
      let hitWall = false;

      if (x + boxWidth >= canvas.width || x <= 0) {
        dx = -dx;
        hitWall = true;
      }

      if (y + boxHeight >= canvas.height || y <= 0) {
        dy = -dy;
        hitWall = true;
      }

      if (hitWall) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
      }

      // Update position
      x += dx;
      y += dy;

      // Draw bounding box outline
      const currentColor = colors[currentColorIndex];
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      // Draw "404 NOT FOUND" text centered in the box
      ctx.fillStyle = currentColor;
      ctx.font = "700 14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "2px";
      ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black select-none">
      {/* Bouncing Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 block" />

 
    </main>
  );
}