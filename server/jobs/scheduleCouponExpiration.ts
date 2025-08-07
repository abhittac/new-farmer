import cron from "node-cron";
import { disableExpiredCoupons } from "./disableExpiredCoupons";

export function scheduleCouponExpiration() {
  cron.schedule("0 0 * * *", () => {
    console.log(" Running cron job to disable expired coupons...");
    disableExpiredCoupons();
  });
}
