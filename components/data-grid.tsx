"use client";

import { DataCard, DataCardLoading } from "./data-card";
import { HomeIcon, TrendingDownIcon } from "lucide-react";

import { formatDateRange } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useGetSummary } from "@/features/summary/api/use-get-summary";

export const DataGrid = () => {
  const params = useSearchParams();
  const { data, isLoading } = useGetSummary();

  const to = params.get("to") || undefined;
  const from = params.get("from") || undefined;

  const dateRangeLabel = formatDateRange({ from, to });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-2 mb-8">
      <DataCard
        title="Contas da Casa"
        icon={HomeIcon}
        variant="default"
        dateRange={dateRangeLabel}
        value={data?.remainingAmount}
      />
      <DataCard
        variant="danger"
        title="Despesas Individuais"
        icon={TrendingDownIcon}
        dateRange={dateRangeLabel}
        value={data?.expensesAmount}
      />
    </div>
  );
};
