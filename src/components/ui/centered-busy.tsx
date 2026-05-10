"use client";
import { LoadingOutlined } from "@ant-design/icons";
export type BusySurface = "white" | "auth" | "canvas";
type CenteredBusyProps = {
  label: string;
  description?: string;
  surface?: BusySurface;
  layout?: "route-fill" | "block" | "embedded-tall" | "fullscreen";
};
const surfaceClass: Record<BusySurface, string> = {
  white: "bg-white",
  auth: "bg-[var(--boxful-auth-layout-root)]",
  canvas: "bg-[var(--boxful-bg-canvas)]",
};
const layoutSurfaceClass: Record<NonNullable<CenteredBusyProps["layout"]>, string> = {
  "route-fill":
    "flex min-h-0 min-w-0 w-full flex-1 shrink-0 flex-col items-center justify-center py-10 sm:py-14",
  block:
    "flex min-h-0 min-w-0 w-full flex-1 shrink-0 flex-col items-center justify-center py-10 sm:py-12",
  "embedded-tall":
    "flex min-h-[min(50dvh,26rem)] w-full min-w-0 flex-col items-center justify-center py-10 sm:py-12",
  fullscreen:
    "flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[var(--boxful-bg-canvas)] py-8",
};
export function CenteredBusy({
  label,
  description,
  surface = "white",
  layout = "block",
}: CenteredBusyProps) {
  const layoutPart = layoutSurfaceClass[layout];
  const surfacePart = layout === "fullscreen" ? "" : surfaceClass[surface];
  const rootClass = `${layoutPart} ${surfacePart}`.trim();
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={description ? `${label}. ${description}` : label}
      className={`${rootClass} text-[var(--ant-color-primary,#3b5998)]`}
    >
      <div className="flex flex-col items-center gap-2">
        <LoadingOutlined
          spin
          aria-hidden
          className="text-[clamp(1.875rem,4vw,2.5rem)]"
        />
        {description ? (
          <span className="max-w-[20rem] text-center text-[13px] text-neutral-600">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
