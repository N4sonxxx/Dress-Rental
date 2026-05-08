"use client";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-900/10 bg-[rgba(245,245,241,0.82)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-slate-950 text-lime-300 flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text hidden sm:block">
              GlamourRent
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Browse Dresses
            </Link>
            <Link
              href="/admin/login"
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Admin
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg border border-slate-900/10 hover:bg-white/90 transition"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-900/10 py-4 space-y-3 animate-fade-in-up">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-950 px-2 py-1"
            >
              Browse Dresses
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-slate-500 hover:text-slate-950 px-2 py-1"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
