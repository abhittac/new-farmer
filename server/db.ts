import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();
// Configure neon for WebSocket support
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Create database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
});

// Create drizzle instance with schema
export const db = drizzle({ client: pool, schema });

// Test database connection with retry logic
export async function testDatabaseConnection(retries = 2): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await db.execute(sql`SELECT 1`);
      console.log("Database connection successful");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(
        `Database connection attempt ${attempt} failed:`,
        errorMessage
      );
      if (attempt === retries) {
        console.error(
          "Failed to connect to database after",
          retries,
          "attempts"
        );
        return false;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}
