import { redirect } from "next/navigation";
import { crearOrdenProductosHref } from "@/constants/routes";
export default function CrearOrdenPaquetesLegacyRedirect() {
  redirect(crearOrdenProductosHref());
}
