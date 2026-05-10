import { Tag } from "antd";
import type { ReactNode } from "react";
type PillBadgeProps = {
  children: ReactNode;
  color?: "success" | "processing" | "default";
  className?: string;
};
export function PillBadge({ children, color = "success", className }: PillBadgeProps) {
  return (
    <Tag
      color={color}
      className={[
        "m-0 inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 font-medium",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
