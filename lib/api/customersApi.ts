import api from "@/lib/axios";
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
