"use client";
import { useSearchParams } from "next/navigation";
import {
  CREAR_ORDEN_EDIT_QUERY,
  CREAR_ORDEN_STEP_QUERY,
  CREAR_ORDEN_STEP_VALUE_PRODUCTOS,
} from "@/constants/routes";
import { CrearOrdenEditHydrator } from "./crear-orden-edit-hydrator";
import { CrearEnvioPaso1 } from "./crear-envio-paso1";
import { CrearEnvioPaso2 } from "./crear-envio-paso2";
import { RequireDraftOrdenPaso1 } from "./require-draft-orden-paso1";
export function CrearOrdenFlow() {
  const searchParams = useSearchParams();
  const step = searchParams.get(CREAR_ORDEN_STEP_QUERY);
  const editId = searchParams.get(CREAR_ORDEN_EDIT_QUERY)?.trim();
  const remixKey = editId || "nuevo";
  const body =
    step === CREAR_ORDEN_STEP_VALUE_PRODUCTOS ? (
      <RequireDraftOrdenPaso1>
        <CrearEnvioPaso2 key={`p2-${remixKey}`} />
      </RequireDraftOrdenPaso1>
    ) : (
      <CrearEnvioPaso1 key={`p1-${remixKey}`} />
    );
  return <CrearOrdenEditHydrator editId={editId}>{body}</CrearOrdenEditHydrator>;
}
