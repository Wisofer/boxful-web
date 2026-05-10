"use client";
import { Card } from "antd";
import type { ReactNode } from "react";
type PageCardProps = {
  children: ReactNode;
  className?: string;
};
export function PageCard({ children, className }: PageCardProps) {
  return (
    <Card
      variant="borderless"
      className={[
        "bg-white shadow-sm [&_.ant-card-body]:p-[1em] md:[&_.ant-card-body]:p-[1.25em]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Card>
  );
}
