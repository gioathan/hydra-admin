import api from "@/lib/axios";
import { PagedResult, RegisterVenueAdminRequest, UpdateUserRequest, UserDto, VenueAdminCreatedResponse } from "@/types";

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/users/${userId}`, data);
  return res.data;
}

export async function getAllUsers(page = 1, pageSize = 25): Promise<PagedResult<UserDto>> {
  const res = await api.get<PagedResult<UserDto>>("/users", { params: { page, pageSize } });
  return res.data;
}

export async function createVenueAdmin(data: RegisterVenueAdminRequest): Promise<VenueAdminCreatedResponse> {
  const res = await api.post<VenueAdminCreatedResponse>("/users/register/venue", data);
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}
