import api from "@/lib/axios";
import {
  VenueDto,
  UpdateVenueRequest,
  VenuePhotoDto,
  AddVenuePhotoRequest,
  ReorderVenuePhotosRequest,
  VenueRulesDto,
  UpdateVenueRulesRequest,
} from "@/types";

export async function getVenue(venueId: string): Promise<VenueDto> {
  const res = await api.get<VenueDto>(`/venues/${venueId}`);
  return res.data;
}

export async function updateVenue(
  venueId: string,
  data: UpdateVenueRequest
): Promise<VenueDto> {
  const res = await api.put<VenueDto>(`/venues/${venueId}`, data);
  return res.data;
}

export async function addVenuePhoto(
  venueId: string,
  data: AddVenuePhotoRequest
): Promise<VenuePhotoDto> {
  const res = await api.post<VenuePhotoDto>(`/venues/${venueId}/photos`, data);
  return res.data;
}

export async function deleteVenuePhoto(
  venueId: string,
  photoId: string
): Promise<void> {
  await api.delete(`/venues/${venueId}/photos/${photoId}`);
}

export async function reorderVenuePhotos(
  venueId: string,
  data: ReorderVenuePhotosRequest
): Promise<VenuePhotoDto[]> {
  const res = await api.put<VenuePhotoDto[]>(
    `/venues/${venueId}/photos/order`,
    data
  );
  return res.data;
}

export async function getVenueRules(venueId: string): Promise<VenueRulesDto> {
  const res = await api.get<VenueRulesDto>(`/venues/${venueId}/rules`);
  return res.data;
}

export async function updateVenueRules(
  venueId: string,
  data: UpdateVenueRulesRequest
): Promise<VenueRulesDto> {
  const res = await api.patch<VenueRulesDto>(`/venues/${venueId}/rules`, data);
  return res.data;
}
