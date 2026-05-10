"use client";
import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
export function AuthFullscreenSpinner() {
  return <CenteredBusy label={LOADING_MESSAGES.authInitializing} layout="fullscreen" />;
}
