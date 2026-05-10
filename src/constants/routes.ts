export const ROUTES = {
  home: "/",
  login: "/login",
  registro: "/registro",
  appHub: "/app",
  misEnviosHistorial: "/app?view=historial",
  crearOrden: "/app?view=crear-orden",
  crearOrdenPaquetes: "/crear-orden/paquetes",
} as const;
export const DASHBOARD_VIEW_QUERY = "view";
export const DASHBOARD_VIEW_HISTORIAL = "historial";
export const DASHBOARD_VIEW_CREAR_ORDEN = "crear-orden";
export const HISTORIAL_ORDER_DETAIL_QUERY = "orden";
export const CREAR_ORDEN_STEP_QUERY = "step";
export const CREAR_ORDEN_STEP_VALUE_PRODUCTOS = "productos";
export const CREAR_ORDEN_EDIT_QUERY = "edit";
export function crearOrdenProductosHref(): string {
  return `${ROUTES.crearOrden}&${CREAR_ORDEN_STEP_QUERY}=${CREAR_ORDEN_STEP_VALUE_PRODUCTOS}`;
}
export function crearOrdenEditHref(orderId: string): string {
  const id = encodeURIComponent(orderId.trim());
  return `${ROUTES.crearOrden}&${CREAR_ORDEN_EDIT_QUERY}=${id}`;
}
export function crearOrdenEditProductosHref(orderId: string): string {
  return `${crearOrdenEditHref(orderId)}&${CREAR_ORDEN_STEP_QUERY}=${CREAR_ORDEN_STEP_VALUE_PRODUCTOS}`;
}
export function crearOrdenAfterPaso1Href(
  editOrderId: string | null | undefined,
): string {
  const t = editOrderId?.trim();
  return t ? crearOrdenEditProductosHref(t) : crearOrdenProductosHref();
}
export function historialDetailHref(orderId: string): string {
  const id = encodeURIComponent(orderId.trim());
  return `${ROUTES.appHub}?${DASHBOARD_VIEW_QUERY}=${DASHBOARD_VIEW_HISTORIAL}&${HISTORIAL_ORDER_DETAIL_QUERY}=${id}`;
}
