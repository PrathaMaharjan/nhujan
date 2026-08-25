export default function Footer() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-16 pointer-events-none">
      {/* DEVELOPERS */}
      <div
        className="
              fixed
              bottom-6
              left-6
              md:left-8
              z-[100]
              font-mono
              text-[9px]
              md:text-[10px]
              tracking-[0.3em]
              text-white/60
              uppercase
              pointer-events-none
            "
      >
        DEVELOPED BY {"</>"}
      </div>

      {/* SOCIAL ICONS */}
      <div
        className="
              fixed
              bottom-5
              right-6
              md:right-8
              z-[100]
              flex
              items-center
              gap-5
              pointer-events-auto
            "
      >
        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="
                text-white/85
                hover:text-white
                transition-all
                hover:scale-110
              "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5 md:w-6 md:h-6"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle
              cx="17.5"
              cy="6.5"
              r="1"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="
                text-white/85
                hover:text-white
                transition-all
                hover:scale-110
              "
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 md:w-6 md:h-6"
          >
            <path d="M5.2 3.5A2.2 2.2 0 1 1 5.2 7.9 2.2 2.2 0 0 1 5.2 3.5ZM3.3 9h3.8v11.5H3.3V9Zm6.1 0h3.6v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.8 0 4.5 2.5 4.5 5.7v6.1h-3.8V15c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.4V9Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
