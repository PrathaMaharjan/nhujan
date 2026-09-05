import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-black px-6 text-white">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-white/50">404</p>
        <h1 className="mt-4 font-mono text-xl uppercase tracking-[0.18em]">
          Page not found
        </h1>
        <Link
          href="/"
          className="mt-8 inline-block px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
