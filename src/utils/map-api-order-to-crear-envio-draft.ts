import type { ApiOrder } from "@/types/boxful-api";
import type {
  CrearEnvioPaso1Values,
  PackageRowValues,
} from "@/validations/create-order";
import { parseDeptMunicipalityIdsFromNotes } from "@/utils/order-notes-internal";
const RE_COLLECT_ADDR = /^Dirección de recolección:\s*(.+)$/m;
const RE_SCHEDULED = /^Fecha programada:\s*(.+)$/m;
const RE_CONTACT = /^Contacto \/ remitente:\s*(.+)$/im;
const RE_EMAIL = /^Correo remitente:\s*(.+)$/im;
const RE_REF = /^Punto de referencia:\s*(.+)$/m;
const RE_INSTR = /^Indicaciones:\s*(.+)$/m;
function noteLine(raw: string, re: RegExp): string {
  const m = raw.match(re);
  return (m?.[1] ?? "").replace(/\r/g, "").trim();
}
function splitName(full: string): {
  first: string;
  last: string;
} {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0]!, last: "" };
  return { first: parts[0]!, last: parts.slice(1).join(" ") };
}
function parseStoredPhone(customerPhone: string): {
  dial: string;
  national: string;
} {
  const t = customerPhone.trim();
  const m = /^(\+\d+)\s+(.*)$/.exec(t);
  if (m) {
    return {
      dial: m[1] ?? "+503",
      national: (m[2] ?? "").trim(),
    };
  }
  return { dial: "+503", national: t.replace(/^\+\d+\s*/, "").trim() || t };
}
function deptMunIds(order: ApiOrder): {
  departmentId: string;
  municipalityId: string;
} {
  const a = order.departmentId?.trim();
  const b = order.municipalityId?.trim();
  if (a && b) return { departmentId: a, municipalityId: b };
  const parsed = parseDeptMunicipalityIdsFromNotes(order.notes ?? "");
  if (parsed) return parsed;
  return { departmentId: "", municipalityId: "" };
}
function emailDraft(raw: string): string {
  const t = raw.trim();
  if (t.includes("@") && /\S@\S/.test(t)) return t;
  return "noreply@example.com";
}
export function mapApiOrderToCrearEnvioDraft(order: ApiOrder): {
  paso1: CrearEnvioPaso1Values;
  packages: PackageRowValues[];
} {
  const notes = order.notes?.trim() ?? "";
  const pickupAddress = noteLine(notes, RE_COLLECT_ADDR);
  const pickupDate = noteLine(notes, RE_SCHEDULED);
  const emailDraftVal = emailDraft(noteLine(notes, RE_EMAIL));
  let senderFirstNames: string;
  let senderLastNames: string;
  const fromApiName = splitName(order.customerName ?? "");
  const contactLineName = noteLine(notes, RE_CONTACT);
  const fromContactName = splitName(contactLineName);
  if (fromApiName.first) {
    senderFirstNames = fromApiName.first;
    senderLastNames = fromApiName.last;
  } else if (fromContactName.first) {
    senderFirstNames = fromContactName.first;
    senderLastNames = fromContactName.last;
  } else {
    senderFirstNames = "";
    senderLastNames = "";
  }
  const phoneParts = parseStoredPhone(order.customerPhone ?? "");
  const { departmentId, municipalityId } = deptMunIds(order);
  const paso1: CrearEnvioPaso1Values = {
    pickupAddress,
    pickupDate,
    senderFirstNames,
    senderLastNames,
    senderEmail: emailDraftVal,
    senderPhoneDialCode: phoneParts.dial || "+503",
    senderPhoneNational: phoneParts.national,
    recipientAddress: order.customerAddress?.trim() ?? "",
    departmentId,
    municipalityId,
    referencePoint: noteLine(notes, RE_REF),
    instructions: noteLine(notes, RE_INSTR),
    codEnabled: Boolean(order.isCOD),
    codAmount:
      order.isCOD && Number.isFinite(Number(order.expectedAmount))
        ? Number(order.expectedAmount).toFixed(2).replace(",", ".")
        : "00.00",
  };
  return { paso1, packages: packageRowsFromApi(order) };
}
function packageRowsFromApi(order: ApiOrder): PackageRowValues[] {
  const list = order.packages ?? [];
  const rows: PackageRowValues[] = [];
  for (const p of list) {
    const qty = Math.max(1, Math.floor(Number(p.quantity) || 1));
    for (let i = 0; i < qty; i += 1) {
      rows.push({
        weightLb: Number(p.weight) || 0,
        contents: (p.description ?? "").trim() || "—",
        length: Number(p.length) || 0,
        width: Number(p.width) || 0,
        height: Number(p.height) || 0,
      });
    }
  }
  return rows;
}
