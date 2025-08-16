import { discounts } from "@shared/schema";
import { eq, lt, and } from "drizzle-orm";
import { db } from "server/db";

export async function disableExpiredCoupons() {
  const now = new Date();

  await db
    .update(discounts)
    .set({ status: "disabled" })
    .where(and(lt(discounts.endDate, now), eq(discounts.status, "active")));

  console.log("✅ Expired coupons disabled.");
}
