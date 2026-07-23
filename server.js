require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const Redis = require("ioredis");
const cors = require("cors");
const os = require("os");
const { error } = require("console");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL and Redis
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

// Identify this server instance by hostname
const INSTANCE_ID = os.hostname();
const CACHE_TTL = 60;

console.log(`Starting instance: ${INSTANCE_ID}`);

app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required." });

  const { nanoid } = await import("nanoid");
  const code = nanoid(7);

  await pool.query("INSERT INTO urls (code, original_url) VALUES ($1, $2)", [
    code,
    url,
  ]);

  res.json({ code, shortUrl: `http://localhost:3000/${code}` });
});

app.get("/stats", async (req, res) => {
  const hits = (await redis.get("stats:hits")) || "0";
  const misses = (await redis.get("stats:misses")) || "0";

  res.json({
    hits: parseInt(hits),
    misses: parseInt(misses),
    instance: INSTANCE_ID,
  });
});

app.get("/:code", async (req, res) => {
  const { code } = req.params;

  // Check Redis cache first
  const cached = await redis.get(`shorturl:${code}`);

  if (cached) {
    await redis.incr("stats:hits");
    console.log(`[${INSTANCE_ID}] Cache HIT for ${code}`);
    res.set("X-Cache", "HIT");
    res.set("X-Instance", INSTANCE_ID);
    return res.redirect(302, cached);
  }

  // Cache miss - query PostgreSQL
  const result = await pool.query(
    "SELECT original_url FROM urls WHERE code = $1",
    [code],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  const originalUrl = result.rows[0].original_url;
  await redis.setex(`shorturl:${code}`, CACHE_TTL, originalUrl);
  await redis.incr("stats:misses");

  // Log that we hit the database
  console.log(`[${INSTANCE_ID}] DB lookup for ${code}`);
  res.set("X-Cache", "MISS");
  res.set("X-Instance", INSTANCE_ID);
  res.redirect(302, originalUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (instance: ${INSTANCE_ID})`);
});
