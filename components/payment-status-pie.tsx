"use client";

import { CheckCircle2, Clock, AlertTriangle, FileSearch, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { formatPercentage } from "@/lib/utils";
import { PaymentStatusTooltip } from "@/components/payment-status-tooltip";

export type PaymentStatusPieProps = {
  paidCount?: number;
  normalUnpaidCount?: number;
  urgentCount?: number;
};

export const PaymentStatusPie = ({
  paidCount = 0,
  normalUnpaidCount = 0,
  urgentCount = 0
}: PaymentStatusPieProps) => {
  const data = [
    {
      name: "Pagas",
      value: paidCount,
    },
    {
      name: "Pendentes",
      value: normalUnpaidCount,
    },
    {
      name: "Urgentes",
      value: urgentCount,
    },
  ].filter(item => item.value > 0);

  const total = paidCount + normalUnpaidCount + urgentCount;

  const COLOR_MAP: Record<string, string> = {
    "Pagas": "#10b981",
    "Pendentes": "#eab308",
    "Urgentes": "#ef4444",
  };

  const getColor = (name: string) => {
    return COLOR_MAP[name] || "#94a3b8";
  };

  return (
    <Card className="border-none drop-shadow-md">
      <CardHeader className="flex space-y-2">
        <CardTitle className="text-xl">Status de Pagamento</CardTitle>
        <div className="flex items-center gap-x-4 text-sm flex-wrap">
          <div className="flex items-center gap-x-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-muted-foreground">{paidCount} Pagas</span>
          </div>
          <div className="flex items-center gap-x-2">
            <Clock className="size-4 text-yellow-500" />
            <span className="text-muted-foreground">{normalUnpaidCount} Pendentes</span>
          </div>
          <div className="flex items-center gap-x-2">
            <AlertTriangle className="size-4 text-rose-500" />
            <span className="text-muted-foreground">{urgentCount} Urgentes</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              Não há contas para este período
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="right"
                iconType="circle"
                content={({ payload }) => {
                  return (
                    <ul className="flex flex-col space-y-2">
                      {payload?.map((entry: any, index) => (
                        <li
                          key={`item-${index}`}
                          className="flex items-center space-x-2"
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <div className="space-x-1">
                            <span className="text-sm text-muted-foreground">
                              {entry.value}
                            </span>
                            <span>
                              {formatPercentage(entry.payload.percent * 100)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />
              <Tooltip content={<PaymentStatusTooltip />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={70}
                paddingAngle={2}
                fill="#8884d8"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export const PaymentStatusPieLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full flex items-center justify-center">
          <Loader2 className="size-6 text-slate-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
};
