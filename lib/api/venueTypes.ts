import api from "@/lib/axios";
import { PagedResult, VenueTypeDto } from "@/types";

export async function getVenueTypes(
  page = 1,
  pageSize = 25
): Promise<PagedResult<VenueTypeDto>> {
  const res = await api.get<PagedResult<VenueTypeDto>>("/venueTypes", {
    params: { page, pageSize },
  });
  return res.data;
}
