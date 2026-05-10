import { STORAGE_KEYS } from "@/constants/storage-keys";
function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage;
}
export function getStoredAccessToken(): string | null {
  return getStorage()?.getItem(STORAGE_KEYS.accessToken) ?? null;
}
export function setStoredAccessToken(token: string): void {
  getStorage()?.setItem(STORAGE_KEYS.accessToken, token);
}
export function clearStoredAccessToken(): void {
  getStorage()?.removeItem(STORAGE_KEYS.accessToken);
}
