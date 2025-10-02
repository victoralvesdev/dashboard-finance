"use client";

import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { getBillsColumns, BillResponseType } from "./bills-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBills } from "@/features/bills/api/use-get-bills";
import { TransactionDetailModal } from "../transactions/transaction-detail-modal";

const AccountsContent = () => {
  const { data, isLoading } = useGetBills();
  const [selectedBill, setSelectedBill] = useState<BillResponseType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (bill: BillResponseType) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBill(null), 300);
  };

  const columns = getBillsColumns({ onOpenDetail: handleOpenDetail });

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
              Minhas Contas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {data?.length || 0} conta(s) encontrada(s)
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
        transaction={selectedBill}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

const AccountsPage = () => {
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
      <AccountsContent />
    </Suspense>
  );
};

export default AccountsPage;
