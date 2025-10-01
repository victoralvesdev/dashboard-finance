"use client";

import { CheckCircle2, Clock, AlertTriangle, FileSearch, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PaymentStatusBarProps = {
  householdData?: {
    paidCount: number;
    normalUnpaidCount: number;
    urgentCount: number;
  };
  individualData?: {
    paidCount: number;
    normalUnpaidCount: number;
    urgentCount: number;
  };
};

export const PaymentStatusBar = ({
  householdData = { paidCount: 0, normalUnpaidCount: 0, urgentCount: 0 },
  individualData = { paidCount: 0, normalUnpaidCount: 0, urgentCount: 0 },
}: PaymentStatusBarProps) => {
  const data = [
    {
      name: "Contas da Casa",
      Pagas: householdData.paidCount,
      Pendentes: householdData.normalUnpaidCount,
      Urgentes: householdData.urgentCount,
    },
    {
      name: "Despesas Individuais",
      Pagas: individualData.paidCount,
      Pendentes: individualData.normalUnpaidCount,
      Urgentes: individualData.urgentCount,
    },
  ];

  const hasData =
    householdData.paidCount + householdData.normalUnpaidCount + householdData.urgentCount +
    individualData.paidCount + individualData.normalUnpaidCount + individualData.urgentCount > 0;

  return (
    <Card className="border-none drop-shadow-md">
      <CardHeader className="flex space-y-2">
        <CardTitle className="text-xl">Status de Pagamento</CardTitle>
        <div className="flex items-center gap-x-4 text-sm flex-wrap">
          <div className="flex items-center gap-x-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-muted-foreground">Pagas</span>
          </div>
          <div className="flex items-center gap-x-2">
            <Clock className="size-4 text-yellow-500" />
            <span className="text-muted-foreground">Pendentes</span>
          </div>
          <div className="flex items-center gap-x-2">
            <AlertTriangle className="size-4 text-rose-500" />
            <span className="text-muted-foreground">Urgentes (3 dias ou menos)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              Não há contas para este período
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;

                  return (
                    <div className="rounded-lg border bg-white p-3 shadow-sm">
                      <div className="font-medium mb-2">{payload[0].payload.name}</div>
                      <div className="space-y-1">
                        {payload.map((entry: any) => (
                          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="size-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {entry.dataKey}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="Pagas" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Pendentes" fill="#eab308" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Urgentes" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export const PaymentStatusBarLoading = () => {
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
