import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { CrearEnvioPaso1Values } from "@/validations/create-order";
function getSession(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}
export function saveDraftCrearEnvioPaso1(values: CrearEnvioPaso1Values): void {
  getSession()?.setItem(STORAGE_KEYS.draftCrearEnvioPaso1, JSON.stringify(values));
}
export function loadDraftCrearEnvioPaso1(): CrearEnvioPaso1Values | null {
  const raw = getSession()?.getItem(STORAGE_KEYS.draftCrearEnvioPaso1);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CrearEnvioPaso1Values;
  } catch {
    return null;
  }
}
export function clearDraftCrearEnvioPaso1(): void {
  getSession()?.removeItem(STORAGE_KEYS.draftCrearEnvioPaso1);
}
