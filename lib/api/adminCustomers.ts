import api from "@/lib/axios";
import { CustomerDto, PagedResult } from "@/types";

export async function getCustomers(params: { page?: number; pageSize?: number; email?: string; phone?: string }): Promise<PagedResult<CustomerDto>> {
  const res = await api.get<PagedResult<CustomerDto>>("/customers", { params });
  return res.data;
}
