"use client";

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
        h-screen
        w-full
        overflow-hidden
        bg-black
        text-white
        select-none
      "
    >
      {/* =====================================================
          ATMOSPHERE
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
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
          z-[1]
          opacity-[0.09]
          mix-blend-soft-light
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
