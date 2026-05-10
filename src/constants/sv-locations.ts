export const SV_DEPARTMENTS = [
  { value: "san-salvador", label: "San Salvador" },
  { value: "la-libertad", label: "La Libertad" },
  { value: "santa-ana", label: "Santa Ana" },
] as const;
export const SV_MUNICIPALITIES: Record<
  string,
  readonly {
    value: string;
    label: string;
  }[]
> = {
  "san-salvador": [
    { value: "san-salvador", label: "San Salvador" },
    { value: "soyapango", label: "Soyapango" },
    { value: "ilopango", label: "Ilopango" },
  ],
  "la-libertad": [
    { value: "santa-tecla", label: "Santa Tecla" },
    { value: "nuevo-cuscatlan", label: "Nuevo Cuscatlán" },
  ],
  "santa-ana": [{ value: "santa-ana-centro", label: "Santa Ana Centro" }],
};
export function getSvDepartmentLabel(departmentId: string): string | null {
  const id = departmentId.trim();
  if (!id) return null;
  const row = SV_DEPARTMENTS.find((d) => d.value === id);
  return row?.label ?? null;
}
export function getSvMunicipalityLabel(
  departmentId: string,
  municipalityId: string,
): string | null {
  const d = departmentId.trim();
  const m = municipalityId.trim();
  if (!d || !m) return null;
  const list = SV_MUNICIPALITIES[d];
  if (!list) return null;
  const row = list.find((x) => x.value === m);
  return row?.label ?? null;
}
