import api from "@/lib/axios";
import { LoginRequest, LoginResponse } from "@/types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}
