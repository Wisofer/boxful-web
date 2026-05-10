export function normalizeNationalPhone(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
