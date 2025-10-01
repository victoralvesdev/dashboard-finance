import { Separator } from "@/components/ui/separator";

export type PaymentStatusTooltipProps = {
  active?: boolean;
  payload?: any;
};

export const PaymentStatusTooltip = ({ active, payload }: PaymentStatusTooltipProps) => {
  if (!active) return null;

  const name = payload[0].payload.name;
  const value = payload[0].value;

  const getColor = (name: string) => {
    switch (name) {
      case "Pagas":
        return "bg-emerald-500";
      case "Pendentes":
        return "bg-yellow-500";
      case "Urgentes":
        return "bg-rose-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="rounded-sm bg-white shadow-sm border overflow-hidden">
      <div className="text-sm p-2 px-3 bg-muted text-muted-foreground">
        {name}
      </div>
      <Separator />

      <div className="p-2 px-3 space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className={`size-1.5 ${getColor(name)} rounded-full`} />
            <p className="text-sm text-muted-foreground">Contas</p>
          </div>
          <p className="text-sm text-right font-medium">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};
