import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./initDb";
import cron from "node-cron";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { disableExpiredCoupons } from "./jobs/disableExpiredCoupons";
import { scheduleCouponExpiration } from "./jobs/scheduleCouponExpiration";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});
// Configure CORS for Replit environment
const allowedOrigins = [
  "http://localhost:5000",
  "http://0.0.0.0:5000",
  "https://new-farmer-e5cl.onrender.com",
  "https://www.freshlyrooted.in",
  "http://193.203.161.214",
  "https://freshlyrooted.in"
];

// Add Replit domain patterns
const isReplitDomain = (origin: string) => {
  return (
    origin &&
    (origin.includes(".replit.dev") ||
      origin.includes(".repl.co") ||
      origin.includes(".replit.app") ||
      origin.includes("replit.com"))
  );
};

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      // Allow requests with no origin (same-origin requests, mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow all Replit domains
      if (
        origin.includes(".replit.dev") ||
        origin.includes(".repl.co") ||
        origin.includes(".replit.app") ||
        origin.includes("replit.com")
      ) {
        callback(null, true);
        return;
      }

      // Allow localhost for development
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://0.0.0.0:")) {
        callback(null, true);
        return;
      }

      // Allow render.com deployment
      if (origin.includes("onrender.com")) {
        callback(null, true);
        return;
      }

      // For development mode, be more permissive
      if (process.env.NODE_ENV === "development") {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(morgan("dev"));
(async () => {
  // Test database connection first
  const { testDatabaseConnection } = await import("./db.ts");
  const dbConnected = await testDatabaseConnection();

  if (dbConnected) {
    // Initialize database with seed data
    try {
      // await initializeDatabase();
      log("Database initialized successfully with seed data");
    } catch (error) {
      log("Error initializing database: " + error);
      // Continue without database initialization if it fails
    }
  } else {
    log(
      "Warning: Database connection failed, continuing without database initialization"
    );
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Run every day at 12:00 AM
  scheduleCouponExpiration();
  // Configure port for Replit environment
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0"; // Important for Replit

  server.listen(port, host, () => {
    log(`Server running on http://${host}:${port}`);
  });
})();
