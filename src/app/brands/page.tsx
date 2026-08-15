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

    if (!container || !canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

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

const BRAND_LOGOS = [
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
];

/*
 * 40 test brand credits.
 *
 * These can later be replaced with the
 * real 40 brands without changing the layout.
 */

const BRANDS = Array.from({ length: 30 }, (_, index) => {
  const logo = BRAND_LOGOS[index % BRAND_LOGOS.length];

  return {
    name: `${logo.name}-${index + 1}`,
    image: logo.image,
  };
});

/* =========================================================
   ARTISTS
========================================================= */

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

/* =========================================================
   DYNAMIC ASYMMETRIC ROW BUILDER
========================================================= */

/*
 * Creates an editorial / asymmetric distribution.
 *
 * IMPORTANT:
 *
 * This does NOT use a fixed [5,5,5,5...] structure.
 *
 * The number of items in each row is calculated
 * from the total number of items.
 *
 * For 40 items it intentionally produces something
 * closer to:
 *
 *       4
 *     6
 *   5
 *      6
 *    4
 *      5
 *     6
 *
 * The exact pattern adapts to the item count.
 */

function buildAsymmetricRows<T>(items: T[]) {
  if (items.length === 0) {
    return [];
  }

  const pattern = [4, 5, 6, 8, 7, 5, 4, 3];

  const rows: T[][] = [];

  let cursor = 0;
  let patternIndex = 0;

  while (cursor < items.length) {
    const remaining = items.length - cursor;

    let size = pattern[patternIndex % pattern.length];

    /*
     * Don't exceed the number of remaining items.
     */
    size = Math.min(size, remaining);

    /*
     * Avoid leaving a single logo for the final row.
     */
    if (remaining - size === 1 && size > 2) {
      size--;
    }

    const row = items.slice(cursor, cursor + size);

    if (row.length > 0) {
      rows.push(row);
    }

    cursor += size;
    patternIndex++;
  }

  return rows;
}

/* =========================================================
   PAGE
========================================================= */

export default function BrandsPage() {
  const brandRows = buildAsymmetricRows(BRANDS);

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
          particleCount={2500}
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
    overflow-y-auto
    overflow-x-hidden
  "
      >
        <div
          className="
      flex
      min-h-full
      w-full
      flex-col
      items-center
      justify-center
      px-4
      py-15
      sm:px-6
      md:px-10
    "
        >
          <div
            className="
        flex
        w-full
        max-w-[1000px]
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
                font-sans
                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-white/55
                sm:mb-5
                sm:text-[11px]
              "
              >
                Brands
              </h2>

              {/* ===============================================
                ASYMMETRIC BRAND ROWS
            =============================================== */}

              <div
                className="
                flex
                w-full
                flex-col
                items-center
                gap-1
                sm:gap-1.5
                md:gap-2
              "
              >
                {brandRows.map((row, rowIndex) => {
                  /*
                   * Alternate the visual density slightly.
                   *
                   * Every row stays centered, but the different
                   * number of logos naturally creates the
                   * asymmetric silhouette.
                   */
                  const isWideRow = row.length >= 6;

                  return (
                    <div
                      key={`brand-row-${rowIndex}`}
                      className={`
                      flex
                      items-center
                      justify-center
                      gap-2
                      sm:gap-4
                      md:gap-5
                      ${isWideRow ? "scale-[0.98]" : "scale-[1]"}
                    `}
                    >
                      {row.map((brand, index) => (
                        <div
                          key={`${brand.name}-${rowIndex}-${index}`}
                          className="
                          flex
                          h-11
                          w-20
                          shrink-0
                          items-center
                          justify-center
                          sm:h-13
                          sm:w-24
                          md:h-15
                          md:w-28
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
                  );
                })}
              </div>
            </section>

            {/* =================================================
              DIVIDER
          ================================================= */}

            <div
              className="
              my-5
              h-px
              w-20
              shrink-0
              bg-white/10
              sm:my-6
              md:my-7
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
                mb-3
                font-sans
                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-white/55
                sm:mb-4
                sm:text-[11px]
              "
              >
                Artists
              </h2>

              {/* ===============================================
                ARTIST CREDITS
            =============================================== */}

              <div
                className="
    flex
    w-full
    max-w-[850px]
    flex-wrap
    items-center
    justify-center
    gap-x-2
    gap-y-3
    px-2
    text-center
    sm:gap-x-3
    sm:gap-y-4
    md:max-w-[900px]
    md:gap-x-4
  "
              >
                {ARTISTS.map((artist, index) => (
                  <div
                    key={`${artist}-${index}`}
                    className="
                    flex
                    items-center
                    whitespace-nowrap
                  "
                  >
                    <span
                      className="
                      font-sans
                      text-[14px]
                      font-bold
                      leading-none
                      tracking-[-0.015em]
                      text-white/90
                      sm:text-[16px]
                      md:text-[18px]
                    "
                    >
                      {artist}
                    </span>

                    {index < ARTISTS.length - 1 && (
                      <span
                        className="
                        ml-2
                        text-[9px]
                        leading-none
                        text-white/20
                        sm:ml-2.5
                        sm:text-[10px]
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

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          canvas {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
