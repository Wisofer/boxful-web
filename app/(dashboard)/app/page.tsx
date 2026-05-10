import { Suspense } from "react";
import { CenteredBusy } from "@/components/ui";
import { LOADING_MESSAGES } from "@/constants/loading-copy";
import { DashboardAppRouter } from "@/features/dashboard";
export default function AppHubPage() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <Suspense fallback={<CenteredBusy label={LOADING_MESSAGES.appHubSuspense} />}>
        <DashboardAppRouter />
      </Suspense>
    </div>
  );
}
