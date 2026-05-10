import { STORAGE_KEYS } from "@/constants/storage-keys";
export type EditOrderSessionV1 = {
  v: 1;
  orderId: string;
  collectedAmount: number;
};
function getS(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}
export function saveEditOrderSession(input: {
  orderId: string;
  collectedAmount: number;
}): void {
  const payload: EditOrderSessionV1 = {
    v: 1,
    orderId: input.orderId.trim(),
    collectedAmount: Number(input.collectedAmount) || 0,
  };
  getS()?.setItem(STORAGE_KEYS.crearEnvioEditSession, JSON.stringify(payload));
}
export function loadEditOrderSession(): EditOrderSessionV1 | null {
  const raw = getS()?.getItem(STORAGE_KEYS.crearEnvioEditSession);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as EditOrderSessionV1;
    if (p?.v !== 1 || typeof p.orderId !== "string") return null;
    return p;
  } catch {
    return null;
  }
}
export function clearEditOrderSession(): void {
  getS()?.removeItem(STORAGE_KEYS.crearEnvioEditSession);
}
