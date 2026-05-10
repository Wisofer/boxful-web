"use client";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
import { ROUTES } from "@/constants/routes";
import {
  clearDraftEditOrderPackages,
  saveDraftEditOrderPackages,
} from "@/lib/draft-edit-order-packages";
import { clearEditOrderSession, saveEditOrderSession } from "@/lib/edit-order-session";
import { saveDraftCrearEnvioPaso1 } from "@/lib/draft-order-step1";
import { fetchOrderById } from "@/services/orders";
import { getApiErrorMessage } from "@/utils/api-error";
import { mapApiOrderToCrearEnvioDraft } from "@/utils/map-api-order-to-crear-envio-draft";
import { orderAllowsFullFormEdit } from "@/utils/order-status-patch-options";
import { isValidOrderPathId } from "@/utils/order-path-id";
type CrearOrdenEditHydratorProps = {
  editId: string | undefined;
  children: ReactNode;
};
export function CrearOrdenEditHydrator({
  editId,
  children,
}: CrearOrdenEditHydratorProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const trimmed = editId?.trim();
  const [loading, setLoading] = useState(Boolean(trimmed));
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!trimmed) {
        clearEditOrderSession();
        clearDraftEditOrderPackages();
        setLoading(false);
        return;
      }
      if (!isValidOrderPathId(trimmed)) {
        message.error("Identificador de orden no válido.");
        router.replace(ROUTES.misEnviosHistorial);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const order = await fetchOrderById(trimmed);
        if (cancelled) return;
        if (!orderAllowsFullFormEdit(order.status)) {
          message.warning(
            "Esta orden ya no se puede editar con el formulario completo.",
          );
          router.replace(ROUTES.misEnviosHistorial);
          return;
        }
        const { paso1, packages } = mapApiOrderToCrearEnvioDraft(order);
        saveDraftCrearEnvioPaso1(paso1);
        saveDraftEditOrderPackages(packages);
        saveEditOrderSession({
          orderId: trimmed,
          collectedAmount: Number(order.collectedAmount) || 0,
        });
      } catch (err) {
        if (cancelled) return;
        message.error(getApiErrorMessage(err));
        router.replace(ROUTES.misEnviosHistorial);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trimmed, message, router]);
  if (trimmed && loading) {
    return (
      <CenteredBusy
        label={LOADING_MESSAGES.crearOrdenEditHydrating}
        layout="embedded-tall"
      />
    );
  }
  return <>{children}</>;
}
