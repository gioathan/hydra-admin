import api from "@/lib/axios";
import { CustomerVenueDto, CustomerPagedResult } from "@/types";

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
