import api from "@/lib/customerAxios";
import { CustomerDto, UpdateCustomerRequest } from "@/types";

export async function getCustomer(id: string): Promise<CustomerDto> {
  const res = await api.get<CustomerDto>(`/customers/${id}`);
  return res.data;
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest
): Promise<CustomerDto> {
  const res = await api.put<CustomerDto>(`/customers/${id}`, data);
  return res.data;
}

/** Permanently deletes the signed-in customer's account. `userId` is the
 * User.id (not customerId) — matches the JWT subject the API authorizes
 * self-delete against. */
export async function deleteAccount(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}
