import type { Dayjs } from "dayjs";
import type { OrderListQuery } from "@/types/boxful-api";
export function buildOrderListQuery(
  range: [Dayjs | null, Dayjs | null],
): OrderListQuery | undefined {
  const [a, b] = range;
  if (!a?.isValid() || !b?.isValid()) return undefined;
  const start = a.startOf("month");
  const end = b.endOf("month");
  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
}
