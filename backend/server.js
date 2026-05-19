import "dotenv/config";
import express from "express";
import cors from "cors";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { authenticateUser } from "./middleware/auth.js";
import analyzeRoutes from "./routes/analyze.js";
import feedbackRoutes from "./routes/feedback.js";
import monitorRoutes from "./routes/monitors.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxy (Vercel, Cloud Run, Cloudflare, etc.) to get correct client IP
app.set("trust proxy", 1);

// ── Global Middleware ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://aegis-corporate.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.trim().replace(/\/$/, "");
    const isAllowed = allowedOrigins.some((allowed) => {
      const normalizedAllowed = allowed.trim().replace(/\/$/, "");
      return normalizedAllowed === normalizedOrigin;
    }) || normalizedOrigin.endsWith(".vercel.app"); // Whitelist all Vercel domains/previews

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🛡️ CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Handle Vercel / browser / proxy preflight status quirks
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Explicitly handle preflight OPTIONS for all routes

app.use(express.json({ limit: "1mb" }));
app.use(generalLimiter);

// ── Health Check (no auth) ─────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "aegis-backend",
    timestamp: new Date().toISOString(),
  });
});

// ── Auth Middleware ─────────────────────────────────────────────────
app.use(authenticateUser);

// ── API Routes ─────────────────────────────────────────────────────
app.use("/v1/analyze", analyzeRoutes);
app.use("/v1/analysis", analyzeRoutes); // GET /v1/analysis/:id
app.use("/v1/analyses", analyzeRoutes); // GET /v1/analyses (list)
app.use("/v1/feedback", feedbackRoutes);
app.use("/v1/monitors", monitorRoutes);

// ── Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);

  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ error: "File too large. Maximum size is 50MB." });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ error: "File too large. Maximum size is 50MB." });
  }

  res.status(500).json({ error: "Internal server error." });
});

// ── Start Server ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  AEGIS Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;
