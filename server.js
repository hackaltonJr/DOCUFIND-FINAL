require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const apiRouter = require("./routes/api");
const requestLogger = require("./middleware/requestLogger");

(async function init() {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to DB on startup", err);
    process.exit(1);
  }
})();

// validate required env vars early
const required = ["MONGODB_URI", "JWT_SECRET", "FRONTEND_BASE"];
required.forEach((k) => {
  if (!process.env[k]) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
});

const app = express();
app.use(cookieParser());

if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser()); // <--- added

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

let originOption;
{
  const origins = [];
  if (process.env.TRUSTED_ORIGINS) {
    origins.push(
      ...process.env.TRUSTED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    );
  }
  if (process.env.FRONTEND_BASE) {
    origins.push(process.env.FRONTEND_BASE);
  }
  // fallback because i am using nextjs
  origins.push("http://localhost:9002");
  const unique = Array.from(new Set(origins));
  originOption = unique.length === 1 ? unique[0] : unique;
}

// Allow CORS and allow credentials (cookies) from the calculated origins
app.use(
  cors({
    origin: true, // explicit origin(s) instead of `true`
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(requestLogger);

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
