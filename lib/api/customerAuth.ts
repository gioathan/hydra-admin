import api from "@/lib/axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types";

export async function customerLogin(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/users/register/customer", data);
  return res.data;
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<void> {
  await api.post("/auth/verify-email", data);
}

export async function resendVerification(data: ResendVerificationRequest): Promise<void> {
  await api.post("/auth/resend-verification", data);
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await api.post("/auth/forgot-password", data);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await api.post("/auth/reset-password", data);
}
