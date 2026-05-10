export class InvalidOrderPathIdError extends Error {
  constructor() {
    super("Identificador de orden no válido.");
    this.name = "InvalidOrderPathIdError";
  }
}
export function assertValidOrderPathId(raw: unknown): string {
  const t = String(raw ?? "").trim();
  if (t.length === 0 || t.length > 64) {
    throw new InvalidOrderPathIdError();
  }
  if (!/^[A-Za-z0-9_-]+$/u.test(t)) {
    throw new InvalidOrderPathIdError();
  }
  return t;
}
export function isValidOrderPathId(raw: unknown): boolean {
  try {
    assertValidOrderPathId(raw);
    return true;
  } catch {
    return false;
  }
}
export function clampFinancialAmount(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 1e12);
}
