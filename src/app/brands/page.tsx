"use client";

import React, { useRef, useState } from "react";

interface Brand {
  id: number;
  name: string;
  logo: string;
  x: number;
  y: number;
}

/*
|--------------------------------------------------------------------------
| BRAND DATA
|--------------------------------------------------------------------------
|
| Add as many brands as you want.
|
| x / y = initial position as percentage of viewport
|
*/

const BRANDS: Brand[] = [
  {
    id: 1,
    name: "Brand One",
    logo: "/brands/brand-1.svg",
    x: 8,
    y: 17,
  },
  {
    id: 2,
    name: "Brand Two",
    logo: "/brands/brand-2.svg",
    x: 22,
    y: 11,
  },
  {
    id: 3,
    name: "Brand Three",
    logo: "/brands/brand-3.svg",
    x: 38,
    y: 18,
  },
  {
    id: 4,
    name: "Brand Four",
    logo: "/brands/brand-4.svg",
    x: 56,
    y: 12,
  },
  {
    id: 5,
    name: "Brand Five",
    logo: "/brands/brand-5.svg",
    x: 73,
    y: 19,
  },
  {
    id: 6,
    name: "Brand Six",
    logo: "/brands/brand-6.svg",
    x: 91,
    y: 13,
  },

  {
    id: 7,
    name: "Brand Seven",
    logo: "/brands/brand-7.svg",
    x: 13,
    y: 32,
  },
  {
    id: 8,
    name: "Brand Eight",
    logo: "/brands/brand-8.svg",
    x: 29,
    y: 28,
  },
  {
    id: 9,
    name: "Brand Nine",
    logo: "/brands/brand-9.svg",
    x: 48,
    y: 34,
  },
  {
    id: 10,
    name: "Brand Ten",
    logo: "/brands/brand-10.svg",
    x: 66,
    y: 29,
  },
  {
    id: 11,
    name: "Brand Eleven",
    logo: "/brands/brand-11.svg",
    x: 83,
    y: 35,
  },

  {
    id: 12,
    name: "Brand Twelve",
    logo: "/brands/brand-12.svg",
    x: 7,
    y: 49,
  },
  {
    id: 13,
    name: "Brand Thirteen",
    logo: "/brands/brand-13.svg",
    x: 24,
    y: 45,
  },
  {
    id: 14,
    name: "Brand Fourteen",
    logo: "/brands/brand-14.svg",
    x: 42,
    y: 50,
  },
  {
    id: 15,
    name: "Brand Fifteen",
    logo: "/brands/brand-15.svg",
    x: 60,
    y: 44,
  },
  {
    id: 16,
    name: "Brand Sixteen",
    logo: "/brands/brand-16.svg",
    x: 77,
    y: 51,
  },
  {
    id: 17,
    name: "Brand Seventeen",
    logo: "/brands/brand-17.svg",
    x: 94,
    y: 47,
  },

  {
    id: 18,
    name: "Brand Eighteen",
    logo: "/brands/brand-18.svg",
    x: 12,
    y: 64,
  },
  {
    id: 19,
    name: "Brand Nineteen",
    logo: "/brands/brand-19.svg",
    x: 31,
    y: 60,
  },
  {
    id: 20,
    name: "Brand Twenty",
    logo: "/brands/brand-20.svg",
    x: 50,
    y: 66,
  },
  {
    id: 21,
    name: "Brand Twenty One",
    logo: "/brands/brand-21.svg",
    x: 69,
    y: 61,
  },
  {
    id: 22,
    name: "Brand Twenty Two",
    logo: "/brands/brand-22.svg",
    x: 87,
    y: 68,
  },

  {
    id: 23,
    name: "Brand Twenty Three",
    logo: "/brands/brand-23.svg",
    x: 6,
    y: 82,
  },
  {
    id: 24,
    name: "Brand Twenty Four",
    logo: "/brands/brand-24.svg",
    x: 20,
    y: 76,
  },
  {
    id: 25,
    name: "Brand Twenty Five",
    logo: "/brands/brand-25.svg",
    x: 37,
    y: 84,
  },
  {
    id: 26,
    name: "Brand Twenty Six",
    logo: "/brands/brand-26.svg",
    x: 54,
    y: 78,
  },
  {
    id: 27,
    name: "Brand Twenty Seven",
    logo: "/brands/brand-27.svg",
    x: 72,
    y: 85,
  },
  {
    id: 28,
    name: "Brand Twenty Eight",
    logo: "/brands/brand-28.svg",
    x: 91,
    y: 79,
  },

  {
    id: 29,
    name: "Brand Twenty Nine",
    logo: "/brands/brand-29.svg",
    x: 16,
    y: 24,
  },
  {
    id: 30,
    name: "Brand Thirty",
    logo: "/brands/brand-30.svg",
    x: 44,
    y: 23,
  },
  {
    id: 31,
    name: "Brand Thirty One",
    logo: "/brands/brand-31.svg",
    x: 81,
    y: 26,
  },
  {
    id: 32,
    name: "Brand Thirty Two",
    logo: "/brands/brand-32.svg",
    x: 35,
    y: 40,
  },
  {
    id: 33,
    name: "Brand Thirty Three",
    logo: "/brands/brand-33.svg",
    x: 74,
    y: 41,
  },
  {
    id: 34,
    name: "Brand Thirty Four",
    logo: "/brands/brand-34.svg",
    x: 18,
    y: 56,
  },
  {
    id: 35,
    name: "Brand Thirty Five",
    logo: "/brands/brand-35.svg",
    x: 57,
    y: 57,
  },
  {
    id: 36,
    name: "Brand Thirty Six",
    logo: "/brands/brand-36.svg",
    x: 84,
    y: 56,
  },
  {
    id: 37,
    name: "Brand Thirty Seven",
    logo: "/brands/brand-37.svg",
    x: 28,
    y: 70,
  },
  {
    id: 38,
    name: "Brand Thirty Eight",
    logo: "/brands/brand-38.svg",
    x: 46,
    y: 73,
  },
  {
    id: 39,
    name: "Brand Thirty Nine",
    logo: "/brands/brand-39.svg",
    x: 65,
    y: 70,
  },
  {
    id: 40,
    name: "Brand Forty",
    logo: "/brands/brand-40.svg",
    x: 78,
    y: 76,
  },

  {
    id: 41,
    name: "Brand Forty One",
    logo: "/brands/brand-41.svg",
    x: 4,
    y: 39,
  },
  {
    id: 42,
    name: "Brand Forty Two",
    logo: "/brands/brand-42.svg",
    x: 52,
    y: 39,
  },
  {
    id: 43,
    name: "Brand Forty Three",
    logo: "/brands/brand-43.svg",
    x: 96,
    y: 39,
  },
  {
    id: 44,
    name: "Brand Forty Four",
    logo: "/brands/brand-44.svg",
    x: 4,
    y: 70,
  },
  {
    id: 45,
    name: "Brand Forty Five",
    logo: "/brands/brand-45.svg",
    x: 49,
    y: 89,
  },
  {
    id: 46,
    name: "Brand Forty Six",
    logo: "/brands/brand-46.svg",
    x: 96,
    y: 88,
  },
];

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(BRANDS);

  /*
   * ID of currently grabbed logo.
   */
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE BRAND
  |--------------------------------------------------------------------------
  */

  const activeBrand =
    draggingId !== null
      ? brands.find((brand) => brand.id === draggingId)
      : null;

  /*
  |--------------------------------------------------------------------------
  | POINTER DOWN
  |--------------------------------------------------------------------------
  */

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: number,
  ) => {
    e.preventDefault();

    setDraggingId(id);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  /*
  |--------------------------------------------------------------------------
  | POINTER MOVE
  |--------------------------------------------------------------------------
  */

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    id: number,
  ) => {
    if (draggingId !== id) return;

    const container = containerRef.current;

    if (!container) return;

    const rect = container.getBoundingClientRect();

    let x = ((e.clientX - rect.left) / rect.width) * 100;

    let y = ((e.clientY - rect.top) / rect.height) * 100;

    /*
     * Keep logos inside the viewport.
     */

    x = Math.max(4, Math.min(96, x));

    y = Math.max(10, Math.min(90, y));

    setBrands((current) =>
      current.map((brand) =>
        brand.id === id
          ? {
              ...brand,
              x,
              y,
            }
          : brand,
      ),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | POINTER UP
  |--------------------------------------------------------------------------
  */

  const handlePointerUp = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    }

    setDraggingId(null);
  };

  return (
    <main
      ref={containerRef}
      className="
        relative
        h-dvh
        w-full
        overflow-hidden
        bg-[#080808]
        text-white
        select-none
      "
    >
      {/* =========================================================
          ANIMATIONS
      ========================================================= */}

      <style jsx>{`
        /*
        |--------------------------------------------------------------------------
        | IOS-STYLE JIGGLE
        |--------------------------------------------------------------------------
        |
        | ONLY the grabbed logo receives this animation.
        |
        | Other logos have NO animation at all.
        |
        | The animation lives on a separate wrapper so it never
        | interferes with the logo's dragged left/top position.
        |--------------------------------------------------------------------------
        */

        @keyframes iosJiggle {
          0% {
            transform: rotate(-2deg);
          }

          20% {
            transform: rotate(1.8deg);
          }

          40% {
            transform: rotate(-1.7deg);
          }

          60% {
            transform: rotate(1.7deg);
          }

          80% {
            transform: rotate(-1.4deg);
          }

          100% {
            transform: rotate(-2deg);
          }
        }

        /*
        |--------------------------------------------------------------------------
        | CENTER TEXT ENTER
        |--------------------------------------------------------------------------
        */

        @keyframes brandInfoIn {
          from {
            opacity: 0;
            transform: translateY(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ios-jiggle {
          animation: iosJiggle 180ms ease-in-out infinite;

          transform-origin: center center;

          will-change: transform;
        }

        .brand-info-enter {
          animation: brandInfoIn 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .ios-jiggle {
            animation: none;
          }
        }
      `}</style>

      {/* =========================================================
          TOP LEFT
      ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-[6vw]
          top-[7vh]
          z-[100]
        "
      >
        <div className="flex items-center gap-3">
          <span
            className="
              h-px
              w-8
              bg-white/30
            "
          />

          <span
            className="
              font-mono
              text-[9px]
              uppercase
              tracking-[0.28em]
              text-white/40
            "
          >
            Selected collaborations
          </span>
        </div>
      </div>

      {/* =========================================================
          PAGE NUMBER
      ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          right-[6vw]
          top-[7vh]
          z-[100]
          font-mono
          text-[9px]
          tracking-[0.25em]
          text-white/20
        "
      >
        03 / 03
      </div>

      {/* =========================================================
          CENTER STORY
      ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          z-[90]
          w-[260px]
          -translate-x-1/2
          -translate-y-1/2
          text-center
          md:w-[320px]
        "
      >
        {/* -------------------------------------------------------
            DEFAULT STATE
        ------------------------------------------------------- */}

        {!activeBrand && (
          <div className="brand-info-enter">
            <p
              className="
                font-serif
                text-sm
                italic
                tracking-wide
                text-white/[0.16]
                md:text-base
              "
            >
              names that became part of the work
            </p>
          </div>
        )}

        {/* -------------------------------------------------------
            SELECTED BRAND
        ------------------------------------------------------- */}

        {activeBrand && (
          <div key={activeBrand.id} className="brand-info-enter">
            <div
              className="
                mb-3
                font-mono
                text-[8px]
                uppercase
                tracking-[0.3em]
                text-white/30
              "
            >
              Selected collaboration
            </div>

            <div
              className="
                font-sans
                text-lg
                font-medium
                uppercase
                tracking-[0.08em]
                text-white/85
                md:text-xl
              "
            >
              {activeBrand.name}
            </div>

            <div
              className="
                mt-2
                font-serif
                text-xs
                italic
                text-white/30
              "
            >
              part of the archive
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          BRANDS
      ========================================================= */}

      {brands.map((brand) => {
        const isSelected = draggingId === brand.id;

        return (
          <div
            key={brand.id}
            className="
              absolute
              touch-none
              select-none
              cursor-grab
              active:cursor-grabbing
            "
            style={{
              /*
               * =================================================
               * POSITION LAYER
               * =================================================
               *
               * This layer handles dragging.
               *
               * IMPORTANT:
               * No rotation animation here.
               */

              left: `${brand.x}%`,
              top: `${brand.y}%`,

              transform: "translate(-50%, -50%)",

              zIndex: isSelected ? 80 : 10,
            }}
            onPointerDown={(e) => handlePointerDown(e, brand.id)}
            onPointerMove={(e) => handlePointerMove(e, brand.id)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* =================================================
                IOS JIGGLE LAYER

                ONLY ACTIVE LOGO JIGGLES.
            ================================================= */}

            <div className={isSelected ? "ios-jiggle" : ""}>
              {/* ===============================================
                  SCALE + SHADOW LAYER
              =============================================== */}

              <div
                style={{
                  transform: isSelected ? "scale(1.18)" : "scale(1)",

                  transition: isSelected
                    ? "transform 140ms ease-out"
                    : "transform 250ms ease-out",

                  filter: isSelected
                    ? "drop-shadow(0 28px 40px rgba(0,0,0,.9))"
                    : "drop-shadow(0 8px 16px rgba(0,0,0,.2))",
                }}
              >
                {/* =============================================
                    LOGO CONTAINER
                ============================================= */}

                <div
                  className="
                    flex
                    h-[52px]
                    w-[82px]
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-white/[0.05]
                    bg-white/[0.018]
                    px-3
                    py-2
                    backdrop-blur-[2px]
                    transition-colors
                    duration-300
                    hover:border-white/[0.1]
                    hover:bg-white/[0.035]
                    md:h-[58px]
                    md:w-[94px]
                  "
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    draggable={false}
                    className="
                      pointer-events-none
                      max-h-full
                      max-w-full
                      object-contain
                      brightness-0
                      invert
                      opacity-60
                      transition-opacity
                      duration-300
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* =========================================================
          BOTTOM LEFT
      ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[7vh]
          left-[6vw]
          z-[100]
        "
      >
        <div className="flex items-center gap-3">
          <span
            className="
              h-1
              w-1
              rounded-full
              bg-white/30
            "
          />

          <p
            className="
              font-mono
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-white/25
            "
          >
            drag through the archive
          </p>
        </div>
      </div>

      {/* =========================================================
          BOTTOM RIGHT
      ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[7vh]
          right-[6vw]
          z-[100]
          font-mono
          text-[8px]
          tracking-[0.2em]
          text-white/20
        "
      >
        {brands.length.toString().padStart(2, "0")} COLLABORATIONS
      </div>
    </main>
  );
}
