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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/carts", cartsRoutes);

app.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});
