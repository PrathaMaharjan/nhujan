"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import * as THREE from "three";

interface GalleryItem {
  id: number;
  title: string;
  image: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "KATHAK DANCE",
    image:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "TAJ MAHAL",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "HAWA MAHAL",
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "GOLDEN TEMPLE",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "ROYAL PALACE",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
  },
];

// Refined De Maldé Horizontal Barrel Drum Shader
const HorizontalBarrelShader = {
  uniforms: {
    uTexture: { value: null },
    uCurvature: { value: 0.35 },
    uOffset: { value: 0.0 },
  },
  vertexShader: `
    uniform float uCurvature;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Horizontal barrel curvature math (taper top/bottom towards sides)
      float centerDist = abs(pos.x / 3.1);
      float bendFactor = cos(centerDist * 1.57079);
      
      // Compress vertical vertices progressively along X axis
      pos.y *= mix(1.0 - uCurvature, 1.0, bendFactor);
      pos.z += (1.0 - bendFactor) * uCurvature * 2.0;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uOffset;
    varying vec2 vUv;
    void main() {
      vec2 uv = vec2(fract(vUv.x + uOffset), vUv.y);
      gl_FragColor = texture2D(uTexture, uv);
    }
  `,
};

export default function ProjectDetailPage() {
  const placeholderVimeoId = "76979871";
  const [rotationY, setRotationY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSliderDragging, setIsSliderDragging] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const startXRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);
  const activeItemRef = useRef<GalleryItem | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rotationYRef = useRef<number>(0);

  const N = GALLERY_ITEMS.length;
  const REPEATS = 2;
  const totalSlots = N * REPEATS;
  const angleStep = 360 / totalSlots;
  const radius = 980;

  const slots = Array.from({ length: totalSlots }, (_, slotIdx) => ({
    slotIdx,
    item: GALLERY_ITEMS[slotIdx % N],
  }));

  // Sync ref with rotationY state
  useEffect(() => {
    rotationYRef.current = rotationY;
  }, [rotationY]);

  // Build the unified texture ribbon for WebGL drum view
  const createRibbonTexture = (): Promise<THREE.CanvasTexture> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const itemWidth = 800;
      const itemHeight = 1000;
      canvas.width = itemWidth * totalSlots;
      canvas.height = itemHeight;
      const ctx = canvas.getContext("2d")!;

      let loadedCount = 0;
      slots.forEach(({ item }, index) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.image;
        img.onload = () => {
          ctx.drawImage(img, index * itemWidth, 0, itemWidth, itemHeight);
          loadedCount++;
          if (loadedCount === totalSlots) {
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          }
        };
      });
    });
  };

  // WebGL initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(6.2, 3.1, 128, 128);

    createRibbonTexture().then((texture) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uCurvature: { value: 0.35 },
          uOffset: { value: 0.0 },
        },
        vertexShader: HorizontalBarrelShader.vertexShader,
        fragmentShader: HorizontalBarrelShader.fragmentShader,
        side: THREE.DoubleSide,
      });

      materialRef.current = material;
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (materialRef.current) {
        const normDeg = ((-rotationYRef.current % 360) + 360) % 360;
        materialRef.current.uniforms.uOffset.value = normDeg / 360;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Main Stage Handlers
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    item: GalleryItem,
  ) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startRotationRef.current = rotationY;
    activeItemRef.current = item;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 5) {
      activeItemRef.current = null;
    }
    const sensitivity = 0.15;
    setRotationY(startRotationRef.current - deltaX * sensitivity);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
    if (activeItemRef.current) {
      setSelectedItem(activeItemRef.current);
      activeItemRef.current = null;
    }
  };

  // Slider Handlers
  const updateRotationFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    let fraction = (clientX - rect.left) / rect.width;
    fraction = Math.min(Math.max(fraction, 0), 1);
    setRotationY(-fraction * 360);
  };

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsSliderDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateRotationFromClientX(e.clientX);
  };

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSliderDragging) return;
    updateRotationFromClientX(e.clientX);
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSliderDragging) return;
    setIsSliderDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
  };

  const normalizedDeg = ((-rotationY % 360) + 360) % 360;
  const sliderFraction = normalizedDeg / 360;
  const currentIndex =
    Math.min(N - 1, Math.floor((normalizedDeg / (360 / N)) % N)) + 1;

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black flex flex-col overflow-x-hidden select-none">
      {/* Header */}
      <header className="w-full px-6 md:px-12 py-8 flex items-center justify-between sticky top-0 bg-gradient-to-b from-black via-black/90 to-transparent z-30">
        <Link
          href="/work/commercial"
          className="text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors uppercase flex items-center gap-2"
        >
          <span>←</span> BACK
        </Link>

        <h1
          className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase text-white"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          NHUJAN
        </h1>

        <div className="w-12" />
      </header>

      {/* Main Container */}
      <div className="w-full max-w-8xl mx-auto px-6 md:px-12 pt-4 pb-32 flex flex-col gap-12">
        {/* Video Player */}
        <section className="relative w-full aspect-video bg-black overflow-hidden shadow-2xl group border border-white/10">
          <iframe
            src={`https://player.vimeo.com/video/${placeholderVimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
            className="relative w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </section>

        {/* Section Divider */}
        <div className="w-full flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-[10px] font-mono tracking-[0.3em] text-slate-400 uppercase">
            STILLS & FRAMES
          </span>
          <span className="text-[10px] font-mono tracking-[0.3em] text-slate-400 uppercase">
            CLICK TO OPEN / DRAG SLIDER TO BEND
          </span>
        </div>

        {/* Interactive Dual-Mode Stage */}
        <section className="w-full relative h-[70vh] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing border-y border-white/10 bg-black">
          {/* Curved WebGL Drum View (Appears exclusively when dragging bottom slider) */}
          <div
            ref={mountRef}
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none ${
              isSliderDragging ? "opacity-100 z-20" : "opacity-0 z-0"
            }`}
          />

          {/* Normal Flat CSS Carousel View (Active at rest or dragging directly) */}
          <div
            className={`w-full h-full flex items-center justify-center transition-opacity duration-300 ${
              isSliderDragging ? "opacity-0" : "opacity-100"
            }`}
            style={{
              perspective: "1600px",
              perspectiveOrigin: "50% 50%",
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className={`relative w-[640px] aspect-[16/10] ${
                isDragging
                  ? "transition-transform duration-100"
                  : "transition-transform duration-500"
              } ease-out`}
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotationY}deg)`,
              }}
            >
              {slots.map(({ slotIdx, item }) => {
                const itemAngle = slotIdx * angleStep;

                return (
                  <div
                    key={`${item.id}-${slotIdx}`}
                    className={`absolute inset-0 w-full h-full ${
                      isDragging
                        ? "transition-transform duration-100"
                        : "transition-transform duration-500"
                    } ease-out`}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `rotateY(${itemAngle}deg) translateZ(-${radius}px)`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="w-full h-full px-5 box-border">
                      <div
                        className="relative w-full h-full overflow-hidden cursor-pointer hover:opacity-85 transition-opacity border border-white/10 shadow-2xl"
                        onPointerDown={(e) => handlePointerDown(e, item)}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover pointer-events-none block"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Navigation Slider */}
        <div className="w-full flex items-center justify-center gap-4 select-none">
          <span className="text-lg font-serif italic text-slate-300 w-6 text-right">
            {currentIndex}
          </span>

          <span className="text-slate-600">·</span>

          <div
            ref={trackRef}
            className="relative flex-1 max-w-md h-8 flex items-center cursor-pointer touch-none"
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            onPointerCancel={handleSliderPointerUp}
          >
            <div className="w-full h-px bg-white/20" />

            <div
              className="absolute top-1/2 w-3 h-3 rounded-full bg-white shadow-md pointer-events-none transition-[left] duration-100 ease-out"
              style={{
                left: `${sliderFraction * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <span className="text-slate-600">·</span>

          <span className="text-lg font-serif italic text-slate-300 w-6">
            {N}
          </span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-8 right-8 text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors uppercase z-10"
          >
            CLOSE [✕]
          </button>

          <div
            className="relative max-w-5xl max-h-[80vh] w-full h-full flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="max-w-full max-h-[75vh] object-contain border border-white/10 shadow-2xl"
            />
            <p className="text-xs font-mono tracking-[0.3em] text-slate-300 uppercase">
              {selectedItem.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
