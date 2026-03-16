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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/carts", cartsRoutes);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
