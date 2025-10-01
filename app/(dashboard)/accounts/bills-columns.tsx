"use client";

import { InferResponseType } from "hono";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export type BillResponseType = InferResponseType<
  typeof client.api.bills.$get,
  200
>["data"][0];

type ColumnsProps = {
  onOpenDetail: (bill: BillResponseType) => void;
};

const getBillStatus = (bill: BillResponseType) => {
  if (bill.is_paid) return "paid";

  const today = new Date();
  const dueDate = new Date(bill.due_date);

  if (dueDate < today) return "overdue";
  return "pending";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
          Pago
        </Badge>
      );
    case "overdue":
      return (
        <Badge variant="destructive">
          Em Atraso
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Pendente
        </Badge>
      );
    default:
      return null;
  }
};

export const getBillsColumns = ({ onOpenDetail }: ColumnsProps): ColumnDef<BillResponseType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.description}</span>;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <span className="font-semibold">
          {formatCurrency(amount)}
        </span>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vencimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string;
      return (
        <span>{format(new Date(date), "dd/MM/yyyy", { locale: ptBR })}</span>
      );
    },
  },
  {
    accessorKey: "is_shared",
    header: "Tipo",
    cell: ({ row }) => {
      const isShared = row.getValue("is_shared") as boolean;
      return (
        <Badge variant={isShared ? "default" : "outline"}>
          {isShared ? "Casa" : "Individual"}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = getBillStatus(row.original);
      return getStatusBadge(status);
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenDetail(row.original)}
        >
          <Eye className="size-4 mr-2" />
          Detalhes
        </Button>
      );
    },
  },
];
