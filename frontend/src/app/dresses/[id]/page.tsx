"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Heart, Clock, Tag, Ruler } from "lucide-react";
import Navbar from "@/components/Navbar";
import { fetchDress, fetchAvailability, type Dress } from "@/lib/api";
import { formatPrice, statusColor } from "@/lib/utils";
import { useAnimeScrollAnimations } from "@/lib/useAnimeScrollAnimations";

export default function DressDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [dress, setDress] = useState<Dress | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    loadDress();
  }, [id]);

  useEffect(() => {
    if (dress) loadAvailability();
  }, [dress, currentMonth]);

  useAnimeScrollAnimations({ rootMargin: "0px 0px -12% 0px" });

  async function loadDress() {
    try {
      const data = await fetchDress(id);
      setDress(data);
    } catch {
      setDress(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability() {
    try {
      const data = await fetchAvailability(id, currentMonth);
      setBookedDates(data.bookedDates);
    } catch {
      setBookedDates([]);
    }
  }

  // Calendar logic
  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  function prevMonth() {
    const d = new Date(year, month - 2, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  function nextMonth() {
    const d = new Date(year, month, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  function isBooked(day: number): boolean {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookedDates.includes(dateStr);
  }

  function isPast(day: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(year, month - 1, day) < today;
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-[3/4] skeleton rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
              <div className="h-4 skeleton w-full" />
              <div className="h-4 skeleton w-full" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!dress) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 text-center">
          <span className="text-6xl">😢</span>
          <h2 className="text-xl font-bold mt-4">Dress not found</h2>
          <Link href="/" className="btn-primary inline-flex mt-6">
            Back to Collection
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 mb-8 transition-colors"
            data-anim="fade-up"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collection
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <div data-anim="fade-up">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card">
                {dress.imageUrl ? (
                  <img
                    src={dress.imageUrl}
                    alt={dress.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100">
                    <span className="text-8xl">👗</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div data-anim="fade-up" data-delay="120">
              <span className={`badge ${statusColor(dress.status)} mb-3`}>
                {dress.status}
              </span>
              <h1 className="text-3xl font-bold mb-2">{dress.name}</h1>
              <p className="text-2xl font-bold text-violet-600 mb-6">
                {formatPrice(dress.pricePerDay)}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / day
                </span>
              </p>

              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                {dress.description}
              </p>

              {/* Attributes */}
              <div className="grid grid-cols-3 gap-4 mb-8" data-anim="fade-up" data-delay="200">
                <div className="glass-card p-3 text-center !hover:transform-none">
                  <Ruler className="w-4 h-4 mx-auto text-violet-500 mb-1" />
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="font-semibold text-sm">{dress.size}</p>
                </div>
                <div className="glass-card p-3 text-center !hover:transform-none">
                  <Tag className="w-4 h-4 mx-auto text-violet-500 mb-1" />
                  <p className="text-xs text-gray-500">Style</p>
                  <p className="font-semibold text-sm capitalize">
                    {dress.style.toLowerCase()}
                  </p>
                </div>
                <div className="glass-card p-3 text-center !hover:transform-none">
                  <Heart className="w-4 h-4 mx-auto text-pink-500 mb-1" />
                  <p className="text-xs text-gray-500">Color</p>
                  <p className="font-semibold text-sm">{dress.color}</p>
                </div>
              </div>

              {/* Availability Calendar */}
              <div className="glass-card p-5 mb-8 !hover:transform-none" data-anim="fade-up" data-delay="240">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Availability
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="px-2 py-1 rounded-lg hover:bg-gray-100 text-xs font-medium transition"
                    >
                      ←
                    </button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {monthNames[month - 1]} {year}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="px-2 py-1 rounded-lg hover:bg-gray-100 text-xs font-medium transition"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] font-medium text-gray-400 py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {blanks.map((b) => (
                    <div key={`blank-${b}`} />
                  ))}
                  {days.map((day) => {
                    const booked = isBooked(day);
                    const past = isPast(day);
                    return (
                      <div
                        key={day}
                        className={`text-center py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          booked
                            ? "bg-red-100 text-red-600 line-through"
                            : past
                              ? "text-gray-300"
                              : "text-gray-700 hover:bg-violet-50"
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-200" />
                    Booked
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-violet-50 border border-violet-200" />
                    Available
                  </span>
                </div>
              </div>

              {/* CTA */}
              {dress.status === "AVAILABLE" && (
                <div className="flex gap-3" data-anim="fade-up" data-delay="280">
                  <Link
                    href={`/book/${dress.id}?type=INSPECTION`}
                    className="btn-primary flex-1 justify-center"
                  >
                    <Clock className="w-4 h-4" />
                    Book Inspection
                  </Link>
                  <Link
                    href={`/book/${dress.id}?type=RENTAL`}
                    className="btn-secondary flex-1 justify-center"
                  >
                    <Calendar className="w-4 h-4" />
                    Rent Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
