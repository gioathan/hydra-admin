import api from "@/lib/axios";
import { LoginRequest, LoginResponse, GoogleLoginRequest } from "@/types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function googleLogin(data: GoogleLoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/google", data);
  return res.data;
}
