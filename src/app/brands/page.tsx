"use client";

import { CSSProperties, useEffect, useRef } from "react";

/* =========================================================
   GLITTER / STAR FIELD
========================================================= */

type GlitterProps = {
  particleCount: number;
  color1: string;
  color2: string;
  color3: string;
  speed: number;
  density: number;
  starSize: number;
  brightness: number;
  mouseInfluence: number;
  style?: CSSProperties;
};

const GLITTER_DEFAULTS: GlitterProps = {
  particleCount: 500,
  color1: "#ffffff",
  color2: "#ffffff",
  color3: "#ffffff",
  speed: 0.5,
  density: 100,
  starSize: 7,
  brightness: 55,
  mouseInfluence: 0.35,
};

function parseColor(input: string): [number, number, number] {
  if (!input) return [255, 255, 255];

  const s = input.trim();

  if (s.startsWith("#")) {
    let hex = s.slice(1);

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    const num = parseInt(hex, 16);

    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  const match = s.match(/rgba?\(([^)]+)\)/i);

  if (match) {
    const parts = match[1].split(",").map((p) => parseFloat(p.trim()));

    return [parts[0] ?? 255, parts[1] ?? 255, parts[2] ?? 255];
  }

  return [255, 255, 255];
}

function GlitterWrap(incomingProps: Partial<GlitterProps>) {
  const props = {
    ...GLITTER_DEFAULTS,
    ...incomingProps,
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rafRef = useRef<number | null>(null);

  const sizeRef = useRef({
    w: 0,
    h: 0,
    dpr: 1,
  });

  const propsRef = useRef(props);

  propsRef.current = props;

  const mouseRef = useRef({
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    type Star = {
      x: number;
      y: number;
      depth: number;
      size: number;
      alpha: number;
      phase: number;
      phaseSpeed: number;
      color: string;
    };

    const stars: Star[] = [];

    let elapsed = 0;
    let lastTime = performance.now();

    const colors = [
      parseColor(propsRef.current.color1),
      parseColor(propsRef.current.color2),
      parseColor(propsRef.current.color3),
    ];

    const createStar = (): Star => {
      const p = propsRef.current;

      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,

        depth: 0.25 + Math.random() * 0.75,

        size: 0.35 + Math.random() * (p.starSize * 0.08),

        alpha: 0.2 + Math.random() * 0.8,

        phase: Math.random() * Math.PI * 2,

        phaseSpeed: 0.15 + Math.random() * 0.35,

        color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      };
    };

    const syncStars = () => {
      const count = Math.max(1, Math.floor(propsRef.current.particleCount));

      while (stars.length < count) {
        stars.push(createStar());
      }

      if (stars.length > count) {
        stars.length = count;
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const w = Math.max(1, Math.floor(rect.width));

      const h = Math.max(1, Math.floor(rect.height));

      if (
        sizeRef.current.w === w &&
        sizeRef.current.h === h &&
        sizeRef.current.dpr === dpr
      ) {
        return;
      }

      sizeRef.current = {
        w,
        h,
        dpr,
      };

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncStars();
    resize();

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth - 0.5;

      mouseRef.current.targetY = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    const draw = (time: number) => {
      const delta = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));

      lastTime = time;
      elapsed += delta;

      const { speed, brightness, mouseInfluence } = propsRef.current;

      const { w, h } = sizeRef.current;

      const mouse = mouseRef.current;

      mouse.x += (mouse.targetX - mouse.x) * Math.min(1, delta * 3);

      mouse.y += (mouse.targetY - mouse.y) * Math.min(1, delta * 3);

      ctx.clearRect(0, 0, w, h);

      /*
       * Extremely subtle ambient drift.
       */
      const driftX = Math.sin(elapsed * 0.18 * speed) * 0.006;

      const driftY = Math.cos(elapsed * 0.15 * speed) * 0.006;

      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        const floatX =
          Math.sin(elapsed * star.phaseSpeed * speed + star.phase) * 0.004;

        const floatY =
          Math.cos(elapsed * star.phaseSpeed * speed * 0.82 + star.phase) *
          0.004;

        const parallax = mouseInfluence * star.depth;

        const x = star.x + floatX + driftX + mouse.x * parallax * 0.025;

        const y = star.y + floatY + driftY + mouse.y * parallax * 0.025;

        const screenX = (x + 0.5) * w;

        const screenY = (y + 0.5) * h;

        const breathe =
          0.82 + Math.sin(elapsed * star.phaseSpeed * 1.5 + star.phase) * 0.18;

        const alpha = star.alpha * breathe * (brightness / 100);

        ctx.globalAlpha = alpha;

        ctx.fillStyle = star.color;

        ctx.beginPath();

        ctx.arc(
          screenX,
          screenY,
          star.size * (0.7 + star.depth * 0.5),
          0,
          Math.PI * 2,
        );

        ctx.fill();
      }

      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      resizeObserver.disconnect();

      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="
        pointer-events-none
        absolute
        inset-0
        overflow-hidden
      "
      style={{
        ...props.style,
      }}
    >
      <canvas
        ref={canvasRef}
        className="
          absolute
          inset-0
          block
          h-full
          w-full
        "
      />
    </div>
  );
}

/* =========================================================
   BRANDS
========================================================= */

const BRANDS = [
  {
    name: "ADIDAS",
    image: "/Adidas_Logo 2.png",
  },
  {
    name: "CLOSEUP",
    image: "/Closeup logo.png",
  },
  {
    name: "DARAZ",
    image: "/Daraz_Logo.png",
  },
  {
    name: "ESEWA",
    image: "/esewa.png",
  },

  /*
   * Add more brand logos here.
   *
   * Example:
   *
   * {
   *   name: "BRAND NAME",
   *   image: "/brand-logo.png",
   * },
   */
];

/*
 * The exact credit-style row structure.
 *
 * 3
 * 4
 * 4
 * 3
 * 2
 *
 * If you add more logos above, they will be
 * distributed into these rows.
 */
const BRAND_ROWS = [3, 4, 4, 3, 2];

/* =========================================================
   ARTISTS
========================================================= */

const ARTISTS = [
  "Shushant KC",
  "Ujjan Shakya",
  "Artist 3",
  "Artist 4",
  "Artist 5",
  "Artist 6",
];

/* =========================================================
   CREDIT ROW BUILDER
========================================================= */

function buildBrandRows() {
  const rows: (typeof BRANDS)[] = [];

  let cursor = 0;

  for (const rowSize of BRAND_ROWS) {
    const row = BRANDS.slice(cursor, cursor + rowSize);

    if (row.length > 0) {
      rows.push(row);
    }

    cursor += rowSize;
  }

  /*
   * If there are more brands than the
   * predefined rows, put the remainder
   * into additional centered rows.
   */
  if (cursor < BRANDS.length) {
    const remainder = BRANDS.slice(cursor);

    for (let i = 0; i < remainder.length; i += 4) {
      rows.push(remainder.slice(i, i + 4));
    }
  }

  return rows;
}

/* =========================================================
   PAGE
========================================================= */

export default function BrandsPage() {
  const brandRows = buildBrandRows();

  return (
    <main
      className="
        relative
        h-dvh
        w-dvw
        overflow-hidden
        bg-black
        text-white
        select-none
      "
    >
      {/* =====================================================
          GLITTER
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
        "
      >
        <GlitterWrap
          particleCount={500}
          color1="#ffffff"
          color2="#ffffff"
          color3="#ffffff"
          speed={0.5}
          density={100}
          starSize={7}
          brightness={55}
          mouseInfluence={0.35}
        />
      </div>

      {/* =====================================================
          ATMOSPHERE
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
        "
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.025), transparent 45%)",
        }}
      />

      {/* =====================================================
          FILM GRAIN
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          opacity-[0.025]
        "
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")",
        }}
      />

      {/* =====================================================
          MAIN CREDIT COMPOSITION
      ===================================================== */}

      <div
        className="
          absolute
          inset-0
          z-10
          flex
          flex-col
          items-center
          justify-center
          overflow-hidden
          px-5
          py-6
          sm:px-8
          md:px-12
        "
      >
        {/* ===================================================
            MAIN TITLE
        =================================================== */}

        <header
          className="
            mb-7
            shrink-0
            text-center
            sm:mb-8
            md:mb-10
          "
        >
          <h1
            className="
              font-sans
              text-[clamp(2rem,5vw,4.5rem)]
              font-black
              uppercase
              leading-none
              tracking-[-0.045em]
              text-white
            "
            style={{
              textShadow: "0 0 24px rgba(255,255,255,0.12)",
            }}
          >
            Collaborations.
          </h1>
        </header>

        {/* ===================================================
            CREDITS BODY
        =================================================== */}

        <div
          className="
            flex
            w-full
            max-w-[900px]
            min-h-0
            flex-col
            items-center
          "
        >
          {/* =================================================
              BRANDS
          ================================================= */}

          <section
            className="
              flex
              w-full
              flex-col
              items-center
            "
          >
            <h2
              className="
                mb-4
                font-mono
                text-[9px]
                font-medium
                uppercase
                tracking-[0.35em]
                text-white/45
                sm:mb-5
                sm:text-[10px]
              "
            >
              Brands
            </h2>

            {/* ===============================================
                LOGO ROWS
            =============================================== */}

            <div
              className="
                flex
                w-full
                flex-col
                items-center
                gap-2
                sm:gap-3
                md:gap-3.5
              "
            >
              {brandRows.map((row, rowIndex) => (
                <div
                  key={`brand-row-${rowIndex}`}
                  className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-4
                      sm:gap-7
                      md:gap-10
                    "
                >
                  {row.map((brand, index) => (
                    <div
                      key={`${brand.name}-${rowIndex}-${index}`}
                      className="
                            flex
                            h-10
                            w-16
                            items-center
                            justify-center
                            sm:h-12
                            sm:w-20
                            md:h-14
                            md:w-24
                          "
                    >
                      <img
                        src={brand.image}
                        alt={brand.name}
                        draggable={false}
                        className="
                              block
                              max-h-full
                              max-w-full
                              object-contain
                              brightness-0
                              invert
                              opacity-90
                            "
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            className="
              my-6
              h-px
              w-24
              shrink-0
              bg-white/10
              sm:my-7
              md:my-8
            "
          />

          {/* =================================================
              ARTISTS
          ================================================= */}

          <section
            className="
              flex
              w-full
              flex-col
              items-center
            "
          >
            <h2
              className="
                mb-4
                font-mono
                text-[9px]
                font-medium
                uppercase
                tracking-[0.35em]
                text-white/45
                sm:mb-5
                sm:text-[10px]
              "
            >
              Artists
            </h2>

            {/* ===============================================
                ARTIST CREDIT LINES
            =============================================== */}

            <div
              className="
                flex
                w-full
                flex-wrap
                items-center
                justify-center
                gap-x-2
                gap-y-1.5
                px-3
                text-center
                sm:gap-x-3
                sm:gap-y-2
              "
            >
              {ARTISTS.map((artist, index) => (
                <div
                  key={artist}
                  className="
                      flex
                      items-center
                      whitespace-nowrap
                    "
                >
                  <span
                    className="
                        font-sans
                        text-[10px]
                        font-medium
                        tracking-[0.01em]
                        text-white/80
                        sm:text-xs
                        md:text-sm
                      "
                  >
                    {artist}
                  </span>

                  {index < ARTISTS.length - 1 && (
                    <span
                      className="
                          ml-2
                          text-[8px]
                          text-white/25
                          sm:ml-3
                          sm:text-[9px]
                        "
                    >
                      •
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* =====================================================
          VERY SUBTLE VIGNETTE
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-20
        "
        style={{
          background:
            "radial-gradient(circle, transparent 48%, rgba(0,0,0,0.28) 100%)",
        }}
      />

      {/* =====================================================
          REDUCED MOTION
      ===================================================== */}

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          canvas {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
