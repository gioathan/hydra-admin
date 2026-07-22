import api from "@/lib/axios";
import { PagedResult, RegisterVenueAdminRequest, UpdateUserRequest, UserDto, VenueAdminCreatedResponse } from "@/types";

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/users/${userId}`, data);
  return res.data;
}

export async function updateUserEmail(userId: string, email: string): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/users/${userId}/email`, { email });
  return res.data;
}

export async function getAllUsers(
  page = 1,
  pageSize = 25,
  search?: string,
  role?: string
): Promise<PagedResult<UserDto>> {
  const params: Record<string, string | number> = { page, pageSize };
  if (search) params.search = search;
  if (role) params.role = role;
  const res = await api.get<PagedResult<UserDto>>("/users", { params });
  return res.data;
}

export async function createVenueAdmin(data: RegisterVenueAdminRequest): Promise<VenueAdminCreatedResponse> {
  const res = await api.post<VenueAdminCreatedResponse>("/users/register/venue", data);
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}
