import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

// Use empty string for same-origin requests (relative URLs)
export const client = hc<AppType>("");
