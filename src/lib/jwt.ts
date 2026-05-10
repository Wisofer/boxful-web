import { jwtDecode } from "jwt-decode";
export type JwtPayload = {
  exp?: number;
  sub?: string;
  email?: string;
};
export function decodeJwt(accessToken: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(accessToken);
  } catch {
    return null;
  }
}
export function isJwtExpired(accessToken: string, skewSeconds = 30): boolean {
  const payload = decodeJwt(accessToken);
  if (!payload?.exp) return true;
  const now = Date.now() / 1000;
  return payload.exp <= now + skewSeconds;
}
