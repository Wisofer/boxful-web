import type { CreateOrderBody, UpdateOrderBody } from "@/types/boxful-api";
import type { CrearEnvioPaso1Values } from "@/validations/create-order";
import type { PackageRowValues } from "@/validations/create-order";
import { clipForApi, CREATE_ORDER_LIMITS } from "@/utils/api-field-limits";
import { clampFinancialAmount } from "@/utils/order-path-id";
export function buildCreateOrderBody(
  paso1: CrearEnvioPaso1Values,
  packages: PackageRowValues[],
): CreateOrderBody {
  const dial = paso1.senderPhoneDialCode.replace(/\s/g, "");
  const national = paso1.senderPhoneNational.trim().replace(/\s+/g, " ");
  const customerPhone =
    dial.startsWith("+") || dial === ""
      ? `${dial} ${national}`.trim()
      : `+${dial} ${national}`.trim();
  const codAmountRaw = paso1.codAmount.replace(",", ".").trim();
  const codNum = codAmountRaw === "" ? 0 : Number(codAmountRaw);
  const notesLines = [
    paso1.pickupAddress.trim()
      ? `Dirección de recolección: ${paso1.pickupAddress.trim()}`
      : null,
    paso1.pickupDate.trim() ? `Fecha programada: ${paso1.pickupDate.trim()}` : null,
    `Contacto / remitente: ${paso1.senderFirstNames.trim()} ${paso1.senderLastNames.trim()}`,
    paso1.senderEmail.trim() ? `Correo remitente: ${paso1.senderEmail.trim()}` : null,
    paso1.referencePoint.trim()
      ? `Punto de referencia: ${paso1.referencePoint.trim()}`
      : null,
    paso1.instructions.trim() ? `Indicaciones: ${paso1.instructions.trim()}` : null,
    `Departamento (id): ${paso1.departmentId}; Municipio (id): ${paso1.municipalityId}`,
  ].filter(Boolean);
  const notesRaw = notesLines.join("\n");
  const customerNameRaw =
    `${paso1.senderFirstNames.trim()} ${paso1.senderLastNames.trim()}`.trim();
  return {
    customerName: clipForApi(customerNameRaw, CREATE_ORDER_LIMITS.customerName),
    customerPhone: clipForApi(customerPhone, CREATE_ORDER_LIMITS.customerPhone),
    customerAddress: clipForApi(
      paso1.recipientAddress.trim(),
      CREATE_ORDER_LIMITS.customerAddress,
    ),
    notes: clipForApi(notesRaw, CREATE_ORDER_LIMITS.notes),
    isCOD: paso1.codEnabled,
    expectedAmount: paso1.codEnabled && Number.isFinite(codNum) ? codNum : 0,
    collectedAmount: 0,
    packages: packages.map((p) => ({
      description: clipForApi(
        p.contents.trim(),
        CREATE_ORDER_LIMITS.packageDescription,
      ),
      weight: p.weightLb,
      height: p.height,
      width: p.width,
      length: p.length,
      quantity: 1,
    })),
  };
}
export function buildPatchOrderBodyFromCrearForms(
  paso1: CrearEnvioPaso1Values,
  packages: PackageRowValues[],
  collectedAmount: number,
): UpdateOrderBody {
  const base = buildCreateOrderBody(paso1, packages);
  const coll = Number(collectedAmount);
  return {
    ...base,
    collectedAmount: clampFinancialAmount(Number.isFinite(coll) ? coll : 0),
    departmentId: paso1.departmentId.trim(),
    municipalityId: paso1.municipalityId.trim(),
  };
}
