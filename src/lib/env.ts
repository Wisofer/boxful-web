import { z } from "zod";
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
});
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
function resolveApiBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  const defaultLocalApi = "http://localhost:3001/api";
  if (!trimmed) {
    return defaultLocalApi;
  }
  const urlCheck = z.string().url().safeParse(trimmed);
  if (!urlCheck.success) {
    console.warn(
      "[env] NEXT_PUBLIC_API_BASE_URL no es una URL válida; usando valor por defecto.",
    );
    return defaultLocalApi;
  }
  return urlCheck.data.replace(/\/$/, "");
}
export const env = {
  apiBaseUrl: resolveApiBaseUrl(
    parsed.success ? parsed.data.NEXT_PUBLIC_API_BASE_URL : undefined,
  ),
};
