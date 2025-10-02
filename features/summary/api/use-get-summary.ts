import { client } from "@/lib/hono";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useGetSummary = () => {
  const params = useSearchParams();

  const from = useMemo(() => params.get("from") || "", [params]);
  const to = useMemo(() => params.get("to") || "", [params]);

  const query = useQuery({
    queryKey: ["summary", { from, to }],
    queryFn: async () => {
      console.log("🔄 Fetching summary from API...", { from, to });

      const response = await client.api.summary.$get({
        query: { from, to },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error("Failed to fetch summary");
      }

      const { data } = await response.json();
      console.log("✅ Summary data received:", data);

      return data;
    },
  });

  return query;
};
