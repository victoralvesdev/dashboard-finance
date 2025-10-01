import { z } from "zod";
import { Hono } from "hono";
import { subDays, parse, differenceInDays, startOfMonth } from "date-fns";
import { zValidator } from "@hono/zod-validator";
import { getCookie } from "hono/cookie";
import { supabase } from "@/lib/supabase";
import { calculatePercentageChange } from "@/lib/utils";

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      to: z.string().optional(),
      from: z.string().optional(),
    })
  ),
  async (c) => {
    console.log("\n\n🚀 ============ BILLS SUMMARY API CALLED ============");
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
    defaultTo.setFullYear(defaultTo.getFullYear() + 1); // Busca até 1 ano no futuro para pegar contas futuras
    const defaultFrom = new Date();
    defaultFrom.setFullYear(defaultFrom.getFullYear() - 1); // Busca desde 1 ano atrás

    const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    console.log("📅 Date range:", startDate, "to", endDate);
    console.log("🏠 Household ID:", userData.household_id);

    // Fetch household bills (is_shared = true)
    const { data: householdBills, error: householdError } = await supabase
      .from("bills")
      .select("amount, is_paid, due_date")
      .eq("household_id", userData.household_id)
      .eq("is_shared", true)
      .gte("due_date", startDate.toISOString().split("T")[0])
      .lte("due_date", endDate.toISOString().split("T")[0]);

    console.log("🏠 Household bills:", householdBills?.length, "found", householdError);

    // Fetch individual bills (is_shared = false) - only for current user
    const { data: individualBills, error: individualError } = await supabase
      .from("bills")
      .select("amount, is_paid, due_date, paid_by")
      .eq("household_id", userData.household_id)
      .eq("is_shared", false)
      .eq("paid_by", user.id)
      .gte("due_date", startDate.toISOString().split("T")[0])
      .lte("due_date", endDate.toISOString().split("T")[0]);

    console.log("👤 Individual bills for user:", individualBills?.length, "found", individualError);

    // Last period data
    const { data: lastHouseholdBills } = await supabase
      .from("bills")
      .select("amount")
      .eq("household_id", userData.household_id)
      .eq("is_shared", true)
      .gte("due_date", lastPeriodStart.toISOString().split("T")[0])
      .lte("due_date", lastPeriodEnd.toISOString().split("T")[0]);

    const { data: lastIndividualBills } = await supabase
      .from("bills")
      .select("amount")
      .eq("household_id", userData.household_id)
      .eq("is_shared", false)
      .eq("paid_by", user.id)
      .gte("due_date", lastPeriodStart.toISOString().split("T")[0])
      .lte("due_date", lastPeriodEnd.toISOString().split("T")[0]);

    // Calculate totals - ONLY UNPAID BILLS
    const householdTotal = householdBills?.reduce((sum, bill) => {
      // Only sum unpaid bills
      if (!bill.is_paid) {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0) || 0;

    const individualTotal = individualBills?.reduce((sum, bill) => {
      // Only sum unpaid bills
      if (!bill.is_paid) {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0) || 0;

    const lastHouseholdTotal = lastHouseholdBills?.reduce((sum, bill) => {
      if (!bill.is_paid) {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0) || 0;

    const lastIndividualTotal = lastIndividualBills?.reduce((sum, bill) => {
      if (!bill.is_paid) {
        return sum + Number(bill.amount);
      }
      return sum;
    }, 0) || 0;

    console.log("💰 Household total (unpaid):", householdTotal);
    console.log("💳 Individual total (unpaid):", individualTotal);

    // Calculate changes
    const householdChange = calculatePercentageChange(householdTotal, lastHouseholdTotal);
    const individualChange = calculatePercentageChange(individualTotal, lastIndividualTotal);

    // Count paid/unpaid bills with urgency - HOUSEHOLD
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const householdPaidCount = householdBills?.filter(bill => bill.is_paid).length || 0;
    const householdUnpaidBills = householdBills?.filter(bill => !bill.is_paid) || [];
    const householdUrgentCount = householdUnpaidBills.filter(bill => {
      const dueDate = new Date(bill.due_date);
      return dueDate <= threeDaysFromNow;
    }).length;
    const householdNormalUnpaidCount = householdUnpaidBills.length - householdUrgentCount;

    // Count paid/unpaid bills - INDIVIDUAL
    const individualPaidCount = individualBills?.filter(bill => bill.is_paid).length || 0;
    const individualUnpaidBills = individualBills?.filter(bill => !bill.is_paid) || [];
    const individualUrgentCount = individualUnpaidBills.filter(bill => {
      const dueDate = new Date(bill.due_date);
      return dueDate <= threeDaysFromNow;
    }).length;
    const individualNormalUnpaidCount = individualUnpaidBills.length - individualUrgentCount;

    console.log("🏠 Household - Paid:", householdPaidCount, "Pending:", householdNormalUnpaidCount, "Urgent:", householdUrgentCount);
    console.log("👤 Individual - Paid:", individualPaidCount, "Pending:", individualNormalUnpaidCount, "Urgent:", individualUrgentCount);

    const responseData = {
      data: {
        remainingAmount: householdTotal,
        remainingChange: householdChange,
        expensesAmount: individualTotal,
        expensesChange: individualChange,
        household: {
          paidCount: householdPaidCount,
          normalUnpaidCount: householdNormalUnpaidCount,
          urgentCount: householdUrgentCount,
        },
        individual: {
          paidCount: individualPaidCount,
          normalUnpaidCount: individualNormalUnpaidCount,
          urgentCount: individualUrgentCount,
        },
        days: [],
        categories: [],
      },
    };

    console.log("📤 Returning data:", JSON.stringify(responseData, null, 2));
    console.log("============ END BILLS SUMMARY API ============\n\n");

    return c.json(responseData);
  }
);

export default app;
