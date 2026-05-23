import api from "@/lib/axios";
import {
  BookingDto,
  CreateBookingRequest,
  AvailabilitySlot,
  CustomerPagedResult,
  BookingStatus,
} from "@/types";

interface GetAvailabilityParams {
  venueId: string;
  date: string;
  partySize: number;
}

export async function getAvailability(params: GetAvailabilityParams): Promise<AvailabilitySlot[]> {
  const res = await api.get<{ availableSlots: AvailabilitySlot[] }>("/bookings/availability", { params });
  return res.data.availableSlots ?? [];
}

interface GetMyBookingsParams {
  status?: BookingStatus;
  page?: number;
  pageSize?: number;
}

export async function getMyBookings(params: GetMyBookingsParams): Promise<CustomerPagedResult<BookingDto>> {
  const res = await api.get<CustomerPagedResult<BookingDto>>("/bookings", { params });
  return res.data;
}

export async function getBooking(id: string): Promise<BookingDto> {
  const res = await api.get<BookingDto>(`/bookings/${id}`);
  return res.data;
}

export async function createBooking(data: CreateBookingRequest): Promise<BookingDto> {
  const res = await api.post<BookingDto>("/bookings", data);
  return res.data;
}

export async function cancelBooking(id: string, reason?: string | null): Promise<BookingDto> {
  const res = await api.post<BookingDto>(`/bookings/${id}/cancel`, { reason: reason ?? null });
  return res.data;
}
