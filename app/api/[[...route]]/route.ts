import { Hono } from "hono";
import { handle } from "hono/vercel";

import billsSummary from "./bills-summary";
import transactions from "./transactions";
import bills from "./bills";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/summary", billsSummary)
  .route("/transactions", transactions)
  .route("/bills", bills);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
