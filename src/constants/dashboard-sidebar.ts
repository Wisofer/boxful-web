import {
  DASHBOARD_VIEW_CREAR_ORDEN,
  DASHBOARD_VIEW_HISTORIAL,
  ROUTES,
} from "@/constants/routes";
export const DASHBOARD_SIDEBAR_ITEMS = [
  {
    key: "crear-orden",
    label: "Crear orden",
    href: ROUTES.crearOrden,
  },
  {
    key: "historial",
    label: "Historial",
    href: ROUTES.misEnviosHistorial,
  },
] as const;
export type DashboardSidebarKey = (typeof DASHBOARD_SIDEBAR_ITEMS)[number]["key"];
export function getDashboardSidebarSelectedKey(
  pathname: string | null,
  hubView: string | null,
): DashboardSidebarKey | undefined {
  if (pathname === ROUTES.appHub) {
    if (hubView === DASHBOARD_VIEW_CREAR_ORDEN) return "crear-orden";
    if (hubView === DASHBOARD_VIEW_HISTORIAL) return "historial";
    return undefined;
  }
  if (pathname?.startsWith("/crear-orden")) return "crear-orden";
  if (pathname?.includes("historial")) return "historial";
  return undefined;
}
