"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
import { CREAR_ORDEN_EDIT_QUERY, crearOrdenEditHref, ROUTES } from "@/constants/routes";
import {
  clearDraftCrearEnvioPaso1,
  loadDraftCrearEnvioPaso1,
} from "@/lib/draft-order-step1";
import { crearEnvioPaso1Schema } from "@/validations/create-order";
type RequireDraftOrdenPaso1Props = {
  children: ReactNode;
};
export function RequireDraftOrdenPaso1({ children }: RequireDraftOrdenPaso1Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get(CREAR_ORDEN_EDIT_QUERY)?.trim();
  const crearPaso1Target = useMemo(
    () => (editId ? crearOrdenEditHref(editId) : ROUTES.crearOrden),
    [editId],
  );
  const [allowed, setAllowed] = useState(false);
  const verify = useCallback((): void => {
    const raw = loadDraftCrearEnvioPaso1();
    if (!raw) {
      router.replace(crearPaso1Target);
      return;
    }
    const parsed = crearEnvioPaso1Schema.safeParse(raw);
    if (!parsed.success) {
      clearDraftCrearEnvioPaso1();
      router.replace(crearPaso1Target);
      return;
    }
    setAllowed(true);
  }, [router, crearPaso1Target]);
  useLayoutEffect(() => {
    const id = window.requestAnimationFrame(() => {
      verify();
    });
    return () => window.cancelAnimationFrame(id);
  }, [verify]);
  if (!allowed) {
    return (
      <CenteredBusy
        label={LOADING_MESSAGES.crearOrdenDraftVerify}
        layout="embedded-tall"
      />
    );
  }
  return <>{children}</>;
}
