import api from "@/lib/axios";
import { CreateVenueTypeRequest, PagedResult, UpdateVenueTypeRequest, VenueTypeDto } from "@/types";

export async function getVenueTypes(page = 1, pageSize = 25): Promise<PagedResult<VenueTypeDto>> {
  const res = await api.get<PagedResult<VenueTypeDto>>("/venueTypes", { params: { page, pageSize } });
  return res.data;
}

export async function createVenueType(data: CreateVenueTypeRequest): Promise<VenueTypeDto> {
  const res = await api.post<VenueTypeDto>("/venueTypes", data);
  return res.data;
}

export async function updateVenueType(id: string, data: UpdateVenueTypeRequest): Promise<VenueTypeDto> {
  const res = await api.put<VenueTypeDto>(`/venueTypes/${id}`, data);
  return res.data;
}

export async function deleteVenueType(id: string): Promise<void> {
  await api.delete(`/venueTypes/${id}`);
}
