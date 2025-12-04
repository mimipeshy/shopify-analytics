import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- SECURITY & PARSING MIDDLEWARE ---------------- */

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieParser(process.env.COOKIE_SECRET || "dev_cookie_secret_fallback")
);

/* ---------------- CORS (LOCKED FOR PROD) ---------------- */


const allowedOrigins = [

  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://admin.shopify.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / server-to-server
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ---------------- HEALTH CHECK ---------------- */

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "OK",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- SHOPIFY AUTH ROUTES ---------------- */

app.use("/auth", authRouter);

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* ---------------- SERVER START ---------------- */

app.listen(PORT, () => {
  console.log(`✅ Backend running on ${process.env.SHOPIFY_APP_URL || `http://localhost:${PORT}`}`);
  console.log("🔹 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🔹 SUPABASE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);
});
export default app;


