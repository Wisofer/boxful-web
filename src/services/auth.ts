import type { AuthLoginResponse, AuthRegisterResponse } from "@/types/boxful-api";
import { httpClient } from "./http/client";
export async function authLogin(input: {
  email: string;
  password: string;
}): Promise<AuthLoginResponse> {
  const { data } = await httpClient.post<AuthLoginResponse>("auth/login", input);
  return data;
}
export async function authRegister(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthRegisterResponse> {
  const { data } = await httpClient.post<AuthRegisterResponse>("auth/register", input);
  return data;
}
