import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useGetTransactions = () => {
  const params = useSearchParams();

  const from = useMemo(() => params.get("from") || "", [params]);
  const to = useMemo(() => params.get("to") || "", [params]);

  const query = useQuery({
    queryKey: ["transactions", { from, to }],
    queryFn: async () => {
      console.log("🔄 Fetching transactions from API...", { from, to });

      const response = await client.api.transactions.$get({
        query: { from, to },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();
      console.log("✅ Transactions data received:", data);

      return data;
    },
  });

  return query;
};
