"use client";
import { CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/layouts/dashboard-page-header";
import { PageCard } from "@/components/ui";
import { HISTORIAL_ORDER_DETAIL_QUERY, historialDetailHref } from "@/constants/routes";
import { useHistorialOrders } from "@/hooks/use-historial-orders";
import { deleteOrder, exportOrdersCsvBlob, fetchOrderById } from "@/services/orders";
import type { HistorialEnvioRow } from "@/types/historial-table";
import { getApiErrorMessage } from "@/utils/api-error";
import { buildOrderListQuery } from "@/utils/build-order-list-query";
import { downloadBlob } from "@/utils/download-blob";
import { mapApiOrderToHistorialRow } from "@/utils/map-api-order-to-historial-row";
import { orderIsDeletable } from "@/utils/order-delete-policy";
import { orderStatusTagColor } from "@/utils/order-status-label";
import { HistorialOrderDetailDrawer } from "./historial-order-detail-drawer";
import styles from "./historial-envios.module.css";
dayjs.locale("es");
const { RangePicker } = DatePicker;
type MonthRange = [Dayjs | null, Dayjs | null];
function buildTableColumns(): ColumnsType<HistorialEnvioRow> {
  return [
    {
      title: "Fecha",
      key: "createdAtFormatted",
      responsive: ["lg"],
      ellipsis: true,
      width: 150,
      render: (_: unknown, row: HistorialEnvioRow) => (
        <Typography.Text
          ellipsis={{ tooltip: row.createdAtFormatted }}
          className={styles.dataCell}
        >
          {row.createdAtFormatted}
        </Typography.Text>
      ),
    },
    {
      title: "No. de orden",
      dataIndex: "orderNo",
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text ellipsis={{ tooltip: v }} className={styles.orderCell}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: "Estado",
      key: "status",
      align: "center" as const,
      width: 132,
      render: (_: unknown, row: HistorialEnvioRow) => (
        <div className={styles.statusTagCell}>
          <Tag color={orderStatusTagColor(row.statusCode)}>{row.statusLabel}</Tag>
        </div>
      ),
    },
    {
      title: "Nombre",
      dataIndex: "firstName",
      responsive: ["md"],
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text ellipsis={{ tooltip: v }} className={styles.dataCell}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: "Apellidos",
      dataIndex: "lastName",
      responsive: ["md"],
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text ellipsis={{ tooltip: v }} className={styles.dataCell}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: "Departamento",
      dataIndex: "department",
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text ellipsis={{ tooltip: v }} className={styles.dataCell}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: "Municipio",
      dataIndex: "municipality",
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text ellipsis={{ tooltip: v }} className={styles.dataCell}>
          {v}
        </Typography.Text>
      ),
    },
    {
      title: "Paquetes en orden",
      dataIndex: "packages",
      align: "center" as const,
      ellipsis: false,
      render: (n: number) => <span className={styles.packageBadge}>{n}</span>,
    },
  ];
}
const tableColumns = buildTableColumns();
type HistorialMobileCardsProps = {
  rows: HistorialEnvioRow[];
  selectedKeys: React.Key[];
  onToggleKey: (key: React.Key, checked: boolean) => void;
  onOpenDetail: (orderId: string) => void;
};
function HistorialMobileCards({
  rows,
  selectedKeys,
  onToggleKey,
  onOpenDetail,
}: HistorialMobileCardsProps) {
  return (
    <ul className={styles.mobileList} aria-label="Listado de envíos">
      {rows.map((row) => {
        const checked = selectedKeys.includes(row.key);
        const fullName =
          `${row.firstName} ${row.lastName}`.replace(/\s+/g, " ").trim() || "—";
        return (
          <li key={row.key} className={styles.mobileCard}>
            <div className={styles.mobileCardTop}>
              <Checkbox
                checked={checked}
                disabled={!orderIsDeletable(row.statusCode)}
                title={
                  orderIsDeletable(row.statusCode)
                    ? undefined
                    : "Solo pendientes o canceladas se pueden seleccionar para eliminar."
                }
                onChange={(e) => {
                  onToggleKey(row.key, e.target.checked);
                }}
                aria-label={`Seleccionar orden ${row.orderNo}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <Typography.Text
                ellipsis
                className={styles.mobileOrderNo}
                title={row.orderNo}
              >
                {row.orderNo}
              </Typography.Text>
              <Tag color={orderStatusTagColor(row.statusCode)}>{row.statusLabel}</Tag>
              <span className={styles.packageBadge}>{row.packages}</span>
            </div>
            <dl className={styles.mobileCardDl}>
              <div className={styles.mobileCardRow}>
                <dt>Fecha</dt>
                <dd>{row.createdAtFormatted}</dd>
              </div>
              <div className={styles.mobileCardRow}>
                <dt>Nombre</dt>
                <dd>{fullName}</dd>
              </div>
              <div className={styles.mobileCardRow}>
                <dt>Departamento</dt>
                <dd>{row.department}</dd>
              </div>
              <div className={styles.mobileCardRow}>
                <dt>Municipio</dt>
                <dd>{row.municipality}</dd>
              </div>
            </dl>
            <Button
              type="default"
              block
              className={styles.mobileDetailBtn}
              onClick={() => {
                onOpenDetail(row.key);
              }}
            >
              Ver detalle
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
function isInteractiveTableClickTarget(el: HTMLElement | null): boolean {
  return Boolean(
    el?.closest?.(".ant-checkbox-wrapper,.ant-radio-wrapper,.ant-checkbox"),
  );
}
export function HistorialEnvios() {
  const { message, modal } = App.useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [range, setRange] = useState<MonthRange>([dayjs().month(0), dayjs().month(6)]);
  const { rows, loading, refresh } = useHistorialOrders(range);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [detailExtraRow, setDetailExtraRow] = useState<HistorialEnvioRow | null>(null);
  const [detailExtraLoading, setDetailExtraLoading] = useState(false);
  const [detailExtraError, setDetailExtraError] = useState(false);
  const [detailPatchedRow, setDetailPatchedRow] = useState<HistorialEnvioRow | null>(
    null,
  );
  const ordenParam = searchParams.get(HISTORIAL_ORDER_DETAIL_QUERY)?.trim();
  useEffect(() => {
    const sid = window.setTimeout(() => {
      setDetailPatchedRow(null);
    }, 0);
    return () => window.clearTimeout(sid);
  }, [ordenParam]);
  useEffect(() => {
    let alive = true;
    const sid = window.setTimeout(() => {
      if (!alive) return;
      if (!ordenParam?.length) {
        setDetailExtraRow(null);
        setDetailExtraLoading(false);
        setDetailExtraError(false);
        return;
      }
      if (loading) {
        return;
      }
      if (rows.some((r) => r.key === ordenParam)) {
        setDetailExtraRow(null);
        setDetailExtraLoading(false);
        setDetailExtraError(false);
        return;
      }
      setDetailExtraLoading(true);
      setDetailExtraError(false);
      void fetchOrderById(ordenParam)
        .then((o) => {
          if (!alive) return;
          setDetailExtraRow(mapApiOrderToHistorialRow(o));
        })
        .catch(() => {
          if (!alive) return;
          setDetailExtraRow(null);
          setDetailExtraError(true);
        })
        .finally(() => {
          setDetailExtraLoading(false);
        });
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(sid);
    };
  }, [ordenParam, loading, rows]);
  const openDetail = useCallback(
    (orderId: string) => {
      router.push(historialDetailHref(orderId));
    },
    [router],
  );
  const closeDetail = useCallback(() => {
    setDetailPatchedRow(null);
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete(HISTORIAL_ORDER_DETAIL_QUERY);
    const q = sp.toString();
    const base = pathname || "/app";
    router.replace(q ? `${base}?${q}` : base);
  }, [pathname, router, searchParams]);
  const drawerRowBase = ordenParam?.length
    ? (rows.find((r) => r.key === ordenParam) ?? detailExtraRow ?? null)
    : null;
  const drawerRow =
    detailPatchedRow && ordenParam?.length && detailPatchedRow.key === ordenParam
      ? detailPatchedRow
      : drawerRowBase;
  const drawerOpen = Boolean(ordenParam?.length);
  const drawerLoadingSingle =
    drawerOpen &&
    drawerRow === null &&
    !detailExtraError &&
    (detailExtraLoading || loading);
  const handleToggleMobileKey = useCallback(
    (key: React.Key, checked: boolean): void => {
      setSelectedKeys((prev) => {
        if (checked) {
          return prev.includes(key) ? prev : [...prev, key];
        }
        return prev.filter((k) => k !== key);
      });
    },
    [],
  );
  const handleDownloadCsv = async (): Promise<void> => {
    try {
      const query = buildOrderListQuery(range);
      const blob = await exportOrdersCsvBlob(query);
      downloadBlob(blob, "orders.csv");
      message.success("Descarga iniciada");
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };
  const selectedRows = rows.filter((r) => selectedKeys.includes(r.key));
  const selectedAllDeletable =
    selectedRows.length > 0 &&
    selectedRows.every((r) => orderIsDeletable(r.statusCode));
  const handleDeleteSelected = (): void => {
    if (!selectedKeys.length || !selectedAllDeletable || deleteBusy) return;
    const ids = [...selectedKeys].map(String);
    modal.confirm({
      title: "Eliminar órdenes",
      content:
        ids.length === 1
          ? "¿Eliminar esta orden? No podrás recuperarla después."
          : `¿Eliminar ${ids.length} órdenes? No podrás recuperarlas después.`,
      okText: "Eliminar",
      cancelText: "Cancelar",
      okType: "danger",
      onOk: async () => {
        setDeleteBusy(true);
        try {
          for (const id of ids) {
            await deleteOrder(id);
          }
          message.success(
            ids.length === 1 ? "Orden eliminada." : `${ids.length} órdenes eliminadas.`,
          );
          if (ordenParam && ids.includes(ordenParam)) {
            closeDetail();
          }
          setSelectedKeys([]);
          await refresh();
        } catch (error) {
          message.error(getApiErrorMessage(error));
        } finally {
          setDeleteBusy(false);
        }
      },
    });
  };
  return (
    <>
      <DashboardPageHeader title="Mis envíos" />

      <PageCard className={styles.historialSurface}>
        <div className={styles.toolbar}>
          <RangePicker
            picker="month"
            format="MMMM"
            size="large"
            value={range}
            allowClear={false}
            suffixIcon={<CalendarOutlined className="text-[rgba(0,0,0,0.45)]" />}
            onChange={(vals) => setRange(vals as MonthRange)}
            placeholder={["Enero", "Julio"]}
            className={`${styles.monthRangePicker} [&_.ant-picker-input>input]:capitalize`}
          />
          <div className={styles.toolbarActions}>
            <Space size="middle" wrap>
              <Button
                type="primary"
                size="large"
                className="w-full sm:w-auto sm:min-w-28"
                onClick={() => void refresh()}
              >
                Buscar
              </Button>
              <Button
                size="large"
                className="w-full sm:w-auto sm:min-w-44"
                onClick={() => void handleDownloadCsv()}
              >
                Descargar órdenes
              </Button>
              {selectedKeys.length > 0 ? (
                <Tooltip
                  title={
                    selectedAllDeletable
                      ? `${selectedKeys.length} seleccionada(s). Solo pendientes o canceladas.`
                      : "Quitá de la selección las que no sean pendientes o canceladas. Las entregadas o en tránsito no se pueden eliminar."
                  }
                >
                  <Button
                    danger
                    size="large"
                    type="primary"
                    icon={<DeleteOutlined aria-hidden />}
                    className="w-full sm:w-auto"
                    loading={deleteBusy}
                    disabled={!selectedAllDeletable}
                    onClick={handleDeleteSelected}
                  >
                    Eliminar ({selectedKeys.length})
                  </Button>
                </Tooltip>
              ) : null}
            </Space>
          </div>
        </div>

        <div className={styles.mobilePane}>
          {loading ? (
            <div className={styles.mobileSkeleton} aria-busy="true" aria-live="polite">
              {[1, 2, 3, 4].map((slot) => (
                <div key={slot} className={styles.mobileSkeletonCard}>
                  <Skeleton active title paragraph={{ rows: 4 }} />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Empty
              description="Sin órdenes en este rango"
              className={styles.mobileEmpty}
            />
          ) : (
            <HistorialMobileCards
              rows={rows}
              selectedKeys={selectedKeys}
              onToggleKey={handleToggleMobileKey}
              onOpenDetail={openDetail}
            />
          )}
        </div>

        <div className={styles.desktopPane}>
          <div className={`${styles.tableWrap} ${styles.tableScrollKill}`}>
            <Table<HistorialEnvioRow>
              className={`w-full max-w-full min-w-0 ${styles.table}`}
              rowKey="key"
              size="middle"
              bordered={false}
              pagination={false}
              loading={loading}
              tableLayout="auto"
              styles={{
                root: { overflow: "visible" },
                section: { overflow: "visible" },
                content: {
                  overflow: "visible",
                  overflowX: "hidden",
                  overflowY: "visible",
                  maxHeight: "none",
                },
                body: {
                  wrapper: {
                    overflow: "visible",
                    overflowY: "visible",
                    overflowX: "hidden",
                    maxHeight: "none",
                  },
                },
              }}
              columns={tableColumns}
              dataSource={rows}
              rowSelection={{
                selectedRowKeys: selectedKeys,
                onChange: (keys) => {
                  setSelectedKeys(keys);
                },
                columnWidth: 48,
                getCheckboxProps: (record) => ({
                  disabled: !orderIsDeletable(record.statusCode),
                  title: orderIsDeletable(record.statusCode)
                    ? undefined
                    : "Las órdenes entregadas o en tránsito no se pueden eliminar.",
                }),
              }}
              onRow={(record) => ({
                ["data-row-click"]: "true",
                onClick: (e) => {
                  if (isInteractiveTableClickTarget(e.target as HTMLElement)) {
                    return;
                  }
                  openDetail(record.key);
                },
              })}
            />
          </div>
        </div>
      </PageCard>

      <HistorialOrderDetailDrawer
        open={drawerOpen}
        onClose={closeDetail}
        row={drawerRow}
        onPatched={async (o) => {
          const mapped = mapApiOrderToHistorialRow(o);
          setDetailPatchedRow(mapped);
          setDetailExtraRow((prev) => (prev?.key === mapped.key ? mapped : prev));
          try {
            await refresh();
          } finally {
            setDetailPatchedRow(null);
          }
        }}
        loadingSingle={drawerLoadingSingle}
        singleError={
          drawerOpen && drawerRow === null && !drawerLoadingSingle && detailExtraError
        }
      />
    </>
  );
}
