"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav
      className="absolute inset-0 z-50 flex flex-col justify-between"
      style={{
        padding: "clamp(24px, 2vw, 40px)",
        boxSizing: "border-box",
      }}
    >
      {/* TOP */}
      <div className="flex items-center justify-center text-white">
        <Link
          href="/"
          className="font-sans text-3xl tracking-loose md:text-4xl"
        >
          NHUJAN DONGOL
        </Link>
      </div>

      {/* MIDDLE */}
      <div className="flex flex-col items-end gap-8 text-sm text-white">
        <Link href="/work" className="transition-opacity hover:opacity-50">
          WORK
        </Link>

        <Link href="/contact" className="transition-opacity hover:opacity-50">
          CONTACT
        </Link>
      </div>

      {/* BOTTOM */}
      <div className="flex items-center justify-between text-white">
        <Link href="/credits" className="transition-opacity hover:opacity-50">
          Credits
        </Link>

        <div className="flex gap-6">
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-50"
          >
            <i className="fab fa-instagram text-xl" />
          </Link>

          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-50"
          >
            <i className="fab fa-linkedin text-xl" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
