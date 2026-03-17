import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import sellerRoutes from "./routes/seller.js";
import cartsRoutes from "./routes/carts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.CLIENT_URL, // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      // allow production + any Vercel preview URLs
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) // matches any subdomain ending with .vercel.app
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // required for cookies
  }),
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/carts", cartsRoutes);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ db: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.listen(PORT, () => console.log("Server running on port", PORT));
