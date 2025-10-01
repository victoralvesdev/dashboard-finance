import { z } from "zod";
import { Hono } from "hono";
import { parse } from "date-fns";
import { zValidator } from "@hono/zod-validator";
import { getCookie } from "hono/cookie";
import { supabase } from "@/lib/supabase";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        to: z.string().optional(),
        from: z.string().optional(),
      })
    ),
    async (c) => {
      console.log("\n\n🚀 ============ BILLS API CALLED ============");
      const { to, from } = c.req.valid("query");
      console.log("📝 Query params:", { to, from });

      // Get user from cookie
      const userCookie = getCookie(c, "user");
      console.log("🍪 Raw cookie:", userCookie);

      if (!userCookie) {
        console.log("❌ No cookie found");
        return c.json({ error: "Unauthorized - no cookie" }, 401);
      }

      let user;
      try {
        user = JSON.parse(userCookie);
        console.log("✅ Parsed user:", user);
      } catch (error) {
        console.log("❌ Error parsing cookie:", error);
        return c.json({ error: "Invalid cookie" }, 401);
      }

      if (!user?.id) {
        console.log("❌ No user ID in cookie");
        return c.json({ error: "Unauthorized - no user ID" }, 401);
      }

      console.log("👤 Fetching household for user:", user.id);

      // Get user's household_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("household_id")
        .eq("id", user.id)
        .single();

      console.log("📊 User data from DB:", userData);
      console.log("❌ User error:", userError);

      if (userError || !userData) {
        return c.json({ error: "User not found", details: userError }, 404);
      }

      const defaultTo = new Date();
      defaultTo.setFullYear(defaultTo.getFullYear() + 1);
      const defaultFrom = new Date();
      defaultFrom.setFullYear(defaultFrom.getFullYear() - 1);

      const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      console.log("📅 Date range:", startDate, "to", endDate);
      console.log("🏠 Household ID:", userData.household_id);

      // Fetch all bills for household (both shared and individual for user)
      const { data: householdBills, error: householdError } = await supabase
        .from("bills")
        .select(`
          id,
          description,
          amount,
          due_date,
          is_paid,
          paid_at,
          is_shared,
          proof_image_url,
          paid_by,
          created_by
        `)
        .eq("household_id", userData.household_id)
        .eq("is_shared", true)
        .gte("due_date", startDate.toISOString().split("T")[0])
        .lte("due_date", endDate.toISOString().split("T")[0])
        .order("due_date", { ascending: true });

      const { data: individualBills, error: individualError } = await supabase
        .from("bills")
        .select(`
          id,
          description,
          amount,
          due_date,
          is_paid,
          paid_at,
          is_shared,
          proof_image_url,
          paid_by,
          created_by
        `)
        .eq("household_id", userData.household_id)
        .eq("is_shared", false)
        .eq("created_by", user.id)
        .gte("due_date", startDate.toISOString().split("T")[0])
        .lte("due_date", endDate.toISOString().split("T")[0])
        .order("due_date", { ascending: true });

      console.log("🏠 Household bills found:", householdBills?.length, householdError);
      console.log("👤 Individual bills found:", individualBills?.length, individualError);

      if (householdError || individualError) {
        return c.json(
          { error: "Failed to fetch bills", details: householdError || individualError },
          500
        );
      }

      // Combine and sort all bills by due_date
      const allBills = [...(householdBills || []), ...(individualBills || [])].sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );

      const responseData = {
        data: allBills,
      };

      console.log("📤 Returning data:", allBills.length, "bills");
      console.log("============ END BILLS API ============\n\n");

      return c.json(responseData);
    }
  );

export default app;
