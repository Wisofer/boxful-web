import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
export default function DashboardSegmentLoading() {
  return <CenteredBusy label={LOADING_MESSAGES.dashboardSegment} layout="route-fill" />;
}
