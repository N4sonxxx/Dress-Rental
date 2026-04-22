"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Shirt,
  CalendarCheck,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
  Upload,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  adminMe,
  adminLogout,
  fetchDresses,
  fetchAllBookings,
  updateBookingStatus,
  uploadSecurityFile,
  type Dress,
  type Booking,
} from "@/lib/api";
import { formatPrice, statusColor } from "@/lib/utils";

type Tab = "dashboard" | "dresses" | "bookings" | "vault";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      await adminMe();
      setAuthed(true);
      loadAll();
    } catch {
      router.push("/admin/login");
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [d, b] = await Promise.all([
        fetchDresses(),
        fetchAllBookings(),
      ]);
      setDresses(d);
      setBookings(b);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(bookingId: string, status: string) {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking updated to ${status}`);
      loadAll();
    } catch {
      toast.error("Failed to update booking status");
    }
  }

  async function handleSecurityUpload(bookingId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "ID_DOCUMENT");
      await uploadSecurityFile(bookingId, formData);
      toast.success("Document uploaded securely");
    } catch {
      toast.error("Upload failed");
    }
  }

  async function logout() {
    try {
      await adminLogout();
    } catch {
      // ignore
    }
    router.push("/admin/login");
  }

  // Stats
  const activeRentals = bookings.filter(
    (b) => b.status === "ACTIVE" && b.type === "RENTAL"
  );
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const lateReturns = bookings.filter(
    (b) => b.status === "ACTIVE" && new Date(b.endDate) < new Date()
  );
  const upcomingReturns = activeRentals.filter((b) => {
    const daysLeft = Math.ceil(
      (new Date(b.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft >= 0 && daysLeft <= 3;
  });
  const availableDresses = dresses.filter((d) => d.status === "AVAILABLE");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    { id: "dresses", label: "Dresses", icon: <Shirt className="w-4 h-4" /> },
    {
      id: "bookings",
      label: "Bookings",
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    { id: "vault", label: "Vault", icon: <Shield className="w-4 h-4" /> },
  ];

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Checking session…</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                Manage your dress rental business
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAll}
                className="btn-secondary"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={logout} className="btn-secondary text-red-600">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="h-4 skeleton w-1/2 mb-2" />
                  <div className="h-8 skeleton w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* === DASHBOARD TAB === */}
              {tab === "dashboard" && (
                <div className="space-y-8 animate-fade-in-up">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Active Rentals"
                      value={activeRentals.length}
                      icon={
                        <CalendarCheck className="w-5 h-5 text-violet-500" />
                      }
                      color="violet"
                    />
                    <StatCard
                      label="Pending Requests"
                      value={pendingBookings.length}
                      icon={<Clock className="w-5 h-5 text-amber-500" />}
                      color="amber"
                    />
                    <StatCard
                      label="Late Returns"
                      value={lateReturns.length}
                      icon={
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      }
                      color="red"
                    />
                    <StatCard
                      label="Available Dresses"
                      value={availableDresses.length}
                      icon={<Shirt className="w-5 h-5 text-emerald-500" />}
                      color="emerald"
                    />
                  </div>

                  {/* Late Returns Alert */}
                  {lateReturns.length > 0 && (
                    <div className="glass-card p-5 border-l-4 border-red-500">
                      <h3 className="font-semibold text-sm flex items-center gap-2 text-red-600 mb-3">
                        <AlertTriangle className="w-4 h-4" />
                        Late Returns ({lateReturns.length})
                      </h3>
                      <div className="space-y-2">
                        {lateReturns.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between text-sm bg-red-50 rounded-lg p-3"
                          >
                            <div>
                              <span className="font-medium">
                                {b.customerName}
                              </span>
                              <span className="text-gray-400 mx-2">·</span>
                              <span className="text-gray-500">
                                Due: {new Date(b.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleStatusUpdate(b.id, "COMPLETED")
                              }
                              className="btn-primary text-xs py-1 px-3"
                            >
                              Mark Returned
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Returns */}
                  {upcomingReturns.length > 0 && (
                    <div className="glass-card p-5">
                      <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Due Within 3 Days ({upcomingReturns.length})
                      </h3>
                      <div className="space-y-2">
                        {upcomingReturns.map((b) => {
                          const daysLeft = Math.ceil(
                            (new Date(b.endDate).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return (
                            <div
                              key={b.id}
                              className="flex items-center justify-between text-sm bg-amber-50 rounded-lg p-3"
                            >
                              <div>
                                <span className="font-medium">
                                  {b.customerName}
                                </span>
                                <span className="text-gray-400 mx-2">·</span>
                                <span className="text-amber-600">
                                  {daysLeft === 0
                                    ? "Due today"
                                    : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(b.id, "COMPLETED")
                                }
                                className="btn-secondary text-xs py-1 px-3"
                              >
                                Mark Returned
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pending Bookings */}
                  {pendingBookings.length > 0 && (
                    <div className="glass-card p-5">
                      <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-violet-500" />
                        Pending Approval ({pendingBookings.length})
                      </h3>
                      <div className="space-y-2">
                        {pendingBookings.slice(0, 5).map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between text-sm bg-violet-50 rounded-lg p-3"
                          >
                            <div>
                              <span className="font-medium">
                                {b.customerName}
                              </span>
                              <span className="text-gray-400 mx-2">·</span>
                              <span className="text-gray-500 text-xs">
                                {b.type} ·{" "}
                                {new Date(b.startDate).toLocaleDateString()} →{" "}
                                {new Date(b.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(b.id, "CONFIRMED")
                                }
                                className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(b.id, "CANCELLED")
                                }
                                className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === DRESSES TAB === */}
              {tab === "dresses" && (
                <div className="animate-fade-in-up">
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Dress
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Size
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Color
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Price/Day
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {dresses.map((d) => (
                            <tr
                              key={d.id}
                              className="hover:bg-gray-50/50 transition"
                            >
                              <td className="px-4 py-3 font-medium">
                                {d.name}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {d.size}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {d.color}
                              </td>
                              <td className="px-4 py-3 text-violet-600 font-medium">
                                {formatPrice(d.pricePerDay)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`badge ${statusColor(d.status)}`}
                                >
                                  {d.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  href={`/dresses/${d.id}`}
                                  className="text-violet-600 hover:underline text-xs flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* === BOOKINGS TAB === */}
              {tab === "bookings" && (
                <div className="animate-fade-in-up">
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Customer
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Type
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Dates
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-gray-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {bookings.map((b) => (
                            <tr
                              key={b.id}
                              className="hover:bg-gray-50/50 transition"
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium">
                                  {b.customerName}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {b.customerEmail}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`badge ${b.type === "RENTAL" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}
                                >
                                  {b.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500">
                                {new Date(b.startDate).toLocaleDateString()} →{" "}
                                {new Date(b.endDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`badge ${statusColor(b.status)}`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  {b.status === "PENDING" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleStatusUpdate(
                                            b.id,
                                            "CONFIRMED"
                                          )
                                        }
                                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                        title="Approve"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleStatusUpdate(
                                            b.id,
                                            "CANCELLED"
                                          )
                                        }
                                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                        title="Reject"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                  {b.status === "CONFIRMED" &&
                                    b.type === "INSPECTION" && (
                                      <button
                                        onClick={() =>
                                          handleStatusUpdate(b.id, "ACTIVE")
                                        }
                                        className="btn-primary text-xs py-1 px-2"
                                        title="Convert to Rental"
                                      >
                                        <ArrowRight className="w-3 h-3" />
                                        Activate
                                      </button>
                                    )}
                                  {b.status === "CONFIRMED" &&
                                    b.type === "RENTAL" && (
                                      <button
                                        onClick={() =>
                                          handleStatusUpdate(b.id, "ACTIVE")
                                        }
                                        className="btn-primary text-xs py-1 px-2"
                                      >
                                        Start Rental
                                      </button>
                                    )}
                                  {b.status === "ACTIVE" && (
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(b.id, "COMPLETED")
                                      }
                                      className="btn-secondary text-xs py-1 px-2"
                                    >
                                      Mark Returned
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* === VAULT TAB === */}
              {tab === "vault" && (
                <div className="animate-fade-in-up">
                  <div className="glass-card p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Security Vault</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Upload and store customer identification documents
                      securely. All files are encrypted at rest with AES-256.
                    </p>

                    <div className="space-y-3 max-w-lg mx-auto">
                      {bookings
                        .filter(
                          (b) =>
                            b.status === "ACTIVE" || b.status === "CONFIRMED"
                        )
                        .slice(0, 5)
                        .map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-left"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {b.customerName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {b.type} · {b.status}
                              </p>
                            </div>
                            <label className="btn-secondary text-xs cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              Upload ID
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleSecurityUpload(b.id, file);
                                }}
                              />
                            </label>
                          </div>
                        ))}
                      {bookings.filter(
                        (b) =>
                          b.status === "ACTIVE" || b.status === "CONFIRMED"
                      ).length === 0 && (
                        <p className="text-sm text-gray-400 py-4">
                          No active or confirmed bookings to upload documents
                          for.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const bg: Record<string, string> = {
    violet: "bg-violet-50",
    amber: "bg-amber-50",
    red: "bg-red-50",
    emerald: "bg-emerald-50",
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg[color] || "bg-gray-50"}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
