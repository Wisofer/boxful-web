import { getSvDepartmentLabel, getSvMunicipalityLabel } from "@/constants/sv-locations";
import type { ApiOrder } from "@/types/boxful-api";
import type { HistorialEnvioRow } from "@/types/historial-table";
import {
  parseDeptMunicipalityIdsFromNotes,
  stripDeptMunicipalityLineFromNotes,
} from "@/utils/order-notes-internal";
import { signedLiquidationNetForUi } from "@/utils/order-financial-display";
import { orderStatusLabel } from "@/utils/order-status-label";
export function mapApiOrderToHistorialRow(order: ApiOrder): HistorialEnvioRow {
  const full = order.customerName?.trim() || "—";
  const parts = full.split(/\s+/).filter(Boolean);
  const firstName = parts.length ? parts[0] : "—";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "—";
  const packageCount =
    order.packages?.reduce((acc, p) => acc + (p.quantity || 1), 0) ?? 0;
  const apiDept = order.departmentId?.trim();
  const apiMun = order.municipalityId?.trim();
  const fromNotesIds = parseDeptMunicipalityIdsFromNotes(order.notes ?? "");
  let departmentLabel = "—";
  let municipalityLabel = "—";
  if (apiDept && apiMun) {
    departmentLabel = getSvDepartmentLabel(apiDept) ?? apiDept;
    municipalityLabel = getSvMunicipalityLabel(apiDept, apiMun) ?? apiMun;
  } else if (fromNotesIds) {
    departmentLabel =
      getSvDepartmentLabel(fromNotesIds.departmentId) ?? fromNotesIds.departmentId;
    municipalityLabel =
      getSvMunicipalityLabel(fromNotesIds.departmentId, fromNotesIds.municipalityId) ??
      fromNotesIds.municipalityId;
  }
  const hasLocationForUi = Boolean(apiDept && apiMun) || Boolean(fromNotesIds);
  const notesFull = order.notes?.trim() ?? "";
  const notesDetailDisplay = hasLocationForUi
    ? stripDeptMunicipalityLineFromNotes(notesFull)
    : notesFull;
  const created = order.createdAt ? new Date(order.createdAt) : new Date(Number.NaN);
  const createdAtFormatted = Number.isFinite(created.getTime())
    ? created.toLocaleString("es-SV", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  return {
    key: order.id,
    orderNo: order.id,
    createdAtISO: order.createdAt ?? "",
    createdAtFormatted,
    statusCode: order.status,
    statusLabel: orderStatusLabel(order.status),
    firstName,
    lastName,
    department: departmentLabel,
    municipality: municipalityLabel,
    packages: packageCount,
    isCOD: order.isCOD,
    expectedAmount: Number(order.expectedAmount) || 0,
    collectedAmount: Number(order.collectedAmount) || 0,
    shippingCost: Number(order.shippingCost) || 0,
    commission: Number(order.commission) || 0,
    liquidationNetSigned: signedLiquidationNetForUi(order),
    customerPhone: order.customerPhone?.trim() || "—",
    customerAddress: order.customerAddress?.trim() || "—",
    notesRaw: notesFull,
    notesDetailDisplay,
    packageLines: (order.packages ?? []).map((p) => ({
      description: p.description?.trim() || "—",
      quantity: Math.max(0, Number(p.quantity) || 0) || 1,
      weight: Number(p.weight) || 0,
      length: Number(p.length) || 0,
      width: Number(p.width) || 0,
      height: Number(p.height) || 0,
    })),
  };
}
