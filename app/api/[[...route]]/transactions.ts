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
      console.log("\n\n🚀 ============ TRANSACTIONS API CALLED ============");
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

      // Fetch paid bills (both household and individual)
      const { data: paidBills, error: billsError } = await supabase
        .from("bills")
        .select(`
          id,
          description,
          amount,
          due_date,
          paid_at,
          is_shared,
          proof_image_url,
          paid_by
        `)
        .eq("household_id", userData.household_id)
        .eq("is_paid", true)
        .gte("paid_at", startDate.toISOString())
        .lte("paid_at", endDate.toISOString())
        .order("paid_at", { ascending: false });

      console.log("💳 Paid bills found:", paidBills?.length, billsError);

      if (billsError) {
        return c.json({ error: "Failed to fetch transactions", details: billsError }, 500);
      }

      const responseData = {
        data: paidBills || [],
      };

      console.log("📤 Returning data:", JSON.stringify(responseData, null, 2));
      console.log("============ END TRANSACTIONS API ============\n\n");

      return c.json(responseData);
    }
  )
  .patch(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    zValidator(
      "json",
      z.object({
        description: z.string().optional(),
        amount: z.string().optional(),
        proof_image_url: z.string().nullable().optional(),
      })
    ),
    async (c) => {
      console.log("\n\n🚀 ============ UPDATE TRANSACTION API CALLED ============");
      const { id } = c.req.valid("param");
      const updates = c.req.valid("json");
      console.log("📝 Transaction ID:", id);
      console.log("📝 Updates:", updates);

      // Get user from cookie
      const userCookie = getCookie(c, "user");

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

      // Get user's household_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("household_id")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        return c.json({ error: "User not found", details: userError }, 404);
      }

      // Check if bill belongs to user's household
      const { data: bill, error: billError } = await supabase
        .from("bills")
        .select("household_id")
        .eq("id", id)
        .single();

      if (billError || !bill) {
        return c.json({ error: "Transaction not found" }, 404);
      }

      if (bill.household_id !== userData.household_id) {
        return c.json({ error: "Unauthorized - not your household" }, 403);
      }

      // Update the bill
      const { data: updatedBill, error: updateError } = await supabase
        .from("bills")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.log("❌ Update error:", updateError);
        return c.json({ error: "Failed to update transaction", details: updateError }, 500);
      }

      console.log("✅ Transaction updated:", updatedBill);
      console.log("============ END UPDATE TRANSACTION API ============\n\n");

      return c.json({ data: updatedBill });
    }
  );

export default app;
