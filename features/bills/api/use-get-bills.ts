import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetBills = () => {
  const params = useSearchParams();

  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const query = useQuery({
    queryKey: ["bills", { from, to }],
    queryFn: async () => {
      console.log("🔄 Fetching bills from API...", { from, to });

      const response = await client.api.bills.$get({
        query: { from, to },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error("Failed to fetch bills");
      }

      const { data } = await response.json();
      console.log("✅ Bills data received:", data);

      return data;
    },
  });

  return query;
};
