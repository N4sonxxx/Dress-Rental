"use client";
import { useState, useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { fetchDress, createBooking, type Dress } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAnimeScrollAnimations } from "@/lib/useAnimeScrollAnimations";

export default function BookingPage({
  params,
}: {
  params: Promise<{ dressId: string }>;
}) {
  const { dressId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingType = searchParams.get("type") || "INSPECTION";

  const [dress, setDress] = useState<Dress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDress(dressId)
      .then(setDress)
      .catch(() => setDress(null))
      .finally(() => setLoading(false));
  }, [dressId]);

  useAnimeScrollAnimations({ rootMargin: "0px 0px -10% 0px" });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    else if (name.trim().length < 2) errs.name = "Name is too short";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (phone.replace(/\D/g, "").length < 8)
      errs.phone = "Phone number is too short";
    if (!startDate) errs.startDate = "Start date is required";
    if (!endDate) errs.endDate = "End date is required";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate))
      errs.endDate = "End date must be after start date";
    if (startDate && new Date(startDate) < new Date())
      errs.startDate = "Start date cannot be in the past";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      await createBooking({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        dressId,
        startDate,
        endDate,
        type: bookingType,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      toast.success("Booking request submitted successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to submit booking. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate total
  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const total = dress ? dress.pricePerDay * days : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 max-w-2xl mx-auto px-4">
          <div className="space-y-4">
            <div className="h-8 skeleton w-1/2" />
            <div className="h-64 skeleton" />
          </div>
        </main>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 max-w-lg mx-auto px-4 text-center">
          <div
            className="glass-card p-10 !hover:transform-none"
            data-anim="fade-up"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Booking Submitted!</h2>
            <p className="text-sm text-gray-500 mb-6">
              {bookingType === "INSPECTION"
                ? "Your inspection appointment request has been submitted. We'll confirm your slot shortly via email."
                : "Your rental booking is pending confirmation. We'll send you an email with next steps."}
            </p>
            <div className="flex justify-center gap-3">
              <Link href={`/dresses/${dressId}`} className="btn-secondary">
                View Dress
              </Link>
              <Link href="/" className="btn-primary">
                Browse More
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href={`/dresses/${dressId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 mb-8 transition-colors"
            data-anim="fade-up"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dress
          </Link>

          <div data-anim="fade-up">
            <h1 className="text-2xl font-bold mb-1">
              {bookingType === "INSPECTION"
                ? "Book an Inspection"
                : "Rent This Dress"}
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              {bookingType === "INSPECTION"
                ? "Visit our store to try on the dress before committing."
                : "Complete the details below to reserve your dress."}
            </p>

            {/* Dress Summary */}
            {dress && (
              <div
                className="glass-card p-4 flex items-center gap-4 mb-8 !hover:transform-none"
                data-anim="fade-up"
                data-delay="120"
              >
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-violet-100 flex-shrink-0">
                  {dress.imageUrl ? (
                    <img
                      src={dress.imageUrl}
                      alt={dress.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">👗</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {dress.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {dress.size} · {dress.color} · {dress.style.toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-violet-600">
                    {formatPrice(dress.pricePerDay)}
                  </p>
                  <p className="text-[10px] text-gray-400">per day</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" data-anim="fade-up" data-delay="180">
              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`form-input ${errors.name ? "!border-red-400" : ""}`}
                  placeholder="Jane Smith"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input ${errors.email ? "!border-red-400" : ""}`}
                  placeholder="jane@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Phone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`form-input ${errors.phone ? "!border-red-400" : ""}`}
                  placeholder="+61 400 000 000"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {bookingType === "INSPECTION"
                      ? "Visit Date *"
                      : "Start Date *"}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`form-input ${errors.startDate ? "!border-red-400" : ""}`}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {bookingType === "INSPECTION"
                      ? "End Date *"
                      : "Return Date *"}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className={`form-input ${errors.endDate ? "!border-red-400" : ""}`}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="e.g., Preferred time for inspection, event details..."
                />
              </div>

              {/* Price Summary */}
              {bookingType === "RENTAL" && days > 0 && (
                <div className="glass-card p-4 !hover:transform-none">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {formatPrice(dress?.pricePerDay || 0)} × {days} day
                      {days !== 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-violet-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="animate-pulse">Submitting...</span>
                ) : bookingType === "INSPECTION" ? (
                  "Submit Inspection Request"
                ) : (
                  "Submit Rental Booking"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
