import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
export default function AuthSegmentLoading() {
  return (
    <CenteredBusy
      label={LOADING_MESSAGES.authSegment}
      layout="route-fill"
      surface="auth"
    />
  );
}
