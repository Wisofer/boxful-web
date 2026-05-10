"use client";
import { WalletOutlined } from "@ant-design/icons";
import { Popover, Skeleton, Space, Typography } from "antd";
import type { ReactNode } from "react";
import { useDashboardHeaderFromShell } from "@/components/providers/dashboard-header-context";
import { formatUsd } from "@/utils/order-financial-display";
import styles from "./dashboard-top-bar.module.css";
type DashboardTopBarProps = {
  title: ReactNode;
  rightSlot?: ReactNode;
};
export function CrearUnEnvioHeaderTitle(): ReactNode {
  return (
    <span className={styles.titleCrearUnEnvio}>
      Crear un <strong className={styles.titleEmphasisWord}>envío</strong>
    </span>
  );
}
function DefaultTrail() {
  const { displayName, liquidationMonthTotal, liquidationSummaryMonthLabel, loading } =
    useDashboardHeaderFromShell();
  if (loading) {
    return (
      <div className={styles.skeletonRow} aria-busy="true">
        <Skeleton.Button active style={{ width: 188, height: 32 }} />
        <Skeleton.Input active style={{ width: 140, height: 20 }} />
      </div>
    );
  }
  return (
    <div className={styles.trail}>
      <Popover
        content={
          <span className={styles.liquidationMonthPopover}>
            Mes: {liquidationSummaryMonthLabel}
            <span className={styles.liquidationMonthHint}>
              Total con la misma convención que el historial (envío estándar: cargo mostrado con
              signo negativo aunque en API llegue positivo solo como magnitud).
            </span>
          </span>
        }
        trigger={["hover", "click"]}
        placement="bottom"
      >
        <span
          className={styles.tagPill}
          tabIndex={0}
          role="button"
          aria-label={`Liquidación mes: ${formatUsd(liquidationMonthTotal)}. Tocá o pasá el cursor para ver el mes y la ayuda.`}
        >
          <Space size={6}>
            <WalletOutlined aria-hidden />
            <span>
              Liquidación mes{" "}
              <strong className={styles.liquidationAmount}>
                {formatUsd(liquidationMonthTotal)}
              </strong>
            </span>
          </Space>
        </span>
      </Popover>
      <Typography.Text className={styles.userName} title={displayName}>
        {displayName}
      </Typography.Text>
    </div>
  );
}
export function DashboardTopBar({ title, rightSlot }: DashboardTopBarProps) {
  return (
    <div className={`${styles.wrap} w-full min-w-0`}>
      <div className={styles.titleRow}>
        <Typography.Title level={2} className={styles.title}>
          {title}
        </Typography.Title>
      </div>
      <div className={styles.trailDivider} aria-hidden />
      {rightSlot ?? <DefaultTrail />}
    </div>
  );
}
