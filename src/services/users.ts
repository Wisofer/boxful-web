import type { ApiUser } from "@/types/boxful-api";
import { httpClient } from "./http/client";
export async function fetchCurrentUser(): Promise<ApiUser> {
  const { data } = await httpClient.get<{
    user: ApiUser;
  }>("users/me");
  return data.user;
}
