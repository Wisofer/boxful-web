"use client";
import { EditOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Descriptions,
  Drawer,
  Empty,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { crearOrdenEditHref } from "@/constants/routes";
import { patchOrder } from "@/services/orders";
import type { ApiOrder, OrderStatus, UpdateOrderBody } from "@/types/boxful-api";
import type { HistorialEnvioRow } from "@/types/historial-table";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatUsd } from "@/utils/order-financial-display";
import { clampFinancialAmount } from "@/utils/order-path-id";
import {
  allowedPatchStatuses,
  statusPatchFrozen,
} from "@/utils/order-status-patch-options";
import {
  ORDER_STATUS_SELECT_SEQUENCE,
  orderStatusLabel,
  orderStatusTagColor,
} from "@/utils/order-status-label";
import styles from "./historial-order-detail-drawer.module.css";
export type HistorialOrderDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  row: HistorialEnvioRow | null;
  onPatched?: (order: ApiOrder) => void;
  loadingSingle: boolean;
  singleError: boolean;
};
type PackageLine = HistorialEnvioRow["packageLines"][number];
function packageDimsDesc(p: PackageLine): string {
  return `${p.length}×${p.width}×${p.height} · ${p.weight} lb`;
}
export function HistorialOrderDetailDrawer({
  open,
  onClose,
  row,
  onPatched,
  loadingSingle,
  singleError,
}: HistorialOrderDetailDrawerProps) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const loadingState = loadingSingle && !row;
  const emptyState = singleError && !row && !loadingSingle;
  const [draftStatus, setDraftStatus] = useState<OrderStatus>("PENDING");
  const [draftCollected, setDraftCollected] = useState<number>(0);
  const [patching, setPatching] = useState(false);
  const rowKey = row?.key;
  const rowStatus = row?.statusCode;
  const rowCollected = row?.collectedAmount ?? 0;
  useEffect(() => {
    if (rowKey == null) return undefined;
    const sid = window.setTimeout(() => {
      if (rowStatus) setDraftStatus(rowStatus);
      setDraftCollected(Number(rowCollected) || 0);
    }, 0);
    return () => window.clearTimeout(sid);
  }, [rowKey, rowStatus, rowCollected]);
  const patchFrozen = row !== null ? statusPatchFrozen(row.statusCode) : false;
  const dirty =
    row !== null &&
    !patchFrozen &&
    (draftStatus !== row.statusCode ||
      (Boolean(row.isCOD) &&
        Math.abs(draftCollected - (Number(row.collectedAmount) || 0)) > 1e-6));
  const statusPatchOptions =
    row !== null
      ? allowedPatchStatuses(row.statusCode)
      : [...ORDER_STATUS_SELECT_SEQUENCE];
  const hasPositiveCollected = (n: number): boolean => Number.isFinite(n) && n > 0;
  const executePatch = async (): Promise<void> => {
    if (!row || patching || !dirty || patchFrozen) return;
    const body: UpdateOrderBody = {};
    if (draftStatus !== row.statusCode) {
      const allowedNext = allowedPatchStatuses(row.statusCode);
      if (!allowedNext.includes(draftStatus)) {
        message.error("Esa transición de estado no está permitida.");
        return;
      }
      body.status = draftStatus;
    }
    if (
      row.isCOD &&
      Math.abs(draftCollected - (Number(row.collectedAmount) || 0)) > 1e-6
    ) {
      body.collectedAmount = clampFinancialAmount(draftCollected);
    }
    if (Object.keys(body).length === 0) return;
    setPatching(true);
    try {
      const updated = await patchOrder(row.orderNo, body);
      message.success("Orden actualizada");
      setDraftStatus(updated.status);
      setDraftCollected(Number(updated.collectedAmount) || 0);
      onPatched?.(updated);
    } catch (e) {
      message.error(getApiErrorMessage(e));
    } finally {
      setPatching(false);
    }
  };
  const codDeliveredWithoutCollected =
    Boolean(row?.isCOD) &&
    draftStatus === "DELIVERED" &&
    !hasPositiveCollected(draftCollected);
  const handlePatch = (): void => {
    if (!row || patching || !dirty || patchFrozen) return;
    if (codDeliveredWithoutCollected) {
      modal.confirm({
        title: "Entrega COD sin monto recolectado",
        content:
          "Dejás el orden como entregada pero el monto cobrado es $0 o vacío. " +
          "Si hubo contra entrega, conviene anotarlo para liquidación y comisiones. " +
          "¿Guardo igual o preferís corregir el monto arriba?",
        okText: "Guardar igual",
        cancelText: "Revisar monto",
        okType: "default",
        centered: true,
        onOk: () => void executePatch(),
      });
      return;
    }
    void executePatch();
  };
  return (
    <Drawer
      title="Detalle de envío"
      placement="right"
      size={440}
      destroyOnHidden
      onClose={onClose}
      open={open}
      className={styles.drawerRoot}
      rootClassName={styles.drawerWidthResponsive}
      styles={{
        body: { paddingTop: 10, paddingBottom: 10, paddingInline: 16 },
      }}
    >
      <Spin spinning={loadingState}>
        <div aria-busy={loadingSingle}>
          {loadingState ? (
            <Skeleton paragraph={{ rows: 8 }} active />
          ) : emptyState ? (
            <Empty
              description={
                "No encontramos esta orden en el mes seleccionado. Ampliá el rango en el Buscar arriba o intentá recargando."
              }
            />
          ) : row ? (
            <Space vertical size={10} style={{ width: "100%" }}>
              <Descriptions
                column={1}
                size="small"
                bordered
                className={styles.compactDescriptions}
              >
                <Descriptions.Item label="No. de orden">
                  <Typography.Text copyable ellipsis className={styles.breakAll}>
                    {row.orderNo}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag color={orderStatusTagColor(row.statusCode)}>
                    {row.statusLabel}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de creación">
                  {row.createdAtFormatted}
                </Descriptions.Item>
                <Descriptions.Item label="Modalidad">
                  {row.isCOD ? "COD (contra entrega)" : "Estándar"}
                </Descriptions.Item>
              </Descriptions>

              <Typography.Title level={5} className={styles.sectionHeading}>
                Destinatario
              </Typography.Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Nombre">
                  {[row.firstName, row.lastName].filter(Boolean).join(" ") || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {row.customerPhone}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                  <span className={styles.breakWord}>{row.customerAddress}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Departamento">
                  {row.department}
                </Descriptions.Item>
                <Descriptions.Item label="Municipio">
                  {row.municipality}
                </Descriptions.Item>
              </Descriptions>

              <Typography.Title level={5} className={styles.sectionHeading}>
                Montos / liquidación
              </Typography.Title>
              <Descriptions column={1} size="small" bordered>
                {row.isCOD ? (
                  <>
                    <Descriptions.Item label="COD esperado">
                      <div className={styles.amountCell}>
                        <span>{formatUsd(row.expectedAmount)}</span>
                        {row.expectedAmount <= 0 ? (
                          <Typography.Paragraph
                            type="secondary"
                            className={styles.codHint}
                          >
                            Alta sin monto esperado ($0): el cobrado puede ser distinto;
                            tiene sentido con COD real.
                          </Typography.Paragraph>
                        ) : null}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Cobrado (recolectado)">
                      {formatUsd(row.collectedAmount)}
                    </Descriptions.Item>
                  </>
                ) : (
                  <Descriptions.Item label="Cobro al destinatario">—</Descriptions.Item>
                )}
                <Descriptions.Item label="Costo de envío">
                  {formatUsd(row.shippingCost)}
                </Descriptions.Item>
                <Descriptions.Item label="Comisión COD">
                  {formatUsd(row.commission)}
                </Descriptions.Item>
                <Descriptions.Item label="Neto liquidación al comercio">
                  <>
                    <Typography.Text
                      strong
                      className={
                        row.liquidationNetSigned > 0
                          ? styles.liqPos
                          : row.liquidationNetSigned < 0
                            ? styles.liqNeg
                            : undefined
                      }
                    >
                      {formatUsd(row.liquidationNetSigned)}
                    </Typography.Text>
                    <Typography.Paragraph type="secondary" className={styles.liqExplain}>
                      {row.isCOD
                        ? "Tras recolectado, menos costo de envío y comisión COD."
                        : "Envío estándar: la API puede enviar el costo solo como magnitud positiva; aquí se muestra con signo negativo como deducción al comercio."}{" "}
                      Positivo: a tu favor · negativo: cargo o deducción.
                    </Typography.Paragraph>
                  </>
                </Descriptions.Item>
              </Descriptions>

              {row.notesDetailDisplay ? (
                <>
                  <Typography.Title level={5} className={styles.sectionHeading}>
                    Notas internas
                  </Typography.Title>
                  <Typography.Paragraph className={styles.notesBlock}>
                    {row.notesDetailDisplay}
                  </Typography.Paragraph>
                </>
              ) : null}

              <Typography.Title level={5} className={styles.sectionHeading}>
                Paquetes ({row.packages})
              </Typography.Title>
              {row.packageLines.length === 0 ? (
                <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                  Sin líneas de paquete registradas.
                </Typography.Paragraph>
              ) : (
                <ul className={styles.packageList}>
                  {row.packageLines.map((p, index) => (
                    <li
                      key={`${index}-${p.description.slice(0, 20)}`}
                      className={styles.packageListItem}
                    >
                      <div className={styles.packageLineTitle}>{p.description}</div>
                      <Typography.Text type="secondary" className={styles.meta}>
                        Cantidad {p.quantity} · {packageDimsDesc(p)}
                      </Typography.Text>
                    </li>
                  ))}
                </ul>
              )}

              {!patchFrozen ? (
                <>
                  <Typography.Title level={5} className={styles.sectionHeading}>
                    Datos y paquetes
                  </Typography.Title>
                  <div className={styles.editRow}>
                    <Tooltip
                      title="Mismo formulario que al crear: dirección, ubicación, teléfonos y lista de paquetes."
                      placement="bottom"
                    >
                      <Button
                        type="default"
                        block
                        size="middle"
                        icon={<EditOutlined aria-hidden />}
                        className={styles.appleEditBtn}
                        aria-label="Editar orden en formulario completo"
                        onClick={() => {
                          router.push(crearOrdenEditHref(row.orderNo));
                        }}
                      >
                        Editar
                      </Button>
                    </Tooltip>
                  </div>
                  <Typography.Paragraph
                    type="secondary"
                    className={`${styles.frozenPatchHint} mt-1`}
                  >
                    Si necesitás corregir algo que no está arriba en el detalle.
                  </Typography.Paragraph>
                </>
              ) : null}

              <div className={styles.updateSection}>
                <Typography.Title level={5} className={styles.sectionHeading}>
                  Actualización
                </Typography.Title>
                {patchFrozen ? (
                  <Typography.Paragraph
                    type="secondary"
                    className={styles.frozenPatchHint}
                  >
                    Orden {row.statusLabel.toLowerCase()}: no aplican cambios aquí.
                  </Typography.Paragraph>
                ) : (
                  <>
                    {row.statusCode === "IN_TRANSIT" ? (
                      <Typography.Paragraph
                        type="secondary"
                        className={styles.frozenPatchHint}
                      >
                        Desde en tránsito solo podés pasar a entregada o cancelada (no a
                        pendiente).
                      </Typography.Paragraph>
                    ) : null}
                    <Descriptions
                      column={1}
                      size="small"
                      bordered
                      className={styles.updateDescriptions}
                    >
                      <Descriptions.Item label="Cambiar estado">
                        <Select<OrderStatus>
                          size="middle"
                          className={styles.detailControlWide}
                          value={draftStatus}
                          onChange={setDraftStatus}
                          aria-label="Nuevo estado de la orden"
                          options={statusPatchOptions.map((value) => ({
                            value,
                            label: orderStatusLabel(value),
                          }))}
                        />
                      </Descriptions.Item>
                      {row.isCOD ? (
                        <Descriptions.Item label="Monto recolectado">
                          <InputNumber
                            size="middle"
                            className={`${styles.detailControlWide} ${styles.detailMoneyInput}`}
                            min={0}
                            max={1000000000}
                            step={0.01}
                            precision={2}
                            value={draftCollected}
                            onChange={(v) =>
                              setDraftCollected(
                                typeof v === "number" && !Number.isNaN(v) ? v : 0,
                              )
                            }
                            prefix="$"
                            aria-label="Monto recolectado al destinatario"
                          />
                        </Descriptions.Item>
                      ) : null}
                    </Descriptions>
                    <Tooltip
                      title={
                        !dirty
                          ? "Sin cambios respecto a lo que ya está guardado"
                          : undefined
                      }
                    >
                      <span className={styles.saveBtnTooltipWrap}>
                        <Button
                          type="primary"
                          size="middle"
                          block
                          className={styles.detailSaveBtn}
                          loading={patching}
                          disabled={!dirty}
                          onClick={() => void handlePatch()}
                        >
                          Guardar cambios
                        </Button>
                      </span>
                    </Tooltip>
                    <Typography.Paragraph
                      type="secondary"
                      className={styles.updateHint}
                    >
                      Recalcula envío y liquidación al guardar.
                    </Typography.Paragraph>
                  </>
                )}
              </div>
            </Space>
          ) : null}
        </div>
      </Spin>
    </Drawer>
  );
}
