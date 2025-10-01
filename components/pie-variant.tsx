import { formatPercentage } from "@/lib/utils";

import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import { CategoryTooltip } from "@/components/category-tooltip";

const COLOR_MAP: Record<string, string> = {
  "Pagas": "#10b981",
  "Pendentes": "#eab308",
  "Urgentes": "#ef4444",
};

export type PieVariantProps = {
  data: {
    name: string;
    value: number;
  }[];
};

export const PieVariant = ({ data }: PieVariantProps) => {
  const getColor = (name: string) => {
    return COLOR_MAP[name] || "#94a3b8";
  };

  return (
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
        <Tooltip content={<CategoryTooltip />} />
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
  );
};
