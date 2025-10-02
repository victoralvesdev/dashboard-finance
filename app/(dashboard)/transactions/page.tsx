"use client";

import { Suspense, useState } from "react";
import { getColumns, ResponseType } from "./columns";
import { TransactionDetailModal } from "./transaction-detail-modal";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";

const TransactionsContent = () => {
  const { data, isLoading } = useGetTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<ResponseType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (transaction: ResponseType) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTransaction(null), 300);
  };

  const columns = getColumns({ onOpenDetail: handleOpenDetail });

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center">
              <Loader2 className="size-8 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-xl line-clamp-1">
              Histórico de Pagamentos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Contas pagas com comprovantes
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              filterKey="description"
              data={data || []}
              columns={columns}
              disabled={isLoading}
              onDelete={() => {}}
            />
          </CardContent>
        </Card>
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

const TransactionsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
          <Card className="border-none drop-shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full flex items-center justify-center">
                <Loader2 className="size-8 text-slate-300 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
};

export default TransactionsPage;
