"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
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
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Party Dress Rentals
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                Rent the Perfect
                <br />
                <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Party Dress
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Browse our curated collection of designer dresses. Try before
                you rent with our in-store inspection service.
              </p>
            </div>

            {/* Search Bar */}
            <div
              className="relative max-w-xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dresses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/95 text-gray-900 shadow-xl outline-none focus:ring-2 focus:ring-violet-300 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Controls */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Our Collection</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredDresses.length} dress
                {filteredDresses.length !== 1 ? "es" : ""} available
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="glass-card p-6 mb-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Filter Dresses</h3>
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-violet-600 font-medium flex items-center gap-1 hover:underline"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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

          {/* Dress Grid */}
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
              <h3 className="text-lg font-semibold mt-4 mb-2">
                No dresses found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your filters or search term
              </p>
              <button onClick={clearFilters} className="btn-primary text-sm">
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

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} GlamourRent. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
