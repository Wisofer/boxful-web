"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";
import {
  DASHBOARD_VIEW_CREAR_ORDEN,
  DASHBOARD_VIEW_HISTORIAL,
  DASHBOARD_VIEW_QUERY,
  ROUTES,
} from "@/constants/routes";
import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
import { CrearOrdenFlow } from "@/features/crear-orden";
import { HistorialEnvios } from "@/features/historial";
export function DashboardAppRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view =
    pathname === ROUTES.appHub ? searchParams.get(DASHBOARD_VIEW_QUERY) : null;
  useLayoutEffect(() => {
    if (pathname !== ROUTES.appHub) return;
    if (view !== DASHBOARD_VIEW_HISTORIAL && view !== DASHBOARD_VIEW_CREAR_ORDEN) {
      router.replace(ROUTES.crearOrden);
    }
  }, [pathname, router, view]);
  if (pathname !== ROUTES.appHub) {
    return null;
  }
  if (view !== DASHBOARD_VIEW_HISTORIAL && view !== DASHBOARD_VIEW_CREAR_ORDEN) {
    return <CenteredBusy label={LOADING_MESSAGES.hubRedirect} />;
  }
  if (view === DASHBOARD_VIEW_CREAR_ORDEN) {
    return <CrearOrdenFlow />;
  }
  return <HistorialEnvios />;
}
