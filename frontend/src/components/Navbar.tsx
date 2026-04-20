"use client";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card !rounded-none border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              GlamourRent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
            >
              Browse Dresses
            </Link>
            <Link
              href="/admin/login"
              className="text-sm font-medium text-gray-400 hover:text-violet-600 transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-violet-50 transition"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3 animate-fade-in-up">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-violet-600 px-2 py-1"
            >
              Browse Dresses
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-400 hover:text-violet-600 px-2 py-1"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
