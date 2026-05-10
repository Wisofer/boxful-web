"use client";
import { Spin } from "antd";
export function FormFullscreenBusy({
  spinning,
  description,
}: {
  spinning: boolean;
  description: string;
}) {
  return (
    <Spin
      fullscreen
      spinning={spinning}
      description={description}
      aria-label={description}
    />
  );
}
