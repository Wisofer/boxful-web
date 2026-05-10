import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { PackageRowValues } from "@/validations/create-order";
type Wrapped = {
  v: 1;
  packages: PackageRowValues[];
};
function getS(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}
export function saveDraftEditOrderPackages(packages: PackageRowValues[]): void {
  const payload: Wrapped = { v: 1, packages };
  getS()?.setItem(STORAGE_KEYS.draftCrearEnvioEditPackages, JSON.stringify(payload));
}
export function loadDraftEditOrderPackages(): PackageRowValues[] | null {
  const raw = getS()?.getItem(STORAGE_KEYS.draftCrearEnvioEditPackages);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Wrapped;
    if (p?.v !== 1 || !Array.isArray(p.packages)) return null;
    return p.packages;
  } catch {
    return null;
  }
}
export function clearDraftEditOrderPackages(): void {
  getS()?.removeItem(STORAGE_KEYS.draftCrearEnvioEditPackages);
}
