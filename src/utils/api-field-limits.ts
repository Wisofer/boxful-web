export const CREATE_ORDER_LIMITS = {
  customerName: 200,
  customerPhone: 40,
  customerAddress: 1000,
  notes: 5000,
  packageDescription: 2000,
} as const;
export function clipForApi(value: string, max: number): string {
  const s = value.trim();
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd();
}
