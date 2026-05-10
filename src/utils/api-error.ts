import { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";
import { InvalidOrderPathIdError } from "@/utils/order-path-id";
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof InvalidOrderPathIdError) {
    return error.message;
  }
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return "Sesión vencida o no autorizado. Iniciá sesión de nuevo.";
    }
    if (status === 403) {
      return "No tenés permiso para esta acción.";
    }
    if (status === 404) {
      return "No encontramos el recurso solicitado.";
    }
    if (status !== undefined && status >= 500) {
      return "Error en el servidor. Intentá de nuevo en unos minutos.";
    }
    const data = error.response?.data as ApiErrorBody | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) {
      const s = msg.filter(Boolean).join(". ").trim();
      if (s.length > 0 && s.length < 500) return s;
    }
    if (typeof msg === "string" && msg.trim().length > 0 && msg.length < 500) {
      return msg.trim();
    }
    if (status === 429) {
      return "Demasiados intentos. Esperá un momento e intentá de nuevo.";
    }
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      return "Sin conexión o el servidor no respondió. Revisa si el servidor esta encendido.";
    }
    return "No se pudo completar la solicitud. Intentá de nuevo.";
  }
  if (error instanceof Error) {
    const m = error.message;
    if (m === "INVALID_ORDER_ID" || m.includes("Network")) {
      return "No se pudo completar la solicitud. Intentá de nuevo.";
    }
    if (m.length > 0 && m.length < 300) return m;
    return "Error inesperado";
  }
  return "Error inesperado";
}
