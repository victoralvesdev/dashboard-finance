"use client";

import { Suspense } from "react";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { PaymentStatusBar, PaymentStatusBarLoading } from "@/components/payment-status-bar";

const DataChartsContent = () => {
  const { data, isLoading } = useGetSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8">
        <div className="col-span-1">
          <PaymentStatusBarLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="col-span-1">
        <PaymentStatusBar
          householdData={data?.household}
          individualData={data?.individual}
        />
      </div>
    </div>
  );
};

export const DataCharts = () => {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-8">
          <div className="col-span-1">
            <PaymentStatusBarLoading />
          </div>
        </div>
      }
    >
      <DataChartsContent />
    </Suspense>
  );
};
