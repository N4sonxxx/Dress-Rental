"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles, X, ArrowUpRight, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import DressCard from "@/components/DressCard";
import { fetchDresses, type Dress } from "@/lib/api";

const SIZES = ["XS", "S", "M", "L", "XL"];
const STYLES = ["EVENING", "COCKTAIL", "PROM", "FORMAL", "CASUAL"];
const COLORS = [
  "Black",
  "Navy Blue",
  "Burgundy",
  "Rose Gold",
  "Emerald Green",
  "Blush Pink",
  "Silver",
  "Ivory",
];

export default function HomePage() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [size, setSize] = useState("");
  const [style, setStyle] = useState("");
  const [color, setColor] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDresses();
  }, [size, style, color]);

  async function loadDresses() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (size) params.size = size;
      if (style) params.style = style;
      if (color) params.color = color;
      const data = await fetchDresses(params);
      setDresses(data);
    } catch {
      setDresses([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredDresses = search
    ? dresses.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase())
      )
    : dresses;

  const activeFilters = [size, style, color].filter(Boolean).length;

  function clearFilters() {
    setSize("");
    setStyle("");
    setColor("");
    setSearch("");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 pb-14">
        <section className="relative overflow-hidden pt-14 sm:pt-20">
          <div className="absolute inset-x-0 top-8 mx-auto h-[520px] w-[92%] max-w-6xl rounded-[34px] bg-[#0b1020] shadow-[0_36px_60px_rgba(15,16,23,0.32)]" />
          <div className="absolute inset-x-0 top-8 mx-auto h-[520px] w-[92%] max-w-6xl rounded-[34px] scanline-bg opacity-25" />

          <div className="relative mx-auto w-[92%] max-w-6xl px-6 sm:px-10 py-12 sm:py-16 text-white">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] mono text-white/70 animate-fade-in-up">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/20">
                <Sparkles className="w-3 h-3 text-lime-300" />
                Curated Collection
              </span>
              <span>Try On Available</span>
              <span>Fast Booking</span>
            </div>

            <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-8 items-start">
              <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold max-w-3xl">
                  Dress rental, but
                  <span className="block text-lime-300 mono tracking-tight">
                    animated like a launch page.
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed">
                  Explore standout party looks through a kinetic catalog inspired by modern
                  animation websites. Search fast, filter instantly, and reserve in minutes.
                </p>

                <div className="mt-8 relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/45" />
                  <input
                    type="text"
                    placeholder="Search by dress name or vibe..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/8 text-white border border-white/20 outline-none focus:border-lime-300 focus:ring-2 focus:ring-lime-300/30 transition"
                  />
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button className="btn-primary mono">
                    Start Browsing
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white/55 mono">{filteredDresses.length} items in catalog</span>
                </div>
              </div>

              <aside
                className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-md animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] mono text-white/70 mb-4">
                  <Zap className="w-3.5 h-3.5 text-lime-300" />
                  Fast Stats
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border border-white/12 bg-black/20 px-3 py-2.5">
                    <p className="text-white/60 text-xs mono">Available Now</p>
                    <p className="text-white text-xl font-semibold leading-tight mt-0.5">
                      {dresses.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/12 bg-black/20 px-3 py-2.5">
                    <p className="text-white/60 text-xs mono">Active Filters</p>
                    <p className="text-white text-xl font-semibold leading-tight mt-0.5">{activeFilters}</p>
                  </div>
                  <div className="rounded-xl border border-white/12 bg-black/20 px-3 py-2.5">
                    <p className="text-white/60 text-xs mono">Style Tags</p>
                    <p className="text-lime-300 text-sm mt-0.5">Evening, Cocktail, Prom</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="mono text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Collection</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Browse The Grid</h2>
              <p className="text-sm text-slate-500 mt-1">
                {filteredDresses.length} dress
                {filteredDresses.length !== 1 ? "es" : ""} available
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary relative mono"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-md bg-lime-300 text-slate-950 text-xs font-semibold flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="glass-card p-6 mb-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm mono uppercase tracking-[0.14em]">Filter Dresses</h3>
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-lime-300 font-medium flex items-center gap-1 hover:underline"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/65 mb-1.5 mono uppercase tracking-[0.12em]">
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Sizes</option>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/65 mb-1.5 mono uppercase tracking-[0.12em]">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Styles</option>
                    {STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/65 mb-1.5 mono uppercase tracking-[0.12em]">
                    Color
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Colors</option>
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="aspect-[3/4] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDresses.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">👗</span>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-900">No dresses found</h3>
              <p className="text-sm text-slate-500 mb-4">
                Try adjusting your filters or search term
              </p>
              <button onClick={clearFilters} className="btn-primary text-sm mono">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredDresses.map((dress, i) => (
                <div
                  key={dress.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <DressCard dress={dress} />
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-slate-900/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-sm text-slate-500 mono">
              © {new Date().getFullYear()} GlamourRent. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
