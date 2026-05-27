import api from "@/lib/customerAxios";
import { PendingRatingDto } from "@/types";

export async function getPendingRatings(): Promise<PendingRatingDto[]> {
  const res = await api.get<PendingRatingDto[]>("/ratings/pending");
  return res.data;
}
