import api from "@/lib/axios";
import { PendingRatingDto } from "@/types";

export async function getPendingRatings(): Promise<PendingRatingDto[]> {
  const res = await api.get<PendingRatingDto[]>("/ratings/pending");
  return res.data;
}
