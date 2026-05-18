import api from "@/lib/axios";
import {
  PagedResult,
  BookingDto,
  BookingStatus,
  BookingDecisionRequest,
  CancelBookingRequest,
} from "@/types";

interface GetBookingsParams {
  venueId: string;
  customerId?: string;
  status?: BookingStatus;
  page?: number;
  pageSize?: number;
}

export async function getBookings(
  params: GetBookingsParams
): Promise<PagedResult<BookingDto>> {
  const res = await api.get<PagedResult<BookingDto>>("/bookings", { params });
  return res.data;
}

export async function getBooking(id: string): Promise<BookingDto> {
  const res = await api.get<BookingDto>(`/bookings/${id}`);
  return res.data;
}

export async function confirmBooking(
  id: string,
  data: BookingDecisionRequest
): Promise<BookingDto> {
  const res = await api.post<BookingDto>(`/bookings/${id}/confirm`, data);
  return res.data;
}

export async function declineBooking(
  id: string,
  data: BookingDecisionRequest
): Promise<BookingDto> {
  const res = await api.post<BookingDto>(`/bookings/${id}/decline`, data);
  return res.data;
}

export async function cancelBooking(
  id: string,
  data: CancelBookingRequest
): Promise<BookingDto> {
  const res = await api.post<BookingDto>(`/bookings/${id}/cancel`, data);
  return res.data;
}
