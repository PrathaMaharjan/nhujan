"use client";

import React, { useState } from "react";
import { SidebarNav } from "./sidebar";
import { LogOut, Menu, X } from "lucide-react";

export function AdminShell({
  displayName,
  children,
  logoutAction,
}: {
  displayName: string;
  children: React.ReactNode;
  logoutAction: () => Promise<void>;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:block">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between border-b border-white/10 px-4 py-3 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm sm:text-base tracking-tight truncate max-w-[180px]">
            {displayName}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </form>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-zinc-950 border-r border-white/10 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
            <div className="min-w-0 pr-2">
              <p className="text-lg font-medium truncate">{displayName}</p>
              <p className="text-xs text-white/40">Portfolio Admin</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition shrink-0"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>
          <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        <div className="border-t border-white/10 pt-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
            >
              <LogOut size={16} strokeWidth={2} />
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col justify-between overflow-y-auto border-r border-white/10 p-4 md:flex">
        <div>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="min-w-0">
              <p className="text-xl font-medium truncate">{displayName}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 mb-2" />
          <SidebarNav />
        </div>

        <div className="border-t border-white/10 pt-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
            >
              <LogOut size={16} strokeWidth={2} />
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 overflow-x-hidden p-4 sm:p-6 md:ml-60 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
