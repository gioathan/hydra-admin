import api from "@/lib/customerAxios";
import { CustomerVenueDto, CustomerPagedResult, EventListItemDto, VenueTypeDto, PagedResult } from "@/types";

interface GetVenuesParams {
  page?: number;
  pageSize?: number;
  venueTypeId?: string;
  name?: string;
  location?: string;
}

export async function getCustomerVenues(
  params: GetVenuesParams
): Promise<CustomerPagedResult<CustomerVenueDto>> {
  const res = await api.get<CustomerPagedResult<CustomerVenueDto>>("/venues", { params });
  return res.data;
}

export async function getVenueLocations(): Promise<string[]> {
  const res = await api.get<string[]>("/venues/locations");
  return res.data;
}

export async function getCustomerVenue(id: string): Promise<CustomerVenueDto> {
  const res = await api.get<CustomerVenueDto>(`/venues/${id}`);
  return res.data;
}

export async function rateVenue(venueId: string, value: number, bookingId: string): Promise<void> {
  await api.post(`/venues/${venueId}/rate`, { value, bookingId });
}

export async function getCustomerVenueTypes(page = 1, pageSize = 25): Promise<PagedResult<VenueTypeDto>> {
  const res = await api.get<PagedResult<VenueTypeDto>>("/venueTypes", { params: { page, pageSize } });
  return res.data;
}

export async function getUpcomingEvents(page = 1, pageSize = 10, location?: string | null): Promise<PagedResult<EventListItemDto>> {
  const res = await api.get<PagedResult<EventListItemDto>>("/events", {
    params: { page, pageSize, ...(location ? { location } : {}) },
  });
  return res.data;
}

export async function getCustomerEvent(id: string): Promise<EventListItemDto> {
  const res = await api.get<EventListItemDto>(`/events/${id}`);
  return res.data;
}

export async function getCustomerVenueEvents(venueId: string): Promise<EventListItemDto[]> {
  const res = await api.get<EventListItemDto[]>(`/venues/${venueId}/events`);
  return res.data;
}
