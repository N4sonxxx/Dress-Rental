import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Types ─────────────────────────────────────────────────────
export interface Dress {
  id: string;
  name: string;
  description: string;
  size: string;
  color: string;
  style: string;
  pricePerDay: number;
  imageUrl: string | null;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  createdAt: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dressId: string;
  dress?: Dress;
  startDate: string;
  endDate: string;
  type: "INSPECTION" | "RENTAL";
  status: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalDresses: number;
  availableDresses: number;
  rentedDresses: number;
  totalBookings: number;
  pendingBookings: number;
  activeRentals: number;
  upcomingReturns: Booking[];
  lateReturns: Booking[];
  recentBookings: Booking[];
}

// ── Public Endpoints ──────────────────────────────────────────
export const fetchDresses = async (params?: Record<string, string>) => {
  const { data } = await api.get<{ dresses: Dress[] }>("/dresses", { params });
  return data.dresses;
};

export const fetchDress = async (id: string) => {
  const { data } = await api.get<{ dress: Dress }>(`/dresses/${id}`);
  return data.dress;
};

export const fetchAvailability = async (dressId: string, month: string) => {
  const { data } = await api.get<{ bookedDates: string[] }>(
    `/availability/${dressId}`,
    { params: { month } }
  );
  return data;
};

export const createBooking = async (booking: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dressId: string;
  startDate: string;
  endDate: string;
  type: string;
  notes?: string;
}) => {
  const { data } = await api.post<Booking>("/bookings", booking);
  return data;
};

// ── Admin Endpoints ───────────────────────────────────────────
export const adminLogin = async (email: string, password: string) => {
  const { data } = await api.post<{ message: string }>("/auth/login", {
    email,
    password,
  });
  return data;
};

export const adminLogout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const adminMe = async () => {
  const { data } = await api.get<{ admin: { id: string; email: string } }>(
    "/auth/me"
  );
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await api.get<DashboardStats>("/admin/dashboard");
  return data;
};

export const fetchAllBookings = async () => {
  const { data } = await api.get<{ bookings: Booking[] }>("/bookings");
  return data.bookings;
};

export const updateBookingStatus = async (
  id: string,
  status: string
) => {
  const { data } = await api.patch<{ booking: Booking }>(`/bookings/${id}/status`, {
    status,
  });
  return data.booking;
};

export const convertToRental = async (
  bookingId: string,
  body: { startDate: string; endDate: string }
) => {
  const { data } = await api.post<{ booking: Booking }>(
    `/bookings/${bookingId}/convert`,
    body
  );
  return data.booking;
};

export const createDress = async (payload: Partial<Dress>) => {
  const { data } = await api.post<{ dress: Dress }>("/dresses", payload);
  return data.dress;
};

export const updateDress = async (id: string, payload: Partial<Dress>) => {
  const { data } = await api.patch<{ dress: Dress }>(`/dresses/${id}`, payload);
  return data.dress;
};

export const uploadSecurityFile = async (
  bookingId: string,
  formData: FormData
) => {
  const { data } = await api.post(
    `/admin/security-vault/${bookingId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

export default api;
