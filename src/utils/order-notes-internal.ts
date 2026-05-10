export const ORDER_NOTES_DEPT_MUNI_LINE =
  /Departamento \(id\):\s*([^;\n]+);\s*Municipio \(id\):\s*([^\n\r]+)/;
export function parseDeptMunicipalityIdsFromNotes(notes: string): {
  departmentId: string;
  municipalityId: string;
} | null {
  const m = notes.match(ORDER_NOTES_DEPT_MUNI_LINE);
  if (!m) return null;
  return { departmentId: m[1].trim(), municipalityId: m[2].trim() };
}
export function stripDeptMunicipalityLineFromNotes(notes: string): string {
  return notes
    .replace(ORDER_NOTES_DEPT_MUNI_LINE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
