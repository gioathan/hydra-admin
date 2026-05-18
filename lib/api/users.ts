import api from "@/lib/axios";
import { UpdateUserRequest } from "@/types";

export async function updateUser(
  userId: string,
  data: UpdateUserRequest
): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/users/${userId}`, data);
  return res.data;
}
