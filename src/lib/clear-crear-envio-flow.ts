import { clearDraftEditOrderPackages } from "@/lib/draft-edit-order-packages";
import { clearEditOrderSession } from "@/lib/edit-order-session";
import { clearDraftCrearEnvioPaso1 } from "./draft-order-step1";
export function clearEntireCrearEnvioFlowDrafts(): void {
  clearDraftCrearEnvioPaso1();
  clearEditOrderSession();
  clearDraftEditOrderPackages();
}
